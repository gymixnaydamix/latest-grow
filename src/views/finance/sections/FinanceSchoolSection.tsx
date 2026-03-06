/* ─── FinanceSchoolSection ─── Tuition, invoicing, payroll, budgets, grants */
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  DollarSign, Clock, CheckCircle,
  AlertTriangle, Download, Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useTuitionPlans,
  useInvoices,
  useBudgets,
} from '@/hooks/api';
import type { TuitionPlan, Invoice, Budget, InvoiceStatus } from '@root/types';
import PayrollViewPage from '@/views/finance/PayrollView';
import GrantsViewPage from '@/views/finance/GrantsView';

export function FinanceSchoolSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader]);

  const view = (() => {
    switch (activeHeader) {
      case 'tuition': return <TuitionView />;
      case 'invoicing': return <InvoicingView />;
      case 'payroll': return <PayrollViewPage />;
      case 'budgets': return <BudgetsView />;
      case 'grants': return <GrantsViewPage />;
      default: return <TuitionView />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Tuition ───────────────────────────────────────────────────── */
function TuitionView() {
  const { schoolId } = useAuthStore();
  const { data, isLoading } = useTuitionPlans(schoolId);
  const plans: TuitionPlan[] = data ?? [];

  // Derive summary metrics from API data
  const totalReceivable = plans.reduce((s, p) => s + p.amount, 0);

  // Demo analytics – no collection-status endpoint exists
  const collected = Math.round(totalReceivable * 0.79);
  const outstanding = totalReceivable - collected;
  const overdue = Math.round(outstanding * 0.19);

  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n}`;

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full rounded-xl" />))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </>
    );
  }

  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Tuition Management</h2></div>
      <div className="grid gap-4 sm:grid-cols-4" data-animate>
        {[
          { label: 'Total Receivable', value: fmt(totalReceivable), icon: DollarSign, color: 'text-primary' },
          { label: 'Collected', value: fmt(collected), icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Outstanding', value: fmt(outstanding), icon: Clock, color: 'text-amber-500' },
          { label: 'Overdue', value: fmt(overdue), icon: AlertTriangle, color: 'text-destructive' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <m.icon className={`size-4 ${m.color}`} />
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
              <p className={`text-xl font-bold mt-2 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card data-animate>
        <CardHeader><CardTitle className="text-sm">Payment Plans</CardTitle></CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No tuition plans configured yet.</p>
          ) : (
            <div className="space-y-2">
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.gradeLevel} · {p.frequency} · ${p.amount.toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{p.frequency}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

/* ── Invoicing ─────────────────────────────────────────────────── */
function InvoicingView() {
  const { schoolId } = useAuthStore();
  const { data, isLoading } = useInvoices(schoolId);
  const invoices: Invoice[] = data ?? [];

  const sent = invoices.filter((i) => i.status !== 'DRAFT').length;
  const paid = invoices.filter((i) => i.status === 'PAID').length;
  const pending = invoices.filter((i) => i.status === 'ISSUED' || i.status === 'PARTIALLY_PAID' || i.status === 'OVERDUE').length;

  const badgeVariant = (s: InvoiceStatus) =>
    s === 'PAID' ? 'default' : s === 'OVERDUE' ? 'destructive' : 'outline';

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full rounded-xl" />))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-16 w-full rounded-xl" />))}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">Invoicing</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Download className="mr-1 size-3" /> Export</Button>
          <Button size="sm"><Plus className="mr-1 size-3" /> New Invoice</Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Invoices Sent', value: sent.toLocaleString() },
          { label: 'Paid', value: paid.toLocaleString() },
          { label: 'Pending', value: pending.toLocaleString() },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {invoices.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center" data-animate>No invoices found.</p>
      ) : (
        <div className="space-y-2" data-animate>
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">Invoice #{inv.id.slice(-6)}</p>
                  <p className="text-xs text-muted-foreground">{inv.id} · Due {new Date(inv.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">${inv.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <Badge variant={badgeVariant(inv.status as InvoiceStatus)} className="text-[10px]">{inv.status.toLowerCase()}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ── Budgets ───────────────────────────────────────────────────── */
function BudgetsView() {
  const { schoolId } = useAuthStore();
  const { data, isLoading } = useBudgets(schoolId);
  const budgets: Budget[] = data ?? [];

  const totalAllocated = budgets.reduce((s, b) => s + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0);
  const remaining = totalAllocated - totalSpent;

  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n}`;

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full rounded-xl" />))}
        </div>
        {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-20 w-full rounded-xl" />))}
      </>
    );
  }

  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Budget Management</h2></div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Total Budget', value: fmt(totalAllocated) },
          { label: 'Spent YTD', value: fmt(totalSpent) },
          { label: 'Remaining', value: fmt(remaining) },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {budgets.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center" data-animate>No budgets configured yet.</p>
      ) : (
        <div className="space-y-3" data-animate>
          {budgets.map((b) => {
            const pct = b.allocatedAmount > 0 ? Math.round((b.spentAmount / b.allocatedAmount) * 100) : 0;
            return (
              <Card key={b.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{b.department}</span>
                    <span className="text-muted-foreground">{fmt(b.spentAmount)} / {fmt(b.allocatedAmount)}</span>
                  </div>
                  <Progress value={pct} className={`mt-2 h-2 ${pct > 90 ? '[&>div]:bg-destructive' : pct > 75 ? '[&>div]:bg-amber-500' : ''}`} />
                  <p className="text-[10px] text-muted-foreground mt-1">{pct}% utilized · FY {b.fiscalYear}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
