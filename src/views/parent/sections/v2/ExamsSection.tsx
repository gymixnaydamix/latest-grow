import { useMemo, useState } from 'react';
import { Award, BookOpen, Calendar, Clock, MapPin, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useParentV2Exams } from '@/hooks/api/use-parent-v2';
import { childDisplayName, formatDateLabel } from './parent-v2-demo-data';
import type { ParentExamDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';

const STATUS_OPTIONS = ['ALL', 'UPCOMING', 'COMPLETED', 'RESULT_PUBLISHED'] as const;

function daysDiff(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export function ExamsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawData } = useParentV2Exams({ scope, childId });
  const allRows: ParentExamDemo[] = (rawData as ParentExamDemo[] | undefined) ?? [];

  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]>('ALL');
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      allRows.filter((row) => {
        const statusMatch = statusFilter === 'ALL' || row.status === statusFilter;
        const queryMatch =
          query.trim().length === 0 ||
          `${row.title} ${row.subject} ${childDisplayName(row.childId)}`.toLowerCase().includes(query.toLowerCase());
        return statusMatch && queryMatch;
      }),
    [allRows, statusFilter, query],
  );

  const upcoming = allRows.filter((r) => r.status === 'UPCOMING');
  const published = allRows.filter((r) => r.status === 'RESULT_PUBLISHED');
  const nextExam = upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <ParentSectionShell
      title="Exams"
      description="Exam timetable, venue details, instructions, countdown, and result scores."
      actions={
        <Button size="sm" variant="outline" className="gap-1.5"><Printer className="size-3.5" /> Print schedule</Button>
      }
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BookOpen className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Total exams</p>
            </div>
          </CardContent>
        </Card>
        <Card className={upcoming.length > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Award className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{published.length}</p>
              <p className="text-xs text-muted-foreground">Results out</p>
            </div>
          </CardContent>
        </Card>
        {nextExam && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Next Exam</p>
              <p className="text-sm font-semibold">{nextExam.subject}</p>
              <p className="text-xs text-primary">{daysDiff(nextExam.date) > 0 ? `${daysDiff(nextExam.date)} day(s) away` : 'Today!'} • {formatDateLabel(nextExam.date)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              statusFilter === status ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {status.replace(/_/g, ' ')}
          </button>
        ))}
        <Input
          className="max-w-xs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search exam, subject, child..."
        />
      </div>

      {/* Exam List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Exam Planner</CardTitle>
          <CardDescription>{rows.length} exam(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <EmptyActionState title="No exams" message="No exams match your filter." ctaLabel="Show all" onClick={() => { setStatusFilter('ALL'); setQuery(''); }} />
          ) : (
            rows.map((exam) => {
              const daysLeft = daysDiff(exam.date);
              return (
                <div
                  key={exam.id}
                  className={`rounded-lg border p-4 transition-all ${
                    exam.status === 'UPCOMING' && daysLeft <= 3 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{exam.title}</p>
                        {exam.status === 'UPCOMING' && daysLeft <= 3 && daysLeft > 0 && (
                          <Badge className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300">{daysLeft}d left</Badge>
                        )}
                        {exam.status === 'UPCOMING' && daysLeft === 0 && (
                          <Badge variant="destructive" className="text-xs">TODAY</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {exam.subject} • {childDisplayName(exam.childId)}
                      </p>
                    </div>
                    <StatusBadge status={exam.status} tone={exam.status === 'UPCOMING' ? 'warn' : exam.status === 'RESULT_PUBLISHED' ? 'info' : 'good'} />
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="size-3" />{formatDateLabel(exam.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="size-3" />{exam.startTime} – {exam.endTime}</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3" />Room {exam.room}</span>
                  </div>

                  {/* Instructions */}
                  {'instructions' in exam && exam.instructions && (
                    <p className="mt-2 rounded bg-muted/30 px-2 py-1 text-xs text-muted-foreground">📋 {exam.instructions}</p>
                  )}

                  {/* Results for published */}
                  {exam.status === 'RESULT_PUBLISHED' && exam.resultScore != null && exam.resultMax != null && (
                    <div className="mt-2 flex items-center gap-3">
                      <Badge variant="outline" className="text-sm font-bold">
                        {exam.resultScore}/{exam.resultMax}
                      </Badge>
                      <span className={`text-xs font-medium ${
                        Math.round((exam.resultScore / exam.resultMax) * 100) >= 85 ? 'text-emerald-600' : Math.round((exam.resultScore / exam.resultMax) * 100) >= 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {Math.round((exam.resultScore / exam.resultMax) * 100)}%
                      </span>
                    </div>
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
