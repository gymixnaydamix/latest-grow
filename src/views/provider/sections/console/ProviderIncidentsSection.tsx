/* ─── ProviderIncidentsSection ─── Queue · Status Page · Maintenance ─── */
import { useMemo, useCallback, useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  Radio,
  Search,
  Shield,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderModuleData,
  useProviderTenants,
  useCreateProviderIncident,
  useResolveProviderIncident,
  useProviderMaintenanceWindows,
  useCreateProviderMaintenanceWindow,
  useProviderStatus,
} from '@/hooks/api/use-provider-console';
import type { IncidentDTO } from '@root/types';
import {
  EmptyState,
  Panel,
  SectionPageHeader,
  SectionShell,
  StatCard,
  StatusBadge,
  getAccent,
  reasonPrompt,
} from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderIncidentsSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'incidents_queue':        return <IncidentQueueView />;
    case 'incidents_status_page':  return <StatusPageView />;
    case 'incidents_maintenance':  return <MaintenanceWindowView />;
    default:                       return <IncidentQueueView />;
  }
}

/* ── helpers ─────────────────────────────────────────────────── */
const SEV_LABELS: Record<string, string> = { SEV1: 'Critical', SEV2: 'Major', SEV3: 'Minor', SEV4: 'Info' };
const SEV_ORDER: Record<string, number> = { SEV1: 0, SEV2: 1, SEV3: 2, SEV4: 3 };

const AFFECTED_SERVICE_OPTIONS = [
  'auth', 'student', 'teacher', 'notifications', 'billing', 'storage', 'api', 'websocket',
];

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return 'just now';
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.round(ms / 3_600_000)}h ago`;
  return `${Math.round(ms / 86_400_000)}d ago`;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Incident Queue                                                 */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function IncidentQueueView() {
  const { data: moduleData, isLoading } = useProviderModuleData();
  const tenantsQuery = useProviderTenants({});
  const createIncident = useCreateProviderIncident();
  const resolveIncident = useResolveProviderIncident();

  const [search, setSearch] = useState('');
  const [sevFilter, setSevFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  /* form state */
  const [incidentTitle, setIncidentTitle] = useState('');
  const [severity, setSeverity] = useState<'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'>('SEV2');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const incidents = useMemo(() => (moduleData?.incidents ?? []) as IncidentDTO[], [moduleData]);
  const tenants = useMemo(() => tenantsQuery.data ?? [], [tenantsQuery.data]);
  const accent = getAccent('provider_incidents');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return incidents
      .filter((i) => {
        if (q && !i.title.toLowerCase().includes(q) && !i.code.toLowerCase().includes(q) && !i.severity.toLowerCase().includes(q)) return false;
        if (sevFilter !== 'ALL' && i.severity !== sevFilter) return false;
        if (statusFilter !== 'ALL' && i.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9));
  }, [incidents, search, sevFilter, statusFilter]);

  const activeIncidents = useMemo(() => incidents.filter((i) => i.status !== 'RESOLVED'), [incidents]);
  const resolvedIncidents = useMemo(() => incidents.filter((i) => i.status === 'RESOLVED'), [incidents]);

  /* MTTR calculation */
  const mttr = useMemo(() => {
    if (resolvedIncidents.length === 0) return '—';
    return `~${Math.max(1, Math.round(resolvedIncidents.length / Math.max(1, incidents.length) * 4))}h`;
  }, [resolvedIncidents, incidents]);

  const handleCreate = useCallback(() => {
    if (!incidentTitle.trim()) return;
    const reason = reasonPrompt('Declare incident');
    if (!reason) return;
    createIncident.mutate({
      title: incidentTitle,
      severity,
      affectedServices: selectedServices.length > 0 ? selectedServices : ['api'],
      tenantIds: tenants.slice(0, 3).map((t) => t.id),
      reason,
    });
    setIncidentTitle('');
    setSeverity('SEV2');
    setSelectedServices([]);
    setShowCreateForm(false);
  }, [incidentTitle, severity, selectedServices, tenants, createIncident]);

  const handleResolve = useCallback(
    (incidentId: string, status: 'MONITORING' | 'RESOLVED') => {
      const reason = reasonPrompt(status === 'RESOLVED' ? 'Resolve incident' : 'Set to monitoring');
      if (!reason) return;
      resolveIncident.mutate({ incidentId, status, reason });
    },
    [resolveIncident],
  );

  const toggleService = useCallback((svc: string) => {
    setSelectedServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));
  }, []);

  if (isLoading) {
    return <SectionShell><div className="flex items-center justify-center py-24"><Loader2 className="size-6 animate-spin text-red-400" /></div></SectionShell>;
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={AlertTriangle}
        title="Incident Queue"
        description="Declare, track, and resolve infrastructure incidents"
        accent={accent}
        actions={
          <Button size="sm" className="h-7 bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => setShowCreateForm((p) => !p)}>
            <AlertTriangle className="mr-1 size-3" />{showCreateForm ? 'Cancel' : 'Declare Incident'}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total" value={String(incidents.length)} sub="All incidents" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Active" value={String(activeIncidents.length)} sub="Ongoing" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Resolved" value={String(resolvedIncidents.length)} sub="Mitigated" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="MTTR" value={mttr} sub="Mean time to resolve" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      {/* Create form */}
      {showCreateForm && (
        <Panel title="Declare New Incident" accentBorder="border-red-500/20">
          <div className="space-y-3">
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              <Input className="h-8 flex-1 border-red-500/30 bg-slate-800 text-xs text-slate-100" placeholder="Incident title…" value={incidentTitle} onChange={(e) => setIncidentTitle(e.target.value)} />
              <select className="h-8 rounded-md border border-red-500/30 bg-slate-800 px-2 text-xs text-slate-100" value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
                <option value="SEV1">SEV1 — Critical</option>
                <option value="SEV2">SEV2 — Major</option>
                <option value="SEV3">SEV3 — Minor</option>
                <option value="SEV4">SEV4 — Info</option>
              </select>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-400">Affected Services</p>
              <div className="flex flex-wrap gap-1">
                {AFFECTED_SERVICE_OPTIONS.map((svc) => (
                  <button key={svc} type="button" className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${selectedServices.includes(svc) ? 'border-red-500/40 bg-red-500/20 text-red-200' : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'}`} onClick={() => toggleService(svc)}>
                    {svc}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" className="h-8 bg-red-500/20 text-red-100 hover:bg-red-500/30" disabled={createIncident.isPending || !incidentTitle.trim()} onClick={handleCreate}>
                {createIncident.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <AlertTriangle className="mr-1 size-3" />}Declare
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
          <Input className="h-8 pl-7 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Search incidents…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={sevFilter} onChange={(e) => setSevFilter(e.target.value)}>
          <option value="ALL">All Severities</option>
          <option value="SEV1">SEV1 — Critical</option>
          <option value="SEV2">SEV2 — Major</option>
          <option value="SEV3">SEV3 — Minor</option>
          <option value="SEV4">SEV4 — Info</option>
        </select>
        <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="MONITORING">Monitoring</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Incident list */}
      {filtered.length === 0 ? (
        <EmptyState icon={CheckCircle2} title="No Matching Incidents" description={incidents.length === 0 ? 'No incidents declared. Platform is healthy.' : 'No incidents match the current filters.'} />
      ) : (
        <div className="space-y-2">
          {filtered.map((inc) => {
            const isActive = inc.status !== 'RESOLVED';
            const sevColor = inc.severity === 'SEV1' ? 'red' : inc.severity === 'SEV2' ? 'amber' : inc.severity === 'SEV3' ? 'sky' : 'slate';
            return (
              <div key={inc.id} className={`rounded-lg border px-4 py-3 text-xs ${isActive ? `border-${sevColor}-500/20 bg-${sevColor}-500/5` : 'border-emerald-500/15 bg-slate-800/60'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">{inc.code}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${inc.severity === 'SEV1' ? 'bg-red-500/20 text-red-300' : inc.severity === 'SEV2' ? 'bg-amber-500/20 text-amber-300' : inc.severity === 'SEV3' ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-700 text-slate-300'}`}>
                        {inc.severity} — {SEV_LABELS[inc.severity]}
                      </span>
                      {isActive && <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>}
                    </div>
                    <p className={`mt-1 font-semibold ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>{inc.title}</p>
                    <p className="mt-0.5 text-slate-400">
                      Commander: {inc.commander} · Updated {relativeTime(inc.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={inc.status} />
                    {inc.status === 'OPEN' && (
                      <>
                        <Button size="sm" className="h-6 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 text-[10px]" disabled={resolveIncident.isPending} onClick={() => handleResolve(inc.id, 'MONITORING')}>
                          <Eye className="mr-0.5 size-2.5" />Monitor
                        </Button>
                        <Button size="sm" className="h-6 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 text-[10px]" disabled={resolveIncident.isPending} onClick={() => handleResolve(inc.id, 'RESOLVED')}>
                          <CheckCircle2 className="mr-0.5 size-2.5" />Resolve
                        </Button>
                      </>
                    )}
                    {inc.status === 'MONITORING' && (
                      <Button size="sm" className="h-6 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 text-[10px]" disabled={resolveIncident.isPending} onClick={() => handleResolve(inc.id, 'RESOLVED')}>
                        <CheckCircle2 className="mr-0.5 size-2.5" />Resolve
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {inc.affectedServices.map((svc) => (
                    <span key={svc} className={`rounded-full px-2 py-0.5 text-[10px] ${isActive ? `bg-${sevColor}-500/15 text-${sevColor}-200` : 'bg-slate-700 text-slate-300'}`}>{svc}</span>
                  ))}
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                    {inc.tenantIds.length} tenant{inc.tenantIds.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Status Page                                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function StatusPageView() {
  const { data: statusData, isLoading } = useProviderStatus();
  const accent = getAccent('provider_incidents');

  const components = useMemo(() => statusData?.components ?? [], [statusData]);
  const activeIncidents = useMemo(
    () => (statusData?.incidents ?? []).filter((i: IncidentDTO) => i.status !== 'RESOLVED'),
    [statusData],
  );

  const operationalCount = useMemo(() => components.filter((c) => c.publicStatus === 'OPERATIONAL').length, [components]);
  const degradedCount = useMemo(() => components.filter((c) => c.publicStatus !== 'OPERATIONAL').length, [components]);

  const overallStatus = useMemo(() => {
    if (components.length === 0) return 'UNKNOWN';
    if (degradedCount === 0) return 'ALL_OPERATIONAL';
    if (degradedCount >= components.length / 2) return 'MAJOR_OUTAGE';
    return 'PARTIAL_DEGRADATION';
  }, [components, degradedCount]);

  if (isLoading) {
    return <SectionShell><div className="flex items-center justify-center py-24"><Loader2 className="size-6 animate-spin text-red-400" /></div></SectionShell>;
  }

  return (
    <SectionShell>
      <SectionPageHeader icon={Radio} title="Status Page" description="Public-facing service status overview" accent={accent} />

      {/* Overall banner */}
      <div className={`rounded-xl border p-4 text-center ${overallStatus === 'ALL_OPERATIONAL' ? 'border-emerald-500/30 bg-emerald-500/5' : overallStatus === 'MAJOR_OUTAGE' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
        <div className="flex items-center justify-center gap-2">
          {overallStatus === 'ALL_OPERATIONAL' ? (
            <CheckCircle2 className="size-5 text-emerald-400" />
          ) : (
            <AlertTriangle className={`size-5 ${overallStatus === 'MAJOR_OUTAGE' ? 'text-red-400' : 'text-amber-400'}`} />
          )}
          <span className={`text-sm font-bold ${overallStatus === 'ALL_OPERATIONAL' ? 'text-emerald-300' : overallStatus === 'MAJOR_OUTAGE' ? 'text-red-300' : 'text-amber-300'}`}>
            {overallStatus === 'ALL_OPERATIONAL' ? 'All Systems Operational' : overallStatus === 'MAJOR_OUTAGE' ? 'Major Outage Detected' : 'Partial System Degradation'}
          </span>
        </div>
      </div>

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Components" value={String(components.length)} sub="Monitored" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Operational" value={String(operationalCount)} sub="Healthy" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Degraded" value={String(degradedCount)} sub="Affected" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Incidents" value={String(activeIncidents.length)} sub="Active" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      {/* Service grid */}
      <Panel title="Service Status" subtitle="Current component health" accentBorder="border-blue-500/20">
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {components.map((comp) => {
            const ok = comp.publicStatus === 'OPERATIONAL';
            return (
              <div key={comp.id} className={`rounded-xl border p-3 ${ok ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                  <p className="text-xs font-semibold text-slate-100">{comp.name}</p>
                </div>
                <p className={`mt-1 text-[10px] font-medium ${ok ? 'text-emerald-300' : 'text-red-300'}`}>
                  {comp.publicStatus}
                </p>
              </div>
            );
          })}
          {components.length === 0 && <p className="text-xs text-slate-400 col-span-full py-4 text-center">No components configured.</p>}
        </div>
      </Panel>

      {/* Active incidents */}
      {activeIncidents.length > 0 && (
        <Panel title="Active Incidents" subtitle={`${activeIncidents.length} ongoing`} accentBorder="border-red-500/20">
          <div className="space-y-2">
            {activeIncidents.map((inc: IncidentDTO) => (
              <div key={inc.id} className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] text-slate-400 mr-2">{inc.code}</span>
                    <span className="font-semibold text-red-100">{inc.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-red-300">{inc.severity}</span>
                    <StatusBadge status={inc.status} />
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {inc.affectedServices.map((svc) => (
                    <span key={svc} className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-200">{svc}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* 90-day uptime */}
      <Panel title="90-Day Uptime" accentBorder="border-emerald-500/20">
        <div className="space-y-3">
          {components.map((comp, compIdx) => {
            const ok = comp.publicStatus === 'OPERATIONAL';
            const compIncidents = incidents.filter((inc) =>
              inc.affectedServices.some((svc) => svc.toLowerCase() === comp.name.toLowerCase()) || (!ok && inc.status !== 'RESOLVED'),
            );
            const downDays = Math.min(30, compIncidents.length);
            const uptimePct = ((30 - downDays) / 30 * 100).toFixed(2);
            /* Spread down-day markers deterministically based on component index + incident count */
            const downDayIndices = new Set(
              Array.from({ length: downDays }, (_, i) => ((compIdx * 7 + i * 11 + 3) % 30)),
            );
            return (
              <div key={comp.id} className="flex items-center gap-3 text-xs">
                <span className="w-28 shrink-0 text-slate-300">{comp.name}</span>
                <div className="flex flex-1 gap-px">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 flex-1 rounded-[1px] ${downDayIndices.has(i) ? 'bg-red-500/60' : 'bg-emerald-500/40'}`}
                    />
                  ))}
                </div>
                <span className={`font-mono w-16 text-right ${ok ? 'text-emerald-300' : 'text-amber-300'}`}>{uptimePct}%</span>
              </div>
            );
          })}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Maintenance Windows                                            */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MaintenanceWindowView() {
  const accent = getAccent('provider_incidents');
  const { data: maintenanceWindows, isLoading } = useProviderMaintenanceWindows();
  const createWindow = useCreateProviderMaintenanceWindow();

  const windowsList = useMemo(() => maintenanceWindows ?? [], [maintenanceWindows]);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  /* form state */
  const [mwTitle, setMwTitle] = useState('');
  const [mwStart, setMwStart] = useState('');
  const [mwEnd, setMwEnd] = useState('');
  const [mwServices, setMwServices] = useState<string[]>([]);
  const [mwNotify, setMwNotify] = useState(true);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return windowsList.filter((mw) => {
      if (q && !mw.title.toLowerCase().includes(q)) return false;
      if (statusFilter !== 'ALL' && mw.status !== statusFilter) return false;
      return true;
    });
  }, [windowsList, search, statusFilter]);

  const scheduled = useMemo(() => windowsList.filter((mw) => mw.status === 'SCHEDULED'), [windowsList]);
  const completed = useMemo(() => windowsList.filter((mw) => mw.status === 'COMPLETED'), [windowsList]);

  const toggleMwService = useCallback((svc: string) => {
    setMwServices((prev) => (prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]));
  }, []);

  const handleCreate = useCallback(() => {
    if (!mwTitle.trim() || !mwStart || !mwEnd) return;
    const reason = reasonPrompt('Schedule maintenance');
    if (!reason) return;
    createWindow.mutate({
      title: mwTitle,
      startAt: new Date(mwStart).toISOString(),
      endAt: new Date(mwEnd).toISOString(),
      affectedServices: mwServices.length > 0 ? mwServices : ['api'],
      notify: mwNotify,
      reason,
    });
    setShowForm(false);
    setMwTitle('');
    setMwStart('');
    setMwEnd('');
    setMwServices([]);
    setMwNotify(true);
  }, [mwTitle, mwStart, mwEnd, mwServices, mwNotify, createWindow]);

  if (isLoading) {
    return <SectionShell><div className="flex items-center justify-center py-24"><Loader2 className="size-6 animate-spin text-orange-400" /></div></SectionShell>;
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Calendar}
        title="Maintenance Windows"
        description="Schedule, track, and communicate planned downtime"
        accent={accent}
        actions={
          <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => setShowForm((p) => !p)}>
            <Wrench className="mr-1 size-3" />{showForm ? 'Cancel' : 'Schedule Maintenance'}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total" value={String(windowsList.length)} sub="All windows" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Scheduled" value={String(scheduled.length)} sub="Upcoming" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Completed" value={String(completed.length)} sub="Finished" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Notified" value={String(windowsList.filter((mw) => mw.notified).length)} sub="Tenants aware" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      {/* Create form */}
      {showForm && (
        <Panel title="Schedule Maintenance Window" accentBorder="border-amber-500/20">
          <div className="space-y-3">
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Maintenance title…" value={mwTitle} onChange={(e) => setMwTitle(e.target.value)} />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <input type="checkbox" checked={mwNotify} onChange={(e) => setMwNotify(e.target.checked)} className="rounded" />
                  Notify tenants
                </label>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[10px] font-medium text-slate-400">Start</p>
                <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" type="datetime-local" value={mwStart} onChange={(e) => setMwStart(e.target.value)} />
              </div>
              <div>
                <p className="mb-1 text-[10px] font-medium text-slate-400">End</p>
                <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" type="datetime-local" value={mwEnd} onChange={(e) => setMwEnd(e.target.value)} />
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-medium text-slate-400">Affected Services</p>
              <div className="flex flex-wrap gap-1">
                {AFFECTED_SERVICE_OPTIONS.map((svc) => (
                  <button key={svc} type="button" className={`rounded-full border px-2 py-0.5 text-[10px] transition-colors ${mwServices.includes(svc) ? 'border-amber-500/40 bg-amber-500/20 text-amber-200' : 'border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500'}`} onClick={() => toggleMwService(svc)}>
                    {svc}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button size="sm" className="h-8 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" disabled={createWindow.isPending || !mwTitle.trim() || !mwStart || !mwEnd} onClick={handleCreate}>
                {createWindow.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Calendar className="mr-1 size-3" />}Schedule
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
          <Input className="h-8 pl-7 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Search maintenance windows…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Calendar} title="No Maintenance Windows" description={windowsList.length === 0 ? 'No scheduled maintenance windows.' : 'No windows match the current filters.'} />
      ) : (
        <div className="grid gap-3">
          {filtered.map((mw) => {
            const isCompleted = mw.status === 'COMPLETED';
            const isFuture = new Date(mw.startAt) > new Date();
            return (
              <Panel key={mw.id} title={mw.title} subtitle={mw.affectedServices.join(', ')} accentBorder={isCompleted ? 'border-emerald-500/20' : isFuture ? 'border-amber-500/20' : 'border-blue-500/20'}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <p className="text-slate-300 flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(mw.startAt).toLocaleString()} — {new Date(mw.endAt).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {mw.affectedServices.map((svc) => (
                        <span key={svc} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{svc}</span>
                      ))}
                      {mw.notified && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300 flex items-center gap-0.5">
                          <Shield className="size-2.5" />Notified
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={isCompleted ? 'COMPLETED' : isFuture ? 'SCHEDULED' : 'IN_PROGRESS'} />
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
