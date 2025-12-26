import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { requireTenantId, getCurrentUser } from '@/lib/tenant';
import { requirePermission } from '@/lib/rbac';
import { UserRole } from '@prisma/client';

const createClientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireTenantId();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');

    const clients = await prisma.client.findMany({
      where: {
        tenantId,
        active: true,
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { document: { contains: search } },
          ],
        }),
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    requirePermission(user.role as UserRole, 'CREATE_CLIENT');
    const tenantId = await requireTenantId();

    const body = await request.json();
    const data = createClientSchema.parse(body);

    const client = await prisma.client.create({
      data: {
        ...data,
        tenantId,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
