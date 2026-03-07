import { useMemo, useState } from 'react';
import { CreditCard, DollarSign, Download, Eye, FileText, Receipt, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useParentV2Invoices, useParentV2Payments } from '@/hooks/api/use-parent-v2';
import {
  childDisplayName,
  filterByChild,
  parentInvoicesDemo as FALLBACK_INVOICES,
  parentPaymentsDemo as FALLBACK_PAYMENTS,
  parentReceiptsDemo as FALLBACK_RECEIPTS,
  formatDateLabel,
} from './parent-v2-demo-data';
import type { ParentInvoiceDemo, ParentPaymentDemo, ParentReceiptDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';
import { formatCurrency } from './utils';

type Tab = 'invoices' | 'payments' | 'receipts';

export function FeesPaymentsSection({ scope, childId }: ParentSectionProps) {
  const { data: rawInvoices } = useParentV2Invoices({ scope, childId });
  const { data: rawPayments } = useParentV2Payments({ scope, childId });

  const invoices: ParentInvoiceDemo[] = (rawInvoices as ParentInvoiceDemo[] | undefined) ?? filterByChild(FALLBACK_INVOICES, childId, scope);
  const payments: ParentPaymentDemo[] = (rawPayments as ParentPaymentDemo[] | undefined) ?? filterByChild(FALLBACK_PAYMENTS, childId, scope);
  const receipts: ParentReceiptDemo[] = filterByChild(FALLBACK_RECEIPTS, childId, scope);

  const [tab, setTab] = useState<Tab>('invoices');
  const [query, setQuery] = useState('');

  const totalOwed = useMemo(
    () => invoices.filter((i) => i.status !== 'PAID' && i.status !== 'CANCELLED' && i.status !== 'REFUNDED').reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0),
    [invoices],
  );
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const overdueCount = useMemo(() => invoices.filter((i) => i.status === 'OVERDUE').length, [invoices]);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((i) =>
        query.trim().length === 0 || `${i.title} ${i.id} ${childDisplayName(i.childId)}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [invoices, query],
  );

  const filteredPayments = useMemo(
    () =>
      payments.filter((p) =>
        query.trim().length === 0 || `${p.invoiceId} ${p.method} ${childDisplayName(p.childId)}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [payments, query],
  );

  const filteredReceipts = useMemo(
    () =>
      receipts.filter((r) =>
        query.trim().length === 0 || `${r.invoiceId} ${r.fileName} ${childDisplayName(r.childId)}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [receipts, query],
  );

  const statusTone = (status: string) => {
    if (status === 'PAID') return 'good' as const;
    if (status === 'OVERDUE') return 'bad' as const;
    if (status === 'PARTIALLY_PAID') return 'warn' as const;
    return 'info' as const;
  };

  return (
    <ParentSectionShell
      title="Fees & Payments"
      description="Track invoices, make payments, and download receipts across all your children."
    >
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className={overdueCount > 0 ? 'border-rose-500/20 bg-rose-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            {overdueCount > 0 ? <AlertTriangle className="size-5 text-rose-500" /> : <DollarSign className="size-5 text-sky-500" />}
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalOwed)}</p>
              <p className="text-xs text-muted-foreground">Outstanding balance</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CreditCard className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-muted-foreground">Total paid</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Receipt className="size-5 text-violet-500" />
            <div>
              <p className="text-2xl font-bold">{receipts.length}</p>
              <p className="text-xs text-muted-foreground">Receipts available</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center gap-2">
        {(['invoices', 'payments', 'receipts'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md border px-3 py-1 text-xs capitalize transition-colors ${
              tab === t ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {t}
          </button>
        ))}
        <Input
          className="max-w-xs"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${tab}...`}
        />
      </div>

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invoices</CardTitle>
            <CardDescription>{filteredInvoices.length} invoice(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <EmptyActionState title="No invoices" message="Nothing matches your search." ctaLabel="Clear search" onClick={() => setQuery('')} />
            ) : (
              filteredInvoices.map((inv) => (
                <div key={inv.id} className="rounded-lg border border-border/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <p className="text-sm font-semibold">{inv.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {inv.id} • {childDisplayName(inv.childId)} • Due {formatDateLabel(inv.dueDate)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{inv.description}</p>
                    </div>
                    <StatusBadge status={inv.status} tone={statusTone(inv.status)} />
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="font-medium">{formatCurrency(inv.totalAmount, inv.currency)}</span>
                    {inv.amountPaid > 0 && inv.amountPaid < inv.totalAmount && (
                      <span className="text-muted-foreground">
                        Paid: {formatCurrency(inv.amountPaid, inv.currency)} · Remaining: {formatCurrency(inv.totalAmount - inv.amountPaid, inv.currency)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="gap-1.5"><Eye className="size-3.5" /> View</Button>
                    {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && inv.status !== 'REFUNDED' && (
                      <Button size="sm" className="gap-1.5"><CreditCard className="size-3.5" /> Pay Now</Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment History</CardTitle>
            <CardDescription>{filteredPayments.length} payment(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredPayments.length === 0 ? (
              <EmptyActionState title="No payments" message="Nothing matches your search." ctaLabel="Clear search" onClick={() => setQuery('')} />
            ) : (
              filteredPayments.map((pay) => (
                <div key={pay.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{formatCurrency(pay.amount, pay.currency)}</p>
                    <p className="text-xs text-muted-foreground">
                      {pay.invoiceId} • {childDisplayName(pay.childId)} • {pay.method}
                    </p>
                    <p className="text-xs text-muted-foreground">Paid {formatDateLabel(pay.paidAt)} • Ref: {pay.reference}</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                    Completed
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Receipts Tab */}
      {tab === 'receipts' && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receipts</CardTitle>
            <CardDescription>{filteredReceipts.length} receipt(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredReceipts.length === 0 ? (
              <EmptyActionState title="No receipts" message="Nothing matches your search." ctaLabel="Clear search" onClick={() => setQuery('')} />
            ) : (
              filteredReceipts.map((rcp) => (
                <div key={rcp.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Receipt className="size-4 shrink-0 text-muted-foreground" />
                      <p className="text-sm font-semibold">{rcp.fileName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {rcp.invoiceId} • {childDisplayName(rcp.childId)} • {formatCurrency(rcp.amount, rcp.currency)} • Issued {formatDateLabel(rcp.issuedAt)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Download className="size-3.5" /> Download
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </ParentSectionShell>
  );
}
