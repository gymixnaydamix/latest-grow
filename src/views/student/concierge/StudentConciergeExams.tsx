/* Student Concierge › Exams — Upcoming, Schedule, Results, Report Card, Analysis, Resources */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeSplitPreviewPanel } from '@/components/concierge/shared';
import { cn } from '@/lib/utils';
import { Calendar, Clock, TrendingUp, TrendingDown, Minus, Download, FileText } from 'lucide-react';
import { useStudentExams, useStudentGradesOverview, useStudentLearningPaths, useStudentPortfolio } from '@/hooks/api/use-student';

/* ── Upcoming exams ── */
const FALLBACK_UPCOMING_EXAMS = [
  { id: 'ue1', subject: 'Hindi', type: 'Unit Test', date: 'Mar 10, 2026', time: '10:00 AM – 11:00 AM', syllabus: 'Premchand — Idgah, Namak ka Daroga; Grammar Units 3–4', seatNumber: 'B-14', room: 'Hall A' },
  { id: 'ue2', subject: 'Mathematics', type: 'Weekly Test', date: 'Mar 12, 2026', time: '08:30 AM – 09:30 AM', syllabus: 'Ch 2: Polynomials — All exercises', seatNumber: 'B-14', room: 'Room 9B' },
  { id: 'ue3', subject: 'Science', type: 'Lab Viva', date: 'Mar 14, 2026', time: '11:00 AM – 12:00 PM', syllabus: 'Reflection of Light — Laws, mirror types, ray diagrams', seatNumber: 'Lab-07', room: 'Physics Lab' },
  { id: 'ue4', subject: 'English', type: 'Term Exam', date: 'Mar 25, 2026', time: '09:00 AM – 12:00 PM', syllabus: 'Beehive Ch 1–6, Moments Ch 1–4, Grammar & Writing', seatNumber: 'A-22', room: 'Exam Hall' },
  { id: 'ue5', subject: 'Social Studies', type: 'Term Exam', date: 'Mar 27, 2026', time: '09:00 AM – 12:00 PM', syllabus: 'French Revolution, Socialism in Europe, Nazism, India — Size & Location', seatNumber: 'A-22', room: 'Exam Hall' },
];

/* ── Full exam schedule ── */
const FALLBACK_EXAM_SCHEDULE = [
  { date: 'Mar 10 (Mon)', subject: 'Hindi', time: '10:00 – 11:00', type: 'Unit Test', marks: 25 },
  { date: 'Mar 12 (Wed)', subject: 'Mathematics', time: '08:30 – 09:30', type: 'Weekly Test', marks: 20 },
  { date: 'Mar 14 (Fri)', subject: 'Science', time: '11:00 – 12:00', type: 'Lab Viva', marks: 15 },
  { date: 'Mar 25 (Tue)', subject: 'English', time: '09:00 – 12:00', type: 'Term Exam', marks: 80 },
  { date: 'Mar 26 (Wed)', subject: 'Hindi', time: '09:00 – 12:00', type: 'Term Exam', marks: 80 },
  { date: 'Mar 27 (Thu)', subject: 'Social Studies', time: '09:00 – 12:00', type: 'Term Exam', marks: 80 },
  { date: 'Mar 28 (Fri)', subject: 'Mathematics', time: '09:00 – 12:00', type: 'Term Exam', marks: 80 },
  { date: 'Mar 31 (Mon)', subject: 'Science', time: '09:00 – 12:00', type: 'Term Exam', marks: 80 },
  { date: 'Apr 1 (Tue)', subject: 'Computer Science', time: '09:00 – 11:00', type: 'Term Exam', marks: 50 },
];

/* ── Results ── */
const FALLBACK_EXAM_RESULTS = [
  { id: 'er1', subject: 'Mathematics', exam: 'Unit Test 3 — Triangles', marks: 38, total: 40, grade: 'A+', classAvg: 32, rank: 3 },
  { id: 'er2', subject: 'Science', exam: 'Unit Test 3 — Sound', marks: 35, total: 40, grade: 'A+', classAvg: 30, rank: 5 },
  { id: 'er3', subject: 'English', exam: 'Unit Test 3 — Literature', marks: 32, total: 40, grade: 'A', classAvg: 28, rank: 7 },
  { id: 'er4', subject: 'Hindi', exam: 'Unit Test 2 — Kabir ke Dohe', marks: 28, total: 40, grade: 'B+', classAvg: 26, rank: 12 },
  { id: 'er5', subject: 'Social Studies', exam: 'Unit Test 3 — Democracy', marks: 36, total: 40, grade: 'A+', classAvg: 31, rank: 2 },
  { id: 'er6', subject: 'Computer Science', exam: 'Practical — Python Basics', marks: 18, total: 20, grade: 'A', classAvg: 16, rank: 4 },
];

/* ── Report card ── */
const FALLBACK_REPORT_CARD_TERMS = [
  {
    term: 'Term 1',
    subjects: [
      { subject: 'Mathematics', marks: 85, total: 100, grade: 'A' },
      { subject: 'Science', marks: 82, total: 100, grade: 'A' },
      { subject: 'English', marks: 78, total: 100, grade: 'B+' },
      { subject: 'Hindi', marks: 72, total: 100, grade: 'B+' },
      { subject: 'Social Studies', marks: 88, total: 100, grade: 'A' },
      { subject: 'Computer Science', marks: 90, total: 100, grade: 'A+' },
    ],
    percentage: 82.5,
    rank: 8,
    remarks: 'Aarav is a diligent student with strong analytical skills. Should focus on Hindi comprehension and creative writing. Excellent in Mathematics and Computer Science.',
  },
  {
    term: 'Term 2 (So far)',
    subjects: [
      { subject: 'Mathematics', marks: 38, total: 40, grade: 'A+' },
      { subject: 'Science', marks: 35, total: 40, grade: 'A+' },
      { subject: 'English', marks: 32, total: 40, grade: 'A' },
      { subject: 'Hindi', marks: 28, total: 40, grade: 'B+' },
      { subject: 'Social Studies', marks: 36, total: 40, grade: 'A+' },
      { subject: 'Computer Science', marks: 18, total: 20, grade: 'A' },
    ],
    percentage: 87.2,
    rank: 5,
    remarks: 'Significant improvement across all subjects. Hindi performance improving steadily. Keep up the excellent work in Social Studies.',
  },
];

/* ── Analysis data ── */
type Trend = 'improving' | 'declining' | 'stable';
interface SubjectAnalysisItem { subject: string; scores: number[]; trend: Trend; strength: string; improvement: string; }
const FALLBACK_SUBJECT_ANALYSIS: SubjectAnalysisItem[] = [
  { subject: 'Mathematics', scores: [78, 82, 85, 95], trend: 'improving', strength: 'Problem solving', improvement: 'Word problems' },
  { subject: 'Science', scores: [75, 80, 82, 87], trend: 'improving', strength: 'Lab work & experiments', improvement: 'Theory memorization' },
  { subject: 'English', scores: [72, 74, 78, 80], trend: 'improving', strength: 'Comprehension', improvement: 'Creative writing' },
  { subject: 'Hindi', scores: [68, 65, 72, 70], trend: 'stable', strength: 'Poetry interpretation', improvement: 'Grammar & prose writing' },
  { subject: 'Social Studies', scores: [80, 85, 88, 90], trend: 'improving', strength: 'Map work & analysis', improvement: 'Date-based questions' },
  { subject: 'Computer Science', scores: [88, 85, 90, 90], trend: 'stable', strength: 'Coding & logic', improvement: 'Theory questions' },
];

/* ── Study resources per exam ── */
const FALLBACK_STUDY_RESOURCES = [
  { id: 'sr1', exam: 'Hindi Unit Test', resources: [
    { name: 'Premchand Stories — Summary Notes', type: 'PDF', size: '340 KB' },
    { name: 'Hindi Grammar Quick Reference', type: 'PDF', size: '210 KB' },
    { name: 'Past Year Questions — Hindi UT', type: 'PDF', size: '180 KB' },
  ]},
  { id: 'sr2', exam: 'Mathematics Weekly Test', resources: [
    { name: 'Polynomials — Formula Sheet', type: 'PDF', size: '120 KB' },
    { name: 'Practice Problems Set', type: 'PDF', size: '290 KB' },
    { name: 'Video: Factor & Remainder Theorem', type: 'Link', size: '' },
  ]},
  { id: 'sr3', exam: 'Science Lab Viva', resources: [
    { name: 'Reflection of Light — Lab Manual', type: 'PDF', size: '450 KB' },
    { name: 'Ray Diagram Practice Sheet', type: 'PDF', size: '380 KB' },
    { name: 'Mirror Formula Derivations', type: 'PDF', size: '200 KB' },
  ]},
  { id: 'sr4', exam: 'English Term Exam', resources: [
    { name: 'Beehive Ch 1–6 Summaries', type: 'PDF', size: '520 KB' },
    { name: 'Moments Short Stories Notes', type: 'PDF', size: '410 KB' },
    { name: 'Grammar & Writing Guide', type: 'PDF', size: '300 KB' },
    { name: 'Previous Year Paper 2025', type: 'PDF', size: '280 KB' },
  ]},
];

const subjectColors: Record<string, string> = {
  'Mathematics': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Science': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'English': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Hindi': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Social Studies': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'Computer Science': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

export function StudentConciergeExams() {
  const { activeSubNav } = useNavigationStore();

  const { data: apiExams } = useStudentExams();
  const { data: apiGrades } = useStudentGradesOverview();
  const { data: apiLearningPaths } = useStudentLearningPaths();
  const { data: apiPortfolio } = useStudentPortfolio();

  const upcomingExams = (apiExams as any[]) ?? FALLBACK_UPCOMING_EXAMS;
  const examSchedule = (apiExams as any[])?.map((e: any) => ({ date: e.date, subject: e.subject, time: e.time, type: e.type ?? 'Exam', marks: e.marks ?? e.total ?? 0 })) ?? FALLBACK_EXAM_SCHEDULE;
  const examResults = (apiGrades as any[]) ?? FALLBACK_EXAM_RESULTS;
  const reportCardTerms = (apiGrades as any[])?.length ? (apiGrades as any[]) : FALLBACK_REPORT_CARD_TERMS;
  const subjectAnalysis = (apiPortfolio as any[])?.length ? (apiPortfolio as any[]) : FALLBACK_SUBJECT_ANALYSIS;
  const studyResources = (apiLearningPaths as any[])?.length ? (apiLearningPaths as any[]) : FALLBACK_STUDY_RESOURCES;

  /* ── Upcoming (default) ── */
  if (!activeSubNav || activeSubNav === 'c_upcoming') {
    const examList = (
      <div className="space-y-2">
        <span className="text-xs font-semibold text-foreground">Next 5 Exams</span>
        {upcomingExams.map((e) => (
          <div key={e.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', subjectColors[e.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                  {e.subject}
                </span>
                <h5 className="text-xs font-medium text-foreground">{e.type}</h5>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground mt-2">
              <span className="inline-flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {e.date}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {e.time}</span>
              <span>Room: {e.room}</span>
              <span>Seat: {e.seatNumber}</span>
            </div>
            <p className="mt-1.5 text-[10px] text-foreground/70">Syllabus: {e.syllabus}</p>
          </div>
        ))}
      </div>
    );

    const countdown = (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Exam Countdown</h4>
        <div className="space-y-2">
          {upcomingExams.slice(0, 3).map((e) => {
            const daysLeft = Math.max(0, Math.ceil((new Date(e.date).getTime() - Date.now()) / 86400000));
            return (
              <div key={e.id} className="rounded-xl border border-white/20 bg-white/60 p-3 text-center shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
                <p className={cn('text-2xl font-bold', daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-amber-600' : 'text-primary')}>
                  {daysLeft}
                </p>
                <p className="text-[10px] text-muted-foreground">days to {e.subject} {e.type}</p>
              </div>
            );
          })}
        </div>
      </div>
    );

    return <ConciergeSplitPreviewPanel left={examList} right={countdown} leftLabel="Upcoming Exams" rightLabel="Countdown" />;
  }

  /* ── Schedule ── */
  if (activeSubNav === 'c_schedule') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Exam Timetable</h3>
        <p className="text-xs text-muted-foreground">March – April 2026</p>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-border/30 text-left text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Date</th>
                <th className="pb-2 px-2 font-medium">Subject</th>
                <th className="pb-2 px-2 font-medium">Time</th>
                <th className="pb-2 px-2 font-medium">Type</th>
                <th className="pb-2 pl-2 font-medium text-center">Marks</th>
              </tr>
            </thead>
            <tbody>
              {examSchedule.map((e, i) => (
                <tr key={i} className="border-b border-border/10">
                  <td className="py-2 pr-3 font-medium text-foreground text-xs">{e.date}</td>
                  <td className="py-2 px-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', subjectColors[e.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                      {e.subject}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{e.time}</td>
                  <td className="py-2 px-2 text-muted-foreground">{e.type}</td>
                  <td className="py-2 pl-2 text-center font-medium text-foreground">{e.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── Results ── */
  if (activeSubNav === 'c_results') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Exam Results</h3>
        <div className="space-y-2">
          {examResults.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', subjectColors[r.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                    {r.subject}
                  </span>
                  <h5 className="text-xs font-medium text-foreground">{r.exam}</h5>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">{r.marks}/{r.total}</span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">{r.grade}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1">
                <span>Class Average: {r.classAvg}/{r.total}</span>
                <span>Your Rank: #{r.rank}</span>
                <span className={cn('font-medium', r.marks > r.classAvg ? 'text-emerald-600' : 'text-red-600')}>
                  {r.marks > r.classAvg ? `+${r.marks - r.classAvg} above avg` : `${r.marks - r.classAvg} below avg`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Report Card ── */
  if (activeSubNav === 'c_report_card') {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Report Card — Aarav Mehta, Class 9-B</h3>
        {reportCardTerms.map((term) => (
          <div key={term.term} className="rounded-xl border border-white/20 bg-white/60 p-4 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-foreground">{term.term}</h4>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">{term.percentage}%</span>
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-600">Rank #{term.rank}</span>
              </div>
            </div>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-border/30 text-left text-muted-foreground">
                    <th className="pb-1.5 pr-3 font-medium">Subject</th>
                    <th className="pb-1.5 px-2 font-medium text-center">Marks</th>
                    <th className="pb-1.5 px-2 font-medium text-center">Total</th>
                    <th className="pb-1.5 pl-2 font-medium text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {term.subjects.map((s: any) => (
                    <tr key={s.subject} className="border-b border-border/10">
                      <td className="py-1.5 pr-3">
                        <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium', subjectColors[s.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                          {s.subject}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-center font-medium text-foreground">{s.marks}</td>
                      <td className="py-1.5 px-2 text-center text-muted-foreground">{s.total}</td>
                      <td className="py-1.5 pl-2 text-center">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-bold',
                          s.grade.startsWith('A') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600',
                        )}>{s.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border border-border/20 bg-muted/20 p-2">
              <span className="text-[10px] font-medium text-muted-foreground">Teacher Remarks</span>
              <p className="mt-0.5 text-[10px] text-foreground/80">{term.remarks}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Analysis ── */
  if (activeSubNav === 'c_analysis') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Subject-wise Performance Analysis</h3>
        <p className="text-xs text-muted-foreground">Based on last 4 assessments</p>
        <div className="space-y-2">
          {subjectAnalysis.map((a) => {
            const latest = a.scores[a.scores.length - 1];
            const previous = a.scores[a.scores.length - 2];
            const TrendIcon = a.trend === 'improving' ? TrendingUp : a.trend === 'declining' ? TrendingDown : Minus;
            return (
              <div key={a.subject} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', subjectColors[a.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                      {a.subject}
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
                      a.trend === 'improving' ? 'bg-emerald-500/10 text-emerald-600'
                        : a.trend === 'declining' ? 'bg-red-500/10 text-red-600'
                        : 'bg-zinc-500/10 text-zinc-500',
                    )}>
                      <TrendIcon className="h-2.5 w-2.5" />
                      {a.trend === 'improving' ? 'Improving' : a.trend === 'declining' ? 'Declining' : 'Stable'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground">{latest}%</span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {a.scores.map((s: any, i: any) => (
                    <div key={i} className="flex-1">
                      <div className="h-1.5 w-full rounded-full bg-muted/50 overflow-hidden">
                        <div className={cn('h-full rounded-full', s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${s}%` }} />
                      </div>
                      <p className="mt-0.5 text-center text-[8px] text-muted-foreground">UT{i + 1}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-muted-foreground">Strength: </span>
                    <span className="font-medium text-emerald-600">{a.strength}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Improve: </span>
                    <span className="font-medium text-amber-600">{a.improvement}</span>
                  </div>
                </div>
                {latest > previous && (
                  <p className="mt-1 text-[10px] text-emerald-600 font-medium">+{latest - previous}% improvement from last assessment</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Resources ── */
  if (activeSubNav === 'c_resources') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Study Resources</h3>
        <p className="text-xs text-muted-foreground">Materials organized by upcoming exam</p>
        <div className="space-y-3">
          {studyResources.map((sr) => (
            <div key={sr.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <h4 className="text-xs font-semibold text-foreground mb-2">{sr.exam}</h4>
              <div className="space-y-1.5">
                {sr.resources.map((r: any, i: any) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border/20 bg-background/50 px-3 py-2 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <div>
                        <span className="text-xs font-medium text-foreground">{r.name}</span>
                        {r.size && <span className="ml-2 text-[10px] text-muted-foreground">{r.type} · {r.size}</span>}
                      </div>
                    </div>
                    <button className="inline-flex items-center gap-1 rounded-lg border border-border/50 px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">
                      <Download className="h-2.5 w-2.5" /> {r.type === 'Link' ? 'Open' : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
