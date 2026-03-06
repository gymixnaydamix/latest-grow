import { useMemo } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  useDecideProviderBillingApproval,
  useProviderBillingOverview,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, Row, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from '../shared';
import { BillingLoadingState, formatCurrency, formatDate } from './shared';

export function ApprovalsBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const decideApproval = useDecideProviderBillingApproval();

  const approvals = data?.approvals ?? [];
  const pending = useMemo(() => approvals.filter((approval) => approval.status === 'PENDING'), [approvals]);
  const approved = approvals.filter((approval) => approval.status === 'APPROVED').length;
  const rejected = approvals.filter((approval) => approval.status === 'REJECTED').length;
  const pendingValue = pending.reduce((sum, approval) => sum + approval.impactAmount, 0);

  async function handleDecision(approvalId: string, decision: 'APPROVED' | 'REJECTED') {
    const reason = reasonPrompt(`${decision === 'APPROVED' ? 'Approve' : 'Reject'} billing approval`);
    if (!reason) return;
    try {
      await decideApproval.mutateAsync({ approvalId, decision, reason });
      notifySuccess('Approval updated', `Request has been ${decision.toLowerCase()}.`);
    } catch (error) {
      notifyError('Approval failed', error instanceof Error ? error.message : 'Unable to update approval.');
    }
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Bell}
        title="Approvals"
        description="Discount exceptions and billing write-off approvals requiring explicit review."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Requests" value={String(approvals.length)} sub="Total history" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Pending" value={String(pending.length)} sub="Awaiting decision" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Approved" value={String(approved)} sub="Accepted actions" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Pending Impact" value={formatCurrency(pendingValue)} sub="Potential revenue change" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Decision Queue" subtitle={isLoading ? 'Loading approval queue…' : `${pending.length} requests pending review`} accentBorder="border-violet-500/20">
          {isLoading ? (
            <BillingLoadingState className="text-violet-400" />
          ) : pending.length === 0 ? (
            <EmptyState icon={Bell} title="No Pending Approvals" description="All billing exceptions have already been processed." />
          ) : (
            <div className="space-y-2">
              {pending.map((approval) => (
                <div key={approval.id} className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-3 text-xs">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">{approval.invoiceNumber} · {approval.tenantName}</p>
                      <p className="mt-1 text-violet-200">
                        {approval.type} · Impact {formatCurrency(approval.impactAmount)} on {formatCurrency(approval.invoiceAmount)}
                      </p>
                      <p className="mt-1 text-slate-400">
                        Requested by {approval.requestedBy} on {formatDate(approval.requestedAt)}
                      </p>
                      <p className="mt-2 text-slate-300">{approval.note}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="h-7 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleDecision(approval.id, 'APPROVED')}>
                        Approve
                      </Button>
                      <Button size="sm" className="h-7 bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => handleDecision(approval.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Decision History" subtitle="Latest processed approval outcomes">
          {isLoading ? (
            <BillingLoadingState />
          ) : (
            <div className="space-y-2">
              {approvals
                .filter((approval) => approval.status !== 'PENDING')
                .slice(0, 6)
                .map((approval) => (
                  <Row key={approval.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-100">{approval.invoiceNumber}</p>
                        <p className="text-xs text-slate-400">{approval.tenantName} · {formatCurrency(approval.impactAmount)}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={approval.status} />
                        <p className="mt-1 text-[11px] text-slate-400">{formatDate(approval.decidedAt)}</p>
                      </div>
                    </div>
                  </Row>
                ))}
              {approvals.length > 0 && rejected > 0 && (
                <p className="pt-1 text-[11px] text-slate-400">{rejected} request(s) rejected to protect revenue guardrails.</p>
              )}
            </div>
          )}
        </Panel>
      </div>
    </SectionShell>
  );
}
