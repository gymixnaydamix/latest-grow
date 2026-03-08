/* ─── SystemView — Infrastructure health, resource gauges, deployment ─── */
import { ArrowUpRight, Activity } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { KpiCard } from './shared';
import type { KpiDef } from './shared';
import { useSystemHealth } from '@/hooks/api';
import { useSystemHealth as useSystemHealthAnalytics } from '@/hooks/api/use-analytics';

export function SystemView() {
  const { data: apiData } = useSystemHealth();
  const { data: analyticsHealth } = useSystemHealthAnalytics();
  /* Merge analyticsHealth into apiData when available */
  const mergedKpis = analyticsHealth?.kpis ?? apiData?.kpis;
  const mergedServices = analyticsHealth?.services ?? apiData?.services;
  const mergedGauges = analyticsHealth?.gauges ?? apiData?.gauges;
  /* ── Inline 3D SVG Icons ── */
  const Icon3D_Server = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs>
        <linearGradient id="s_srv3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
        <radialGradient id="s_srvShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_srv3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_srvShine)" />
      <rect x="13" y="12" width="14" height="6" rx="1.5" fill="white" opacity="0.9" /><rect x="13" y="20" width="14" height="6" rx="1.5" fill="white" opacity="0.9" />
      <circle cx="16" cy="15" r="1" fill="#2563eb" /><circle cx="16" cy="23" r="1" fill="#2563eb" />
    </svg>
  );
  const Icon3D_DB = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs>
        <linearGradient id="s_db3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></linearGradient>
        <radialGradient id="s_dbShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_db3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_dbShine)" />
      <ellipse cx="20" cy="14" rx="7" ry="3" fill="white" opacity="0.9" /><path d="M13 14v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" stroke="white" strokeWidth="1.5" fill="none" /><path d="M13 19v5c0 1.66 3.13 3 7 3s7-1.34 7-3v-5" stroke="white" strokeWidth="1.5" fill="none" />
    </svg>
  );
  const Icon3D_Queue = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs>
        <linearGradient id="s_q3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
        <radialGradient id="s_qShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_q3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_qShine)" />
      <rect x="11" y="14" width="18" height="3" rx="1" fill="white" opacity="0.9" /><rect x="11" y="19" width="18" height="3" rx="1" fill="white" opacity="0.7" /><rect x="11" y="24" width="18" height="3" rx="1" fill="white" opacity="0.5" />
    </svg>
  );
  const Icon3D_Storage = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(139,92,246,.35))' }}>
      <defs>
        <linearGradient id="s_sto3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
        <radialGradient id="s_stoShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_sto3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#s_stoShine)" />
      <rect x="12" y="12" width="16" height="16" rx="3" fill="white" opacity="0.3" /><rect x="12" y="12" width="16" height="8" rx="3" fill="white" opacity="0.9" />
    </svg>
  );

  /* ── Demo data (merged with API when available) ── */
  const apiKpis = mergedKpis;
  const apiServices = mergedServices;
  const apiGauges = mergedGauges;

  const systemKpis: KpiDef[] = [
    { label: 'API Response', value: apiKpis?.[0]?.value ?? '42ms', change: apiKpis?.[0]?.change ?? '-8ms', up: true, sub: 'P95 latency', icon3d: Icon3D_Server, gradient: 'from-blue-500/10 to-blue-500/5', borderGlow: 'hover:shadow-blue-500/20', sparkline: apiKpis?.[0]?.sparkline ?? [55, 52, 49, 48, 47, 45, 44, 44, 43, 43, 42, 42], sparkColor: '#3b82f6', chipColor: 'bg-emerald-500/10 text-emerald-600', prefix: 's_' },
    { label: 'DB Load', value: apiKpis?.[1]?.value ?? '23%', change: apiKpis?.[1]?.change ?? '-4%', up: true, sub: 'PostgreSQL CPU', icon3d: Icon3D_DB, gradient: 'from-emerald-500/10 to-emerald-500/5', borderGlow: 'hover:shadow-emerald-500/20', sparkline: apiKpis?.[1]?.sparkline ?? [30, 28, 27, 26, 25, 25, 24, 24, 23, 23, 23, 23], sparkColor: '#10b981', chipColor: 'bg-emerald-500/10 text-emerald-600', prefix: 's_' },
    { label: 'Queue Depth', value: apiKpis?.[2]?.value ?? '12', change: apiKpis?.[2]?.change ?? '+3', up: false, sub: 'Jobs pending', icon3d: Icon3D_Queue, gradient: 'from-amber-500/10 to-amber-500/5', borderGlow: 'hover:shadow-amber-500/20', sparkline: apiKpis?.[2]?.sparkline ?? [5, 6, 7, 8, 8, 9, 10, 10, 11, 11, 12, 12], sparkColor: '#f59e0b', chipColor: 'bg-amber-500/10 text-amber-600', prefix: 's_' },
    { label: 'Storage', value: apiKpis?.[3]?.value ?? '2.4TB', change: apiKpis?.[3]?.change ?? '+120GB', up: false, sub: 'Of 5TB used', icon3d: Icon3D_Storage, gradient: 'from-violet-500/10 to-violet-500/5', borderGlow: 'hover:shadow-violet-500/20', sparkline: apiKpis?.[3]?.sparkline ?? [1.8, 1.9, 1.95, 2.0, 2.05, 2.1, 2.15, 2.2, 2.25, 2.3, 2.35, 2.4], sparkColor: '#8b5cf6', chipColor: 'bg-violet-500/10 text-violet-600', prefix: 's_' },
  ];
  /* Deterministic infra data seeded from gauge values */
  const cpuBase = (apiGauges?.[0]?.pct ?? 34);
  const memBase = (apiGauges?.[1]?.pct ?? 62);
  const infraData = Array.from({ length: 24 }, (_, i) => {
    const workHourBump = (i > 8 && i < 20) ? 15 : 0;
    const wave = Math.sin(i * 0.5) * 8;
    return {
      hour: `${i.toString().padStart(2, '0')}:00`,
      cpu: Math.round(Math.max(5, Math.min(95, cpuBase - 10 + workHourBump + wave))),
      memory: Math.round(Math.max(10, Math.min(95, memBase - 8 + (i > 10 && i < 18 ? 10 : 0) + wave * 0.5))),
    };
  });
  const statusColorMap: Record<string, string> = { Healthy: 'bg-emerald-500', Warning: 'bg-amber-500', Degraded: 'bg-red-500' };
  const services = (apiServices ?? [
    { name: 'API Gateway', status: 'Healthy' },
    { name: 'Auth Service', status: 'Healthy' },
    { name: 'Database', status: 'Healthy' },
    { name: 'Redis Cache', status: 'Healthy' },
    { name: 'WebSocket', status: 'Warning' },
    { name: 'CDN', status: 'Healthy' },
  ]).map(s => ({ ...s, color: statusColorMap[s.status] ?? 'bg-gray-500' }));
  const FALLBACK_events = [
    { time: '2 min ago', msg: 'Auto-scaled API pods 3→4', type: 'info' },
    { time: '15 min ago', msg: 'SSL certificate renewed', type: 'success' },
    { time: '1h ago', msg: 'WebSocket latency spike (resolved)', type: 'warning' },
    { time: '3h ago', msg: 'Database backup completed', type: 'success' },
    { time: '6h ago', msg: 'Deployment v2.4.1 rolled out', type: 'info' },
  ];
  const apiEvents = (analyticsHealth as any)?.events as typeof FALLBACK_events | undefined;
  const events = apiEvents ?? FALLBACK_events;
  const gauges = (apiGauges ?? [
    { label: 'CPU', pct: 34, color: '#3b82f6' },
    { label: 'Memory', pct: 62, color: '#10b981' },
    { label: 'Disk I/O', pct: 28, color: '#f59e0b' },
    { label: 'Network', pct: 45, color: '#8b5cf6' },
  ]);
  /* Deterministic uptime: mark down only days divisible by 17 (rare but predictable) */
  const downDaySet = new Set((analyticsHealth as any)?.downDays ?? [17]);
  const uptimeDays = Array.from({ length: 30 }, (_, i) => ({ day: i + 1, up: !downDaySet.has(i + 1) }));

  return (
    <div className="flex gap-1.5 h-full min-h-0 overflow-hidden">
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_1fr_1fr] min-h-0 min-w-0">
        {/* ── Row 1: 4 KPI cards (with chipColor override) ── */}
        {systemKpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}

        {/* ── Row 2 col 1-2: Infrastructure Health (CPU + Memory 24h) ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-cyan-500 to-blue-600 shadow-sm shadow-cyan-500/25"><Activity className="size-3 text-white" /></div>
              <div><h3 className="text-[11px] font-semibold">Infrastructure Health</h3><p className="text-[8px] text-muted-foreground">CPU &amp; Memory (24h)</p></div>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600"><ArrowUpRight className="size-2.5" />99.9% uptime</span>
          </div>
          <div className="flex-1 px-1 pb-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={infraData}>
                <defs>
                  <linearGradient id="s_cpuG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                  <linearGradient id="s_memG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="hour" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `${v}%`} axisLine={false} tickLine={false} width={28} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px rgba(0,0,0,.15)' }} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="cpu" name="CPU" stroke="#3b82f6" fill="url(#s_cpuG)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="memory" name="Memory" stroke="#10b981" fill="url(#s_memG)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 2 col 3-4: Service Status Grid ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-green-600 shadow-sm shadow-emerald-500/25">
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-[11px] font-semibold">Service Status</h3>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">{services.filter(s => s.status === 'Healthy').length}/{services.length} Healthy</span>
          </div>
          <div className="grid grid-cols-2 gap-1 px-2.5 pb-2 flex-1 min-h-0 content-start">
            {services.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 rounded-lg border border-border/30 px-2 py-1.5 transition-all hover:bg-muted/20">
                <span className={`h-2 w-2 rounded-full ${s.color} ${s.status === 'Warning' ? 'animate-pulse' : ''}`} />
                <div><p className="text-[9px] font-medium">{s.name}</p><p className="text-[7px] text-muted-foreground">{s.status}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3 col 1-2: System Events Timeline ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-blue-600 shadow-sm shadow-indigo-500/25">
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-[11px] font-semibold">System Events</h3>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2 overflow-auto min-h-0">
            {events.map((e: typeof events[number], i: number) => (
              <div key={i} className="flex items-start gap-2 rounded-lg border border-border/20 px-2 py-1.5 transition-all hover:bg-muted/20">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${e.type === 'success' ? 'bg-emerald-500' : e.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div className="flex-1 min-w-0"><p className="text-[9px] font-medium leading-tight">{e.msg}</p><p className="text-[7px] text-muted-foreground">{e.time}</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3 col 3-4: Resource Gauges (SVG arcs) ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-600 shadow-sm shadow-amber-500/25">
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-[11px] font-semibold">Resource Usage</h3>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 px-2.5 pb-2 flex-1 min-h-0 items-center">
            {gauges.map(g => {
              const r = 24, c = 2 * Math.PI * r, offset = c * (1 - (g.pct / 100) * 0.75);
              return (
                <div key={g.label} className="flex flex-col items-center gap-0.5">
                  <svg viewBox="0 0 60 60" className="w-full max-w-14">
                    <circle cx="30" cy="30" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeLinecap="round" transform="rotate(135 30 30)" />
                    <circle cx="30" cy="30" r={r} fill="none" stroke={g.color} strokeWidth="5" strokeDasharray={`${c * 0.75 - (offset - c * 0.25)} ${offset}`} strokeLinecap="round" transform="rotate(135 30 30)" opacity="0.9" />
                    <text x="30" y="32" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">{g.pct}%</text>
                  </svg>
                  <span className="text-[8px] font-medium text-muted-foreground">{g.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ Right sidebar ═══ */}
      <div className="hidden lg:flex w-44 flex-col gap-1.5 shrink-0 min-h-0">
        {/* Uptime tracker (30-day grid) — emerald chroma card */}
        <div data-animate className="group flex flex-col rounded-xl border border-emerald-500/20 bg-linear-to-br from-emerald-500/8 via-card to-card p-2.5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-emerald-500/30 overflow-hidden" style={{ minHeight: 140 }}>
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[10px] font-semibold text-foreground">Uptime (30d)</h3>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">99.97%</span>
          </div>
          <div className="grid grid-cols-10 gap-0.5">
            {uptimeDays.map(d => (<div key={d.day} className={`h-2.5 rounded-sm ${d.up ? 'bg-emerald-500/60' : 'bg-red-500/60'}`} title={`Day ${d.day}: ${d.up ? 'Up' : 'Down'}`} />))}
          </div>
          <p className="text-[7px] text-muted-foreground text-center mt-1.5">Last 30 days</p>
        </div>

        {/* Deployment pipeline — violet chroma card */}
        <div data-animate className="group flex flex-1 flex-col rounded-xl border border-violet-500/20 bg-linear-to-br from-violet-500/8 via-card to-card p-2.5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-violet-500/30 overflow-hidden min-h-0">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[10px] font-semibold text-foreground">Deploy Pipeline</h3>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[8px] font-medium text-emerald-600 dark:text-emerald-400"><span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Active</span>
          </div>
          <div className="flex flex-1 flex-col gap-1 overflow-auto min-h-0">
            {[
              { stage: 'Build', status: 'passed', time: '1m 23s' },
              { stage: 'Test', status: 'passed', time: '3m 45s' },
              { stage: 'Staging', status: 'passed', time: '2m 10s' },
              { stage: 'Production', status: 'deploying', time: '~2m' },
            ].map(p => (
              <div key={p.stage} className="flex items-center justify-between rounded-lg bg-muted/40 p-1.5 border border-border/40 transition-colors hover:bg-muted/60">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${p.status === 'passed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-[9px] font-medium text-foreground/80">{p.stage}</span>
                </div>
                <span className="text-[7px] text-muted-foreground">{p.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
