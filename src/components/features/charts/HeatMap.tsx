/* ─── HeatMap ─── Calendar-style heatmap with color intensity ─── */
import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface HeatMapProps {
  title?: string;
  subtitle?: string;
  /** Array of { date: string (YYYY-MM-DD), value: number } */
  data: { date: string; value: number }[];
  /** Color for max intensity (hex) */
  color?: string;
  /** Number of weeks to show */
  weeks?: number;
  className?: string;
}

function interpolateColor(color: string, intensity: number): string {
  // Parse hex
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  // Base dark color
  const br = 20, bg = 20, bb = 30;
  const t = Math.min(1, Math.max(0, intensity));
  const nr = Math.round(br + (r - br) * t);
  const ng = Math.round(bg + (g - bg) * t);
  const nb = Math.round(bb + (b - bb) * t);
  return `rgb(${nr},${ng},${nb})`;
}

export function HeatMap({
  title,
  subtitle,
  data,
  color = '#818cf8',
  weeks = 20,
  className = '',
}: HeatMapProps) {
  const { grid, maxVal, dayLabels } = useMemo(() => {
    const map = new Map(data.map(d => [d.date, d.value]));
    const max = data.reduce((m, d) => Math.max(m, d.value), 1);
    const end = new Date();
    const totalDays = weeks * 7;
    const start = new Date(end);
    start.setDate(start.getDate() - totalDays + 1);

    // Build week columns (7 rows x N weeks)
    const cols: { date: string; value: number }[][] = [];
    let current = new Date(start);
    // Align to start of week (Sunday)
    current.setDate(current.getDate() - current.getDay());

    while (current <= end || cols.length < weeks) {
      const week: { date: string; value: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const key = current.toISOString().slice(0, 10);
        week.push({ date: key, value: map.get(key) ?? 0 });
        current.setDate(current.getDate() + 1);
      }
      cols.push(week);
      if (cols.length >= weeks) break;
    }

    return { grid: cols, maxVal: max, dayLabels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
  }, [data, weeks]);

  return (
    <Card className={`border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-5 pt-5 pb-2">
          {title && <h3 className="text-sm font-semibold text-white/85">{title}</h3>}
          {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <CardContent className="p-4 pt-2">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {/* Day labels */}
          <div className="flex flex-col gap-1 shrink-0 mr-1">
            {dayLabels.map((d, i) => (
              <div key={i} className="h-3 w-7 text-right text-[9px] text-white/30 leading-3">
                {i % 2 === 1 ? d : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                const intensity = maxVal > 0 ? day.value / maxVal : 0;
                return (
                  <div
                    key={di}
                    className="w-3 h-3 rounded-sm transition-all duration-200 hover:scale-150 hover:z-10 cursor-default group relative"
                    style={{
                      background: day.value > 0 ? interpolateColor(color, intensity) : 'rgba(255,255,255,0.04)',
                      boxShadow: intensity > 0.5 ? `0 0 4px ${color}30` : 'none',
                    }}
                    title={`${day.date}: ${day.value}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 justify-end">
          <span className="text-[10px] text-white/30">Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{ background: t > 0 ? interpolateColor(color, t) : 'rgba(255,255,255,0.04)' }}
            />
          ))}
          <span className="text-[10px] text-white/30">More</span>
        </div>
      </CardContent>
    </Card>
  );
}
