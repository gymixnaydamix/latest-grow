/* ─── Meetings Section ────────────────────────────────────────────
 * Routes: upcoming_meetings (default) | schedule_meeting | office_hours
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  Calendar, CalendarPlus, Clock, MapPin,
  Search, Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useNavigationStore } from '@/store/navigation.store';
import { useScheduleMeeting, useTeacherMeetings } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import {
  TeacherSectionShell, GlassCard, MetricCard, StatusBadge, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  meetingsDemo as FALLBACK_meetingsDemo, formatDateLabel, formatTimeRange, type MeetingDemo,
} from './teacher-demo-data';

/* ── Meeting type styling ── */
const meetingTypeStyles: Record<string, { border: string; bg: string; text: string; label: string }> = {
  'parent-conference': { border: 'border-amber-500/20', bg: 'bg-amber-500/8', text: 'text-amber-400', label: 'Parent Conference' },
  'staff-meeting': { border: 'border-indigo-500/20', bg: 'bg-indigo-500/8', text: 'text-indigo-400', label: 'Staff Meeting' },
  'department': { border: 'border-emerald-500/20', bg: 'bg-emerald-500/8', text: 'text-emerald-400', label: 'Department' },
  'iep': { border: 'border-rose-500/20', bg: 'bg-rose-500/8', text: 'text-rose-400', label: 'IEP Review' },
  'office-hours': { border: 'border-sky-500/20', bg: 'bg-sky-500/8', text: 'text-sky-400', label: 'Office Hours' },
};

/* ── Office hours demo slots ── */
interface OfficeHourSlot {
  id: string;
  day: string;
  time: string;
  status: 'open' | 'booked';
  bookedBy?: string;
  topic?: string;
}

const officeHoursSlots: OfficeHourSlot[] = [
  { id: 'oh1', day: 'Monday', time: '3:30 – 4:30 PM', status: 'booked', bookedBy: 'Mrs. Kim (Parent)', topic: 'Jordan Kim progress check' },
  { id: 'oh2', day: 'Tuesday', time: '3:30 – 4:30 PM', status: 'open' },
  { id: 'oh3', day: 'Wednesday', time: '3:30 – 4:30 PM', status: 'booked', bookedBy: 'Sam Lee (Student)', topic: 'AP Calc exam prep guidance' },
  { id: 'oh4', day: 'Thursday', time: '3:30 – 4:30 PM', status: 'open' },
  { id: 'oh5', day: 'Friday', time: '3:30 – 4:30 PM', status: 'booked', bookedBy: 'Mr. Wei (Parent)', topic: 'Chen Wei attendance follow-up' },
  { id: 'oh6', day: 'Monday (Next)', time: '3:30 – 4:30 PM', status: 'open' },
  { id: 'oh7', day: 'Tuesday (Next)', time: '3:30 – 4:30 PM', status: 'open' },
  { id: 'oh8', day: 'Wednesday (Next)', time: '3:30 – 4:30 PM', status: 'open' },
];

export function MeetingsSection(_props: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const header = activeHeader || 'upcoming_meetings';
  const scheduleMeetingMut = useScheduleMeeting();
  const { data: apiMeetings } = useTeacherMeetings();

  const meetings: MeetingDemo[] = (apiMeetings as unknown as MeetingDemo[]) ?? FALLBACK_meetingsDemo;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  /* ── Schedule form state ── */
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<string>('parent-conference');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formAttendees, setFormAttendees] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const scheduled = meetings.filter(m => m.status === 'scheduled');
  const completed = meetings.filter(m => m.status === 'completed');
  const thisWeek = scheduled.filter(m => m.date <= '2026-03-08');

  const filtered = useMemo(() => {
    let result = scheduled;
    if (filterType !== 'all') result = result.filter(m => m.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.attendees.some(a => a.toLowerCase().includes(q)) ||
        m.location.toLowerCase().includes(q),
      );
    }
    return result;
  }, [scheduled, filterType, search]);

  const handleSchedule = () => {
    if (!formTitle.trim() || !formDate || !formTime) return;
    scheduleMeetingMut.mutate(
      {
        title: formTitle.trim(),
        type: formType,
        date: formDate,
        startTime: formTime,
        endTime: formEndTime,
        location: formLocation,
        attendees: formAttendees
          .split(',')
          .map(a => a.trim())
          .filter(Boolean)
          .join(', '),
        notes: formNotes,
      },
      {
        onSuccess: () => {
          notifySuccess('Meeting scheduled', `"${formTitle}" has been scheduled`);
          setFormTitle('');
          setFormType('parent-conference');
          setFormDate('');
          setFormTime('');
          setFormEndTime('');
          setFormLocation('');
          setFormAttendees('');
          setFormNotes('');
          setHeader('upcoming_meetings');
        },
      },
    );
  };

  const bookedSlots = officeHoursSlots.filter(s => s.status === 'booked').length;
  const openSlots = officeHoursSlots.filter(s => s.status === 'open').length;

  return (
    <TeacherSectionShell
      title="Meetings"
      description={`${scheduled.length} upcoming · ${completed.length} completed`}
      actions={
        <Button
          size="sm"
          className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
          onClick={() => setHeader('schedule_meeting')}
        >
          <CalendarPlus className="size-3.5" /> Schedule Meeting
        </Button>
      }
    >
      {/* ── Metrics ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-animate>
        <MetricCard label="Upcoming" value={scheduled.length} accent="#818cf8" />
        <MetricCard label="This Week" value={thisWeek.length} accent="#fbbf24" />
        <MetricCard label="Completed" value={completed.length} accent="#34d399" trend="up" />
        <MetricCard label="Office Hours Booked" value={bookedSlots} accent="#f472b6" />
      </div>

      {/* ── UPCOMING MEETINGS VIEW ── */}
      {header === 'upcoming_meetings' && (
        <div className="space-y-4" data-animate>
          {/* Search + Filter */}
          <GlassCard className="flex flex-wrap items-center gap-3 p-3!">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <Input
                placeholder="Search meetings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'parent-conference', 'staff-meeting', 'department', 'iep'].map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filterType === t
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'
                  }`}
                >
                  {t === 'all' ? 'All' : meetingTypeStyles[t]?.label ?? t}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Meeting Timeline */}
          {filtered.length === 0 ? (
            <EmptyState title="No meetings" message="No upcoming meetings match your filters." icon={<Calendar className="size-8" />} />
          ) : (
            <div className="relative space-y-3">
              <div className="absolute left-4.75 top-4 bottom-4 w-px bg-muted/80" />

              {filtered.map(mtg => {
                const style = meetingTypeStyles[mtg.type] ?? meetingTypeStyles['staff-meeting'];
                return (
                  <div key={mtg.id} className="relative flex gap-4 pl-1">
                    {/* Timeline dot */}
                    <div className={`relative z-10 mt-4 shrink-0 flex items-center justify-center size-9.5 rounded-full border ${style.border} ${style.bg}`}>
                      <Calendar className={`size-4 ${style.text}`} />
                    </div>

                    {/* Card */}
                    <div className="flex-1 rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-foreground/80">{mtg.title}</span>
                            <Badge className={`text-[9px] font-medium ${style.border} ${style.bg} ${style.text}`}>
                              {style.label}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/80">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" /> {formatDateLabel(mtg.date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="size-3" /> {formatTimeRange(mtg.startTime, mtg.endTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3" /> {mtg.location}
                            </span>
                          </div>
                        </div>
                        <StatusBadge
                          status={mtg.status === 'scheduled' ? 'Scheduled' : mtg.status === 'completed' ? 'Completed' : 'Cancelled'}
                          tone={mtg.status === 'scheduled' ? 'info' : mtg.status === 'completed' ? 'good' : 'bad'}
                        />
                      </div>

                      {/* Attendees */}
                      {mtg.attendees.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="size-3.5 text-muted-foreground/60" />
                          <div className="flex flex-wrap gap-1">
                            {mtg.attendees.map(a => (
                              <Badge key={a} variant="outline" className="text-[9px] border-border/60 text-muted-foreground">
                                {a}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {mtg.notes && (
                        <p className="mt-2 text-xs text-muted-foreground italic">{mtg.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Completed Meetings section */}
          {completed.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wide">Recently Completed</h4>
              {completed.map(mtg => {
                const style = meetingTypeStyles[mtg.type] ?? meetingTypeStyles['staff-meeting'];
                return (
                  <div key={mtg.id} className="rounded-xl border border-border/40 bg-card/60 px-4 py-3 opacity-60">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{mtg.title}</span>
                      <Badge className={`text-[9px] ${style.border} ${style.bg} ${style.text}`}>{style.label}</Badge>
                      <span className="ml-auto text-[10px] text-muted-foreground/60">{formatDateLabel(mtg.date)}</span>
                      <StatusBadge status="Completed" tone="good" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SCHEDULE MEETING VIEW ── */}
      {header === 'schedule_meeting' && (
        <GlassCard data-animate>
          <div className="flex items-center gap-2 mb-5">
            <CalendarPlus className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground/80">Schedule New Meeting</h3>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                  placeholder="Meeting title"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={formType} onValueChange={setFormType}>
                  <SelectTrigger className="bg-card/80 border-border/60 text-foreground/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/70">
                    <SelectItem value="parent-conference">Parent Conference</SelectItem>
                    <SelectItem value="staff-meeting">Staff Meeting</SelectItem>
                    <SelectItem value="department">Department Meeting</SelectItem>
                    <SelectItem value="iep">IEP Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="bg-card/80 border-border/60 text-foreground/80"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <Input
                  type="time"
                  value={formTime}
                  onChange={e => setFormTime(e.target.value)}
                  className="bg-card/80 border-border/60 text-foreground/80"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <Input
                  type="time"
                  value={formEndTime}
                  onChange={e => setFormEndTime(e.target.value)}
                  className="bg-card/80 border-border/60 text-foreground/80"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Location</Label>
                <Input
                  placeholder="Room number or virtual link"
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Attendees</Label>
                <Input
                  placeholder="Comma-separated names"
                  value={formAttendees}
                  onChange={e => setFormAttendees(e.target.value)}
                  className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Agenda / Notes</Label>
              <Textarea
                placeholder="Meeting agenda or preparation notes..."
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                rows={3}
                className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-muted-foreground" onClick={() => setHeader('upcoming_meetings')}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                onClick={handleSchedule}
                disabled={!formTitle.trim() || !formDate || !formTime}
              >
                <CalendarPlus className="size-3.5" /> Schedule
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ── OFFICE HOURS VIEW ── */}
      {header === 'office_hours' && (
        <div className="space-y-4" data-animate>
          <GlassCard className="flex items-center gap-3 py-3!">
            <Clock className="size-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-semibold text-foreground/80">Office Hours — Room 204</h3>
              <p className="text-xs text-muted-foreground/80">Weekly availability for students and parents · 3:30 – 4:30 PM daily</p>
            </div>
            <div className="ml-auto flex gap-2">
              <Badge variant="outline" className="text-[9px] border-sky-500/30 text-sky-400">{openSlots} open</Badge>
              <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-400">{bookedSlots} booked</Badge>
            </div>
          </GlassCard>

          <div className="grid gap-3 sm:grid-cols-2">
            {officeHoursSlots.map(slot => (
              <div
                key={slot.id}
                className={`rounded-xl border p-4 transition-all ${
                  slot.status === 'booked'
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/8'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground/70" />
                    <span className="text-sm font-medium text-foreground/70">{slot.day}</span>
                  </div>
                  <StatusBadge
                    status={slot.status === 'booked' ? 'Booked' : 'Open'}
                    tone={slot.status === 'booked' ? 'warn' : 'good'}
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                  <Clock className="size-3" /> {slot.time}
                </div>
                {slot.bookedBy && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-medium">{slot.bookedBy}</p>
                    {slot.topic && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{slot.topic}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </TeacherSectionShell>
  );
}
