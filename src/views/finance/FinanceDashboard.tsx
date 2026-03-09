/* ─── FinanceDashboard ─── Holographic finance operations centre ──────
 * Revenue KPIs, charts, invoices table, budget tracking.
 * Per FINANCE.md
 * ──────────────────────────────────────────────────────────────────── */
import { useMemo } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  DollarSign, CreditCard,
  Receipt, Wallet, Activity,
} from 'lucide-react';
import { useInvoices, useBudgets } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/store/navigation.store';

/* ── Feature components ── */
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';
import { GlowDonutChart } from '@/components/features/charts/DonutChart';
import { PageHeader } from '@/components/layout/PageHeader';
import { KPITicker } from '@/components/features/KPITicker';
import { DataTable } from '@/components/features/DataTable';
import { EmptyState } from '@/components/features/EmptyState';

/* ── Section components ── */
import { FinanceSchoolSection } from './sections/FinanceSchoolSection';
import { ConciergeAISection } from '@/views/shared/sections/ConciergeAISection';
import { AccountSection } from '@/views/shared/sections/AccountSection';
import FinanceAnalyticsView from '@/views/finance/FinanceAnalyticsView';

/* ── Fallback static data ── */
const fallbackKpiSparklines = {
  revenue: [980, 1020, 1060, 1100, 1150, 1200, 1245],
  outstanding: [65, 58, 52, 48, 45, 43, 42.3],
  collected: [72, 75, 78, 80, 83, 85, 86.5],
  invoices: [120, 128, 135, 140, 148, 152, 156],
};

const fallbackRevenueByMonth = [
  { name: 'Jul', primary: 95, secondary: 88 },
  { name: 'Aug', primary: 125, secondary: 110 },
  { name: 'Sep', primary: 110, secondary: 102 },
  { name: 'Oct', primary: 98, secondary: 92 },
  { name: 'Nov', primary: 105, secondary: 95 },
  { name: 'Dec', primary: 88, secondary: 80 },
];

const fallbackExpenseBreakdown = [
  { name: 'Salaries', value: 58, color: '#818cf8' },
  { name: 'Supplies', value: 15, color: '#34d399' },
  { name: 'Utilities', value: 12, color: '#fbbf24' },
  { name: 'Technology', value: 10, color: '#f472b6' },
  { name: 'Other', value: 5, color: '#94a3b8' },
];

const fallbackRevenueSourceSplit = [
  { name: 'Tuition', value: 65, color: '#818cf8' },
  { name: 'Fees', value: 18, color: '#34d399' },
  { name: 'Grants', value: 10, color: '#fbbf24' },
  { name: 'Donations', value: 7, color: '#f472b6' },
];

const fallbackFinanceTickerItems = [
  { label: 'Revenue YTD', value: '$1.24M', change: '+8.2%', trend: 'up' as const },
  { label: 'Outstanding', value: '$42.3K', change: '-12%', trend: 'down' as const },
  { label: 'Collected MTD', value: '$86.5K', change: '+3.5%', trend: 'up' as const },
  { label: 'Avg Invoice', value: '$2,450', trend: 'up' as const },
  { label: 'Collection Rate', value: '94.2%', change: '+1.3%', trend: 'up' as const },
  { label: 'Overdue', value: '12', change: '-3', trend: 'down' as const },
];

export function FinanceDashboard() {
  const { activeHeader, activeSection } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader, activeSection]);
  const { schoolId } = useAuthStore();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices(schoolId);
  const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(schoolId);

  /* ── Derive real KPI values from invoices ── */
  const invoiceStats = useMemo(() => {
    if (!invoices.length) return null;
    const total = invoices.reduce((s, inv) => s + Number(inv.totalAmount ?? 0), 0);
    const paid = invoices.filter((i) => i.status === 'PAID').reduce((s, inv) => s + Number(inv.totalAmount ?? 0), 0);
    const outstanding = total - paid;
    const overdue = invoices.filter((i) => i.status === 'OVERDUE').length;
    return { total, paid, outstanding, overdue, count: invoices.length };
  }, [invoices]);

  const totalExpenses = useMemo(() => {
    return budgets.reduce((s, b) => s + (b.spentAmount ?? 0), 0);
  }, [budgets]);

  const financeTickerItems = useMemo(() => {
    if (!invoiceStats) return fallbackFinanceTickerItems;
    return [
      { label: 'Revenue YTD', value: `$${(invoiceStats.total / 1000).toFixed(0)}K`, change: '+8.2%', trend: 'up' as const },
      { label: 'Outstanding', value: `$${(invoiceStats.outstanding / 1000).toFixed(1)}K`, change: '-12%', trend: 'down' as const },
      { label: 'Collected MTD', value: `$${(invoiceStats.paid / 1000).toFixed(1)}K`, change: '+3.5%', trend: 'up' as const },
      { label: 'Avg Invoice', value: `$${Math.round(invoiceStats.total / invoiceStats.count).toLocaleString()}`, trend: 'up' as const },
      { label: 'Collection Rate', value: `${((invoiceStats.paid / invoiceStats.total) * 100).toFixed(1)}%`, change: '+1.3%', trend: 'up' as const },
      { label: 'Overdue', value: String(invoiceStats.overdue), change: '-3', trend: 'down' as const },
    ];
  }, [invoiceStats]);

  // Route to section components for non-dashboard sections
  const sectionContent = (() => {
    switch (activeSection) {
      case 'school': return <FinanceSchoolSection />;
      case 'concierge_ai': return <ConciergeAISection />;
      case 'setting': return <AccountSection />;
      default: return null;
    }
  })();

  if (sectionContent) {
    return <div ref={containerRef} className="space-y-6">{sectionContent}</div>;
  }

  // Dashboard header-level routing (analytics)
  if (activeHeader === 'analytics') {
    return <div ref={containerRef} className="space-y-6"><FinanceAnalyticsView /></div>;
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── PageHeader + Ticker ── */}
      <PageHeader
        data-animate
        title="Finance Centre 💰"
        description={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        badge="Live"
        icon={<Activity className="size-5" />}
      />
      <KPITicker items={financeTickerItems} />

      {/* ── Holographic KPI Cards ── */}
      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={invoiceStats ? Math.round(invoiceStats.total / 1000) : 1245}
          prefix="$"
          suffix="K"
          trend="up"
          trendLabel="+8.2% YoY"
          icon={<DollarSign className="size-5" />}
          accentColor="#34d399"
          sparklineData={fallbackKpiSparklines.revenue}
        />
        <StatCard
          label="Outstanding"
          value={invoiceStats ? Number((invoiceStats.outstanding / 1000).toFixed(1)) : 42.3}
          prefix="$"
          suffix="K"
          decimals={1}
          trend="down"
          trendLabel="-12% this month"
          icon={<Wallet className="size-5" />}
          accentColor="#fbbf24"
          sparklineData={fallbackKpiSparklines.outstanding}
        />
        <StatCard
          label="Collected MTD"
          value={invoiceStats ? Number((invoiceStats.paid / 1000).toFixed(1)) : 86.5}
          prefix="$"
          suffix="K"
          decimals={1}
          trend="up"
          trendLabel="+3.5%"
          icon={<CreditCard className="size-5" />}
          accentColor="#818cf8"
          sparklineData={fallbackKpiSparklines.collected}
        />
        <StatCard
          label="Active Invoices"
          value={invoices.length ?? 156}
          trend="up"
          trendLabel="+12 this month"
          icon={<Receipt className="size-5" />}
          accentColor="#f472b6"
          sparklineData={fallbackKpiSparklines.invoices}
        />
      </div>

      {/* ── Revenue Chart + Expense Breakdown + Revenue Sources ── */}
      <div data-animate className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <NeonBarChart
            title="Revenue by Month"
            subtitle="Tuition collected vs. last year ($K)"
            data={(invoices as any)?.revenueByMonth ?? fallbackRevenueByMonth}
            dataKey="primary"
            secondaryDataKey="secondary"
            xAxisKey="name"
            colors={['#818cf8']}
            secondaryColor="#34d399"
            height={260}
          />
        </div>
        <div className="lg:col-span-2">
          <GlowPieChart
            title="Expense Breakdown"
            subtitle="By category"
            data={(budgets as any)?.expenseBreakdown ?? fallbackExpenseBreakdown}
            centerLabel="Total"
            centerValue={invoiceStats ? `$${(totalExpenses / 1_000_000).toFixed(1)}M` : '$1.1M'}
          />
        </div>
        <div className="lg:col-span-1">
          <GlowDonutChart
            data={(budgets as any)?.revenueSourceSplit ?? fallbackRevenueSourceSplit}
            centerLabel="Revenue"
            centerValue={invoiceStats ? `$${(invoiceStats.total / 1000).toFixed(0)}K` : '$1.24M'}
            height={260}
            showLegend
          />
        </div>
      </div>

      {/* ── Recent Invoices (DataTable) ── */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Recent Invoices</CardTitle>
          <CardDescription className="text-white/35">Latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <EmptyState title="No invoices" description="No invoices have been created yet." icon={<Receipt className="size-10" />} />
          ) : (
            <DataTable
              data={invoices as unknown as Record<string, unknown>[]}
              searchable
              searchKeys={['id', 'parentId']}
              pageSize={5}
              columns={[
                { key: 'id', header: 'Invoice', render: (row) => <span className="font-mono text-xs text-white/50">{String(row.id).slice(0, 13)}</span> },
                { key: 'parentId', header: 'Family', render: (row) => <span className="text-white/70">{row.parentId ? String(row.parentId) : '—'}</span> },
                { key: 'totalAmount', header: 'Amount', sortable: true, render: (row) => <span className="font-semibold text-white/80">${Number(row.totalAmount).toLocaleString()}</span> },
                { key: 'status', header: 'Status', render: (row) => {
                  const s = String(row.status);
                  return <Badge variant="outline" className={`text-[10px] ${s === 'PAID' ? 'border-emerald-500/30 text-emerald-400' : s === 'OVERDUE' ? 'border-rose-500/30 text-rose-400' : 'border-amber-500/30 text-amber-400'}`}>{s}</Badge>;
                }},
                { key: 'dueDate', header: 'Date', render: (row) => <span className="text-white/35">{new Date(String(row.dueDate)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span> },
              ]}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Department Budgets ── */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Department Budgets</CardTitle>
          <CardDescription className="text-white/35">Budget vs actual spending</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {budgetsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="mt-1.5 h-2 w-full" />
              </div>
            ))
          ) : budgets.length === 0 ? (
            <EmptyState title="No budgets" description="No department budgets configured yet." icon={<Wallet className="size-8" />} />
          ) : (
            budgets.map((item) => {
              const pct = item.allocatedAmount > 0 ? Math.round((item.spentAmount / item.allocatedAmount) * 100) : 0;
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white/80">{item.department}</span>
                    <span className="text-white/40">
                      ${item.spentAmount.toLocaleString()} / ${item.allocatedAmount.toLocaleString()}
                      <span className="ml-1 text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-linear-to-r from-rose-500 to-red-500' : 'bg-linear-to-r from-indigo-500 to-violet-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
