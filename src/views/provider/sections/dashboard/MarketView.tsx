/* ─── MarketView — Premium bento grid with competitive matrix, NPS ─── */
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { KpiCard, FALLBACK_mrrData } from './shared';
import type { KpiDef } from './shared';
import { useMarketIntelligence } from '@/hooks/api';
import { useProviderReports } from '@/hooks/api/use-provider-console';

export function MarketView() {
  const { data: apiData } = useMarketIntelligence();
  const { data: reportsData } = useProviderReports();
  void reportsData;
  /* ── Inline 3D SVG Icons ── */
  const Icon3D_TAM = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs>
        <linearGradient id="m_tam3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
        <radialGradient id="m_tamShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_tam3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_tamShine)" />
      <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none" /><path d="M14 20h12M20 14v12" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
  const Icon3D_ShareMkt = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(139,92,246,.35))' }}>
      <defs>
        <linearGradient id="m_share3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
        <radialGradient id="m_shareShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_share3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_shareShine)" />
      <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none" /><path d="M20 12v8l5 3" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
  const Icon3D_NPSHeart = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(239,68,68,.35))' }}>
      <defs>
        <linearGradient id="m_nps3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#dc2626" /></linearGradient>
        <radialGradient id="m_npsShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_nps3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_npsShine)" />
      <path d="M20 27l-6-5.5a3.5 3.5 0 1 1 6-2.5 3.5 3.5 0 1 1 6 2.5z" fill="white" />
    </svg>
  );
  const Icon3D_Rocket = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs>
        <linearGradient id="m_rocket3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></linearGradient>
        <radialGradient id="m_rocketShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_rocket3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#m_rocketShine)" />
      <path d="M20 12c0 0-6 4-6 12h12c0-8-6-12-6-12z" fill="white" /><rect x="18" y="24" width="4" height="3" rx="1" fill="white" opacity="0.7" />
    </svg>
  );

  /* ── Demo data (merged with API when available) ── */
  const apiKpis = apiData?.kpis;
  const apiCompetitors = apiData?.competitors;

  const marketKpis: KpiDef[] = [
    { label: 'TAM (K-12 SaaS)', value: apiKpis?.[0]?.value ?? '$12.4B', change: apiKpis?.[0]?.change ?? '+18% YoY', up: true, sub: 'Total addressable market', icon3d: Icon3D_TAM, gradient: 'from-blue-500/10 to-blue-500/5', borderGlow: 'hover:shadow-blue-500/20', sparkline: apiKpis?.[0]?.sparkline ?? [8.2, 8.8, 9.4, 9.9, 10.3, 10.8, 11.1, 11.5, 11.8, 12, 12.2, 12.4], sparkColor: '#3b82f6', prefix: 'm_' },
    { label: 'Market Share', value: apiKpis?.[1]?.value ?? '0.12%', change: apiKpis?.[1]?.change ?? '+0.03%', up: true, sub: '$15.2K MRR', icon3d: Icon3D_ShareMkt, gradient: 'from-violet-500/10 to-violet-500/5', borderGlow: 'hover:shadow-violet-500/20', sparkline: apiKpis?.[1]?.sparkline ?? [0.05, 0.06, 0.065, 0.07, 0.075, 0.08, 0.085, 0.09, 0.095, 0.1, 0.11, 0.12], sparkColor: '#8b5cf6', prefix: 'm_' },
    { label: 'NPS Score', value: apiKpis?.[2]?.value ?? '72', change: apiKpis?.[2]?.change ?? '+5 pts', up: true, sub: 'Excellent', icon3d: Icon3D_NPSHeart, gradient: 'from-red-500/10 to-red-500/5', borderGlow: 'hover:shadow-red-500/20', sparkline: apiKpis?.[2]?.sparkline ?? [58, 60, 62, 63, 65, 66, 67, 68, 69, 70, 71, 72], sparkColor: '#ef4444', prefix: 'm_' },
    { label: 'Growth Rate', value: apiKpis?.[3]?.value ?? '18% YoY', change: apiKpis?.[3]?.change ?? '+3.2%', up: true, sub: 'Revenue growth', icon3d: Icon3D_Rocket, gradient: 'from-emerald-500/10 to-emerald-500/5', borderGlow: 'hover:shadow-emerald-500/20', sparkline: apiKpis?.[3]?.sparkline ?? [10, 11, 12, 12.5, 13.2, 14, 14.8, 15.5, 16, 16.8, 17.4, 18], sparkColor: '#10b981', prefix: 'm_' },
  ];
  const marketGrowthData = FALLBACK_mrrData.map(d => ({ month: d.month, size: parseFloat((d.mrr / 15230 * 12.4).toFixed(1)) }));
  const FALLBACK_features = [
    { feat: 'AI Concierge', us: true, compA: false, compB: false },
    { feat: 'Multi-tenant', us: true, compA: true, compB: false },
    { feat: 'White Labeling', us: true, compA: false, compB: true },
    { feat: 'Overlay Apps', us: true, compA: false, compB: false },
    { feat: 'Gamification', us: true, compA: false, compB: false },
  ];
  const features = FALLBACK_features;
  const FALLBACK_opportunities = [
    { name: 'AI Tutoring Platform', priority: 'High' as const, color: 'from-blue-500', desc: 'Personalized learning paths' },
    { name: 'International Expansion', priority: 'High' as const, color: 'from-emerald-500', desc: 'EU & APAC markets' },
    { name: 'Enterprise Tier', priority: 'Med' as const, color: 'from-violet-500', desc: 'Large district packages' },
    { name: 'Mobile-First Redesign', priority: 'Med' as const, color: 'from-amber-500', desc: 'Native app experience' },
    { name: 'API Marketplace', priority: 'Med' as const, color: 'from-pink-500', desc: 'Third-party integrations' },
  ];
  const opportunities = FALLBACK_opportunities;
  const threatColors: Record<string, { color: string; bg: string }> = {
    High: { color: 'text-red-400', bg: 'bg-red-500/10' },
    Medium: { color: 'text-amber-400', bg: 'bg-amber-500/10' },
    Low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  };
  const competitors = (apiCompetitors ?? [
    { name: 'PowerSchool', threat: 'High' },
    { name: 'Clever', threat: 'Medium' },
    { name: 'Schoology', threat: 'Medium' },
    { name: 'Canvas LMS', threat: 'Low' },
  ]).map((c) => ({
    ...c,
    color: threatColors[c.threat]?.color ?? 'text-white/40',
    bg: threatColors[c.threat]?.bg ?? 'bg-white/5',
  }));
  const CheckIcon = () => <svg className="size-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const XIcon = () => <svg className="size-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

  return (
    <div className="flex gap-1.5 h-full min-h-0 overflow-hidden">
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_1fr_1fr] min-h-0 min-w-0">
        {/* ── Row 1: 4 KPI cards ── */}
        {marketKpis.map((kpi) => <KpiCard key={kpi.label} kpi={kpi} />)}

        {/* ── Row 2 col 1-2: Market Growth AreaChart ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-0.5">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm shadow-blue-500/25"><TrendingUp className="size-3 text-white" /></div>
              <div><h3 className="text-[11px] font-semibold">Market Growth</h3><p className="text-[8px] text-muted-foreground">K-12 SaaS TAM trend (12mo)</p></div>
            </div>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600"><ArrowUpRight className="size-2.5" />+18% YoY</span>
          </div>
          <div className="flex-1 px-1 pb-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={marketGrowthData}>
                <defs><linearGradient id="m_mktGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v: number) => `$${v}B`} axisLine={false} tickLine={false} width={32} />
                <Tooltip formatter={(v: number) => [`$${v}B`, 'TAM']} contentStyle={{ borderRadius: 12, fontSize: 11, fontWeight: 600, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', boxShadow: '0 12px 32px rgba(0,0,0,.15)' }} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area type="monotone" dataKey="size" stroke="#3b82f6" fill="url(#m_mktGrad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))', stroke: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 2 col 3-4: Competitive Matrix ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm shadow-violet-500/25">
                <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div><h3 className="text-[11px] font-semibold">Competitive Matrix</h3><p className="text-[8px] text-muted-foreground">Feature comparison</p></div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2 overflow-auto min-h-0">
            <div className="grid grid-cols-4 gap-1 text-[8px] font-semibold text-muted-foreground mb-0.5">
              <span>Feature</span><span className="text-center border-b-2 border-primary/40 pb-0.5 text-foreground">Us</span><span className="text-center">Comp A</span><span className="text-center">Comp B</span>
            </div>
            {features.map((f: typeof features[number]) => (
              <div key={f.feat} className="group/row grid grid-cols-4 gap-1 items-center rounded-lg border border-border/20 bg-muted/5 px-1.5 py-1 transition-all duration-200 hover:bg-muted/20 hover:shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="flex h-4 w-4 items-center justify-center rounded-md bg-linear-to-br from-violet-500 to-purple-600"><svg className="size-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                  <span className="text-[9px] font-medium">{f.feat}</span>
                </div>
                <div className="flex justify-center bg-primary/5 rounded-md py-0.5">{f.us ? <CheckIcon /> : <XIcon />}</div>
                <div className="flex justify-center">{f.compA ? <CheckIcon /> : <XIcon />}</div>
                <div className="flex justify-center">{f.compB ? <CheckIcon /> : <XIcon />}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3 col 1-2: Growth Opportunities ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 shadow-sm shadow-emerald-500/25"><TrendingUp className="size-3 text-white" /></div>
              <h3 className="text-[11px] font-semibold">Growth Opportunities</h3>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-0.5 px-2.5 pb-2 overflow-auto min-h-0">
            {opportunities.map((opp: typeof opportunities[number]) => (
              <div key={opp.name} className="group/opp relative flex items-center gap-2 rounded-lg border border-border/30 px-2 py-1.5 transition-all duration-200 hover:translate-x-0.5 hover:bg-muted/20 hover:shadow-sm cursor-pointer">
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full bg-linear-to-b ${opp.color} to-transparent`} />
                <div className="ml-1 flex-1 min-w-0"><p className="text-[10px] font-semibold leading-tight">{opp.name}</p><p className="text-[8px] text-muted-foreground">{opp.desc}</p></div>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${opp.priority === 'High' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>{opp.priority}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 3 col 3-4: NPS Trend + Sentiment ── */}
        <div data-animate className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-pink-500 to-rose-600 shadow-sm shadow-pink-500/25">
                <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
              </div>
              <h3 className="text-[11px] font-semibold">NPS &amp; Sentiment</h3>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">Score: 72</span>
          </div>
          <div className="flex flex-1 flex-col gap-2 px-2.5 pb-2 min-h-0">
            <div className="flex items-end gap-0.5" style={{ height: 40 }}>
              {[58, 60, 62, 63, 65, 66, 67, 68, 69, 70, 71, 72].map((v, i) => (
                <div key={i} className="flex-1 rounded-sm bg-linear-to-t from-emerald-600 to-emerald-400" style={{ height: `${(v / 80) * 40}px` }} />
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex h-3 w-full overflow-hidden rounded-full">
                <div className="bg-emerald-500" style={{ width: '62%' }} /><div className="bg-amber-400" style={{ width: '26%' }} /><div className="bg-red-500" style={{ width: '12%' }} />
              </div>
              <div className="flex items-center justify-between text-[8px]">
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Promoters 62%</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Passives 26%</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />Detractors 12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Right sidebar ═══ */}
      <div className="hidden lg:flex w-44 flex-col gap-1 shrink-0 min-h-0">
        <div data-animate className="group relative flex flex-1 flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-red-500/20 overflow-hidden min-h-0">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-red-500 via-orange-500 to-amber-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-1 flex-col min-h-0">
            <div className="mb-1.5 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-white">Competitor Radar</h3>
              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[8px] font-medium text-red-400"><span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />Watch</span>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-auto min-h-0">
              {competitors.map(c => (
                <div key={c.name} className="flex items-center justify-between rounded-md bg-slate-900/50 p-1.5 border border-slate-800/50">
                  <span className="text-[9px] font-medium text-slate-300">{c.name}</span>
                  <span className={`rounded-full ${c.bg} px-1.5 py-0.5 text-[7px] font-bold ${c.color}`}>{c.threat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div data-animate className="group relative flex flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-violet-500/20 overflow-hidden" style={{ minHeight: 120 }}>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-white">Market Pulse</h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-500"><span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Live</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {['AI in EdTech', 'K-12 SaaS', 'Personalization', 'Gamification', 'Mobile Learning', 'Data Privacy'].map(kw => (
                <span key={kw} className="rounded-full bg-slate-800 border border-slate-700/50 px-1.5 py-0.5 text-[7px] font-medium text-slate-300 hover:bg-violet-500/20 hover:text-violet-300 transition-colors cursor-pointer">{kw}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
