/* ─── TimetableSection ─── Real operational timetable ─────────────────
 * Daily/Weekly/Monthly views, class times, rooms, teachers, substitutions,
 * cancellations, exam dates, holidays
 * ─────────────────────────────────────────────────────────────────────── */
import { useMemo, useState } from 'react';
import {
  Clock, ChevronLeft, ChevronRight, MapPin,
  User, AlertCircle, Video, LayoutGrid, List, CalendarDays,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useStudentData } from '@/hooks/use-student-data';
import { EmptyState } from '@/components/features/EmptyState';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

type ViewMode = 'daily' | 'weekly' | 'monthly';

export function TimetableSection() {
  const store = useStudentData();
  const [view, setView] = useState<ViewMode>('weekly');
  const [selectedDay, setSelectedDay] = useState((new Date().getDay() + 6) % 7); // Mon=0
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
    return new Date(d.setDate(diff));
  }, [weekOffset]);

  const weekDateStr = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${new Date(weekStart.getTime() + 4 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const entriesForDay = (day: number) =>
    store.timetable
      .filter(t => t.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(t => ({
        ...t,
        subject: store.getSubject(t.subjectId),
        teacher: store.getTeacher(t.teacherId),
      }));

  const examOverlays = useMemo(() =>
    store.exams.filter(e => e.status === 'upcoming').map(e => ({
      ...e,
      subject: store.getSubject(e.subjectId),
    })),
    [store.exams, store],
  );

  const calendarEvents = useMemo(() =>
    store.calendar.map(c => ({ ...c, dateObj: new Date(c.date) })),
    [store.calendar],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white/90">Timetable</h2>
          <p className="text-sm text-white/40">Your class schedule and academic calendar</p>
        </div>
        <div className="flex items-center gap-2">
          {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(v => (
            <Button key={v} size="sm" variant={view === v ? 'default' : 'ghost'}
              onClick={() => setView(v)} className={cn('text-xs capitalize', view !== v && 'text-white/40')}>
              {v === 'daily' ? <List className="size-3.5 mr-1" /> : v === 'weekly' ? <LayoutGrid className="size-3.5 mr-1" /> : <CalendarDays className="size-3.5 mr-1" />}
              {v}
            </Button>
          ))}
        </div>
      </div>

      {/* ── Daily View ── */}
      {view === 'daily' && (
        <div className="space-y-4">
          {/* Day selector */}
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => setSelectedDay(d => Math.max(0, d - 1))} disabled={selectedDay === 0}>
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex gap-1">
              {DAYS.map((d, i) => (
                <Button key={d} size="sm" variant={selectedDay === i ? 'default' : 'outline'}
                  onClick={() => setSelectedDay(i)} className={cn('text-xs px-3', selectedDay !== i && 'border-white/10 text-white/40')}>
                  {DAYS_SHORT[i]}
                </Button>
              ))}
            </div>
            <Button size="icon" variant="ghost" onClick={() => setSelectedDay(d => Math.min(4, d + 1))} disabled={selectedDay === 4}>
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <DaySchedule entries={entriesForDay(selectedDay)} dayName={DAYS[selectedDay]} />
        </div>
      )}

      {/* ── Weekly View ── */}
      {view === 'weekly' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button size="sm" variant="ghost" onClick={() => setWeekOffset(w => w - 1)} className="text-white/40">
              <ChevronLeft className="size-4 mr-1" /> Previous
            </Button>
            <span className="text-sm font-medium text-white/60">{weekDateStr}</span>
            <Button size="sm" variant="ghost" onClick={() => setWeekOffset(w => w + 1)} className="text-white/40">
              Next <ChevronRight className="size-4 ml-1" />
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-5">
            {DAYS.map((day, i) => {
              const entries = entriesForDay(i);
              const isToday = i === (new Date().getDay() + 6) % 7 && weekOffset === 0;
              return (
                <Card key={day} className={cn('border-white/8 bg-white/[0.02]', isToday && 'border-indigo-500/20 bg-indigo-500/[0.02]')}>
                  <CardHeader className="pb-2 pt-3 px-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn('text-xs font-semibold', isToday ? 'text-indigo-400' : 'text-white/60')}>
                        {day}
                      </CardTitle>
                      {isToday && <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[8px]">TODAY</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    {entries.length === 0 ? (
                      <p className="text-[11px] text-white/25 py-4 text-center">No classes</p>
                    ) : (
                      <div className="space-y-1.5">
                        {entries.map(e => (
                          <div key={e.id} className={cn(
                            'rounded-lg border p-2 transition-all text-left',
                            e.cancelled ? 'border-red-500/10 bg-red-500/[0.03] opacity-60' :
                            'border-white/6 hover:border-white/10 bg-white/[0.01]',
                          )}>
                            <div className="flex items-center gap-1.5">
                              <div className="size-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.subject?.color }} />
                              <span className={cn('text-[11px] font-medium truncate', e.cancelled ? 'line-through text-white/40' : 'text-white/70')}>
                                {e.subject?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="size-2.5 text-white/25" />
                              <span className="text-[10px] text-white/35">{e.startTime}–{e.endTime}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin className="size-2.5 text-white/25" />
                              <span className="text-[10px] text-white/35">{e.room}</span>
                            </div>
                            {e.cancelled && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertCircle className="size-2.5 text-red-400" />
                                <span className="text-[9px] text-red-400">Cancelled</span>
                              </div>
                            )}
                            {e.type === 'lab' && <Badge variant="outline" className="text-[8px] mt-1 border-white/8 text-white/30">Lab</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Monthly Calendar View ── */}
      {view === 'monthly' && (
        <Card className="border-white/8 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-base text-white/85">Academic Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {calendarEvents.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime()).map(evt => (
                <div key={evt.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] p-3 hover:border-white/10 transition-all">
                  <div className="flex flex-col items-center justify-center size-12 rounded-xl border border-white/8" style={{ backgroundColor: `${evt.color}10` }}>
                    <span className="text-[10px] text-white/40">{evt.dateObj.toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-lg font-bold text-white/80">{evt.dateObj.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/75 truncate">{evt.title}</p>
                    <Badge variant="outline" className="text-[9px] capitalize border-white/10 text-white/40 mt-1">{evt.type}</Badge>
                  </div>
                  <div className="size-2 rounded-full" style={{ backgroundColor: evt.color }} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exam overlay */}
      {examOverlays.length > 0 && view !== 'monthly' && (
        <Card className="border-pink-500/10 bg-pink-500/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 text-pink-400" />
              <CardTitle className="text-base text-white/85">Upcoming Exam Dates</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {examOverlays.map(e => (
                <div key={e.id} className="flex items-center gap-2 rounded-lg border border-pink-500/10 bg-pink-500/[0.03] px-3 py-2">
                  <div className="size-2 rounded-full" style={{ backgroundColor: e.subject?.color }} />
                  <span className="text-xs text-white/60">{e.title}</span>
                  <span className="text-[10px] text-white/35">{new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ── Day Schedule Component ── */
interface ScheduleEntry { id: string; startTime: string; endTime: string; room: string; type: string; cancelled?: boolean; note?: string; onlineLink?: string; subject?: { id: string; name: string; color: string } | undefined; teacher?: { id: string; name: string } | undefined; }
function DaySchedule({ entries, dayName }: { entries: ScheduleEntry[]; dayName: string }) {
  if (entries.length === 0) {
    return <EmptyState title={`No classes on ${dayName}`} description="Enjoy your free time — review notes or work on assignments." />;
  }

  return (
    <div className="space-y-2">
      {entries.map(entry => (
        <Card key={entry.id} className={cn(
          'border-white/8 bg-white/[0.02] hover:border-white/12 transition-all',
          entry.cancelled && 'opacity-60 border-red-500/10 bg-red-500/[0.02]',
        )}>
          <CardContent className="flex items-center gap-4 py-3 px-4">
            <div className="flex flex-col items-center min-w-[70px]">
              <span className="text-sm font-medium text-white/60">{entry.startTime}</span>
              <span className="text-[10px] text-white/30">{entry.endTime}</span>
            </div>
            <div className="h-10 w-1.5 rounded-full" style={{ backgroundColor: (entry.subject)?.color ?? '#666' }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-sm font-semibold', entry.cancelled ? 'line-through text-white/40' : 'text-white/85')}>
                  {(entry.subject)?.name ?? 'Unknown'}
                </span>
                {entry.cancelled && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[9px]">CANCELLED</Badge>}
                {entry.type === 'lab' && <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">Lab Session</Badge>}
                {entry.type === 'tutorial' && <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">Tutorial</Badge>}
              </div>
              <div className="flex items-center gap-4 mt-1 text-[11px] text-white/40">
                <span className="flex items-center gap-1"><MapPin className="size-3" />{entry.room}</span>
                <span className="flex items-center gap-1"><User className="size-3" />{(entry.teacher)?.name}</span>
                {entry.onlineLink && <span className="flex items-center gap-1 text-cyan-400"><Video className="size-3" />Join Online</span>}
              </div>
              {entry.note && <p className="text-[10px] text-amber-400/70 mt-1">{entry.note}</p>}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
