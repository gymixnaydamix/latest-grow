/* ─── GlowPieChart ─── Donut chart with animated segments + center stat ─── */
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export interface GlowPieChartProps {
  title?: string;
  subtitle?: string;
  data: { name: string; value: number; color?: string }[];
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
}

const DEFAULT_COLORS = ['#818cf8', '#c084fc', '#f472b6', '#fb923c', '#34d399', '#60a5fa', '#fbbf24', '#a78bfa'];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-white/50 mb-0.5">{d.name}</p>
      <p className="text-sm font-semibold" style={{ color: d.payload?.color || d.fill }}>
        {typeof d.value === 'number' ? d.value.toLocaleString() : d.value}
      </p>
    </div>
  );
}

export function GlowPieChart({
  title,
  subtitle,
  data,
  centerLabel,
  centerValue,
  height = 260,
  className = '',
  innerRadius = 60,
  outerRadius = 90,
}: GlowPieChartProps) {
  return (
    <Card className={`border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-1">
          {title && <h3 className="text-sm font-semibold text-white/85">{title}</h3>}
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <CardContent className="p-4 pt-2">
        <div style={{ height }} className="relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                <filter id="pieGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                filter="url(#pieGlow)"
                isAnimationActive
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center stat */}
          {(centerLabel || centerValue) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {centerValue !== undefined && (
                <span className="text-2xl font-bold text-white/90 tabular-nums">{centerValue}</span>
              )}
              {centerLabel && (
                <span className="text-xs text-white/40 mt-0.5">{centerLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {data.map((entry, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-xs text-white/50">
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: entry.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              {entry.name}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
