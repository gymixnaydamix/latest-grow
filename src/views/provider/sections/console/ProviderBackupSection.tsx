/* ─── ProviderBackupSection ─── Schedules · Recovery · Runbooks ─── */
import { useState } from 'react';
import { ClipboardList, Database, FileClock, Loader2, Play, PlusCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderBackups, useProviderTenants, useCreateProviderBackupSchedule, useTriggerProviderBackup, useUpdateProviderBackupSchedule, useRestoreProviderSnapshot, useCreateProviderRunbook, useExecuteProviderRunbook } from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderBackupSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'backup_schedules': return <SchedulesView />;
    case 'backup_recovery':  return <RecoveryView />;
    case 'backup_runbooks':  return <RunbooksView />;
    default:                 return <SchedulesView />;
  }
}

/* ── Schedules ── */
function SchedulesView() {
  const accent = getAccent('provider_backup');
  const { data: bundle, isLoading } = useProviderBackups();
  const tenantsQuery = useProviderTenants({});
  const tenantCount = tenantsQuery.data?.length ?? 0;
  const createSched = useCreateProviderBackupSchedule();
  const triggerBackup = useTriggerProviderBackup();
  const updateSched = useUpdateProviderBackupSchedule();
  const [showNew, setShowNew] = useState(false);
  const [sName, setSName] = useState('');
  const [sFreq, setSFreq] = useState('DAILY');
  const [sRetention, setSRetention] = useState('30 days');

  const schedules = bundle?.schedules ?? [];
  const completed = schedules.filter((s) => s.status === 'COMPLETED');

  const handleCreate = () => {
    const reason = reasonPrompt('Create backup schedule');
    if (!reason) return;
    createSched.mutate({ name: sName, frequency: sFreq, retention: sRetention, tenants: 0, reason }, { onSuccess: () => { setShowNew(false); setSName(''); } });
  };

  const handleRunNow = (id: string) => {
    const reason = reasonPrompt('Trigger backup now');
    if (!reason) return;
    triggerBackup.mutate({ scheduleId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={FileClock} title="Backup Schedules" description="Automated backup jobs and retention policies" accent={accent} actions={
        <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Schedule</Button>
      } />

      {showNew && (
        <Panel title="Create Backup Schedule" accentBorder="border-emerald-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="Schedule name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={sFreq} onChange={(e) => setSFreq(e.target.value)}>
              <option value="HOURLY">Hourly</option><option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option>
            </select>
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={sRetention} onChange={(e) => setSRetention(e.target.value)}>
              <option value="7 days">7 days</option><option value="30 days">30 days</option><option value="90 days">90 days</option><option value="1 year">1 year</option>
            </select>
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={handleCreate} disabled={!sName.trim() || createSched.isPending}>
              {createSched.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Schedules" value={String(schedules.length)} sub="Total configured" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Completed" value={String(completed.length)} sub="Successful backups" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Storage" value={schedules.length > 0 ? schedules.reduce((acc, s) => acc + (parseFloat(s.size) || 0), 0).toFixed(1) + ' GB' : '—'} sub="Combined backups" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Tenants" value={String(tenantCount)} sub="Covered" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      <Panel title="Backup Jobs" subtitle={isLoading ? 'Loading…' : `${schedules.length} schedules`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-emerald-400" /></div>
        ) : schedules.length === 0 ? (
          <EmptyState icon={FileClock} title="No Backup Schedules" description="Create your first automated backup job." />
        ) : (
          <div className="space-y-2">
            {schedules.map((sched) => (
              <Row key={sched.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{sched.name}</p>
                    <p className="text-slate-400">{sched.frequency} · Retention: {sched.retention}</p>
                    <p className="text-slate-400">Last run: {new Date(sched.lastRun).toLocaleString()} · Size: {sched.size} · {sched.tenants ?? tenantCount} tenant{(sched.tenants ?? tenantCount) !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={sched.status} />
                    <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => handleRunNow(sched.id)} disabled={triggerBackup.isPending}>
                      {triggerBackup.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Play className="mr-1 size-3" />}Run Now
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-emerald-500/30" onClick={() => {
                      const reason = reasonPrompt('Update backup schedule');
                      if (!reason) return;
                      updateSched.mutate({ scheduleId: sched.id, reason });
                    }} disabled={updateSched.isPending}>Edit</Button>
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Recovery ── */
function RecoveryView() {
  const accent = getAccent('provider_backup');
  const { data: bundle, isLoading } = useProviderBackups();
  const restoreSnap = useRestoreProviderSnapshot();

  const snapshots = bundle?.snapshots ?? [];
  const schedules = bundle?.schedules ?? [];
  const available = snapshots.filter((s) => s.status === 'AVAILABLE');
  const verified = snapshots.filter((s) => s.verified);

  /* Derive RPO from the most frequent backup schedule */
  const freqToHours: Record<string, number> = { HOURLY: 1, DAILY: 24, WEEKLY: 168 };
  const bestRpoHours = schedules.length > 0
    ? Math.min(...schedules.map((s) => freqToHours[s.frequency] ?? 24))
    : 24;
  const rpoLabel = bestRpoHours < 24 ? `${bestRpoHours}h` : `${Math.round(bestRpoHours / 24)}d`;

  const handleRestore = (id: string) => {
    const reason = reasonPrompt('Restore snapshot — this is destructive');
    if (!reason) return;
    restoreSnap.mutate({ snapshotId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Database} title="Disaster Recovery" description="Point-in-time restore and snapshot management" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Snapshots" value={String(snapshots.length)} sub="Total available" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Available" value={String(available.length)} sub="Restorable" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Verified" value={String(verified.length)} sub="Integrity checked" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="RPO" value={rpoLabel} sub="Recovery point obj." gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <Panel title="Recovery Points" subtitle={isLoading ? 'Loading…' : `${snapshots.length} snapshots`} accentBorder="border-emerald-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-emerald-400" /></div>
        ) : snapshots.length === 0 ? (
          <EmptyState icon={Database} title="No Snapshots" description="No recovery snapshots available." />
        ) : (
          <div className="space-y-2">
            {snapshots.map((snap) => (
              <Row key={snap.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{snap.id}</p>
                    <p className="text-slate-400">{snap.type} backup · {snap.size}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {snap.verified ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">Verified ✓</span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-300">Unverified</span>
                    )}
                    <StatusBadge status={snap.status === 'AVAILABLE' ? 'ACTIVE' : 'CLOSED'} />
                    {snap.status === 'AVAILABLE' && (
                      <Button size="sm" className="h-6 text-[10px] bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => handleRestore(snap.id)} disabled={restoreSnap.isPending}>
                        {restoreSnap.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <RefreshCw className="mr-1 size-3" />}Restore
                      </Button>
                    )}
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Recovery Targets" accentBorder="border-blue-500/20">
        <div className="grid gap-2 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs">
            <p className="font-semibold text-emerald-200">RPO (Recovery Point Objective)</p>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{bestRpoHours < 24 ? `${bestRpoHours} hour${bestRpoHours !== 1 ? 's' : ''}` : `${Math.round(bestRpoHours / 24)} day${Math.round(bestRpoHours / 24) !== 1 ? 's' : ''}`}</p>
            <p className="text-slate-400 mt-1">Based on most frequent backup schedule ({schedules.length > 0 ? schedules.find((s) => (freqToHours[s.frequency] ?? 24) === bestRpoHours)?.frequency ?? 'DAILY' : 'No schedules'})</p>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs">
            <p className="font-semibold text-blue-200">RTO (Recovery Time Objective)</p>
            <p className="text-2xl font-bold text-blue-300 mt-1">{verified.length > 0 ? '< 2 hours' : 'Unverified'}</p>
            <p className="text-slate-400 mt-1">{verified.length} of {snapshots.length} snapshots verified for integrity</p>
          </div>
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Runbooks ── */
function RunbooksView() {
  const accent = getAccent('provider_backup');
  const { data: bundle, isLoading } = useProviderBackups();
  const runbooks = bundle?.runbooks ?? [];
  const createRb = useCreateProviderRunbook();
  const executeRb = useExecuteProviderRunbook();
  const [showNew, setShowNew] = useState(false);
  const [rbName, setRbName] = useState('');
  const [rbDesc, setRbDesc] = useState('');
  const [rbSeverity, setRbSeverity] = useState('HIGH');
  const [viewId, setViewId] = useState<string | null>(null);

  const handleCreate = () => {
    const reason = reasonPrompt('Create runbook');
    if (!reason) return;
    createRb.mutate({ name: rbName, description: rbDesc, severity: rbSeverity, steps: 0, estimatedTime: '30m', reason }, { onSuccess: () => { setShowNew(false); setRbName(''); setRbDesc(''); } });
  };

  const handleExecute = (id: string) => {
    const reason = reasonPrompt('Execute runbook');
    if (!reason) return;
    executeRb.mutate({ runbookId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={ClipboardList} title="Disaster Recovery Runbooks" description="Step-by-step procedures for incident recovery" accent={accent} actions={
        <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Runbook</Button>
      } />

      {showNew && (
        <Panel title="Create Runbook" accentBorder="border-emerald-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={rbName} onChange={(e) => setRbName(e.target.value)} placeholder="Runbook name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={rbDesc} onChange={(e) => setRbDesc(e.target.value)} placeholder="Description" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={rbSeverity} onChange={(e) => setRbSeverity(e.target.value)}>
              <option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option>
            </select>
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={handleCreate} disabled={!rbName.trim() || createRb.isPending}>
              {createRb.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Runbooks" value={String(runbooks.length)} sub="Documented" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Critical" value={String(runbooks.filter((r) => r.severity === 'CRITICAL').length)} sub="High-priority" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Last Tested" value={runbooks.length > 0 ? runbooks.sort((a, b) => b.lastTested.localeCompare(a.lastTested))[0].lastTested : '—'} sub="Most recent drill" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      <Panel title="Runbook Library" subtitle={isLoading ? 'Loading…' : `${runbooks.length} procedures`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-emerald-400" /></div>
        ) : runbooks.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No Runbooks" description="Document your first disaster recovery procedure." />
        ) : (
          <div className="space-y-2">
            {runbooks.map((rb) => (
              <Row key={rb.id} className={rb.severity === 'CRITICAL' ? 'border-red-500/15' : ''}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{rb.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] border ${rb.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-200 border-red-500/40' : rb.severity === 'HIGH' ? 'bg-amber-500/15 text-amber-200 border-amber-500/40' : 'bg-blue-500/15 text-blue-200 border-blue-500/40'}`}>
                        {rb.severity}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5">{rb.description}</p>
                    <p className="text-slate-500 mt-1">{rb.steps} steps · ~{rb.estimatedTime} · Last tested: {rb.lastTested}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-emerald-500/30" onClick={() => setViewId(viewId === rb.id ? null : rb.id)}>
                      {viewId === rb.id ? 'Close' : 'View'}
                    </Button>
                    <Button size="sm" className="h-6 text-[10px] bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => handleExecute(rb.id)} disabled={executeRb.isPending}>
                      {executeRb.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Play className="mr-1 size-3" />}Execute
                    </Button>
                  </div>
                </div>
                {viewId === rb.id && (
                  <div className="mt-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2 text-xs">
                    <p className="font-semibold text-emerald-200">Runbook Details</p>
                    <div className="grid gap-1 text-[10px]">
                      <div className="flex justify-between"><span className="text-slate-400">Steps</span><span className="text-slate-100">{rb.steps}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Estimated Time</span><span className="text-slate-100">{rb.estimatedTime}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Severity</span><span className={rb.severity === 'CRITICAL' ? 'text-red-300' : rb.severity === 'HIGH' ? 'text-amber-300' : 'text-blue-300'}>{rb.severity}</span></div>
                      <div className="flex justify-between"><span className="text-slate-400">Last Tested</span><span className="text-slate-100">{rb.lastTested}</span></div>
                    </div>
                    <p className="text-slate-400">{rb.description}</p>
                  </div>
                )}
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
