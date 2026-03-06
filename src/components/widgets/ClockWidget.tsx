/* ─── ClockWidget ─── Analog + digital clock ─────────────────────── */
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ClockWidgetProps {
  variant?: 'analog' | 'digital';
  showDate?: boolean;
  className?: string;
}

export function ClockWidget({ variant = 'digital', showDate = true, className }: ClockWidgetProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  if (variant === 'analog') {
    const hDeg = (hours % 12) * 30 + minutes * 0.5;
    const mDeg = minutes * 6;
    const sDeg = seconds * 6;

    return (
      <div className={cn('flex flex-col items-center gap-3 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-4', className)}>
        <div className="relative size-28 rounded-full border border-white/10 bg-white/5">
          {/* Hour markers */}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1 h-2 w-0.5 -translate-x-1/2 rounded bg-white/30"
              style={{ transform: `rotate(${i * 30}deg) translateX(-50%)`, transformOrigin: '50% 54px' }}
            />
          ))}
          {/* Hour hand */}
          <div
            className="absolute bottom-1/2 left-1/2 h-7 w-0.5 origin-bottom rounded bg-white/80"
            style={{ transform: `translateX(-50%) rotate(${hDeg}deg)` }}
          />
          {/* Minute hand */}
          <div
            className="absolute bottom-1/2 left-1/2 h-9 w-0.5 origin-bottom rounded bg-indigo-400"
            style={{ transform: `translateX(-50%) rotate(${mDeg}deg)` }}
          />
          {/* Second hand */}
          <div
            className="absolute bottom-1/2 left-1/2 h-10 w-px origin-bottom bg-red-400"
            style={{ transform: `translateX(-50%) rotate(${sDeg}deg)` }}
          />
          {/* Centre dot */}
          <div className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400" />
        </div>
        {showDate && (
          <span className="text-[10px] text-white/40 font-medium">
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    );
  }

  /* ── Digital ── */
  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={cn('flex flex-col items-center gap-1 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-4', className)}>
      <div className="flex items-baseline gap-0.5 font-mono">
        <span className="text-2xl font-bold text-white/90 tabular-nums">{pad(hours)}</span>
        <span className="animate-pulse text-xl text-indigo-400">:</span>
        <span className="text-2xl font-bold text-white/90 tabular-nums">{pad(minutes)}</span>
        <span className="animate-pulse text-xl text-indigo-400">:</span>
        <span className="text-lg text-white/50 tabular-nums">{pad(seconds)}</span>
      </div>
      {showDate && (
        <span className="text-[10px] text-white/40 font-medium">
          {now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      )}
    </div>
  );
}
