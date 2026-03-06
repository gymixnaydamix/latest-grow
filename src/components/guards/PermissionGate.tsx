/* ══════════════════════════════════════════════════════════════════════
 * PermissionGate — conditionally renders children based on user role
 * Usage:
 *   <PermissionGate requires="finance.write">
 *     <Button onClick={createInvoice}>New Invoice</Button>
 *   </PermissionGate>
 *
 *   <PermissionGate requires={['finance.write', 'finance.payments']} mode="any">
 *     ...
 *   </PermissionGate>
 * ══════════════════════════════════════════════════════════════════════ */
import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/constants/permissions';
import type { Permission } from '@/constants/permissions';

interface PermissionGateProps {
  /** Single permission or array of permissions */
  requires: Permission | Permission[];
  /** 'all' = user must have all listed permissions; 'any' = at least one */
  mode?: 'all' | 'any';
  /** Fallback when permission check fails */
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  requires,
  mode = 'all',
  fallback = null,
  children,
}: PermissionGateProps) {
  const role = useAuthStore((s) => s.user?.role);
  
  const permissions = Array.isArray(requires) ? requires : [requires];
  
  const allowed = mode === 'any'
    ? hasAnyPermission(role, permissions)
    : hasAllPermissions(role, permissions);

  return allowed ? <>{children}</> : <>{fallback}</>;
}

/** Hook variant for conditional logic outside JSX */
export function usePermission(permission: Permission): boolean {
  const role = useAuthStore((s) => s.user?.role);
  return hasPermission(role, permission);
}
