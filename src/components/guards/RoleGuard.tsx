/* RoleGuard — Restricts access to routes based on the user's role */
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

export type AppRole =
  | 'PROVIDER'
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'FINANCE'
  | 'MARKETING'
  | 'SCHOOL';

interface RoleGuardProps {
  roles: AppRole[];
  children: ReactNode;
}

const roleDashboardMap: Record<AppRole, string> = {
  PROVIDER: '/provider',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
  FINANCE: '/finance',
  MARKETING: '/marketing',
  SCHOOL: '/school-leader',
};

export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" replace />;

  const userRole = user.role as AppRole;

  if (!roles.includes(userRole)) {
    const fallback = roleDashboardMap[userRole] ?? '/login';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
