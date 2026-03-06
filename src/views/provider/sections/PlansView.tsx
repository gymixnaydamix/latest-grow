/* ─── PlansView — Platform plans management with CRUD ─── */
import { useState } from 'react';
import {
  CreditCard, ArrowUpRight, ArrowDownRight, TrendingUp,
  Users, Plus, Edit3, Trash2, MoreHorizontal, ToggleLeft,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePlatformPlans, useDeletePlatformPlan } from '@/hooks/api';
import { CreatePlanDialog } from '../dialogs/CreatePlanDialog';
import type { PlatformPlan } from '@root/types';

export function PlansView() {
  const { data: apiPlans } = usePlatformPlans();
  const deletePlan = useDeletePlatformPlan();
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);

  const planColors: Record<string, { color: string; sparkColor: string }> = {
    'Starter': { color: 'from-sky-500 to-cyan-600', sparkColor: '#0ea5e9' },
    'Pro': { color: 'from-violet-500 to-purple-600', sparkColor: '#8b5cf6' },
    'Enterprise': { color: 'from-emerald-500 to-teal-600', sparkColor: '#10b981' },
    'Basic': { color: 'from-amber-500 to-orange-600', sparkColor: '#f59e0b' },
  };
  const defaultColor = { color: 'from-slate-500 to-slate-600', sparkColor: '#64748b' };

  const plans = (apiPlans ?? []).map((p) => {
    const c = planColors[p.name] ?? defaultColor;
    return { ...p, priceLabel: `$${p.price.toLocaleString()}/mo`, tenants: 0, ...c };
  });

  /* ── 3D SVG Icons ── */
  const Icon3D_Revenue = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs><linearGradient id="p_rev3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></linearGradient><radialGradient id="p_revShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_rev3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_revShine)" />
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="system-ui">$</text>
    </svg>
  );
  const Icon3D_Subs = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs><linearGradient id="p_sub3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient><radialGradient id="p_subShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_sub3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_subShine)" />
      <g fill="white"><circle cx="16" cy="16" r="3" /><circle cx="26" cy="16" r="3" /><path d="M11 27c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5" /><path d="M21 27c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5" /></g>
    </svg>
  );
  const Icon3D_ARPU = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(139,92,246,.35))' }}>
      <defs><linearGradient id="p_arpu3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient><radialGradient id="p_arpuShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_arpu3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_arpuShine)" />
      <path d="M14 26l5-8 4 5 5-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /><circle cx="28" cy="13" r="2" fill="white" />
    </svg>
  );
  const Icon3D_ConvRate = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs><linearGradient id="p_conv3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient><radialGradient id="p_convShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_conv3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#p_convShine)" />
      <path d="M12 28 Q16 12 20 22 Q24 28 28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" /><circle cx="28" cy="14" r="2" fill="white" />
    </svg>
  );

  /* ── Sparkline ── */
  const Sparkline = ({ data, color, w = 70, h = 18 }: { data: number[]; color: string; w?: number; h?: number }) => {
    const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rng) * h}`).join(' ');
    return (
      <svg width={w} height={h} className="overflow-visible">
        <defs><linearGradient id={`p_sp-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#p_sp-${color.replace('#', '')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  const totalRevenue = plans.reduce((s, p) => s + p.price * p.tenants, 0);
  const billingKpis = [
    { label: 'Total Revenue', value: `$${totalRevenue > 0 ? totalRevenue.toLocaleString() : '12,190'}/mo`, change: '+$820', up: true, sub: 'All active plans', icon: Icon3D_Revenue, gradient: 'from-emerald-500/10 to-emerald-500/5', borderGlow: 'hover:shadow-emerald-500/20', sparkline: [8200,8800,9400,10200,10800,11150,11600,11900,12000,12100,12190,12190], sparkColor: '#10b981' },
    { label: 'Active Subs', value: String(plans.reduce((s, p) => s + p.tenants, 0) || 120), change: '+5', up: true, sub: 'Across all plans', icon: Icon3D_Subs, gradient: 'from-blue-500/10 to-blue-500/5', borderGlow: 'hover:shadow-blue-500/20', sparkline: [90,95,98,101,104,106,108,110,113,116,118,120], sparkColor: '#3b82f6' },
    { label: 'ARPU', value: '$102', change: '+$8', up: true, sub: 'Avg revenue per user', icon: Icon3D_ARPU, gradient: 'from-violet-500/10 to-violet-500/5', borderGlow: 'hover:shadow-violet-500/20', sparkline: [78,82,84,86,88,90,92,94,96,98,100,102], sparkColor: '#8b5cf6' },
    { label: 'Conversion', value: '68%', change: '+4.2%', up: true, sub: 'Trial → paid rate', icon: Icon3D_ConvRate, gradient: 'from-amber-500/10 to-amber-500/5', borderGlow: 'hover:shadow-amber-500/20', sparkline: [48,50,52,54,56,58,60,62,63,65,66,68], sparkColor: '#f59e0b' },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 8200 }, { month: 'Feb', revenue: 8800 }, { month: 'Mar', revenue: 9400 },
    { month: 'Apr', revenue: 10200 }, { month: 'May', revenue: 10800 }, { month: 'Jun', revenue: 11150 },
    { month: 'Jul', revenue: 11600 }, { month: 'Aug', revenue: 11900 }, { month: 'Sep', revenue: 12000 },
    { month: 'Oct', revenue: 12100 }, { month: 'Nov', revenue: 12190 }, { month: 'Dec', revenue: 12190 },
  ];

  const openEdit = (plan: typeof plans[0]) => {
    setEditingPlan(plan as unknown as PlatformPlan);
    setPlanDialogOpen(true);
  };
  const openCreate = () => {
    setEditingPlan(null);
    setPlanDialogOpen(true);
  };

  return (
    <>
    <div className="flex gap-1.5 h-full min-h-0 overflow-hidden">
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_1fr_1fr] min-h-0 min-w-0">
        {/* ── Row 1: 4 KPI cards ── */}
        {billingKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} data-animate className={`group relative overflow-hidden rounded-xl border border-border/60 bg-linear-to-br ${kpi.gradient} p-2 transition-all duration-300 hover:scale-[1.02] ${kpi.borderGlow} shadow-sm hover:shadow-lg`}>
              <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/80">{kpi.label}</p>
                  <p className="text-lg font-extrabold tracking-tight leading-tight">{kpi.value}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${kpi.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {kpi.up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                      {kpi.change}
                    </span>
                    <span className="text-[8px] text-muted-foreground/70 truncate">{kpi.sub}</span>
                  </div>
                </div>
                <div className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"><Icon /></div>
              </div>
              <div className="mt-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkline data={kpi.sparkline} color={kpi.sparkColor} />
              </div>
            </div>
          );
        })}

        {/* ── Row 2 col 1-2: Revenue AreaChart ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/25">
                <TrendingUp className="size-3 text-white" />
              </div>
              <div>
                <h3 className="text-[11px] font-semibold">Revenue Trend</h3>
                <p className="text-[8px] text-muted-foreground">MRR growth over 12 months</p>
              </div>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
              <ArrowUpRight className="size-2.5" />+48.7%
            </span>
          </div>
          <div className="flex-1 px-1 pb-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="p_revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={28} />
                <Tooltip formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px rgba(0,0,0,.15)' }} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#p_revGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))', stroke: '#10b981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 2 col 3-4: Plan Cards with CRUD ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/25">
                <CreditCard className="size-3 text-white" />
              </div>
              <h3 className="text-[11px] font-semibold">Active Plans</h3>
            </div>
            <Button size="sm" onClick={openCreate} className="h-6 gap-1 text-[9px] px-2 rounded-lg bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-sm">
              <Plus className="size-2.5" />New Plan
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-1 px-2.5 pb-2 flex-1 min-h-0 auto-rows-fr">
            {plans.map(p => (
              <div key={p.id} className="group/plan relative flex flex-col justify-center rounded-lg border border-border/30 bg-muted/5 p-1.5 backdrop-blur-sm transition-all hover:bg-muted/20 hover:shadow-sm">
                <div className="flex items-center gap-1 mb-0.5">
                  <div className={`flex h-4 w-4 items-center justify-center rounded-md bg-linear-to-br ${p.color}`}>
                    <CreditCard className="size-2 text-white" />
                  </div>
                  <span className="text-[9px] font-semibold flex-1">{p.name}</span>
                  {/* Edit/Delete dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover/plan:opacity-100 transition-opacity">
                        <MoreHorizontal className="size-2.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => openEdit(p)}><Edit3 className="size-3" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2"><ToggleLeft className="size-3" />{p.isActive ? 'Deactivate' : 'Activate'}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => deletePlan.mutate(p.id)}><Trash2 className="size-3" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-[11px] font-bold" style={{ color: p.sparkColor }}>{p.priceLabel}</p>
                <p className="text-[7px] text-muted-foreground mt-0.5">{(p.features ?? []).join(', ')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-0.5">
                    <Users className="size-2 text-muted-foreground" />
                    <span className="text-[8px] text-muted-foreground">{p.tenants} tenants</span>
                  </div>
                  {!p.isActive && <span className="text-[7px] text-amber-600 font-bold">INACTIVE</span>}
                </div>
              </div>
            ))}
            {plans.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center p-4 text-center">
                <CreditCard className="size-6 text-muted-foreground/30 mb-1" />
                <p className="text-[10px] text-muted-foreground">No plans yet</p>
                <Button size="sm" variant="outline" className="mt-1 h-6 text-[9px]" onClick={openCreate}>Create First Plan</Button>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3 col 1-2: Subscription Breakdown Bar ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-cyan-600 shadow-sm shadow-sky-500/25">
                <svg className="size-3 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11V3H8v6H2v12h20V11h-6zm-6-6h4v14h-4V5zm-6 8h4v6H4v-6zm16 6h-4v-4h4v4z" /></svg>
              </div>
              <div>
                <h3 className="text-[11px] font-semibold">Subscriptions by Plan</h3>
                <p className="text-[8px] text-muted-foreground">Tenant distribution</p>
              </div>
            </div>
          </div>
          <div className="flex-1 px-1 pb-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plans.map(p => ({ name: p.name, tenants: p.tenants }))}>
                <defs>
                  <linearGradient id="p_barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={18} />
                <Tooltip formatter={(v: number) => [`${v} tenants`, 'Count']} contentStyle={{ borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px rgba(0,0,0,.15)' }} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }} />
                <Bar dataKey="tenants" fill="url(#p_barGrad)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 3 col 3-4: Plan Upgrade Funnel ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-600 shadow-sm shadow-amber-500/25">
                <TrendingUp className="size-3 text-white" />
              </div>
              <h3 className="text-[11px] font-semibold">Upgrade Funnel</h3>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2 min-h-0 justify-center">
            {[
              { stage: 'Basic → Pro', rate: '42%', pct: 42, color: 'from-amber-500 to-orange-500' },
              { stage: 'Pro → Enterprise', rate: '28%', pct: 28, color: 'from-violet-500 to-purple-500' },
              { stage: 'Starter → Pro', rate: '35%', pct: 35, color: 'from-sky-500 to-blue-500' },
              { stage: 'Trial → Any Paid', rate: '68%', pct: 68, color: 'from-emerald-500 to-teal-500' },
            ].map(f => (
              <div key={f.stage} className="group/funnel relative flex items-center gap-2 rounded-lg border border-border/30 px-2 py-1.5 transition-all duration-200 hover:translate-x-0.5 hover:bg-muted/20 hover:shadow-sm">
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full bg-linear-to-b ${f.color}`} />
                <span className="ml-1 text-[9px] font-medium flex-1">{f.stage}</span>
                <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <div className={`h-full rounded-full bg-linear-to-r ${f.color}`} style={{ width: `${f.pct}%` }} />
                </div>
                <span className="text-[9px] font-bold w-8 text-right">{f.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Right sidebar ═══ */}
      <div className="hidden lg:flex w-44 flex-col gap-1 shrink-0 min-h-0">
        {/* Revenue Split */}
        <div data-animate className="group relative flex flex-1 flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-emerald-500/20 overflow-hidden min-h-0">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-1 flex-col min-h-0">
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-white">Revenue Split</h3>
              <span className="text-[8px] font-bold text-emerald-400">$12.2K</span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 overflow-auto min-h-0">
              {plans.map(p => (
                <div key={p.id} className="rounded-md bg-slate-900/50 p-1.5 border border-slate-800/50">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] font-medium text-slate-300">{p.name}</span>
                    <span className="text-[8px] font-bold text-slate-200">{p.priceLabel}</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-800">
                    <div className="h-full rounded-full" style={{ width: `${(p.tenants / 120) * 100}%`, background: p.sparkColor }} />
                  </div>
                  <span className="text-[7px] text-slate-500">{p.tenants} subs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div data-animate className="group relative flex flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-violet-500/20 overflow-hidden" style={{ minHeight: 100 }}>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-col gap-1">
            <h3 className="text-[10px] font-semibold text-white">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-1">
              {[
                { label: 'LTV', value: '$2.4K', color: 'text-emerald-400' },
                { label: 'CAC', value: '$180', color: 'text-blue-400' },
                { label: 'Payback', value: '2.2mo', color: 'text-violet-400' },
                { label: 'Churn', value: '2.1%', color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="rounded-md bg-slate-900/50 p-1 border border-slate-800/50 text-center">
                  <p className="text-[7px] text-slate-500">{s.label}</p>
                  <p className={`text-[10px] font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Plan Dialog ── */}
    <CreatePlanDialog open={planDialogOpen} onOpenChange={setPlanDialogOpen} editPlan={editingPlan} />
    </>
  );
}
