/* ─── CalendarPage ─── Full calendar view with event CRUD ─────────── */
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';

type EventCategory = 'class' | 'meeting' | 'deadline' | 'event' | 'personal';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  category: EventCategory;
  location?: string;
  description?: string;
}

const CATEGORY_COLORS: Record<EventCategory, { dot: string; bg: string; text: string }> = {
  class: { dot: 'bg-indigo-400', bg: 'bg-indigo-400/10', text: 'text-indigo-400' },
  meeting: { dot: 'bg-violet-400', bg: 'bg-violet-400/10', text: 'text-violet-400' },
  deadline: { dot: 'bg-red-400', bg: 'bg-red-400/10', text: 'text-red-400' },
  event: { dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
  personal: { dot: 'bg-amber-400', bg: 'bg-amber-400/10', text: 'text-amber-400' },
};

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Math 101', date: '2025-03-17', time: '09:00', category: 'class', location: 'Room 201' },
  { id: '2', title: 'Staff Meeting', date: '2025-03-17', time: '14:00', category: 'meeting', location: 'Conference Room' },
  { id: '3', title: 'Essay Due', date: '2025-03-18', time: '23:59', category: 'deadline' },
  { id: '4', title: 'Science Fair', date: '2025-03-20', time: '10:00', category: 'event', location: 'Gymnasium', description: 'Annual science fair — all students welcome.' },
  { id: '5', title: 'Parent-Teacher Conf.', date: '2025-03-19', time: '16:00', category: 'meeting', location: 'Main Hall' },
  { id: '6', title: 'Art Club', date: '2025-03-18', time: '15:30', category: 'personal', location: 'Art Studio' },
  { id: '7', title: 'Chemistry Lab', date: '2025-03-21', time: '11:00', category: 'class', location: 'Lab 3' },
  { id: '8', title: 'Debate Practice', date: '2025-03-21', time: '14:30', category: 'personal' },
];

export default function CalendarPage() {
  const containerRef = useStaggerAnimate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const monthLabel = new Date(year, month).toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const arr: (number | null)[] = Array(firstDay).fill(null);
    for (let d = 1; d <= days; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  const eventsMap = useMemo(() => {
    const m = new Map<string, CalendarEvent[]>();
    MOCK_EVENTS.forEach((ev) => {
      const arr = m.get(ev.date) ?? [];
      arr.push(ev);
      m.set(ev.date, arr);
    });
    return m;
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = (day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;
  const selectedEvents = selectedDate ? eventsMap.get(selectedDate) ?? [] : [];

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  return (
    <div ref={containerRef} className="flex flex-col gap-6 p-4">
      {/* Header */}
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-5 text-indigo-400" />
          <h1 className="text-lg font-bold text-white/90">{monthLabel}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <Button size="sm" variant="ghost" onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} className="text-xs text-white/40">Today</Button>
          )}
          <Button size="icon" variant="ghost" onClick={prev} className="size-7 text-white/40"><ChevronLeft className="size-4" /></Button>
          <Button size="icon" variant="ghost" onClick={next} className="size-7 text-white/40"><ChevronRight className="size-4" /></Button>
          <Button className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/20 text-xs h-8">
            <Plus className="size-3" />New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Calendar grid */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="p-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {SHORT_DAYS.map((d) => (
                <span key={d} className="text-center text-[10px] font-medium text-white/30 uppercase py-1">{d}</span>
              ))}
            </div>
            {/* Cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} className="aspect-square" />;
                const ds = dateStr(day);
                const isToday = isCurrentMonth && day === today.getDate();
                const events = eventsMap.get(ds) ?? [];
                const isSelected = selectedDate === ds;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(ds)}
                    className={cn(
                      'aspect-square rounded-lg border p-1 flex flex-col items-start transition-colors text-left',
                      isSelected
                        ? 'border-indigo-400/40 bg-indigo-500/10'
                        : 'border-white/4 hover:bg-white/4',
                    )}
                  >
                    <span className={cn(
                      'text-[11px] font-medium',
                      isToday ? 'text-indigo-400 font-bold' : 'text-white/60',
                    )}>
                      {day}
                    </span>
                    <div className="flex flex-wrap gap-0.5 mt-auto">
                      {events.slice(0, 3).map((ev) => (
                        <span key={ev.id} className={cn('size-1.5 rounded-full', CATEGORY_COLORS[ev.category].dot)} />
                      ))}
                      {events.length > 3 && (
                        <span className="text-[8px] text-white/30">+{events.length - 3}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Side panel */}
        <div className="flex flex-col gap-3">
          {/* Legend */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="p-3 flex flex-wrap gap-3">
              {Object.entries(CATEGORY_COLORS).map(([cat, c]) => (
                <span key={cat} className="flex items-center gap-1.5 text-[10px] text-white/50 capitalize">
                  <span className={cn('size-2 rounded-full', c.dot)} />{cat}
                </span>
              ))}
            </CardContent>
          </Card>

          {/* Selected day events */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl flex-1">
            <CardHeader className="py-3">
              <CardTitle className="text-white/80 text-sm">
                {selectedDate
                  ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                  : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {selectedDate && selectedEvents.length === 0 && (
                <p className="py-4 text-center text-xs text-white/25">No events this day</p>
              )}
              {selectedEvents.map((ev) => {
                const c = CATEGORY_COLORS[ev.category];
                return (
                  <div key={ev.id} className={cn('rounded-lg border border-white/6 p-3', c.bg)}>
                    <div className="flex items-start justify-between">
                      <span className={cn('text-xs font-semibold', c.text)}>{ev.title}</span>
                      <Badge className={cn('border-0 text-[8px] capitalize', c.bg, c.text)}>{ev.category}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/40">
                      <span className="flex items-center gap-0.5"><Clock className="size-2.5" />{ev.time}</span>
                      {ev.location && <span className="flex items-center gap-0.5"><MapPin className="size-2.5" />{ev.location}</span>}
                    </div>
                    {ev.description && <p className="mt-1.5 text-[10px] text-white/30 leading-relaxed">{ev.description}</p>}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
