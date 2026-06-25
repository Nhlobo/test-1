import { Role } from '@prisma/client';

export const permissions = {
  manage_system: [Role.SUPER_ADMIN],
  manage_admins: [Role.SUPER_ADMIN],
  manage_users: [Role.SUPER_ADMIN, Role.ADMIN],
  invite_users: [Role.SUPER_ADMIN, Role.ADMIN],
  suspend_users: [Role.SUPER_ADMIN, Role.ADMIN],
  disable_users: [Role.SUPER_ADMIN, Role.ADMIN],
  manage_external_access: [Role.SUPER_ADMIN, Role.ADMIN],
  view_admin_dashboard: [Role.SUPER_ADMIN, Role.ADMIN],
  view_director_dashboard: [Role.SUPER_ADMIN, Role.ADMIN, Role.DIRECTOR],
  view_manager_dashboard: [Role.SUPER_ADMIN, Role.ADMIN, Role.DIRECTOR, Role.MANAGER],
  view_staff_dashboard: [Role.SUPER_ADMIN, Role.ADMIN, Role.DIRECTOR, Role.MANAGER, Role.STAFF],
  view_external_dashboard: [Role.REFERRING_ATTORNEY, Role.MEDICAL_EXPERT]
} as const;

export type PermissionKey = keyof typeof permissions;

export function roleHasPermission(role: Role, permission: PermissionKey) {
  return permissions[permission].includes(role);
}
