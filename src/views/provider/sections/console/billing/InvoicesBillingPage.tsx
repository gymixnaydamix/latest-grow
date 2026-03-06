import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  useProviderBillingOverview,
  useRetryProviderInvoice,
} from '@/hooks/api/use-provider-console';
import { Panel, Row, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from '../shared';
import { BillingLoadingState, billingSelectClass, formatCurrency, formatDate } from './shared';

export function InvoicesBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const retryInvoice = useRetryProviderInvoice();
  const [statusFilter, setStatusFilter] = useState('ALL');

  const invoices = useMemo(() => {
    const rows = data?.invoices ?? [];
    return statusFilter === 'ALL' ? rows : rows.filter((row) => row.status === statusFilter);
  }, [data?.invoices, statusFilter]);

  const totals = useMemo(() => {
    const rows = data?.invoices ?? [];
    return {
      total: rows.length,
      paid: rows.filter((row) => row.status === 'PAID').length,
      overdue: rows.filter((row) => row.status === 'OVERDUE' || row.status === 'FAILED').length,
      issued: rows.filter((row) => row.status === 'ISSUED').length,
      billed: rows.reduce((sum, row) => sum + row.amount, 0),
    };
  }, [data?.invoices]);

  async function handleRetry(invoiceId: string, invoiceNumber: string) {
    const reason = reasonPrompt(`Retry invoice ${invoiceNumber}`);
    if (!reason) return;
    try {
      await retryInvoice.mutateAsync({ invoiceId, reason });
      notifySuccess('Retry queued', `${invoiceNumber} has been reprocessed.`);
    } catch (error) {
      notifyError('Retry failed', error instanceof Error ? error.message : 'Unable to retry invoice.');
    }
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={ClipboardList}
        title="Invoices"
        description="Operational invoice ledger with aging, dunning pressure, and recovery actions."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-5">
        <StatCard label="Invoices" value={String(totals.total)} sub="Ledger entries" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Paid" value={String(totals.paid)} sub="Settled invoices" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Issued" value={String(totals.issued)} sub="Awaiting payment" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Overdue" value={String(totals.overdue)} sub="Collection queue" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Billed" value={formatCurrency(totals.billed)} sub="Gross invoice value" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      <Panel
        title="Invoice Ledger"
        subtitle={isLoading ? 'Loading invoices…' : `${invoices.length} invoices in view`}
        action={
          <select className={billingSelectClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All statuses</option>
            <option value="ISSUED">Issued</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="FAILED">Failed</option>
          </select>
        }
      >
        {isLoading ? (
          <BillingLoadingState />
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <Row key={invoice.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{invoice.number}</p>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {invoice.tenantName} · {formatCurrency(invoice.amount)} · Due {formatDate(invoice.dueAt)} · Plan {invoice.planCode}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Aging {invoice.agingDays} day(s) · Risk {invoice.risk}
                      {invoice.dunningStep > 0 ? ` · Dunning step ${invoice.dunningStep}` : ''}
                      {invoice.discountPendingApproval ? ' · Discount pending approval' : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {(invoice.status === 'OVERDUE' || invoice.status === 'FAILED') && (
                      <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => handleRetry(invoice.id, invoice.number)}>
                        Retry Charge
                      </Button>
                    )}
                    {invoice.status === 'PAID' && <span className="text-xs text-emerald-300">Paid {formatDate(invoice.paidAt)}</span>}
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
