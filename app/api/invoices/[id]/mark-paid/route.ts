import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, validateTenantAccess } from '@/lib/tenant';
import { requirePermission } from '@/lib/rbac';
import { UserRole } from '@prisma/client';

export async function POST(
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

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    await prisma.invoiceEvent.create({
      data: {
        invoiceId: params.id,
        type: 'PAID',
        description: `Fatura marcada como paga por ${user.name}`,
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return NextResponse.json({ error: 'Failed to mark invoice as paid' }, { status: 500 });
  }
}
