/* ─── FinanceSimPage ─── Personal finance simulator ───────────────── */
import { useState } from 'react';
import {
  DollarSign, TrendingUp, PiggyBank, CreditCard,
  Wallet, ArrowUpRight, ArrowDownRight,
  Target, ShoppingCart, Home, Car, GraduationCap,
  Briefcase, LineChart, Coins, Calculator, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

const BALANCE = 12450;
const INCOME_MONTHLY = 2400;
const EXPENSES_MONTHLY = 1650;
const SAVINGS_RATE = 31;

const ACCOUNTS = [
  { name: 'Checking', balance: 3200, icon: Wallet, color: 'text-indigo-400' },
  { name: 'Savings', balance: 7500, icon: PiggyBank, color: 'text-emerald-400' },
  { name: 'Investments', balance: 1750, icon: TrendingUp, color: 'text-violet-400' },
];

const TRANSACTIONS = [
  { desc: 'Part-time Job', amount: 600, type: 'income', category: 'Work', date: 'Mar 3' },
  { desc: 'Textbooks', amount: -89, type: 'expense', category: 'Education', date: 'Mar 2' },
  { desc: 'Groceries', amount: -45, type: 'expense', category: 'Food', date: 'Mar 1' },
  { desc: 'Freelance Project', amount: 200, type: 'income', category: 'Work', date: 'Feb 28' },
  { desc: 'Streaming Subscription', amount: -15, type: 'expense', category: 'Entertainment', date: 'Feb 27' },
  { desc: 'Phone Bill', amount: -55, type: 'expense', category: 'Utilities', date: 'Feb 26' },
];

const GOALS = [
  { name: 'Emergency Fund', target: 5000, current: 3200, icon: Target, color: 'bg-emerald-500/20 text-emerald-400' },
  { name: 'New Laptop', target: 1500, current: 900, icon: Briefcase, color: 'bg-indigo-500/20 text-indigo-400' },
  { name: 'Summer Trip', target: 2000, current: 450, icon: Car, color: 'bg-amber-500/20 text-amber-400' },
];

const SCENARIOS = [
  { title: 'College Budget Challenge', difficulty: 'Beginner', description: 'Manage a $1,500/month budget as a college student', icon: GraduationCap, color: 'bg-emerald-500/20 text-emerald-400' },
  { title: 'First Apartment', difficulty: 'Intermediate', description: 'Navigate rent, utilities, and living expenses', icon: Home, color: 'bg-amber-500/20 text-amber-400' },
  { title: 'Stock Market Basics', difficulty: 'Intermediate', description: 'Learn to invest with a simulated $10K portfolio', icon: LineChart, color: 'bg-indigo-500/20 text-indigo-400' },
  { title: 'Credit Score Builder', difficulty: 'Advanced', description: 'Build credit responsibly with simulated accounts', icon: CreditCard, color: 'bg-rose-500/20 text-rose-400' },
];

const MONTHLY_DATA = [
  { month: 'Oct', income: 2200, expenses: 1500 },
  { month: 'Nov', income: 2100, expenses: 1700 },
  { month: 'Dec', income: 2600, expenses: 1900 },
  { month: 'Jan', income: 2300, expenses: 1550 },
  { month: 'Feb', income: 2400, expenses: 1650 },
];

export default function FinanceSimPage() {
  const containerRef = useStaggerAnimate([]);
  const [tab, setTab] = useState<'overview' | 'scenarios'>('overview');

  const maxBar = Math.max(...MONTHLY_DATA.map((d) => Math.max(d.income, d.expenses)));

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Finance Simulator" description="Learn personal finance through interactive simulations" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Net Worth" value={BALANCE} prefix="$" icon={<DollarSign className="h-5 w-5" />} />
        <StatCard label="Monthly Income" value={INCOME_MONTHLY} prefix="$" icon={<ArrowUpRight className="h-5 w-5" />} trend="up" />
        <StatCard label="Monthly Expenses" value={EXPENSES_MONTHLY} prefix="$" icon={<ArrowDownRight className="h-5 w-5" />} />
        <StatCard label="Savings Rate" value={SAVINGS_RATE} suffix="%" icon={<PiggyBank className="h-5 w-5" />} trend="up" trendLabel="Above avg" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2" data-animate>
        {(['overview', 'scenarios'] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? 'default' : 'outline'} onClick={() => setTab(t)} className={cn('text-xs capitalize', tab !== t && 'border-white/10 text-white/40')}>
            {t === 'overview' ? <><Wallet className="size-3 mr-1" />Overview</> : <><Calculator className="size-3 mr-1" />Scenarios</>}
          </Button>
        ))}
      </div>

      {tab === 'overview' ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Accounts + Transactions */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Accounts */}
            <div className="grid gap-3 sm:grid-cols-3" data-animate>
              {ACCOUNTS.map((a) => (
                <Card key={a.name} className="border-white/6 bg-white/3 backdrop-blur-xl">
                  <CardContent className="p-3 flex items-center gap-3">
                    <a.icon className={cn('size-5', a.color)} />
                    <div>
                      <p className="text-[10px] text-white/40">{a.name}</p>
                      <p className="text-sm font-semibold text-white/90">${a.balance.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Monthly chart */}
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white/90 text-sm">Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4 h-32">
                  {MONTHLY_DATA.map((d) => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-0.5 items-end" style={{ height: 100 }}>
                        <div className="flex-1 rounded-t-sm bg-emerald-500/40" style={{ height: `${(d.income / maxBar) * 100}%` }} />
                        <div className="flex-1 rounded-t-sm bg-rose-500/40" style={{ height: `${(d.expenses / maxBar) * 100}%` }} />
                      </div>
                      <span className="text-[8px] text-white/30">{d.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[9px] text-white/30">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500/40" />Income</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-rose-500/40" />Expenses</span>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white/90 text-sm">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1.5">
                {TRANSACTIONS.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-2.5">
                    <div className={cn('size-7 rounded-full flex items-center justify-center', t.type === 'income' ? 'bg-emerald-500/15' : 'bg-rose-500/15')}>
                      {t.type === 'income' ? <ArrowUpRight className="size-3 text-emerald-400" /> : <ShoppingCart className="size-3 text-rose-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/70">{t.desc}</p>
                      <p className="text-[9px] text-white/25">{t.category} · {t.date}</p>
                    </div>
                    <span className={cn('text-xs font-medium', t.type === 'income' ? 'text-emerald-400' : 'text-rose-400')}>
                      {t.type === 'income' ? '+' : ''}{t.amount < 0 ? '-' : ''}${Math.abs(t.amount)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Goals sidebar */}
          <div className="flex flex-col gap-4">
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white/90 text-sm flex items-center gap-1.5"><Coins className="size-4 text-amber-400" />Savings Goals</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {GOALS.map((g) => (
                  <div key={g.name} className="rounded-lg border border-white/6 bg-white/2 p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn('size-7 rounded-md flex items-center justify-center', g.color)}>
                        <g.icon className="size-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-white/70 font-medium">{g.name}</p>
                        <p className="text-[9px] text-white/30">${g.current.toLocaleString()} of ${g.target.toLocaleString()}</p>
                      </div>
                    </div>
                    <Progress value={(g.current / g.target) * 100} className="h-1.5 mt-2 bg-white/5" />
                    <p className="text-[9px] text-white/25 mt-1 text-right">{Math.round((g.current / g.target) * 100)}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick tips */}
            <Card data-animate className="border-amber-500/15 bg-amber-500/5 backdrop-blur-xl">
              <CardContent className="p-3">
                <p className="text-[10px] text-amber-400 font-medium mb-1.5">💡 Finance Tip</p>
                <p className="text-[10px] text-amber-300/60">The 50/30/20 rule: 50% needs, 30% wants, 20% savings. You're currently saving {SAVINGS_RATE}% — great job!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Scenarios tab */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIOS.map((s, i) => (
            <Card key={i} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all cursor-pointer group" onClick={() => notifySuccess('Scenario', 'Opening scenario details…')}>
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={cn('size-10 rounded-lg flex items-center justify-center', s.color)}>
                  <s.icon className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-white/80">{s.title}</p>
                  <Badge variant="outline" className="text-[8px] border-white/8 text-white/25 mt-1">{s.difficulty}</Badge>
                  <p className="text-[10px] text-white/40 mt-2">{s.description}</p>
                </div>
                <Button size="sm" className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 mt-auto opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); notifySuccess('Scenario', 'Starting finance simulation…'); }}>
                  Start <ChevronRight className="size-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
