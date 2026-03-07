/* ─── GradesOverviewPage ─── Full-page grades & assignments hub ───── */
import { useState } from 'react';
import {
  BarChart3, TrendingUp, Award, BookOpen, Clock,
  CheckCircle2, AlertTriangle, FileText, Star,
  ChevronRight, ArrowUpRight, ArrowDownRight,
  GraduationCap, Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentGradesOverview, useStudentAssignments } from '@/hooks/api/use-student';

interface CourseGrade {
  course: string;
  instructor: string;
  grade: string;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
  assignments: number;
  completed: number;
  color: string;
}

// @ts-expect-error TS6133 — mock data kept for shape reference
const _COURSE_GRADES: CourseGrade[] = [
  { course: 'Computer Science', instructor: 'Mr. Kim', grade: 'A+', percentage: 97, trend: 'up', assignments: 15, completed: 14, color: 'bg-cyan-500/20 text-cyan-400' },
  { course: 'English Literature', instructor: 'Mr. Thompson', grade: 'A', percentage: 93, trend: 'neutral', assignments: 12, completed: 11, color: 'bg-violet-500/20 text-violet-400' },
  { course: 'Algebra II', instructor: 'Mrs. Rodriguez', grade: 'A-', percentage: 91, trend: 'up', assignments: 18, completed: 16, color: 'bg-indigo-500/20 text-indigo-400' },
  { course: 'Physical Education', instructor: 'Coach Davis', grade: 'A', percentage: 95, trend: 'neutral', assignments: 8, completed: 8, color: 'bg-rose-500/20 text-rose-400' },
  { course: 'AP Chemistry', instructor: 'Dr. Chen', grade: 'B+', percentage: 87, trend: 'down', assignments: 20, completed: 17, color: 'bg-emerald-500/20 text-emerald-400' },
  { course: 'World History', instructor: 'Ms. Patel', grade: 'B', percentage: 83, trend: 'up', assignments: 14, completed: 12, color: 'bg-amber-500/20 text-amber-400' },
];

// @ts-expect-error TS6133 — mock data kept for shape reference
const _UPCOMING_ASSIGNMENTS = [
  { title: 'Chemistry Lab Report #6', course: 'AP Chemistry', due: 'Mar 6', type: 'Lab Report', points: 50 },
  { title: 'Essay: Themes in Hamlet', course: 'English Literature', due: 'Mar 7', type: 'Essay', points: 100 },
  { title: 'Algebra Problem Set #10', course: 'Algebra II', due: 'Mar 8', type: 'Homework', points: 30 },
  { title: 'History Source Analysis', course: 'World History', due: 'Mar 10', type: 'Analysis', points: 40 },
  { title: 'CS Final Project Milestone', course: 'Computer Science', due: 'Mar 12', type: 'Project', points: 150 },
];

const FALLBACK_RECENT_GRADES = [
  { title: 'Quadratic Equations Quiz', course: 'Algebra II', score: 95, max: 100, date: 'Mar 3' },
  { title: 'Lab: Titration', course: 'AP Chemistry', score: 42, max: 50, date: 'Mar 2' },
  { title: 'Code Review #4', course: 'Computer Science', score: 100, max: 100, date: 'Mar 1' },
  { title: 'Reading Response', course: 'English Literature', score: 88, max: 100, date: 'Feb 28' },
];

const FALLBACK_SEMESTER_TREND = [
  { month: 'Sep', gpa: 3.5 },
  { month: 'Oct', gpa: 3.6 },
  { month: 'Nov', gpa: 3.55 },
  { month: 'Dec', gpa: 3.65 },
  { month: 'Jan', gpa: 3.7 },
  { month: 'Feb', gpa: 3.72 },
];

export default function GradesOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [tab, setTab] = useState<'grades' | 'upcoming' | 'recent'>('grades');

  /* ── API data ── */
  const { data: apiGrades } = useStudentGradesOverview();
  const { data: apiAssignments } = useStudentAssignments();
  const courseGrades = (apiGrades as any[]) ?? [];
  const upcomingAssignments = (apiAssignments as any[]) ?? [];
  const recentGrades = (apiGrades as any)?.recentGrades ?? FALLBACK_RECENT_GRADES;
  const semesterTrend = (apiGrades as any)?.semesterTrend ?? FALLBACK_SEMESTER_TREND;

  const gpa = 3.72;
  const totalAssignments = courseGrades.reduce((s: number, c: any) => s + (c.assignments ?? 0), 0);
  const completedAssignments = courseGrades.reduce((s: number, c: any) => s + (c.completed ?? 0), 0);
  const maxGpa = Math.max(...semesterTrend.map((t: any) => t.gpa));

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Grades & Assignments" description="Track your academic performance across all courses" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Current GPA" value={gpa} icon={<GraduationCap className="h-5 w-5" />} decimals={2} trend="up" trendLabel="+0.07" />
        <StatCard label="Completed" value={completedAssignments} suffix={` / ${totalAssignments}`} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Due This Week" value={3} icon={<Clock className="h-5 w-5" />} accentColor="#f59e0b" />
        <StatCard label="Honor Roll" value={1} suffix=" streak" icon={<Award className="h-5 w-5" />} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2" data-animate>
        {([
          { key: 'grades' as const, label: 'Course Grades', icon: BarChart3 },
          { key: 'upcoming' as const, label: 'Upcoming', icon: Clock },
          { key: 'recent' as const, label: 'Recent Grades', icon: Star },
        ]).map((t) => (
          <Button key={t.key} size="sm" variant={tab === t.key ? 'default' : 'outline'} onClick={() => setTab(t.key)} className={cn('text-xs gap-1', tab !== t.key && 'border-white/10 text-white/40')}>
            <t.icon className="size-3" />{t.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {tab === 'grades' && (
            /* Course-by-course grades */
            <div className="flex flex-col gap-3">
              {courseGrades.map((cg: any) => (
                <Card key={cg.course} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all cursor-pointer group" onClick={() => notifySuccess('Grade', 'Opening grade details…')}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', cg.color)}>
                        <BookOpen className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white/85 truncate">{cg.course}</p>
                          {cg.trend === 'up' && <ArrowUpRight className="size-3 text-emerald-400" />}
                          {cg.trend === 'down' && <ArrowDownRight className="size-3 text-rose-400" />}
                        </div>
                        <p className="text-[10px] text-white/35">{cg.instructor} · {cg.completed}/{cg.assignments} assignments</p>
                      </div>
                      <div className="text-right">
                        <p className={cn('text-lg font-bold', cg.percentage >= 90 ? 'text-emerald-400' : cg.percentage >= 80 ? 'text-amber-400' : 'text-rose-400')}>{cg.grade}</p>
                        <p className="text-[10px] text-white/30">{cg.percentage}%</p>
                      </div>
                    </div>
                    <Progress value={cg.percentage} className="h-1 mt-3 bg-white/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tab === 'upcoming' && (
            <div className="flex flex-col gap-2">
              {upcomingAssignments.map((a: any, i: number) => (
                <Card key={i} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0',
                      i === 0 ? 'bg-rose-500/15' : 'bg-indigo-500/10'
                    )}>
                      {i === 0 ? <AlertTriangle className="size-4 text-rose-400" /> : <FileText className="size-4 text-indigo-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{a.title}</p>
                      <p className="text-[10px] text-white/30">{a.course}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] border-white/8 text-white/25">{a.type}</Badge>
                      <div className="text-right">
                        <p className={cn('text-[10px] font-medium', i === 0 ? 'text-rose-400' : 'text-white/50')}>{a.due}</p>
                        <p className="text-[8px] text-white/20">{a.points} pts</p>
                      </div>
                      <ChevronRight className="size-3 text-white/15" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tab === 'recent' && (
            <div className="flex flex-col gap-2">
              {recentGrades.map((g: any, i: number) => (
                <Card key={i} data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0',
                      g.score / g.max >= 0.9 ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                    )}>
                      <CheckCircle2 className={cn('size-4', g.score / g.max >= 0.9 ? 'text-emerald-400' : 'text-amber-400')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white/80 truncate">{g.title}</p>
                      <p className="text-[10px] text-white/30">{g.course} · {g.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-sm font-bold', g.score / g.max >= 0.9 ? 'text-emerald-400' : 'text-amber-400')}>{g.score}/{g.max}</p>
                      <p className="text-[9px] text-white/25">{Math.round((g.score / g.max) * 100)}%</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* GPA trend */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <TrendingUp className="size-4 text-indigo-400" />GPA Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-24">
                {semesterTrend.map((t: any) => (
                  <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-indigo-500/30 to-indigo-500/60"
                      style={{ height: `${((t.gpa - 3.4) / (maxGpa - 3.4)) * 80 + 20}%` }}
                    />
                    <span className="text-[7px] text-white/25">{t.month}</span>
                    <span className="text-[8px] text-white/40 font-medium">{t.gpa}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assignment completion */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Target className="size-4 text-emerald-400" />Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <div className="relative size-24">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(52,211,153,0.6)" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - completedAssignments / totalAssignments)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-white/90">{Math.round((completedAssignments / totalAssignments) * 100)}%</span>
                </div>
              </div>
              <p className="text-[10px] text-white/30">{completedAssignments} of {totalAssignments} assignments completed</p>
            </CardContent>
          </Card>

          {/* Quick tip */}
          <Card data-animate className="border-amber-500/15 bg-amber-500/5 backdrop-blur-xl">
            <CardContent className="p-3">
              <p className="text-[10px] text-amber-400 font-medium mb-1">💡 Grade Insight</p>
              <p className="text-[10px] text-amber-300/60">Your Chemistry grade dropped 2% last week. Focus on upcoming lab reports to recover.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
