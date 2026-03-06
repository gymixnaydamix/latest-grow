/* ─── CourseDetailPage ─── 5-tab holographic course view ─────────── */
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  BookOpen, Users, ChevronLeft, CalendarDays, BarChart3,
  Pencil, Trash2, UserPlus, UserMinus, Clock,
  FileText, TrendingUp, GraduationCap,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useCourse, useAssignments, useCourseStudents,
  useEnrollStudent, useUnenrollStudent, useDeleteCourse,
} from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';
import type { Assignment, CourseEnrollment } from '@root/types';

/* ── Status badge colours ── */
const statusColor: Record<string, string> = {
  graded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
  submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  upcoming: 'bg-white/5 text-white/40 border-white/10',
};

/* ── Quick stat mini-card ── */
function QuickStat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
        <Icon className="size-4" />
      </div>
      <div>
        <p className="text-[10px] text-white/35">{label}</p>
        <p className="text-sm font-semibold text-white/80">{value}</p>
      </div>
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────── */
export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const { user } = useAuthStore();

  const { data: courseData, isLoading: courseLoading } = useCourse(id ?? null);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(id ?? null);
  const { data: studentsData, isLoading: studentsLoading } = useCourseStudents(id ?? null);
  const containerRef = useStaggerAnimate<HTMLDivElement>([tab, courseLoading]);

  const course = courseData;
  const assignments = assignmentsData ?? [];
  const students = studentsData ?? [];

  const enrollMut = useEnrollStudent(id ?? '');
  const unenrollMut = useUnenrollStudent(id ?? '');
  const deleteMut = useDeleteCourse();

  const isTeacherOrAdmin = user && ['PROVIDER', 'ADMIN', 'TEACHER'].includes(user.role);
  const isStudent = user?.role === 'STUDENT';
  const isEnrolled = students.some((e: CourseEnrollment) => e.studentId === user?.id);

  /* loading skeleton */
  if (courseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl bg-white/4" />
        <div className="grid gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/4" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl bg-white/4" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="py-16 text-center">
        <Link to="/courses" className="text-indigo-400 underline text-sm">Back to Courses</Link>
        <p className="mt-3 text-sm text-white/40">Course not found.</p>
      </div>
    );
  }

  const teacherName = course.teacher ? `${course.teacher.firstName} ${course.teacher.lastName}` : 'TBD';
  const enrollCount = students.length || course._count?.enrollments || 0;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── Hero Banner ── */}
      <div data-animate className="relative overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br from-indigo-600/15 via-purple-600/10 to-transparent backdrop-blur-xl p-6 md:p-8">
        {/* Decorative grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-60" />

        <Link to="/courses" className="relative inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-4">
          <ChevronLeft className="size-3" /> Back to Courses
        </Link>

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white/95">{course.name}</h1>
              <Badge variant="secondary" className="bg-white/8 text-white/60 border-white/10 text-xs">
                {course.gradeLevel}
              </Badge>
            </div>
            <p className="text-sm text-white/50">{teacherName} · {course.semester}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            {isStudent && !isEnrolled && (
              <Button onClick={() => enrollMut.mutate(undefined)} disabled={enrollMut.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 gap-1.5">
                <UserPlus className="size-3.5" /> Enroll
              </Button>
            )}
            {isStudent && isEnrolled && (
              <Button onClick={() => unenrollMut.mutate(user!.id)} disabled={unenrollMut.isPending} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-9 gap-1.5">
                <UserMinus className="size-3.5" /> Unenroll
              </Button>
            )}
            {isTeacherOrAdmin && (
              <>
                <Button asChild variant="outline" className="border-white/10 text-white/60 text-xs h-9 gap-1.5">
                  <Link to={`/courses/${course.id}/edit`}><Pencil className="size-3.5" /> Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-9 gap-1.5">
                      <Trash2 className="size-3.5" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border-white/10 bg-black/90 backdrop-blur-xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white/90">Delete Course?</AlertDialogTitle>
                      <AlertDialogDescription className="text-white/50">
                        This will permanently delete "{course.name}" and all related data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-white/10 text-white/60">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 text-white hover:bg-red-500"
                        onClick={() => deleteMut.mutate(course.id, { onSuccess: () => navigate('/courses') })}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid gap-3 sm:grid-cols-4" data-animate>
        <QuickStat label="Assignments" value={String(assignments.length)} icon={BarChart3} />
        <QuickStat label="Enrolled" value={String(enrollCount)} icon={Users} />
        <QuickStat label="Semester" value={course.semester} icon={CalendarDays} />
        <QuickStat label="Grade Level" value={course.gradeLevel} icon={GraduationCap} />
      </div>

      {/* ── Tabs ── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white/4 border border-white/6" data-animate>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* ═══ Overview ═══ */}
        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm text-white/80">About This Course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/50 leading-relaxed whitespace-pre-line">{course.description || 'No description available.'}</p>
            </CardContent>
          </Card>

          {/* Recent assignments preview */}
          {assignments.length > 0 && (
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm text-white/80">Upcoming Assignments</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-indigo-400" onClick={() => setTab('assignments')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {assignments.slice(0, 3).map((a: Assignment) => {
                  const isPast = new Date(a.dueDate) < new Date();
                  return (
                    <div key={a.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/2 p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="size-4 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium text-white/75">{a.title}</p>
                          <p className="text-[10px] text-white/35">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${isPast ? statusColor.graded : statusColor.upcoming}`}>
                        {isPast ? 'Past Due' : 'Upcoming'}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ Assignments ═══ */}
        <TabsContent value="assignments" className="space-y-3 pt-4">
          {assignmentsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/4" />)
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center" data-animate>
              <BookOpen className="mx-auto size-8 text-white/15 mb-2" />
              <p className="text-sm text-white/40">No assignments yet.</p>
            </div>
          ) : (
            assignments.map((a: Assignment) => {
              const isPast = new Date(a.dueDate) < new Date();
              const status = isPast ? 'graded' : 'upcoming';
              return (
                <Card key={a.id} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-colors">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{a.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-white/35 mt-0.5">
                          <Clock className="size-3" />
                          <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                          <span>·</span>
                          <span>{a.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-white/50">{a.maxScore} pts</span>
                      <Badge variant="outline" className={`text-[10px] ${statusColor[status]}`}>{status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ═══ Schedule ═══ */}
        <TabsContent value="schedule" className="pt-4">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-sm text-white/80">Course Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <CalendarDays className="size-4 text-indigo-400" />
                  <span>Semester: <strong className="text-white/70">{course.semester}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <Clock className="size-4 text-indigo-400" />
                  <span>Grade Level: <strong className="text-white/70">{course.gradeLevel}</strong></span>
                </div>
                {assignments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-white/35 font-medium uppercase tracking-wider">Assignment Timeline</p>
                    {assignments.map((a: Assignment) => (
                      <div key={a.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/2 p-3">
                        <div className="size-2 rounded-full bg-indigo-500 shrink-0" />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-xs text-white/60">{a.title}</span>
                          <span className="text-[10px] text-white/30">{new Date(a.dueDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ Students ═══ */}
        <TabsContent value="students" className="space-y-3 pt-4">
          {studentsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/4" />)
          ) : students.length === 0 ? (
            <div className="py-12 text-center" data-animate>
              <Users className="mx-auto size-8 text-white/15 mb-2" />
              <p className="text-sm text-white/40">No students enrolled yet.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between" data-animate>
                <p className="text-xs text-white/40">{students.length} student{students.length !== 1 ? 's' : ''} enrolled</p>
              </div>
              {students.map((enrollment: CourseEnrollment) => {
                const s = enrollment.student;
                if (!s) return null;
                return (
                  <Card key={enrollment.id} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-indigo-400/20">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white/75">{s.firstName} {s.lastName}</p>
                          <p className="text-[10px] text-white/30">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/25">
                          {enrollment.status || 'ACTIVE'}
                        </Badge>
                        {isTeacherOrAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2"
                            onClick={() => unenrollMut.mutate(s.id)}
                            disabled={unenrollMut.isPending}
                          >
                            <UserMinus className="size-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </>
          )}
        </TabsContent>

        {/* ═══ Analytics ═══ */}
        <TabsContent value="analytics" className="pt-4">
          <div className="grid gap-4 sm:grid-cols-2" data-animate>
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm text-white/80">Enrollment Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-500/10">
                    <TrendingUp className="size-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white/90">{enrollCount}</p>
                    <p className="text-[10px] text-white/35">Total Enrolled</p>
                  </div>
                </div>
                <Progress value={Math.min(enrollCount * 3, 100)} className="h-1.5" />
              </CardContent>
            </Card>

            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-sm text-white/80">Assignment Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10">
                    <BarChart3 className="size-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white/90">{assignments.length}</p>
                    <p className="text-[10px] text-white/35">Total Assignments</p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {assignments.slice(0, 4).map((a: Assignment) => (
                    <div key={a.id} className="flex items-center justify-between text-xs">
                      <span className="text-white/50 truncate max-w-[60%]">{a.title}</span>
                      <span className="text-white/30">{a.maxScore} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
