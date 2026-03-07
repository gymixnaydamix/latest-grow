/* ─── Dashboard Shared Components & Data ─── */
// API hook: useProviderHome from '@/hooks/api/use-provider-console'
// provides mrrSpark, tenantSpark, ltvSpark, churnSpark, mrrData, trialData, alerts at runtime.
import {
  AlertTriangle, CreditCard, Info,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

/* ── 3D SVG Icon Components ── */
export function Icon3D_Dollar() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs>
        <linearGradient id="dollar3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></linearGradient>
        <radialGradient id="dollarShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#dollar3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#dollarShine)" />
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="system-ui">$</text>
    </svg>
  );
}
export function Icon3D_Users() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs>
        <linearGradient id="users3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient>
        <radialGradient id="usersShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#users3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#usersShine)" />
      <g transform="translate(12,11)" fill="white">
        <circle cx="5" cy="4" r="3.2" /><circle cx="13" cy="4" r="3.2" />
        <path d="M0 15c0-3.5 2.2-6 5-6s5 2.5 5 6" /><path d="M8 15c0-3.5 2.2-6 5-6s5 2.5 5 6" />
      </g>
    </svg>
  );
}
export function Icon3D_LTV() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(139,92,246,.35))' }}>
      <defs>
        <linearGradient id="ltv3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
        <radialGradient id="ltvShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#ltv3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#ltvShine)" />
      <path d="M14 26l5-8 4 5 5-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="28" cy="13" r="2" fill="white" />
    </svg>
  );
}
export function Icon3D_Churn() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs>
        <linearGradient id="churn3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
        <radialGradient id="churnShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#churn3d)" />
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#churnShine)" />
      <path d="M14 14l12 12M26 14l-12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Mini SVG Sparkline ── */
export function Sparkline({ data, color, w = 80, h = 24, prefix = '' }: { data: number[]; color: string; w?: number; h?: number; prefix?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const id = `${prefix}spark-${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── KPI Card renderer (shared across all views) ── */
export function KpiCard({ kpi }: { kpi: KpiDef }) {
  const Icon3D = kpi.icon3d;
  return (
    <div
      data-animate
      className={`group relative overflow-hidden rounded-xl border border-border/60 bg-linear-to-br ${kpi.gradient} p-2 transition-all duration-300 hover:scale-[1.02] ${kpi.borderGlow} shadow-sm hover:shadow-lg`}
    >
      <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/80">{kpi.label}</p>
          <p className="text-lg font-extrabold tracking-tight leading-tight">{kpi.value}</p>
          <div className="mt-0.5 flex items-center gap-1">
            <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${kpi.chipColor ?? (kpi.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600')}`}>
              {kpi.up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
              {kpi.change}
            </span>
            <span className="text-[8px] text-muted-foreground/70 truncate">{kpi.sub}</span>
          </div>
        </div>
        <div className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
          <Icon3D />
        </div>
      </div>
      <div className="mt-1 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkline data={kpi.sparkline} color={kpi.sparkColor} w={70} h={18} prefix={kpi.prefix ?? ''} />
      </div>
    </div>
  );
}

export type KpiDef = {
  label: string;
  value: string;
  change: string;
  up: boolean;
  sub: string;
  icon3d: React.FC;
  gradient: string;
  borderGlow: string;
  sparkline: number[];
  sparkColor: string;
  chipColor?: string;
  prefix?: string;
};

/* ── Static fallback data (shared) — replaced at runtime via useProviderHome ── */
export const FALLBACK_mrrSpark = [40, 42, 38, 45, 48, 44, 50, 53, 56, 55, 60, 62];
export const FALLBACK_tenantSpark = [90, 95, 92, 100, 105, 108, 110, 112, 115, 116, 118, 120];
export const FALLBACK_ltvSpark = [2100, 2150, 2200, 2220, 2280, 2300, 2320, 2350, 2380, 2400, 2420, 2450];
export const FALLBACK_churnSpark = [3.2, 3.0, 2.9, 3.1, 2.8, 2.7, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1];

export const FALLBACK_mrrData = [
  { month: 'Jan', mrr: 10200 }, { month: 'Feb', mrr: 10800 },
  { month: 'Mar', mrr: 11150 }, { month: 'Apr', mrr: 11900 },
  { month: 'May', mrr: 12350 }, { month: 'Jun', mrr: 12800 },
  { month: 'Jul', mrr: 13100 }, { month: 'Aug', mrr: 13600 },
  { month: 'Sep', mrr: 14000 }, { month: 'Oct', mrr: 14500 },
  { month: 'Nov', mrr: 14820 }, { month: 'Dec', mrr: 15230 },
];

export const FALLBACK_trialData = [
  { month: 'Jan', trials: 18 }, { month: 'Feb', trials: 22 },
  { month: 'Mar', trials: 15 }, { month: 'Apr', trials: 28 },
  { month: 'May', trials: 34 }, { month: 'Jun', trials: 25 },
  { month: 'Jul', trials: 30 }, { month: 'Aug', trials: 27 },
  { month: 'Sep', trials: 32 }, { month: 'Oct', trials: 38 },
  { month: 'Nov', trials: 42 }, { month: 'Dec', trials: 35 },
];

export const FALLBACK_alerts = [
  {
    level: 'critical' as const,
    text: 'High API Error Rate Detected',
    metric: '5.2%',
    icon: AlertTriangle,
    time: '2m ago',
    color: { bg: 'bg-red-500/8', border: 'border-red-500/30', text: 'text-red-600', iconBg: 'bg-red-500', badge: 'bg-red-500/10 text-red-600', pulse: 'bg-red-500' },
  },
  {
    level: 'warning' as const,
    text: 'Payment Gateway Connection Issue',
    metric: 'Timeout',
    icon: CreditCard,
    time: '15m ago',
    color: { bg: 'bg-amber-500/8', border: 'border-amber-500/30', text: 'text-amber-600', iconBg: 'bg-amber-500', badge: 'bg-amber-500/10 text-amber-600', pulse: 'bg-amber-500' },
  },
  {
    level: 'info' as const,
    text: '3 High-Priority Support Escalations',
    metric: 'Pending',
    icon: Info,
    time: '1h ago',
    color: { bg: 'bg-blue-500/8', border: 'border-blue-500/30', text: 'text-blue-600', iconBg: 'bg-blue-500', badge: 'bg-blue-500/10 text-blue-600', pulse: 'bg-blue-500' },
  },
];
