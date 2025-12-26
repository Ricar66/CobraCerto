import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { prisma } from './db';

export async function getCurrentTenantId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.tenantId || null;
}

export async function requireTenantId(): Promise<string> {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) {
    throw new Error('Unauthorized: No tenant context');
  }
  return tenantId;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

export async function validateTenantAccess(resourceTenantId: string): Promise<void> {
  const currentTenantId = await requireTenantId();
  if (resourceTenantId !== currentTenantId) {
    throw new Error('Forbidden: Access denied to this resource');
  }
}
