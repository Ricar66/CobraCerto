import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireTenantId, getCurrentUser } from '@/lib/tenant';
import { requirePermission } from '@/lib/rbac';
import { UserRole } from '@prisma/client';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user.role as UserRole, 'EXPORT_DATA');
    const tenantId = await requireTenantId();

    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      include: {
        client: {
          select: {
            name: true,
            email: true,
            document: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    const csvHeader = 'ID,Cliente,Email,Documento,Valor,Vencimento,Status,Descrição,Pago em\n';
    const csvRows = invoices.map((inv) => {
      return [
        inv.id,
        inv.client.name,
        inv.client.email,
        inv.client.document || '',
        inv.amount.toString(),
        format(new Date(inv.dueDate), 'dd/MM/yyyy'),
        inv.status,
        `"${inv.description.replace(/"/g, '""')}"`,
        inv.paidAt ? format(new Date(inv.paidAt), 'dd/MM/yyyy HH:mm') : '',
      ].join(',');
    });

    const csv = csvHeader + csvRows.join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="faturas-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting invoices:', error);
    return NextResponse.json({ error: 'Failed to export invoices' }, { status: 500 });
  }
}
