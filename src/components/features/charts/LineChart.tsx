/* ─── GlowLineChart ─── Animated line chart with gradient fill + glow ─── */
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export interface GlowLineChartProps {
  title?: string;
  subtitle?: string;
  data: Record<string, unknown>[];
  dataKey: string;
  xAxisKey?: string;
  color?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  height?: number;
  className?: string;
  showGrid?: boolean;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.stroke }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

export function GlowLineChart({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey = 'name',
  color = '#818cf8',
  secondaryDataKey,
  secondaryColor = '#34d399',
  height = 280,
  className = '',
  showGrid = true,
}: GlowLineChartProps) {
  const id = `line-${dataKey}`.replace(/\s/g, '');
  const id2 = secondaryDataKey ? `line-${secondaryDataKey}`.replace(/\s/g, '') : '';

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
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
                {secondaryDataKey && (
                  <linearGradient id={id2} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={secondaryColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={secondaryColor} stopOpacity={0} />
                  </linearGradient>
                )}
                <filter id={`glow-${id}`}>
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />}
              <XAxis dataKey={xAxisKey} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2.5}
                fill={`url(#${id})`}
                dot={{ r: 3, fill: color, stroke: '#000', strokeWidth: 1 }}
                activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
                filter={`url(#glow-${id})`}
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
              />
              {secondaryDataKey && (
                <Area
                  type="monotone"
                  dataKey={secondaryDataKey}
                  stroke={secondaryColor}
                  strokeWidth={2}
                  fill={`url(#${id2})`}
                  dot={{ r: 3, fill: secondaryColor, stroke: '#000', strokeWidth: 1 }}
                  activeDot={{ r: 5, fill: secondaryColor, stroke: '#fff', strokeWidth: 2 }}
                  isAnimationActive
                  animationDuration={1200}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
