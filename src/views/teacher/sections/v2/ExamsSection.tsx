/* ─── Exams Section ──────────────────────────────────────────────── 
 * Routes: exam_schedule | marks_entry | exam_results
 * ──────────────────────────────────────────────────────────────────── */
import { useState } from 'react';
import {
  Award, BarChart3, Calendar, CheckCircle2, Clock, Edit3, FileText,
  GraduationCap, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCourses } from '@/hooks/api';
import { useSaveExamMarks, useTeacherExams } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import {
  TeacherSectionShell, GlassCard, MetricCard, StatusBadge, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  attendanceStudentsDemo,
  formatDateLabel, formatTimeRange, type ExamDemo,
} from './teacher-demo-data';

/* ── Marks entry demo ── */
interface ExamStudentScore {
  id: string;
  name: string;
  initials: string;
  score: number | null;
  maxScore: number;
  status: 'entered' | 'pending';
}

const marksEntryDemo: Record<string, ExamStudentScore[]> = {
  ex4: [
    { id: 'me1', name: 'Sarah Ahmad', initials: 'SA', score: 82, maxScore: 100, status: 'entered' },
    { id: 'me2', name: 'James Baker', initials: 'JB', score: 75, maxScore: 100, status: 'entered' },
    { id: 'me3', name: 'Chen Wei', initials: 'CW', score: 96, maxScore: 100, status: 'entered' },
    { id: 'me4', name: 'Maria Garcia', initials: 'MG', score: 68, maxScore: 100, status: 'entered' },
    { id: 'me5', name: 'David Johnson', initials: 'DJ', score: 88, maxScore: 100, status: 'entered' },
    { id: 'me6', name: 'Priya Patel', initials: 'PP', score: 91, maxScore: 100, status: 'entered' },
    { id: 'me7', name: 'Emma Larsson', initials: 'EL', score: 79, maxScore: 100, status: 'entered' },
    { id: 'me8', name: 'Alex Rivera', initials: 'AR', score: 73, maxScore: 100, status: 'entered' },
  ],
  ex5: [
    { id: 'me9', name: 'Sarah Ahmad', initials: 'SA', score: 88, maxScore: 100, status: 'entered' },
    { id: 'me10', name: 'Jordan Kim', initials: 'JK', score: 52, maxScore: 100, status: 'entered' },
    { id: 'me11', name: 'Tyler Brooks', initials: 'TB', score: 61, maxScore: 100, status: 'entered' },
    { id: 'me12', name: 'Aisha Mohammed', initials: 'AM', score: 84, maxScore: 100, status: 'entered' },
    { id: 'me13', name: 'David Johnson', initials: 'DJ', score: 92, maxScore: 100, status: 'entered' },
    { id: 'me14', name: 'Sam Lee', initials: 'SL', score: null, maxScore: 100, status: 'pending' },
    { id: 'me15', name: 'Priya Patel', initials: 'PP', score: null, maxScore: 100, status: 'pending' },
    { id: 'me16', name: 'Emma Larsson', initials: 'EL', score: 78, maxScore: 100, status: 'entered' },
  ],
  ex1: attendanceStudentsDemo.slice(0, 8).map((st, i) => ({
    id: `me-new-${i}`,
    name: st.name,
    initials: st.initials,
    score: null,
    maxScore: 100,
    status: 'pending' as const,
  })),
};

/* ── Exam results detail ── */
interface ExamResultDetail {
  examId: string;
  avgScore: number;
  passRate: number;
  highest: number;
  lowest: number;
  distribution: { label: string; count: number; color: string }[];
}

const examResultsDemo: ExamResultDetail[] = [
  {
    examId: 'ex4',
    avgScore: 81.5,
    passRate: 87.5,
    highest: 96,
    lowest: 68,
    distribution: [
      { label: '90-100', count: 2, color: 'bg-emerald-400' },
      { label: '80-89', count: 2, color: 'bg-sky-400' },
      { label: '70-79', count: 3, color: 'bg-amber-400' },
      { label: '60-69', count: 1, color: 'bg-orange-400' },
      { label: '0-59', count: 0, color: 'bg-rose-400' },
    ],
  },
  {
    examId: 'ex5',
    avgScore: 75.8,
    passRate: 75,
    highest: 92,
    lowest: 52,
    distribution: [
      { label: '90-100', count: 1, color: 'bg-emerald-400' },
      { label: '80-89', count: 2, color: 'bg-sky-400' },
      { label: '70-79', count: 1, color: 'bg-amber-400' },
      { label: '60-69', count: 1, color: 'bg-orange-400' },
      { label: '0-59', count: 1, color: 'bg-rose-400' },
    ],
  },
];

/* ── Status appearance ── */
const examStatusStyle: Record<string, { tone: 'good' | 'warn' | 'neutral' | 'info'; label: string }> = {
  upcoming: { tone: 'info', label: 'Upcoming' },
  'in-progress': { tone: 'warn', label: 'In Progress' },
  completed: { tone: 'neutral', label: 'Completed' },
  graded: { tone: 'good', label: 'Graded' },
};

export function ExamsSection({ schoolId }: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const view = activeHeader || 'exam_schedule';

  // Prefetch — will render from API when data available
  useCourses(schoolId);
  const saveMarksMut = useSaveExamMarks();
  const { data: apiExams, isLoading: examsLoading } = useTeacherExams();

  const exams: ExamDemo[] = (apiExams as unknown as ExamDemo[]) ?? [];
  const upcomingExams = exams.filter(e => e.status === 'upcoming' || e.status === 'in-progress');
  const completedExams = exams.filter(e => e.status === 'completed' || e.status === 'graded');

  /* ── Marks entry state ── */
  const gradableExams = exams.filter(e => e.status !== 'upcoming');
  const [selectedExam, setSelectedExam] = useState(gradableExams[0]?.id ?? 'ex4');
  const currentExam = exams.find(e => e.id === selectedExam);
  const students = marksEntryDemo[selectedExam] ?? marksEntryDemo.ex1 ?? [];
  const [editedMarks, setEditedMarks] = useState<Record<string, string>>({});

  const handleMarkChange = (studentId: string, value: string) => {
    setEditedMarks(prev => ({ ...prev, [studentId]: value }));
  };

  const getDisplayMark = (student: ExamStudentScore): string => {
    if (editedMarks[student.id] !== undefined) return editedMarks[student.id];
    return student.score != null ? String(student.score) : '';
  };

  /* ── Results view state ── */
  const [selectedResultExam, setSelectedResultExam] = useState(completedExams[0]?.id ?? 'ex4');

  /* ── Render: Exam Schedule ── */
  const renderSchedule = () => (
    <div className="space-y-4" data-animate>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Upcoming" value={upcomingExams.length} accent="#818cf8" />
        <MetricCard label="This Week" value={upcomingExams.filter(e => {
          const d = new Date(e.date);
          const now = new Date();
          const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7;
        }).length} accent="#fbbf24" />
        <MetricCard label="Completed" value={completedExams.length} accent="#34d399" />
        <MetricCard label="Needs Grading" value={exams.filter(e => e.status === 'completed').length} accent="#f43f5e" />
      </div>

      {/* Upcoming timeline */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="size-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-foreground/80">Upcoming Exams</h3>
        </div>
        {upcomingExams.length === 0 ? (
          <EmptyState title="No upcoming exams" message="All scheduled exams have been completed." icon={<GraduationCap className="size-8" />} />
        ) : (
          <div className="space-y-3">
            {upcomingExams.map((exam) => {
              const daysUntil = Math.ceil((new Date(exam.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const st = examStatusStyle[exam.status] ?? examStatusStyle.upcoming;
              return (
                <GlassCard key={exam.id} className="relative overflow-hidden">
                  {/* Timeline indicator */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-indigo-500/40" />
                  <div className="flex items-start gap-4 pl-3">
                    <div className="shrink-0 text-center">
                      <p className="text-2xl font-bold text-indigo-400">{new Date(exam.date).getDate()}</p>
                      <p className="text-[10px] text-muted-foreground/70 uppercase">
                        {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground/80 truncate">{exam.title}</p>
                        <StatusBadge status={st.label} tone={st.tone} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {exam.className} · {formatTimeRange(exam.startTime, exam.endTime)} · {exam.room}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                          <Users className="size-3" /> {exam.totalStudents} students
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                          <Clock className="size-3" />
                          {daysUntil <= 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] text-muted-foreground/70 hover:text-muted-foreground"
                        onClick={() => { setSelectedExam(exam.id); setHeader('marks_entry'); }}
                      >
                        <Edit3 className="size-3 mr-1" /> Enter Marks
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed exams */}
      {completedExams.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground/80">Completed Exams</h3>
          </div>
          <div className="space-y-2">
            {completedExams.map(exam => {
              const st = examStatusStyle[exam.status] ?? examStatusStyle.completed;
              return (
                <div
                  key={exam.id}
                  className="flex items-center gap-4 rounded-xl border border-border/50 bg-card/80 px-4 py-3 hover:bg-muted/70 transition-colors cursor-pointer"
                  onClick={() => { setSelectedResultExam(exam.id); setHeader('exam_results'); }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground/70 truncate">{exam.title}</p>
                      <StatusBadge status={st.label} tone={st.tone} />
                    </div>
                    <p className="text-[11px] text-muted-foreground/70">{exam.className} · {formatDateLabel(exam.date)}</p>
                  </div>
                  {exam.avgScore != null && (
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground/70">{exam.avgScore}%</p>
                      <p className="text-[10px] text-muted-foreground/60">avg score</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  /* ── Render: Marks Entry ── */
  const renderMarksEntry = () => {
    const enteredCount = students.filter(s => s.score != null || editedMarks[s.id] !== undefined).length;
    const scores = students
      .map(s => editedMarks[s.id] !== undefined ? Number(editedMarks[s.id]) : s.score)
      .filter((s): s is number => s != null && !isNaN(s));
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return (
      <div className="space-y-4" data-animate>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setHeader('exam_schedule')}>
            ← Exam Schedule
          </Button>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-72 border-border/60 bg-muted/60 text-foreground/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {gradableExams.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.title} — {e.className}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="ml-auto bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs"
            onClick={() => {
              const marks = Object.entries(editedMarks).map(([studentId, score]) => ({ studentId, score: Number(score) }));
              saveMarksMut.mutate(
                { examId: selectedExam, marks },
                { onSuccess: () => {
                  notifySuccess('Marks saved', `Marks saved for ${currentExam?.title}`);
                  setHeader('exam_schedule');
                }}
              );
            }}
          >
            <CheckCircle2 className="size-3 mr-1" /> Save Marks
          </Button>
        </div>

        {currentExam && (
          <GlassCard className="flex items-center gap-6">
            <div>
              <p className="text-xs text-muted-foreground/70">Exam</p>
              <p className="text-sm font-semibold text-foreground/80">{currentExam.title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70">Date</p>
              <p className="text-sm text-muted-foreground">{formatDateLabel(currentExam.date)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70">Time</p>
              <p className="text-sm text-muted-foreground">{formatTimeRange(currentExam.startTime, currentExam.endTime)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground/70">Room</p>
              <p className="text-sm text-muted-foreground">{currentExam.room}</p>
            </div>
          </GlassCard>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Entered" value={enteredCount} suffix={`/${students.length}`} accent="#818cf8" />
          <MetricCard label="Pending" value={students.length - enteredCount} accent="#fbbf24" />
          <MetricCard label="Average" value={avg > 0 ? avg.toFixed(1) : '—'} accent="#34d399" />
          <MetricCard label="Max Score" value={students[0]?.maxScore ?? 100} accent="#f472b6" />
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-8">#</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-32">Score</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-24">Status</th>
                  <th className="pb-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider w-20">%</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, i) => {
                  const val = getDisplayMark(st);
                  const numVal = val ? Number(val) : null;
                  const pct = numVal != null ? Math.round((numVal / st.maxScore) * 100) : null;
                  const isLow = pct != null && pct < 60;

                  return (
                    <tr key={st.id} className="border-b border-border/30 last:border-0">
                      <td className="py-2.5 text-xs text-muted-foreground/60">{i + 1}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="size-7 border border-border/70">
                            <AvatarFallback className="text-[9px] bg-muted/70 text-muted-foreground">{st.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground/70">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            max={st.maxScore}
                            value={val}
                            onChange={e => handleMarkChange(st.id, e.target.value)}
                            placeholder="—"
                            className={`w-20 rounded-md border px-2 py-1.5 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${
                              isLow
                                ? 'border-rose-500/30 bg-rose-500/8 text-rose-300'
                                : val === ''
                                  ? 'border-border/60 bg-card/80 text-muted-foreground/60'
                                  : 'border-border/70 bg-muted/70 text-foreground/70'
                            }`}
                          />
                          <span className="text-[10px] text-muted-foreground/50">/ {st.maxScore}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <StatusBadge
                          status={val ? 'Entered' : 'Pending'}
                          tone={val ? 'good' : 'warn'}
                        />
                      </td>
                      <td className="py-2.5">
                        {pct != null ? (
                          <span className={`text-xs font-semibold ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {pct}%
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
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

  /* ── Render: Exam Results ── */
  const renderResults = () => {
    const resultExam = exams.find(e => e.id === selectedResultExam);
    // Compute results dynamically from marks data when available, falling back to static demo
    const marksForExam = marksEntryDemo[selectedResultExam];
    const staticResult = examResultsDemo.find(r => r.examId === selectedResultExam);
    const resultDetail: ExamResultDetail | undefined = marksForExam
      ? (() => {
          const scores = marksForExam.filter(s => s.score != null).map(s => s.score!);
          if (scores.length === 0) return staticResult;
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          const passCount = scores.filter(s => s >= 60).length;
          const dist = [
            { label: '90-100', count: scores.filter(s => s >= 90).length, color: 'bg-emerald-400' },
            { label: '80-89', count: scores.filter(s => s >= 80 && s < 90).length, color: 'bg-sky-400' },
            { label: '70-79', count: scores.filter(s => s >= 70 && s < 80).length, color: 'bg-amber-400' },
            { label: '60-69', count: scores.filter(s => s >= 60 && s < 70).length, color: 'bg-orange-400' },
            { label: '0-59', count: scores.filter(s => s < 60).length, color: 'bg-rose-400' },
          ];
          return {
            examId: selectedResultExam,
            avgScore: Math.round(avg * 10) / 10,
            passRate: Math.round((passCount / scores.length) * 100),
            highest: Math.max(...scores),
            lowest: Math.min(...scores),
            distribution: dist,
          };
        })()
      : staticResult;
    const maxCount = resultDetail ? Math.max(...resultDetail.distribution.map(d => d.count), 1) : 1;

    return (
      <div className="space-y-4" data-animate>
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setHeader('exam_schedule')}>
            ← Exam Schedule
          </Button>
          <Select value={selectedResultExam} onValueChange={setSelectedResultExam}>
            <SelectTrigger className="w-72 border-border/60 bg-muted/60 text-foreground/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {completedExams.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.title} — {e.className}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {resultExam && resultDetail && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MetricCard label="Average Score" value={resultDetail.avgScore.toFixed(1)} suffix="%" accent="#818cf8" />
              <MetricCard label="Pass Rate" value={resultDetail.passRate} suffix="%" accent="#34d399" />
              <MetricCard label="Highest" value={resultDetail.highest} accent="#fbbf24" />
              <MetricCard label="Lowest" value={resultDetail.lowest} accent="#f43f5e" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Distribution chart */}
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="size-4 text-indigo-400" />
                  <h4 className="text-sm font-semibold text-foreground/80">Score Distribution</h4>
                </div>
                <div className="flex items-end gap-3 h-40">
                  {resultDetail.distribution.map(d => (
                    <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">{d.count}</span>
                      <div
                        className={`w-full rounded-t-lg ${d.color} transition-all`}
                        style={{ height: `${Math.max(8, (d.count / maxCount) * 120)}px` }}
                      />
                      <span className="text-[10px] text-muted-foreground/70">{d.label}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Exam details card */}
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="size-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-foreground/80">Exam Details</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">Exam</span>
                    <span className="text-xs font-medium text-foreground/70">{resultExam.title}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">Class</span>
                    <span className="text-xs text-foreground/70">{resultExam.className}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <span className="text-xs text-foreground/70">{formatDateLabel(resultExam.date)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">Time</span>
                    <span className="text-xs text-foreground/70">{formatTimeRange(resultExam.startTime, resultExam.endTime)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">Room</span>
                    <span className="text-xs text-foreground/70">{resultExam.room}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Students</span>
                    <span className="text-xs text-foreground/70">{resultExam.totalStudents}</span>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Student scores breakdown */}
            {marksEntryDemo[selectedResultExam] && (
              <GlassCard>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="size-4 text-pink-400" />
                  <h4 className="text-sm font-semibold text-foreground/80">Student Scores</h4>
                </div>
                <div className="space-y-1.5">
                  {marksEntryDemo[selectedResultExam]
                    .filter(s => s.score != null)
                    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
                    .map((st, i) => {
                      const pct = Math.round(((st.score ?? 0) / st.maxScore) * 100);
                      return (
                        <div key={st.id} className="flex items-center gap-3 rounded-lg border border-border/30 bg-card/60 px-3 py-2">
                          <span className="text-[10px] text-muted-foreground/50 w-5">{i + 1}</span>
                          <Avatar className="size-6 border border-border/70">
                            <AvatarFallback className="text-[8px] bg-muted/70 text-muted-foreground">{st.initials}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-foreground/70 w-32">{st.name}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted/80 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-400' : pct >= 60 ? 'bg-amber-400' : 'bg-rose-400'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold w-12 text-right ${pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {st.score}/{st.maxScore}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </GlassCard>
            )}
          </>
        )}

        {(!resultExam || !resultDetail) && (
          <EmptyState
            title="No results available"
            message="Select a completed exam to view its results."
            icon={<Award className="size-8" />}
          />
        )}
      </div>
    );
  };

  const titles: Record<string, { title: string; desc: string }> = {
    exam_schedule: { title: 'Exam Schedule', desc: 'Upcoming and completed exam timeline' },
    marks_entry: { title: 'Marks Entry', desc: 'Enter student scores for exams' },
    exam_results: { title: 'Exam Results', desc: 'Score analysis and distribution for completed exams' },
  };

  const { title, desc } = titles[view] ?? titles.exam_schedule;

  return (
    <TeacherSectionShell title={title} description={desc}>
      {examsLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground/60">Loading exams…</div>
      ) : exams.length === 0 ? (
        <EmptyState title="No exams yet" message="Exams will appear here once they are scheduled." icon={<GraduationCap className="size-8" />} />
      ) : (
        <>
          {view === 'exam_schedule' && renderSchedule()}
          {view === 'marks_entry' && renderMarksEntry()}
          {view === 'exam_results' && renderResults()}
        </>
      )}
    </TeacherSectionShell>
  );
}
