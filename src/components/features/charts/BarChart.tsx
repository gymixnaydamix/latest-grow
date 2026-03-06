/* ─── NeonBarChart ─── 3D bars with neon colors + hover animations ─── */
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export interface NeonBarChartProps {
  title?: string;
  subtitle?: string;
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey?: string;
  colors?: string[];
  height?: number;
  className?: string;
  layout?: 'horizontal' | 'vertical';
  secondaryDataKey?: string;
  secondaryColor?: string;
}

const DEFAULT_COLORS = ['#818cf8', '#c084fc', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.fill || p.stroke }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

export function NeonBarChart({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey = 'name',
  colors = DEFAULT_COLORS,
  height = 280,
  className = '',
  layout = 'horizontal',
  secondaryDataKey,
  secondaryColor = '#34d399',
}: NeonBarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <Card className={`border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-2">
          {title && <h3 className="text-sm font-semibold text-white/85">{title}</h3>}
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <CardContent className="p-4 pt-2">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout={isVertical ? 'vertical' : 'horizontal'} margin={{ top: 5, right: 10, left: isVertical ? 10 : -10, bottom: 0 }}>
              <defs>
                {colors.map((c, i) => (
                  <linearGradient key={i} id={`barGrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={c} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={c} stopOpacity={0.5} />
                  </linearGradient>
                ))}
                <filter id="barGlow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              {isVertical ? (
                <>
                  <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey={xAxisKey} type="category" width={80} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                </>
              ) : (
                <>
                  <XAxis dataKey={xAxisKey} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                </>
              )}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar
                dataKey={dataKey}
                radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                filter="url(#barGlow)"
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={`url(#barGrad-${i % colors.length})`} />
                ))}
              </Bar>
              {secondaryDataKey && (
                <Bar
                  dataKey={secondaryDataKey}
                  radius={isVertical ? [0, 6, 6, 0] : [6, 6, 0, 0]}
                  fill={secondaryColor}
                  fillOpacity={0.7}
                  isAnimationActive
                  animationDuration={1000}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
