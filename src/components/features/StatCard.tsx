/* ─── StatCard ─── Holographic stat card with count-up, sparkline, 3D tilt ─── */
import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import {
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/* ══════════════════════════════════════════════════════════════════════
 * Types
 * ══════════════════════════════════════════════════════════════════════ */
export interface StatCardProps {
  /** Main stat title (e.g. "Total Students") */
  label: string;
  /** Target numeric value to count up to */
  value: number;
  /** Number format suffix (e.g. "%", "k", "$") */
  suffix?: string;
  /** Number format prefix (e.g. "$") */
  prefix?: string;
  /** Decimal places */
  decimals?: number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Trend label (e.g. "+12.5%") */
  trendLabel?: string;
  /** Icon element rendered with neon glow */
  icon?: ReactNode;
  /** Neon accent color — hex or tailwind-like */
  accentColor?: string;
  /** Historical sparkline data points */
  sparklineData?: number[];
  /** Extra classnames */
  className?: string;
}

/* ══════════════════════════════════════════════════════════════════════
 * Count-up animation hook
 * ══════════════════════════════════════════════════════════════════════ */
function useCountUp(target: number, duration = 1200, decimals = 0) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const from = 0;

    const step = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(from + (target - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return decimals > 0 ? Number(current.toFixed(decimals)) : Math.round(current);
}

/* ══════════════════════════════════════════════════════════════════════
 * 3D Tilt hook — lightweight mouse-follow tilt
 * ══════════════════════════════════════════════════════════════════════ */
function useTilt3D(maxAngle = 6) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * maxAngle}deg) rotateY(${x * maxAngle}deg) scale3d(1.02,1.02,1.02)`;
  }, [maxAngle]);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)';
  }, []);

  return { ref, handleMove, handleLeave };
}

/* ══════════════════════════════════════════════════════════════════════
 * Trend indicator
 * ══════════════════════════════════════════════════════════════════════ */
function TrendIndicator({ trend, label }: { trend?: 'up' | 'down' | 'neutral'; label?: string }) {
  if (!trend || !label) return null;
  const config = {
    up:      { Icon: ArrowUp,   color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    down:    { Icon: ArrowDown,  color: 'text-red-400',     bg: 'bg-red-500/15' },
    neutral: { Icon: Minus,      color: 'text-white/40',    bg: 'bg-white/5' },
  };
  const { Icon, color, bg } = config[trend];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color} ${bg}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════
 * StatCard Component
 * ══════════════════════════════════════════════════════════════════════ */
export function StatCard({
  label,
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  trend,
  trendLabel,
  icon,
  accentColor = '#818cf8',
  sparklineData,
  className = '',
}: StatCardProps) {
  const displayed = useCountUp(value, 1200, decimals);
  const { ref, handleMove, handleLeave } = useTilt3D(8);

  // Convert sparkline array to recharts data
  const chartData = sparklineData?.map((v, i) => ({ i, v })) ?? [];

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`transition-transform duration-300 ease-out will-change-transform ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Card className="relative overflow-hidden border-white/6 bg-white/3 backdrop-blur-xl group hover:border-white/12 transition-all duration-300">
        {/* Holographic shimmer overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, transparent 30%, ${accentColor}10 50%, transparent 70%)`,
          }}
        />

        {/* Neon top-border accent */}
        <div
          className="absolute top-0 left-4 right-4 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
        />

        <CardContent className="relative p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">{label}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-white/95 tabular-nums tracking-tight">
                  {prefix}{displayed.toLocaleString()}{suffix}
                </span>
              </div>
              {(trend || trendLabel) && (
                <div className="mt-2">
                  <TrendIndicator trend={trend} label={trendLabel} />
                </div>
              )}
            </div>

            {/* Icon with neon glow */}
            {icon && (
              <div
                className="shrink-0 p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${accentColor}15`,
                  boxShadow: `0 0 20px ${accentColor}20, 0 0 40px ${accentColor}10`,
                }}
              >
                <div style={{ filter: `drop-shadow(0 0 6px ${accentColor}60)` }}>
                  {icon}
                </div>
              </div>
            )}
          </div>

          {/* Sparkline chart */}
          {chartData.length > 1 && (
            <div className="mt-3 h-10 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`sparkGrad-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={accentColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={accentColor}
                    strokeWidth={1.5}
                    fill={`url(#sparkGrad-${label.replace(/\s/g, '')})`}
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
