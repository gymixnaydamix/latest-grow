import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck, FileText, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useDecideParentV2Approval, useParentV2Approvals } from '@/hooks/api/use-parent-v2';
import { childDisplayName, formatDateLabel } from './parent-v2-demo-data';
import type { ParentApprovalDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, PriorityBadge, StatusBadge, UrgentInline } from './shared';
import type { ParentSectionProps } from './shared';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const;

export function ApprovalsFormsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawRows } = useParentV2Approvals({ scope, childId });
  const decisionMutation = useDecideParentV2Approval();

  const allRows: ParentApprovalDemo[] = (rawRows as ParentApprovalDemo[] | undefined) ?? [];
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');

  const rows = useMemo(
    () => allRows.filter((r) => statusFilter === 'ALL' || r.status === statusFilter),
    [allRows, statusFilter],
  );

  const counts = { pending: allRows.filter((r) => r.status === 'PENDING').length, approved: allRows.filter((r) => r.status === 'APPROVED').length, rejected: allRows.filter((r) => r.status === 'REJECTED').length };
  const overduePending = allRows.filter((r) => r.status === 'PENDING' && new Date(r.dueDate) <= new Date());

  return (
    <ParentSectionShell
      title="Approvals & Forms"
      description="Consent forms, permission slips, acknowledgements, and deadline-based approvals."
    >
      {/* Urgent */}
      {overduePending.length > 0 && (
        <UrgentInline message={`${overduePending.length} form(s) overdue — immediate action required.`} />
      )}

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className={counts.pending > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <ClipboardCheck className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{counts.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{counts.approved}</p>
              <p className="text-xs text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <XCircle className="size-5 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{counts.rejected}</p>
              <p className="text-xs text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              statusFilter === s ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Forms & Requests</CardTitle>
          <CardDescription>{rows.length} item(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <EmptyActionState title="No items" message="No forms match the current filter." ctaLabel="Show all" onClick={() => setStatusFilter('ALL')} />
          ) : (
            rows.map((row) => {
              const isOverdue = row.status === 'PENDING' && new Date(row.dueDate) <= new Date();
              const isExpanded = expandedId === row.id;
              return (
                <div
                  key={row.id}
                  className={`rounded-lg border p-4 transition-all ${
                    isOverdue ? 'border-red-500/40 bg-red-500/5' : 'border-border/60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <p className="text-sm font-semibold">{row.title}</p>
                        {isOverdue && <Badge variant="destructive" className="text-xs">OVERDUE</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {childDisplayName(row.childId)} • {row.type} • Due {formatDateLabel(row.dueDate)}
                      </p>
                      {'requestedBy' in row && row.requestedBy && (
                        <p className="text-xs text-muted-foreground">Requested by {row.requestedBy}{row.requestedAt ? ` on ${formatDateLabel(row.requestedAt)}` : ''}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <PriorityBadge priority={row.priority} />
                      <StatusBadge
                        status={row.status}
                        tone={row.status === 'APPROVED' ? 'good' : row.status === 'REJECTED' ? 'bad' : 'warn'}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  {'description' in row && row.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{row.description}</p>
                  )}

                  {/* Actions for PENDING */}
                  {row.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : row.id)}
                        className="mt-2 text-xs font-medium text-primary hover:underline"
                      >
                        {isExpanded ? 'Collapse' : 'Take action →'}
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3">
                          <Textarea
                            value={notesById[row.id] ?? ''}
                            onChange={(event) =>
                              setNotesById((prev) => ({ ...prev, [row.id]: event.target.value }))
                            }
                            placeholder="Optional note for school record"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              disabled={decisionMutation.isPending}
                              onClick={() =>
                                decisionMutation.mutate({
                                  approvalRequestId: row.id,
                                  decision: 'APPROVED',
                                  note: notesById[row.id],
                                })
                              }
                              className="gap-1.5"
                            >
                              <CheckCircle2 className="size-3.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={decisionMutation.isPending}
                              onClick={() =>
                                decisionMutation.mutate({
                                  approvalRequestId: row.id,
                                  decision: 'REJECTED',
                                  note: notesById[row.id],
                                })
                              }
                              className="gap-1.5"
                            >
                              <XCircle className="size-3.5" /> Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Decision badge for completed items */}
                  {row.status !== 'PENDING' && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      {row.status === 'APPROVED' ? (
                        <CheckCircle2 className="size-3 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="size-3 text-red-500" />
                      )}
                      <span>Decision recorded</span>
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
