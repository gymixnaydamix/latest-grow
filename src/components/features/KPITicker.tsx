/* ─── KPITicker ─── Animated horizontal KPI ticker strip ──────────── */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TickerItem {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
}

interface KPITickerProps {
  items: TickerItem[];
  speed?: number;
  className?: string;
}

function TrendIcon({ trend }: { trend?: 'up' | 'down' | 'neutral' }) {
  if (!trend) return null;
  const cfg = {
    up: { Icon: TrendingUp, cls: 'text-emerald-400' },
    down: { Icon: TrendingDown, cls: 'text-red-400' },
    neutral: { Icon: Minus, cls: 'text-white/30' },
  }[trend];
  return <cfg.Icon className={cn('size-3', cfg.cls)} />;
}

export function KPITicker({ items, speed = 40, className }: KPITickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame: number;
    let pos = 0;

    const animate = () => {
      if (!paused) {
        pos -= 0.5;
        const half = track.scrollWidth / 2;
        if (Math.abs(pos) >= half) pos = 0;
        track.style.transform = `translateX(${pos}px)`;
      }
      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [paused, speed]);

  const doubled = [...items, ...items]; // seamless loop

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl py-2.5',
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-background/80 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-background/80 to-transparent" />

      <div ref={trackRef} className="flex items-center gap-8 whitespace-nowrap will-change-transform">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {item.icon && <span className="text-white/30">{item.icon}</span>}
            <span className="text-white/40 font-medium">{item.label}</span>
            <span className="text-white/80 font-semibold tabular-nums">{item.value}</span>
            {item.change && (
              <span className="flex items-center gap-0.5">
                <TrendIcon trend={item.trend} />
                <span className={cn(
                  'text-[10px]',
                  item.trend === 'up' ? 'text-emerald-400' : item.trend === 'down' ? 'text-red-400' : 'text-white/30',
                )}>
                  {item.change}
                </span>
              </span>
            )}
            <span className="text-white/6">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
