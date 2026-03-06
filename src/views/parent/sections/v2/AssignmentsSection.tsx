import { useMemo, useState } from 'react';
import { AlertTriangle, BookOpen, CheckCircle2, Clock, FileText, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useParentV2Assignments } from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, formatDateLabel, parentAssignmentsDemo } from './parent-v2-demo-data';
import type { ParentAssignmentDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge, UrgentInline } from './shared';
import type { ParentSectionProps } from './shared';

const STATUS_FILTERS = ['ALL', 'NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'GRADED', 'MISSING', 'LATE'] as const;

function statusTone(status: string): 'good' | 'warn' | 'bad' | 'info' | 'neutral' {
  if (status === 'GRADED' || status === 'SUBMITTED') return 'good';
  if (status === 'IN_PROGRESS' || status === 'NOT_STARTED') return 'warn';
  return 'bad';
}

export function AssignmentsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawAssignments } = useParentV2Assignments({ scope, childId });
  const allRows: ParentAssignmentDemo[] = (rawAssignments as ParentAssignmentDemo[] | undefined) ?? filterByChild(parentAssignmentsDemo, childId, scope);

  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      allRows.filter((row) => {
        const statusMatch = statusFilter === 'ALL' || row.status === statusFilter;
        const searchMatch =
          query.trim().length === 0 ||
          `${row.title} ${row.subject} ${childDisplayName(row.childId)}`.toLowerCase().includes(query.toLowerCase());
        return statusMatch && searchMatch;
      }),
    [allRows, statusFilter, query],
  );

  const counts = {
    total: allRows.length,
    missing: allRows.filter((r) => r.status === 'MISSING').length,
    late: allRows.filter((r) => r.status === 'LATE').length,
    graded: allRows.filter((r) => r.status === 'GRADED').length,
    submitted: allRows.filter((r) => r.status === 'SUBMITTED').length,
  };

  return (
    <ParentSectionShell
      title="Assignments"
      description="Track due-soon, overdue, missing, submitted, and graded assignments for each child."
    >
      {/* Urgent */}
      {counts.missing > 0 && (
        <UrgentInline message={`${counts.missing} missing assignment(s) need attention now.`} />
      )}

      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <BookOpen className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{counts.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className={counts.missing > 0 ? 'border-red-500/20 bg-red-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="size-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{counts.missing}</p>
              <p className="text-xs text-muted-foreground">Missing</p>
            </div>
          </CardContent>
        </Card>
        <Card className={counts.late > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{counts.late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{counts.submitted}</p>
              <p className="text-xs text-muted-foreground">Submitted</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="size-5 text-violet-500" />
            <div>
              <p className="text-2xl font-bold">{counts.graded}</p>
              <p className="text-xs text-muted-foreground">Graded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((status) => (
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
          placeholder="Search title, subject, child..."
        />
      </div>

      {/* Assignment List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Assignment Tracker</CardTitle>
          <CardDescription>{rows.length} assignment(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <EmptyActionState title="Nothing here" message="No assignments match your filter." ctaLabel="Show all" onClick={() => { setStatusFilter('ALL'); setQuery(''); }} />
          ) : (
            rows.map((row) => {
              const isDueSoon = row.status !== 'GRADED' && row.status !== 'SUBMITTED' && new Date(row.dueDate) <= new Date(Date.now() + 2 * 86400000);
              return (
                <div
                  key={row.id}
                  className={`rounded-lg border p-4 transition-all ${
                    row.status === 'MISSING' ? 'border-red-500/40 bg-red-500/5' : isDueSoon ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{row.title}</p>
                        {isDueSoon && row.status !== 'MISSING' && <Badge className="border-amber-500/40 bg-amber-500/10 text-xs text-amber-700 dark:text-amber-300">DUE SOON</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {row.subject} • {childDisplayName(row.childId)} • Due {formatDateLabel(row.dueDate)}
                      </p>
                    </div>
                    <StatusBadge status={row.status} tone={statusTone(row.status)} />
                  </div>

                  {/* Teacher instruction */}
                  <p className="mt-2 text-sm text-muted-foreground">{row.teacherInstruction}</p>

                  {/* Submission & grade info */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {row.attachmentCount > 0 && (
                      <span className="flex items-center gap-1"><Paperclip className="size-3" />{row.attachmentCount} file(s)</span>
                    )}
                    {'submittedAt' in row && row.submittedAt && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        Submitted {formatDateLabel(row.submittedAt as string)}
                      </span>
                    )}
                    {'grade' in row && row.grade != null && (
                      <Badge variant="outline" className="text-xs font-semibold">
                        {row.grade}/{('maxGrade' in row && row.maxGrade) || '?'}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
