import { UserRole } from '@root/types';
import type { OverlayAppId } from './overlay-registry';

const operatorRoles: UserRole[] = [UserRole.PROVIDER, UserRole.ADMIN, UserRole.SCHOOL];

export function canAccessOverlayApp(appId: OverlayAppId, role: UserRole | undefined | null): boolean {
  if (!role) return false;
  if (appId === 'gamification') {
    return operatorRoles.includes(role);
  }
  return true;
}
