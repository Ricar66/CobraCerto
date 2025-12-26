import { UserRole } from '@prisma/client';

export const PERMISSIONS = {
  // User management
  MANAGE_USERS: [UserRole.ADMIN],
  VIEW_USERS: [UserRole.ADMIN],

  // Client management
  CREATE_CLIENT: [UserRole.ADMIN, UserRole.MANAGER],
  VIEW_CLIENT: [UserRole.ADMIN, UserRole.MANAGER],
  UPDATE_CLIENT: [UserRole.ADMIN, UserRole.MANAGER],
  DELETE_CLIENT: [UserRole.ADMIN],

  // Invoice management
  CREATE_INVOICE: [UserRole.ADMIN, UserRole.MANAGER],
  VIEW_INVOICE: [UserRole.ADMIN, UserRole.MANAGER],
  UPDATE_INVOICE: [UserRole.ADMIN, UserRole.MANAGER],
  DELETE_INVOICE: [UserRole.ADMIN],

  // Settings
  MANAGE_SETTINGS: [UserRole.ADMIN],
  MANAGE_PLAN: [UserRole.ADMIN],

  // Exports
  EXPORT_DATA: [UserRole.ADMIN, UserRole.MANAGER],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return PERMISSIONS[permission].includes(userRole);
}

export function requirePermission(userRole: UserRole, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(`Insufficient permissions: ${permission} required`);
  }
}
