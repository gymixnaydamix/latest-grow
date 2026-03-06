import { useMemo, useState } from 'react';
import { Award, BarChart3, Download, TrendingDown, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParentV2Grades } from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, formatDateLabel, parentGradesDemo } from './parent-v2-demo-data';
import type { ParentGradeDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell } from './shared';
import type { ParentSectionProps } from './shared';

function gradeColor(pct: number): string {
  if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400';
  if (pct >= 80) return 'text-sky-600 dark:text-sky-400';
  if (pct >= 70) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function gradeBarColor(pct: number): string {
  if (pct >= 90) return 'bg-emerald-500';
  if (pct >= 80) return 'bg-sky-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-red-500';
}

export function GradesReportCardsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawGrades } = useParentV2Grades({ scope, childId });
  const allRows: ParentGradeDemo[] = (rawGrades as ParentGradeDemo[] | undefined) ?? filterByChild(parentGradesDemo, childId, scope);

  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');

  const subjects = useMemo(() => ['ALL', ...new Set(allRows.map((r) => r.subject))], [allRows]);

  const rows = useMemo(
    () =>
      allRows.filter((row) => {
        const subMatch = subjectFilter === 'ALL' || row.subject === subjectFilter;
        const queryMatch =
          query.trim().length === 0 ||
          `${row.subject} ${row.assessment} ${childDisplayName(row.childId)}`.toLowerCase().includes(query.toLowerCase());
        return subMatch && queryMatch;
      }),
    [allRows, query, subjectFilter],
  );

  const avgPct = allRows.length > 0 ? Math.round(allRows.reduce((s, r) => s + (r.score / r.maxScore) * 100, 0) / allRows.length) : 0;
  const highestPct = allRows.length > 0 ? Math.round(Math.max(...allRows.map((r) => (r.score / r.maxScore) * 100))) : 0;
  const lowestPct = allRows.length > 0 ? Math.round(Math.min(...allRows.map((r) => (r.score / r.maxScore) * 100))) : 0;

  return (
    <ParentSectionShell
      title="Grades & Report Cards"
      description="Assessment outcomes, teacher feedback, strengths tracking, and transcript downloads."
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5"><BarChart3 className="size-3.5" /> Report cards</Button>
          <Button size="sm" variant="outline" className="gap-1.5"><Download className="size-3.5" /> Transcript</Button>
        </div>
      }
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Award className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Graded items</p>
            </div>
          </CardContent>
        </Card>
        <Card className={avgPct >= 80 ? 'border-emerald-500/20 bg-emerald-500/5' : avgPct >= 70 ? '' : 'border-red-500/20 bg-red-500/5'}>
          <CardContent className="flex items-center gap-3 p-4">
            <BarChart3 className="size-5 text-violet-500" />
            <div>
              <p className={`text-2xl font-bold ${gradeColor(avgPct)}`}>{avgPct}%</p>
              <p className="text-xs text-muted-foreground">Average</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingUp className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-emerald-600">{highestPct}%</p>
              <p className="text-xs text-muted-foreground">Highest</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <TrendingDown className="size-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">{lowestPct}%</p>
              <p className="text-xs text-muted-foreground">Lowest</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Filter + Search */}
      <div className="flex flex-wrap items-center gap-2">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubjectFilter(s)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              subjectFilter === s ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {s}
          </button>
        ))}
        <Input
          className="max-w-xs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search subject, assessment, child..."
        />
      </div>

      {/* Grade Entries */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Grade Entries</CardTitle>
          <CardDescription>{rows.length} record(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <EmptyActionState title="No grades" message="No grades match your filter." ctaLabel="Show all" onClick={() => { setSubjectFilter('ALL'); setQuery(''); }} />
          ) : (
            rows.map((grade) => {
              const percentage = Math.round((grade.score / grade.maxScore) * 100);
              return (
                <div key={grade.id} className="rounded-lg border border-border/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{grade.assessment}</p>
                        {'type' in grade && grade.type && (
                          <Badge variant="outline" className="text-xs">{grade.type as string}</Badge>
                        )}
                        {'letterGrade' in grade && grade.letterGrade && (
                          <Badge className={`text-xs font-bold ${
                            percentage >= 90 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' :
                            percentage >= 80 ? 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300' :
                            percentage >= 70 ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300' :
                            'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300'
                          }`}>{grade.letterGrade as string}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {grade.subject} • {childDisplayName(grade.childId)} • Graded {formatDateLabel(grade.gradedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${gradeColor(percentage)}`}>{grade.score}/{grade.maxScore}</span>
                      <span className={`text-sm ${gradeColor(percentage)}`}>({percentage}%)</span>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted/50">
                    <div className={`h-full rounded-full transition-all ${gradeBarColor(percentage)}`} style={{ width: `${percentage}%` }} />
                  </div>

                  {/* Teacher feedback */}
                  <p className="mt-2 text-sm text-muted-foreground">{grade.teacherFeedback}</p>

                  {/* Strengths & Areas for Improvement */}
                  {grade.strengths && (
                    <p className="mt-2 text-xs"><span className="font-medium text-emerald-600">Strengths:</span> {grade.strengths}</p>
                  )}
                  {grade.areasForImprovement && (
                    <p className="mt-1 text-xs"><span className="font-medium text-amber-600">Improve:</span> {grade.areasForImprovement}</p>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
