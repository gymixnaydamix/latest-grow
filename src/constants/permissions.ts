/* ══════════════════════════════════════════════════════════════════════
 * Permissions — role-based permission definitions for admin operations
 * ══════════════════════════════════════════════════════════════════════ */

export const PERMISSIONS = {
  // Students
  'students.read': 'View student records',
  'students.write': 'Create/edit student records',
  'students.delete': 'Delete student records',
  'students.transfer': 'Process student transfers',
  'students.discipline': 'Manage disciplinary actions',

  // Staff
  'staff.read': 'View staff records',
  'staff.write': 'Create/edit staff records',
  'staff.delete': 'Delete staff records',
  'staff.leave': 'Manage leave requests',
  'staff.payroll': 'View/manage payroll',

  // Academics
  'academics.read': 'View academic data',
  'academics.write': 'Manage classes, subjects, timetable',
  'academics.promotion': 'Promote students',

  // Exams
  'exams.read': 'View exam schedules & results',
  'exams.write': 'Create/edit exams',
  'exams.grades': 'Enter/modify grades',
  'exams.results': 'Publish results',

  // Finance
  'finance.read': 'View financial data',
  'finance.write': 'Create/manage invoices',
  'finance.payments': 'Record payments',
  'finance.fees': 'Manage fee structures',
  'finance.discounts': 'Manage discounts',
  'finance.refunds': 'Process refunds',

  // Admissions
  'admissions.read': 'View admissions pipeline',
  'admissions.write': 'Process applications',
  'admissions.approve': 'Approve/reject admissions',

  // Attendance
  'attendance.read': 'View attendance records',
  'attendance.write': 'Mark/edit attendance',
  'attendance.corrections': 'Approve attendance corrections',

  // Transport
  'transport.read': 'View transport data',
  'transport.write': 'Manage routes and vehicles',
  'transport.incidents': 'Report/manage incidents',

  // Facilities
  'facilities.read': 'View facility data',
  'facilities.write': 'Manage rooms and bookings',
  'facilities.maintenance': 'Manage maintenance requests',
  'facilities.assets': 'Manage assets',

  // Communication
  'comm.read': 'View messages and announcements',
  'comm.write': 'Send messages and announcements',
  'comm.broadcast': 'Send broadcast messages',
  'comm.templates': 'Manage templates',

  // Reports
  'reports.read': 'View reports',
  'reports.export': 'Export reports',

  // Settings
  'settings.read': 'View settings',
  'settings.write': 'Modify settings',
  'settings.roles': 'Manage roles & permissions',
  'settings.branding': 'Manage school branding',

  // Audit
  'audit.read': 'View audit logs',
  'audit.compliance': 'Manage compliance tasks',

  // Approvals (cross-cutting)
  'approvals.view': 'View pending approvals',
  'approvals.action': 'Approve or reject items',
} as const;

export type Permission = keyof typeof PERMISSIONS;

/* ─── Role → Permissions Map ─── */

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  PROVIDER: Object.keys(PERMISSIONS) as Permission[], // Super admin — everything

  ADMIN: Object.keys(PERMISSIONS) as Permission[], // School admin — everything

  TEACHER: [
    'students.read',
    'academics.read',
    'exams.read', 'exams.grades',
    'attendance.read', 'attendance.write',
    'comm.read', 'comm.write',
    'reports.read',
  ],

  FINANCE: [
    'finance.read', 'finance.write', 'finance.payments', 'finance.fees', 'finance.discounts', 'finance.refunds',
    'students.read',
    'reports.read', 'reports.export',
    'comm.read',
  ],

  SCHOOL: [
    'students.read', 'students.write',
    'staff.read', 'staff.leave',
    'academics.read',
    'attendance.read', 'attendance.write', 'attendance.corrections',
    'exams.read',
    'transport.read',
    'facilities.read', 'facilities.write',
    'comm.read', 'comm.write',
    'reports.read',
    'approvals.view',
  ],

  MARKETING: [
    'admissions.read',
    'reports.read',
    'comm.read', 'comm.write', 'comm.broadcast',
  ],

  STUDENT: [],
  PARENT: [],
};

/* ─── Helper: check permission ─── */

export function hasPermission(role: string | undefined, permission: Permission): boolean {
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes(permission);
}

export function hasAnyPermission(role: string | undefined, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: string | undefined, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}
