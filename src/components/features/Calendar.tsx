/* ─── Calendar ─── Luxury 2040 weekly/daily schedule grid with holographic session blocks ─── */
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  BookOpen, FlaskConical, MessageSquare, FileCheck, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CourseSession } from '@root/types';

// ── Session type color map ─────────────────────
const SESSION_COLORS: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  LECTURE:  { bg: 'bg-indigo-500/12', border: 'border-indigo-400/30', text: 'text-indigo-300', glow: 'shadow-indigo-500/10' },
  LAB:     { bg: 'bg-emerald-500/12', border: 'border-emerald-400/30', text: 'text-emerald-300', glow: 'shadow-emerald-500/10' },
  TUTORIAL:{ bg: 'bg-amber-500/12',   border: 'border-amber-400/30',   text: 'text-amber-300',   glow: 'shadow-amber-500/10' },
  EXAM:    { bg: 'bg-rose-500/12',    border: 'border-rose-400/30',    text: 'text-rose-300',    glow: 'shadow-rose-500/10' },
};

const SESSION_ICONS: Record<string, typeof BookOpen> = {
  LECTURE: BookOpen,
  LAB: FlaskConical,
  TUTORIAL: MessageSquare,
  EXAM: FileCheck,
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am - 8pm

function formatHour(h: number) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display} ${suffix}`;
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function getWeekDates(refDate: Date): Date[] {
  const d = new Date(refDate);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return date;
  });
}

export interface CalendarProps {
  sessions: CourseSession[];
  onSessionClick?: (session: CourseSession) => void;
  className?: string;
}

export function Calendar({ sessions, onSessionClick, className = '' }: CalendarProps) {
  const [view, setView] = useState<'day' | 'week'>('week');
  const [refDate, setRefDate] = useState(() => new Date());
  const gridRef = useRef<HTMLDivElement>(null);

  // Live time tick
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const weekDates = useMemo(() => getWeekDates(refDate), [refDate]);
  const todayStr = now.toISOString().slice(0, 10);

  // Navigation
  const navigate = useCallback((dir: -1 | 1) => {
    setRefDate(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + (view === 'week' ? 7 * dir : dir));
      return next;
    });
  }, [view]);

  const goToday = useCallback(() => setRefDate(new Date()), []);

  // Columns for current view
  const columns = view === 'week' ? weekDates : [refDate];

  // Detect conflicts (overlapping sessions on same day)
  const conflicts = useMemo(() => {
    const set = new Set<string>();
    const byDay = new Map<number, CourseSession[]>();
    sessions.forEach(s => {
      const arr = byDay.get(s.dayOfWeek) ?? [];
      arr.push(s);
      byDay.set(s.dayOfWeek, arr);
    });
    byDay.forEach(daySessions => {
      for (let i = 0; i < daySessions.length; i++) {
        for (let j = i + 1; j < daySessions.length; j++) {
          const a = daySessions[i], b = daySessions[j];
          const aStart = timeToMinutes(a.startTime), aEnd = timeToMinutes(a.endTime);
          const bStart = timeToMinutes(b.startTime), bEnd = timeToMinutes(b.endTime);
          if (aStart < bEnd && bStart < aEnd) {
            set.add(a.id);
            set.add(b.id);
          }
        }
      }
    });
    return set;
  }, [sessions]);

  // Current time indicator position
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const gridStart = HOURS[0] * 60;
  const gridEnd = (HOURS[HOURS.length - 1] + 1) * 60;
  const nowPct = ((nowMinutes - gridStart) / (gridEnd - gridStart)) * 100;
  const showNowLine = nowMinutes >= gridStart && nowMinutes <= gridEnd;

  // Header label
  const headerLabel = useMemo(() => {
    if (view === 'day') {
      return refDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    const start = weekDates[0];
    const end = weekDates[6];
    const sameMonth = start.getMonth() === end.getMonth();
    if (sameMonth) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }, [view, refDate, weekDates]);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* ── Header navigation ── */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap" data-animate>
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-5 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white/85">{headerLabel}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="size-8 text-white/50 hover:text-white/80" onClick={() => navigate(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-white/60 hover:text-white/90 h-8 px-3" onClick={goToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="size-8 text-white/50 hover:text-white/80" onClick={() => navigate(1)}>
            <ChevronRight className="size-4" />
          </Button>
          <Tabs value={view} onValueChange={v => setView(v as 'day' | 'week')}>
            <TabsList className="bg-white/4 border border-white/6 h-8">
              <TabsTrigger value="day" className="text-xs px-3 h-6">Day</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-3 h-6">Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div className="rounded-2xl border border-white/6 bg-white/2 backdrop-blur-xl overflow-hidden" data-animate>
        {/* Day headers */}
        <div className="grid border-b border-white/6" style={{ gridTemplateColumns: `3.5rem repeat(${columns.length}, 1fr)` }}>
          <div className="h-10" /> {/* spacer for time column */}
          {columns.map((date, i) => {
            const dateStr = date.toISOString().slice(0, 10);
            const isToday = dateStr === todayStr;
            return (
              <div key={i} className={`px-2 py-2 text-center border-l border-white/4 ${isToday ? 'bg-indigo-500/6' : ''}`}>
                <p className="text-[10px] text-white/40 uppercase">{DAYS[date.getDay()]}</p>
                <p className={`text-sm font-semibold mt-0.5 ${isToday ? 'text-indigo-400' : 'text-white/70'}`}>
                  {date.getDate()}
                  {isToday && <span className="inline-block size-1.5 rounded-full bg-indigo-400 ml-1.5 animate-pulse" />}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div ref={gridRef} className="relative overflow-y-auto" style={{ maxHeight: '65vh' }}>
          <div className="grid" style={{ gridTemplateColumns: `3.5rem repeat(${columns.length}, 1fr)` }}>
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                {/* Time label */}
                <div className="h-16 flex items-start justify-end pr-2 pt-0.5 border-b border-white/3">
                  <span className="text-[10px] text-white/25 font-medium">{formatHour(hour)}</span>
                </div>
                {/* Day cells */}
                {columns.map((date, ci) => {
                  const dateStr = date.toISOString().slice(0, 10);
                  const isToday = dateStr === todayStr;
                  return (
                    <div
                      key={ci}
                      className={`h-16 border-l border-b border-white/3 relative ${isToday ? 'bg-indigo-500/2' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* ── Session blocks (absolutely positioned) ── */}
          <div className="absolute inset-0 pointer-events-none" style={{ paddingLeft: '3.5rem' }}>
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
              {columns.map((date, ci) => {
                const dayOfWeek = date.getDay();
                const daySessions = sessions.filter(s => s.dayOfWeek === dayOfWeek);
                return (
                  <div key={ci} className="relative">
                    {daySessions.map(session => {
                      const startMin = timeToMinutes(session.startTime) - gridStart;
                      const endMin = timeToMinutes(session.endTime) - gridStart;
                      const totalMin = gridEnd - gridStart;
                      const topPct = (startMin / totalMin) * 100;
                      const heightPct = ((endMin - startMin) / totalMin) * 100;
                      const colors = SESSION_COLORS[session.type] ?? SESSION_COLORS.LECTURE;
                      const Icon = SESSION_ICONS[session.type] ?? BookOpen;
                      const hasConflict = conflicts.has(session.id);

                      return (
                        <button
                          key={session.id}
                          className={`
                            pointer-events-auto absolute left-0.5 right-0.5 rounded-lg border px-2 py-1
                            cursor-pointer transition-all duration-200
                            hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                            backdrop-blur-md overflow-hidden group
                            ${colors.bg} ${colors.border} ${colors.glow}
                            ${hasConflict ? 'ring-1 ring-amber-400/40' : ''}
                          `}
                          style={{
                            top: `${topPct}%`,
                            height: `${heightPct}%`,
                            minHeight: '1.5rem',
                          }}
                          title={`${session.title || session.course?.name || 'Session'} • ${session.startTime}–${session.endTime}${session.room ? ` • ${session.room}` : ''}${hasConflict ? ' ⚠ Conflict' : ''}`}
                          onClick={() => onSessionClick?.(session)}
                        >
                          {/* Holographic shimmer overlay */}
                          <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 flex items-start gap-1 min-w-0">
                            <Icon className={`size-3 shrink-0 mt-0.5 ${colors.text}`} />
                            <div className="min-w-0 text-left">
                              <p className={`text-[10px] font-semibold leading-tight truncate ${colors.text}`}>
                                {session.title || session.course?.name || 'Session'}
                              </p>
                              {heightPct > 5 && (
                                <p className="text-[9px] text-white/35 truncate">
                                  {session.startTime}–{session.endTime}{session.room ? ` · ${session.room}` : ''}
                                </p>
                              )}
                            </div>
                            {hasConflict && <AlertTriangle className="size-3 text-amber-400/70 shrink-0 ml-auto" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Current time scanning line ── */}
          {showNowLine && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: `${nowPct}%` }}
            >
              <div className="w-14 flex justify-end pr-1">
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 rounded px-1 py-px">
                  {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex-1 h-px bg-indigo-400/60 relative">
                <div className="absolute left-0 h-px w-full bg-linear-to-r from-indigo-400/80 via-indigo-400/40 to-transparent animate-pulse" />
                <div className="absolute -left-1 -top-1 size-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
