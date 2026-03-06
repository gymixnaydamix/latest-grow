import { TrendingUp } from 'lucide-react';
import { useProviderBillingOverview } from '@/hooks/api/use-provider-console';
import { Panel, SectionPageHeader, SectionShell, StatCard, getAccent } from '../shared';
import { BillingLoadingState, formatCurrency } from './shared';

export function RevenueBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const analytics = data?.analytics;

  return (
    <SectionShell>
      <SectionPageHeader
        icon={TrendingUp}
        title="Revenue Analytics"
        description="MRR, collections, dunning exposure, and monetization health across the provider portfolio."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-6">
        <StatCard label="MRR" value={formatCurrency(analytics?.summary.mrr ?? 0)} sub="Recurring base" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="ARR" value={formatCurrency(analytics?.summary.arr ?? 0)} sub="Annualized run-rate" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Collected" value={formatCurrency(analytics?.summary.collectedThisMonth ?? 0)} sub="This month" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Overdue" value={formatCurrency(analytics?.summary.overdueAmount ?? 0)} sub="Still open" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="ARPT" value={formatCurrency(analytics?.summary.arpt ?? 0)} sub="Avg revenue per tenant" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="At Risk" value={String(analytics?.summary.atRiskTenants ?? 0)} sub="Tenants needing recovery" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <Panel title="Revenue Trend" subtitle="Billed vs collected across the last six months">
          {isLoading || !analytics ? (
            <BillingLoadingState />
          ) : (
            <div className="space-y-3">
              {analytics.monthlyRevenue.map((point) => {
                const peak = Math.max(...analytics.monthlyRevenue.map((entry) => Math.max(entry.billed, entry.collected)), 1);
                return (
                  <div key={point.month}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-100">{point.label}</span>
                      <span className="text-slate-400">
                        {formatCurrency(point.billed)} billed · {formatCurrency(point.collected)} collected
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(point.billed / peak) * 100}%` }} />
                      </div>
                      <div className="h-2 rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(point.collected / peak) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Collections Mix" subtitle="Where revenue is coming from and how it is being paid">
          {isLoading || !analytics ? (
            <BillingLoadingState />
          ) : (
            <div className="space-y-4">
              {analytics.revenueByPlan.map((entry) => (
                <div key={entry.planCode} className="rounded-xl border border-slate-500/20 bg-slate-800/55 p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-100">{entry.planName}</span>
                    <span className="text-emerald-300">{formatCurrency(entry.mrr)}</span>
                  </div>
                  <p className="mt-1 text-slate-400">{entry.tenants} tenants · {formatCurrency(entry.billed)} billed snapshot</p>
                </div>
              ))}
              <div className="space-y-2">
                {analytics.paymentMix.map((entry) => (
                  <div key={entry.method} className="flex items-center justify-between rounded-xl bg-slate-900/50 px-3 py-2 text-xs">
                    <span className="text-slate-200">{entry.method}</span>
                    <span className="text-slate-400">{entry.count} payments · {formatCurrency(entry.volume)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Regional Exposure" subtitle="Invoice footprint by tenant country">
        {isLoading || !analytics ? (
          <BillingLoadingState />
        ) : (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {analytics.regionRevenue.slice(0, 6).map((entry) => (
              <div key={entry.country} className="rounded-xl border border-slate-500/20 bg-slate-800/55 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100">{entry.country}</span>
                  <span className="text-slate-300">{entry.tenants} tenants</span>
                </div>
                <p className="mt-2 text-lg font-bold text-cyan-300">{formatCurrency(entry.billed)}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
