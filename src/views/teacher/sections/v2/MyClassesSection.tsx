/* ─── My Classes — Class list + timetable ────────────────────────── */
import { BookOpen, Users, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCourses } from '@/hooks/api';
import { useTeacherClasses } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import type { Course } from '@root/types';
import { TeacherSectionShell, GlassCard } from './shared';
import type { TeacherSectionProps } from './shared';
import { teacherClassesDemo as FALLBACK_teacherClassesDemo } from './teacher-demo-data';

export function MyClassesSection({ schoolId, teacherId }: TeacherSectionProps) {
  const { activeHeader, navigate } = useNavigationStore();
  const { data: coursesRes, isLoading } = useCourses(schoolId);
  const { data: apiTeacherClasses } = useTeacherClasses();
  void apiTeacherClasses;
  const courses: Course[] = coursesRes ?? [];
  const teacherCourses = teacherId ? courses.filter(c => c.teacherId === teacherId) : courses;

  if (activeHeader === 'class_timetable') {
    return <TimetableView schoolId={schoolId} teacherId={teacherId} />;
  }

  // Default: class list
  const classColors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#fb923c'];

  return (
    <TeacherSectionShell
      title="My Classes"
      description={`${teacherCourses.length || FALLBACK_teacherClassesDemo.length} active classes this semester`}
    >
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-2xl border border-white/6 bg-white/3 animate-pulse" />
          ))}
        </div>
      ) : (teacherCourses.length > 0 ? teacherCourses : []).length === 0 ? (
        // Use demo data for display
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
          {FALLBACK_teacherClassesDemo.map((cls) => (
            <GlassCard key={cls.id} className="group cursor-pointer hover:border-white/12 transition-all hover:scale-[1.01]" onClick={() => { navigate('attendance', 'take_attendance'); notifySuccess(cls.name, `Period ${cls.period} • ${cls.room}`); }}>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="size-10 rounded-xl flex items-center justify-center text-white/80 text-sm font-bold"
                  style={{ backgroundColor: `${cls.color}20`, color: cls.color }}
                >
                  P{cls.period}
                </div>
                <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">{cls.gradeLevel}</Badge>
              </div>
              <h3 className="text-base font-semibold text-white/85 mb-1">{cls.name}</h3>
              <p className="text-xs text-white/35 mb-3">{cls.subject} · {cls.room}</p>
              <div className="flex items-center gap-4 text-[11px] text-white/30">
                <span className="flex items-center gap-1"><Users className="size-3" />{cls.studentCount}</span>
                <span className="flex items-center gap-1"><TrendingUp className="size-3" />{cls.avgGrade}% avg</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />{cls.nextSession}</span>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
          {teacherCourses.map((c, i) => (
            <GlassCard key={c.id} className="group cursor-pointer hover:border-white/12 transition-all hover:scale-[1.01]" onClick={() => { navigate('attendance', 'take_attendance'); notifySuccess(c.name, `${c.semester} • ${c.gradeLevel}`); }}>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="size-10 rounded-xl flex items-center justify-center text-white/80 text-sm font-bold"
                  style={{ backgroundColor: `${classColors[i % classColors.length]}20`, color: classColors[i % classColors.length] }}
                >
                  {c.gradeLevel.charAt(0)}
                </div>
                <Badge variant="outline" className="text-[9px] border-white/10 text-white/40">{c.gradeLevel}</Badge>
              </div>
              <h3 className="text-base font-semibold text-white/85 mb-1">{c.name}</h3>
              <p className="text-xs text-white/35 mb-3">{c.semester} · {c.gradeLevel}</p>
              <div className="flex items-center gap-4 text-[11px] text-white/30">
                <span className="flex items-center gap-1"><Users className="size-3" />{c._count?.enrollments ?? 0}</span>
                <span className="flex items-center gap-1"><BookOpen className="size-3" />{c._count?.assignments ?? 0} assignments</span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </TeacherSectionShell>
  );
}

/* ─── Timetable sub-view ──────────────────────────────────────────── */
function TimetableView(_props: TeacherSectionProps) {

  const demoTimetable = [
    { day: 'Monday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
    { day: 'Tuesday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
    { day: 'Wednesday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '11:00–12:00', name: 'Dept Meeting', room: 'Rm 108' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }] },
    { day: 'Thursday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '13:00–13:50', name: 'Physics Honors', room: 'Lab 301' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
    { day: 'Friday', slots: [{ time: '8:00–8:50', name: 'Algebra II', room: 'Rm 204' }, { time: '9:00–9:50', name: 'AP Calculus AB', room: 'Rm 204' }, { time: '10:15–11:05', name: 'Geometry', room: 'Rm 106' }, { time: '14:00–14:50', name: 'Pre-Algebra', room: 'Rm 204' }] },
  ];

  const classColors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];
  const colorMap = new Map<string, string>();
  demoTimetable.forEach(d => d.slots.forEach(s => {
    if (!colorMap.has(s.name)) colorMap.set(s.name, classColors[colorMap.size % classColors.length]);
  }));

  return (
    <TeacherSectionShell title="My Timetable" description="Weekly schedule overview">
      <div className="overflow-x-auto" data-animate>
        <div className="grid grid-cols-5 gap-3 min-w-[750px]">
          {demoTimetable.map(day => (
            <div key={day.day}>
              <h4 className="text-xs font-semibold text-white/50 mb-2 text-center">{day.day}</h4>
              <div className="space-y-2">
                {day.slots.map((slot, i) => {
                  const color = colorMap.get(slot.name) ?? '#818cf8';
                  return (
                    <div
                      key={i}
                      className="rounded-xl border p-3 transition-all hover:scale-[1.02]"
                      style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}
                    >
                      <p className="text-[10px] font-mono text-white/30">{slot.time}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color }}>{slot.name}</p>
                      <p className="text-[10px] text-white/25">{slot.room}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeacherSectionShell>
  );
}
