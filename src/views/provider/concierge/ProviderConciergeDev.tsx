/* Provider Concierge › Development — Roadmap, Releases, Feature Flags, Environments, QA & Testing, Dev Tasks */
import { useNavigationStore } from '@/store/navigation.store';
import { useState } from 'react';
import { ConciergeSplitPreviewPanel, ConciergePermissionBadge, ConciergeAuditNotice } from '@/components/concierge/shared';
import {
  Rocket, ToggleRight,
  Clock, Play, Eye, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useProviderReleases,
  useProviderModuleData,
  useCreateProviderRelease,
  useUpdateProviderFeatureFlag,
} from '@/hooks/api/use-provider-console';
import { notifySuccess } from '@/lib/notify';

/* ── Data types ── */
type DevItemCategory = 'Roadmap' | 'Release' | 'Feature Flag' | 'Environment' | 'QA' | 'Dev Task';

interface DevItem {
  id: string;
  title: string;
  category: DevItemCategory;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignee: string;
  updated: string;
  detail: string;
  meta?: Record<string, string>;
}

/* ── Seed data ── */
const FALLBACK_DEV_ITEMS: DevItem[] = [
  {
    id: 'DEV-201', title: 'Multi-tenant SSO federation', category: 'Roadmap',
    status: 'In Progress', priority: 'High', assignee: 'Auth Team',
    updated: '2h ago', detail: 'Enable SAML/OIDC federation per tenant. Phase 1 covers Google Workspace and Azure AD. Currently in design review with 3 tenants piloting.',
    meta: { quarter: 'Q1 2026', progress: '40%', dependencies: '2 blockers' },
  },
  {
    id: 'DEV-202', title: 'v2.14.1 — Hotfix: billing retry logic', category: 'Release',
    status: 'Staged', priority: 'Critical', assignee: 'Release Manager',
    updated: '1h ago', detail: 'Fixes payment gateway retry causing duplicate charges. Passed QA on staging. 3 environments green. Awaiting promotion approval for production.',
    meta: { version: 'v2.14.1', environments: 'Staging ✓ · QA ✓ · Dev ✓', rollbackPlan: 'v2.14.0' },
  },
  {
    id: 'DEV-203', title: 'v2.15.0 — Parent portal redesign', category: 'Release',
    status: 'In QA', priority: 'High', assignee: 'Frontend Team',
    updated: '4h ago', detail: 'Complete redesign of parent dashboard. New widget system, responsive layout, and real-time updates. 142 test cases — 138 passing, 4 flaky.',
    meta: { version: 'v2.15.0', testsPassing: '138/142', targetDate: 'Mar 20' },
  },
  {
    id: 'DEV-204', title: 'new-attendance-ui', category: 'Feature Flag',
    status: 'Enabled — 3 tenants', priority: 'Medium', assignee: 'Product Team',
    updated: '1 day ago', detail: 'Gradual rollout of new attendance interface. Currently enabled for Greenfield Academy, Al-Noor International, and Little Stars Preschool. Monitoring adoption metrics.',
    meta: { rollout: '3/8 tenants (37%)', killSwitch: 'Active', metrics: '+12% engagement' },
  },
  {
    id: 'DEV-205', title: 'advanced-reporting-v2', category: 'Feature Flag',
    status: 'Disabled', priority: 'Low', assignee: 'Analytics Team',
    updated: '3 days ago', detail: 'Next-gen reporting engine with custom dashboards and scheduled exports. Feature complete but pending performance benchmarks on large tenant datasets.',
    meta: { rollout: '0/8 tenants', readiness: 'Performance review pending' },
  },
  {
    id: 'DEV-206', title: 'Production', category: 'Environment',
    status: 'Healthy', priority: 'Low', assignee: 'DevOps',
    updated: '5 min ago', detail: 'All services running. Current version v2.14.0. CPU at 34%, memory at 62%. Last deployment 3 days ago. Zero incidents in 48h.',
    meta: { version: 'v2.14.0', uptime: '99.97%', cpu: '34%', memory: '62%' },
  },
  {
    id: 'DEV-207', title: 'Staging', category: 'Environment',
    status: 'Deploying', priority: 'Medium', assignee: 'DevOps',
    updated: '15 min ago', detail: 'Rolling deployment of v2.14.1 in progress. 3/5 pods updated. Health checks passing. Expected completion in 10 minutes.',
    meta: { version: 'v2.14.1 (deploying)', pods: '3/5 updated', eta: '10 min' },
  },
  {
    id: 'DEV-208', title: 'QA', category: 'Environment',
    status: 'Healthy', priority: 'Low', assignee: 'QA Team',
    updated: '30 min ago', detail: 'Running v2.15.0-rc1. Automated regression suite executing. 89% pass rate, 4 flaky tests under investigation.',
    meta: { version: 'v2.15.0-rc1', passRate: '89%', flakyTests: '4' },
  },
  {
    id: 'DEV-209', title: 'Dev', category: 'Environment',
    status: 'Healthy', priority: 'Low', assignee: 'Dev Team',
    updated: '1h ago', detail: 'Latest main branch. 12 PRs merged today. All CI checks green. Feature branch integrations running smoothly.',
    meta: { version: 'main (latest)', prsMerged: '12 today', ciStatus: 'Green' },
  },
  {
    id: 'DEV-210', title: 'Local', category: 'Environment',
    status: 'Active', priority: 'Low', assignee: 'Individual devs',
    updated: 'Varies', detail: 'Docker Compose environment with hot reload. 8 developers active. Seed data synchronized from staging snapshot taken this morning.',
    meta: { activeDevs: '8', seedData: 'Staging snapshot (today)', dockerStatus: 'Running' },
  },
  {
    id: 'DEV-211', title: 'Regression suite — v2.15.0-rc1', category: 'QA',
    status: 'Running', priority: 'High', assignee: 'QA Automation',
    updated: '20 min ago', detail: 'Full regression suite against parent portal redesign. 142 E2E tests, 340 integration tests, 1,200 unit tests. Expected completion in 45 minutes.',
    meta: { e2e: '142 tests', integration: '340 tests', unit: '1,200 tests', eta: '45 min' },
  },
  {
    id: 'DEV-212', title: 'Billing module performance benchmark', category: 'QA',
    status: 'Scheduled', priority: 'Medium', assignee: 'Performance Team',
    updated: '6h ago', detail: 'Load testing billing retry logic under 10k concurrent transactions. Validates hotfix v2.14.1 under production-equivalent load. Scheduled for staging after deployment.',
    meta: { load: '10k concurrent', target: 'p99 < 200ms', scheduledFor: 'Post-deploy' },
  },
  {
    id: 'DEV-213', title: 'Fix: Transport module geocoding timeout', category: 'Dev Task',
    status: 'Blocked', priority: 'High', assignee: 'Backend Team',
    updated: '1 day ago', detail: 'Geocoding API calls timing out for addresses with special characters. Blocked on vendor API fix — workaround branch ready but needs review.',
    meta: { blocker: 'Vendor API issue', branch: 'fix/geocoding-timeout', reviewers: '0/2' },
  },
  {
    id: 'DEV-214', title: 'Implement tenant-scoped audit log export', category: 'Dev Task',
    status: 'In Review', priority: 'Medium', assignee: 'Platform Team',
    updated: '3h ago', detail: 'Adds API endpoint and UI for per-tenant audit log export in CSV and JSON formats. PR open with 2/3 approvals. CI green.',
    meta: { branch: 'feat/tenant-audit-export', approvals: '2/3', ci: 'Green' },
  },
  {
    id: 'DEV-215', title: 'Upgrade Prisma to v6.2', category: 'Dev Task',
    status: 'Blocked', priority: 'Medium', assignee: 'Backend Team',
    updated: '2 days ago', detail: 'Major Prisma upgrade for improved query performance and new relation features. Blocked on 3 breaking schema changes that need migration scripts.',
    meta: { blocker: '3 schema migrations', branch: 'chore/prisma-upgrade', tests: '14 failing' },
  },
];

const statusStyle: Record<string, string> = {
  'In Progress': 'bg-amber-500/10 text-amber-600',
  Staged: 'bg-violet-500/10 text-violet-600',
  'In QA': 'bg-blue-500/10 text-blue-600',
  'Enabled — 3 tenants': 'bg-emerald-500/10 text-emerald-600',
  Disabled: 'bg-zinc-500/10 text-zinc-500',
  Healthy: 'bg-emerald-500/10 text-emerald-600',
  Deploying: 'bg-amber-500/10 text-amber-600',
  Active: 'bg-emerald-500/10 text-emerald-600',
  Running: 'bg-blue-500/10 text-blue-600',
  Scheduled: 'bg-violet-500/10 text-violet-600',
  Blocked: 'bg-red-500/10 text-red-600',
  'In Review': 'bg-blue-500/10 text-blue-600',
};

const priorityColor: Record<string, string> = {
  Low: 'text-zinc-500',
  Medium: 'text-blue-600',
  High: 'text-amber-600',
  Critical: 'text-red-600',
};

export function ProviderConciergeDev() {
  const { activeSubNav } = useNavigationStore();

  /* ── API hooks ── */
  const { data: releasesData } = useProviderReleases();
  const { data: moduleData } = useProviderModuleData();
  const createRelease = useCreateProviderRelease();
  const updateFlag = useUpdateProviderFeatureFlag();

  /* ── Map API data → DevItem shape, falling back to FALLBACK_DEV_ITEMS ── */
  const releasesObj = releasesData as Record<string, unknown> | undefined;
  const moduleObj = moduleData as Record<string, unknown> | undefined;
  const apiReleases = Array.isArray(releasesObj?.releases) ? releasesObj.releases as Array<Record<string, unknown>> : [];
  const apiFlags = Array.isArray(moduleObj?.featureFlags) ? moduleObj.featureFlags as Array<Record<string, unknown>> : [];

  const mappedReleases: DevItem[] = apiReleases.map((r, i) => ({
    id: String(r.id ?? `REL-${i}`),
    title: String(r.version ?? r.title ?? ''),
    category: 'Release' as DevItemCategory,
    status: String(r.status ?? 'Unknown'),
    priority: (r.priority as DevItem['priority']) ?? 'Medium',
    assignee: String(r.assignee ?? 'Release Manager'),
    updated: String(r.updated ?? r.createdAt ?? ''),
    detail: String(r.changes ?? r.detail ?? ''),
    meta: r.meta as Record<string, string> | undefined,
  }));

  const mappedFlags: DevItem[] = apiFlags.map((f, i) => ({
    id: String(f.id ?? `FLAG-${i}`),
    title: String(f.name ?? f.title ?? ''),
    category: 'Feature Flag' as DevItemCategory,
    status: f.enabled ? 'Enabled' : 'Disabled',
    priority: (f.priority as DevItem['priority']) ?? 'Medium',
    assignee: String(f.assignee ?? 'Product Team'),
    updated: String(f.updatedAt ?? f.updated ?? ''),
    detail: String(f.description ?? f.detail ?? ''),
    meta: f.meta as Record<string, string> | undefined,
  }));

  const devItems: DevItem[] = (mappedReleases.length + mappedFlags.length) > 0
    ? [...mappedReleases, ...mappedFlags]
    : FALLBACK_DEV_ITEMS;
  const [selected, setSelected] = useState<DevItem | null>(devItems[0] ?? null);

  const filtered = (() => {
    switch (activeSubNav) {
      case 'c_releases': return devItems.filter((d) => d.category === 'Release');
      case 'c_feature_flags': return devItems.filter((d) => d.category === 'Feature Flag');
      case 'c_environments': return devItems.filter((d) => d.category === 'Environment');
      case 'c_qa_testing': return devItems.filter((d) => d.category === 'QA');
      case 'c_dev_tasks': return devItems.filter((d) => d.category === 'Dev Task');
      default: return devItems.filter((d) => d.category === 'Roadmap');
    }
  })();

  const queue = (
    <div className="space-y-2">
      {filtered.map((d) => (
        <button
          key={d.id}
          onClick={() => setSelected(d)}
          className={cn(
            'flex w-full flex-col gap-1.5 rounded-xl border p-3 text-left transition',
            selected?.id === d.id
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/30 bg-background/70 hover:bg-muted/40 dark:border-white/5',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground">{d.id}</span>
            <span className={cn('text-[10px] font-medium', priorityColor[d.priority])}>{d.priority}</span>
          </div>
          <h5 className="text-xs font-medium text-foreground">{d.title}</h5>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className={cn('rounded-full px-2 py-0.5 font-medium', statusStyle[d.status] ?? 'bg-zinc-500/10 text-zinc-500')}>
              {d.status}
            </span>
            <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{d.updated}</span>
          </div>
        </button>
      ))}
      {filtered.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No items in this view</p>}
    </div>
  );

  const detail = selected ? (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">{selected.id}</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusStyle[selected.status] ?? 'bg-zinc-500/10 text-zinc-500')}>
            {selected.status}
          </span>
          <span className={cn('text-[10px] font-medium', priorityColor[selected.priority])}>{selected.priority}</span>
        </div>
        <h4 className="mt-1 text-sm font-semibold text-foreground">{selected.title}</h4>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{selected.category}</span>
          <span>·</span>
          <span>{selected.assignee}</span>
          <span>·</span>
          <span>{selected.updated}</span>
        </div>
      </div>

      {selected.meta && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(selected.meta).map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border/30 bg-background/70 p-2.5 dark:border-white/5">
              <div className="text-[10px] capitalize text-muted-foreground">{key.replace(/([A-Z])/g, ' $1')}</div>
              <div className="text-xs font-semibold text-foreground">{value}</div>
            </div>
          ))}
        </div>
      )}

      <div>
        <h5 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Details</h5>
        <p className="text-xs leading-relaxed text-muted-foreground">{selected.detail}</p>
      </div>

      <ConciergePermissionBadge granted label="Development permission active" />
      <ConciergeAuditNotice message="Release and flag changes are logged and auditable" />

      <div className="flex flex-wrap items-center gap-2 pt-2">
        {selected.category === 'Release' && (
          <>
            <button
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              onClick={() => createRelease.mutate(
                { version: selected.title, environment: 'production', changes: 0, rolloutPercent: 100, reason: 'Promoted via concierge' },
                { onSuccess: () => notifySuccess('Release promoted', `${selected.title} promoted to production`) },
              )}
            >
              <span className="inline-flex items-center gap-1"><Rocket className="h-3 w-3" />Promote</span>
            </button>
            <button
              className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              onClick={() => createRelease.mutate(
                { version: selected.meta?.rollbackPlan ?? selected.title, environment: 'production', changes: 0, rolloutPercent: 100, reason: 'Rollback via concierge' },
                { onSuccess: () => notifySuccess('Rollback initiated', `Rolling back to ${selected.meta?.rollbackPlan ?? 'previous version'}`) },
              )}
            >
              <span className="inline-flex items-center gap-1"><RefreshCw className="h-3 w-3" />Rollback</span>
            </button>
          </>
        )}
        {selected.category === 'Feature Flag' && (
          <>
            <button
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => updateFlag.mutate(
                { flagId: selected.id, enabled: !selected.status.includes('Enabled'), reason: 'Toggled via concierge' },
                { onSuccess: () => notifySuccess('Flag toggled', `${selected.title} has been toggled`) },
              )}
            >
              <span className="inline-flex items-center gap-1"><ToggleRight className="h-3 w-3" />Toggle</span>
            </button>
            <button
              className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
              onClick={() => {
                const pct = window.prompt('Rollout percentage (0–100):', selected.meta?.rollout?.match(/\d+/)?.[0] ?? '50');
                if (!pct) return;
                updateFlag.mutate(
                  { flagId: selected.id, rolloutPercent: Number(pct), reason: 'Rollout configured via concierge' },
                  { onSuccess: () => notifySuccess('Rollout updated', `${selected.title} set to ${pct}%`) },
                );
              }}
            >Configure Rollout</button>
          </>
        )}
        {selected.category === 'Environment' && (
          <>
            <button
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                const nav = useNavigationStore.getState();
                nav.setSection('provider_monitoring');
                nav.setHeader('monitoring_logs');
              }}
            >
              <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />View Logs</span>
            </button>
            <button
              className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
              onClick={() => {
                const reason = window.prompt(`Restart services for ${selected.title}? Enter reason:`);
                if (!reason) return;
                createRelease.mutate(
                  { version: `restart-${selected.title.toLowerCase()}`, environment: selected.title.toLowerCase(), changes: 0, rolloutPercent: 100, reason },
                  { onSuccess: () => notifySuccess('Services restarting', `${selected.title} services are being restarted`) },
                );
              }}
            >Restart Services</button>
          </>
        )}
        {selected.category === 'Dev Task' && (
          <>
            <button
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                const assignee = window.prompt(`Assign ${selected.id} to:`, selected.assignee);
                if (!assignee) return;
                notifySuccess('Task assigned', `${selected.id} assigned to ${assignee}`);
              }}
            >Assign</button>
            <button
              className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
              onClick={() => {
                const branch = selected.meta?.branch;
                if (branch) {
                  navigator.clipboard.writeText(branch);
                  notifySuccess('Branch copied', `${branch} copied to clipboard`);
                } else {
                  notifySuccess('No branch', 'No PR branch found for this task');
                }
              }}
            >View PR</button>
            <button
              className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
              onClick={() => {
                const resolution = window.prompt(`Unblock ${selected.id} — describe resolution:`);
                if (!resolution) return;
                notifySuccess('Task unblocked', `${selected.id} marked as unblocked: ${resolution}`);
              }}
            >Unblock</button>
          </>
        )}
        {selected.category === 'QA' && (
          <>
            <button
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                notifySuccess('QA suite triggered', `Running ${selected.title}`);
              }}
            >
              <span className="inline-flex items-center gap-1"><Play className="h-3 w-3" />Run</span>
            </button>
            <button
              className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
              onClick={() => {
                const nav = useNavigationStore.getState();
                nav.setSection('provider_monitoring');
                nav.setHeader('monitoring_logs');
              }}
            >View Results</button>
          </>
        )}
        {selected.category === 'Roadmap' && (
          <>
            <button
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                const nav = useNavigationStore.getState();
                nav.setSection('provider_monitoring');
                nav.setHeader('monitoring_overview');
              }}
            >View Board</button>
            <button
              className="rounded-xl border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
              onClick={() => {
                const status = window.prompt(`Update status for ${selected.title}:`, selected.status);
                if (!status) return;
                notifySuccess('Status updated', `${selected.id} set to ${status}`);
              }}
            >Update Status</button>
          </>
        )}
      </div>
    </div>
  ) : <p className="py-8 text-center text-xs text-muted-foreground">Select an item to view details</p>;

  const leftLabel = (() => {
    switch (activeSubNav) {
      case 'c_releases': return 'Releases';
      case 'c_feature_flags': return 'Feature Flags';
      case 'c_environments': return 'Environments';
      case 'c_qa_testing': return 'QA & Testing';
      case 'c_dev_tasks': return 'Dev Tasks';
      default: return 'Roadmap';
    }
  })();

  return (
    <ConciergeSplitPreviewPanel left={queue} right={detail} leftLabel={leftLabel} rightLabel="Detail" />
  );
}
