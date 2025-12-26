import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireTenantId, getCurrentUser, validateTenantAccess } from '@/lib/tenant';
import { requirePermission } from '@/lib/rbac';
import { UserRole } from '@prisma/client';

const updateInvoiceSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'CANCELLED']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireTenantId();

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await validateTenantAccess(invoice.tenantId);

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    requirePermission(user.role as UserRole, 'UPDATE_INVOICE');

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    await validateTenantAccess(invoice.tenantId);

    const body = await request.json();
    const data = updateInvoiceSchema.parse(body);

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
        ...(data.status === 'PAID' && { paidAt: new Date() }),
      },
    });

    await prisma.invoiceEvent.create({
      data: {
        invoiceId: params.id,
        type: 'UPDATED',
        description: `Fatura atualizada por ${user.name}`,
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
