/* ─── ProviderUsageSection ─── Overview · Limit Policies · Exports ─── */
import { useState } from 'react';
import { Activity, Download, PlusCircle, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderUsage,
  useProviderLimits,
  useProviderTenants,
  useCreateProviderUsageExport,
  useUpdateProviderLimit,
  useCreateProviderLimit,
} from '@/hooks/api/use-provider-console';
import type { UsageLimitState } from '@root/types';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, ProgressBar, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderUsageSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'usage_overview': return <UsageOverview />;
    case 'usage_limits':   return <LimitPoliciesView />;
    case 'usage_exports':  return <UsageExportsView />;
    default: return <UsageOverview />;
  }
}

/* ── Shared data hook ── */
function useUsageData() {
  const { data: usage } = useProviderUsage();
  const { data: limits } = useProviderLimits();
  const { data: tenants } = useProviderTenants({});
  const usageRows = (usage ?? []) as Array<Record<string, unknown>>;
  const limitRows = (limits ?? []) as UsageLimitState[];
  const tenantList = tenants ?? [];
  const tenantMap = new Map<string, Array<Record<string, unknown>>>();
  for (const row of usageRows) {
    const tid = String(row.tenantId ?? '');
    if (!tenantMap.has(tid)) tenantMap.set(tid, []);
    tenantMap.get(tid)!.push(row);
  }
  const overLimitCount = limitRows.filter((l) => l.currentValue >= l.hardLimit).length;
  const nearLimitCount = limitRows.filter((l) => l.currentValue >= l.softLimit && l.currentValue < l.hardLimit).length;
  return { usageRows, limitRows, tenantList, tenantMap, overLimitCount, nearLimitCount };
}

/* ── Usage Overview ── */
function UsageOverview() {
  const { usageRows, tenantList, tenantMap, overLimitCount, nearLimitCount } = useUsageData();
  const accent = getAccent('provider_usage');
  return (
    <SectionShell>
      <SectionPageHeader icon={Activity} title="Usage Explorer" description="Per-tenant metrics and consumption data" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Tenants" value={String(tenantList.length)} sub={`${usageRows.length} data points`} gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Metric Types" value="6" sub="Students · Teachers · Parents · Storage · Notifications · Concurrency" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Near Limit" value={String(nearLimitCount)} sub="Approaching soft limit" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Over Limit" value={String(overLimitCount)} sub="Exceeded hard limit" gradient="from-red-500/10 to-red-500/5" />
      </div>
      <Panel title="Usage by Tenant" subtitle={`${tenantMap.size} tenants with metrics`}>
        <div className="space-y-2">
          {Array.from(tenantMap.entries()).slice(0, 20).map(([tid, metrics]) => (
            <Row key={tid}>
              <p className="mb-1 font-semibold text-slate-100">{tid}</p>
              <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                {metrics.map((m) => (
                  <div key={String(m.id)} className="rounded-md bg-slate-700/60 px-2 py-1 text-center">
                    <p className="text-[10px] text-slate-400">{String(m.metricType)}</p>
                    <p className="font-bold text-slate-100">{String(m.value)}</p>
                  </div>
                ))}
              </div>
            </Row>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Limit Policies ── */
function LimitPoliciesView() {
  const { limitRows, tenantList } = useUsageData();
  const updateLimit = useUpdateProviderLimit();
  const createLimit = useCreateProviderLimit();
  const accent = getAccent('provider_usage');

  const [showNew, setShowNew] = useState(false);
  const [newTenant, setNewTenant] = useState('');
  const [newMetric, setNewMetric] = useState('STUDENTS');
  const [newSoft, setNewSoft] = useState('');
  const [newHard, setNewHard] = useState('');

  return (
    <SectionShell>
      <SectionPageHeader icon={SlidersHorizontal} title="Limit Policies" description="Enforcement rules and threshold management" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />New Limit
        </Button>
      } />

      {/* Create new limit form */}
      {showNew && (
        <Panel title="Create Limit Policy" accentBorder="border-blue-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-5">
            <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={newTenant} onChange={(e) => setNewTenant(e.target.value)}>
              <option value="">Select tenant…</option>
              {tenantList.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={newMetric} onChange={(e) => setNewMetric(e.target.value)}>
              {['STUDENTS', 'TEACHERS', 'PARENTS', 'STORAGE_GB', 'NOTIFICATIONS', 'CONCURRENCY'].map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Soft limit" value={newSoft} onChange={(e) => setNewSoft(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Hard limit" value={newHard} onChange={(e) => setNewHard(e.target.value)} />
            <Button size="sm" className="h-8 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => {
              if (!newTenant || !newSoft || !newHard) return;
              const reason = reasonPrompt('Create limit policy');
              if (!reason) return;
              createLimit.mutate({ tenantId: newTenant, metricType: newMetric, softLimit: Number(newSoft), hardLimit: Number(newHard), overageEnabled: false, blockPolicy: 'BLOCK', reason });
              setShowNew(false); setNewTenant(''); setNewSoft(''); setNewHard('');
            }}>Create</Button>
          </div>
        </Panel>
      )}

      {limitRows.length === 0 ? (
        <EmptyState icon={SlidersHorizontal} title="No Limits Configured" description="Usage limits will appear here once configured" />
      ) : (
        <Panel title="Enforcement Rules" subtitle={`${limitRows.length} policies`}>
          <div className="space-y-2">
            {limitRows.map((lim) => {
              const pct = lim.hardLimit > 0 ? Math.round((lim.currentValue / lim.hardLimit) * 100) : 0;
              const warn = pct >= 90;
              const over = lim.currentValue >= lim.hardLimit;
              return (
                <Row key={lim.id} className={over ? 'border-red-500/40' : warn ? 'border-amber-500/40' : ''}>
                  <div className="mb-1 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-100">{lim.tenantId}</span>
                      <span className="ml-2 text-slate-400">{lim.metricType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">{lim.currentValue} / {lim.hardLimit}</span>
                      <StatusBadge status={over ? 'BLOCKED' : warn ? 'WARNING' : 'HEALTHY'} />
                      <Button size="sm" className="h-6 bg-slate-700 text-slate-200 hover:bg-slate-600 text-[10px]" onClick={() => {
                        const reason = reasonPrompt('Edit policy');
                        if (!reason) return;
                        const newHardVal = window.prompt('New hard limit:', String(lim.hardLimit));
                        if (!newHardVal) return;
                        const newSoftVal = window.prompt('New soft limit:', String(lim.softLimit));
                        if (!newSoftVal) return;
                        updateLimit.mutate({ limitId: lim.id, softLimit: Number(newSoftVal), hardLimit: Number(newHardVal), overageEnabled: lim.overageEnabled, blockPolicy: lim.blockPolicy, reason });
                      }}>Edit Policy</Button>
                    </div>
                  </div>
                  <ProgressBar value={lim.currentValue} max={lim.hardLimit} color={over ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-sky-500'} />
                  <div className="mt-1 flex gap-3 text-[10px] text-slate-400">
                    <span>Soft: {lim.softLimit}</span>
                    <span>Hard: {lim.hardLimit}</span>
                    <span>Overage: {lim.overageEnabled ? 'Allowed' : 'Blocked'}</span>
                    <span>Policy: {lim.blockPolicy}</span>
                  </div>
                </Row>
              );
            })}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Usage Exports ── */
function UsageExportsView() {
  const { usageRows, tenantList } = useUsageData();
  const createExport = useCreateProviderUsageExport();
  const accent = getAccent('provider_usage');

  const reports = [
    { name: 'Monthly Summary', desc: 'Aggregate usage per tenant per month', format: 'CSV' as const, type: 'monthly_summary' },
    { name: 'Detail Export', desc: 'Raw metric data points with timestamps', format: 'JSON' as const, type: 'detail' },
    { name: 'Limit Report', desc: 'Tenants approaching or exceeding limits', format: 'PDF' as const, type: 'limit_report' },
  ];

  return (
    <SectionShell>
      <SectionPageHeader icon={Download} title="Usage Reports" description="Export consumption data for analysis" accent={accent} />
      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        {reports.map((report) => {
          const selectId = `range-${report.type}`;
          return (
            <Panel key={report.name} title={report.name} accentBorder="border-blue-500/20">
              <div className="space-y-2 text-xs">
                <p className="text-slate-400">{report.desc}</p>
                <div className="flex gap-2">
                  <select id={selectId} className="h-7 flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100">
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="custom">Custom range</option>
                  </select>
                  <Button
                    size="sm"
                    className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30"
                    disabled={createExport.isPending}
                    onClick={() => {
                      const selectEl = document.getElementById(selectId) as HTMLSelectElement | null;
                      const dateRange = selectEl?.value ?? '30d';
                      createExport.mutate({ reportType: report.type, dateRange, format: report.format });
                    }}
                  >
                    <Download className="mr-1 size-3" />{createExport.isPending ? '…' : report.format}
                  </Button>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
      <div className="grid gap-2 grid-cols-2">
        <StatCard label="Data Points" value={String(usageRows.length)} sub="Total metrics recorded" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Tenants" value={String(tenantList.length)} sub="With active usage data" gradient="from-violet-500/10 to-violet-500/5" />
      </div>
    </SectionShell>
  );
}
