/* ─── CoursesOverviewPage ─── Full-page enrolled courses overview ──── */
import { useState } from 'react';
import {
  BookOpen, Search, Clock, Users, Star, TrendingUp,
  Calendar, CheckCircle2, BarChart3, ChevronRight,
  PlayCircle, GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentSubjects, useStudentTimetable } from '@/hooks/api/use-student';

interface Course {
  id: string;
  name: string;
  instructor: string;
  subject: string;
  progress: number;
  grade: string;
  nextClass: string;
  totalLessons: number;
  completedLessons: number;
  enrolled: number;
  rating: number;
  color: string;
}

// @ts-expect-error TS6133 — mock data kept for shape reference
const _COURSES: Course[] = [
  { id: '1', name: 'Algebra II', instructor: 'Mrs. Rodriguez', subject: 'Math', progress: 72, grade: 'A-', nextClass: 'Mon 9:00 AM', totalLessons: 36, completedLessons: 26, enrolled: 28, rating: 4.7, color: 'bg-indigo-500/20 text-indigo-400' },
  { id: '2', name: 'AP Chemistry', instructor: 'Dr. Chen', subject: 'Science', progress: 65, grade: 'B+', nextClass: 'Tue 10:30 AM', totalLessons: 40, completedLessons: 26, enrolled: 22, rating: 4.8, color: 'bg-emerald-500/20 text-emerald-400' },
  { id: '3', name: 'English Literature', instructor: 'Mr. Thompson', subject: 'English', progress: 80, grade: 'A', nextClass: 'Mon 1:00 PM', totalLessons: 30, completedLessons: 24, enrolled: 30, rating: 4.5, color: 'bg-violet-500/20 text-violet-400' },
  { id: '4', name: 'World History', instructor: 'Ms. Patel', subject: 'History', progress: 58, grade: 'B', nextClass: 'Wed 11:00 AM', totalLessons: 34, completedLessons: 20, enrolled: 32, rating: 4.6, color: 'bg-amber-500/20 text-amber-400' },
  { id: '5', name: 'Computer Science', instructor: 'Mr. Kim', subject: 'CS', progress: 88, grade: 'A+', nextClass: 'Thu 2:00 PM', totalLessons: 28, completedLessons: 25, enrolled: 20, rating: 4.9, color: 'bg-cyan-500/20 text-cyan-400' },
  { id: '6', name: 'Physical Education', instructor: 'Coach Davis', subject: 'PE', progress: 90, grade: 'A', nextClass: 'Fri 8:00 AM', totalLessons: 20, completedLessons: 18, enrolled: 35, rating: 4.3, color: 'bg-rose-500/20 text-rose-400' },
];

// @ts-expect-error TS6133 — mock data kept for shape reference
const _UPCOMING_CLASSES = [
  { course: 'Algebra II', time: '9:00 AM', room: 'Room 204', type: 'Lecture' },
  { course: 'AP Chemistry', time: '10:30 AM', room: 'Lab 102', type: 'Lab' },
  { course: 'English Literature', time: '1:00 PM', room: 'Room 310', type: 'Discussion' },
];

const SUBJECTS = ['All', 'Math', 'Science', 'English', 'History', 'CS', 'PE'];

export default function CoursesOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');

  /* ── API data ── */
  const { data: _apiSubjects } = useStudentSubjects();
  const { data: _apiTimetable } = useStudentTimetable();
  const courses = (_apiSubjects as any[]) ?? [];
  const upcomingClasses = (_apiTimetable as any[]) ?? [];

  const filtered = courses
    .filter((c) => subjectFilter === 'All' || c.subject === subjectFilter)
    .filter((c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase()));

  const avgProgress = courses.length > 0 ? Math.round(courses.reduce((s: number, c: any) => s + (c.progress ?? 0), 0) / courses.length) : 0;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="My Courses" description="View and manage all your enrolled courses" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Enrolled Courses" value={courses.length} icon={<BookOpen className="h-5 w-5" />} />
        <StatCard label="Avg Progress" value={avgProgress} suffix="%" icon={<TrendingUp className="h-5 w-5" />} trend="up" />
        <StatCard label="Classes Today" value={upcomingClasses.length} icon={<Calendar className="h-5 w-5" />} />
        <StatCard label="GPA" value={3.7} icon={<GraduationCap className="h-5 w-5" />} decimals={1} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap" data-animate>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/25" />
          <Input
            placeholder="Search courses or instructors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
          />
        </div>
        <div className="flex gap-1.5">
          {SUBJECTS.map((s) => (
            <Button
              key={s} size="sm" variant={subjectFilter === s ? 'default' : 'outline'}
              onClick={() => setSubjectFilter(s)}
              className={cn('text-[10px] h-7', subjectFilter !== s && 'border-white/10 text-white/40')}
            >{s}</Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Course cards */}
        <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
          {filtered.map((course) => (
            <Card key={course.id} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all cursor-pointer group" onClick={() => notifySuccess('Course', 'Opening course details…')}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', course.color)}>
                    <BookOpen className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/85 truncate">{course.name}</p>
                    <p className="text-[10px] text-white/40">{course.instructor}</p>
                  </div>
                  <Badge className={cn('text-[9px] shrink-0', course.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400')}>
                    {course.grade}
                  </Badge>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-[9px] text-white/30 mb-1">
                    <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5 bg-white/5" />
                </div>

                <div className="flex items-center gap-3 mt-3 text-[9px] text-white/30">
                  <span className="flex items-center gap-0.5"><Clock className="size-2.5" />{course.nextClass}</span>
                  <span className="flex items-center gap-0.5"><Users className="size-2.5" />{course.enrolled}</span>
                  <span className="flex items-center gap-0.5 ml-auto"><Star className="size-2.5 text-amber-400" />{course.rating}</span>
                </div>

                <Button size="sm" className="w-full mt-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); notifySuccess('Course', 'Resuming your lesson…'); }}>
                  <PlayCircle className="size-3" />Continue Learning
                </Button>
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <BookOpen className="size-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No courses match your search</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Today's Schedule */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Calendar className="size-4 text-indigo-400" />Today's Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {upcomingClasses.map((cls: any, i: number) => (
                <div key={i} className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 p-2.5">
                  <div className="text-center min-w-[3rem]">
                    <p className="text-[10px] font-medium text-indigo-400">{cls.time}</p>
                  </div>
                  <div className="h-8 w-px bg-white/8" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-white/70 font-medium truncate">{cls.course}</p>
                    <p className="text-[8px] text-white/25">{cls.room} · {cls.type}</p>
                  </div>
                  <ChevronRight className="size-3 text-white/15" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Performance summary */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <BarChart3 className="size-4 text-emerald-400" />Grade Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { grade: 'A / A+', count: 3, pct: 50, color: 'bg-emerald-500/50' },
                { grade: 'A-', count: 1, pct: 17, color: 'bg-emerald-500/30' },
                { grade: 'B+', count: 1, pct: 17, color: 'bg-amber-500/40' },
                { grade: 'B', count: 1, pct: 17, color: 'bg-amber-500/30' },
              ].map((g) => (
                <div key={g.grade} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40 w-12">{g.grade}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', g.color)} style={{ width: `${g.pct}%` }} />
                  </div>
                  <span className="text-[9px] text-white/25 w-4 text-right">{g.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Completed milestones */}
          <Card data-animate className="border-amber-500/15 bg-amber-500/5 backdrop-blur-xl">
            <CardContent className="p-3 flex items-center gap-2.5">
              <CheckCircle2 className="size-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-[10px] text-amber-400 font-medium">139 of 188 lessons completed</p>
                <p className="text-[9px] text-amber-300/50">Keep up the great work! 49 lessons remaining.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
