import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail, replaceVariables } from '@/lib/email';
import { differenceInDays, format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (token !== process.env.JOB_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get all active tenants
    const tenants = await prisma.tenant.findMany({
      where: { active: true },
      include: {
        reminderRules: {
          where: { active: true },
        },
      },
    });

    for (const tenant of tenants) {
      // Get pending and overdue invoices
      const invoices = await prisma.invoice.findMany({
        where: {
          tenantId: tenant.id,
          status: { in: ['PENDING', 'OVERDUE'] },
        },
        include: {
          client: true,
        },
      });

      for (const invoice of invoices) {
        const daysDiff = differenceInDays(new Date(invoice.dueDate), now);

        for (const rule of tenant.reminderRules) {
          let shouldSend = false;

          if (rule.daysBefore !== null && daysDiff === rule.daysBefore) {
            shouldSend = true;
          } else if (rule.daysAfter !== null && daysDiff === -rule.daysAfter) {
            shouldSend = true;
          }

          if (shouldSend) {
            results.processed++;

            try {
              const variables = {
                clientName: invoice.client.name,
                amount: `R$ ${invoice.amount.toFixed(2)}`,
                dueDate: format(new Date(invoice.dueDate), 'dd/MM/yyyy'),
                description: invoice.description,
                tenantName: tenant.name,
              };

              const subject = replaceVariables(rule.emailSubject, variables);
              const body = replaceVariables(rule.emailBody, variables);

              await prisma.emailOutbox.create({
                data: {
                  to: invoice.client.email,
                  subject,
                  body,
                  status: 'QUEUED',
                },
              });

              await prisma.invoiceEvent.create({
                data: {
                  invoiceId: invoice.id,
                  type: 'REMINDER_SENT',
                  description: `Lembrete agendado: ${rule.name}`,
                },
              });
            } catch (error) {
              results.failed++;
              results.errors.push(`Invoice ${invoice.id}: ${error}`);
            }
          }
        }
      }
    }

    // Process email queue
    const emailsToSend = await prisma.emailOutbox.findMany({
      where: {
        status: 'QUEUED',
        attempts: { lt: 3 },
      },
      take: 50,
    });

    for (const email of emailsToSend) {
      try {
        await sendEmail({
          to: email.to,
          subject: email.subject,
          body: email.body,
        });

        await prisma.emailOutbox.update({
          where: { id: email.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });

        results.sent++;
      } catch (error) {
        await prisma.emailOutbox.update({
          where: { id: email.id },
          data: {
            status: 'FAILED',
            attempts: { increment: 1 },
            lastError: String(error),
          },
        });

        results.failed++;
        results.errors.push(`Email ${email.id}: ${error}`);
      }
    }

    // Update overdue invoices
    await prisma.invoice.updateMany({
      where: {
        status: 'PENDING',
        dueDate: { lt: now },
      },
      data: {
        status: 'OVERDUE',
      },
    });

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Error running reminders job:', error);
    return NextResponse.json(
      { error: 'Failed to run reminders job', details: String(error) },
      { status: 500 }
    );
  }
}
