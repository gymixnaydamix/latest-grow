import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError, BadRequestError } from '../../utils/errors.js';

type ProviderRoleKey = 'OWNER' | 'OPS_ADMIN' | 'BILLING_AGENT' | 'SUPPORT_AGENT' | 'SECURITY_ADMIN';

const PROVIDER_ROLE_BY_EMAIL: Record<string, ProviderRoleKey> = {
  'provider@growyourneed.dev': 'OWNER',
  'ops@provider.local': 'OPS_ADMIN',
  'billing@provider.local': 'BILLING_AGENT',
  'support@provider.local': 'SUPPORT_AGENT',
  'security@provider.local': 'SECURITY_ADMIN',
};

const PERMISSIONS_BY_ROLE: Record<ProviderRoleKey, string[]> = {
  OWNER: ['*'],
  OPS_ADMIN: [
    'provider.home.read',
    'provider.tenants.read',
    'provider.tenants.write',
    'provider.onboarding.read',
    'provider.onboarding.write',
    'provider.support.read',
    'provider.support.write',
    'provider.incidents.read',
    'provider.incidents.write',
    'provider.releases.read',
    'provider.releases.write',
    'provider.audit.read',
    'provider.search.read',
  ],
  BILLING_AGENT: [
    'provider.home.read',
    'provider.tenants.read',
    'provider.billing.read',
    'provider.billing.write',
    'provider.usage.read',
    'provider.audit.read',
    'provider.search.read',
  ],
  SUPPORT_AGENT: [
    'provider.home.read',
    'provider.tenants.read',
    'provider.support.read',
    'provider.support.write',
    'provider.incidents.read',
    'provider.search.read',
  ],
  SECURITY_ADMIN: [
    'provider.home.read',
    'provider.tenants.read',
    'provider.security.read',
    'provider.security.write',
    'provider.compliance.read',
    'provider.compliance.write',
    'provider.data_ops.read',
    'provider.data_ops.write',
    'provider.audit.read',
    'provider.search.read',
    'provider.incidents.read',
    'provider.incidents.write',
  ],
};

function resolveProviderRole(req: Request): ProviderRoleKey {
  const email = req.user?.email?.toLowerCase() ?? '';
  const role = PROVIDER_ROLE_BY_EMAIL[email];
  return role ?? 'OWNER';
}

function hasPermission(providerRole: ProviderRoleKey, permission: string): boolean {
  const permissions = PERMISSIONS_BY_ROLE[providerRole] ?? [];
  if (permissions.includes('*')) return true;
  if (permissions.includes(permission)) return true;

  const resource = permission.split('.').slice(0, -1).join('.');
  if (resource && permissions.includes(`${resource}.*`)) return true;

  return false;
}

export function requireProviderPermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new ForbiddenError('No user context'));
    if (req.user.role !== 'PROVIDER') {
      return next(new ForbiddenError(`Role '${req.user.role}' cannot access provider console resources`));
    }

    const providerRole = resolveProviderRole(req);
    if (!hasPermission(providerRole, permission)) {
      return next(new ForbiddenError(`Missing provider permission: ${permission}`));
    }

    return next();
  };
}

export function requireActionReason(req: Request, _res: Response, next: NextFunction): void {
  const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';
  if (!reason) {
    return next(new BadRequestError('A non-empty reason field is required for sensitive provider actions'));
  }
  return next();
}

