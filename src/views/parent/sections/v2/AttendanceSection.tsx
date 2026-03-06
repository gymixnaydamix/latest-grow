import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useParentV2Attendance,
  useParentV2Children,
  useSubmitParentV2AbsenceExplanation,
} from '@/hooks/api/use-parent-v2';
import { EmptyActionState, ParentSectionShell, StatusBadge, UrgentInline } from './shared';
import type { ParentSectionProps } from './shared';
import { formatChildName, formatDateLabel } from './utils';

const STATUS_FILTERS = ['ALL', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;

export function AttendanceSection({ scope, childId }: ParentSectionProps) {
  const { data: rows = [] } = useParentV2Attendance({ scope, childId });
  const { data: children = [] } = useParentV2Children({ scope, childId });
  const explainMutation = useSubmitParentV2AbsenceExplanation();

  const [selectedChildId, setSelectedChildId] = useState<string | null>(childId ?? null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [explanation, setExplanation] = useState('');
  const [attendanceIdToExplain, setAttendanceIdToExplain] = useState<string | null>(null);

  useEffect(() => {
    if (childId) {
      setSelectedChildId(childId);
      return;
    }
    if (!selectedChildId && children[0]?.id) {
      setSelectedChildId(children[0].id);
    }
  }, [childId, children, selectedChildId]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const childMatch = selectedChildId ? row.childId === selectedChildId : true;
        const statusMatch = statusFilter === 'ALL' || row.status === statusFilter;
        return childMatch && statusMatch;
      }),
    [rows, selectedChildId, statusFilter],
  );

  const childRows = useMemo(
    () => rows.filter((row) => (selectedChildId ? row.childId === selectedChildId : true)),
    [rows, selectedChildId],
  );
  const presentCount = childRows.filter((row) => row.status === 'PRESENT').length;
  const absentCount = childRows.filter((row) => row.status === 'ABSENT').length;
  const lateCount = childRows.filter((row) => row.status === 'LATE').length;
  const excusedCount = childRows.filter((row) => row.status === 'EXCUSED').length;
  const attendanceRate = childRows.length > 0 ? Math.round(((presentCount + excusedCount) / childRows.length) * 100) : 100;
  const unexplainedAbsences = childRows.filter(
    (row) => row.status === 'ABSENT' && !row.explanationSubmitted,
  );

  return (
    <ParentSectionShell
      title="Attendance"
      description="Daily attendance records with alerts, remarks, and record-level absence explanation submission."
    >
      {unexplainedAbsences.length > 0 && (
        <UrgentInline
          message={`${unexplainedAbsences.length} absence(s) require parent explanation. Submit reasons to keep records clear.`}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-sky-500/20 bg-sky-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarDays className="size-5 text-sky-600 dark:text-sky-400" />
            <div>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
              <p className="text-xs text-muted-foreground">Attendance rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{presentCount}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="size-5 text-rose-500" />
            <div>
              <p className="text-2xl font-bold">{absentCount}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{lateCount}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{excusedCount}</p>
              <p className="text-xs text-muted-foreground">Excused</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {childId == null && children.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => setSelectedChildId(selectedChildId === child.id ? null : child.id)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              selectedChildId === child.id ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {child.firstName}
          </button>
        ))}
        {childId == null && children.length > 0 && (
          <span className="text-xs text-muted-foreground">|</span>
        )}
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              statusFilter === status ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance History</CardTitle>
          <CardDescription>
            {filteredRows.length} record(s) • {formatChildName(selectedChildId, children, 'All children')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredRows.length === 0 ? (
            <EmptyActionState
              title="No records for this filter"
              message="Adjust the child or status filter to see attendance records."
              ctaLabel="Show all"
              onClick={() => {
                setStatusFilter('ALL');
                setSelectedChildId(null);
              }}
            />
          ) : (
            filteredRows.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/10">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    status={entry.status}
                    tone={entry.status === 'PRESENT' ? 'good' : entry.status === 'ABSENT' ? 'bad' : entry.status === 'LATE' ? 'warn' : 'info'}
                  />
                  <span className="text-sm font-medium">{formatDateLabel(entry.date)}</span>
                  <span className="text-xs text-muted-foreground">• {formatChildName(entry.childId, children, 'Linked child')}</span>
                  {entry.subject && <span className="text-xs text-muted-foreground">• {entry.subject}</span>}
                  {entry.period != null && <span className="text-xs text-muted-foreground">• P{entry.period}</span>}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{entry.note}</p>
                <div className="mt-2 flex items-center gap-2">
                  {entry.status === 'ABSENT' && (
                    entry.explanationSubmitted ? (
                      <Badge className="border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                        {entry.explanationStatus === 'SUBMITTED' ? 'Explanation submitted' : 'Explanation recorded'}
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-600 dark:text-rose-400"
                        onClick={() => setAttendanceIdToExplain(attendanceIdToExplain === entry.id ? null : entry.id)}
                      >
                        Submit explanation
                      </Button>
                    )
                  )}
                  {entry.explanationNote && (
                    <span className="text-xs text-muted-foreground">Reason: {entry.explanationNote}</span>
                  )}
                </div>

                {attendanceIdToExplain === entry.id && (
                  <div className="mt-3 space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Explain absence for {formatDateLabel(entry.date)}
                    </p>
                    <Textarea
                      value={explanation}
                      onChange={(event) => setExplanation(event.target.value)}
                      placeholder="Provide the reason for absence (e.g. medical appointment, family emergency)"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={explanation.trim().length < 8 || explainMutation.isPending}
                        onClick={() => {
                          explainMutation.mutate(
                            { attendanceId: entry.id, note: explanation.trim() },
                            {
                              onSuccess: () => {
                                setExplanation('');
                                setAttendanceIdToExplain(null);
                              },
                            },
                          );
                        }}
                      >
                        Submit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setAttendanceIdToExplain(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
