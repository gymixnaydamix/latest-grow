/* ─── AttendanceView ─── Take attendance, history, reports ─────── */
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses, useCourseAttendance } from '@/hooks/api';
import type { Course, AttendanceRecord } from '@root/types';

export function AttendanceView({ subNav, schoolId, teacherId }: { subNav: string; schoolId: string | null; teacherId: string | null }) {
  const { data: coursesData, isLoading: coursesLoading } = useCourses(schoolId);
  const allCourses: Course[] = coursesData ?? [];
  const courses = teacherId ? allCourses.filter((c) => c.teacherId === teacherId) : allCourses;
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const activeCourseId = selectedCourseId ?? courses[0]?.id ?? null;

  const { data: attendanceData, isLoading: attendanceLoading } = useCourseAttendance(activeCourseId);
  const records: AttendanceRecord[] = attendanceData ?? [];

  const courseSelector = (
    <div className="flex items-center gap-2 mb-4" data-animate>
      <label className="text-xs font-medium text-white/60">Course:</label>
      <select
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80"
        value={activeCourseId ?? ''}
        onChange={(e) => setSelectedCourseId(e.target.value || null)}
      >
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
        {courses.length === 0 && <option value="">No courses</option>}
      </select>
    </div>
  );

  if (coursesLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (subNav === 'take_attendance') {
    const studentMap = new Map<string, string>();
    for (const r of records) {
      if (!studentMap.has(r.studentId)) {
        studentMap.set(r.studentId, r.student ? `${r.student.firstName} ${r.student.lastName}` : r.studentId);
      }
    }
    const students = Array.from(studentMap.entries());
    const activeCourse = courses.find((c) => c.id === activeCourseId);
    return (
      <>
        <div data-animate>
          <h2 className="text-lg font-semibold text-white/90">Take Attendance</h2>
          <p className="text-sm text-white/40">{activeCourse?.name ?? 'Select a course'} · {new Date().toLocaleDateString()}</p>
        </div>
        {courseSelector}
        {attendanceLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : students.length === 0 ? (
          <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl py-12 text-center">
            <p className="text-sm text-white/40">No students found for this course yet.</p>
          </div>
        ) : (
          <div className="space-y-1" data-animate>
            {students.map(([id, name]) => (
              <div key={id} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-7 border border-white/10"><AvatarFallback className="text-[9px] bg-indigo-500/10 text-indigo-400">{name.split(' ').map((w: string) => w[0]).join('')}</AvatarFallback></Avatar>
                  <span className="text-sm text-white/70">{name}</span>
                </div>
                <div className="flex gap-1">
                  {[
                    { label: 'Present', style: 'border-emerald-500/30 text-emerald-400' },
                    { label: 'Late', style: 'border-amber-500/30 text-amber-400' },
                    { label: 'Absent', style: 'border-rose-500/30 text-rose-400' },
                  ].map((opt) => (
                    <Badge key={opt.label} variant="outline" className={`cursor-pointer text-[10px] ${opt.style}`}>{opt.label}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <Button size="sm" data-animate className="bg-indigo-600 hover:bg-indigo-500 text-white">Submit Attendance</Button>
      </>
    );
  }

  if (subNav === 'attendance_history') {
    const byDate = new Map<string, { present: number; late: number; absent: number; excused: number; total: number }>();
    for (const r of records) {
      const dateStr = new Date(r.date).toLocaleDateString();
      if (!byDate.has(dateStr)) byDate.set(dateStr, { present: 0, late: 0, absent: 0, excused: 0, total: 0 });
      const d = byDate.get(dateStr)!;
      d.total++;
      if (r.status === 'PRESENT') d.present++;
      else if (r.status === 'LATE') d.late++;
      else if (r.status === 'ABSENT') d.absent++;
      else if (r.status === 'EXCUSED') d.excused++;
    }
    const history = Array.from(byDate.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Attendance History</h2></div>
        {courseSelector}
        {attendanceLoading ? (
          <Skeleton className="h-48 rounded-xl" />
        ) : history.length === 0 ? (
          <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl py-12 text-center">
            <p className="text-sm text-white/40">No attendance records yet for this course.</p>
          </div>
        ) : (
          <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
            <div className="space-y-2">
              {history.map(([date, d]) => (
                <div key={date} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
                  <span className="text-sm font-medium text-white/70 w-24">{date}</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-400">{d.present} present</span>
                    <span className="text-amber-400">{d.late} late</span>
                    <span className="text-rose-400">{d.absent} absent</span>
                  </div>
                  <span className="text-xs text-white/40">{d.total > 0 ? Math.round((d.present / d.total) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  // Default: reports
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold text-white/90">Attendance Reports</h2></div>
      <div className="grid gap-4 sm:grid-cols-4" data-animate>
        {[
          { label: 'Avg Attendance', value: '96.2%', color: 'text-emerald-400' },
          { label: 'Chronic Absent', value: '2', color: 'text-rose-400' },
          { label: 'Perfect Attendance', value: '12', color: 'text-blue-400' },
          { label: 'Late Arrivals/wk', value: '4.5', color: 'text-amber-400' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 text-center">
            <p className="text-xs text-white/40">{m.label}</p>
            <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}
