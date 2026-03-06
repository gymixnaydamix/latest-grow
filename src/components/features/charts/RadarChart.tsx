/* ─── GlowRadarChart ─── Skill/performance radar with glowing lines ─── */
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, Tooltip,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

export interface GlowRadarChartProps {
  title?: string;
  subtitle?: string;
  data: Record<string, unknown>[];
  dataKey: string;
  angleKey?: string;
  color?: string;
  secondaryDataKey?: string;
  secondaryColor?: string;
  height?: number;
  className?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.stroke }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function GlowRadarChart({
  title,
  subtitle,
  data,
  dataKey,
  angleKey = 'subject',
  color = '#818cf8',
  secondaryDataKey,
  secondaryColor = '#f472b6',
  height = 280,
  className = '',
}: GlowRadarChartProps) {
  return (
    <Card className={`border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-1">
          {title && <h3 className="text-sm font-semibold text-white/85">{title}</h3>}
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <CardContent className="p-4 pt-2">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
              <defs>
                <filter id="radarGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey={angleKey} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Radar
                name={dataKey}
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={color}
                fillOpacity={0.2}
                filter="url(#radarGlow)"
                isAnimationActive
                animationDuration={1200}
              />
              {secondaryDataKey && (
                <Radar
                  name={secondaryDataKey}
                  dataKey={secondaryDataKey}
                  stroke={secondaryColor}
                  strokeWidth={2}
                  fill={secondaryColor}
                  fillOpacity={0.15}
                  isAnimationActive
                  animationDuration={1200}
                />
              )}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
