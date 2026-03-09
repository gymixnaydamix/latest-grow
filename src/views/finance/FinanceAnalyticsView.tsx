/* ─── FinanceAnalyticsView ─── Financial analytics dashboard ───── */
import { BarChart3, DollarSign, CreditCard, Receipt, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { StatCard } from '@/components/features/StatCard';
import { NeonBarChart } from '@/components/features/charts/BarChart';
import { GlowLineChart } from '@/components/features/charts/LineChart';
import { GlowPieChart } from '@/components/features/charts/PieChart';
import { useFinancialReportSummary, useInvoices } from '@/hooks/api/use-finance';
import { useAuthStore } from '@/store/auth.store';

const FALLBACK_MONTHLY_REVENUE = [
  { name: 'Jul', revenue: 95000, expenses: 72000 },
  { name: 'Aug', revenue: 125000, expenses: 85000 },
  { name: 'Sep', revenue: 118000, expenses: 78000 },
  { name: 'Oct', revenue: 105000, expenses: 75000 },
  { name: 'Nov', revenue: 112000, expenses: 80000 },
  { name: 'Dec', revenue: 98000, expenses: 82000 },
  { name: 'Jan', revenue: 130000, expenses: 88000 },
  { name: 'Feb', revenue: 142000, expenses: 90000 },
  { name: 'Mar', revenue: 155000, expenses: 92000 },
];

const FALLBACK_COLLECTION_TREND = [
  { name: 'Sep', rate: 82 },
  { name: 'Oct', rate: 84 },
  { name: 'Nov', rate: 86 },
  { name: 'Dec', rate: 83 },
  { name: 'Jan', rate: 88 },
  { name: 'Feb', rate: 91 },
  { name: 'Mar', rate: 93 },
];

const FALLBACK_EXPENSE_BREAKDOWN = [
  { name: 'Salaries', value: 45, color: '#818cf8' },
  { name: 'Facilities', value: 20, color: '#34d399' },
  { name: 'Technology', value: 12, color: '#fbbf24' },
  { name: 'Supplies', value: 8, color: '#f472b6' },
  { name: 'Insurance', value: 7, color: '#60a5fa' },
  { name: 'Other', value: 8, color: '#a78bfa' },
];

const FALLBACK_OVERDUE_ACCOUNTS = [
  { account: 'Johnson Family', amount: '$2,450', days: 45, risk: 'high' },
  { account: 'Martinez Corp', amount: '$8,200', days: 32, risk: 'high' },
  { account: 'Chen Academy', amount: '$1,800', days: 21, risk: 'medium' },
  { account: 'Wilson Trust', amount: '$3,100', days: 15, risk: 'medium' },
  { account: 'Parker Foundation', amount: '$950', days: 8, risk: 'low' },
];

export default function FinanceAnalyticsView() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const { schoolId } = useAuthStore();
  const { data: apiReport } = useFinancialReportSummary(schoolId);
  const { data: apiInvoices } = useInvoices(schoolId);

  const MONTHLY_REVENUE = (apiReport as any)?.monthlyRevenue ?? FALLBACK_MONTHLY_REVENUE;
  const COLLECTION_TREND = (apiReport as any)?.collectionTrend ?? FALLBACK_COLLECTION_TREND;
  const EXPENSE_BREAKDOWN = (apiReport as any)?.expenseBreakdown ?? FALLBACK_EXPENSE_BREAKDOWN;
  const OVERDUE_ACCOUNTS = (apiInvoices as any[])?.filter((inv: any) => inv.status === 'OVERDUE').slice(0, 5).map((inv: any) => ({
    account: inv.parentId ?? 'Unknown', amount: `$${Number(inv.totalAmount ?? 0).toLocaleString()}`,
    days: Math.ceil((Date.now() - new Date(inv.dueDate).getTime()) / 86400000), risk: 'high' as const,
  })) ?? FALLBACK_OVERDUE_ACCOUNTS;

  const totalRevenue = MONTHLY_REVENUE.reduce((s: number, m: any) => s + (m.revenue ?? 0), 0);
  const totalExpenses = MONTHLY_REVENUE.reduce((s: number, m: any) => s + (m.expenses ?? 0), 0);
  const latestCollectionRate = COLLECTION_TREND.at(-1)?.rate ?? 93;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center gap-2">
        <BarChart3 className="size-5 text-emerald-400" />
        <h2 className="text-lg font-bold text-white/90">Financial Analytics</h2>
        <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-auto">FY 2024–25</Badge>
      </div>

      {/* KPI Cards */}
      <div data-animate className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Net Revenue"
          value={Number((totalRevenue / 1_000_000).toFixed(2))}
          prefix="$"
          suffix="M"
          decimals={2}
          trend="up"
          trendLabel="+12.3% YoY"
          icon={<DollarSign className="size-5" />}
          accentColor="#34d399"
          sparklineData={MONTHLY_REVENUE.map((m: any) => m.revenue / 1000)}
        />
        <StatCard
          label="Total Expenses"
          value={Math.round(totalExpenses / 1000)}
          prefix="$"
          suffix="K"
          trend="up"
          trendLabel="+5.8% YoY"
          icon={<CreditCard className="size-5" />}
          accentColor="#fbbf24"
          sparklineData={MONTHLY_REVENUE.map((m: any) => m.expenses / 1000)}
        />
        <StatCard
          label="Collection Rate"
          value={latestCollectionRate}
          suffix="%"
          trend="up"
          trendLabel="+4.2% this quarter"
          icon={<Receipt className="size-5" />}
          accentColor="#818cf8"
          sparklineData={COLLECTION_TREND.map((c: any) => c.rate)}
        />
        <StatCard
          label="Overdue Invoices"
          value={OVERDUE_ACCOUNTS.length}
          trend="down"
          trendLabel="-4 this month"
          icon={<PieChart className="size-5" />}
          accentColor="#f472b6"
        />
      </div>

      {/* Revenue vs Expenses + Expense Breakdown */}
      <div data-animate className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <NeonBarChart
            title="Revenue vs Expenses"
            subtitle="Monthly comparison — current fiscal year"
            data={MONTHLY_REVENUE.map((m: any) => ({ name: m.name, primary: m.revenue / 1000, secondary: m.expenses / 1000 }))}
            dataKey="primary"
            secondaryDataKey="secondary"
            xAxisKey="name"
            colors={['#34d399']}
            secondaryColor="#f472b6"
            height={280}
          />
        </div>
        <div className="lg:col-span-2">
          <GlowPieChart
            title="Expense Breakdown"
            subtitle="Budget allocation by category"
            data={EXPENSE_BREAKDOWN}
            height={280}
          />
        </div>
      </div>

      {/* Collection Trend */}
      <div data-animate>
        <GlowLineChart
          title="Collection Rate Trend"
          subtitle="Monthly payment collection efficiency"
          data={COLLECTION_TREND}
          dataKey="rate"
          xAxisKey="name"
          color="#818cf8"
          height={220}
        />
      </div>

      {/* Overdue Accounts */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white/90 text-sm flex items-center gap-2">
            <Receipt className="size-4 text-rose-400" />
            Overdue Accounts
            <Badge className="border-0 bg-rose-400/10 text-rose-400 text-[10px] ml-auto">{OVERDUE_ACCOUNTS.length} accounts</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {OVERDUE_ACCOUNTS.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className={`size-2 rounded-full ${a.risk === 'high' ? 'bg-rose-400' : a.risk === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                  <span className="text-xs text-white/70">{a.account}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-white/80">{a.amount}</span>
                  <span className="text-[10px] text-white/40">{a.days}d overdue</span>
                  {a.risk === 'high' ? (
                    <ArrowUpRight className="size-3 text-rose-400" />
                  ) : (
                    <ArrowDownRight className="size-3 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
