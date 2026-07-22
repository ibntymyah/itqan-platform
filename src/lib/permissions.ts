/**
 * تطبيق مصفوفة الصلاحيات — القسم 5 من itqan-phase1-architecture.md.
 *
 * هذا تطبيق أولي بسيط (role → permission set) لتشغيل Phase 1.
 * لا يُستبدل بفحص الواجهة الأمامية وحده — يجب استدعاء `can()` داخل
 * كل server action أو API route قبل تنفيذ أي عملية حساسة (القسم 22 و23).
 */

export const SYSTEM_ROLES = [
  'system_owner',
  'org_admin',
  'supervisor',
  'teacher',
  'student',
  'parent'
  // 'finance_officer' سيُضاف عند بناء وحدة المالية في Phase 4
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export type PermissionAction =
  | 'org_settings.manage'
  | 'users.manage'
  | 'academic_structure.manage'
  | 'academic_structure.view'
  | 'circles.manage'
  | 'circles.view_own'
  | 'students.manage'
  | 'students.view'
  | 'students.view_own'
  | 'employees.manage'
  | 'employees.view'
  | 'student_circle_transfer.manage'
  | 'attendance.enter_own_circle'
  | 'attendance.view'
  | 'attendance.view_own'
  | 'progress.enter_own_circle'
  | 'progress.view'
  | 'progress.view_own'
  | 'dashboard.full'
  | 'dashboard.branch_scope'
  | 'reports.manage'
  | 'reports.view_own_circle'
  | 'reports.view_own'
  | 'audit_log.view_all'
  | 'audit_log.view_org';

const ROLE_PERMISSIONS: Record<SystemRole, PermissionAction[]> = {
  system_owner: [
    'org_settings.manage',
    'users.manage',
    'academic_structure.manage',
    'circles.manage',
    'students.manage',
    'employees.manage',
    'student_circle_transfer.manage',
    'attendance.enter_own_circle',
    'attendance.view',
    'progress.enter_own_circle',
    'progress.view',
    'dashboard.full',
    'reports.manage',
    'audit_log.view_all'
  ],
  org_admin: [
    'org_settings.manage',
    'users.manage',
    'academic_structure.manage',
    'circles.manage',
    'students.manage',
    'employees.manage',
    'student_circle_transfer.manage',
    'attendance.view',
    'progress.view',
    'dashboard.full',
    'reports.manage',
    'audit_log.view_org'
  ],
  supervisor: [
    'academic_structure.view',
    'circles.manage',
    'students.view',
    'employees.view',
    'student_circle_transfer.manage',
    'attendance.view',
    'progress.view',
    'dashboard.branch_scope',
    'reports.manage'
  ],
  teacher: [
    'academic_structure.view',
    'circles.view_own',
    'students.view',
    'attendance.enter_own_circle',
    'progress.enter_own_circle',
    'reports.view_own_circle'
  ],
  student: ['students.view_own', 'attendance.view_own', 'progress.view_own', 'reports.view_own'],
  parent: ['students.view_own', 'attendance.view_own', 'progress.view_own', 'reports.view_own']
};

export function can(roles: string[], action: PermissionAction): boolean {
  return roles.some((role) =>
    ROLE_PERMISSIONS[role as SystemRole]?.includes(action)
  );
}

/** يرمي خطأً إن لم تتوفر الصلاحية — للاستخدام المباشر داخل server actions */
export function assertCan(roles: string[], action: PermissionAction): void {
  if (!can(roles, action)) {
    throw new Error(`ليست لديك صلاحية: ${action}`);
  }
}
