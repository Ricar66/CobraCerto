import { UserRole, TenantPlan } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string;
    tenantName: string;
    tenantPlan: TenantPlan;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
      tenantName: string;
      tenantPlan: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    tenantId: string;
    tenantName: string;
    tenantPlan: string;
  }
}
