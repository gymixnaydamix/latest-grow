/* ─── GlowDonutChart ─── Donut ring chart with center label & glow ──── */
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from 'recharts';

export interface DonutSegment {
  name: string;
  value: number;
  color?: string;
}

export interface GlowDonutChartProps {
  data: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

const PALETTE = ['#818cf8', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#c084fc', '#fb923c', '#a78bfa'];

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  const total = d.payload?.total ?? 0;
  const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '—';
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-white/50 mb-0.5">{d.name}</p>
      <p className="text-sm font-semibold" style={{ color: d.payload?.color ?? d.fill }}>
        {typeof d.value === 'number' ? d.value.toLocaleString() : d.value}
        <span className="text-white/30 text-[10px] ml-1.5">({pct}%)</span>
      </p>
    </div>
  );
}

function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="rgba(255,255,255,0.6)" textAnchor="middle" dominantBaseline="central" className="text-[9px] font-medium">
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

export function GlowDonutChart({
  data,
  centerLabel,
  centerValue,
  height = 260,
  className = '',
  innerRadius = 55,
  outerRadius = 90,
  showLegend = true,
  showLabels = true,
}: GlowDonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const enriched = data.map(d => ({ ...d, total }));

  return (
    <div className={className} style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {data.map((d, i) => {
              const c = d.color || PALETTE[i % PALETTE.length];
              return (
                <filter key={i} id={`donut-glow-${i}`}>
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={c} floodOpacity="0.5" />
                </filter>
              );
            })}
          </defs>

          <Pie
            data={enriched}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            cornerRadius={4}
            stroke="none"
            label={showLabels ? renderCustomLabel : false}
            labelLine={false}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {enriched.map((d, i) => (
              <Cell
                key={i}
                fill={d.color || PALETTE[i % PALETTE.length]}
                filter={`url(#donut-glow-${i})`}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Pie>

          <Tooltip content={<ChartTooltip />} />

          {showLegend && (
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={6}
              formatter={(value: string) => <span className="text-[10px] text-white/40 ml-1">{value}</span>}
            />
          )}

          {/* Center label */}
          {(centerLabel || centerValue != null) && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central">
              {centerValue != null && (
                <tspan x="50%" dy="-6" className="text-lg font-bold" fill="rgba(255,255,255,0.85)">
                  {typeof centerValue === 'number' ? centerValue.toLocaleString() : centerValue}
                </tspan>
              )}
              {centerLabel && (
                <tspan x="50%" dy={centerValue != null ? '16' : '0'} className="text-[10px]" fill="rgba(255,255,255,0.3)">
                  {centerLabel}
                </tspan>
              )}
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default GlowDonutChart;
