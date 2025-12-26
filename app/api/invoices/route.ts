import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireTenantId, getCurrentUser } from '@/lib/tenant';
import { requirePermission } from '@/lib/rbac';
import { UserRole, Recurrence } from '@prisma/client';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';

const createInvoiceSchema = z.object({
  clientId: z.string(),
  amount: z.number().positive(),
  dueDate: z.string(),
  description: z.string().min(1),
  notes: z.string().optional(),
  recurrence: z.enum(['NONE', 'WEEKLY', 'MONTHLY', 'YEARLY']).default('NONE'),
});

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const invoices = await prisma.invoice.findMany({
      where: {
        tenantId,
        ...(status && { status: status as any }),
        ...(clientId && { clientId }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user.role as UserRole, 'CREATE_INVOICE');
    const tenantId = await requireTenantId();

    const body = await request.json();
    const data = createInvoiceSchema.parse(body);

    // Validate client belongs to tenant
    const client = await prisma.client.findUnique({
      where: { id: data.clientId },
    });

    if (!client || client.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const dueDate = new Date(data.dueDate);
    let nextRunAt: Date | null = null;

    if (data.recurrence !== 'NONE') {
      switch (data.recurrence) {
        case 'WEEKLY':
          nextRunAt = addWeeks(dueDate, 1);
          break;
        case 'MONTHLY':
          nextRunAt = addMonths(dueDate, 1);
          break;
        case 'YEARLY':
          nextRunAt = addYears(dueDate, 1);
          break;
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        clientId: data.clientId,
        tenantId,
        amount: data.amount,
        dueDate,
        description: data.description,
        notes: data.notes,
        recurrence: data.recurrence as Recurrence,
        nextRunAt,
      },
      include: {
        client: true,
      },
    });

    await prisma.invoiceEvent.create({
      data: {
        invoiceId: invoice.id,
        type: 'CREATED',
        description: `Fatura criada por ${user.name}`,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
