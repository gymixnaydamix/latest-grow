/* Provider Concierge › Tenants — All Tenants, Health Watch, Onboarding, Plans & Billing, Roles & Modules, Tenant Actions */
import { useNavigationStore } from '@/store/navigation.store';
import { useState } from 'react';
import { ConciergeSplitPreviewPanel, ConciergePermissionBadge, ConciergeAuditNotice } from '@/components/concierge/shared';
import {
  Building2, Activity, CreditCard, Settings, Users,
  Clock, AlertTriangle, Pause, Play,
  Eye, FileText, Megaphone, Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProviderTenants,
  useUpdateProviderTenantStatus,
  useSendProviderMessage,
} from '@/hooks/api/use-provider-console';
import { notifySuccess } from '@/lib/notify';

interface Tenant {
  id: string;
  name: string;
  status: 'Active' | 'Suspended' | 'Onboarding' | 'Trial' | 'Churned';
  plan: string;
  billingState: 'Current' | 'Overdue' | 'Failed' | 'Grace Period';
  healthState: 'Healthy' | 'Warning' | 'Critical' | 'Degraded';
  activeModules: string[];
  lastActivity: string;
  urgentFlags: number;
  users: number;
  monthlyRevenue: string;
  onboardingStep?: string;
}

/* ── Map API ProviderTenantRecord → local Tenant shape ── */
const statusMap: Record<string, Tenant['status']> = {
  ACTIVE: 'Active', Active: 'Active',
  SUSPENDED: 'Suspended', Suspended: 'Suspended',
  ONBOARDING: 'Onboarding', Onboarding: 'Onboarding',
  TRIAL: 'Trial', Trial: 'Trial',
  CHURNED: 'Churned', Churned: 'Churned',
};
const healthMap: Record<string, Tenant['healthState']> = {
  HEALTHY: 'Healthy', Healthy: 'Healthy',
  WARNING: 'Warning', Warning: 'Warning',
  CRITICAL: 'Critical', Critical: 'Critical',
  DEGRADED: 'Degraded', Degraded: 'Degraded',
};
const billingMap: Record<string, Tenant['billingState']> = {
  GOOD: 'Current', Current: 'Current',
  DUE: 'Overdue', Overdue: 'Overdue',
  FAILED: 'Failed', Failed: 'Failed',
  GRACE: 'Grace Period', 'Grace Period': 'Grace Period',
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function mapApiTenant(raw: Record<string, unknown>): Tenant {
  const totalUsers =
    ((raw.activeStudents as number) ?? 0) +
    ((raw.activeTeachers as number) ?? 0) +
    ((raw.activeParents as number) ?? 0) +
    ((raw.users as number) ?? 0);
  return {
    id: (raw.id as string) ?? '',
    name: (raw.name as string) ?? 'Unknown',
    status: statusMap[(raw.status as string)] ?? 'Active',
    plan: (raw.planCode as string) ?? (raw.plan as string) ?? 'Unknown',
    billingState: billingMap[(raw.billingStatus as string) ?? (raw.billingState as string)] ?? 'Current',
    healthState: healthMap[(raw.health as string) ?? (raw.healthState as string)] ?? 'Healthy',
    activeModules: (raw.modules as string[]) ?? (raw.activeModules as string[]) ?? [],
    lastActivity: raw.lastLoginAt ? formatRelativeTime(raw.lastLoginAt as string) : ((raw.lastActivity as string) ?? 'Unknown'),
    urgentFlags: (raw.incidentsOpen as number) ?? (raw.urgentFlags as number) ?? 0,
    users: totalUsers || ((raw.users as number) ?? 0),
    monthlyRevenue: (raw.monthlyRevenue as string) ?? '$0',
    onboardingStep: (raw.onboardingStage as string) || (raw.onboardingStep as string) || undefined,
  };
}

const FALLBACK_TENANTS: Tenant[] = [
  {
    id: 'tn1', name: 'Greenfield Academy', status: 'Active', plan: 'Enterprise',
    billingState: 'Current', healthState: 'Healthy', activeModules: ['Enrollment', 'Finance', 'Attendance', 'LMS', 'Transport', 'Comms'],
    lastActivity: '2 min ago', urgentFlags: 0, users: 1240, monthlyRevenue: '$4,200',
  },
  {
    id: 'tn2', name: 'Sunrise Montessori', status: 'Active', plan: 'Professional',
    billingState: 'Grace Period', healthState: 'Warning', activeModules: ['Enrollment', 'Finance', 'Attendance', 'Comms'],
    lastActivity: '15 min ago', urgentFlags: 2, users: 520, monthlyRevenue: '$1,800',
  },
  {
    id: 'tn3', name: 'Bright Minds K-12', status: 'Suspended', plan: 'Enterprise',
    billingState: 'Failed', healthState: 'Critical', activeModules: ['Enrollment', 'Finance', 'Attendance', 'LMS', 'Transport'],
    lastActivity: '3 days ago', urgentFlags: 4, users: 342, monthlyRevenue: '$0',
  },
  {
    id: 'tn4', name: 'Al-Noor International', status: 'Active', plan: 'Professional',
    billingState: 'Current', healthState: 'Healthy', activeModules: ['Enrollment', 'Finance', 'Attendance', 'LMS'],
    lastActivity: '1 hr ago', urgentFlags: 0, users: 890, monthlyRevenue: '$2,400',
  },
  {
    id: 'tn5', name: 'Little Stars Preschool', status: 'Trial', plan: 'Starter',
    billingState: 'Current', healthState: 'Healthy', activeModules: ['Enrollment', 'Attendance'],
    lastActivity: '30 min ago', urgentFlags: 0, users: 85, monthlyRevenue: '$0',
    onboardingStep: 'Module configuration',
  },
  {
    id: 'tn6', name: 'Horizon Learning Center', status: 'Active', plan: 'Enterprise',
    billingState: 'Overdue', healthState: 'Degraded', activeModules: ['Enrollment', 'Finance', 'Attendance', 'LMS', 'Transport', 'Comms', 'HR'],
    lastActivity: '45 min ago', urgentFlags: 1, users: 2100, monthlyRevenue: '$5,800',
  },
  {
    id: 'tn7', name: 'Cedar Grove School', status: 'Onboarding', plan: 'Professional',
    billingState: 'Current', healthState: 'Healthy', activeModules: ['Enrollment'],
    lastActivity: '2 hr ago', urgentFlags: 0, users: 45, monthlyRevenue: '$1,800',
    onboardingStep: 'Data migration',
  },
  {
    id: 'tn8', name: 'Pacific Prep Academy', status: 'Churned', plan: 'Starter',
    billingState: 'Failed', healthState: 'Critical', activeModules: [],
    lastActivity: '14 days ago', urgentFlags: 0, users: 0, monthlyRevenue: '$0',
  },
];

const statusColor: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-600',
  Suspended: 'bg-red-500/10 text-red-600',
  Onboarding: 'bg-blue-500/10 text-blue-600',
  Trial: 'bg-violet-500/10 text-violet-600',
  Churned: 'bg-zinc-500/10 text-zinc-500',
};

const billingColor: Record<string, string> = {
  Current: 'text-emerald-600',
  Overdue: 'text-amber-500',
  Failed: 'text-red-500',
  'Grace Period': 'text-orange-500',
};

const healthColor: Record<string, string> = {
  Healthy: 'text-emerald-600',
  Warning: 'text-amber-500',
  Critical: 'text-red-500',
  Degraded: 'text-orange-500',
};

export function ProviderConciergeTenants() {
  const { activeSubNav } = useNavigationStore();

  /* ── API hooks ── */
  const { data: apiTenants } = useProviderTenants();
  const updateStatus = useUpdateProviderTenantStatus();
  const sendNotice = useSendProviderMessage();

  const tenants: Tenant[] = apiTenants
    ? (apiTenants as unknown as Record<string, unknown>[]).map(mapApiTenant)
    : FALLBACK_TENANTS;
  const [selected, setSelected] = useState<Tenant | null>(tenants[0] ?? null);

  const filtered = (() => {
    switch (activeSubNav) {
      case 'c_health_watch': return tenants.filter((t) => t.healthState !== 'Healthy');
      case 'c_onboarding': return tenants.filter((t) => t.status === 'Onboarding' || t.status === 'Trial');
      case 'c_plans_billing': return tenants.filter((t) => t.billingState !== 'Current');
      case 'c_roles_modules': return tenants.filter((t) => t.status === 'Active');
      case 'c_tenant_actions': return tenants.filter((t) => t.urgentFlags > 0 || t.status === 'Suspended');
      default: return tenants;
    }
  })();

  const queue = (
    <div className="space-y-2">
      {filtered.map((t) => (
        <button
          key={t.id}
          onClick={() => setSelected(t)}
          className={cn(
            'flex w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition',
            selected?.id === t.id
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/30 bg-background/70 hover:bg-muted/40 dark:border-white/5',
          )}
        >
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-medium text-foreground">{t.name}</h5>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusColor[t.status])}>
              {t.status}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>{t.plan}</span>
            <span className={billingColor[t.billingState]}>{t.billingState}</span>
            <span className={healthColor[t.healthState]}>{t.healthState}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" />{t.users} users</span>
            <span className="inline-flex items-center gap-0.5"><Package className="h-2.5 w-2.5" />{t.activeModules?.length ?? 0} modules</span>
            <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{t.lastActivity}</span>
            {t.urgentFlags > 0 && (
              <span className="inline-flex items-center gap-0.5 text-red-500">
                <AlertTriangle className="h-2.5 w-2.5" />{t.urgentFlags} urgent
              </span>
            )}
          </div>
        </button>
      ))}
      {filtered.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No tenants match this filter</p>}
    </div>
  );

  const detail = selected ? (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">{selected.name}</h4>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className={cn('rounded-full px-2 py-0.5 font-medium', statusColor[selected.status])}>{selected.status}</span>
          <span>{selected.plan} Plan</span>
          <span>{selected.monthlyRevenue}/mo</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
          <div className="text-[10px] text-muted-foreground">Billing</div>
          <div className={cn('text-xs font-semibold', billingColor[selected.billingState])}>{selected.billingState}</div>
        </div>
        <div className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
          <div className="text-[10px] text-muted-foreground">Health</div>
          <div className={cn('text-xs font-semibold', healthColor[selected.healthState])}>{selected.healthState}</div>
        </div>
        <div className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
          <div className="text-[10px] text-muted-foreground">Users</div>
          <div className="text-xs font-semibold text-foreground">{selected.users.toLocaleString()}</div>
        </div>
      </div>

      <div>
        <h5 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Modules</h5>
        <div className="flex flex-wrap gap-1.5">
          {(selected.activeModules?.length ?? 0) > 0
            ? selected.activeModules.map((m) => (
                <span key={m} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{m}</span>
              ))
            : <span className="text-[10px] text-muted-foreground">No active modules</span>}
        </div>
      </div>

      {selected.onboardingStep && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 p-3 dark:bg-blue-950/20">
          <span className="text-[10px] font-medium text-blue-600">Onboarding Step: {selected.onboardingStep}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        Last activity: {selected.lastActivity}
      </div>

      <ConciergePermissionBadge granted label="Tenant management permission active" />
      <ConciergeAuditNotice message="Tenant actions are recorded in the provider audit log" />

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button
          className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            const nav = useNavigationStore.getState();
            nav.setSection('provider_tenants');
            nav.setHeader('tenants_directory');
          }}
        >
          <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />Open</span>
        </button>
        {selected.status === 'Active' && (
          <button
            className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            onClick={() => updateStatus.mutate(
              { tenantId: selected.id, nextStatus: 'Suspended', reason: 'Concierge action' },
              { onSuccess: () => notifySuccess('Tenant suspended', `${selected.name} has been suspended`) },
            )}
          >
            <span className="inline-flex items-center gap-1"><Pause className="h-3 w-3" />Suspend</span>
          </button>
        )}
        {selected.status === 'Suspended' && (
          <button
            className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
            onClick={() => updateStatus.mutate(
              { tenantId: selected.id, nextStatus: 'Active', reason: 'Concierge reactivation' },
              { onSuccess: () => notifySuccess('Tenant reactivated', `${selected.name} is now active`) },
            )}
          >
            <span className="inline-flex items-center gap-1"><Play className="h-3 w-3" />Reactivate</span>
          </button>
        )}
        <button
          className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
          onClick={() => {
            const nav = useNavigationStore.getState();
            nav.setSection('provider_billing');
            nav.setHeader('billing_plans');
          }}
        >
          <span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" />Change Plan</span>
        </button>
        <button
          className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
          onClick={() => {
            const nav = useNavigationStore.getState();
            nav.setSection('provider_tenants');
            nav.setHeader('tenants_directory');
            nav.setSubNav('tenants_profiles');
          }}
        >
          <span className="inline-flex items-center gap-1"><Settings className="h-3 w-3" />Configure Modules</span>
        </button>
        <button
          className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
          onClick={() => {
            const nav = useNavigationStore.getState();
            nav.setSection('provider_tenants');
            nav.setHeader('tenants_usage');
          }}
        >
          <span className="inline-flex items-center gap-1"><Activity className="h-3 w-3" />View Usage</span>
        </button>
        <button
          className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
          onClick={() => {
            const nav = useNavigationStore.getState();
            nav.setSection('provider_billing');
            nav.setHeader('billing_invoices');
          }}
        >
          <span className="inline-flex items-center gap-1"><FileText className="h-3 w-3" />Open Billing</span>
        </button>
        <button
          className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
          onClick={() => {
            const body = window.prompt(`Notice to ${selected.name}:`);
            if (!body) return;
            sendNotice.mutate(
              { tenant: selected.name, subject: 'Concierge Notice', body, reason: 'Sent via concierge' },
              { onSuccess: () => notifySuccess('Notice sent', `Notice delivered to ${selected.name}`) },
            );
          }}
        >
          <span className="inline-flex items-center gap-1"><Megaphone className="h-3 w-3" />Send Notice</span>
        </button>
      </div>
    </div>
  ) : <p className="py-8 text-center text-xs text-muted-foreground">Select a tenant to view details</p>;

  const leftLabel = (() => {
    switch (activeSubNav) {
      case 'c_health_watch': return 'Health Watch';
      case 'c_onboarding': return 'Onboarding';
      case 'c_plans_billing': return 'Plans & Billing';
      case 'c_roles_modules': return 'Roles & Modules';
      case 'c_tenant_actions': return 'Tenant Actions';
      default: return 'All Tenants';
    }
  })();

  return (
    <ConciergeSplitPreviewPanel left={queue} right={detail} leftLabel={leftLabel} rightLabel="Tenant Detail" />
  );
}
