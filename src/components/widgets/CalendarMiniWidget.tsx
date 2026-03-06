/* ─── CalendarMiniWidget ─── Compact month/day calendar ───────────── */
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface CalendarEvent {
  date: string; // ISO date "YYYY-MM-DD"
  label: string;
  color?: string;
}

interface CalendarMiniWidgetProps {
  events?: CalendarEvent[];
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CalendarMiniWidget({ events = [], className }: CalendarMiniWidgetProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const isThisMonth = year === today.getFullYear() && month === today.getMonth();

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let week: (number | null)[] = Array(firstDay).fill(null);

    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        rows.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      rows.push(week);
    }
    return rows;
  }, [year, month]);

  const eventDates = useMemo(() => {
    const m = new Map<number, CalendarEvent[]>();
    events.forEach((ev) => {
      const d = new Date(ev.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const arr = m.get(d.getDate()) ?? [];
        arr.push(ev);
        m.set(d.getDate(), arr);
      }
    });
    return m;
  }, [events, year, month]);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); };

  const monthLabel = new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-4', className)}>
      {/* Nav */}
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 text-indigo-400" />
        <span className="flex-1 text-sm font-semibold text-white/80">{monthLabel}</span>
        {!isThisMonth && (
          <Button variant="ghost" size="sm" onClick={goToday} className="h-6 text-[10px] text-white/40">
            Today
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={prev} className="size-6 text-white/40">
          <ChevronLeft className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={next} className="size-6 text-white/40">
          <ChevronRight className="size-3.5" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <span key={d} className="text-center text-[9px] font-medium text-white/25 uppercase">{d}</span>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.flat().map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;
          const isToday = isThisMonth && day === today.getDate();
          const hasEvent = eventDates.has(day);

          return (
            <div
              key={day}
              className={cn(
                'relative flex size-7 items-center justify-center rounded-md text-[11px] font-medium transition-colors cursor-default',
                isToday
                  ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-400/40'
                  : 'text-white/60 hover:bg-white/5',
              )}
            >
              {day}
              {hasEvent && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-emerald-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Event list (current month) */}
      {eventDates.size > 0 && (
        <div className="flex flex-col gap-1 border-t border-white/6 pt-2">
          {[...eventDates.entries()].slice(0, 3).map(([day, evs]) => (
            <div key={day} className="flex items-center gap-2 text-[10px]">
              <span className="w-5 text-right text-white/30 font-mono">{day}</span>
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-white/60 truncate">{evs.map(e => e.label).join(', ')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
