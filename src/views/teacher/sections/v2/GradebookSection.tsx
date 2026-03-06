/* ─── Gradebook Section ──────────────────────────────────────────── 
 * Routes: grade_entry | mastery_view | grade_reports | comment_bank
 * ──────────────────────────────────────────────────────────────────── */
import { useState } from 'react';
import {
  CheckCircle2,
  Edit3, MessageSquare, Search, TrendingDown, TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCourses, useAssignments, useCourseGrades } from '@/hooks/api';
import { useSaveGrades, useExportGrades, useAddComment } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import type { Course } from '@root/types';
import {
  TeacherSectionShell, GlassCard, MetricCard, StatusBadge, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  gradebookStudentsDemo, gradebookAssignmentsDemo, teacherClassesDemo,
  commentBankDemo, classPerformanceDemo,
  type GradebookStudentDemo,
} from './teacher-demo-data';

/* ── Mastery standards demo ── */
const masteryStandards = [
  { id: 'ms1', code: 'A-SSE.3', title: 'Factor quadratics to reveal zeros', classes: [
    { name: 'Algebra II', mastery: 78 }, { name: 'Pre-Algebra', mastery: 45 },
  ]},
  { id: 'ms2', code: 'A-REI.4', title: 'Solve quadratic equations', classes: [
    { name: 'Algebra II', mastery: 65 },
  ]},
  { id: 'ms3', code: 'G-CO.8', title: 'Triangle congruence criteria', classes: [
    { name: 'Geometry', mastery: 82 },
  ]},
  { id: 'ms4', code: 'AP.D.1', title: 'Definition of the derivative', classes: [
    { name: 'AP Calculus AB', mastery: 71 },
  ]},
  { id: 'ms5', code: 'P-FM.1', title: 'Newton\'s Laws of Motion', classes: [
    { name: 'Physics Honors', mastery: 86 },
  ]},
  { id: 'ms6', code: 'N-RN.1', title: 'Rational & irrational numbers', classes: [
    { name: 'Pre-Algebra', mastery: 92 },
  ]},
  { id: 'ms7', code: 'EE-7', title: 'Solve linear equations', classes: [
    { name: 'Pre-Algebra', mastery: 68 },
  ]},
];

/* ── Grade distribution helper ── */
function gradeDistribution(avg: number): { label: string; pct: number; color: string }[] {
  return [
    { label: 'A', pct: Math.max(5, Math.round(avg > 85 ? 35 : avg > 75 ? 20 : 10)), color: 'bg-emerald-400' },
    { label: 'B', pct: Math.max(5, Math.round(avg > 80 ? 30 : 25)), color: 'bg-sky-400' },
    { label: 'C', pct: Math.max(5, Math.round(avg > 75 ? 20 : 30)), color: 'bg-amber-400' },
    { label: 'D', pct: Math.max(3, Math.round(avg > 80 ? 10 : 20)), color: 'bg-orange-400' },
    { label: 'F', pct: Math.max(2, Math.round(avg > 80 ? 5 : 15)), color: 'bg-rose-400' },
  ];
}

export function GradebookSection({ schoolId, teacherId }: TeacherSectionProps) {
  const { activeHeader } = useNavigationStore();
  const view = activeHeader || 'grade_entry';

  const { data: coursesRes } = useCourses(schoolId);
  const courses: Course[] = coursesRes ?? [];
  const classes = courses.length > 0
    ? courses.filter(c => !teacherId || c.teacherId === teacherId)
    : teacherClassesDemo;

  /* ── Class selector ── */
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id ?? 'c1');
  const firstCourseId = classes.length > 0 ? (classes as { id: string }[])[0]?.id : null;
  // Pre-fetch data (will be used when API data is available)
  useCourseGrades(firstCourseId);
  useAssignments(firstCourseId);

  const saveGradesMut = useSaveGrades();
  const exportGradesMut = useExportGrades();
  const addCommentMut = useAddComment();

  /* ── Gradebook data ── */
  const students = gradebookStudentsDemo;
  const gbAssignments = gradebookAssignmentsDemo;

  /* ── Editable cells state ── */
  const [editedScores, setEditedScores] = useState<Record<string, Record<string, string>>>({});

  const handleScoreChange = (studentId: string, assignmentId: string, value: string) => {
    setEditedScores(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [assignmentId]: value },
    }));
  };

  const getDisplayScore = (student: GradebookStudentDemo, aId: string): string => {
    if (editedScores[student.id]?.[aId] !== undefined) return editedScores[student.id][aId];
    const score = student.scores[aId];
    return score != null ? String(score) : '';
  };

  /* ── Comment bank state ── */
  const [commentSearch, setCommentSearch] = useState('');
  const [commentCategory, setCommentCategory] = useState<string>('all');
  const [newCommentText, setNewCommentText] = useState('');
  const filteredComments = commentBankDemo.filter(c => {
    const matchCat = commentCategory === 'all' || c.category === commentCategory;
    const matchSearch = !commentSearch || c.text.toLowerCase().includes(commentSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const categoryColors: Record<string, string> = {
    positive: 'border-emerald-500/30 bg-emerald-500/8 text-emerald-400',
    improvement: 'border-amber-500/30 bg-amber-500/8 text-amber-400',
    concern: 'border-rose-500/30 bg-rose-500/8 text-rose-400',
    encouragement: 'border-sky-500/30 bg-sky-500/8 text-sky-400',
  };

  /* ── Render: Grade Entry ── */
  const renderGradeEntry = () => {
    const classAvg = students.reduce((s, st) => s + st.average, 0) / students.length;
    const atRisk = students.filter(s => s.average < 70).length;

    return (
      <div className="space-y-4" data-animate>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-52 border-white/8 bg-white/4 text-white/80 text-xs">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {(classes as { id: string; name: string }[]).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" size="sm" className="text-xs text-white/40" onClick={() => { exportGradesMut.mutate({ classId: selectedClass || firstCourseId || '', format: 'csv' }, { onSuccess: () => notifySuccess('Export started', 'CSV will be downloaded shortly') }); }}>Export CSV</Button>
            <Button size="sm" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs" onClick={() => { const grades = Object.entries(editedScores).map(([key, score]) => { const [studentId, assignmentId] = key.split('_'); return { studentId, assignmentId, score: Number(score) }; }); saveGradesMut.mutate({ classId: selectedClass || firstCourseId || '', grades }, { onSuccess: () => notifySuccess('Grades saved', `${grades.length} grade(s) saved`) }); }}>
              <CheckCircle2 className="size-3 mr-1" /> Save Grades
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Students" value={students.length} accent="#818cf8" />
          <MetricCard label="Class Average" value={classAvg.toFixed(1)} suffix="%" accent="#34d399" />
          <MetricCard label="At Risk" value={atRisk} accent="#f43f5e" />
          <MetricCard label="Assignments" value={gbAssignments.length} accent="#fbbf24" />
        </div>

        <GlassCard className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="border-b border-white/6">
                <th className="pb-3 pr-4 text-[11px] font-semibold text-white/40 uppercase tracking-wider sticky left-0 bg-white/3 z-10">Student</th>
                {gbAssignments.map(a => (
                  <th key={a.id} className="pb-3 px-2 text-center text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                    <div>{a.title}</div>
                    <div className="text-[9px] text-white/20 font-normal">{a.weight}% · max {a.maxScore}</div>
                  </th>
                ))}
                <th className="pb-3 pl-3 text-center text-[11px] font-semibold text-white/40 uppercase tracking-wider">Avg</th>
                <th className="pb-3 text-center text-[11px] font-semibold text-white/40 uppercase tracking-wider">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map(st => (
                <tr key={st.id} className="border-b border-white/4 last:border-0 group">
                  <td className="py-2.5 pr-4 sticky left-0 bg-white/3 z-10">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-6 border border-white/10">
                        <AvatarFallback className="text-[8px] bg-white/5 text-white/50">{st.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white/70">{st.name}</span>
                        {st.trend === 'up' && <TrendingUp className="size-3 text-emerald-400" />}
                        {st.trend === 'down' && <TrendingDown className="size-3 text-rose-400" />}
                      </div>
                    </div>
                  </td>
                  {gbAssignments.map(a => {
                    const val = getDisplayScore(st, a.id);
                    const numVal = val ? Number(val) : null;
                    const isPoor = numVal != null && numVal < a.maxScore * 0.6;
                    return (
                      <td key={a.id} className="py-2.5 px-1 text-center">
                        <input
                          type="text"
                          value={val}
                          onChange={e => handleScoreChange(st.id, a.id, e.target.value)}
                          placeholder="—"
                          className={`w-14 rounded-md border px-2 py-1 text-center text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${
                            isPoor
                              ? 'border-rose-500/30 bg-rose-500/8 text-rose-300'
                              : val === ''
                                ? 'border-white/8 bg-white/3 text-white/25'
                                : 'border-white/10 bg-white/5 text-white/70'
                          }`}
                        />
                      </td>
                    );
                  })}
                  <td className="py-2.5 pl-3 text-center">
                    <span className={`text-xs font-bold ${st.average >= 80 ? 'text-emerald-400' : st.average >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {st.average.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <Badge className={`text-[10px] font-bold ${
                      st.letterGrade.startsWith('A') ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : st.letterGrade.startsWith('B') ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                      : st.letterGrade.startsWith('C') ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    }`}>
                      {st.letterGrade}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    );
  };

  /* ── Render: Mastery View ── */
  const renderMastery = () => (
    <div className="space-y-4" data-animate>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricCard label="Standards Tracked" value={masteryStandards.length} accent="#818cf8" />
        <MetricCard label="Above 80%" value={masteryStandards.filter(s => s.classes.some(c => c.mastery >= 80)).length} accent="#34d399" />
        <MetricCard label="Needs Attention" value={masteryStandards.filter(s => s.classes.some(c => c.mastery < 60)).length} accent="#f43f5e" />
      </div>

      <div className="space-y-3">
        {masteryStandards.map(std => (
          <GlassCard key={std.id}>
            <div className="flex items-start gap-3 mb-3">
              <span className="text-xs font-mono text-indigo-400 shrink-0">{std.code}</span>
              <p className="text-sm text-white/70">{std.title}</p>
            </div>
            <div className="space-y-2">
              {std.classes.map((cls, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-white/40 w-32 shrink-0">{cls.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/6 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cls.mastery >= 80 ? 'bg-emerald-400' : cls.mastery >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${cls.mastery}%` }}
                    />
                  </div>
                  <span className={`text-xs font-semibold w-10 text-right ${
                    cls.mastery >= 80 ? 'text-emerald-400' : cls.mastery >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {cls.mastery}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );

  /* ── Render: Grade Reports ── */
  const renderReports = () => (
    <div className="space-y-4" data-animate>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {classPerformanceDemo.map(cp => {
          const dist = gradeDistribution(cp.avgGrade);
          return (
            <GlassCard key={cp.classId}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-white/80">{cp.className}</h4>
                <StatusBadge status={`${cp.passRate}% pass`} tone={cp.passRate >= 90 ? 'good' : cp.passRate >= 75 ? 'warn' : 'bad'} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div>
                  <p className="text-[10px] text-white/30">Average</p>
                  <p className="text-lg font-bold text-white/80">{cp.avgGrade}<span className="text-xs text-white/30">%</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Attendance</p>
                  <p className="text-lg font-bold text-white/80">{cp.attendanceRate}<span className="text-xs text-white/30">%</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">HW Completion</p>
                  <p className="text-lg font-bold text-white/80">{cp.assignmentCompletion}<span className="text-xs text-white/30">%</span></p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Pass Rate</p>
                  <p className="text-lg font-bold text-white/80">{cp.passRate}<span className="text-xs text-white/30">%</span></p>
                </div>
              </div>

              {/* Grade distribution bar chart */}
              <p className="text-[10px] text-white/30 mb-1.5">Grade Distribution</p>
              <div className="flex items-end gap-1 h-16">
                {dist.map(d => (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full rounded-t ${d.color}`}
                      style={{ height: `${d.pct * 1.5}px` }}
                    />
                    <span className="text-[9px] text-white/30">{d.label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-white/6">
                <div className="flex flex-wrap gap-1 mb-1">
                  <span className="text-[10px] text-white/30">Top:</span>
                  {cp.topStudents.map(s => (
                    <Badge key={s} className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{s}</Badge>
                  ))}
                </div>
                {cp.atRiskStudents.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] text-white/30">At risk:</span>
                    {cp.atRiskStudents.map(s => (
                      <Badge key={s} className="text-[9px] bg-rose-500/10 text-rose-400 border-rose-500/20">{s}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );

  /* ── Render: Comment Bank ── */
  const renderCommentBank = () => (
    <div className="space-y-4" data-animate>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25" />
          <Input
            value={commentSearch}
            onChange={e => setCommentSearch(e.target.value)}
            placeholder="Search comments..."
            className="pl-9 border-white/8 bg-white/4 text-white/80 placeholder:text-white/25"
          />
        </div>
        {(['all', 'positive', 'improvement', 'concern', 'encouragement'] as const).map(cat => (
          <Button
            key={cat}
            variant="ghost"
            size="sm"
            className={`text-xs capitalize ${commentCategory === cat ? 'bg-white/8 text-white/80' : 'text-white/35'}`}
            onClick={() => setCommentCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Total Comments" value={commentBankDemo.length} accent="#818cf8" />
        <MetricCard label="Positive" value={commentBankDemo.filter(c => c.category === 'positive').length} accent="#34d399" />
        <MetricCard label="Improvement" value={commentBankDemo.filter(c => c.category === 'improvement').length} accent="#fbbf24" />
        <MetricCard label="Most Used" value={Math.max(...commentBankDemo.map(c => c.uses))} suffix=" times" accent="#f472b6" />
      </div>

      {filteredComments.length === 0 ? (
        <EmptyState title="No comments found" message="Try adjusting your search or category filter." icon={<MessageSquare className="size-8" />} />
      ) : (
        <div className="space-y-2">
          {filteredComments.map(c => (
            <div
              key={c.id}
              className={`rounded-xl border p-4 cursor-pointer hover:brightness-110 transition-all ${categoryColors[c.category] ?? 'border-white/8 bg-white/4 text-white/60'}`}
              onClick={() => { navigator.clipboard.writeText(c.text); notifySuccess('Copied', 'Comment copied to clipboard'); }}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-relaxed">{c.text}</p>
                <div className="shrink-0 text-right">
                  <Badge variant="outline" className="text-[9px] border-white/10 text-white/30 capitalize mb-1">{c.category}</Badge>
                  <p className="text-[10px] text-white/25">{c.uses} uses</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <GlassCard>
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="size-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-white/80">Add New Comment</h4>
        </div>
        <div className="flex gap-3">
          <Input
            value={newCommentText}
            onChange={e => setNewCommentText(e.target.value)}
            placeholder="Type a new report card comment..."
            className="flex-1 border-white/8 bg-white/4 text-white/80 placeholder:text-white/25"
          />
          <Select defaultValue="positive">
            <SelectTrigger className="w-36 border-white/8 bg-white/4 text-white/80 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['positive', 'improvement', 'concern', 'encouragement'].map(cat => (
                <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs" onClick={() => { addCommentMut.mutate({ category: commentCategory === 'all' ? 'positive' : commentCategory, text: newCommentText }, { onSuccess: () => { notifySuccess('Comment added', 'New comment saved to bank'); setNewCommentText(''); } }); }}>
            Add
          </Button>
        </div>
      </GlassCard>
    </div>
  );

  const titles: Record<string, { title: string; desc: string }> = {
    grade_entry: { title: 'Grade Entry', desc: 'Enter and manage student grades in the spreadsheet' },
    mastery_view: { title: 'Mastery View', desc: 'Track standards-based mastery across your classes' },
    grade_reports: { title: 'Grade Reports', desc: 'Class performance summaries and distribution' },
    comment_bank: { title: 'Comment Bank', desc: 'Reusable comments for report cards and feedback' },
  };

  const { title, desc } = titles[view] ?? titles.grade_entry;

  return (
    <TeacherSectionShell title={title} description={desc}>
      {view === 'grade_entry' && renderGradeEntry()}
      {view === 'mastery_view' && renderMastery()}
      {view === 'grade_reports' && renderReports()}
      {view === 'comment_bank' && renderCommentBank()}
    </TeacherSectionShell>
  );
}
