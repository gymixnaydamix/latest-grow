/* ─── SessionDetailModal ─── Holographic session detail with course info + attendance ─── */
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen, FlaskConical, MessageSquare, FileCheck,
  MapPin, Clock, User, Users, CalendarDays, StickyNote,
  ClipboardCheck,
} from 'lucide-react';
import { useSession } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';
import { Link } from 'react-router-dom';
import type { CourseSession } from '@root/types';

const SESSION_ICONS: Record<string, typeof BookOpen> = {
  LECTURE: BookOpen, LAB: FlaskConical, TUTORIAL: MessageSquare, EXAM: FileCheck,
};

const SESSION_COLORS: Record<string, { badge: string; icon: string }> = {
  LECTURE:  { badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/20', icon: 'text-indigo-400' },
  LAB:     { badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20', icon: 'text-emerald-400' },
  TUTORIAL:{ badge: 'bg-amber-500/15 text-amber-300 border-amber-400/20', icon: 'text-amber-400' },
  EXAM:    { badge: 'bg-rose-500/15 text-rose-300 border-rose-400/20', icon: 'text-rose-400' },
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface SessionDetailModalProps {
  session: CourseSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionDetailModal({ session, open, onOpenChange }: SessionDetailModalProps) {
  // Fetch full session details (with course + enrollments) when modal open
  const { data: detail, isLoading } = useSession(open && session ? session.id : null);
  const { user } = useAuthStore();
  const canTakeAttendance = user && ['TEACHER', 'ADMIN', 'PROVIDER'].includes(user.role);

  const s = detail ?? session;
  if (!s) return null;

  const Icon = SESSION_ICONS[s.type] ?? BookOpen;
  const colors = SESSION_COLORS[s.type] ?? SESSION_COLORS.LECTURE;
  const course = s.course;
  const teacher = course?.teacher;
  const enrollments = (detail as { course?: { enrollments?: { student: { id: string; firstName: string; lastName: string; email: string } }[] } } | undefined)?.course?.enrollments;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-white/8 bg-[oklch(0.13_0.02_260)] backdrop-blur-2xl text-white/90">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white/90">
            <div className={`size-8 rounded-lg flex items-center justify-center bg-white/5 ${colors.icon}`}>
              <Icon className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold truncate">{s.title || course?.name || 'Session'}</p>
              {s.title && course?.name && (
                <p className="text-xs text-white/40 font-normal truncate">{course.name}</p>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">Session details</DialogDescription>
        </DialogHeader>

        {/* ── Session type + recurring badge ── */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`${colors.badge} gap-1 text-xs`}>
            <Icon className="size-3" />
            {s.type.charAt(0) + s.type.slice(1).toLowerCase()}
          </Badge>
          {s.recurring && (
            <Badge variant="outline" className="bg-white/5 text-white/50 border-white/10 text-xs">
              Recurring
            </Badge>
          )}
        </div>

        {/* ── Info grid ── */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Day */}
          <div className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/5 px-3 py-2.5">
            <CalendarDays className="size-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/35">Day</p>
              <p className="text-xs font-medium text-white/75">{DAYS[s.dayOfWeek]}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/5 px-3 py-2.5">
            <Clock className="size-4 text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/35">Time</p>
              <p className="text-xs font-medium text-white/75">{s.startTime} – {s.endTime}</p>
            </div>
          </div>

          {/* Room */}
          {s.room && (
            <div className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/5 px-3 py-2.5">
              <MapPin className="size-4 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-white/35">Room</p>
                <p className="text-xs font-medium text-white/75">{s.room}</p>
              </div>
            </div>
          )}

          {/* Teacher */}
          {teacher && (
            <div className="flex items-center gap-2 rounded-xl bg-white/3 border border-white/5 px-3 py-2.5">
              <User className="size-4 text-violet-400 shrink-0" />
              <div>
                <p className="text-[10px] text-white/35">Instructor</p>
                <p className="text-xs font-medium text-white/75">{teacher.firstName} {teacher.lastName}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Notes ── */}
        {s.notes && (
          <div className="rounded-xl bg-white/3 border border-white/5 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <StickyNote className="size-3.5 text-white/30" />
              <span className="text-[10px] text-white/35 uppercase tracking-wider font-medium">Notes</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{s.notes}</p>
          </div>
        )}

        {/* ── Student list ── */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full bg-white/4 rounded-lg" />
            ))}
          </div>
        ) : enrollments && enrollments.length > 0 ? (
          <div className="rounded-xl bg-white/3 border border-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="size-3.5 text-white/30" />
                <span className="text-[10px] text-white/35 uppercase tracking-wider font-medium">
                  Enrolled Students
                </span>
              </div>
              <span className="text-[10px] text-white/25">{enrollments.length}</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin">
              {enrollments.map(({ student }) => (
                <div key={student.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/3 transition-colors">
                  <div className="size-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-semibold text-indigo-300">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/70 truncate">{student.firstName} {student.lastName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Actions ── */}
        <div className="flex items-center justify-between pt-1">
          {course && (
            <Button asChild variant="ghost" className="text-xs text-white/50 hover:text-white/80 h-8 px-3">
              <Link to={`/courses/${course.id}`}>View Course</Link>
            </Button>
          )}
          {canTakeAttendance && course && (
            <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 gap-1.5 px-4">
              <Link to={`/attendance?courseId=${course.id}`}>
                <ClipboardCheck className="size-3.5" /> Take Attendance
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
