/* ─── GradesPage ─── Grade overview across subjects ───────────────── */
import { useState } from 'react';
import { TrendingUp, TrendingDown, Filter, Download, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { GradeIndicator } from '@/components/features/GradeIndicator';import { useStudentGrades } from '@/hooks/api/use-academic';
import { useAuthStore } from '@/store/auth.store';
interface GradeEntry {
  id: string;
  subject: string;
  assignment: string;
  score: number;
  maxScore: number;
  date: string;
  type: 'exam' | 'quiz' | 'homework' | 'project';
  weight: number;
}

const FALLBACK_GRADES: GradeEntry[] = [
  { id: '1', subject: 'Mathematics', assignment: 'Midterm Exam', score: 92, maxScore: 100, date: '2025-03-15', type: 'exam', weight: 30 },
  { id: '2', subject: 'Mathematics', assignment: 'Homework Ch.5', score: 18, maxScore: 20, date: '2025-03-10', type: 'homework', weight: 5 },
  { id: '3', subject: 'English', assignment: 'Essay: Modern Literature', score: 85, maxScore: 100, date: '2025-03-12', type: 'project', weight: 20 },
  { id: '4', subject: 'English', assignment: 'Vocabulary Quiz', score: 9, maxScore: 10, date: '2025-03-08', type: 'quiz', weight: 5 },
  { id: '5', subject: 'Science', assignment: 'Lab Report: Density', score: 78, maxScore: 100, date: '2025-03-14', type: 'project', weight: 15 },
  { id: '6', subject: 'Science', assignment: 'Chapter 4 Test', score: 88, maxScore: 100, date: '2025-03-06', type: 'exam', weight: 25 },
  { id: '7', subject: 'History', assignment: 'Research Paper', score: 95, maxScore: 100, date: '2025-03-11', type: 'project', weight: 20 },
  { id: '8', subject: 'Art', assignment: 'Portfolio Review', score: 91, maxScore: 100, date: '2025-03-13', type: 'project', weight: 40 },
];

const TYPE_COLORS: Record<string, string> = {
  exam: 'bg-red-400/10 text-red-400',
  quiz: 'bg-amber-400/10 text-amber-400',
  homework: 'bg-indigo-400/10 text-indigo-400',
  project: 'bg-emerald-400/10 text-emerald-400',
};

export default function GradesPage() {
  const containerRef = useStaggerAnimate();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const { user } = useAuthStore();
  const { data: apiGrades } = useStudentGrades(user?.id ?? null);

  const MOCK_GRADES: GradeEntry[] = (apiGrades as any[])?.map((g: any) => ({
    id: g.id, subject: g.courseName ?? g.subject ?? '', assignment: g.assignmentTitle ?? g.assignment ?? '',
    score: Number(g.score ?? 0), maxScore: Number(g.maxScore ?? 100),
    date: g.gradedAt ?? g.date ?? '', type: (g.type ?? 'homework') as GradeEntry['type'],
    weight: Number(g.weight ?? 10),
  })) ?? FALLBACK_GRADES;

  const subjects = [...new Set(MOCK_GRADES.map((g) => g.subject))];
  const filtered = filterSubject === 'all' ? MOCK_GRADES : MOCK_GRADES.filter((g) => g.subject === filterSubject);

  const avg = Math.round(MOCK_GRADES.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / (MOCK_GRADES.length || 1));

  // GPA by subject
  const subjectAvgs = subjects.map((subj) => {
    const items = MOCK_GRADES.filter((g) => g.subject === subj);
    const a = Math.round(items.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / items.length);
    return { subject: subj, average: a };
  });

  return (
    <div ref={containerRef} className="flex flex-col gap-6 p-4">
      {/* Summary cards */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Overall GPA</span>
            <GradeIndicator value={avg} size="lg" showPercentage />
          </CardContent>
        </Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase">Assignments</span>
            <span className="text-2xl font-bold text-white/90 tabular-nums">{MOCK_GRADES.length}</span>
          </CardContent>
        </Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase">Highest</span>
            <span className="text-2xl font-bold text-emerald-400 tabular-nums">
              {Math.max(...MOCK_GRADES.map((g) => Math.round((g.score / g.maxScore) * 100)))}%
            </span>
          </CardContent>
        </Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase">Subjects</span>
            <span className="text-2xl font-bold text-white/90 tabular-nums">{subjects.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Subject breakdown */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {subjectAvgs.map((s) => (
          <Card key={s.subject} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-1.5 p-3">
              <span className="text-[10px] text-white/40 font-medium">{s.subject}</span>
              <GradeIndicator value={s.average} showPercentage />
              <div className="flex items-center gap-0.5">
                {s.average >= avg ? (
                  <TrendingUp className="size-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="size-3 text-red-400" />
                )}
                <span className={cn('text-[10px]', s.average >= avg ? 'text-emerald-400' : 'text-red-400')}>
                  {s.average >= avg ? 'Above' : 'Below'} avg
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter bar & table */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white/90 text-base flex items-center gap-2">
              <BarChart3 className="size-4 text-indigo-400" />Grade Book
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Filter className="size-3 text-white/30" />
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  className="rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[11px] text-white/60 outline-none"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Button variant="outline" size="sm" className="text-xs border-white/10 text-white/50 gap-1 h-7">
                <Download className="size-3" />Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6 text-white/40">
                  <th className="px-3 py-2 text-left font-medium">Subject</th>
                  <th className="px-3 py-2 text-left font-medium">Assignment</th>
                  <th className="px-3 py-2 text-center font-medium">Type</th>
                  <th className="px-3 py-2 text-center font-medium">Score</th>
                  <th className="px-3 py-2 text-center font-medium">Grade</th>
                  <th className="px-3 py-2 text-center font-medium">Weight</th>
                  <th className="px-3 py-2 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => {
                  const pct = Math.round((g.score / g.maxScore) * 100);
                  return (
                    <tr key={g.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                      <td className="px-3 py-2.5 text-white/70 font-medium">{g.subject}</td>
                      <td className="px-3 py-2.5 text-white/60">{g.assignment}</td>
                      <td className="px-3 py-2.5 text-center">
                        <Badge className={cn('border-0 text-[9px] capitalize', TYPE_COLORS[g.type])}>{g.type}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center text-white/60 font-mono tabular-nums">
                        {g.score}/{g.maxScore}
                      </td>
                      <td className="px-3 py-2.5 flex justify-center">
                        <GradeIndicator value={pct} size="sm" />
                      </td>
                      <td className="px-3 py-2.5 text-center text-white/40">{g.weight}%</td>
                      <td className="px-3 py-2.5 text-right text-white/30">{new Date(g.date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
