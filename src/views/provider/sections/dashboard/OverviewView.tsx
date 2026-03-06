/* ─── OverviewView — Provider dashboard Overview tab ─── */
import {
  Users, TrendingUp, AlertTriangle,
  CreditCard, ArrowUpRight, Settings, Activity, Server,
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Bar, BarChart,
} from 'recharts';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { KPITicker } from '@/components/features/KPITicker';
import { GlowDonutChart } from '@/components/features/charts/DonutChart';
import { useTenantStats } from '@/hooks/api';
import {
  Icon3D_Dollar, Icon3D_Users, Icon3D_LTV, Icon3D_Churn,
  KpiCard, mrrSpark, tenantSpark, ltvSpark, churnSpark,
  mrrData, trialData, alerts,
} from './shared';
import type { KpiDef } from './shared';

export function OverviewView() {
  /* ── Wire KPIs to real tenant stats ── */
  const { data: statsResp } = useTenantStats();
  const s = statsResp;

  const kpis: KpiDef[] = [
    {
      label: 'MRR',
      value: s ? `$${s.totalMrr.toLocaleString()}` : '$…',
      change: '+2.1%', up: true, sub: 'from last month',
      icon3d: Icon3D_Dollar, gradient: 'from-emerald-500/10 to-emerald-500/5',
      borderGlow: 'hover:shadow-emerald-500/20', sparkline: mrrSpark, sparkColor: '#10b981',
    },
    {
      label: 'Active Tenants',
      value: s ? String(s.active) : '…',
      change: s ? `${s.total} total` : '+5', up: true,
      sub: s ? `${s.active} active · ${s.trial} trial` : '',
      icon3d: Icon3D_Users, gradient: 'from-blue-500/10 to-blue-500/5',
      borderGlow: 'hover:shadow-blue-500/20', sparkline: tenantSpark, sparkColor: '#3b82f6',
    },
    {
      label: 'LTV',
      value: '$2,450', change: '+$120', up: true, sub: 'Customer Lifetime Value',
      icon3d: Icon3D_LTV, gradient: 'from-violet-500/10 to-violet-500/5',
      borderGlow: 'hover:shadow-violet-500/20', sparkline: ltvSpark, sparkColor: '#8b5cf6',
    },
    {
      label: 'Churn Rate',
      value: s ? `${s.total > 0 ? ((s.churned / s.total) * 100).toFixed(1) : '0'}%` : '2.1%',
      change: '-0.5%', up: false, sub: 'from last month',
      icon3d: Icon3D_Churn, gradient: 'from-amber-500/10 to-amber-500/5',
      borderGlow: 'hover:shadow-amber-500/20', sparkline: churnSpark, sparkColor: '#f59e0b',
    },
  ];

  const barData = [
    { h: '40%', fill: '60%' }, { h: '60%', fill: '40%' }, { h: '75%', fill: '80%' },
    { h: '45%', fill: '50%' }, { h: '85%', fill: '90%' }, { h: '65%', fill: '70%' },
    { h: '95%', fill: '85%' },
  ];

  const tickerItems = [
    { label: 'MRR', value: s ? `$${s.totalMrr.toLocaleString()}` : '$15.2K', change: '+2.1%', trend: 'up' as const },
    { label: 'Active Tenants', value: s ? String(s.active) : '124', change: '+5', trend: 'up' as const },
    { label: 'Churn Rate', value: s ? `${s.total > 0 ? ((s.churned / s.total) * 100).toFixed(1) : '0'}%` : '2.1%', change: '-0.5%', trend: 'down' as const },
    { label: 'LTV', value: '$2,450', change: '+$120', trend: 'up' as const },
    { label: 'Trial → Paid', value: '68%', change: '+3%', trend: 'up' as const },
    { label: 'Uptime', value: '99.9%', trend: 'up' as const },
  ];

  const planDistribution = [
    { name: 'Professional', value: 45, color: '#818cf8' },
    { name: 'Enterprise', value: 28, color: '#34d399' },
    { name: 'Starter', value: 18, color: '#fbbf24' },
    { name: 'Trial', value: 9, color: '#f472b6' },
  ];

  return (
    <div className="flex flex-col gap-1.5 h-full min-h-0 overflow-hidden">
      {/* ── Live KPI ticker strip ── */}
      <KPITicker items={tickerItems} speed={35} className="shrink-0" />

      <div className="flex gap-1.5 flex-1 min-h-0 overflow-hidden">
      {/* ═══ Main content: 4-col bento grid ═══ */}
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_1fr_1fr] min-h-0 min-w-0">
        {/* ── Row 1: Premium 3D KPI cards ── */}
        {kpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}

        {/* ── Row 2: Alerts (col 1-2) ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-red-500 to-orange-500 shadow-sm shadow-red-500/25">
                <AlertTriangle className="size-3 text-white" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
              </div>
              <div>
                <h3 className="text-[11px] font-semibold">Actionable Alerts</h3>
                <p className="text-[8px] text-muted-foreground">Real-time system monitoring</p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[8px] font-bold text-red-600">
              {alerts.length} active
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2 overflow-hidden min-h-0">
            {alerts.map((alert, i) => {
              const Icon = alert.icon;
              return (
                <div key={i} className={`group/alert relative flex items-center gap-2 rounded-lg border ${alert.color.border} ${alert.color.bg} px-2 py-1.5 transition-all duration-250 hover:translate-x-0.5 hover:shadow-sm cursor-pointer`}>
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full ${alert.color.iconBg} transition-all duration-200 group-hover/alert:h-7`} />
                  <div className={`ml-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${alert.color.iconBg} shadow-sm`}>
                    <Icon className="size-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-semibold leading-tight ${alert.color.text}`}>{alert.text}</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{alert.time}</p>
                  </div>
                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${alert.color.badge}`}>{alert.metric}</span>
                  <svg className="size-3 shrink-0 text-muted-foreground/40 transition-all duration-200 group-hover/alert:text-foreground group-hover/alert:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Row 2: MRR Growth chart (col 3-4) ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/25">
                <TrendingUp className="size-3 text-white" />
              </div>
              <div><h3 className="text-[11px] font-semibold">MRR Growth</h3><p className="text-[8px] text-muted-foreground">Monthly Recurring Revenue</p></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[7px] font-medium text-muted-foreground">$10.2K → $15.2K</span>
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600"><ArrowUpRight className="size-2.5" />49.3%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 pb-0.5">
            <div className="flex items-center gap-1 rounded-md bg-emerald-500/8 px-1.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /><span className="text-[7px] font-semibold text-emerald-600">Current: $15,230</span></div>
            <div className="flex items-center gap-1 rounded-md bg-muted/30 px-1.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" /><span className="text-[7px] font-medium text-muted-foreground">Avg: $12,721</span></div>
            <div className="flex items-center gap-1 rounded-md bg-muted/30 px-1.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-[7px] font-medium text-muted-foreground">Peak: $15,230</span></div>
          </div>
          <div className="flex-1 px-1 pb-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrData}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="40%" stopColor="#10b981" stopOpacity={0.12} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="mrrStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#059669" /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={28} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'MRR']} contentStyle={{ borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px rgba(0,0,0,.15)' }} labelStyle={{ fontSize: 9, color: 'hsl(var(--muted-foreground))' }} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="mrr" stroke="url(#mrrStroke)" fill="url(#mrrGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))', stroke: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 3: New Trials chart (col 1-2) ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/25"><Users className="size-3 text-white" /></div>
              <div><h3 className="text-[11px] font-semibold">New Trials</h3><p className="text-[8px] text-muted-foreground">Sign-ups per month</p></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="rounded-md bg-muted/40 px-1.5 py-0.5 text-[7px] font-medium text-muted-foreground">Best: Nov (42)</span>
              <span className="flex items-center gap-0.5 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[8px] font-bold text-violet-600">
                <svg className="size-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-4h4v4z" /></svg>
                346 total
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 pb-0.5">
            <div className="flex items-center gap-1 rounded-md bg-violet-500/8 px-1.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-violet-500" /><span className="text-[7px] font-semibold text-violet-600">Avg: 29/mo</span></div>
            <div className="flex items-center gap-1 rounded-md bg-emerald-500/8 px-1.5 py-0.5"><ArrowUpRight className="size-2 text-emerald-600" /><span className="text-[7px] font-semibold text-emerald-600">+94% YoY</span></div>
            <div className="flex items-center gap-1 rounded-md bg-muted/30 px-1.5 py-0.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-[7px] font-medium text-muted-foreground">Q4: 115</span></div>
          </div>
          <div className="flex-1 px-1 pb-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trialData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} /><stop offset="100%" stopColor="#7c3aed" stopOpacity={0.5} /></linearGradient>
                  <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" stopOpacity={1} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={18} />
                <Tooltip formatter={(v: number) => [`${v} sign-ups`, 'Trials']} contentStyle={{ borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px rgba(0,0,0,.15)' }} labelStyle={{ fontSize: 9, color: 'hsl(var(--muted-foreground))' }} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3, radius: 4 }} />
                <Bar dataKey="trials" fill="url(#barGrad)" radius={[5, 5, 0, 0]} activeBar={{ fill: 'url(#barGradHover)' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 3: Platform Controls (col 3-4) ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-indigo-600 shadow-sm shadow-sky-500/25"><Settings className="size-3 text-white" /></div>
              <div><h3 className="text-[11px] font-semibold">Platform Controls</h3><p className="text-[8px] text-muted-foreground">Quick access to management</p></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[7px] font-bold text-emerald-600"><span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />All systems nominal</span>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2.5 pb-0.5">
            <div className="flex items-center gap-1 rounded-md bg-sky-500/8 px-1.5 py-0.5"><Server className="size-2 text-sky-600" /><span className="text-[7px] font-semibold text-sky-600">Uptime 99.9%</span></div>
            <div className="flex items-center gap-1 rounded-md bg-violet-500/8 px-1.5 py-0.5"><Users className="size-2 text-violet-600" /><span className="text-[7px] font-semibold text-violet-600">{s ? `${s.active} tenants` : '120 tenants'}</span></div>
            <div className="flex items-center gap-1 rounded-md bg-amber-500/8 px-1.5 py-0.5"><CreditCard className="size-2 text-amber-600" /><span className="text-[7px] font-semibold text-amber-600">4 plans</span></div>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2 min-h-0">
            {[
              { icon: CreditCard, label: 'Manage Subscription Plans', badge: '4 plans', color: 'from-amber-500 to-orange-600', badgeBg: 'bg-amber-500/10', badgeText: 'text-amber-600', hoverBorder: 'hover:border-amber-400/40', hoverBg: 'hover:bg-amber-500/5' },
              { icon: Settings, label: 'Platform Settings', badge: null, color: 'from-slate-500 to-slate-700', badgeBg: '', badgeText: '', hoverBorder: 'hover:border-slate-400/40', hoverBg: 'hover:bg-slate-500/5' },
              { icon: Users, label: 'View All Tenants', badge: s ? String(s.total) : '120', color: 'from-violet-500 to-purple-600', badgeBg: 'bg-violet-500/10', badgeText: 'text-violet-600', hoverBorder: 'hover:border-violet-400/40', hoverBg: 'hover:bg-violet-500/5' },
              { icon: Activity, label: 'System Health', badge: '99.9%', color: 'from-emerald-500 to-teal-600', badgeBg: 'bg-emerald-500/10', badgeText: 'text-emerald-600', hoverBorder: 'hover:border-emerald-400/40', hoverBg: 'hover:bg-emerald-500/5' },
            ].map((ctrl) => (
              <button key={ctrl.label} className={`group/btn relative flex items-center gap-2 rounded-lg border border-border/40 bg-muted/5 px-2 py-1.5 text-[9px] font-medium text-foreground/80 transition-all duration-200 ${ctrl.hoverBorder} ${ctrl.hoverBg} hover:translate-x-0.5 hover:shadow-sm`}>
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r-full bg-linear-to-b ${ctrl.color} opacity-0 transition-opacity group-hover/btn:opacity-100`} />
                <div className={`flex h-5 w-5 items-center justify-center rounded-md bg-linear-to-br ${ctrl.color} shadow-sm`}><ctrl.icon className="size-2.5 text-white" /></div>
                <span className="flex-1 text-left truncate">{ctrl.label}</span>
                {ctrl.badge && <span className={`rounded-full ${ctrl.badgeBg} px-1.5 py-0.5 text-[7px] font-bold ${ctrl.badgeText}`}>{ctrl.badge}</span>}
                <ArrowUpRight className="size-2.5 text-muted-foreground/0 transition-all group-hover/btn:text-muted-foreground/60 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Right column: Performance + Weather stacked ═══ */}
      <div className="hidden lg:flex w-44 flex-col gap-1 shrink-0 min-h-0">
        <div data-animate className="group relative flex flex-1 flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/20 overflow-hidden min-h-0">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-1 flex-col min-h-0">
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-500">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <h3 className="text-[10px] font-semibold text-white">Performance</h3>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-500"><span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Live</span>
            </div>
            <div className="mb-1.5 grid grid-cols-2 gap-1">
              <div className="rounded-md bg-slate-900/50 p-1 border border-slate-800/50">
                <p className="text-[8px] font-medium text-slate-400">Views</p>
                <p className="text-xs font-semibold text-white">24.5K</p>
                <span className="text-[8px] font-medium text-emerald-500">+12.3%</span>
              </div>
              <div className="rounded-md bg-slate-900/50 p-1 border border-slate-800/50">
                <p className="text-[8px] font-medium text-slate-400">Converts</p>
                <p className="text-xs font-semibold text-white">1.2K</p>
                <span className="text-[8px] font-medium text-emerald-500">+8.1%</span>
              </div>
            </div>
            <div className="mb-1.5 flex-1 min-h-0 w-full overflow-hidden rounded-md bg-slate-900/50 p-1 border border-slate-800/50">
              <div className="flex h-full w-full items-end justify-between gap-0.5">
                {barData.map((bar, i) => (
                  <div key={i} className="flex-1 rounded-sm bg-indigo-500/30" style={{ height: bar.h }}>
                    <div className="w-full rounded-sm bg-linear-to-t from-indigo-600 to-indigo-400 transition-all duration-300" style={{ height: bar.fill }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-medium text-slate-400">Last 7 days</span>
              <button className="flex items-center gap-0.5 rounded-md bg-linear-to-r from-indigo-500 to-purple-500 px-1.5 py-0.5 text-[8px] font-medium text-white transition-all duration-300 hover:from-indigo-600 hover:to-purple-600 hover:scale-105">
                Details
                <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
        {/* ── Plan Distribution donut ── */}
        <div data-animate className="flex flex-col rounded-xl border border-border/60 bg-card shadow-sm p-2 min-h-0">
          <GlowDonutChart
            data={planDistribution}
            centerLabel="Plans"
            centerValue={s ? String(s.total) : '124'}
            height={120}
            showLegend
          />
        </div>
        <WeatherWidget />
      </div>
      </div>
    </div>
  );
}
