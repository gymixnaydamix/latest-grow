/* ─── AnalyticsView — Premium bento grid with heatmap, donut, top pages ─── */
import { ArrowUpRight, TrendingUp, Activity } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { KpiCard, FALLBACK_mrrData } from './shared';
import type { KpiDef } from './shared';
import { usePlatformAnalytics } from '@/hooks/api';
import { useProviderUsage } from '@/hooks/api/use-provider-console';

export function AnalyticsView() {
  const { data: apiData } = usePlatformAnalytics();
  const { data: usageData } = useProviderUsage();
  const usageArr = (usageData ?? []) as Array<Record<string, unknown>>;
  /* ── Inline 3D SVG Icons ── */
  const Icon3D_APICalls = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs>
        <linearGradient id="a_api3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
        <radialGradient id="a_apiShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_api3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_apiShine)" />
      <polyline points="12,24 16,16 20,22 24,14 28,20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
  const Icon3D_Session = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(139,92,246,.35))' }}>
      <defs>
        <linearGradient id="a_sess3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
        <radialGradient id="a_sessShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_sess3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_sessShine)" />
      <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none" />
      <path d="M20 15v5l3.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
  const Icon3D_DAU = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs>
        <linearGradient id="a_dau3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></linearGradient>
        <radialGradient id="a_dauShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_dau3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_dauShine)" />
      <g fill="white"><circle cx="16" cy="16" r="3" /><circle cx="26" cy="16" r="3" /><path d="M11 27c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5" /><path d="M21 27c0-3 2.2-5.5 5-5.5s5 2.5 5 5.5" /></g>
    </svg>
  );
  const Icon3D_Bounce = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs>
        <linearGradient id="a_bounce3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
        <radialGradient id="a_bounceShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_bounce3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#a_bounceShine)" />
      <path d="M12 28 Q16 12 20 22 Q24 28 28 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="28" cy="14" r="2" fill="white" />
    </svg>
  );

  /* ── Wire data from API (backend returns kpis as object keyed by metric) ── */
  const kpisObj = apiData?.kpis as Record<string, { value: string; change: string; sparkline?: number[] }> | undefined;
  const apiTopPages = apiData?.topPages;
  const apiMrrData = apiData?.mrrData as Array<{ month: string; mrr: number; users?: number }> | undefined;

  const analyticsKpis: KpiDef[] = [
    { label: 'Total API Calls', value: kpisObj?.apiCalls?.value ?? '…', change: kpisObj?.apiCalls?.change ?? '', up: true, sub: 'Last 30 days', icon3d: Icon3D_APICalls, gradient: 'from-blue-500/10 to-blue-500/5', borderGlow: 'hover:shadow-blue-500/20', sparkline: kpisObj?.apiCalls?.sparkline ?? [820, 860, 910, 880, 950, 1020, 1080, 1050, 1120, 1150, 1180, 1200], sparkColor: '#3b82f6', prefix: 'a_' },
    { label: 'Avg Session', value: kpisObj?.avgSession?.value ?? '…', change: kpisObj?.avgSession?.change ?? '', up: true, sub: 'Per active user', icon3d: Icon3D_Session, gradient: 'from-violet-500/10 to-violet-500/5', borderGlow: 'hover:shadow-violet-500/20', sparkline: kpisObj?.avgSession?.sparkline ?? [14, 15, 15.5, 16, 16.2, 16.8, 17, 17.4, 17.8, 18, 18.2, 18.5], sparkColor: '#8b5cf6', prefix: 'a_' },
    { label: 'Active DAU', value: kpisObj?.dau?.value ?? '…', change: kpisObj?.dau?.change ?? '', up: true, sub: 'Daily active users', icon3d: Icon3D_DAU, gradient: 'from-emerald-500/10 to-emerald-500/5', borderGlow: 'hover:shadow-emerald-500/20', sparkline: kpisObj?.dau?.sparkline ?? [2800, 2900, 2950, 3020, 3080, 3120, 3180, 3220, 3280, 3340, 3380, 3420], sparkColor: '#10b981', prefix: 'a_' },
    { label: 'Bounce Rate', value: kpisObj?.bounceRate?.value ?? '…', change: kpisObj?.bounceRate?.change ?? '', up: false, sub: 'Lower is better', icon3d: Icon3D_Bounce, gradient: 'from-amber-500/10 to-amber-500/5', borderGlow: 'hover:shadow-amber-500/20', sparkline: kpisObj?.bounceRate?.sparkline ?? [34, 33, 32, 31, 30.5, 29.8, 29.2, 28.6, 28, 27.4, 27, 26.8], sparkColor: '#f59e0b', prefix: 'a_' },
  ];
  const chartData = apiMrrData ?? FALLBACK_mrrData;
  const userGrowthData = chartData.map((d, i) => ({ month: d.month, users: (d as { users?: number }).users ?? 2800 + i * 120 }));
  const topPages = apiTopPages ?? [
    { page: '/dashboard', views: '45.2K', pct: 92 }, { page: '/courses', views: '32.1K', pct: 70 },
    { page: '/students', views: '28.4K', pct: 62 }, { page: '/settings', views: '18.7K', pct: 41 }, { page: '/reports', views: '12.3K', pct: 27 },
  ];
  const heatmapGrid = (usageArr.find((u) => u.type === 'heatmap')?.grid as number[][] | undefined) ?? [
    [0.2, 0.3, 0.8, 0.9, 0.7, 0.4], [0.1, 0.4, 0.7, 0.8, 0.6, 0.3], [0.3, 0.5, 0.9, 1.0, 0.8, 0.5],
    [0.2, 0.4, 0.8, 0.9, 0.7, 0.4], [0.3, 0.6, 0.9, 0.95, 0.8, 0.5], [0.1, 0.3, 0.5, 0.6, 0.4, 0.2], [0.05, 0.2, 0.3, 0.4, 0.3, 0.1],
  ];
  const hmDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hmSlots = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];
  const activityFeed = (usageArr.find((u) => u.type === 'activity')?.entries as Array<{ text: string; color: string; time: string }> | undefined) ?? [
    { text: 'New school signup: Lincoln Academy', color: 'bg-emerald-500', time: '12s ago' },
    { text: 'Payment received: $599/mo', color: 'bg-blue-500', time: '45s ago' },
    { text: 'User exported reports', color: 'bg-violet-500', time: '2m ago' },
    { text: 'API rate limit hit: tenant #42', color: 'bg-amber-500', time: '4m ago' },
    { text: 'New course published', color: 'bg-emerald-500', time: '8m ago' },
    { text: 'Webhook delivery failed', color: 'bg-red-500', time: '12m ago' },
    { text: 'Bulk import completed: 240 students', color: 'bg-blue-500', time: '18m ago' },
  ];
  const retentionWeeks = (usageArr.find((u) => u.type === 'retention')?.weeks as Array<{ week: string; pct: number }> | undefined) ?? [
    { week: 'W1', pct: 98 }, { week: 'W2', pct: 96 }, { week: 'W3', pct: 95 },
    { week: 'W4', pct: 94.8 }, { week: 'W5', pct: 94.5 }, { week: 'W6', pct: 94.3 }, { week: 'W7', pct: 94.2 },
  ];

  return (
    <div className="flex gap-1.5 h-full min-h-0 overflow-hidden">
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_1fr_1fr] min-h-0 min-w-0">
        {/* ── Row 1: 4 KPI cards ── */}
        {analyticsKpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}

        {/* ── Row 2 col 1-2: User Growth AreaChart ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-500/25"><TrendingUp className="size-3 text-white" /></div>
              <div><h3 className="text-[11px] font-semibold">User Growth</h3><p className="text-[8px] text-muted-foreground">Daily active users trend</p></div>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600"><ArrowUpRight className="size-2.5" />{userGrowthData.length >= 2 ? `+${(((userGrowthData.at(-1)!.users - userGrowthData[0].users) / userGrowthData[0].users) * 100).toFixed(1)}%` : '—'}</span>
          </div>
          <div className="flex-1 px-1 pb-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs><linearGradient id="a_usersGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString()} users`, 'DAU']} contentStyle={{ borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px rgba(0,0,0,.15)' }} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#a_usersGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))', stroke: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 2 col 3-4: Engagement Heatmap ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/25"><Activity className="size-3 text-white" /></div>
              <div><h3 className="text-[11px] font-semibold">Engagement Heatmap</h3><p className="text-[8px] text-muted-foreground">Peak usage by day &amp; time</p></div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-500"><span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Live</span>
          </div>
          <div className="flex-1 px-2.5 pb-2 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0">
              <div className="grid gap-px" style={{ gridTemplateColumns: `32px repeat(${hmSlots.length}, 1fr)` }}>
                <div />
                {hmSlots.map(s => <div key={s} className="text-[7px] text-muted-foreground text-center">{s}</div>)}
                {hmDays.flatMap((day, di) => [
                  <div key={`l-${day}`} className="text-[7px] text-muted-foreground flex items-center">{day}</div>,
                  ...heatmapGrid[di].map((val: number, si: number) => (
                    <div key={`c-${di}-${si}`} className="rounded-sm transition-transform duration-200 hover:scale-110 cursor-pointer" style={{ background: `rgba(59,130,246,${val})`, minHeight: 14 }} title={`${day} ${hmSlots[si]}: ${Math.round(val * 100)}%`} />
                  )),
                ])}
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[7px] text-muted-foreground">Low</span>
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, rgba(59,130,246,0.05), rgba(59,130,246,1))' }} />
              <span className="text-[7px] text-muted-foreground">High</span>
            </div>
          </div>
        </div>

        {/* ── Row 3 col 1-2: Top Pages ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-cyan-600 shadow-sm shadow-sky-500/25">
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-[11px] font-semibold">Top Pages</h3>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2 overflow-auto min-h-0">
            {topPages.map((pg, i) => (
              <div key={pg.page} className="group/row flex items-center gap-2 rounded-lg border border-border/30 px-2 py-1 transition-all duration-200 hover:translate-x-0.5 hover:bg-muted/30 hover:shadow-sm cursor-pointer">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[9px] font-bold text-white bg-linear-to-br ${i === 0 ? 'from-amber-400 to-orange-500' : i === 1 ? 'from-slate-300 to-slate-400' : i === 2 ? 'from-amber-600 to-amber-700' : 'from-slate-500 to-slate-600'}`}>{i + 1}</span>
                <span className="flex-1 text-[10px] font-medium truncate">{pg.page}</span>
                <div className="w-16 h-1.5 rounded-full bg-muted/40 overflow-hidden"><div className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-400" style={{ width: `${pg.pct}%` }} /></div>
                <span className="rounded-full bg-muted/30 px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground">{pg.views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3 col 3-4: Device Breakdown Donut ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-pink-500 to-rose-600 shadow-sm shadow-pink-500/25">
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="5" y="2" width="14" height="20" rx="2" strokeWidth={2} /><line x1="12" y1="18" x2="12" y2="18" strokeWidth={2} strokeLinecap="round" /></svg>
              </div>
              <h3 className="text-[11px] font-semibold">Device Breakdown</h3>
            </div>
          </div>
          <div className="flex flex-1 items-center gap-3 px-2.5 pb-2 min-h-0">
            <div className="relative shrink-0" style={{ width: 80, height: 80 }}>
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="51.02 36.94" strokeDashoffset="0" className="transition-all duration-500" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="28.15 59.81" strokeDashoffset="-51.02" className="transition-all duration-500" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="8.80 79.16" strokeDashoffset="-79.17" className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold">100%</span>
                <span className="text-[7px] text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              {[
                { label: 'Desktop', pct: 58, color: '#3b82f6' },
                { label: 'Mobile', pct: 32, color: '#8b5cf6' },
                { label: 'Tablet', pct: 10, color: '#f59e0b' },
              ].map(d => (
                <div key={d.label} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-[9px] font-medium w-12">{d.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} /></div>
                  <span className="text-[9px] font-bold w-8 text-right">{d.pct}%</span>
                </div>
              ))}
              <div className="mt-0.5 rounded-md bg-violet-500/8 px-1.5 py-0.5 text-[8px] font-medium text-violet-600 flex items-center gap-1">
                <ArrowUpRight className="size-2" />Device breakdown
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Right sidebar ═══ */}
      <div className="hidden lg:flex w-44 flex-col gap-1.5 shrink-0 min-h-0">
        {/* Live Activity — blue chroma card */}
        <div data-animate className="group flex flex-1 flex-col rounded-xl border border-blue-500/20 bg-linear-to-br from-blue-500/8 via-card to-card p-2.5 shadow-(--shadow-sm) transition-all duration-300 hover:shadow-(--shadow-md) hover:border-blue-500/30 overflow-hidden min-h-0">
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-cyan-500"><Activity className="h-3 w-3 text-white" /></div>
              <h3 className="text-[10px] font-semibold text-foreground">Live Activity</h3>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[8px] font-medium text-emerald-600 dark:text-emerald-400"><span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Live</span>
          </div>
          <div className="flex flex-1 flex-col gap-1 overflow-auto min-h-0">
            {activityFeed.map((ev: typeof activityFeed[number], i: number) => (
              <div key={i} className="flex items-start gap-1.5 rounded-lg bg-muted/40 p-1 border border-border/40 transition-colors hover:bg-muted/60">
                <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${ev.color} ${i === 0 ? 'animate-pulse' : ''}`} />
                <div className="min-w-0">
                  <p className="text-[8px] text-foreground/80 leading-tight">{ev.text}</p>
                  <p className="text-[7px] text-muted-foreground">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention — emerald chroma card */}
        <div data-animate className="group flex flex-col rounded-xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/8 via-card to-card p-2.5 shadow-(--shadow-sm) transition-all duration-300 hover:shadow-(--shadow-md) hover:border-emerald-500/30 overflow-hidden" style={{ minHeight: 120 }}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-[10px] font-semibold text-foreground">Retention</h3>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{retentionWeeks.at(-1)?.pct ?? '—'}%</span>
          </div>
          <div className="flex items-end gap-0.5" style={{ height: 48 }}>
            {retentionWeeks.map((w: typeof retentionWeeks[number]) => (
              <div key={w.week} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full rounded-sm bg-linear-to-t from-emerald-600 to-emerald-400" style={{ height: `${(w.pct / 100) * 48}px` }} />
                <span className="text-[6px] text-muted-foreground">{w.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
