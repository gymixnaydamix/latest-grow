/* ─── ProviderTenantsSection ─── Directory + Lifecycle + Profiles + Maintenance + Bulk + Users + Flags + Usage ─── */
import { useState, useMemo, useCallback } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Copy,
  Database,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  Filter,
  Flag,
  Gauge,
  Globe2,
  HardDrive,
  Heart,
  Key,
  Loader2,
  Mail,
  MapPin,
  Pause,
  Play,
  RefreshCw,
  Search,
  Server,
  Shield,
  Tag,
  Upload,
  UserPlus,
  Users,
  Wrench,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderConsoleStore } from '@/store/provider-console.store';
import {
  useProviderTenants,
  useProviderTenantDetail,
  useProviderTenantLifecycle,
  useProviderTenantMaintenanceActions,
  useUpdateProviderTenantStatus,
  useUpdateTenantProfile,
  useToggleTenantModule,
  useCreateTenantMaintenanceAction,
  useResolveTenantMaintenanceAction,
  useBulkUpdateTenantStatus,
  useExportTenants,
  useStartProviderDataImport,
  type TenantLifecycleEvent,
  type TenantTrialInfo,
  type TenantMaintenanceAction,
  type TenantProfileDetail,
} from '@/hooks/api/use-provider-console';
import {
  DataTable,
  EmptyState,
  Panel,
  SectionPageHeader,
  SectionShell,
  StatCard,
  StatusBadge,
  getAccent,
  reasonPrompt,
  type ColumnDef,
} from './shared';
import { AddTenantDialog } from '../../dialogs/AddTenantDialog';

type TenantRecord = {
  id: string;
  externalId: string;
  name: string;
  country: string;
  status: string;
  health: string;
  billingStatus: string;
  onboardingStage: string;
  planCode: string;
  domain: string;
  customDomain: string | null;
  adminEmail: string;
  adminName: string;
  activeStudents: number;
  activeTeachers: number;
  activeParents: number;
  storageUsedGb: number;
  storageLimitGb: number;
  incidentsOpen: number;
  lastLoginAt: string;
  modules: string[];
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Main export                                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderTenantsSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'tenants_bulk':
      return <BulkActionsView />;
    case 'tenants_users':
      return <TenantUsersView />;
    case 'tenants_flags':
      return <TenantFlagsView />;
    case 'tenants_usage':
      return <TenantUsageView />;
    case 'tenants_directory':
    default:
      return <TenantDirectoryView />;
  }
}

/* ── Relative time helper ─────────────────────────────────────── */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Tenant Directory (default)                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TenantDirectoryView() {
  const { activeSubNav } = useNavigationStore();
  const { addRecentTenant } = useProviderConsoleStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [addTenantOpen, setAddTenantOpen] = useState(false);

  const tenantsQuery = useProviderTenants({
    search: search || undefined,
    status: statusFilter || undefined,
    stage: stageFilter || undefined,
    country: countryFilter || undefined,
  });
  const updateTenantStatus = useUpdateProviderTenantStatus();
  const exportMutation = useExportTenants();

  const tenants = (tenantsQuery.data ?? []) as TenantRecord[];
  const accent = getAccent('provider_tenants');

  /* Country options from existing data */
  const countryOptions = useMemo(() => [...new Set(tenants.map((t) => t.country))].sort(), [tenants]);

  const openTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    addRecentTenant(tenantId);
  };

  /* ── Sub-nav content switching ── */
  const getContent = () => {
    switch (activeSubNav) {
      case 'tenants_list':
        return <AllTenantsTable tenants={tenants} onOpen={openTenant} onStatusChange={handleStatusChange} />;
      case 'tenants_status':
        return <LifecycleStatesView tenants={tenants} onStatusChange={handleStatusChange} />;
      case 'tenants_profiles':
        return <TenantProfileView tenantId={selectedTenantId} tenants={tenants} onSelectTenant={setSelectedTenantId} />;
      case 'tenants_maintenance':
        return <MaintenanceView tenants={tenants} />;
      default:
        return <AllTenantsTable tenants={tenants} onOpen={openTenant} onStatusChange={handleStatusChange} />;
    }
  };

  const handleStatusChange = (tenantId: string, nextStatus: string, tenantName: string) => {
    const reason = reasonPrompt(`${nextStatus} ${tenantName}`);
    if (!reason) return;
    updateTenantStatus.mutate({ tenantId, nextStatus, reason });
  };

  /* KPI computations */
  const totalUsers = tenants.reduce((s, t) => s + t.activeStudents + t.activeTeachers + t.activeParents, 0);
  const totalStorage = tenants.reduce((s, t) => s + t.storageUsedGb, 0);
  const healthyCount = tenants.filter((t) => t.health === 'HEALTHY').length;
  const pctHealthy = tenants.length > 0 ? Math.round((healthyCount / tenants.length) * 100) : 0;

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Building2}
        title="Tenants (Schools)"
        description="Lifecycle control — suspend, reactivate, configure"
        accent={accent}
        actions={
          <div className="flex flex-wrap gap-2">
            <select
              className="h-7 rounded-md border border-border bg-muted px-2 text-xs text-foreground"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="TRIAL">Trial</option>
              <option value="ACTIVE">Active</option>
              <option value="PAYMENT_DUE">Payment Due</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select
              className="h-7 rounded-md border border-border bg-muted px-2 text-xs text-foreground"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
            >
              <option value="">All stages</option>
              <option value="PROVISIONING">Provisioning</option>
              <option value="DATA_IMPORT">Data Import</option>
              <option value="TRAINING">Training</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            {countryOptions.length > 1 && (
              <select
                className="h-7 rounded-md border border-border bg-muted px-2 text-xs text-foreground"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <option value="">All countries</option>
                {countryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <div className="relative">
              <Search className="absolute left-2 top-2 size-3 text-muted-foreground" />
              <Input
                className="h-7 w-36 border-border bg-muted pl-7 text-xs text-foreground lg:w-44"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter tenants…"
              />
            </div>
            <Button
              size="sm"
              className="h-7 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30"
              onClick={() => exportMutation.mutate({ format: 'CSV' })}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Download className="mr-1 size-3" />}
              Export
            </Button>
            <Button size="sm" className="h-7 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30" onClick={() => setAddTenantOpen(true)}>
              <UserPlus className="mr-1 size-3" />Add Tenant
            </Button>
          </div>
        }
      />

      {/* Add Tenant Dialog */}
      <AddTenantDialog open={addTenantOpen} onOpenChange={setAddTenantOpen} />

      {/* KPI strip */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Total Tenants" value={String(tenants.length)} sub="Schools registered" gradient="from-indigo-500/12 via-indigo-400/6 to-transparent" borderAccent="border-indigo-500/20" />
        <StatCard label="Active" value={String(tenants.filter((t) => t.status === 'ACTIVE').length)} sub="Fully operational" gradient="from-emerald-500/12 via-emerald-400/6 to-transparent" borderAccent="border-emerald-500/20" />
        <StatCard label="Trial" value={String(tenants.filter((t) => t.status === 'TRIAL').length)} sub="Evaluating" gradient="from-blue-500/12 via-blue-400/6 to-transparent" borderAccent="border-blue-500/20" />
        <StatCard label="Payment Due" value={String(tenants.filter((t) => t.status === 'PAYMENT_DUE').length)} sub="At risk" gradient="from-amber-500/12 via-amber-400/6 to-transparent" borderAccent="border-amber-500/20" />
        <StatCard label="Suspended" value={String(tenants.filter((t) => t.status === 'SUSPENDED').length)} sub="Needs action" gradient="from-red-500/12 via-red-400/6 to-transparent" borderAccent="border-red-500/20" />
        <StatCard label="Health" value={`${pctHealthy}%`} sub={`${healthyCount} healthy`} gradient="from-emerald-500/12 via-emerald-400/6 to-transparent" borderAccent="border-emerald-500/20" />
        <StatCard label="Total Users" value={totalUsers > 999 ? `${(totalUsers / 1000).toFixed(1)}k` : String(totalUsers)} sub="All roles" gradient="from-violet-500/12 via-violet-400/6 to-transparent" borderAccent="border-violet-500/20" />
        <StatCard label="Storage" value={`${totalStorage.toFixed(0)} GB`} sub="Used" gradient="from-sky-500/12 via-sky-400/6 to-transparent" borderAccent="border-sky-500/20" />
      </div>

      {getContent()}
    </SectionShell>
  );
}

/* ── All Tenants — full-featured data table ────────────────── */
function AllTenantsTable({
  tenants,
  onOpen,
  onStatusChange,
}: {
  tenants: TenantRecord[];
  onOpen: (tenantId: string) => void;
  onStatusChange: (tenantId: string, nextStatus: string, tenantName: string) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const bulkUpdate = useBulkUpdateTenantStatus();

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => prev.size === tenants.length ? new Set() : new Set(tenants.map((t) => t.id)));
  }, [tenants]);

  const handleBulkAction = useCallback((nextStatus: string) => {
    if (selectedIds.size === 0) return;
    const reason = reasonPrompt(`Bulk ${nextStatus} ${selectedIds.size} tenants`);
    if (!reason) return;
    bulkUpdate.mutate({ tenantIds: Array.from(selectedIds), nextStatus, reason }, {
      onSuccess: () => setSelectedIds(new Set()),
    });
  }, [selectedIds, bulkUpdate]);

  const storagePercent = (t: TenantRecord) => t.storageLimitGb > 0 ? (t.storageUsedGb / t.storageLimitGb) * 100 : 0;
  const totalUserCount = (t: TenantRecord) => t.activeStudents + t.activeTeachers + t.activeParents;

  const columns: ColumnDef<TenantRecord>[] = [
    {
      key: 'select',
      label: '',
      render: (t) => (
        <input
          type="checkbox"
          checked={selectedIds.has(t.id)}
          onChange={() => toggleSelect(t.id)}
          className="size-3.5 rounded border-border bg-muted"
        />
      ),
    },
    {
      key: 'name',
      label: 'Tenant',
      render: (t) => (
        <div className="min-w-0">
          <button className="font-semibold text-foreground hover:text-primary truncate block" onClick={() => onOpen(t.id)}>
            {t.name}
          </button>
          <p className="text-muted-foreground text-[10px] flex items-center gap-1">
            <Globe2 className="size-2.5" />{t.domain}
            {t.customDomain && <span className="text-primary/50">· {t.customDomain}</span>}
          </p>
          <p className="text-muted-foreground/70 text-[10px]">{t.country} · ID: {t.externalId}</p>
        </div>
      ),
      sortKey: (t) => t.name.toLowerCase(),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (t) => (
        <div>
          <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-200 border border-indigo-500/30">{t.planCode}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t.onboardingStage}</p>
        </div>
      ),
      sortKey: (t) => t.planCode,
      hideOnMobile: true,
    },
    {
      key: 'status',
      label: 'Status',
      render: (t) => (
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            <StatusBadge status={t.status} />
            <StatusBadge status={t.health} />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Billing: <span className={t.billingStatus === 'GOOD' ? 'text-emerald-600 dark:text-emerald-300' : t.billingStatus === 'FAILED' ? 'text-red-600 dark:text-red-300' : 'text-amber-600 dark:text-amber-300'}>{t.billingStatus}</span>
          </p>
        </div>
      ),
      sortKey: (t) => t.status,
    },
    {
      key: 'admin',
      label: 'Admin',
      render: (t) => (
        <div>
          <p className="text-foreground/90 text-[11px]">{t.adminName}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Mail className="size-2.5" />{t.adminEmail}</p>
        </div>
      ),
      sortKey: (t) => t.adminName.toLowerCase(),
      hideOnMobile: true,
    },
    {
      key: 'users',
      label: 'Users',
      render: (t) => (
        <div>
          <p className="font-semibold text-foreground">{totalUserCount(t).toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">{t.activeStudents}S · {t.activeTeachers}T · {t.activeParents}P</p>
        </div>
      ),
      sortKey: (t) => totalUserCount(t),
      hideOnMobile: true,
    },
    {
      key: 'modules',
      label: 'Modules',
      render: (t) => (
        <div className="flex items-center gap-1">
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-foreground/90">{t.modules.length}</span>
          <span className="text-[10px] text-muted-foreground hidden xl:inline truncate max-w-20">{t.modules.slice(0, 2).join(', ')}{t.modules.length > 2 ? '…' : ''}</span>
        </div>
      ),
      sortKey: (t) => t.modules.length,
      hideOnMobile: true,
    },
    {
      key: 'storage',
      label: 'Storage',
      render: (t) => {
        const pct = storagePercent(t);
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-14 rounded-full bg-muted">
              <div className={`h-full rounded-full ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-[10px] text-foreground/80">{t.storageUsedGb}/{t.storageLimitGb}GB</span>
          </div>
        );
      },
      sortKey: (t) => storagePercent(t),
      hideOnMobile: true,
    },
    {
      key: 'lastLogin',
      label: 'Last Active',
      render: (t) => (
        <span className="text-[10px] text-muted-foreground">{relativeTime(t.lastLoginAt)}</span>
      ),
      sortKey: (t) => new Date(t.lastLoginAt).getTime(),
      hideOnMobile: true,
    },
    {
      key: 'incidents',
      label: 'Inc.',
      render: (t) => (
        t.incidentsOpen > 0
          ? <span className="flex items-center gap-1 text-red-300 text-[10px]"><AlertTriangle className="size-3" />{t.incidentsOpen}</span>
          : <span className="text-[10px] text-muted-foreground/70">0</span>
      ),
      sortKey: (t) => t.incidentsOpen,
      hideOnMobile: true,
    },
    {
      key: 'actions',
      label: '',
      render: (t) => (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="h-6 text-[10px] border-indigo-500/30 px-2" onClick={() => onOpen(t.id)}>
            <Eye className="mr-0.5 size-3" />View
          </Button>
          {t.status !== 'SUSPENDED' ? (
            <Button size="sm" className="h-6 text-[10px] bg-red-500/20 text-red-100 hover:bg-red-500/30 px-2" onClick={() => onStatusChange(t.id, 'SUSPENDED', t.name)}>
              <Pause className="mr-0.5 size-3" />
            </Button>
          ) : (
            <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 px-2" onClick={() => onStatusChange(t.id, 'ACTIVE', t.name)}>
              <Play className="mr-0.5 size-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5">
          <span className="text-xs font-semibold text-indigo-200">{selectedIds.size} selected</span>
          <Button size="sm" className="h-6 text-[10px] bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => handleBulkAction('SUSPENDED')}>Suspend Selected</Button>
          <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => handleBulkAction('ACTIVE')}>Activate Selected</Button>
          <Button size="sm" variant="outline" className="h-6 text-[10px] border-border" onClick={() => setSelectedIds(new Set())}>
            <X className="mr-0.5 size-3" />Clear
          </Button>
          {bulkUpdate.isPending && <Loader2 className="size-3 animate-spin text-indigo-300" />}
        </div>
      )}

      <Panel title="Tenant Directory" subtitle={`${tenants.length} schools managed`} accentBorder="border-indigo-500/20"
        action={
          <div className="flex items-center gap-2">
            <button onClick={toggleAll} className="text-[10px] text-indigo-300 hover:text-indigo-100">
              {selectedIds.size === tenants.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        }
      >
        <DataTable
          data={tenants}
          columns={columns}
          rowKey={(t) => t.id}
          accentBorder="border-indigo-500/15"
          searchPlaceholder="Quick search tenants…"
          searchFn={(t, q) => t.name.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q) || t.adminEmail.toLowerCase().includes(q) || t.planCode.toLowerCase().includes(q) || t.country.toLowerCase().includes(q)}
          emptyMessage="No tenants match the current filters."
        />
      </Panel>
    </div>
  );
}

/* ── Lifecycle States view ─── grouped + trials + timeline ───── */
function LifecycleStatesView({
  tenants,
  onStatusChange,
}: {
  tenants: TenantRecord[];
  onStatusChange: (tenantId: string, nextStatus: string, tenantName: string) => void;
}) {
  const lifecycleQuery = useProviderTenantLifecycle();
  const trials = (lifecycleQuery.data?.trials ?? []) as TenantTrialInfo[];
  const events = (lifecycleQuery.data?.events ?? []) as TenantLifecycleEvent[];
  const [activeTab, setActiveTab] = useState<'overview' | 'trials' | 'transitions' | 'dunning'>('overview');

  const statusGroups = useMemo(() => {
    const groups = new Map<string, TenantRecord[]>();
    const order = ['TRIAL', 'ACTIVE', 'PAYMENT_DUE', 'SUSPENDED'];
    for (const s of order) groups.set(s, []);
    for (const t of tenants) {
      const s = t.status;
      if (!groups.has(s)) groups.set(s, []);
      groups.get(s)!.push(t);
    }
    return groups;
  }, [tenants]);

  const trialCount = statusGroups.get('TRIAL')?.length ?? 0;
  const activeCount = statusGroups.get('ACTIVE')?.length ?? 0;
  const dueCount = statusGroups.get('PAYMENT_DUE')?.length ?? 0;
  const suspendedCount = statusGroups.get('SUSPENDED')?.length ?? 0;
  const conversionRate = trialCount + activeCount > 0 ? Math.round((activeCount / (trialCount + activeCount)) * 100) : 0;

  const stateColors: Record<string, string> = {
    TRIAL: 'border-blue-500/30 bg-blue-500/5',
    ACTIVE: 'border-emerald-500/30 bg-emerald-500/5',
    PAYMENT_DUE: 'border-amber-500/30 bg-amber-500/5',
    SUSPENDED: 'border-red-500/30 bg-red-500/5',
  };
  const stateText: Record<string, string> = {
    TRIAL: 'text-blue-700 dark:text-blue-300',
    ACTIVE: 'text-emerald-700 dark:text-emerald-300',
    PAYMENT_DUE: 'text-amber-700 dark:text-amber-300',
    SUSPENDED: 'text-red-700 dark:text-red-300',
  };
  const stateIcons: Record<string, React.ElementType> = {
    TRIAL: Clock,
    ACTIVE: CheckCircle2,
    PAYMENT_DUE: AlertTriangle,
    SUSPENDED: XCircle,
  };

  return (
    <div className="space-y-3">
      {/* Lifecycle KPIs */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Trial" value={String(trialCount)} sub="Evaluating" gradient="from-blue-500/12 via-blue-400/6 to-transparent" borderAccent="border-blue-500/20" />
        <StatCard label="Active" value={String(activeCount)} sub="Operational" gradient="from-emerald-500/12 via-emerald-400/6 to-transparent" borderAccent="border-emerald-500/20" />
        <StatCard label="Payment Due" value={String(dueCount)} sub="At risk" gradient="from-amber-500/12 via-amber-400/6 to-transparent" borderAccent="border-amber-500/20" />
        <StatCard label="Suspended" value={String(suspendedCount)} sub="Frozen" gradient="from-red-500/12 via-red-400/6 to-transparent" borderAccent="border-red-500/20" />
        <StatCard label="Conversion" value={`${conversionRate}%`} sub="Trial → Active" gradient="from-violet-500/12 via-violet-400/6 to-transparent" borderAccent="border-violet-500/20" />
        <StatCard label="Trials Expiring" value={String(trials.filter((tr) => tr.daysRemaining <= 7).length)} sub="Within 7 days" gradient="from-orange-500/12 via-orange-400/6 to-transparent" borderAccent="border-orange-500/20" />
        <StatCard label="Transitions" value={String(events.length)} sub="Last 30 days" gradient="from-sky-500/12 via-sky-400/6 to-transparent" borderAccent="border-sky-500/20" />
        <StatCard label="Churn Risk" value={String(dueCount + suspendedCount)} sub="Needs attention" gradient="from-red-500/12 via-red-400/6 to-transparent" borderAccent="border-red-500/20" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {(['overview', 'trials', 'transitions', 'dunning'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors capitalize ${
              activeTab === tab ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview — kanban columns */}
      {activeTab === 'overview' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from(statusGroups.entries()).map(([status, group]) => {
            const Icon = stateIcons[status] ?? Activity;
            return (
              <div key={status} className={`rounded-2xl border ${stateColors[status] ?? 'border-border bg-muted/60'} p-3`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 ${stateText[status] ?? 'text-foreground/80'}`}>
                    <Icon className="size-3.5" />
                    {status.replace('_', ' ')} <span className="ml-1 text-muted-foreground">({group.length})</span>
                  </h4>
                </div>
                <div className="space-y-2 max-h-100 overflow-y-auto">
                  {group.map((t) => (
                    <div key={t.id} className="rounded-lg border border-border/60 bg-muted/50 p-2.5 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{t.name}</p>
                          <p className="text-muted-foreground text-[10px]">{t.domain} · {t.planCode}</p>
                          <p className="text-muted-foreground/70 text-[10px]">Admin: {t.adminEmail}</p>
                          <p className="text-muted-foreground/70 text-[10px]">Users: {t.activeStudents + t.activeTeachers + t.activeParents} · Storage: {t.storageUsedGb}GB</p>
                        </div>
                        <StatusBadge status={t.health} />
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground/70">{relativeTime(t.lastLoginAt)}</span>
                        <div className="flex gap-1">
                          {status === 'TRIAL' && (
                            <Button size="sm" className="h-5 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 px-1.5" onClick={() => onStatusChange(t.id, 'ACTIVE', t.name)}>
                              <ArrowRight className="mr-0.5 size-2.5" />Activate
                            </Button>
                          )}
                          {status === 'ACTIVE' && (
                            <Button size="sm" className="h-5 text-[10px] bg-red-500/20 text-red-100 hover:bg-red-500/30 px-1.5" onClick={() => onStatusChange(t.id, 'SUSPENDED', t.name)}>
                              <Pause className="mr-0.5 size-2.5" />Suspend
                            </Button>
                          )}
                          {status === 'PAYMENT_DUE' && (
                            <>
                              <Button size="sm" className="h-5 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 px-1.5" onClick={() => onStatusChange(t.id, 'ACTIVE', t.name)}>
                                Resolve
                              </Button>
                              <Button size="sm" className="h-5 text-[10px] bg-red-500/20 text-red-100 hover:bg-red-500/30 px-1.5" onClick={() => onStatusChange(t.id, 'SUSPENDED', t.name)}>
                                Suspend
                              </Button>
                            </>
                          )}
                          {status === 'SUSPENDED' && (
                            <Button size="sm" className="h-5 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 px-1.5" onClick={() => onStatusChange(t.id, 'ACTIVE', t.name)}>
                              <Play className="mr-0.5 size-2.5" />Reactivate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {group.length === 0 && <p className="text-[10px] text-muted-foreground py-2">No tenants in this state.</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trials tab — expiry tracking */}
      {activeTab === 'trials' && (
        <Panel title="Trial Accounts" subtitle={`${trials.length} active trials`} accentBorder="border-blue-500/20">
          <div className="space-y-2">
            {trials.length > 0 ? trials.map((trial) => {
              const urgency = trial.daysRemaining <= 3 ? 'border-red-500/20 bg-red-500/5' : trial.daysRemaining <= 7 ? 'border-amber-500/20 bg-amber-500/5' : 'border-border bg-muted/50';
              return (
                <div key={trial.tenantId} className={`rounded-lg border ${urgency} px-3 py-2.5 text-xs`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{trial.tenantName}</p>
                      <p className="text-muted-foreground text-[10px]">{trial.domain} · {trial.planCode} · {trial.adminEmail}</p>
                      <p className="text-muted-foreground/70 text-[10px]">{trial.activeUsers} active users · Started {new Date(trial.trialStartedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className={`text-sm font-bold ${trial.daysRemaining <= 3 ? 'text-red-300' : trial.daysRemaining <= 7 ? 'text-amber-300' : 'text-blue-300'}`}>
                          {trial.daysRemaining}d left
                        </p>
                        <p className="text-[10px] text-muted-foreground">Expires {new Date(trial.trialEndsAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-violet-600 dark:text-violet-300">{Math.round(trial.conversionProbability * 100)}%</p>
                        <p className="text-[10px] text-muted-foreground">Conversion</p>
                      </div>
                      <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => onStatusChange(trial.tenantId, 'ACTIVE', trial.tenantName)}>
                        Convert
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }) : (
              /* Fallback: show trial tenants from main list */
              (statusGroups.get('TRIAL') ?? []).map((t) => (
                <div key={t.id} className="rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{t.name}</p>
                      <p className="text-muted-foreground text-[10px]">{t.domain} · {t.planCode} · {t.adminEmail}</p>
                    </div>
                    <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => onStatusChange(t.id, 'ACTIVE', t.name)}>
                      Convert to Active
                    </Button>
                  </div>
                </div>
              ))
            )}
            {trials.length === 0 && (statusGroups.get('TRIAL') ?? []).length === 0 && (
              <EmptyState icon={Clock} title="No Active Trials" description="No tenants are currently in trial status." />
            )}
          </div>
        </Panel>
      )}

      {/* Transitions tab — audit log */}
      {activeTab === 'transitions' && (
        <Panel title="Lifecycle Transitions" subtitle={`${events.length} recent transitions`} accentBorder="border-indigo-500/20">
          <div className="space-y-1">
            {events.length > 0 ? events.slice(0, 50).map((evt) => (
              <div key={evt.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-xs">
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={evt.fromStatus} />
                  <ArrowRight className="size-3 text-muted-foreground/70" />
                  <StatusBadge status={evt.toStatus} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{evt.tenantName}</p>
                  <p className="text-muted-foreground text-[10px]">By {evt.actor} · {evt.reason}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/70 shrink-0">{relativeTime(evt.createdAt)}</span>
              </div>
            )) : (
              <EmptyState icon={Activity} title="No Transitions" description="Lifecycle transitions will appear here as tenants change states." />
            )}
          </div>
        </Panel>
      )}

      {/* Dunning tab — payment due & suspended */}
      {activeTab === 'dunning' && (
        <div className="space-y-3">
          <Panel title="Payment Due" subtitle={`${dueCount} tenants at risk`} accentBorder="border-amber-500/20">
            <div className="space-y-2">
              {(statusGroups.get('PAYMENT_DUE') ?? []).map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground text-[10px]">{t.domain} · {t.planCode} · Billing: {t.billingStatus}</p>
                    <p className="text-muted-foreground/70 text-[10px]">{t.activeStudents + t.activeTeachers + t.activeParents} users depend on this account</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => onStatusChange(t.id, 'ACTIVE', t.name)}>
                      Mark Paid
                    </Button>
                    <Button size="sm" className="h-6 text-[10px] bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => onStatusChange(t.id, 'SUSPENDED', t.name)}>
                      Suspend
                    </Button>
                  </div>
                </div>
              ))}
              {dueCount === 0 && <p className="text-xs text-muted-foreground py-2">No tenants have outstanding payments.</p>}
            </div>
          </Panel>
          <Panel title="Suspended Accounts" subtitle={`${suspendedCount} frozen accounts`} accentBorder="border-red-500/20">
            <div className="space-y-2">
              {(statusGroups.get('SUSPENDED') ?? []).map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2 text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground text-[10px]">{t.domain} · Last login: {relativeTime(t.lastLoginAt)}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => onStatusChange(t.id, 'ACTIVE', t.name)}>
                      <Play className="mr-0.5 size-2.5" />Reactivate
                    </Button>
                  </div>
                </div>
              ))}
              {suspendedCount === 0 && <p className="text-xs text-muted-foreground py-2">No suspended accounts.</p>}
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}

/* ── Tenant Profile view ─── full profile with editing ───────── */
function TenantProfileView({
  tenantId,
  tenants,
  onSelectTenant,
}: {
  tenantId: string | null;
  tenants: TenantRecord[];
  onSelectTenant: (id: string) => void;
}) {
  const baseTenant = tenants.find((t) => t.id === tenantId);
  const detailQuery = useProviderTenantDetail(tenantId);
  const detail = detailQuery.data as TenantProfileDetail | undefined;
  const updateProfile = useUpdateTenantProfile();
  const toggleModule = useToggleTenantModule();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [profileTab, setProfileTab] = useState<'info' | 'modules' | 'security' | 'technical'>('info');

  // Available modules
  const allModules = ['ATTENDANCE', 'GRADEBOOK', 'LMS', 'FINANCE', 'TRANSPORT', 'COMMUNICATION', 'LIBRARY', 'CAFETERIA', 'HOSTEL', 'ANALYTICS', 'HR', 'CALENDAR'];

  // Init edit form
  const startEdit = useCallback(() => {
    setEditForm({
      name: baseTenant?.name ?? '',
      domain: baseTenant?.domain ?? '',
      customDomain: baseTenant?.customDomain ?? '',
      adminName: baseTenant?.adminName ?? '',
      adminEmail: baseTenant?.adminEmail ?? '',
      country: baseTenant?.country ?? '',
      timezone: detail?.timezone ?? '',
      locale: detail?.locale ?? '',
      billingContactEmail: detail?.billingContact ?? '',
      technicalContactEmail: detail?.technicalContact ?? '',
      notes: detail?.notes ?? '',
    });
    setEditing(true);
  }, [baseTenant, detail]);

  const saveEdit = () => {
    if (!tenantId) return;
    const reason = reasonPrompt('Update tenant profile');
    if (!reason) return;
    updateProfile.mutate(
      { tenantId, updates: editForm as unknown as Partial<TenantProfileDetail>, reason },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (!tenantId || !baseTenant) {
    return (
      <div className="grid gap-3 md:grid-cols-[280px_1fr]">
        <TenantSidebar tenants={tenants} selectedId={null} onSelect={onSelectTenant} />
        <EmptyState icon={Building2} title="Select a Tenant" description="Choose a tenant from the sidebar to view and manage their profile." />
      </div>
    );
  }

  const tenant = baseTenant;
  const storagePct = tenant.storageLimitGb > 0 ? Math.min((tenant.storageUsedGb / tenant.storageLimitGb) * 100, 100) : 0;
  const totalUsers = tenant.activeStudents + tenant.activeTeachers + tenant.activeParents;

  return (
    <div className="grid gap-3 md:grid-cols-[280px_1fr]">
      {/* Sidebar with tenant list */}
      <TenantSidebar tenants={tenants} selectedId={tenantId} onSelect={onSelectTenant} />

      {/* Main profile area */}
      <div className="space-y-3">
        {/* Header card */}
        <Panel
          title={tenant.name}
          subtitle={`${tenant.domain}${tenant.customDomain ? ` · ${tenant.customDomain}` : ''} · ${tenant.planCode}`}
          accentBorder="border-indigo-500/20"
          action={
            !editing ? (
              <Button size="sm" className="h-7 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30 text-xs" onClick={startEdit}>
                <Edit3 className="mr-1 size-3" />Edit Profile
              </Button>
            ) : (
              <div className="flex gap-1.5">
                <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 text-xs" onClick={saveEdit} disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? <RefreshCw className="mr-1 size-3 animate-spin" /> : <CheckCircle2 className="mr-1 size-3" />}Save
                </Button>
                <Button size="sm" className="h-7 bg-muted text-foreground hover:bg-muted/80 text-xs" onClick={() => setEditing(false)}>
                  <X className="mr-1 size-3" />Cancel
                </Button>
              </div>
            )
          }
        >
          <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
            <div className="rounded-lg border border-border/60 bg-muted/50 p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Status</p>
              <StatusBadge status={tenant.status} />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/50 p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Health</p>
              <StatusBadge status={tenant.health} />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/50 p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Billing</p>
              <StatusBadge status={tenant.billingStatus === 'GOOD' ? 'ACTIVE' : tenant.billingStatus === 'FAILED' ? 'FAILED' : 'WARNING'} />
            </div>
            <div className="rounded-lg border border-border/60 bg-muted/50 p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Onboarding</p>
              <span className="text-sm font-semibold text-foreground">{tenant.onboardingStage}</span>
            </div>
          </div>
        </Panel>

        {/* Profile tabs */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
          {(['info', 'modules', 'security', 'technical'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setProfileTab(tab)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors capitalize ${
                profileTab === tab ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {profileTab === 'info' && (
          <div className="grid gap-3 md:grid-cols-2">
            <Panel title="School Information" accentBorder="border-indigo-500/20">
              <div className="space-y-2.5 text-xs">
                {editing ? (
                  <>
                    <div><Label className="text-[10px] text-muted-foreground mb-1">School Name</Label><Input value={editForm.name ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} className="h-7 text-xs" /></div>
                    <div><Label className="text-[10px] text-muted-foreground mb-1">Domain</Label><Input value={editForm.domain ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, domain: e.target.value }))} className="h-7 text-xs" /></div>
                    <div><Label className="text-[10px] text-muted-foreground mb-1">Custom Domain</Label><Input value={editForm.customDomain ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, customDomain: e.target.value }))} className="h-7 text-xs" /></div>
                    <div><Label className="text-[10px] text-muted-foreground mb-1">Country</Label><Input value={editForm.country ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, country: e.target.value }))} className="h-7 text-xs" /></div>
                    <div><Label className="text-[10px] text-muted-foreground mb-1">Timezone</Label><Input value={editForm.timezone ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, timezone: e.target.value }))} className="h-7 text-xs" /></div>
                    <div><Label className="text-[10px] text-muted-foreground mb-1">Locale</Label><Input value={editForm.locale ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, locale: e.target.value }))} className="h-7 text-xs" /></div>
                  </>
                ) : (
                  <>
                    <ProfileRow label="School Name" value={tenant.name} />
                    <ProfileRow label="Domain" value={tenant.domain} icon={<Globe2 className="size-3 text-muted-foreground" />} />
                    <ProfileRow label="Custom Domain" value={tenant.customDomain ?? 'Not configured'} icon={<ExternalLink className="size-3 text-muted-foreground" />} />
                    <ProfileRow label="Country" value={tenant.country} icon={<MapPin className="size-3 text-muted-foreground" />} />
                    <ProfileRow label="Plan" value={tenant.planCode} icon={<Tag className="size-3 text-muted-foreground" />} />
                    <ProfileRow label="External ID" value={tenant.externalId ?? '—'} icon={<Key className="size-3 text-muted-foreground" />} />
                    {detail?.timezone && <ProfileRow label="Timezone" value={detail.timezone} />}
                    {detail?.locale && <ProfileRow label="Locale" value={detail.locale} />}
                    {detail?.dataRegion && <ProfileRow label="Data Region" value={detail.dataRegion} icon={<Server className="size-3 text-muted-foreground" />} />}
                  </>
                )}
              </div>
            </Panel>

            <Panel title="Contacts" accentBorder="border-indigo-500/20">
              <div className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-muted/50 p-2.5">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Admin Contact</p>
                  {editing ? (
                    <div className="space-y-2">
                      <Input value={editForm.adminName ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, adminName: e.target.value }))} placeholder="Admin name" className="h-7 text-xs" />
                      <Input value={editForm.adminEmail ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, adminEmail: e.target.value }))} placeholder="Admin email" className="h-7 text-xs" />
                    </div>
                  ) : (
                    <div className="text-xs space-y-1">
                      <p className="text-foreground font-semibold">{tenant.adminName}</p>
                      <p className="text-foreground/80">{tenant.adminEmail}</p>
                      <p className="text-muted-foreground/70 text-[10px]">Last login: {new Date(tenant.lastLoginAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {(detail?.billingContact || editing) && (
                  <div className="rounded-lg border border-border/60 bg-muted/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Billing Contact</p>
                    {editing ? (
                      <Input value={editForm.billingContactEmail ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, billingContactEmail: e.target.value }))} placeholder="Billing email" className="h-7 text-xs" />
                    ) : (
                      <div className="text-xs space-y-1">
                        <p className="text-foreground font-semibold">{detail?.billingContact ?? '—'}</p>
                      </div>
                    )}
                  </div>
                )}
                {(detail?.technicalContact || editing) && (
                  <div className="rounded-lg border border-border/60 bg-muted/50 p-2.5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">Technical Contact</p>
                    {editing ? (
                      <Input value={editForm.technicalContactEmail ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, technicalContactEmail: e.target.value }))} placeholder="Tech email" className="h-7 text-xs" />
                    ) : (
                      <div className="text-xs space-y-1">
                        <p className="text-foreground font-semibold">{detail?.technicalContact ?? '—'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Panel>

            {/* User breakdown */}
            <Panel title="Users" subtitle={`${totalUsers} total`} accentBorder="border-indigo-500/20">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <StatCard label="Students" value={String(tenant.activeStudents)} gradient="from-blue-500/12 via-blue-400/6 to-transparent" borderAccent="border-blue-500/20" />
                <StatCard label="Teachers" value={String(tenant.activeTeachers)} gradient="from-violet-500/12 via-violet-400/6 to-transparent" borderAccent="border-violet-500/20" />
                <StatCard label="Parents" value={String(tenant.activeParents)} gradient="from-emerald-500/12 via-emerald-400/6 to-transparent" borderAccent="border-emerald-500/20" />
              </div>
              {totalUsers > 0 && (
                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                  {tenant.activeStudents > 0 && <div className="bg-blue-500 rounded-full" style={{ width: `${(tenant.activeStudents / totalUsers) * 100}%` }} />}
                  {tenant.activeTeachers > 0 && <div className="bg-violet-500 rounded-full" style={{ width: `${(tenant.activeTeachers / totalUsers) * 100}%` }} />}
                  {tenant.activeParents > 0 && <div className="bg-emerald-500 rounded-full" style={{ width: `${(tenant.activeParents / totalUsers) * 100}%` }} />}
                </div>
              )}
            </Panel>

            {/* Storage */}
            <Panel title="Storage" subtitle={`${tenant.storageUsedGb}/${tenant.storageLimitGb} GB`} accentBorder="border-indigo-500/20">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <HardDrive className={`size-4 ${storagePct > 90 ? 'text-red-400' : storagePct > 70 ? 'text-amber-400' : 'text-sky-400'}`} />
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${storagePct > 90 ? 'bg-red-500' : storagePct > 70 ? 'bg-amber-500' : 'bg-sky-500'}`}
                        style={{ width: `${storagePct}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${storagePct > 90 ? 'text-red-600 dark:text-red-300' : 'text-foreground'}`}>{Math.round(storagePct)}%</span>
                </div>
                {detail?.backupFrequency && (
                  <div className="text-[10px] text-muted-foreground">
                    Backup: {detail.backupFrequency}{detail.lastBackupAt && ` · Last: ${new Date(detail.lastBackupAt).toLocaleString()}`}
                  </div>
                )}
              </div>
            </Panel>

            {/* Notes */}
            {(editing || detail?.notes) && (
              <Panel title="Notes" accentBorder="border-indigo-500/20" className="md:col-span-2">
                {editing ? (
                  <textarea
                    rows={3}
                    value={editForm.notes ?? ''}
                    onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-muted/80 px-3 py-2 text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                ) : (
                  <p className="text-xs text-foreground/80 whitespace-pre-wrap">{detail?.notes}</p>
                )}
              </Panel>
            )}
          </div>
        )}

        {/* Modules tab */}
        {profileTab === 'modules' && (
          <Panel title="Module Management" subtitle={`${tenant.modules.length} of ${allModules.length} enabled`} accentBorder="border-indigo-500/20">
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {allModules.map((mod) => {
                const enabled = tenant.modules.includes(mod);
                return (
                  <div key={mod} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                    enabled ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-border/60 bg-muted/40'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Database className={`size-3.5 ${enabled ? 'text-indigo-600 dark:text-indigo-300' : 'text-muted-foreground'}`} />
                      <span className={`text-xs font-semibold ${enabled ? 'text-indigo-700 dark:text-indigo-200' : 'text-muted-foreground'}`}>{mod}</span>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked: boolean) => toggleModule.mutate({ tenantId: tenant.id, module: mod, enabled: checked, reason: `Toggle ${mod}` })}
                      disabled={toggleModule.isPending}
                    />
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {/* Security tab */}
        {profileTab === 'security' && (
          <div className="grid gap-3 md:grid-cols-2">
            <Panel title="Security Settings" accentBorder="border-indigo-500/20">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="size-4 text-emerald-500 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-foreground">SSO Enabled</span>
                  </div>
                  <StatusBadge status={detail?.ssoEnabled ? 'ACTIVE' : 'DISABLED'} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <Key className="size-4 text-violet-500 dark:text-violet-400" />
                    <span className="text-xs font-semibold text-foreground">MFA Enforced</span>
                  </div>
                  <StatusBadge status={detail?.mfaEnforced ? 'ACTIVE' : 'DISABLED'} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/50 p-3">
                  <div className="flex items-center gap-2">
                    <Globe2 className="size-4 text-sky-500 dark:text-sky-400" />
                    <span className="text-xs font-semibold text-foreground">API Access</span>
                  </div>
                  <StatusBadge status={detail?.apiAccess ? 'ACTIVE' : 'DISABLED'} />
                </div>
              </div>
            </Panel>

            <Panel title="Access & Compliance" accentBorder="border-indigo-500/20">
              <div className="space-y-2.5 text-xs">
                <ProfileRow label="SLA Level" value={detail?.slaLevel ?? '—'} />
                <ProfileRow label="Data Region" value={detail?.dataRegion ?? '—'} icon={<Server className="size-3 text-muted-foreground" />} />
                <ProfileRow label="Custom Branding" value={detail?.customBranding ? 'Enabled' : 'Disabled'} />
                <ProfileRow label="Open Incidents" value={String(tenant.incidentsOpen)} />
              </div>
            </Panel>
          </div>
        )}

        {/* Technical tab */}
        {profileTab === 'technical' && (
          <div className="grid gap-3 md:grid-cols-2">
            <Panel title="Technical Details" accentBorder="border-indigo-500/20">
              <div className="space-y-2.5 text-xs">
                <ProfileRow label="Tenant ID" value={tenant.id} icon={<Copy className="size-3 text-muted-foreground cursor-pointer hover:text-foreground" />} />
                <ProfileRow label="External ID" value={tenant.externalId ?? '—'} />
                <ProfileRow label="Domain" value={tenant.domain} icon={<Globe2 className="size-3 text-muted-foreground" />} />
                {tenant.customDomain && <ProfileRow label="Custom Domain" value={tenant.customDomain} icon={<ExternalLink className="size-3 text-muted-foreground" />} />}
                <ProfileRow label="Timezone" value={detail?.timezone ?? '—'} />
                <ProfileRow label="Locale" value={detail?.locale ?? '—'} />
              </div>
            </Panel>

            <Panel title="Infrastructure" accentBorder="border-indigo-500/20">
              <div className="space-y-2.5 text-xs">
                <ProfileRow label="Data Region" value={detail?.dataRegion ?? '—'} icon={<Server className="size-3 text-muted-foreground" />} />
                <ProfileRow label="Backup Frequency" value={detail?.backupFrequency ?? '—'} />
                <ProfileRow label="Last Backup" value={detail?.lastBackupAt ? new Date(detail.lastBackupAt).toLocaleString() : '—'} />
                <ProfileRow label="Storage" value={`${tenant.storageUsedGb} / ${tenant.storageLimitGb} GB`} icon={<HardDrive className="size-3 text-muted-foreground" />} />
              </div>
            </Panel>

            {detail?.tags && detail.tags.length > 0 && (
              <Panel title="Tags" accentBorder="border-indigo-500/20" className="md:col-span-2">
                <div className="flex flex-wrap gap-1.5">
                  {detail.tags.map((tag: string) => (
                    <span key={tag} className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] text-indigo-700 dark:text-indigo-200 border border-indigo-500/30">{tag}</span>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Profile row helper ───── */
function ProfileRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground flex items-center gap-1.5">{label}</span>
      <span className="text-foreground flex items-center gap-1.5 text-right font-medium truncate max-w-[60%]">{value}{icon}</span>
    </div>
  );
}

/* ── Tenant sidebar for profile view ─── */
function TenantSidebar({ tenants, selectedId, onSelect }: { tenants: TenantRecord[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const [sidebarSearch, setSidebarSearch] = useState('');
  const filteredSidebar = tenants.filter((t) => t.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || t.domain.toLowerCase().includes(sidebarSearch.toLowerCase()));

  return (
    <div className="rounded-2xl border border-border bg-card p-2 h-fit max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      <Input placeholder="Filter tenants…" value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} className="h-7 text-xs mb-2" />
      <div className="overflow-y-auto space-y-0.5 flex-1">
        {filteredSidebar.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={`w-full text-left rounded-lg px-2.5 py-2 text-xs transition-colors ${
              t.id === selectedId
                ? 'bg-primary/10 border border-primary/30 text-primary'
                : 'hover:bg-muted/60 text-foreground/80 border border-transparent'
            }`}
          >
            <p className="font-semibold truncate">{t.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <StatusBadge status={t.status} />
              <span className="text-[10px] text-muted-foreground truncate">{t.domain}</span>
            </div>
          </button>
        ))}
        {filteredSidebar.length === 0 && <p className="text-[10px] text-muted-foreground p-2 text-center">No tenants found.</p>}
      </div>
    </div>
  );
}

/* ── Maintenance view ─── service actions + resolution tracking ─ */
function MaintenanceView({ tenants }: { tenants: TenantRecord[] }) {
  const actionsQuery = useProviderTenantMaintenanceActions();
  const actions = (actionsQuery.data ?? []) as TenantMaintenanceAction[];
  const createAction = useCreateTenantMaintenanceAction();
  const resolveAction = useResolveTenantMaintenanceAction();
  const [maintTab, setMaintTab] = useState<'overview' | 'actions' | 'create'>('overview');
  const [resolutionText, setResolutionText] = useState<Record<string, string>>({});

  // Form state for creating maintenance action
  const [newAction, setNewAction] = useState({
    tenantId: '',
    actionType: 'HEALTH_CHECK' as TenantMaintenanceAction['actionType'],
    priority: 'NORMAL' as TenantMaintenanceAction['priority'],
    description: '',
    scheduledAt: '',
  });

  const criticalTenants = tenants.filter((t) => t.health === 'CRITICAL' || t.incidentsOpen > 0);
  const warningTenants = tenants.filter((t) => t.health === 'WARNING' && t.incidentsOpen === 0);
  const pendingActions = actions.filter((a) => a.status === 'PENDING' || a.status === 'IN_PROGRESS');
  const completedActions = actions.filter((a) => a.status === 'COMPLETED');
  const failedActions = actions.filter((a) => a.status === 'FAILED');

  const handleCreate = () => {
    if (!newAction.tenantId || !newAction.description) return;
    createAction.mutate(newAction, {
      onSuccess: () => {
        setNewAction({ tenantId: '', actionType: 'HEALTH_CHECK', priority: 'NORMAL', description: '', scheduledAt: '' });
        setMaintTab('actions');
      },
    });
  };

  const handleResolve = (actionId: string) => {
    resolveAction.mutate({ actionId, resolution: resolutionText[actionId] ?? '' }, {
      onSuccess: () => setResolutionText((p) => ({ ...p, [actionId]: '' })),
    });
  };

  const priorityColors: Record<string, string> = {
    CRITICAL: 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300',
    HIGH: 'border-orange-500/30 bg-orange-500/5 text-orange-700 dark:text-orange-300',
    NORMAL: 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300',
    LOW: 'border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300',
  };
  const actionTypes: TenantMaintenanceAction['actionType'][] = ['HEALTH_CHECK', 'DATA_REPAIR', 'STORAGE_CLEANUP', 'CERTIFICATE_RENEWAL', 'BACKUP_RESTORE', 'DNS_UPDATE', 'MODULE_PATCH', 'ESCALATION'];
  const priorities: TenantMaintenanceAction['priority'][] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];

  return (
    <div className="space-y-3">
      {/* Maintenance KPIs */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Critical" value={String(criticalTenants.length)} sub="Immediate attention" gradient="from-red-500/12 via-red-400/6 to-transparent" borderAccent="border-red-500/20" />
        <StatCard label="Warnings" value={String(warningTenants.length)} sub="Monitoring" gradient="from-amber-500/12 via-amber-400/6 to-transparent" borderAccent="border-amber-500/20" />
        <StatCard label="Pending" value={String(pendingActions.length)} sub="Active tasks" gradient="from-orange-500/12 via-orange-400/6 to-transparent" borderAccent="border-orange-500/20" />
        <StatCard label="Failed" value={String(failedActions.length)} sub="Needs review" gradient="from-sky-500/12 via-sky-400/6 to-transparent" borderAccent="border-sky-500/20" />
        <StatCard label="Completed" value={String(completedActions.length)} sub="Resolved" gradient="from-emerald-500/12 via-emerald-400/6 to-transparent" borderAccent="border-emerald-500/20" />
        <StatCard label="Total Open" value={String(tenants.reduce((sum, t) => sum + t.incidentsOpen, 0))} sub="Incidents" gradient="from-violet-500/12 via-violet-400/6 to-transparent" borderAccent="border-violet-500/20" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {(['overview', 'actions', 'create'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setMaintTab(tab)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors capitalize ${
              maintTab === tab ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'create' ? 'New Action' : tab}
          </button>
        ))}
      </div>

      {/* Overview — critical + warning tenants */}
      {maintTab === 'overview' && (
        <div className="grid gap-3">
          <Panel title="Critical & Incident Tenants" subtitle={`${criticalTenants.length} tenants need immediate attention`} accentBorder="border-red-500/20">
            <div className="space-y-2">
              {criticalTenants.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-red-500/15 bg-muted/50 px-3 py-2.5 text-xs gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground">{t.domain} · {t.planCode}</p>
                    <p className="text-muted-foreground/70 text-[10px]">{t.incidentsOpen} open incident{t.incidentsOpen !== 1 ? 's' : ''} · Health: {t.health} · Last login: {relativeTime(t.lastLoginAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={t.health} />
                    <StatusBadge status={t.status} />
                    <Button
                      size="sm"
                      className="h-6 text-[10px] bg-orange-500/20 text-orange-100 hover:bg-orange-500/30"
                      onClick={() => { setNewAction((n) => ({ ...n, tenantId: t.id })); setMaintTab('create'); }}
                    >
                      <Wrench className="mr-0.5 size-2.5" />Action
                    </Button>
                  </div>
                </div>
              ))}
              {criticalTenants.length === 0 && <EmptyState icon={Heart} title="All Clear" description="No critical tenants or open incidents." />}
            </div>
          </Panel>

          <Panel title="Warning State" subtitle={`${warningTenants.length} tenants with warnings`} accentBorder="border-amber-500/20">
            <div className="space-y-2">
              {warningTenants.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-amber-500/15 bg-muted/50 px-3 py-2 text-xs gap-2">
                  <div>
                    <p className="font-semibold text-foreground">{t.name}</p>
                    <p className="text-muted-foreground">{t.planCode} · Storage: {t.storageUsedGb}/{t.storageLimitGb} GB · Users: {t.activeStudents + t.activeTeachers + t.activeParents}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status="WARNING" />
                    <Button
                      size="sm"
                      className="h-6 text-[10px] bg-orange-500/20 text-orange-100 hover:bg-orange-500/30"
                      onClick={() => { setNewAction((n) => ({ ...n, tenantId: t.id })); setMaintTab('create'); }}
                    >
                      <Wrench className="mr-0.5 size-2.5" />Action
                    </Button>
                  </div>
                </div>
              ))}
              {warningTenants.length === 0 && <p className="text-xs text-muted-foreground py-2">No warnings.</p>}
            </div>
          </Panel>
        </div>
      )}

      {/* Actions tab — list of all maintenance actions */}
      {maintTab === 'actions' && (
        <div className="space-y-3">
          {pendingActions.length > 0 && (
            <Panel title="Active / Pending" subtitle={`${pendingActions.length} actions in progress`} accentBorder="border-orange-500/20">
              <div className="space-y-2">
                {pendingActions.map((action) => (
                  <div key={action.id} className={`rounded-lg border ${priorityColors[action.priority] ?? 'border-border'} px-3 py-2.5 text-xs`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">{action.actionType.replace(/_/g, ' ')}</span>
                          <StatusBadge status={action.priority} />
                          <StatusBadge status={action.status} />
                        </div>
                        <p className="text-foreground/80">{action.tenantName}</p>
                        <p className="text-muted-foreground mt-0.5">{action.description}</p>
                        {action.assignedTo && <p className="text-muted-foreground/70 text-[10px] mt-0.5">Assigned: {action.assignedTo} · Created: {relativeTime(action.createdAt)}</p>}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 items-end">
                        <Input
                          placeholder="Resolution note…"
                          value={resolutionText[action.id] ?? ''}
                          onChange={(e) => setResolutionText((p) => ({ ...p, [action.id]: e.target.value }))}
                          className="h-6 text-[10px] w-48"
                        />
                        <Button
                          size="sm"
                          className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
                          onClick={() => handleResolve(action.id)}
                          disabled={resolveAction.isPending}
                        >
                          <CheckCircle2 className="mr-0.5 size-2.5" />Resolve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {failedActions.length > 0 && (
            <Panel title="Failed Actions" subtitle={`${failedActions.length} actions need review`} accentBorder="border-red-500/20">
              <div className="space-y-2">
                {failedActions.map((action) => (
                  <div key={action.id} className="rounded-lg border border-red-500/15 bg-muted/50 px-3 py-2.5 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="size-3 text-red-500 dark:text-red-400" />
                      <span className="font-bold text-foreground">{action.actionType.replace(/_/g, ' ')}</span>
                      <StatusBadge status={action.priority} />
                      <StatusBadge status="FAILED" />
                    </div>
                    <p className="text-foreground/80">{action.tenantName} — {action.description}</p>
                    <p className="text-red-600 dark:text-red-300 text-[10px] mt-0.5">Created: {relativeTime(action.createdAt)}</p>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {completedActions.length > 0 && (
            <Panel title="Recently Completed" subtitle={`${completedActions.length} resolved actions`} accentBorder="border-emerald-500/20">
              <div className="space-y-2">
                {completedActions.slice(0, 20).map((action) => (
                  <div key={action.id} className="rounded-lg border border-emerald-500/15 bg-muted/40 px-3 py-2 text-xs opacity-80">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-3 text-emerald-500 dark:text-emerald-400" />
                      <span className="font-semibold text-foreground/90">{action.actionType.replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">— {action.tenantName}</span>
                      {action.completedAt && <span className="text-muted-foreground/70 ml-auto text-[10px]">{relativeTime(action.completedAt)}</span>}
                    </div>
                    {action.resolution && <p className="text-muted-foreground text-[10px] mt-0.5 ml-5">Resolution: {action.resolution}</p>}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {actions.length === 0 && <EmptyState icon={Wrench} title="No Maintenance Actions" description="Create a new maintenance action to track service operations." action={<Button size="sm" className="h-7 text-xs bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30" onClick={() => setMaintTab('create')}>Create Action</Button>} />}
        </div>
      )}

      {/* Create action tab */}
      {maintTab === 'create' && (
        <Panel title="New Maintenance Action" subtitle="Schedule a service operation for a tenant" accentBorder="border-indigo-500/20">
          <div className="grid gap-3 md:grid-cols-2 max-w-3xl">
            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Tenant *</Label>
              <select
                value={newAction.tenantId}
                onChange={(e) => setNewAction((n) => ({ ...n, tenantId: e.target.value }))}
                className="w-full h-8 rounded-lg border border-border bg-muted/80 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="">Select tenant…</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.domain})</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Action Type *</Label>
              <select
                value={newAction.actionType}
                onChange={(e) => setNewAction((n) => ({ ...n, actionType: e.target.value as TenantMaintenanceAction['actionType'] }))}
                className="w-full h-8 rounded-lg border border-border bg-muted/80 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {actionTypes.map((at) => (
                  <option key={at} value={at}>{at.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Priority</Label>
              <select
                value={newAction.priority}
                onChange={(e) => setNewAction((n) => ({ ...n, priority: e.target.value as TenantMaintenanceAction['priority'] }))}
                className="w-full h-8 rounded-lg border border-border bg-muted/80 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground mb-1 block">Schedule (optional)</Label>
              <Input
                type="datetime-local"
                value={newAction.scheduledAt}
                onChange={(e) => setNewAction((n) => ({ ...n, scheduledAt: e.target.value }))}
                className="h-8 text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-[10px] text-muted-foreground mb-1 block">Description *</Label>
              <textarea
                rows={3}
                value={newAction.description}
                onChange={(e) => setNewAction((n) => ({ ...n, description: e.target.value }))}
                className="w-full rounded-lg border border-border bg-muted/80 px-3 py-2 text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/40"
                placeholder="Describe the maintenance action…"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button
                className="h-8 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30 text-xs"
                onClick={handleCreate}
                disabled={!newAction.tenantId || !newAction.description || createAction.isPending}
              >
                {createAction.isPending ? <RefreshCw className="mr-1 size-3 animate-spin" /> : <Wrench className="mr-1 size-3" />}
                Create Action
              </Button>
              <Button className="h-8 bg-muted text-foreground hover:bg-muted/80 text-xs" onClick={() => setMaintTab('overview')}>
                Cancel
              </Button>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Bulk Actions — wired to real mutations ────────────── */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BulkActionsView() {
  const accent = getAccent('provider_tenants');
  const tenantsQuery = useProviderTenants({});
  const tenants = (tenantsQuery.data ?? []) as TenantRecord[];
  const bulkUpdate = useBulkUpdateTenantStatus();
  const exportMutation = useExportTenants();
  const importMutation = useStartProviderDataImport();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [targetStatus, setTargetStatus] = useState<string>('ACTIVE');

  const filtered = filterStatus === 'ALL' ? tenants : tenants.filter((t) => t.status === filterStatus);
  const toggleId = (id: string) => setSelectedIds((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelectedIds(new Set(filtered.map((t) => t.id)));
  const clearAll = () => setSelectedIds(new Set());

  const handleBulkAction = () => {
    if (selectedIds.size === 0) return;
    const reason = reasonPrompt(`Bulk status change to ${targetStatus}`);
    if (!reason) return;
    bulkUpdate.mutate(
      { tenantIds: Array.from(selectedIds), nextStatus: targetStatus, reason },
      { onSuccess: () => clearAll() },
    );
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={ClipboardList} title="Bulk Actions" description="Mass operations across tenants" accent={accent} />

      <div className="grid gap-3 md:grid-cols-3">
        <Panel title="Bulk Import" accentBorder="border-indigo-500/20">
          <div className="flex flex-col items-center gap-3 py-4">
            <Upload className="size-8 text-indigo-400" />
            <p className="text-xs text-muted-foreground">Upload CSV to create multiple tenants</p>
            <Button size="sm" className="h-8 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30" disabled={importMutation.isPending} onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = () => {
                const file = input.files?.[0];
                if (!file) return;
                const reason = reasonPrompt('Bulk import tenants from CSV');
                if (!reason) return;
                importMutation.mutate({ type: 'CSV', config: { fileName: file.name, size: file.size }, reason });
              };
              input.click();
            }}>
              {importMutation.isPending ? <RefreshCw className="mr-1 size-3 animate-spin" /> : <Upload className="mr-1 size-3" />}Upload CSV
            </Button>
          </div>
        </Panel>

        <Panel title="Bulk Export" accentBorder="border-indigo-500/20">
          <div className="flex flex-col items-center gap-3 py-4">
            <Download className="size-8 text-indigo-400" />
            <p className="text-xs text-muted-foreground">Export tenant data to CSV/JSON</p>
            <div className="flex gap-1.5">
              <Button size="sm" className="h-8 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30" onClick={() => exportMutation.mutate({ format: 'CSV' })} disabled={exportMutation.isPending}>
                {exportMutation.isPending ? <RefreshCw className="mr-1 size-3 animate-spin" /> : <Download className="mr-1 size-3" />}CSV
              </Button>
              <Button size="sm" className="h-8 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30" onClick={() => exportMutation.mutate({ format: 'JSON' })} disabled={exportMutation.isPending}>
                <Download className="mr-1 size-3" />JSON
              </Button>
            </div>
          </div>
        </Panel>

        <Panel title="Bulk Status Change" accentBorder="border-indigo-500/20">
          <div className="flex flex-col items-center gap-3 py-4">
            <Filter className="size-8 text-indigo-400" />
            <p className="text-xs text-muted-foreground">{selectedIds.size} tenant{selectedIds.size !== 1 ? 's' : ''} selected</p>
            <div className="flex gap-1.5">
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                className="h-8 rounded-lg border border-border bg-muted/80 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="ACTIVE">Set Active</option>
                <option value="SUSPENDED">Suspend</option>
                <option value="TRIAL">Trial</option>
              </select>
              <Button size="sm" className="h-8 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30" onClick={handleBulkAction} disabled={selectedIds.size === 0 || bulkUpdate.isPending}>
                {bulkUpdate.isPending ? <RefreshCw className="mr-1 size-3 animate-spin" /> : null}Apply
              </Button>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Select Tenants" subtitle={`${selectedIds.size} of ${filtered.length} selected`} accentBorder="border-indigo-500/20" action={
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); clearAll(); }}
            className="h-7 rounded-lg border border-border bg-muted/80 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="ALL">All Statuses</option>
            <option value="TRIAL">Trial</option>
            <option value="ACTIVE">Active</option>
            <option value="PAYMENT_DUE">Payment Due</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <Button size="sm" className="h-7 text-[10px] bg-muted text-foreground hover:bg-muted/80" onClick={selectedIds.size === filtered.length ? clearAll : selectAll}>
            {selectedIds.size === filtered.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>
      }>
        <div className="space-y-1 max-h-100 overflow-y-auto">
          {filtered.map((t) => (
            <label key={t.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-xs cursor-pointer transition-colors ${
              selectedIds.has(t.id) ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-border/60 bg-muted/50 hover:bg-muted/60'
            }`}>
              <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleId(t.id)} className="size-3.5 rounded accent-indigo-500" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{t.name}</p>
                <p className="text-muted-foreground">{t.domain}</p>
              </div>
              <StatusBadge status={t.status} />
              <span className="text-muted-foreground">{t.activeStudents + t.activeTeachers + t.activeParents} users</span>
            </label>
          ))}
          {filtered.length === 0 && <p className="text-xs text-muted-foreground py-2">No tenants match the filter.</p>}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Per-Tenant User Management — DataTable + breakdown ── */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TenantUsersView() {
  const tenantsQuery = useProviderTenants({});
  const tenants = (tenantsQuery.data ?? []) as TenantRecord[];
  const accent = getAccent('provider_tenants');
  const totalStudents = tenants.reduce((s, t) => s + t.activeStudents, 0);
  const totalTeachers = tenants.reduce((s, t) => s + t.activeTeachers, 0);
  const totalParents = tenants.reduce((s, t) => s + t.activeParents, 0);
  const totalUsers = totalStudents + totalTeachers + totalParents;
  const avgPerTenant = tenants.length > 0 ? Math.round(totalUsers / tenants.length) : 0;
  const maxTenant = tenants.length > 0 ? [...tenants].sort((a, b) => (b.activeStudents + b.activeTeachers + b.activeParents) - (a.activeStudents + a.activeTeachers + a.activeParents))[0] : null;

  const columns: ColumnDef<TenantRecord>[] = useMemo(() => [
    { key: 'name', label: 'Tenant', render: (t) => (
      <div className="min-w-0">
        <p className="font-semibold text-foreground truncate">{t.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{t.domain}</p>
      </div>
    )},
    { key: 'students', label: 'Students', render: (t) => <span className="text-blue-600 dark:text-blue-300 font-bold">{t.activeStudents}</span> },
    { key: 'teachers', label: 'Teachers', render: (t) => <span className="text-violet-600 dark:text-violet-300 font-bold">{t.activeTeachers}</span> },
    { key: 'parents', label: 'Parents', render: (t) => <span className="text-emerald-600 dark:text-emerald-300 font-bold">{t.activeParents}</span> },
    { key: 'total', label: 'Total', render: (t) => <span className="font-bold text-foreground">{t.activeStudents + t.activeTeachers + t.activeParents}</span> },
    { key: 'distribution', label: 'Distribution', render: (t) => {
      const total = t.activeStudents + t.activeTeachers + t.activeParents;
      if (total === 0) return <span className="text-muted-foreground/70 text-[10px]">No users</span>;
      return (
        <div className="flex h-1.5 w-20 rounded-full overflow-hidden gap-px">
          {t.activeStudents > 0 && <div className="bg-blue-500 rounded-full" style={{ width: `${(t.activeStudents / total) * 100}%` }} />}
          {t.activeTeachers > 0 && <div className="bg-violet-500 rounded-full" style={{ width: `${(t.activeTeachers / total) * 100}%` }} />}
          {t.activeParents > 0 && <div className="bg-emerald-500 rounded-full" style={{ width: `${(t.activeParents / total) * 100}%` }} />}
        </div>
      );
    }},
    { key: 'plan', label: 'Plan', render: (t) => <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{t.planCode}</span> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
  ], []);

  return (
    <SectionShell>
      <SectionPageHeader icon={Users} title="Per-Tenant User Management" description="User counts, roles, and access across all tenants" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Total Users" value={String(totalUsers)} sub="All tenants" gradient="from-indigo-500/12 via-indigo-400/6 to-transparent" borderAccent="border-indigo-500/20" />
        <StatCard label="Students" value={String(totalStudents)} sub={`${totalUsers > 0 ? Math.round((totalStudents / totalUsers) * 100) : 0}% of total`} gradient="from-blue-500/12 via-blue-400/6 to-transparent" borderAccent="border-blue-500/20" />
        <StatCard label="Teachers" value={String(totalTeachers)} sub={`${totalUsers > 0 ? Math.round((totalTeachers / totalUsers) * 100) : 0}% of total`} gradient="from-violet-500/12 via-violet-400/6 to-transparent" borderAccent="border-violet-500/20" />
        <StatCard label="Parents" value={String(totalParents)} sub={`${totalUsers > 0 ? Math.round((totalParents / totalUsers) * 100) : 0}% of total`} gradient="from-emerald-500/12 via-emerald-400/6 to-transparent" borderAccent="border-emerald-500/20" />
        <StatCard label="Avg per Tenant" value={String(avgPerTenant)} sub="Users" gradient="from-sky-500/12 via-sky-400/6 to-transparent" borderAccent="border-sky-500/20" />
        <StatCard label="Largest" value={maxTenant ? String(maxTenant.activeStudents + maxTenant.activeTeachers + maxTenant.activeParents) : '0'} sub={maxTenant?.name ?? '—'} gradient="from-amber-500/12 via-amber-400/6 to-transparent" borderAccent="border-amber-500/20" />
      </div>

      {/* Global distribution bar */}
      {totalUsers > 0 && (
        <div className="rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Global User Distribution</p>
          <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
            <div className="bg-blue-500 rounded-l-full flex items-center justify-center" style={{ width: `${(totalStudents / totalUsers) * 100}%` }}>
              {totalStudents / totalUsers > 0.1 && <span className="text-[9px] font-bold text-white">{Math.round((totalStudents / totalUsers) * 100)}% S</span>}
            </div>
            <div className="bg-violet-500 flex items-center justify-center" style={{ width: `${(totalTeachers / totalUsers) * 100}%` }}>
              {totalTeachers / totalUsers > 0.1 && <span className="text-[9px] font-bold text-white">{Math.round((totalTeachers / totalUsers) * 100)}% T</span>}
            </div>
            <div className="bg-emerald-500 rounded-r-full flex items-center justify-center" style={{ width: `${(totalParents / totalUsers) * 100}%` }}>
              {totalParents / totalUsers > 0.1 && <span className="text-[9px] font-bold text-white">{Math.round((totalParents / totalUsers) * 100)}% P</span>}
            </div>
          </div>
        </div>
      )}

      <DataTable
        data={tenants}
        columns={columns}
        rowKey={(t) => t.id}
        searchPlaceholder="Search tenants…"
        searchFn={(t, q) => t.name.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q) || t.planCode.toLowerCase().includes(q)}
      />
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Tenant Feature Flags — per-tenant toggles ─────────── */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TenantFlagsView() {
  const accent = getAccent('provider_tenants');
  const tenantsQuery = useProviderTenants({});
  const tenants = (tenantsQuery.data ?? []) as TenantRecord[];
  const toggleModule = useToggleTenantModule();
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);

  const flags = [
    { key: 'ai_assistant', label: 'AI Teaching Assistant', description: 'AI-powered tutoring, question answering, and content generation', moduleCode: 'AI_ASSISTANT' },
    { key: 'advanced_analytics', label: 'Advanced Analytics', description: 'Enhanced reporting dashboards, predictive insights, and data exports', moduleCode: 'ANALYTICS' },
    { key: 'parent_messenger', label: 'Parent Messenger', description: 'Direct school-to-parent messaging with read receipts', moduleCode: 'COMMUNICATION' },
    { key: 'video_conferencing', label: 'Video Conferencing', description: 'Built-in video class support with recording', moduleCode: 'LMS' },
    { key: 'custom_branding', label: 'Custom Branding', description: 'White-label theming, custom logos, and domain branding per tenant', moduleCode: 'BRANDING' },
    { key: 'sso_integration', label: 'SSO Integration', description: 'SAML/OIDC single sign-on for enterprise tenants', moduleCode: 'SSO' },
  ];

  const getFlagStats = (moduleCode: string) => {
    const enabled = tenants.filter((t) => t.modules.includes(moduleCode)).length;
    return { enabled, total: tenants.length, pct: tenants.length > 0 ? Math.round((enabled / tenants.length) * 100) : 0 };
  };

  const globalActive = flags.filter((f) => getFlagStats(f.moduleCode).enabled === getFlagStats(f.moduleCode).total && getFlagStats(f.moduleCode).total > 0).length;
  const partialRollout = flags.filter((f) => { const s = getFlagStats(f.moduleCode); return s.enabled > 0 && s.enabled < s.total; }).length;

  return (
    <SectionShell>
      <SectionPageHeader icon={Flag} title="Feature Flags" description="Per-tenant feature toggles and rollout control" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Feature Flags" value={String(flags.length)} sub="Defined" gradient="from-indigo-500/12 via-indigo-400/6 to-transparent" borderAccent="border-indigo-500/20" />
        <StatCard label="Global Active" value={String(globalActive)} sub="Fully rolled out" gradient="from-emerald-500/12 via-emerald-400/6 to-transparent" borderAccent="border-emerald-500/20" />
        <StatCard label="Partial Rollout" value={String(partialRollout)} sub="In progress" gradient="from-amber-500/12 via-amber-400/6 to-transparent" borderAccent="border-amber-500/20" />
        <StatCard label="Tenants" value={String(tenants.length)} sub="Total" gradient="from-sky-500/12 via-sky-400/6 to-transparent" borderAccent="border-sky-500/20" />
      </div>
      <Panel title="Feature Flag Registry" subtitle={`${flags.length} flags · Click to expand per-tenant controls`} accentBorder="border-indigo-500/20">
        <div className="space-y-2">
          {flags.map((flag) => {
            const stats = getFlagStats(flag.moduleCode);
            const isExpanded = expandedFlag === flag.key;
            return (
              <div key={flag.key} className="rounded-lg border border-border/60 bg-muted/50 overflow-hidden">
                <button
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5 text-xs text-left hover:bg-muted/70 transition-colors"
                  onClick={() => setExpandedFlag(isExpanded ? null : flag.key)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{flag.label}</span>
                      <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">{flag.moduleCode}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">{flag.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`font-bold ${stats.enabled === stats.total && stats.total > 0 ? 'text-emerald-600 dark:text-emerald-300' : stats.enabled > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-muted-foreground'}`}>
                      {stats.enabled}/{stats.total}
                    </span>
                    <div className="h-1.5 w-20 rounded-full bg-muted">
                      <div className={`h-full rounded-full ${stats.pct === 100 ? 'bg-emerald-500' : stats.pct > 0 ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} style={{ width: `${stats.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{stats.pct}%</span>
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-border px-3 py-2 bg-muted/30 max-h-75 overflow-y-auto">
                    <div className="space-y-1">
                      {tenants.map((t) => {
                        const enabled = t.modules.includes(flag.moduleCode);
                        return (
                          <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs hover:bg-muted/60">
                            <div className="flex items-center gap-2 min-w-0">
                              <StatusBadge status={t.status} />
                              <span className="text-foreground truncate font-medium">{t.name}</span>
                              <span className="text-muted-foreground/70 text-[10px] truncate">{t.domain}</span>
                            </div>
                            <Switch
                              checked={enabled}
                              onCheckedChange={(checked: boolean) => toggleModule.mutate({ tenantId: t.id, module: flag.moduleCode, enabled: checked, reason: `Toggle ${flag.label}` })}
                              disabled={toggleModule.isPending}
                            />
                          </div>
                        );
                      })}
                      {tenants.length === 0 && <p className="text-[10px] text-muted-foreground py-2">No tenants available.</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Tenant Usage Analytics — comprehensive metrics ─────── */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TenantUsageView() {
  const tenantsQuery = useProviderTenants({});
  const tenants = (tenantsQuery.data ?? []) as TenantRecord[];
  const accent = getAccent('provider_tenants');
  const [usageTab, setUsageTab] = useState<'storage' | 'activity' | 'modules'>('storage');

  const totalStorage = tenants.reduce((s, t) => s + t.storageUsedGb, 0);
  const totalLimit = tenants.reduce((s, t) => s + t.storageLimitGb, 0);
  const overThreshold = tenants.filter((t) => t.storageLimitGb > 0 && t.storageUsedGb / t.storageLimitGb > 0.8).length;
  const totalUsers = tenants.reduce((s, t) => s + t.activeStudents + t.activeTeachers + t.activeParents, 0);
  const totalModules = tenants.reduce((s, t) => s + t.modules.length, 0);
  const avgModules = tenants.length > 0 ? (totalModules / tenants.length).toFixed(1) : '0';

  // Module usage frequency
  const moduleFrequency = useMemo(() => {
    const freq = new Map<string, number>();
    for (const t of tenants) {
      for (const m of t.modules) freq.set(m, (freq.get(m) ?? 0) + 1);
    }
    return Array.from(freq.entries()).sort(([, a], [, b]) => b - a);
  }, [tenants]);

  // Activity sorting: tenants sorted by recency
  const byActivity = useMemo(() => [...tenants].sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime()), [tenants]);
  const inactiveTenants = tenants.filter((t) => {
    const daysSince = (Date.now() - new Date(t.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 14;
  });

  return (
    <SectionShell>
      <SectionPageHeader icon={Gauge} title="Tenant Usage Analytics" description="Storage, activity, modules, and resource consumption" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Storage Used" value={`${totalStorage.toFixed(1)} GB`} sub={`of ${totalLimit} GB total`} gradient="from-blue-500/12 via-blue-400/6 to-transparent" borderAccent="border-blue-500/20" />
        <StatCard label="Utilization" value={totalLimit > 0 ? `${Math.round((totalStorage / totalLimit) * 100)}%` : '0%'} sub="Global usage" gradient="from-violet-500/12 via-violet-400/6 to-transparent" borderAccent="border-violet-500/20" />
        <StatCard label="Near Limit" value={String(overThreshold)} sub=">80% storage" gradient="from-amber-500/12 via-amber-400/6 to-transparent" borderAccent="border-amber-500/20" />
        <StatCard label="Total Users" value={String(totalUsers)} sub="All tenants" gradient="from-indigo-500/12 via-indigo-400/6 to-transparent" borderAccent="border-indigo-500/20" />
        <StatCard label="Avg Modules" value={String(avgModules)} sub="Per tenant" gradient="from-sky-500/12 via-sky-400/6 to-transparent" borderAccent="border-sky-500/20" />
        <StatCard label="Inactive" value={String(inactiveTenants.length)} sub=">14 days" gradient="from-red-500/12 via-red-400/6 to-transparent" borderAccent="border-red-500/20" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {(['storage', 'activity', 'modules'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setUsageTab(tab)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors capitalize ${
              usageTab === tab ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Storage tab */}
      {usageTab === 'storage' && (
        <Panel title="Storage Usage by Tenant" subtitle="Sorted by utilization" accentBorder="border-indigo-500/20">
          <div className="space-y-1.5">
            {[...tenants].sort((a, b) => (b.storageLimitGb > 0 ? b.storageUsedGb / b.storageLimitGb : 0) - (a.storageLimitGb > 0 ? a.storageUsedGb / a.storageLimitGb : 0)).map((t) => {
              const pct = t.storageLimitGb > 0 ? (t.storageUsedGb / t.storageLimitGb) * 100 : 0;
              return (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{t.name}</p>
                    <p className="text-muted-foreground text-[10px]">{t.planCode} · {t.activeStudents + t.activeTeachers + t.activeParents} users · Last: {relativeTime(t.lastLoginAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-foreground/80 text-[11px]">{t.storageUsedGb}/{t.storageLimitGb} GB</span>
                    <div className="h-2 w-28 rounded-full bg-muted">
                      <div className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-sky-500'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <span className={`w-10 text-right font-mono text-[11px] font-bold ${pct > 90 ? 'text-red-300' : pct > 70 ? 'text-amber-300' : 'text-sky-300'}`}>{Math.round(pct)}%</span>
                  </div>
                </div>
              );
            })}
            {tenants.length === 0 && <EmptyState icon={HardDrive} title="No Storage Data" description="Tenant storage data will appear here." />}
          </div>
        </Panel>
      )}

      {/* Activity tab */}
      {usageTab === 'activity' && (
        <div className="space-y-3">
          {inactiveTenants.length > 0 && (
            <Panel title="Inactive Tenants" subtitle={`${inactiveTenants.length} tenants with no login >14 days`} accentBorder="border-red-500/20">
              <div className="space-y-1.5">
                {inactiveTenants.sort((a, b) => new Date(a.lastLoginAt).getTime() - new Date(b.lastLoginAt).getTime()).map((t) => {
                  const daysSince = Math.round((Date.now() - new Date(t.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-red-500/15 bg-muted/50 px-3 py-2 text-xs">
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-muted-foreground">{t.domain} · {t.planCode} · {t.activeStudents + t.activeTeachers + t.activeParents} users</p>
                      </div>
                      <span className="text-red-300 font-bold shrink-0">{daysSince}d ago</span>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}
          <Panel title="Recent Activity" subtitle="All tenants by last login" accentBorder="border-indigo-500/20">
            <div className="space-y-1.5">
              {byActivity.map((t) => (
                <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">{t.name}</p>
                    <p className="text-muted-foreground text-[10px]">{t.domain}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={t.status} />
                    <span className="text-muted-foreground text-[10px]">{relativeTime(t.lastLoginAt)}</span>
                  </div>
                </div>
              ))}
              {tenants.length === 0 && <EmptyState icon={Activity} title="No Activity Data" description="Login activity will appear here." />}
            </div>
          </Panel>
        </div>
      )}

      {/* Modules tab */}
      {usageTab === 'modules' && (
        <Panel title="Module Adoption" subtitle={`${moduleFrequency.length} unique modules across ${tenants.length} tenants`} accentBorder="border-indigo-500/20">
          <div className="space-y-2">
            {moduleFrequency.map(([mod, count]) => {
              const pct = tenants.length > 0 ? Math.round((count / tenants.length) * 100) : 0;
              return (
                <div key={mod} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Database className="size-3.5 text-indigo-400" />
                    <span className="font-semibold text-foreground">{mod}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">{count}/{tenants.length} tenants</span>
                    <div className="h-1.5 w-24 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono text-indigo-300 text-[11px] font-bold">{pct}%</span>
                  </div>
                </div>
              );
            })}
            {moduleFrequency.length === 0 && <EmptyState icon={Database} title="No Module Data" description="Module adoption data will appear here." />}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}
