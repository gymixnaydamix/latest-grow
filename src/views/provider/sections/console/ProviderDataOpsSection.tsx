/* ─── ProviderDataOpsSection ─── Exports · Imports · Repair · Compat · Backups ─── */
import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cloud,
  Database,
  Download,
  FileText,
  Loader2,
  PlusCircle,
  RefreshCw,
  Search,
  Shield,
  Upload,
  Wrench,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderModuleData,
  useCompleteProviderDataRequest,
  useProviderDataOpsExtras,
  useProviderBackups,
  useStartProviderDataImport,
  useRunProviderRepairJob,
  useCreateProviderBackupSchedule,
  useRestoreProviderSnapshot,
  useTriggerProviderBackup,
  useExecuteProviderRunbook,
  type RepairJobDTO,
  type BackupScheduleDTO,
  type RecoverySnapshotDTO,
  type RunbookDTO,
} from '@/hooks/api/use-provider-console';
import type { ComplianceRequestDTO } from '@root/types';
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
export function ProviderDataOpsSection() {
  const activeHeader = useNavigationStore((s) => s.activeHeader);
  switch (activeHeader) {
    case 'data_ops_exports':       return <ExportsView />;
    case 'data_ops_imports':       return <ImportsView />;
    case 'data_ops_repair':        return <RepairView />;
    case 'data_ops_compatibility': return <CompatibilityView />;
    case 'data_ops_backups':       return <BackupsView />;
    default: return <ExportsView />;
  }
}

/* ━━━ helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const fmtDateTime = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const severityColor = (s: string) => {
  switch (s.toLowerCase()) {
    case 'critical': return { border: 'border-red-500/20', bg: 'bg-red-500/8', text: 'text-red-400' };
    case 'high':     return { border: 'border-orange-500/20', bg: 'bg-orange-500/8', text: 'text-orange-400' };
    case 'medium':   return { border: 'border-amber-500/20', bg: 'bg-amber-500/8', text: 'text-amber-400' };
    default:         return { border: 'border-slate-500/20', bg: 'bg-slate-500/8', text: 'text-slate-400' };
  }
};

/* ── Exports View ──────────────────────────────────────────── */
function ExportsView() {
  const moduleQuery = useProviderModuleData();
  const completeReq = useCompleteProviderDataRequest();
  const accent = getAccent('provider_data_ops');

  const exportReqs = useMemo(
    () => (moduleQuery.data?.exportRequests ?? []) as ComplianceRequestDTO[],
    [moduleQuery.data?.exportRequests],
  );
  const pendingExports = useMemo(() => exportReqs.filter((r) => r.state !== 'COMPLETED'), [exportReqs]);
  const completedExports = useMemo(() => exportReqs.filter((r) => r.state === 'COMPLETED'), [exportReqs]);
  const [search, setSearch] = useState('');

  const filteredPending = useMemo(
    () => pendingExports.filter((r) => r.tenantId.toLowerCase().includes(search.toLowerCase())),
    [pendingExports, search],
  );
  const filteredCompleted = useMemo(
    () => completedExports.filter((r) => r.tenantId.toLowerCase().includes(search.toLowerCase())),
    [completedExports, search],
  );

  const handleComplete = useCallback(
    (req: ComplianceRequestDTO) => {
      const reason = reasonPrompt('Complete export');
      if (reason) completeReq.mutate({ requestType: 'export', requestId: req.id, reason });
    },
    [completeReq],
  );

  return (
    <SectionShell>
      <SectionPageHeader icon={Download} title="Data Exports" description="Manage tenant data export requests" accent={accent} actions={
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exports…" className="h-7 w-44 pl-7 border-slate-500/40 bg-slate-700/60 text-xs text-slate-100" />
        </div>
      } />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Exports" value={String(exportReqs.length)} sub="All-time" gradient="from-orange-500/10 to-orange-500/5" />
        <StatCard label="Pending" value={String(pendingExports.length)} sub="Awaiting action" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Completed" value={String(completedExports.length)} sub="Downloaded" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Data Queued" value={`${(pendingExports.length * 1.2).toFixed(1)} GB`} sub="Estimated" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      {moduleQuery.isLoading && (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-orange-400" /></div>
      )}

      {!moduleQuery.isLoading && exportReqs.length === 0 && (
        <EmptyState icon={Download} title="No Export Requests" description="Data export requests from tenants will appear here" />
      )}

      {filteredPending.length > 0 && (
        <Panel title="Pending Exports" subtitle={`${filteredPending.length} awaiting completion`} accentBorder="border-amber-500/20">
          <div className="space-y-2">
            {filteredPending.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2.5 text-xs">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-amber-400" />
                    <p className="font-semibold text-slate-100 truncate">Export — Tenant {req.tenantId.slice(0, 8)}</p>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0">PENDING</Badge>
                  </div>
                  <p className="text-slate-400 mt-0.5 ml-5.5">Requested {fmtDate(req.createdAt)}</p>
                </div>
                <Button
                  size="sm"
                  className="h-7 shrink-0 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 text-[11px]"
                  onClick={() => handleComplete(req)}
                  disabled={completeReq.isPending}
                >
                  {completeReq.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <CheckCircle2 className="mr-1 size-3" />}
                  Mark Complete
                </Button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {filteredCompleted.length > 0 && (
        <Panel title="Completed Exports" subtitle={`${filteredCompleted.length} finished`} accentBorder="border-emerald-500/20">
          <div className="space-y-1">
            {filteredCompleted.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="size-3.5 shrink-0 text-emerald-400" />
                  <div className="min-w-0">
                    <p className="text-slate-100 truncate">Tenant {req.tenantId.slice(0, 8)}</p>
                    <p className="text-slate-500">{fmtDate(req.createdAt)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 text-[10px] px-1.5 py-0 shrink-0">DONE</Badge>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Imports View ──────────────────────────────────────────── */
function ImportsView() {
  const accent = getAccent('provider_data_ops');
  const moduleQuery = useProviderModuleData();
  const { data: extras, isLoading: extrasLoading } = useProviderDataOpsExtras();
  const startImport = useStartProviderDataImport();

  const imports = useMemo(() => extras?.imports ?? [], [extras?.imports]);
  const deletionReqs = useMemo(
    () => (moduleQuery.data?.deletionRequests ?? []) as ComplianceRequestDTO[],
    [moduleQuery.data?.deletionRequests],
  );

  const [showNew, setShowNew] = useState(false);
  const [importType, setImportType] = useState<'CSV' | 'MIGRATION'>('CSV');
  const [importTarget, setImportTarget] = useState('');

  const completedImports = useMemo(() => imports.filter((i) => i.status === 'COMPLETED'), [imports]);
  const runningImports = useMemo(() => imports.filter((i) => i.status === 'RUNNING'), [imports]);
  const totalRecords = useMemo(() => imports.reduce((s, i) => s + i.records, 0), [imports]);

  const handleImportStart = useCallback(
    (type: 'CSV' | 'MIGRATION') => {
      const reason = reasonPrompt(`Start ${type} import`);
      if (!reason) return;
      startImport.mutate(
        { type, config: { target: importTarget || 'default' }, reason },
        { onSuccess: () => { setShowNew(false); setImportTarget(''); } },
      );
    },
    [startImport, importTarget],
  );

  return (
    <SectionShell>
      <SectionPageHeader icon={Upload} title="Data Imports" description="Bulk data import and migration tools" accent={accent} actions={
        <Button size="sm" className="h-7 bg-orange-500/20 text-orange-100 hover:bg-orange-500/30" onClick={() => setShowNew(true)}>
          <PlusCircle className="mr-1 size-3" />New Import
        </Button>
      } />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Imports" value={String(imports.length)} sub="All-time" gradient="from-orange-500/10 to-orange-500/5" />
        <StatCard label="Running" value={String(runningImports.length)} sub="In progress" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Completed" value={String(completedImports.length)} sub="Successful" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Records" value={totalRecords.toLocaleString()} sub="Imported" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      {/* New import form */}
      {showNew && (
        <Panel title="New Import Job" accentBorder="border-orange-500/20">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">Type</label>
              <select
                className="h-8 w-full rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100"
                value={importType}
                onChange={(e) => setImportType(e.target.value as 'CSV' | 'MIGRATION')}
              >
                <option value="CSV">CSV Import</option>
                <option value="MIGRATION">Database Migration</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">Target</label>
              <Input value={importTarget} onChange={(e) => setImportTarget(e.target.value)} placeholder="Tenant ID or schema name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            </div>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-orange-500/20 text-orange-100 hover:bg-orange-500/30" onClick={() => handleImportStart(importType)} disabled={startImport.isPending}>
              {startImport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Upload className="mr-1 size-3" />}Start Import
            </Button>
          </div>
        </Panel>
      )}

      {/* Quick-action cards */}
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <Panel title="CSV Upload" accentBorder="border-cyan-500/20">
          <div className="space-y-2 text-xs">
            <p className="text-slate-300">Bulk-import users, courses, or schedules into tenant databases via CSV.</p>
            <div className="rounded-lg border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 p-5 text-center">
              <Upload className="mx-auto size-7 text-cyan-400/60" />
              <p className="mt-1.5 text-slate-400">Drop CSV file here or click to browse</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Supports .csv up to 50 MB</p>
            </div>
            <Button size="sm" className="h-7 w-full bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={() => handleImportStart('CSV')} disabled={startImport.isPending}>
              {startImport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <ArrowRight className="mr-1 size-3" />}Start CSV Import
            </Button>
          </div>
        </Panel>

        <Panel title="Database Migration" accentBorder="border-violet-500/20">
          <div className="space-y-2 text-xs">
            <p className="text-slate-300">Migrate data between tenant schemas or from external systems.</p>
            <div className="space-y-1.5">
              {[
                { label: 'Schema Mapping', desc: 'Auto-detect field mapping' },
                { label: 'Data Validation', desc: 'Pre-flight integrity checks' },
                { label: 'Conflict Resolution', desc: 'Merge or skip duplicates' },
                { label: 'Rollback Support', desc: 'Full transactional safety' },
              ].map((feat) => (
                <div key={feat.label} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="size-3 mt-0.5 shrink-0 text-violet-400" />
                  <div>
                    <span className="font-medium">{feat.label}</span>
                    <span className="text-slate-500 ml-1">— {feat.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" className="h-7 w-full bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => handleImportStart('MIGRATION')} disabled={startImport.isPending}>
              {startImport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Database className="mr-1 size-3" />}Configure Migration
            </Button>
          </div>
        </Panel>
      </div>

      {/* Import history */}
      {extrasLoading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="size-5 animate-spin text-orange-400" /></div>
      ) : imports.length > 0 && (
        <Panel title="Import History" subtitle={`${imports.length} jobs`} accentBorder="border-orange-500/20">
          <div className="space-y-1.5">
            {imports.map((job) => {
              const isRunning = job.status === 'RUNNING';
              const isCompleted = job.status === 'COMPLETED';
              return (
                <div key={job.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${isRunning ? 'border-cyan-500/15 bg-cyan-500/5' : isCompleted ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-slate-700/60 bg-slate-800/40'}`}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-100">{job.source}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${isRunning ? 'border-cyan-500/30 text-cyan-300' : isCompleted ? 'border-emerald-500/30 text-emerald-300' : 'border-slate-500/30 text-slate-300'}`}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-slate-400 mt-0.5">{job.records.toLocaleString()} records · Started {fmtDateTime(job.startedAt)}{job.completedAt ? ` · Completed ${fmtDateTime(job.completedAt)}` : ''}</p>
                  </div>
                  {isRunning && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Loader2 className="size-3 animate-spin text-cyan-400" />
                      <span className="text-cyan-300 text-[10px]">Processing…</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* GDPR deletion requests */}
      {deletionReqs.length > 0 && (
        <Panel title="Pending Deletions" subtitle={`${deletionReqs.length} GDPR deletion requests`} accentBorder="border-red-500/20">
          <div className="space-y-1">
            {deletionReqs.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg bg-red-500/5 border border-red-500/15 px-3 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <XCircle className="size-3.5 shrink-0 text-red-400" />
                  <div className="min-w-0">
                    <p className="text-slate-100 truncate">Tenant {req.tenantId.slice(0, 8)} — <span className="text-red-300">DELETION</span></p>
                    <p className="text-slate-500">{fmtDate(req.createdAt)}</p>
                  </div>
                </div>
                <StatusBadge status={req.state} />
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Repair View ─────────────────────────────────────────── */
function RepairView() {
  const accent = getAccent('provider_data_ops');
  const { data: extras, isLoading } = useProviderDataOpsExtras();
  const runRepair = useRunProviderRepairJob();

  const repairJobs = useMemo(() => extras?.repairJobs ?? [], [extras?.repairJobs]);
  const completedJobs = useMemo(() => repairJobs.filter((j) => j.status === 'COMPLETED'), [repairJobs]);
  const runningJobs = useMemo(() => repairJobs.filter((j) => j.status === 'RUNNING'), [repairJobs]);
  const totalFixed = useMemo(() => repairJobs.reduce((s, j) => s + j.recordsFixed, 0), [repairJobs]);

  const handleRun = useCallback(
    (job: RepairJobDTO) => {
      const reason = reasonPrompt(`Run repair: ${job.name}`);
      if (reason) runRepair.mutate({ jobId: job.id, reason });
    },
    [runRepair],
  );

  return (
    <SectionShell>
      <SectionPageHeader icon={Wrench} title="Data Repair" description="Integrity checks and automated repair jobs" accent={accent} />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Jobs" value={String(repairJobs.length)} sub="Configured" gradient="from-orange-500/10 to-orange-500/5" />
        <StatCard label="Running" value={String(runningJobs.length)} sub="In progress" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Completed" value={String(completedJobs.length)} sub="Finished" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Records Fixed" value={totalFixed.toLocaleString()} sub="All-time" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-orange-400" /></div>
      ) : repairJobs.length === 0 ? (
        <EmptyState icon={Wrench} title="No Repair Jobs" description="No data repair jobs have been configured." />
      ) : (
        <Panel title="Repair Jobs" subtitle={`${repairJobs.length} configured`} accentBorder="border-orange-500/20">
          <div className="space-y-2">
            {repairJobs.map((job) => {
              const isRunning = job.status === 'RUNNING';
              const isCompleted = job.status === 'COMPLETED';
              return (
                <div key={job.id} className={`rounded-xl border p-3 ${isRunning ? 'border-cyan-500/20 bg-cyan-500/5' : isCompleted ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-700/60 bg-slate-800/40'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-xs text-slate-100">{job.name}</p>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${isRunning ? 'border-cyan-500/30 text-cyan-300' : isCompleted ? 'border-emerald-500/30 text-emerald-300' : 'border-amber-500/30 text-amber-300'}`}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Target: <span className="text-slate-300">{job.target}</span> · Started {fmtDate(job.startedAt)}
                        {job.completedAt ? ` · Completed ${fmtDate(job.completedAt)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {job.recordsFixed > 0 && (
                        <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-[10px]">
                          {job.recordsFixed.toLocaleString()} fixed
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        className="h-7 bg-orange-500/20 text-orange-100 hover:bg-orange-500/30"
                        onClick={() => handleRun(job)}
                        disabled={runRepair.isPending || isRunning}
                      >
                        {runRepair.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <RefreshCw className="mr-1 size-3" />}
                        {isRunning ? 'Running…' : 'Run Now'}
                      </Button>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <Progress value={job.progress} className="h-1.5 bg-slate-700" />
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Compatibility View ─────────────────────────────────────── */
function CompatibilityView() {
  const accent = getAccent('provider_data_ops');
  const { data: extras, isLoading } = useProviderDataOpsExtras();

  const checks = useMemo(() => extras?.compatibilityChecks ?? [], [extras?.compatibilityChecks]);
  const compatibleCount = useMemo(() => checks.filter((c) => c.compatible).length, [checks]);
  const incompatibleCount = useMemo(() => checks.filter((c) => !c.compatible).length, [checks]);
  const criticalCount = useMemo(() => checks.filter((c) => c.severity.toLowerCase() === 'critical' && !c.compatible).length, [checks]);

  return (
    <SectionShell>
      <SectionPageHeader icon={Shield} title="Compatibility Matrix" description="System version compatibility and dependency checks" accent={accent} />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Components" value={String(checks.length)} sub="Tracked" gradient="from-orange-500/10 to-orange-500/5" />
        <StatCard label="Compatible" value={String(compatibleCount)} sub="Up to date" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Incompatible" value={String(incompatibleCount)} sub="Need attention" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Critical" value={String(criticalCount)} sub="Urgent" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-orange-400" /></div>
      ) : checks.length === 0 ? (
        <EmptyState icon={Shield} title="No Compatibility Checks" description="No compatibility data available." />
      ) : (
        <>
          {/* Table header */}
          <Panel title="System Compatibility" subtitle={`${checks.length} components`} accentBorder="border-orange-500/20">
            <div className="grid grid-cols-5 gap-2 px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-700/60">
              <span>Component</span>
              <span>Current</span>
              <span>Latest</span>
              <span>Severity</span>
              <span className="text-right">Status</span>
            </div>
            <div className="divide-y divide-slate-700/40">
              {checks.map((chk) => {
                const sev = severityColor(chk.severity);
                return (
                  <div key={chk.id} className="grid grid-cols-5 gap-2 items-center px-3 py-2.5 text-xs hover:bg-slate-800/40 transition-colors">
                    <div className="min-w-0">
                      <p className="text-slate-100 font-medium truncate">{chk.component}</p>
                      <p className="text-[10px] text-slate-500">Checked {fmtDate(chk.checkedAt)}</p>
                    </div>
                    <span className="font-mono text-slate-200">{chk.current}</span>
                    <span className="font-mono text-slate-400">{chk.latest}</span>
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sev.text} ${sev.border}`}>
                      {chk.severity}
                    </Badge>
                    <div className="text-right">
                      {chk.compatible ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="size-3" />Compatible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400">
                          <AlertTriangle className="size-3" />Incompatible
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Schema summary */}
          <Panel title="Tenant Schema Status" accentBorder="border-emerald-500/20">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3 text-xs text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Schema Version</p>
                <p className="text-xl font-bold text-emerald-300 mt-1 font-mono">v42</p>
                <p className="text-slate-400">Current production</p>
              </div>
              <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3 text-xs text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Tenants on Latest</p>
                <p className="text-xl font-bold text-slate-100 mt-1">100%</p>
                <p className="text-slate-400">All aligned</p>
              </div>
              <div className="rounded-lg border border-blue-500/15 bg-blue-500/5 p-3 text-xs text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Next Migration</p>
                <p className="text-xl font-bold text-blue-300 mt-1 font-mono">v43</p>
                <p className="text-slate-400">Scheduled Mar 20</p>
              </div>
            </div>
          </Panel>
        </>
      )}
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Backups                                              */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BackupsView() {
  const accent = getAccent('provider_data_ops');
  const { data: backupsData, isLoading } = useProviderBackups();
  const createSched = useCreateProviderBackupSchedule();
  const triggerBackup = useTriggerProviderBackup();
  const restoreSnap = useRestoreProviderSnapshot();
  const executeRunbook = useExecuteProviderRunbook();

  const schedules = useMemo(() => backupsData?.schedules ?? [], [backupsData?.schedules]);
  const snapshots = useMemo(() => backupsData?.snapshots ?? [], [backupsData?.snapshots]);
  const runbooks = useMemo(() => backupsData?.runbooks ?? [], [backupsData?.runbooks]);

  const totalSize = useMemo(() => schedules.reduce((s, b) => s + parseFloat(b.size), 0).toFixed(1), [schedules]);
  const verifiedSnapshots = useMemo(() => snapshots.filter((s) => s.verified).length, [snapshots]);

  const [showNew, setShowNew] = useState(false);
  const [bName, setBName] = useState('');
  const [bFreq, setBFreq] = useState('DAILY');
  const [bRetention, setBRetention] = useState('30 days');

  const handleCreate = useCallback(() => {
    const reason = reasonPrompt('Create backup schedule');
    if (!reason) return;
    createSched.mutate(
      { name: bName, frequency: bFreq, retention: bRetention, tenants: 0, reason },
      { onSuccess: () => { setShowNew(false); setBName(''); setBFreq('DAILY'); setBRetention('30 days'); } },
    );
  }, [createSched, bName, bFreq, bRetention]);

  const handleTrigger = useCallback(
    (schedule: BackupScheduleDTO) => {
      const reason = reasonPrompt(`Trigger backup: ${schedule.name}`);
      if (reason) triggerBackup.mutate({ scheduleId: schedule.id, reason });
    },
    [triggerBackup],
  );

  const handleRestore = useCallback(
    (snap: RecoverySnapshotDTO) => {
      const reason = reasonPrompt(`Restore snapshot from ${fmtDateTime(snap.timestamp)}`);
      if (reason) restoreSnap.mutate({ snapshotId: snap.id, reason });
    },
    [restoreSnap],
  );

  const handleExecuteRunbook = useCallback(
    (rb: RunbookDTO) => {
      const reason = reasonPrompt(`Execute runbook: ${rb.name}`);
      if (reason) executeRunbook.mutate({ runbookId: rb.id, reason });
    },
    [executeRunbook],
  );

  return (
    <SectionShell>
      <SectionPageHeader icon={Cloud} title="Backup Management" description="Automated backup schedules, snapshots, and recovery runbooks" accent={accent} actions={
        <Button size="sm" className="h-7 bg-orange-500/20 text-orange-100 hover:bg-orange-500/30" onClick={() => setShowNew(true)}>
          <PlusCircle className="mr-1 size-3" />New Schedule
        </Button>
      } />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Schedules" value={String(schedules.length)} sub="Active" gradient="from-orange-500/10 to-orange-500/5" />
        <StatCard label="Total Size" value={`${totalSize} GB`} sub="All backups" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Snapshots" value={String(snapshots.length)} sub={`${verifiedSnapshots} verified`} gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Runbooks" value={String(runbooks.length)} sub="Recovery plans" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      {/* New schedule form */}
      {showNew && (
        <Panel title="Create Backup Schedule" accentBorder="border-orange-500/20">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">Name</label>
              <Input value={bName} onChange={(e) => setBName(e.target.value)} placeholder="e.g. Nightly Full Backup" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">Frequency</label>
              <select className="h-8 w-full rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={bFreq} onChange={(e) => setBFreq(e.target.value)}>
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400">Retention</label>
              <select className="h-8 w-full rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={bRetention} onChange={(e) => setBRetention(e.target.value)}>
                <option value="7 days">7 days</option>
                <option value="14 days">14 days</option>
                <option value="30 days">30 days</option>
                <option value="90 days">90 days</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-orange-500/20 text-orange-100 hover:bg-orange-500/30" onClick={handleCreate} disabled={!bName.trim() || createSched.isPending}>
              {createSched.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <PlusCircle className="mr-1 size-3" />}Create Schedule
            </Button>
          </div>
        </Panel>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-orange-400" /></div>
      ) : (
        <>
          {/* Schedules */}
          <Panel title="Backup Schedules" subtitle={`${schedules.length} active`} accentBorder="border-orange-500/20">
            {schedules.length === 0 ? (
              <EmptyState icon={Cloud} title="No Schedules" description="Create a backup schedule to get started." />
            ) : (
              <div className="space-y-2">
                {schedules.map((sched) => {
                  const isSuccess = sched.status === 'SUCCESS';
                  return (
                    <div key={sched.id} className={`rounded-xl border p-3 ${isSuccess ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-amber-500/15 bg-amber-500/5'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-xs text-slate-100">{sched.name}</p>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${isSuccess ? 'border-emerald-500/30 text-emerald-300' : 'border-amber-500/30 text-amber-300'}`}>
                              {sched.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {sched.frequency} · Retention: {sched.retention} · {sched.tenants} tenant{sched.tenants !== 1 ? 's' : ''} · {sched.size}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Last run: {fmtDateTime(sched.lastRun)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30"
                            onClick={() => handleTrigger(sched)}
                            disabled={triggerBackup.isPending}
                          >
                            {triggerBackup.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <RefreshCw className="mr-1 size-3" />}Run Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Snapshots */}
          <Panel title="Recovery Snapshots" subtitle={`${snapshots.length} available`} accentBorder="border-blue-500/20">
            {snapshots.length === 0 ? (
              <EmptyState icon={Database} title="No Snapshots" description="Snapshots are created automatically by backup schedules." />
            ) : (
              <div className="space-y-1.5">
                {snapshots.map((snap) => (
                  <div key={snap.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${snap.verified ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-slate-700/60 bg-slate-800/40'}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Database className="size-3.5 shrink-0 text-blue-400" />
                        <span className="font-semibold text-slate-100">{snap.type}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${snap.status === 'AVAILABLE' ? 'border-emerald-500/30 text-emerald-300' : 'border-slate-500/30 text-slate-300'}`}>
                          {snap.status}
                        </Badge>
                        {snap.verified && (
                          <Badge variant="outline" className="border-blue-500/30 text-blue-300 text-[10px] px-1.5 py-0">
                            <Shield className="mr-0.5 size-2.5" />Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-slate-400 mt-0.5 ml-5.5">{fmtDateTime(snap.timestamp)} · {snap.size}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 shrink-0 border-blue-500/30 text-blue-100 hover:bg-blue-500/10 text-[11px]"
                      onClick={() => handleRestore(snap)}
                      disabled={restoreSnap.isPending || snap.status !== 'AVAILABLE'}
                    >
                      {restoreSnap.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Clock className="mr-1 size-3" />}Restore
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Runbooks */}
          <Panel title="Recovery Runbooks" subtitle={`${runbooks.length} plans`} accentBorder="border-violet-500/20">
            {runbooks.length === 0 ? (
              <EmptyState icon={FileText} title="No Runbooks" description="Recovery runbooks define step-by-step disaster recovery procedures." />
            ) : (
              <div className="space-y-2">
                {runbooks.map((rb) => {
                  const sev = severityColor(rb.severity);
                  return (
                    <div key={rb.id} className={`rounded-xl border p-3 ${sev.border} ${sev.bg}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-xs text-slate-100">{rb.name}</p>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sev.text} ${sev.border}`}>
                              {rb.severity}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{rb.description}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {rb.steps} steps · Est. {rb.estimatedTime} · Last tested: {fmtDate(rb.lastTested)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className={`h-7 shrink-0 ${sev.bg} ${sev.text} hover:opacity-80`}
                          onClick={() => handleExecuteRunbook(rb)}
                          disabled={executeRunbook.isPending}
                        >
                          {executeRunbook.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <ArrowRight className="mr-1 size-3" />}
                          Execute
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* RPO/RTO summary */}
          <Panel title="Recovery Point Objectives" accentBorder="border-emerald-500/20">
            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/5 p-3 text-xs text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">RPO</p>
                <p className="text-2xl font-bold text-cyan-300 mt-1">6h</p>
                <p className="text-slate-400">Max data loss window</p>
              </div>
              <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-3 text-xs text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">RTO</p>
                <p className="text-2xl font-bold text-emerald-300 mt-1">2h</p>
                <p className="text-slate-400">Recovery time target</p>
              </div>
              <div className="rounded-lg border border-blue-500/15 bg-blue-500/5 p-3 text-xs text-center">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">Verified Snapshots</p>
                <p className="text-2xl font-bold text-blue-300 mt-1">{verifiedSnapshots}/{snapshots.length}</p>
                <p className="text-slate-400">Integrity confirmed</p>
              </div>
            </div>
          </Panel>
        </>
      )}
    </SectionShell>
  );
}
