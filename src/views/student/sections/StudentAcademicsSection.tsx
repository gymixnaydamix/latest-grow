/* ─── StudentAcademicsSection ─── Courses, grades, AI hub, portfolio, etc. */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  BookOpen, Brain, Sparkles,
  Clock, FileText, Lightbulb,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useCourses, useStudentGrades, useStudentAttendance, useAssignments } from '@/hooks/api';
import { notifySuccess } from '@/lib/notify';
import StudentPortfolioSection from '@/views/student/StudentPortfolioSection';
import StudentLearningPathSection from '@/views/student/StudentLearningPathSection';
import StudentDepartmentRequestsSection from '@/views/student/StudentDepartmentRequestsSection';

/* ── SubNav → Route mapping (for split-page navigation) ── */
const SUB_NAV_ROUTES: Record<string, string> = {
  gradebook: '/student/gradebook',
  upcoming: '/student/upcoming',
  ai_tutor: '/student/ai-tutor',
  planner: '/student/planner',
  visualizer: '/student/visualizer',
  my_journey: '/student/my-journey',
  leaderboards: '/student/leaderboard',
  my_skills: '/student/my-skills',
  showcase: '/student/showcase',
  career_compass: '/student/career-compass',
  dept_finance: '/student/dept-finance',
  human_resources: '/student/human-resources',
  dept_marketing: '/student/dept-marketing',
  inquiries: '/student/inquiries',
};

/* ── Header → Overview-page route mapping ── */
const HEADER_ROUTES: Record<string, string> = {
  courses: '/student/courses-overview',
  grades_assignments: '/student/grades-overview',
  ai_study_hub: '/student/ai-hub-overview',
  learning_path: '/student/learning-path-overview',
  portfolio: '/student/portfolio-overview',
  department_requests: '/student/dept-requests-overview',
};

/* ── Main Export ───────────────────────────────────────────────── */
export function StudentAcademicsSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const { schoolId, user } = useAuthStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);
  const navigate = useNavigate();

  // Navigate to split page when a mapped subnav or header is selected
  useEffect(() => {
    if (activeSubNav && SUB_NAV_ROUTES[activeSubNav]) {
      navigate(SUB_NAV_ROUTES[activeSubNav]);
    } else if (activeHeader && HEADER_ROUTES[activeHeader]) {
      navigate(HEADER_ROUTES[activeHeader]);
    }
  }, [activeSubNav, activeHeader, navigate]);

  const view = (() => {
    switch (activeHeader) {
      case 'courses': return <CoursesView schoolId={schoolId} onSelectCourse={setSelectedCourseId} />;
      case 'grades_assignments': return <GradesView subNav={activeSubNav} studentId={user?.id ?? null} selectedCourseId={selectedCourseId} />;
      case 'ai_study_hub': return <AIStudyHubView subNav={activeSubNav} />;
      case 'learning_path': return <StudentLearningPathSection />;
      case 'portfolio': return <StudentPortfolioSection />;
      case 'department_requests': return <StudentDepartmentRequestsSection />;
      default: return <CoursesView schoolId={schoolId} onSelectCourse={setSelectedCourseId} />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Courses ───────────────────────────────────────────────────── */
function CoursesView({ schoolId, onSelectCourse }: { schoolId: string | null; onSelectCourse: (id: string) => void }) {
  const { data, isLoading } = useCourses(schoolId);
  const courses = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div data-animate>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div data-animate className="text-center py-12">
        <BookOpen className="size-10 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-3">No courses found.</p>
      </div>
    );
  }

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold">My Courses</h2>
        <p className="text-sm text-muted-foreground">{courses.length} enrolled courses</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {courses.map((c) => (
          <Card key={c.id} className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => onSelectCourse(c.id)}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <BookOpen className="size-5 text-primary" />
                <Badge variant="outline" className="text-[10px]">{c.gradeLevel}</Badge>
              </div>
              <p className="text-sm font-semibold mt-2">{c.name}</p>
              <p className="text-xs text-muted-foreground">
                {c.teacher ? `${c.teacher.firstName} ${c.teacher.lastName}` : 'TBD'} · {c.gradeLevel}
              </p>
              {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── Grades & Assignments ──────────────────────────────────────── */
function GradesView({ subNav, studentId, selectedCourseId }: { subNav: string; studentId: string | null; selectedCourseId: string | null }) {
  const { data: gradesData, isLoading: gradesLoading } = useStudentGrades(studentId);
  const { data: attendanceData, isLoading: attendanceLoading } = useStudentAttendance(studentId);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(selectedCourseId);

  const grades = gradesData ?? [];
  const attendance = attendanceData ?? [];
  const assignments = assignmentsData ?? [];

  /* ── Upcoming Assignments ── */
  if (subNav === 'upcoming') {
    if (!selectedCourseId) {
      return (
        <div data-animate className="text-center py-12">
          <Clock className="size-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">Select a course from the Courses tab to view assignments.</p>
        </div>
      );
    }

    if (assignmentsLoading) {
      return (
        <div className="space-y-6">
          <div data-animate><Skeleton className="h-6 w-48" /></div>
          <div className="space-y-2" data-animate>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="py-3"><Skeleton className="h-10 w-full" /></CardContent></Card>
            ))}
          </div>
        </div>
      );
    }

    if (!assignments.length) {
      return (
        <div data-animate className="text-center py-12">
          <Clock className="size-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">No upcoming assignments for this course.</p>
        </div>
      );
    }

    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">Upcoming Assignments</h2></div>
        <div className="space-y-2" data-animate>
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded bg-primary/10 p-2">
                    <Clock className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">Due {new Date(a.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                  <span className="text-xs font-medium">{a.maxScore} pts</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  /* ── Attendance ── */
  if (subNav === 'attendance') {
    if (attendanceLoading) {
      return (
        <div className="space-y-6">
          <div data-animate><Skeleton className="h-6 w-40" /></div>
          <div className="space-y-2" data-animate>
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent className="py-3"><Skeleton className="h-8 w-full" /></CardContent></Card>
            ))}
          </div>
        </div>
      );
    }

    if (!attendance.length) {
      return (
        <div data-animate className="text-center py-12">
          <Clock className="size-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-3">No attendance records found.</p>
        </div>
      );
    }

    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">Attendance</h2></div>
        <div className="space-y-2" data-animate>
          {attendance.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <Badge
                  variant={a.status === 'PRESENT' ? 'default' : a.status === 'ABSENT' ? 'destructive' : 'outline'}
                  className="text-[10px]"
                >
                  {a.status.toLowerCase()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  /* ── Default: Gradebook ── */
  if (gradesLoading) {
    return (
      <div className="space-y-6">
        <div data-animate><Skeleton className="h-6 w-40" /></div>
        <div className="grid gap-4 sm:grid-cols-2" data-animate>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!grades.length) {
    return (
      <div data-animate className="text-center py-12">
        <FileText className="size-10 mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-3">No grades recorded yet.</p>
      </div>
    );
  }

  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">My Grades</h2></div>
      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        {grades.map((g) => (
          <Card key={g.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Assignment</p>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary">{g.score}</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Graded {new Date(g.gradedAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── AI Study Hub ──────────────────────────────────────────────── */
function AIStudyHubView({ subNav }: { subNav: string }) {
  if (subNav === 'ai_tutor') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">AI Tutor</h2></div>
        <Card data-animate>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <div className="rounded-lg bg-muted p-3 text-sm max-w-[80%]">Hi! I'm your AI tutor. What subject would you like help with today?</div>
              <div className="rounded-lg bg-primary/10 p-3 text-sm max-w-[80%] ml-auto">I need help understanding quadratic equations.</div>
              <div className="rounded-lg bg-muted p-3 text-sm max-w-[80%]">Great! A quadratic equation is any equation of the form ax² + bx + c = 0. The solutions can be found using the quadratic formula: x = (-b ± √(b²-4ac)) / 2a. Want me to walk through an example?</div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Ask a question…" className="flex-1" />
              <Button size="sm" onClick={() => notifySuccess('AI Tutor', 'Processing your question…')}><Sparkles className="mr-1 size-3" /> Ask</Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (subNav === 'planner') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">Study Planner</h2></div>
        <Card data-animate>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {[
                { time: '4:00 PM', task: 'Review Chemistry notes — Titration', duration: '30 min', priority: 'high' },
                { time: '4:30 PM', task: 'Complete Algebra II problem set', duration: '45 min', priority: 'high' },
                { time: '5:15 PM', task: 'Break', duration: '15 min', priority: 'low' },
                { time: '5:30 PM', task: 'Read History Chapter 15', duration: '30 min', priority: 'medium' },
                { time: '6:00 PM', task: 'Start English essay outline', duration: '45 min', priority: 'high' },
              ].map((s) => (
                <div key={s.time} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="text-xs font-mono text-muted-foreground w-16">{s.time}</span>
                  <div className="flex-1">
                    <p className="text-sm">{s.task}</p>
                    <p className="text-[10px] text-muted-foreground">{s.duration}</p>
                  </div>
                  <Badge variant={s.priority === 'high' ? 'destructive' : s.priority === 'medium' ? 'default' : 'outline'} className="text-[10px]">{s.priority}</Badge>
                </div>
              ))}
            </div>
            <Button size="sm" className="mt-4" onClick={() => notifySuccess('Planner', 'Schedule optimized by AI')}><Sparkles className="mr-1 size-3" /> AI Optimize Schedule</Button>
          </CardContent>
        </Card>
      </>
    );
  }

  if (subNav === 'visualizer') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">Concept Visualizer</h2></div>
        <Card data-animate>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Enter a concept and AI will create visual explanations, diagrams, and mind maps.</p>
            <Input placeholder="e.g., Photosynthesis, Quadratic Formula, French Revolution…" />
            <Button size="sm" onClick={() => notifySuccess('Visualizer', 'Generating visual representation…')}><Sparkles className="mr-1 size-3" /> Visualize</Button>
            <div className="grid gap-3 sm:grid-cols-3 mt-4">
              {['Mind Map', 'Flowchart', 'Timeline'].map((t) => (
                <div key={t} className="rounded-lg border border-dashed p-6 text-center">
                  <Lightbulb className="size-6 mx-auto text-muted-foreground" />
                  <p className="text-xs text-muted-foreground mt-2">{t} preview</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Default overview
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">AI Study Hub</h2></div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { title: 'AI Tutor', desc: 'Ask questions, get instant help', icon: Brain, color: 'text-violet-500' },
          { title: 'Study Planner', desc: 'AI-optimized study schedule', icon: Clock, color: 'text-blue-500' },
          { title: 'Concept Visualizer', desc: 'Visual learning tools', icon: Lightbulb, color: 'text-amber-500' },
        ].map((t) => (
          <Card key={t.title} className="cursor-pointer hover:border-primary/40 transition-colors">
            <CardContent className="pt-6 text-center">
              <t.icon className={`size-8 mx-auto ${t.color}`} />
              <p className="text-sm font-semibold mt-3">{t.title}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
