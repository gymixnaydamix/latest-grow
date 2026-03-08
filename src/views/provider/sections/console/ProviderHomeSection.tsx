/* ─── ProviderHomeSection ─── Command Center with sub-page routing ─── */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRightCircle,
  Bell,
  Cpu,
  LifeBuoy,
  Search,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderConsoleStore } from '@/store/provider-console.store';
import { useProviderStore } from '@/store/provider-data.store';
import {
  useProviderHome,
  useProviderModuleData,
  useProviderTenants,
  useRetryProviderInvoice,
} from '@/hooks/api/use-provider-console';
import type {
  BillingExceptionItem,
  FeatureFlagRuleDTO,
  ProviderActionInboxItem,
  SupportTicketDTO,
  TenantHealthRecord,
} from '@root/types';
import {
  EmptyState,
  Panel,
  SectionPageHeader,
  SectionShell,
  StatCard,
  StatusBadge,
  TenantSwitcher,
  getAccent,
  reasonPrompt,
  tone,
} from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Main export                                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderHomeSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'home_command':
    default:
      return <CommandCenterView />;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Command Center (default home view)                   */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CommandCenterView() {
  const navTo = useNavigate();
  const { activeSubNav } = useNavigationStore();
  const { addRecentTenant } = useProviderConsoleStore();
  const { setTenantSummary, setPlatformHealth, setQuickStats } = useProviderStore();

  const [search, setSearch] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const homeQuery = useProviderHome();
  const tenantsQuery = useProviderTenants({ search: search || undefined });
  const moduleQuery = useProviderModuleData();
  const retryInvoice = useRetryProviderInvoice();

  const home = homeQuery.data;
  const tenants = tenantsQuery.data ?? [];
  const moduleData = moduleQuery.data;
  const actionInbox = home?.actionInbox ?? [];
  const healthWatch = home?.tenantHealthWatchlist ?? [];
  const billing = (moduleData?.invoices ?? []) as BillingExceptionItem[];
  const tickets = (moduleData?.tickets ?? []) as SupportTicketDTO[];
  const flags = (moduleData?.featureFlags ?? []) as FeatureFlagRuleDTO[];

  // Sync API data into provider-data store for cross-component access
  useEffect(() => {
    if (tenants.length > 0) {
      const active = tenants.filter((t) => (t as any).status === 'ACTIVE').length;
      const trial = tenants.filter((t) => (t as any).status === 'TRIAL').length;
      setTenantSummary({
        totalTenants: tenants.length,
        activeTenants: active,
        trialTenants: trial,
        totalRevenue: 0,
      });
    }
  }, [tenants, setTenantSummary]);

  useEffect(() => {
    if (home?.systemHealth) {
      setPlatformHealth({
        uptime: home.systemHealth.uptimePct ?? 99.9,
        avgLatency: 0,
        errorRate: 0,
        activeUsers: 0,
      });
      setQuickStats({
        actionInbox: actionInbox.length,
        healthWatch: healthWatch.length,
        activeIncidents: home.systemHealth.activeIncidents ?? 0,
        queueBacklog: home.systemHealth.queueBacklog ?? 0,
      });
    }
  }, [home, actionInbox.length, healthWatch.length, setPlatformHealth, setQuickStats]);

  const openTenant = (tenantId: string | null) => {
    if (!tenantId) return;
    setSelectedTenantId(tenantId);
    addRecentTenant(tenantId);
    navTo('/provider/tenants/profiles');
  };

  const accent = getAccent('provider_home');

  /* ── SubNav content switching ── */
  const renderSubContent = () => {
    switch (activeSubNav) {
      case 'home_inbox':
        return <ActionInboxFull rows={actionInbox} onOpenTenant={openTenant} onRetryInvoice={(invoiceId) => {
          const reason = reasonPrompt('Retry invoice charge');
          if (!reason) return;
          retryInvoice.mutate({ invoiceId, reason });
        }} />;
      case 'home_health':
        return <HealthWatchlistFull rows={healthWatch} onOpenTenant={openTenant} />;
      case 'home_onboarding':
        return <OnboardingPipelineWidget pipeline={home?.onboardingPipeline ?? []} />;
      case 'home_billing':
        return <BillingExceptionsWidget billing={billing} retryInvoice={retryInvoice} />;
      case 'home_system':
        return <SystemHealthWidget health={home?.systemHealth} />;
      default:
        return null; /* show combined view */
    }
  };

  const subContent = renderSubContent();

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Sparkles}
        title="Command Center"
        description="Operations dashboard — inbox, health, pipeline, revenue"
        accent={accent}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TenantSwitcher
              tenants={tenants.map((t) => ({ id: t.id, name: t.name, status: t.status, domain: t.domain }))}
              selectedTenantId={selectedTenantId}
              onSelect={setSelectedTenantId}
            />
            <Button size="sm" className="h-7 bg-sky-500/20 text-sky-100 hover:bg-sky-500/30" onClick={() => navTo('/provider/onboarding/wizard')}>
              <Zap className="mr-1 size-3" />Quick Create
            </Button>
            <div className="relative">
              <Search className="absolute left-2 top-2 size-3 text-slate-400" />
              <Input className="h-7 w-44 border-sky-500/30 bg-slate-800 pl-7 text-xs text-slate-100 lg:w-52" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenants…" />
            </div>
          </div>
        }
      />

      {/* ── KPI strip (home only) ── */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Tenants" value={String(tenants.length)} sub="Active schools" gradient="from-sky-500/10 to-sky-500/5" />
        <StatCard label="Action Inbox" value={String(actionInbox.length)} sub="Needs attention" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Open Tickets" value={String(tickets.length)} sub="Support queue" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Feature Flags" value={String(flags.length)} sub="Rollout controls" gradient="from-fuchsia-500/10 to-fuchsia-500/5" />
      </div>

      {/* ── Sub-nav drilled content, or combined dashboard ── */}
      {subContent ?? (
        <div className="grid gap-3 xl:grid-cols-2">
          <Panel title="Action Inbox" subtitle={`${actionInbox.length} items needing attention`} accentBorder="border-sky-500/20" action={
            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-sky-300" onClick={() => navTo('/provider/home/action-inbox')}>
              View All <ArrowRightCircle className="ml-1 size-3" />
            </Button>
          }>
            <ActionInboxCompact rows={actionInbox.slice(0, 6)} onOpenTenant={openTenant} onRetryInvoice={(invoiceId) => {
              const reason = reasonPrompt('Retry invoice charge');
              if (!reason) return;
              retryInvoice.mutate({ invoiceId, reason });
            }} />
          </Panel>

          <Panel title="Tenant Health Watchlist" subtitle="Status + incidents + billing + usage" accentBorder="border-sky-500/20" action={
            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-sky-300" onClick={() => navTo('/provider/home/tenant-health')}>
              View All <ArrowRightCircle className="ml-1 size-3" />
            </Button>
          }>
            <div className="space-y-2">
              {healthWatch.slice(0, 6).map((row: TenantHealthRecord) => (
                <div key={row.tenantId} className="flex items-center justify-between rounded-lg border border-sky-500/15 bg-slate-800/60 px-3 py-2 text-xs">
                  <button className="font-semibold text-slate-100 hover:text-sky-200" onClick={() => openTenant(row.tenantId)}>{row.tenantName}</button>
                  <div className="flex items-center gap-2">
                    <Badge className={`border ${tone(row.status === 'CRITICAL' ? 'CRITICAL' : row.status === 'WARNING' ? 'HIGH' : 'LOW')}`}>{row.status}</Badge>
                    <span className="text-slate-300">{row.usagePct}%</span>
                  </div>
                </div>
              ))}
              {healthWatch.length === 0 && <p className="text-xs text-slate-400">All tenants healthy.</p>}
            </div>
          </Panel>

          <Panel title="Onboarding Pipeline" subtitle="Lead → provisioning → import → training → live" accentBorder="border-sky-500/20" action={
            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-sky-300" onClick={() => navTo('/provider/onboarding')}>
              Full Pipeline <ArrowRightCircle className="ml-1 size-3" />
            </Button>
          }>
            <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
              {(home?.onboardingPipeline ?? []).map((stage) => (
                <div key={stage.stage} className="rounded-lg border border-sky-500/15 bg-slate-800/60 p-2 text-xs">
                  <p className="uppercase tracking-wider text-sky-300">{stage.label}</p>
                  <p className="text-xl font-bold text-slate-100">{stage.count}</p>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Revenue & Billing Exceptions" subtitle="Failed charges, overdue invoices" accentBorder="border-sky-500/20" action={
            <Button size="sm" variant="ghost" className="h-6 text-[10px] text-sky-300" onClick={() => navTo('/provider/billing')}>
              Billing Module <ArrowRightCircle className="ml-1 size-3" />
            </Button>
          }>
            <div className="space-y-2">
              {billing.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-sky-500/15 bg-slate-800/60 px-3 py-2 text-xs">
                  <div>
                    <p className="text-slate-100">{invoice.number}</p>
                    <p className="text-slate-400">${invoice.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={invoice.status} />
                    <Button size="sm" className="h-6 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 text-[10px]" onClick={() => {
                      const reason = reasonPrompt(`Retry ${invoice.number}`);
                      if (!reason) return;
                      retryInvoice.mutate({ invoiceId: invoice.id, reason });
                    }}>Retry</Button>
                  </div>
                </div>
              ))}
              {billing.length === 0 && <p className="text-xs text-slate-400">No billing exceptions.</p>}
            </div>
          </Panel>

          {/* ── System Health widget ── */}
          <div className="xl:col-span-2">
            <SystemHealthWidget health={home?.systemHealth} />
          </div>
        </div>
      )}
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-components                                                 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* Action Inbox - Compact (for dashboard) */
function ActionInboxCompact({
  rows,
  onOpenTenant,
  onRetryInvoice,
}: {
  rows: ProviderActionInboxItem[];
  onOpenTenant: (tenantId: string | null) => void;
  onRetryInvoice: (invoiceId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="rounded-lg border border-sky-500/20 bg-slate-800/60 p-3">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-100">{row.title}</p>
              <p className="text-xs text-slate-400">{row.tenantName} · {row.owner}</p>
            </div>
            <Badge className={`border text-[10px] ${tone(row.severity)}`}>{row.severity}</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-slate-700 px-2 py-1 text-slate-200">{row.type}</span>
            <Button size="sm" variant="outline" className="h-7 border-slate-500/40 text-slate-100" onClick={() => onOpenTenant(row.tenantId)}>Open Tenant</Button>
            {row.id.startsWith('invoice_') && (
              <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => onRetryInvoice(row.id.replace('invoice_', ''))}>Retry Charge</Button>
            )}
          </div>
        </div>
      ))}
      {rows.length === 0 && <EmptyState icon={Bell} title="Inbox Clear" description="Nothing needs attention right now." />}
    </div>
  );
}

/* Action Inbox - Full page */
function ActionInboxFull({
  rows,
  onOpenTenant,
  onRetryInvoice,
}: {
  rows: ProviderActionInboxItem[];
  onOpenTenant: (tenantId: string | null) => void;
  onRetryInvoice: (invoiceId: string) => void;
}) {
  return (
    <Panel title="Action Inbox" subtitle={`${rows.length} items requiring attention`} accentBorder="border-sky-500/20">
      <ActionInboxCompact rows={rows} onOpenTenant={onOpenTenant} onRetryInvoice={onRetryInvoice} />
    </Panel>
  );
}

/* Health Watchlist - Full page */
function HealthWatchlistFull({
  rows,
  onOpenTenant,
}: {
  rows: TenantHealthRecord[];
  onOpenTenant: (tenantId: string | null) => void;
}) {
  return (
    <Panel title="Tenant Health Watchlist" subtitle={`${rows.length} tenants monitored`} accentBorder="border-sky-500/20">
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.tenantId} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-sky-500/15 bg-slate-800/60 px-3 py-2 text-xs gap-2">
            <button className="font-semibold text-slate-100 hover:text-sky-200 text-left" onClick={() => onOpenTenant(row.tenantId)}>{row.tenantName}</button>
            <div className="flex items-center gap-2">
              <Badge className={`border ${tone(row.status === 'CRITICAL' ? 'CRITICAL' : row.status === 'WARNING' ? 'HIGH' : 'LOW')}`}>{row.status}</Badge>
              <span className="text-slate-300">{row.usagePct}% usage</span>
              {'openIncidents' in row && (row as unknown as { openIncidents: number }).openIncidents > 0 && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-300">{(row as unknown as { openIncidents: number }).openIncidents} incidents</span>}
            </div>
          </div>
        ))}
        {rows.length === 0 && <EmptyState icon={TrendingUp} title="All Healthy" description="No tenants on the watch list." />}
      </div>
    </Panel>
  );
}

/* Onboarding Pipeline widget */
function OnboardingPipelineWidget({ pipeline }: { pipeline: Array<{ stage: string; label: string; count: number }> }) {
  return (
    <Panel title="Onboarding Pipeline" subtitle="Current pipeline distribution" accentBorder="border-sky-500/20">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {pipeline.map((stage) => (
          <div key={stage.stage} className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-3 text-center">
            <p className="text-[10px] uppercase tracking-widest text-teal-400">{stage.label}</p>
            <p className="text-2xl font-bold text-slate-100">{stage.count}</p>
          </div>
        ))}
        {pipeline.length === 0 && <p className="col-span-full text-xs text-slate-400">No pipeline data.</p>}
      </div>
    </Panel>
  );
}

/* Billing Exceptions widget */
function BillingExceptionsWidget({
  billing,
  retryInvoice,
}: {
  billing: BillingExceptionItem[];
  retryInvoice: ReturnType<typeof useRetryProviderInvoice>;
}) {
  return (
    <Panel title="Billing Exceptions" subtitle={`${billing.length} invoices with issues`} accentBorder="border-amber-500/20">
      <div className="space-y-2">
        {billing.map((invoice) => (
          <div key={invoice.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-amber-500/15 bg-slate-800/60 px-3 py-2 text-xs gap-2">
            <div>
              <p className="font-semibold text-slate-100">{invoice.number}</p>
              <p className="text-slate-400">${invoice.amount.toLocaleString()} · Due {invoice.dueAt?.slice(0, 10) ?? '—'}</p>
              {invoice.dunningStep > 0 && <p className="text-amber-300">Dunning step {invoice.dunningStep}</p>}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={invoice.status} />
              {(invoice.status === 'OVERDUE' || invoice.status === 'FAILED') && (
                <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => {
                  const reason = reasonPrompt(`Retry ${invoice.number}`);
                  if (!reason) return;
                  retryInvoice.mutate({ invoiceId: invoice.id, reason });
                }}>Retry</Button>
              )}
            </div>
          </div>
        ))}
        {billing.length === 0 && <EmptyState icon={TrendingUp} title="No Exceptions" description="All billing operations are normal." />}
      </div>
    </Panel>
  );
}

/* System Health widget */
function SystemHealthWidget({ health }: { health?: { uptimePct: number; queueBacklog: number; activeIncidents: number; emailDelivery: string; smsDelivery: string } }) {
  if (!health) return null;
  return (
    <Panel title="System Health" subtitle="Infrastructure status" accentBorder="border-sky-500/20">
      <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
          <Cpu className="mx-auto mb-1 size-5 text-emerald-400" />
          <p className="text-lg font-bold text-slate-100">{health.uptimePct}%</p>
          <p className="text-[10px] text-slate-400">Uptime</p>
        </div>
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-center">
          <LifeBuoy className="mx-auto mb-1 size-5 text-blue-400" />
          <p className="text-lg font-bold text-slate-100">{health.queueBacklog}</p>
          <p className="text-[10px] text-slate-400">Queue Backlog</p>
        </div>
        <div className={`rounded-lg border p-3 text-center ${health.activeIncidents > 0 ? 'border-red-500/20 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
          <AlertTriangle className={`mx-auto mb-1 size-5 ${health.activeIncidents > 0 ? 'text-red-400' : 'text-emerald-400'}`} />
          <p className="text-lg font-bold text-slate-100">{health.activeIncidents}</p>
          <p className="text-[10px] text-slate-400">Active Incidents</p>
        </div>
        <div className="rounded-lg border border-sky-500/20 bg-sky-500/5 p-3 text-center">
          <Bell className="mx-auto mb-1 size-5 text-sky-400" />
          <p className="text-sm font-bold text-slate-100">{health.emailDelivery}</p>
          <p className="text-[10px] text-slate-400">Email Delivery</p>
        </div>
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-center">
          <Bell className="mx-auto mb-1 size-5 text-violet-400" />
          <p className="text-sm font-bold text-slate-100">{health.smsDelivery}</p>
          <p className="text-[10px] text-slate-400">SMS Delivery</p>
        </div>
      </div>
    </Panel>
  );
}
