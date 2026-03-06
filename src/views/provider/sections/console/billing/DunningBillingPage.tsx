import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  useProviderBillingOverview,
  useRetryProviderInvoice,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, Row, SectionPageHeader, SectionShell, StatCard, getAccent, reasonPrompt } from '../shared';
import { BillingLoadingState, formatCurrency, formatDate } from './shared';

export function DunningBillingPage() {
  const accent = getAccent('provider_billing');
  const { data, isLoading } = useProviderBillingOverview();
  const retryInvoice = useRetryProviderInvoice();

  const dunningInvoices = useMemo(
    () => (data?.invoices ?? []).filter((invoice) => invoice.dunningStep > 0 || invoice.status === 'FAILED' || invoice.status === 'OVERDUE'),
    [data?.invoices],
  );
  const avgStep = dunningInvoices.length > 0 ? Math.round(dunningInvoices.reduce((sum, invoice) => sum + invoice.dunningStep, 0) / dunningInvoices.length) : 0;
  const atRisk = dunningInvoices.reduce((sum, invoice) => sum + invoice.outstandingBalance, 0);
  const maxAging = dunningInvoices.length > 0 ? Math.max(...dunningInvoices.map((invoice) => invoice.agingDays)) : 0;

  async function handleRetry(invoiceId: string, invoiceNumber: string) {
    const reason = reasonPrompt(`Retry invoice ${invoiceNumber}`);
    if (!reason) return;
    try {
      await retryInvoice.mutateAsync({ invoiceId, reason });
      notifySuccess('Dunning step advanced', `${invoiceNumber} has been retried.`);
    } catch (error) {
      notifyError('Retry failed', error instanceof Error ? error.message : 'Unable to retry invoice.');
    }
  }

  return (
    <SectionShell>
      <SectionPageHeader
        icon={AlertTriangle}
        title="Dunning"
        description="Recovery workflow across failed, overdue, and grace-period invoices."
        accent={accent}
      />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="In Dunning" value={String(dunningInvoices.length)} sub="Active recovery cases" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Avg Step" value={avgStep > 0 ? String(avgStep) : '—'} sub="Current ladder depth" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="At Risk" value={formatCurrency(atRisk)} sub="Outstanding balance" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Max Aging" value={maxAging > 0 ? `${maxAging}d` : '—'} sub="Oldest unpaid item" gradient="from-cyan-500/10 to-cyan-500/5" />
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.7fr_1fr]">
        <Panel title="Recovery Queue" subtitle={isLoading ? 'Loading dunning cases…' : `${dunningInvoices.length} invoices requiring intervention`} accentBorder="border-amber-500/20">
          {isLoading ? (
            <BillingLoadingState className="text-amber-400" />
          ) : dunningInvoices.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No Active Dunning" description="Current billing recovery queue is empty." />
          ) : (
            <div className="space-y-2">
              {dunningInvoices.map((invoice) => (
                <Row key={invoice.id} className="border-amber-500/15">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">{invoice.number} · {invoice.tenantName}</p>
                      <p className="mt-1 text-xs text-amber-200">
                        Step {invoice.dunningStep || 1} · {invoice.retryCount} retries · {formatCurrency(invoice.outstandingBalance)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Due {formatDate(invoice.dueAt)} · Aging {invoice.agingDays} day(s)
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className={`h-2 w-5 rounded-sm ${index < Math.max(invoice.dunningStep, 1) ? 'bg-amber-500' : 'bg-slate-700'}`} />
                        ))}
                      </div>
                      <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => handleRetry(invoice.id, invoice.number)}>
                        Retry
                      </Button>
                    </div>
                  </div>
                </Row>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Step Heatmap" subtitle="Live exposure by recovery stage">
          {isLoading ? (
            <BillingLoadingState />
          ) : (
            <div className="space-y-3">
              {data?.analytics.dunningByStep.map((entry) => (
                <div key={entry.step}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-100">Step {entry.step}</span>
                    <span className="text-slate-400">{entry.count} invoice(s) · {formatCurrency(entry.amount)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-red-500"
                      style={{ width: `${Math.min(entry.count * 25, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </SectionShell>
  );
}
