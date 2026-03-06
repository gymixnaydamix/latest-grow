/* ─── ProviderAnalyticsSection ─── Revenue · Engagement · Churn · Reports ─── */
import { useState } from 'react';
import { AlertTriangle, ClipboardList, Download, Loader2, PlusCircle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderModuleData, useProviderTenants, useProviderReports, useExportProviderAnalyticsReport, useCreateProviderScheduledReport, useRunProviderReport } from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderAnalyticsSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'analytics_revenue':    return <RevenueAnalyticsView />;
    case 'analytics_engagement': return <EngagementView />;
    case 'analytics_churn':      return <ChurnView />;
    case 'analytics_reports':    return <ReportsView />;
    default:                     return <RevenueAnalyticsView />;
  }
}

/* ── Revenue Analytics ── */
function RevenueAnalyticsView() {
  const { data: moduleData } = useProviderModuleData();
  const accent = getAccent('provider_analytics');
  const subscriptions = (moduleData?.subscriptions ?? []) as unknown as Array<Record<string, unknown>>;
  const invoices = (moduleData?.invoices ?? []) as unknown as Array<Record<string, unknown>>;
  const exportReport = useExportProviderAnalyticsReport();

  const totalMrr = subscriptions.reduce((s, sub) => s + Number(sub.monthlyPrice ?? 0), 0);
  const arr = totalMrr * 12;
  const paidInvoices = invoices.filter((i) => i.status === 'PAID');
  const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.amount ?? 0), 0);
  const avgRevenuePerTenant = subscriptions.length > 0 ? Math.round(totalMrr / subscriptions.length) : 0;

  const handleExport = () => {
    const reason = reasonPrompt('Export revenue report');
    if (!reason) return;
    exportReport.mutate({ type: 'revenue', format: 'CSV', reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={TrendingUp} title="Revenue Analytics" description="MRR, ARR, LTV, and revenue trends" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={handleExport} disabled={exportReport.isPending}>
          {exportReport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Download className="mr-1 size-3" />}Export Report
        </Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="MRR" value={`$${totalMrr.toLocaleString()}`} sub="Monthly recurring" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="ARR" value={`$${arr.toLocaleString()}`} sub="Annual recurring" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} sub={`${paidInvoices.length} paid invoices`} gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="ARPT" value={`$${avgRevenuePerTenant.toLocaleString()}`} sub="Avg per tenant/mo" gradient="from-cyan-500/10 to-cyan-500/5" />
      </div>

      <Panel title="Revenue Breakdown by Plan" subtitle="Monthly recurring revenue per plan tier">
        <div className="space-y-2">
          {['BASIC', 'STANDARD', 'PREMIUM', 'ENTERPRISE'].map((plan) => {
            const planSubs = subscriptions.filter((s) => String(s.planCode) === plan);
            const planMrr = planSubs.reduce((s, sub) => s + Number(sub.monthlyPrice ?? 0), 0);
            const pct = totalMrr > 0 ? Math.round((planMrr / totalMrr) * 100) : 0;
            return (
              <Row key={plan}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">{plan}</p>
                    <p className="text-slate-400">{planSubs.length} subscriptions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sky-300">${planMrr.toLocaleString()}/mo</p>
                    <p className="text-slate-400">{pct}% of MRR</p>
                  </div>
                </div>
              </Row>
            );
          })}
        </div>
      </Panel>

      <Panel title="LTV Estimates" subtitle="Customer lifetime value projections">
        <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
          <StatCard label="Avg LTV" value={`$${(avgRevenuePerTenant * 24).toLocaleString()}`} sub="24-month estimate" gradient="from-emerald-500/10 to-emerald-500/5" />
          <StatCard label="Best Plan LTV" value={`$${(avgRevenuePerTenant * 36).toLocaleString()}`} sub="36-month enterprise" gradient="from-blue-500/10 to-blue-500/5" />
          <StatCard label="Payback Period" value="3.2 mo" sub="Avg CAC recovery" gradient="from-amber-500/10 to-amber-500/5" />
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Engagement ── */
function EngagementView() {
  const tenantsQuery = useProviderTenants({});
  const accent = getAccent('provider_analytics');
  const tenants = (tenantsQuery.data ?? []) as Array<Record<string, unknown>>;
  const totalStudents = tenants.reduce((s, t) => s + Number(t.activeStudents ?? 0), 0);
  const totalTeachers = tenants.reduce((s, t) => s + Number(t.activeTeachers ?? 0), 0);
  const totalParents = tenants.reduce((s, t) => s + Number(t.activeParents ?? 0), 0);
  const totalUsers = totalStudents + totalTeachers + totalParents;

  return (
    <SectionShell>
      <SectionPageHeader icon={Users} title="Engagement Metrics" description="Platform-wide user activity and adoption" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} sub="Across all tenants" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Students" value={totalStudents.toLocaleString()} sub="Active learners" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Teachers" value={totalTeachers.toLocaleString()} sub="Active educators" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Parents" value={totalParents.toLocaleString()} sub="Active guardians" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <Panel title="Engagement by Tenant" subtitle="User activity heatmap">
        <div className="space-y-2">
          {tenants.slice(0, 15).map((t) => {
            const users = Number(t.activeStudents ?? 0) + Number(t.activeTeachers ?? 0) + Number(t.activeParents ?? 0);
            return (
              <Row key={String(t.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">{String(t.name)}</p>
                    <p className="text-slate-400">{Number(t.activeStudents ?? 0)}S · {Number(t.activeTeachers ?? 0)}T · {Number(t.activeParents ?? 0)}P</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{users}</span>
                    <StatusBadge status={String(t.status ?? 'ACTIVE')} />
                  </div>
                </div>
              </Row>
            );
          })}
          {tenants.length === 0 && <EmptyState title="No Tenants" description="No tenant data available for engagement metrics." />}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Churn ── */
function ChurnView() {
  const tenantsQuery = useProviderTenants({});
  const accent = getAccent('provider_analytics');
  const tenants = (tenantsQuery.data ?? []) as Array<Record<string, unknown>>;
  const suspended = tenants.filter((t) => t.status === 'SUSPENDED');
  const paymentDue = tenants.filter((t) => t.status === 'PAYMENT_DUE');
  const atRisk = tenants.filter((t) => t.health === 'WARNING' || t.health === 'CRITICAL');
  const churnRate = tenants.length > 0 ? Math.round((suspended.length / tenants.length) * 100) : 0;

  return (
    <SectionShell>
      <SectionPageHeader icon={AlertTriangle} title="Churn Analysis" description="Retention risk identification and prevention" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Churn Rate" value={`${churnRate}%`} sub="Suspended / total" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Suspended" value={String(suspended.length)} sub="Cancelled accounts" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Payment Due" value={String(paymentDue.length)} sub="Billing issues" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="At Risk" value={String(atRisk.length)} sub="Health warnings" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      {atRisk.length > 0 && (
        <Panel title="At-Risk Tenants" subtitle={`${atRisk.length} tenants showing warning signs`} accentBorder="border-amber-500/20">
          <div className="space-y-2">
            {atRisk.map((t) => (
              <Row key={String(t.id)} className="border-amber-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-100">{String(t.name)}</p>
                    <p className="text-slate-400">{String(t.planCode ?? '—')} · Last login: {String(t.lastLoginAt ?? '—').slice(0, 10)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={String(t.health ?? 'WARNING')} />
                    <StatusBadge status={String(t.status ?? 'ACTIVE')} />
                  </div>
                </div>
              </Row>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Retention Strategies" accentBorder="border-emerald-500/20">
        <div className="grid gap-2 md:grid-cols-2">
          {[
            { name: 'Early Warning System', desc: 'Alert when usage drops below baseline for 7+ days', status: 'ACTIVE' },
            { name: 'Win-back Campaign', desc: 'Automated outreach to suspended tenants', status: 'ACTIVE' },
            { name: 'Payment Recovery', desc: 'Dunning + grace period before suspension', status: 'ACTIVE' },
            { name: 'Health Check Calls', desc: 'Quarterly business review with at-risk tenants', status: 'PENDING' },
          ].map((s) => (
            <Row key={s.name}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-100">{s.name}</p>
                  <p className="text-slate-400">{s.desc}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            </Row>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Reports ── */
function ReportsView() {
  const accent = getAccent('provider_analytics');
  const { data: reports, isLoading } = useProviderReports();
  const reportsList = reports ?? [];
  const createReport = useCreateProviderScheduledReport();
  const runReport = useRunProviderReport();
  const [showNew, setShowNew] = useState(false);
  const [rName, setRName] = useState('');
  const [rFreq, setRFreq] = useState('WEEKLY');
  const [rFormat, setRFormat] = useState('CSV');

  const handleCreate = () => {
    const reason = reasonPrompt('Create scheduled report');
    if (!reason) return;
    createReport.mutate({ name: rName, type: 'SCHEDULED', frequency: rFreq, format: rFormat, recipients: [], reason }, { onSuccess: () => { setShowNew(false); setRName(''); } });
  };

  const handleRun = (id: string) => {
    const reason = reasonPrompt('Run report now');
    if (!reason) return;
    runReport.mutate({ reportId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={ClipboardList} title="Scheduled Reports" description="Automated report generation and distribution" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Report</Button>
      } />

      {showNew && (
        <Panel title="Create Report" accentBorder="border-blue-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Report name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={rFreq} onChange={(e) => setRFreq(e.target.value)}>
              <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option>
            </select>
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={rFormat} onChange={(e) => setRFormat(e.target.value)}>
              <option value="CSV">CSV</option><option value="JSON">JSON</option><option value="PDF">PDF</option>
            </select>
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={handleCreate} disabled={!rName.trim() || createReport.isPending}>
              {createReport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}

      <Panel title="Report Library" subtitle={`${reportsList.length} configured reports`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-orange-400" /></div>
        ) : reportsList.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No Reports" description="No scheduled reports configured yet." />
        ) : (
          <div className="space-y-2">
            {reportsList.map((rpt) => (
              <Row key={rpt.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{rpt.name}</p>
                    <p className="text-slate-400">Schedule: {rpt.frequency} · Last: {rpt.lastRun}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{rpt.format}</span>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-blue-500/30" onClick={() => handleRun(rpt.id)} disabled={runReport.isPending}>
                      {runReport.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Run Now
                    </Button>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-blue-500/30" disabled>Download</Button>
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
