/* ─── ProviderIncidentsSection ─── Queue · Status Page · Maintenance ─── */
import { useState } from 'react';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Loader2,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderModuleData,
  useProviderTenants,
  useCreateProviderIncident,
  useProviderMaintenanceWindows,
  useCreateProviderMaintenanceWindow,
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
    case 'incidents_queue': return <IncidentQueueView />;
    case 'incidents_status_page': return <StatusPageView />;
    case 'incidents_maintenance': return <MaintenanceWindowView />;
    default: return <IncidentQueueView />;
  }
}

/* ── Incident Queue ────────────────────────────────────────── */
function IncidentQueueView() {
  const moduleQuery = useProviderModuleData();
  const tenantsQuery = useProviderTenants({});
  const createIncident = useCreateProviderIncident();

  const [incidentTitle, setIncidentTitle] = useState('');
  const [severity, setSeverity] = useState<'SEV1' | 'SEV2' | 'SEV3' | 'SEV4'>('SEV2');

  const incidents = (moduleQuery.data?.incidents ?? []) as IncidentDTO[];
  const tenants = tenantsQuery.data ?? [];
  const accent = getAccent('provider_incidents');

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');
  const resolvedIncidents = incidents.filter((i) => i.status === 'RESOLVED');

  return (
    <SectionShell>
      <SectionPageHeader icon={AlertTriangle} title="Incident Queue" description="Declare, track and resolve incidents" accent={accent} />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total" value={String(incidents.length)} sub="All-time" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Active" value={String(activeIncidents.length)} sub="Ongoing" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Resolved" value={String(resolvedIncidents.length)} sub="Mitigated" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="MTTR" value={incidents.length > 0 ? '< 2h' : '—'} sub="Mean time to resolve" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      {/* Declare incident */}
      <Panel title="Declare New Incident" accentBorder="border-red-500/20">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input className="h-8 flex-1 border-red-500/30 bg-slate-800 text-xs text-slate-100" placeholder="Incident title…" value={incidentTitle} onChange={(e) => setIncidentTitle(e.target.value)} />
          <div className="flex gap-2">
            <select className="h-8 rounded-md border border-red-500/30 bg-slate-800 px-2 text-xs text-slate-100" value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
              <option value="SEV1">SEV1 — Critical</option>
              <option value="SEV2">SEV2 — Major</option>
              <option value="SEV3">SEV3 — Minor</option>
              <option value="SEV4">SEV4 — Info</option>
            </select>
            <Button size="sm" className="h-8 bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => {
              if (!incidentTitle.trim()) return;
              const reason = reasonPrompt('Declare incident');
              if (!reason) return;
              createIncident.mutate({
                title: incidentTitle,
                severity,
                affectedServices: ['notifications'],
                tenantIds: tenants.slice(0, 2).map((t) => t.id),
                reason,
              });
              setIncidentTitle('');
            }}>
              <AlertTriangle className="mr-1 size-3" />Declare
            </Button>
          </div>
        </div>
      </Panel>

      {/* Active incidents */}
      {activeIncidents.length > 0 && (
        <Panel title="Active Incidents" subtitle={`${activeIncidents.length} ongoing`} accentBorder="border-red-500/20">
          <div className="space-y-2">
            {activeIncidents.map((inc) => (
              <div key={inc.id} className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-red-100">{inc.title}</p>
                    <p className="text-red-300/70">{inc.severity} · Updated {new Date(inc.updatedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inc.status} />
                    <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">LIVE</span>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {inc.affectedServices.map((svc) => (
                    <span key={svc} className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-200">{svc}</span>
                  ))}
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{inc.tenantIds.length} tenant{inc.tenantIds.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Resolved */}
      {resolvedIncidents.length > 0 && (
        <Panel title="Resolved Incidents" subtitle={`${resolvedIncidents.length} mitigated`} accentBorder="border-emerald-500/20">
          <div className="space-y-2">
            {resolvedIncidents.map((inc) => (
              <div key={inc.id} className="rounded-lg border border-emerald-500/15 bg-slate-800/60 px-3 py-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="font-semibold text-slate-100">{inc.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{inc.severity}</span>
                    <StatusBadge status="RESOLVED" />
                  </div>
                </div>
                <p className="text-slate-400">Updated {new Date(inc.updatedAt).toLocaleString()} · {inc.affectedServices.join(', ')}</p>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {incidents.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="All Systems Operational"
          description="No incidents declared. Platform is healthy."
        />
      )}
    </SectionShell>
  );
}

/* ── Status Page ─────────────────────────────────────────────── */
function StatusPageView() {
  const moduleQuery = useProviderModuleData();
  const accent = getAccent('provider_incidents');
  const incidents = (moduleQuery.data?.incidents ?? []) as IncidentDTO[];
  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  const services = [
    { name: 'Authentication', status: 'OPERATIONAL' },
    { name: 'Student Portal', status: 'OPERATIONAL' },
    { name: 'Teacher Dashboard', status: activeIncidents.some((i) => i.affectedServices.includes('teacher')) ? 'DEGRADED' : 'OPERATIONAL' },
    { name: 'Notifications', status: activeIncidents.some((i) => i.affectedServices.includes('notifications')) ? 'DEGRADED' : 'OPERATIONAL' },
    { name: 'Billing Engine', status: 'OPERATIONAL' },
    { name: 'File Storage', status: 'OPERATIONAL' },
    { name: 'API Gateway', status: 'OPERATIONAL' },
    { name: 'WebSocket Server', status: 'OPERATIONAL' },
  ];

  return (
    <SectionShell>
      <SectionPageHeader icon={Radio} title="Status Page" description="Public-facing service status overview" accent={accent} />

      <Panel title="Service Status" subtitle="Current platform health" accentBorder="border-red-500/20">
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((svc) => (
            <div key={svc.name} className={`rounded-xl border p-3 ${svc.status === 'OPERATIONAL' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${svc.status === 'OPERATIONAL' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                <p className="text-xs font-semibold text-slate-100">{svc.name}</p>
              </div>
              <p className={`mt-1 text-[10px] ${svc.status === 'OPERATIONAL' ? 'text-emerald-300' : 'text-red-300'}`}>
                {svc.status}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Uptime bars */}
      <Panel title="90-Day Uptime" accentBorder="border-emerald-500/20">
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center gap-3 text-xs">
              <span className="w-32 shrink-0 text-slate-300">{svc.name}</span>
              <div className="flex flex-1 gap-px">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className={`h-4 flex-1 rounded-[1px] ${i === 14 && svc.status !== 'OPERATIONAL' ? 'bg-red-500/60' : 'bg-emerald-500/40'}`} />
                ))}
              </div>
              <span className="text-emerald-300 font-mono w-16 text-right">99.9%</span>
            </div>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Maintenance Windows ─────────────────────────────────────── */
function MaintenanceWindowView() {
  const accent = getAccent('provider_incidents');
  const { data: maintenanceWindows, isLoading } = useProviderMaintenanceWindows();
  const createWindow = useCreateProviderMaintenanceWindow();
  const windowsList = maintenanceWindows ?? [];

  const [showForm, setShowForm] = useState(false);
  const [mwTitle, setMwTitle] = useState('');
  const [mwStart, setMwStart] = useState('');
  const [mwEnd, setMwEnd] = useState('');
  const [mwServices, setMwServices] = useState('');

  return (
    <SectionShell>
      <SectionPageHeader icon={Calendar} title="Maintenance Windows" description="Scheduled downtime and maintenance calendar" accent={accent} actions={
        <Button size="sm" className="h-7 bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => setShowForm((p) => !p)}>+ Schedule Maintenance</Button>
      } />

      {showForm && (
        <Panel title="Schedule Maintenance Window" accentBorder="border-amber-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Title" value={mwTitle} onChange={(e) => setMwTitle(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" type="datetime-local" value={mwStart} onChange={(e) => setMwStart(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" type="datetime-local" value={mwEnd} onChange={(e) => setMwEnd(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Services (comma-sep)" value={mwServices} onChange={(e) => setMwServices(e.target.value)} />
            <Button size="sm" className="h-8 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" disabled={createWindow.isPending} onClick={() => {
              if (!mwTitle.trim() || !mwStart || !mwEnd) return;
              const reason = reasonPrompt('Schedule maintenance');
              if (!reason) return;
              createWindow.mutate({
                title: mwTitle,
                startAt: new Date(mwStart).toISOString(),
                endAt: new Date(mwEnd).toISOString(),
                affectedServices: mwServices.split(',').map((s) => s.trim()).filter(Boolean),
                notify: true,
                reason,
              });
              setShowForm(false); setMwTitle(''); setMwStart(''); setMwEnd(''); setMwServices('');
            }}>{createWindow.isPending ? 'Scheduling…' : 'Schedule'}</Button>
          </div>
        </Panel>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-orange-400" /></div>
      ) : windowsList.length === 0 ? (
        <EmptyState icon={Calendar} title="No Maintenance Windows" description="No scheduled maintenance windows." />
      ) : (
        <div className="grid gap-3">
          {windowsList.map((mw) => (
            <Panel key={mw.id} title={mw.title} subtitle={`${mw.affectedServices.join(', ')}`} accentBorder={mw.status === 'COMPLETED' ? 'border-emerald-500/20' : 'border-amber-500/20'}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="text-slate-300">
                    <Calendar className="mr-1 inline size-3" />
                    {new Date(mw.startAt).toLocaleString()} — {new Date(mw.endAt).toLocaleString()}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {mw.affectedServices.map((svc) => (
                      <span key={svc} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{svc}</span>
                    ))}
                    {mw.notified && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">Notified</span>}
                  </div>
                </div>
                <StatusBadge status={mw.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'} />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
