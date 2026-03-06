/* ─── CountdownWidget ─── Countdown to a future event ─────────────── */
import { useEffect, useState } from 'react';
import { Timer, CalendarClock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownWidgetProps {
  targetDate: Date | string;
  label?: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Tile({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex size-12 items-center justify-center rounded-lg border border-white/8 bg-white/5 font-mono text-lg font-bold text-white/90 tabular-nums">
        {value.toString().padStart(2, '0')}
      </div>
      <span className="text-[9px] uppercase tracking-wider text-white/30">{unit}</span>
    </div>
  );
}

export function CountdownWidget({ targetDate, label = 'Countdown', className }: CountdownWidgetProps) {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calcTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calcTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const expired = !timeLeft;

  return (
    <div className={cn('flex flex-col items-center gap-4 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-5', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <CalendarClock className="size-4 text-violet-400" />
        <span className="text-sm font-semibold text-white/80">{label}</span>
      </div>

      {expired ? (
        <div className="flex items-center gap-2 py-3">
          <Timer className="size-5 text-emerald-400" />
          <span className="text-base font-bold text-emerald-400">Event Started!</span>
        </div>
      ) : (
        <div className="flex gap-3">
          <Tile value={timeLeft.days} unit="Days" />
          <Tile value={timeLeft.hours} unit="Hrs" />
          <Tile value={timeLeft.minutes} unit="Min" />
          <Tile value={timeLeft.seconds} unit="Sec" />
        </div>
      )}

      <span className="text-[10px] text-white/30">
        {target.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  );
}
