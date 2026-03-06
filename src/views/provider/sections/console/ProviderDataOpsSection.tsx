/* ─── ProviderDataOpsSection ─── Exports · Imports · Repair · Compat · Backups ─── */
import { useState } from 'react';
import {
  Cloud,
  Download,
  HardDrive,
  Loader2,
  PlusCircle,
  RefreshCw,
  Upload,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'data_ops_exports':       return <ExportsView />;
    case 'data_ops_imports':       return <ImportsView />;
    case 'data_ops_repair':        return <RepairView />;
    case 'data_ops_compatibility': return <CompatibilityView />;
    case 'data_ops_backups':       return <BackupsView />;
    default: return <ExportsView />;
  }
}

/* ── Exports View ──────────────────────────────────────────── */
function ExportsView() {
  const moduleQuery = useProviderModuleData();
  const completeReq = useCompleteProviderDataRequest();
  const accent = getAccent('provider_data_ops');
  const exportReqs = (moduleQuery.data?.exportRequests ?? []) as ComplianceRequestDTO[];
  const pendingExports = exportReqs.filter((r) => r.state !== 'COMPLETED');
  const completedExports = exportReqs.filter((r) => r.state === 'COMPLETED');

  return (
    <SectionShell>
      <SectionPageHeader icon={Download} title="Data Exports" description="Manage tenant data export requests" accent={accent} />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Exports" value={String(exportReqs.length)} sub="All-time" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Pending" value={String(pendingExports.length)} sub="Awaiting" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Completed" value={String(completedExports.length)} sub="Downloaded" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Avg Size" value="2.4 GB" sub="Per export" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      {exportReqs.length === 0 && (
        <EmptyState icon={Download} title="No Export Requests" description="Data export requests from tenants will appear here" />
      )}

      {pendingExports.length > 0 && (
        <Panel title="Pending Exports" subtitle={`${pendingExports.length} awaiting completion`} accentBorder="border-amber-500/20">
          <div className="space-y-2">
            {pendingExports.map((req) => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-xs">
                <div>
                  <p className="font-semibold text-slate-100">Export — Tenant {req.tenantId.slice(0, 8)}</p>
                  <p className="text-slate-400">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="PENDING" />
                  <Button size="sm" className="h-6 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 text-[10px]" onClick={() => {
                    const reason = reasonPrompt('Complete export');
                    if (reason) completeReq.mutate({ requestType: 'export', requestId: req.id, reason });
                  }}>
                    Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {completedExports.length > 0 && (
        <Panel title="Completed Exports" accentBorder="border-emerald-500/20">
          <div className="space-y-1">
            {completedExports.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
                <div>
                  <p className="text-slate-100">Tenant {req.tenantId.slice(0, 8)}</p>
                  <p className="text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
                <StatusBadge status="COMPLETED" />
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
  const moduleQuery = useProviderModuleData();
  const accent = getAccent('provider_data_ops');
  const deletionReqs = (moduleQuery.data?.deletionRequests ?? []) as ComplianceRequestDTO[];
  const startImport = useStartProviderDataImport();
  const [showNew, setShowNew] = useState(false);
  const [importType, setImportType] = useState('CSV');
  const [importTarget, setImportTarget] = useState('');

  const handleImportStart = (type: string) => {
    const reason = reasonPrompt(`Start ${type} import`);
    if (!reason) return;
    startImport.mutate({ type: type as 'CSV' | 'MIGRATION', config: { target: importTarget || 'default' }, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Upload} title="Data Imports" description="Bulk data import and migration tools" accent={accent} actions={
        <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Import</Button>
      } />

      {showNew && (
        <Panel title="New Import Job" accentBorder="border-cyan-500/20">
          <div className="grid gap-2 md:grid-cols-2">
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={importType} onChange={(e) => setImportType(e.target.value)}>
              <option value="CSV">CSV Import</option><option value="MIGRATION">Database Migration</option>
            </select>
            <Input value={importTarget} onChange={(e) => setImportTarget(e.target.value)} placeholder="Target (tenant ID or schema)" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={() => handleImportStart(importType)} disabled={startImport.isPending}>
              {startImport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Start
            </Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        <Panel title="CSV Import" accentBorder="border-cyan-500/20">
          <div className="space-y-2 text-xs">
            <p className="text-slate-300">Upload CSV files to bulk-import users, courses, or schedules into tenant databases.</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 p-4 text-center">
                <Upload className="mx-auto size-6 text-cyan-400/60" />
                <p className="mt-1 text-slate-400">Drop CSV file here</p>
              </div>
            </div>
            <Button size="sm" className="h-7 w-full bg-cyan-500/20 text-cyan-100" onClick={() => handleImportStart('CSV')} disabled={startImport.isPending}>
              {startImport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Start Import
            </Button>
          </div>
        </Panel>

        <Panel title="Database Migration" accentBorder="border-violet-500/20">
          <div className="space-y-2 text-xs">
            <p className="text-slate-300">Migrate data between tenant schemas or from external systems using our migration toolkit.</p>
            <div className="space-y-1">
              {['Schema Mapping', 'Data Validation', 'Conflict Resolution', 'Rollback Support'].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-slate-300">
                  <span className="size-1.5 rounded-full bg-violet-400" />
                  {feat}
                </div>
              ))}
            </div>
            <Button size="sm" className="h-7 w-full bg-violet-500/20 text-violet-100" onClick={() => handleImportStart('MIGRATION')} disabled={startImport.isPending}>
              {startImport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Configure Migration
            </Button>
          </div>
        </Panel>
      </div>

      {/* Deletion requests */}
      {deletionReqs.length > 0 && (
        <Panel title="Pending Deletions" subtitle={`${deletionReqs.length} GDPR deletion requests`} accentBorder="border-red-500/20">
          <div className="space-y-1">
            {deletionReqs.map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg bg-red-500/5 px-3 py-2 text-xs">
                <div>
                  <p className="text-slate-100">Tenant {req.tenantId.slice(0, 8)} — <span className="text-red-300">DELETION</span></p>
                  <p className="text-slate-400">{new Date(req.createdAt).toLocaleDateString()}</p>
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
  const repairJobs = extras?.repairJobs ?? [];
  const runRepair = useRunProviderRepairJob();

  const handleRun = (id: string) => {
    const reason = reasonPrompt('Run repair job');
    if (!reason) return;
    runRepair.mutate({ jobId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Wrench} title="Data Repair" description="Integrity checks and automated repair jobs" accent={accent} />

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-indigo-400" /></div>
      ) : repairJobs.length === 0 ? (
        <EmptyState icon={Wrench} title="No Repair Jobs" description="No data repair jobs found." />
      ) : (
        <div className="grid gap-2">
          {repairJobs.map((job) => (
            <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 p-3">
              <div className="text-xs">
                <p className="font-semibold text-slate-100">{job.name}</p>
                <p className="text-slate-400">
                  Last run: {new Date(job.startedAt).toLocaleDateString()} · {job.recordsFixed > 0 ? <span className="text-amber-300">{job.recordsFixed} fixed</span> : <span className="text-emerald-300">Clean</span>}
                </p>
              </div>
              <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30 shrink-0" onClick={() => handleRun(job.id)} disabled={runRepair.isPending}>
                {runRepair.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <RefreshCw className="mr-1 size-3" />}Run Now
              </Button>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/* ── Compatibility View ─────────────────────────────────────── */
function CompatibilityView() {
  const accent = getAccent('provider_data_ops');
  const { data: extras, isLoading } = useProviderDataOpsExtras();
  const checks = extras?.compatibilityChecks ?? [];

  return (
    <SectionShell>
      <SectionPageHeader icon={HardDrive} title="Compatibility Matrix" description="System version compatibility and requirements" accent={accent} />

      <Panel title="System Compatibility" accentBorder="border-cyan-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-indigo-400" /></div>
        ) : checks.length === 0 ? (
          <EmptyState icon={HardDrive} title="No Compatibility Checks" description="No compatibility data available." />
        ) : (
          <div className="grid gap-1">
            {checks.map((chk) => (
              <div key={chk.id} className="grid grid-cols-4 items-center rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
                <span className="text-slate-300 font-medium">{chk.component}</span>
                <span className="text-slate-100 font-mono">{chk.current}</span>
                <span className="text-slate-400 font-mono">{chk.latest}</span>
                <span className={`text-right ${chk.compatible ? 'text-emerald-400' : 'text-red-400'}`}>
                  {chk.compatible ? '✓ Compatible' : '✗ Incompatible'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Tenant Schema Status" accentBorder="border-emerald-500/20">
        <div className="text-xs text-slate-300">
          <p>All tenants are running on the latest schema version (<span className="font-mono text-emerald-300">v42</span>).</p>
          <p className="mt-1 text-slate-400">Next scheduled migration: <span className="font-mono">2026-03-20</span></p>
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Backups                                              */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function BackupsView() {
  const accent = getAccent('provider_data_ops');
  const { data: backupsData, isLoading } = useProviderBackups();
  const backups = backupsData?.schedules ?? [];
  const createSched = useCreateProviderBackupSchedule();
  const restoreSnap = useRestoreProviderSnapshot();
  const [showNew, setShowNew] = useState(false);
  const [bName, setBName] = useState('');
  const [bFreq, setBFreq] = useState('DAILY');

  const totalSize = backups.reduce((s, b) => s + parseFloat(b.size), 0).toFixed(1);

  const handleCreate = () => {
    const reason = reasonPrompt('Create backup schedule');
    if (!reason) return;
    createSched.mutate({ name: bName, frequency: bFreq, retention: '30 days', tenants: 0, reason }, { onSuccess: () => { setShowNew(false); setBName(''); } });
  };

  const handleRestore = (id: string) => {
    const reason = reasonPrompt('Restore from backup');
    if (!reason) return;
    restoreSnap.mutate({ snapshotId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Cloud} title="Backup Management" description="Automated backup schedules and recovery points" accent={accent} actions={
        <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Schedule</Button>
      } />

      {showNew && (
        <Panel title="Create Backup Schedule" accentBorder="border-cyan-500/20">
          <div className="flex gap-2">
            <Input value={bName} onChange={(e) => setBName(e.target.value)} placeholder="Schedule name" className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={bFreq} onChange={(e) => setBFreq(e.target.value)}>
              <option value="HOURLY">Hourly</option><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option>
            </select>
            <Button size="sm" className="h-8 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-8 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={handleCreate} disabled={!bName.trim() || createSched.isPending}>
              {createSched.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Schedules" value={String(backups.length)} sub="Active" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Total Size" value={`${totalSize} GB`} sub="Latest backups" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Success" value={String(backups.filter((b) => b.status === 'SUCCESS').length)} sub={`of ${backups.length} jobs`} gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Warnings" value={String(backups.filter((b) => b.status === 'WARNING').length)} sub="Needs review" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      <Panel title="Backup Schedules" subtitle={`${backups.length} active schedules`} accentBorder="border-cyan-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-indigo-400" /></div>
        ) : backups.length === 0 ? (
          <EmptyState icon={Cloud} title="No Backups" description="No backup schedules configured yet." />
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <div key={backup.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${backup.status === 'SUCCESS' ? 'border-emerald-500/15 bg-emerald-500/5' : 'border-amber-500/15 bg-amber-500/5'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-100">{backup.name}</p>
                  </div>
                  <p className="text-slate-400 mt-0.5">{backup.frequency} · Retention: {backup.retention}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-300">{backup.size}</span>
                  <StatusBadge status={backup.status === 'SUCCESS' ? 'ACTIVE' : 'WARNING'} />
                  <span className="text-[10px] text-slate-400">{new Date(backup.lastRun).toLocaleString()}</span>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] border-cyan-500/30" onClick={() => handleRestore(backup.id)} disabled={restoreSnap.isPending}>
                    {restoreSnap.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Restore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Panel title="Recovery Point Objectives" accentBorder="border-blue-500/20">
        <div className="grid gap-2 md:grid-cols-3">
          <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3 text-xs text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">RPO</p>
            <p className="text-2xl font-bold text-cyan-300 mt-1">6h</p>
            <p className="text-slate-400">Max data loss window</p>
          </div>
          <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3 text-xs text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">RTO</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">2h</p>
            <p className="text-slate-400">Recovery time target</p>
          </div>
          <div className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3 text-xs text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Last Verified</p>
            <p className="text-2xl font-bold text-slate-100 mt-1">2d ago</p>
            <p className="text-slate-400">Integrity check</p>
          </div>
        </div>
      </Panel>
    </SectionShell>
  );
}
