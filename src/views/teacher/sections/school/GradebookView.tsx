/* ─── GradebookView ─── Grades, mastery, comments, reports ─────── */
import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses, useCourseGrades, useAssignments } from '@/hooks/api';
import type { Course, Grade, Assignment } from '@root/types';

export function GradebookView({ subNav, schoolId, teacherId }: { subNav: string; schoolId: string | null; teacherId: string | null }) {
  const { data: coursesData, isLoading: coursesLoading } = useCourses(schoolId);
  const allCourses: Course[] = coursesData ?? [];
  const courses = teacherId ? allCourses.filter((c) => c.teacherId === teacherId) : allCourses;
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const activeCourseId = selectedCourseId ?? courses[0]?.id ?? null;

  const { data: gradesData, isLoading: gradesLoading } = useCourseGrades(activeCourseId);
  const grades: Grade[] = gradesData ?? [];
  const { data: assignmentsData, isLoading: assignmentsLoading } = useAssignments(activeCourseId);
  const assignments: Assignment[] = assignmentsData ?? [];

  const gradeTable = useMemo(() => {
    const studentMap = new Map<string, { name: string; grades: Map<string, number> }>();
    for (const g of grades) {
      const studentName = g.studentId;
      if (!studentMap.has(g.studentId)) {
        studentMap.set(g.studentId, { name: studentName, grades: new Map() });
      }
      if (g.assignmentId) studentMap.get(g.studentId)!.grades.set(g.assignmentId, g.score);
    }
    return Array.from(studentMap.entries()).map(([id, data]) => {
      const scoreValues = Array.from(data.grades.values());
      const avg = scoreValues.length > 0 ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length : 0;
      return { studentId: id, name: data.name, gradesByAssignment: data.grades, avg };
    });
  }, [grades]);

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
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (subNav === 'grade_entry') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Grade Entry</h2></div>
        {courseSelector}
        {gradesLoading || assignmentsLoading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : grades.length === 0 ? (
          <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl py-12 text-center">
            <p className="text-sm text-white/40">No grades recorded yet for this course.</p>
          </div>
        ) : (
          <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/6 text-xs text-white/40">
                    <th className="py-2 text-left">Student</th>
                    {assignments.map((a) => (
                      <th key={a.id} className="py-2 text-center" title={a.title}>
                        {a.title.length > 12 ? a.title.slice(0, 12) + '…' : a.title}
                      </th>
                    ))}
                    <th className="py-2 text-center">Average</th>
                  </tr>
                </thead>
                <tbody>
                  {gradeTable.map((s) => (
                    <tr key={s.studentId} className="border-b border-white/6">
                      <td className="py-2 font-medium text-white/80">{s.name}</td>
                      {assignments.map((a) => {
                        const score = s.gradesByAssignment.get(a.id);
                        return (
                          <td key={a.id} className="py-2 text-center">
                            {score != null ? (
                              <span className={score < (a.maxScore * 0.6) ? 'text-rose-400 font-medium' : 'text-white/70'}>{score}</span>
                            ) : (
                              <span className="text-white/20">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 text-center font-bold text-indigo-400">{s.avg.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>
    );
  }

  if (subNav === 'mastery_view') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold text-white/90">Mastery View</h2></div>
        <div className="space-y-3" data-animate>
          {[
            { standard: 'Solve quadratic equations', mastery: 85, from: 'from-emerald-500', to: 'to-teal-600' },
            { standard: 'Graph polynomial functions', mastery: 72, from: 'from-amber-500', to: 'to-orange-600' },
            { standard: 'Apply the Pythagorean theorem', mastery: 92, from: 'from-indigo-500', to: 'to-violet-600' },
            { standard: 'Interpret statistical models', mastery: 68, from: 'from-rose-500', to: 'to-pink-600' },
          ].map((s) => (
            <div key={s.standard} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">{s.standard}</span>
                <span className={`font-bold ${s.mastery >= 80 ? 'text-emerald-400' : s.mastery >= 70 ? 'text-amber-400' : 'text-rose-400'}`}>{s.mastery}%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/5">
                <div className={`h-full rounded-full bg-gradient-to-r ${s.from} ${s.to}`} style={{ width: `${s.mastery}%` }} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (subNav === 'comment_bank') {
    return (
      <>
        <div className="flex items-center justify-between" data-animate>
          <h2 className="text-lg font-semibold text-white/90">Comment Bank</h2>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white"><Plus className="mr-1 size-3" /> Add Comment</Button>
        </div>
        <div className="space-y-2" data-animate>
          {[
            { category: 'Positive', comment: 'Excellent work! Shows deep understanding of the material.', uses: 42 },
            { category: 'Improvement', comment: 'Needs to show more work in solving problems step by step.', uses: 28 },
            { category: 'Positive', comment: 'Great participation in class discussions.', uses: 35 },
            { category: 'Concern', comment: 'Missing several assignments. Please schedule a meeting.', uses: 15 },
          ].map((c, i) => (
            <div key={i} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center justify-between">
              <div className="flex-1">
                <Badge variant="outline" className={`text-[10px] mb-1 ${c.category === 'Positive' ? 'border-emerald-500/30 text-emerald-400' : c.category === 'Concern' ? 'border-rose-500/30 text-rose-400' : 'border-amber-500/30 text-amber-400'}`}>{c.category}</Badge>
                <p className="text-sm text-white/70">{c.comment}</p>
              </div>
              <span className="text-xs text-white/30 ml-3">{c.uses} uses</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Default: reports
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold text-white/90">Gradebook Reports</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {[
          { label: 'Class Average', value: '84.6%', color: 'text-indigo-400' },
          { label: 'Highest Grade', value: '98%', color: 'text-emerald-400' },
          { label: 'Lowest Grade', value: '52%', color: 'text-rose-400' },
          { label: 'Assignments Graded', value: '145', color: 'text-amber-400' },
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
