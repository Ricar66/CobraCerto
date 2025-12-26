import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireTenantId, getCurrentUser, validateTenantAccess } from '@/lib/tenant';
import { requirePermission } from '@/lib/rbac';
import { UserRole } from '@prisma/client';

const updateClientSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenantId = await requireTenantId();

    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        invoices: {
          orderBy: { dueDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await validateTenantAccess(client.tenantId);

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    requirePermission(user.role as UserRole, 'UPDATE_CLIENT');

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await validateTenantAccess(client.tenantId);

    const body = await request.json();
    const data = updateClientSchema.parse(body);

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    requirePermission(user.role as UserRole, 'DELETE_CLIENT');

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    await validateTenantAccess(client.tenantId);

    await prisma.client.update({
      where: { id: params.id },
      data: { active: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
