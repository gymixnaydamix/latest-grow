/* ─── ProviderAuditSection ─── Event Stream · Exports · Access Reviews ─── */
import { useState, useMemo } from 'react';
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  Shield,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderAudit, useProviderAuditExports, useCreateProviderAuditExport } from '@/hooks/api/use-provider-console';
import type { AuditEventDTO } from '@root/types';
import {
  EmptyState,
  Panel,
  SectionPageHeader,
  SectionShell,
  StatCard,
  getAccent,
  reasonPrompt,
} from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderAuditSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'audit_stream':  return <EventStreamView />;
    case 'audit_exports': return <AuditExportsView />;
    case 'audit_access':  return <AccessReviewsView />;
    default: return <EventStreamView />;
  }
}

/* ── Event Stream ──────────────────────────────────────────── */
function EventStreamView() {
  const auditQuery = useProviderAudit();
  const accent = getAccent('provider_audit');
  const events = (auditQuery.data ?? []) as AuditEventDTO[];

  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const actionTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.action));
    return ['all', ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch = !searchTerm ||
        e.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.reason && e.reason.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesAction = actionFilter === 'all' || e.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [events, searchTerm, actionFilter]);

  const actionCounts = useMemo(() => {
    const map = new Map<string, number>();
    events.forEach((e) => map.set(e.action, (map.get(e.action) ?? 0) + 1));
    return map;
  }, [events]);

  return (
    <SectionShell>
      <SectionPageHeader icon={FileText} title="Audit Event Stream" description="Real-time activity log with full traceability" accent={accent} />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Events" value={String(events.length)} sub="All-time" gradient="from-orange-500/10 to-orange-500/5" />
        <StatCard label="Actions" value={String(actionCounts.size)} sub="Unique types" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Actors" value={String(new Set(events.map((e) => e.actorEmail)).size)} sub="Unique users" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="With Reason" value={String(events.filter((e) => e.reason).length)} sub="Documented" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
          <Input className="h-8 pl-7 border-orange-500/30 bg-slate-800 text-xs text-slate-100" placeholder="Search events…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="h-8 rounded-md border border-orange-500/30 bg-slate-800 px-2 text-xs text-slate-100" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          {actionTypes.map((a) => (
            <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 && (
        <EmptyState icon={FileText} title="No Audit Events" description={searchTerm || actionFilter !== 'all' ? 'No events match your filters' : 'Audit events will appear here as actions are performed'} />
      )}

      {/* Event list */}
      {filtered.length > 0 && (
        <Panel title="Events" subtitle={`${filtered.length} of ${events.length}`} accentBorder="border-orange-500/20">
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {filtered.slice(0, 100).map((evt) => (
              <div key={evt.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-start gap-x-3 gap-y-1 rounded-lg bg-slate-800/60 px-3 py-2 text-xs hover:bg-slate-800/80 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-orange-200">{evt.action}</span>
                    {evt.targetId && <span className="text-slate-500 font-mono text-[10px]">{evt.targetId.slice(0, 12)}</span>}
                  </div>
                  {evt.reason && <p className="mt-0.5 text-slate-400 italic">"{evt.reason}"</p>}
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <User className="size-3 text-slate-500" />
                  <span>{evt.actorEmail}</span>
                </div>
                <span className="text-slate-500 tabular-nums whitespace-nowrap">{new Date(evt.createdAt).toLocaleString()}</span>
              </div>
            ))}
            {filtered.length > 100 && (
              <p className="text-center text-xs text-slate-500 py-2">Showing first 100 of {filtered.length} events</p>
            )}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Audit Exports ─────────────────────────────────────────── */
function AuditExportsView() {
  const accent = getAccent('provider_audit');
  const { data: pastExports, isLoading } = useProviderAuditExports();
  const exportsList = pastExports ?? [];
  const createExport = useCreateProviderAuditExport();
  const [ranges, setRanges] = useState<Record<string, string>>({ CSV: '30', JSON: '30', 'PDF Report': '30' });

  const exportFormats = [
    { name: 'CSV', icon: FileText, description: 'Comma-separated values for spreadsheet analysis' },
    { name: 'JSON', icon: FileText, description: 'Structured data for programmatic access' },
    { name: 'PDF Report', icon: FileText, description: 'Formatted compliance report with charts' },
  ];

  const handleExport = (format: string) => {
    const reason = reasonPrompt('Export audit data');
    if (!reason) return;
    createExport.mutate({ format: format.replace(' Report', '').toUpperCase() as 'CSV' | 'JSON' | 'PDF', dateRange: `${Number(ranges[format] ?? 30)}d`, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Download} title="Audit Exports" description="Export audit logs for compliance and analysis" accent={accent} />

      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        {exportFormats.map((fmt) => (
          <Panel key={fmt.name} title={fmt.name} accentBorder="border-orange-500/20">
            <div className="space-y-2 text-xs">
              <p className="text-slate-400">{fmt.description}</p>
              <div className="flex gap-2">
                <select className="h-7 flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={ranges[fmt.name]} onChange={(e) => setRanges((p) => ({ ...p, [fmt.name]: e.target.value }))}>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last 12 months</option>
                  <option value="0">All time</option>
                </select>
                <Button size="sm" className="h-7 bg-orange-500/20 text-orange-100 hover:bg-orange-500/30" onClick={() => handleExport(fmt.name)} disabled={createExport.isPending}>
                  {createExport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Download className="mr-1 size-3" />}Export
                </Button>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Past Exports" accentBorder="border-slate-600/30">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-purple-400" /></div>
        ) : exportsList.length === 0 ? (
          <EmptyState icon={Download} title="No Past Exports" description="Audit export history will appear here." />
        ) : (
          <div className="space-y-1">
            {exportsList.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
                <div>
                  <p className="text-slate-100">{exp.name} — {exp.format}</p>
                  <p className="text-slate-400">{new Date(exp.createdAt).toLocaleDateString()} · {exp.size} · {exp.records} records</p>
                </div>
                {exp.downloadUrl ? (
                  <a href={exp.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center h-6 rounded-md bg-slate-700 px-2 text-slate-200 hover:bg-slate-600 text-[10px]">
                    <Download className="mr-1 size-3" />Download
                  </a>
                ) : (
                  <Button size="sm" className="h-6 bg-slate-700 text-slate-200 text-[10px]" disabled>
                    <Loader2 className="mr-1 size-3 animate-spin" />Preparing
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Access Reviews ────────────────────────────────────────── */
function AccessReviewsView() {
  const auditQuery = useProviderAudit();
  const accent = getAccent('provider_audit');
  const events = (auditQuery.data ?? []) as AuditEventDTO[];

  const accessEvents = events.filter((e) => e.action.includes('LOGIN') || e.action.includes('ACCESS') || e.action.includes('AUTH'));

  // Group by actor
  const actorMap = new Map<string, AuditEventDTO[]>();
  events.forEach((e) => {
    const arr = actorMap.get(e.actorEmail) ?? [];
    arr.push(e);
    actorMap.set(e.actorEmail, arr);
  });

  return (
    <SectionShell>
      <SectionPageHeader icon={Shield} title="Access Reviews" description="User access patterns and privilege auditing" accent={accent} />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Unique Actors" value={String(actorMap.size)} sub="Users with activity" gradient="from-orange-500/10 to-orange-500/5" />
        <StatCard label="Access Events" value={String(accessEvents.length)} sub="Auth-related" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Avg Actions/User" value={actorMap.size > 0 ? String(Math.round(events.length / actorMap.size)) : '—'} sub="Activity level" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      <Panel title="Activity by User" subtitle={`${actorMap.size} actors`} accentBorder="border-orange-500/20">
        <div className="space-y-2">
          {Array.from(actorMap.entries())
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 20)
            .map(([actor, actorEvents]) => (
              <div key={actor} className="rounded-lg border border-slate-700/40 bg-slate-800/60 p-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-full bg-orange-500/20">
                      <User className="size-3 text-orange-300" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{actor}</p>
                      <p className="text-slate-400">{actorEvents.length} action{actorEvents.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(actorEvents.map((e) => e.action))).slice(0, 4).map((action) => (
                      <span key={action} className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] text-slate-300">{action}</span>
                    ))}
                    {new Set(actorEvents.map((e) => e.action)).size > 4 && (
                      <span className="rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] text-slate-400">+{new Set(actorEvents.map((e) => e.action)).size - 4} more</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                  <Eye className="size-3" />
                  Last active: {new Date(actorEvents[actorEvents.length - 1].createdAt).toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </Panel>
    </SectionShell>
  );
}
