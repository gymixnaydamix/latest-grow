/* ─── Assignments Section ────────────────────────────────────────── 
 * Routes: assignment_list | create_assignment | submissions
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  CheckCircle2, ChevronRight, Clock,
  FileText, Plus, Search, Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCourses, useAssignments } from '@/hooks/api';
import { useCreateAssignment, useGradeSubmission, useTeacherAssignments, useTeacherSubmissions } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import type { Course, Assignment } from '@root/types';
import {
  TeacherSectionShell, GlassCard, MetricCard, StatusBadge, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  assignmentsDemo as FALLBACK_assignmentsDemo, teacherClassesDemo as FALLBACK_teacherClassesDemo,
  formatDateLabel, type AssignmentDemo,
} from './teacher-demo-data';

/* ── Submission demo data ── */
interface SubmissionStudent {
  id: string;
  name: string;
  initials: string;
  status: 'submitted' | 'pending' | 'late' | 'graded';
  submittedAt: string | null;
  score: number | null;
  maxScore: number;
}

const submissionsDemo: Record<string, SubmissionStudent[]> = {
  as1: [
    { id: 'ss1', name: 'Sarah Ahmad', initials: 'SA', status: 'graded', submittedAt: '2026-03-05 09:12', score: 46, maxScore: 50 },
    { id: 'ss2', name: 'James Baker', initials: 'JB', status: 'graded', submittedAt: '2026-03-05 08:45', score: 41, maxScore: 50 },
    { id: 'ss3', name: 'Chen Wei', initials: 'CW', status: 'graded', submittedAt: '2026-03-04 22:30', score: 50, maxScore: 50 },
    { id: 'ss4', name: 'Maria Garcia', initials: 'MG', status: 'submitted', submittedAt: '2026-03-05 11:00', score: null, maxScore: 50 },
    { id: 'ss5', name: 'David Johnson', initials: 'DJ', status: 'submitted', submittedAt: '2026-03-05 07:58', score: null, maxScore: 50 },
    { id: 'ss6', name: 'Jordan Kim', initials: 'JK', status: 'pending', submittedAt: null, score: null, maxScore: 50 },
    { id: 'ss7', name: 'Emma Larsson', initials: 'EL', status: 'submitted', submittedAt: '2026-03-05 10:15', score: null, maxScore: 50 },
    { id: 'ss8', name: 'Alex Rivera', initials: 'AR', status: 'late', submittedAt: '2026-03-06 01:22', score: null, maxScore: 50 },
  ],
  as2: [
    { id: 'ss9', name: 'Sam Lee', initials: 'SL', status: 'graded', submittedAt: '2026-03-05 09:50', score: 98, maxScore: 100 },
    { id: 'ss10', name: 'Priya Patel', initials: 'PP', status: 'graded', submittedAt: '2026-03-05 09:48', score: 85, maxScore: 100 },
    { id: 'ss11', name: 'Chen Wei', initials: 'CW', status: 'graded', submittedAt: '2026-03-05 09:42', score: 100, maxScore: 100 },
    { id: 'ss12', name: 'Emma Larsson', initials: 'EL', status: 'graded', submittedAt: '2026-03-05 09:49', score: 91, maxScore: 100 },
  ],
};

/* ── Type badge colors ── */
const typeTone: Record<string, string> = {
  homework: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
  quiz: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  test: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
  project: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  essay: 'border-pink-500/30 bg-pink-500/10 text-pink-400',
  lab: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
};

const statusTone: Record<string, 'good' | 'warn' | 'neutral'> = {
  active: 'good', closed: 'neutral', draft: 'warn',
};

export function AssignmentsSection({ schoolId, teacherId }: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const view = activeHeader || 'assignment_list';

  const createAssignment = useCreateAssignment();
  const gradeSubmission = useGradeSubmission();
  const { data: teacherAssignmentsApi } = useTeacherAssignments();

  const { data: coursesRes } = useCourses(schoolId);
  const courses: Course[] = coursesRes ?? [];
  const classes = courses.length > 0
    ? courses.filter(c => !teacherId || c.teacherId === teacherId)
    : FALLBACK_teacherClassesDemo;

  /* ── Pick first real course for hook ── */
  const firstCourseId = classes.length > 0 && 'id' in classes[0] ? (classes[0] as { id: string }).id : null;
  const { data: apiAssignments } = useAssignments(firstCourseId);

  const assignments: AssignmentDemo[] = useMemo(() => {
    // Priority 1: teacher-specific assignments from API
    const teacherApiData = (teacherAssignmentsApi as any)?.data as any[] | undefined;
    if (teacherApiData?.length) {
      return teacherApiData.map((a: any) => ({
        id: a.id,
        title: a.title,
        className: a.className ?? a.course?.name ?? 'Unknown',
        classId: a.classId ?? a.courseId ?? '',
        type: (a.type?.toLowerCase() ?? 'homework') as AssignmentDemo['type'],
        dueDate: a.dueDate ?? '',
        assignedDate: a.assignedDate ?? a.createdAt ?? '',
        totalPoints: a.totalPoints ?? a.maxScore ?? 100,
        submitted: a.submitted ?? 0,
        total: a.total ?? 25,
        avgScore: a.avgScore ?? null,
        status: (a.status ?? 'active') as 'active' | 'closed' | 'draft',
      }));
    }
    // Priority 2: course-level assignments
    if (apiAssignments && (apiAssignments as Assignment[]).length > 0) {
      return (apiAssignments as Assignment[]).map(a => ({
        id: a.id,
        title: a.title,
        className: a.course?.name ?? 'Unknown',
        classId: a.courseId,
        type: (a.type?.toLowerCase() ?? 'homework') as AssignmentDemo['type'],
        dueDate: a.dueDate ?? '',
        assignedDate: a.createdAt ?? '',
        totalPoints: a.maxScore ?? 100,
        submitted: (a as { _count?: { submissions?: number } })._count?.submissions ?? 0,
        total: a.course?._count?.enrollments ?? 25,
        avgScore: null,
        status: 'active' as const,
      }));
    }
    return FALLBACK_assignmentsDemo;
  }, [apiAssignments, teacherAssignmentsApi]);

  /* ── Filters ── */
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed' | 'draft'>('all');
  const [filterSearch, setFilterSearch] = useState('');
  const filtered = assignments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchSearch = !filterSearch || a.title.toLowerCase().includes(filterSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  /* ── Create form ── */
  const [formTitle, setFormTitle] = useState('');
  const [formClass, setFormClass] = useState('');
  const [formType, setFormType] = useState('homework');
  const [formDue, setFormDue] = useState('');
  const [formPoints, setFormPoints] = useState('100');
  const [formInstructions, setFormInstructions] = useState('');

  /* ── Submission view ── */
  const [selectedAssignment, setSelectedAssignment] = useState<string>(assignments[0]?.id ?? '');
  const currentAssignment = assignments.find(a => a.id === selectedAssignment);

  // Wire submissions from API with demo fallback
  const { data: apiSubmissionsData } = useTeacherSubmissions(selectedAssignment || null);
  const apiSubs = (apiSubmissionsData as any)?.data as SubmissionStudent[] | undefined;
  const subs: SubmissionStudent[] = apiSubs?.length ? apiSubs.map(s => ({
    id: s.id ?? (s as any).studentId ?? '',
    name: s.name ?? (s as any).studentName ?? 'Unknown',
    initials: s.initials ?? (s.name ?? (s as any).studentName ?? 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(),
    status: s.status ?? ((s as any).score != null ? 'graded' : (s as any).submittedAt ? 'submitted' : 'pending'),
    submittedAt: s.submittedAt ?? (s as any).submittedAt ?? null,
    score: s.score ?? (s as any).score ?? null,
    maxScore: s.maxScore ?? currentAssignment?.totalPoints ?? 100,
  })) : (submissionsDemo[selectedAssignment] ?? submissionsDemo.as1 ?? []);

  const subStatusIcon: Record<string, { color: string; icon: React.ReactNode }> = {
    graded: { color: 'text-emerald-400', icon: <CheckCircle2 className="size-3.5" /> },
    submitted: { color: 'text-sky-400', icon: <Upload className="size-3.5" /> },
    pending: { color: 'text-muted-foreground/70', icon: <Clock className="size-3.5" /> },
    late: { color: 'text-rose-400', icon: <Clock className="size-3.5" /> },
  };

  /* ── Render: Assignment List ── */
  const renderList = () => {
    const totalActive = assignments.filter(a => a.status === 'active').length;
    const totalSubmitted = assignments.reduce((s, a) => s + a.submitted, 0);
    const totalStudents = assignments.reduce((s, a) => s + a.total, 0);

    return (
      <div className="space-y-4" data-animate>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Active" value={totalActive} accent="#34d399" />
          <MetricCard label="Submissions" value={totalSubmitted} suffix={`/${totalStudents}`} accent="#818cf8" />
          <MetricCard label="Drafts" value={assignments.filter(a => a.status === 'draft').length} accent="#fbbf24" />
          <MetricCard label="Completed" value={assignments.filter(a => a.status === 'closed').length} accent="#f472b6" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="Search assignments..."
              className="pl-9 border-border/60 bg-muted/60 text-foreground/80 placeholder:text-muted-foreground/60"
            />
          </div>
          {(['all', 'active', 'closed', 'draft'] as const).map(s => (
            <Button
              key={s}
              variant="ghost"
              size="sm"
              className={`text-xs capitalize ${filterStatus === s ? 'bg-accent/60 text-foreground/80' : 'text-muted-foreground/80'}`}
              onClick={() => setFilterStatus(s)}
            >
              {s}
            </Button>
          ))}
          <Button
            size="sm"
            className="ml-auto bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs"
            onClick={() => setHeader('create_assignment')}
          >
            <Plus className="size-3 mr-1" /> New Assignment
          </Button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="No assignments found" message="Adjust your filters or create a new assignment." icon={<FileText className="size-8" />} />
        ) : (
          <div className="space-y-2">
            {filtered.map(a => (
              <GlassCard key={a.id} className="flex items-center gap-4 hover:bg-muted/60 transition-colors cursor-pointer" onClick={() => { setSelectedAssignment(a.id); setHeader('submissions'); }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground/80 truncate">{a.title}</p>
                    <Badge className={`text-[9px] font-medium ${typeTone[a.type] ?? typeTone.homework}`}>
                      {a.type}
                    </Badge>
                    <StatusBadge status={a.status} tone={statusTone[a.status] ?? 'neutral'} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.className} · Due {formatDateLabel(a.dueDate)} · {a.totalPoints} pts
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground/70">{a.submitted}/{a.total}</p>
                  <p className="text-[10px] text-muted-foreground/70">submitted</p>
                </div>
                <Progress value={(a.submitted / a.total) * 100} className="w-20 h-1.5" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[10px] text-muted-foreground/70 hover:text-muted-foreground"
                  onClick={(e) => { e.stopPropagation(); setSelectedAssignment(a.id); setHeader('submissions'); }}
                >
                  View <ChevronRight className="ml-1 size-3" />
                </Button>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ── Render: Create Assignment ── */
  const renderCreate = () => (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Plus className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-foreground/80">New Assignment</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Title</Label>
          <Input
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="e.g. Chapter 6 Problem Set"
            className="border-border/60 bg-muted/60 text-foreground/80 placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Class</Label>
          <Select value={formClass} onValueChange={setFormClass}>
            <SelectTrigger className="border-border/60 bg-muted/60 text-foreground/80">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {(classes as { id: string; name: string }[]).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Type</Label>
          <Select value={formType} onValueChange={setFormType}>
            <SelectTrigger className="border-border/60 bg-muted/60 text-foreground/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['homework', 'quiz', 'test', 'project', 'essay', 'lab'].map(t => (
                <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Due Date</Label>
          <Input
            type="date"
            value={formDue}
            onChange={e => setFormDue(e.target.value)}
            className="border-border/60 bg-muted/60 text-foreground/80"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Total Points</Label>
          <Input
            type="number"
            value={formPoints}
            onChange={e => setFormPoints(e.target.value)}
            className="border-border/60 bg-muted/60 text-foreground/80"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs text-muted-foreground">Instructions</Label>
          <Textarea
            value={formInstructions}
            onChange={e => setFormInstructions(e.target.value)}
            placeholder="Describe the assignment requirements..."
            rows={4}
            className="border-border/60 bg-muted/60 text-foreground/80 placeholder:text-muted-foreground/60"
          />
        </div>
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <Button variant="ghost" className="text-muted-foreground hover:text-muted-foreground" onClick={() => setHeader('assignment_list')}>Cancel</Button>
        <Button className="bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30" onClick={() => { createAssignment.mutate({ title: formTitle, classId: formClass, type: formType, dueDate: formDue, totalPoints: Number(formPoints), instructions: formInstructions, status: 'draft' }, { onSuccess: () => { notifySuccess('Draft saved', `"${formTitle}" saved as draft`); setHeader('assignment_list'); } }); }}>
          Save as Draft
        </Button>
        <Button className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30" onClick={() => { createAssignment.mutate({ title: formTitle, classId: formClass, type: formType, dueDate: formDue, totalPoints: Number(formPoints), instructions: formInstructions, status: 'active' }, { onSuccess: () => { notifySuccess('Assignment published', `"${formTitle}" is now live`); setHeader('assignment_list'); } }); }}>
          Publish
        </Button>
      </div>
    </GlassCard>
  );

  /* ── Render: Submissions ── */
  const renderSubmissions = () => {
    const gradedCount = subs.filter(s => s.status === 'graded').length;
    const submittedCount = subs.filter(s => s.status !== 'pending').length;
    const avgScore = subs.filter(s => s.score != null).reduce((sum, s) => sum + (s.score ?? 0), 0) / (gradedCount || 1);

    return (
      <div className="space-y-4" data-animate>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setHeader('assignment_list')}>
            ← All Assignments
          </Button>
          <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
            <SelectTrigger className="w-64 border-border/60 bg-muted/60 text-foreground/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assignments.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentAssignment && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Submitted" value={submittedCount} suffix={`/${subs.length}`} accent="#818cf8" />
            <MetricCard label="Graded" value={gradedCount} accent="#34d399" />
            <MetricCard label="Pending" value={subs.filter(s => s.status === 'pending').length} accent="#fbbf24" />
            <MetricCard label="Avg Score" value={gradedCount > 0 ? `${avgScore.toFixed(1)}` : '—'} suffix={gradedCount > 0 ? `/${currentAssignment.totalPoints}` : ''} accent="#f472b6" />
          </div>
        )}

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Submitted</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => {
                  const si = subStatusIcon[s.status] ?? subStatusIcon.pending;
                  return (
                    <tr key={s.id} className="border-b border-border/30 last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7 border border-border/70">
                            <AvatarFallback className="text-[9px] bg-muted/70 text-muted-foreground">{s.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground/70">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className={`flex items-center gap-1.5 ${si.color}`}>
                          {si.icon}
                          <span className="text-xs capitalize">{s.status}</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">
                        {s.submittedAt ?? '—'}
                      </td>
                      <td className="py-3">
                        {s.score != null ? (
                          <span className="text-xs font-semibold text-foreground/70">{s.score}/{s.maxScore}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        {(s.status === 'submitted' || s.status === 'late') && (
                          <Button variant="ghost" size="sm" className="text-[10px] text-indigo-400 hover:text-indigo-300" onClick={() => {
                            const scoreInput = prompt(`Enter score for ${s.name} (max ${s.maxScore}):`);
                            if (scoreInput == null) return;
                            const numScore = Number(scoreInput);
                            if (isNaN(numScore) || numScore < 0 || numScore > s.maxScore) return;
                            gradeSubmission.mutate({ assignmentId: selectedAssignment ?? '', studentId: s.id, score: numScore }, { onSuccess: () => notifySuccess('Graded', `${s.name} scored ${numScore}/${s.maxScore}`) });
                          }}>
                            Grade
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  const titles: Record<string, { title: string; desc: string }> = {
    assignment_list: { title: 'Assignments', desc: 'Manage and track all assignments across your classes' },
    create_assignment: { title: 'Create Assignment', desc: 'Create a new assignment for your students' },
    submissions: { title: 'Submissions', desc: 'Review student submissions and enter grades' },
  };

  const { title, desc } = titles[view] ?? titles.assignment_list;

  return (
    <TeacherSectionShell title={title} description={desc}>
      {view === 'assignment_list' && renderList()}
      {view === 'create_assignment' && renderCreate()}
      {view === 'submissions' && renderSubmissions()}
    </TeacherSectionShell>
  );
}
