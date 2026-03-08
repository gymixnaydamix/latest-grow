/* Parent Concierge › Payments — Outstanding, Payment History, Installment Plans, Fee Breakdown, Receipts, Settings */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeSplitPreviewPanel, ConciergePermissionBadge } from '@/components/concierge/shared';
import { CreditCard, Download, Share2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParentV2Invoices, useParentV2Payments, useParentV2Receipts, useParentV2Home } from '@/hooks/api/use-parent-v2';
import { useAuthStore } from '@/store/auth.store';

/* ── Outstanding fees ── */
const FALLBACK_OUTSTANDING_FEES = [
  { id: 'of1', item: 'Term 3 Tuition Fee', child: 'Aarav Sharma — Grade 5', amount: 18500, dueDate: 'Mar 6, 2026', status: 'Overdue' },
  { id: 'of2', item: 'Transport Fee (Mar)', child: 'Aarav Sharma — Grade 5', amount: 4200, dueDate: 'Mar 10, 2026', status: 'Due Soon' },
  { id: 'of3', item: 'Meal Plan — Mar', child: 'Meera Sharma — Grade 2', amount: 3200, dueDate: 'Mar 12, 2026', status: 'Due Soon' },
  { id: 'of4', item: 'Activity Fee — Swimming', child: 'Aarav Sharma — Grade 5', amount: 2800, dueDate: 'Mar 15, 2026', status: 'Upcoming' },
  { id: 'of5', item: 'Lab Fee — Science Kit', child: 'Aarav Sharma — Grade 5', amount: 1500, dueDate: 'Mar 20, 2026', status: 'Upcoming' },
  { id: 'of6', item: 'Term 3 Tuition Fee', child: 'Meera Sharma — Grade 2', amount: 15000, dueDate: 'Mar 6, 2026', status: 'Overdue' },
];

/* ── Payment history ── */
const FALLBACK_PAYMENT_HISTORY = [
  { id: 'ph1', item: 'Term 2 Tuition Fee — Aarav', amount: 18500, date: 'Dec 5, 2025', method: 'UPI — SBI', receipt: '#GIS-2025-3892' },
  { id: 'ph2', item: 'Term 2 Tuition Fee — Meera', amount: 15000, date: 'Dec 5, 2025', method: 'UPI — SBI', receipt: '#GIS-2025-3893' },
  { id: 'ph3', item: 'Transport Fee (Oct–Dec)', amount: 12600, date: 'Oct 2, 2025', method: 'Net Banking — HDFC', receipt: '#GIS-2025-3401' },
  { id: 'ph4', item: 'Activity Fee — Cricket Camp', amount: 3500, date: 'Sep 15, 2025', method: 'Credit Card — ICICI', receipt: '#GIS-2025-3110' },
  { id: 'ph5', item: 'Uniform Purchase', amount: 4800, date: 'Jun 20, 2025', method: 'Debit Card — Axis', receipt: '#GIS-2025-2204' },
  { id: 'ph6', item: 'Annual Admission Fee — Meera', amount: 25000, date: 'Apr 1, 2025', method: 'Net Banking — SBI', receipt: '#GIS-2025-1001' },
];

/* ── Installment plans ── */
const FALLBACK_INSTALLMENT_PLANS = [
  {
    id: 'ip1', name: 'Annual Tuition — Aarav (2025–2026)', total: 74000, paid: 55500, remaining: 18500,
    installments: [
      { label: 'Term 1', amount: 18500, status: 'Paid', date: 'Apr 5, 2025' },
      { label: 'Term 2', amount: 18500, status: 'Paid', date: 'Dec 5, 2025' },
      { label: 'Term 3', amount: 18500, status: 'Due', date: 'Mar 6, 2026' },
      { label: 'Term 4', amount: 18500, status: 'Upcoming', date: 'Jun 5, 2026' },
    ],
  },
  {
    id: 'ip2', name: 'Transport Fee — Aarav (Jan–Jun 2026)', total: 25200, paid: 8400, remaining: 16800,
    installments: [
      { label: 'Jan–Feb', amount: 8400, status: 'Paid', date: 'Jan 5, 2026' },
      { label: 'Mar–Apr', amount: 8400, status: 'Due', date: 'Mar 10, 2026' },
      { label: 'May–Jun', amount: 8400, status: 'Upcoming', date: 'May 5, 2026' },
    ],
  },
];

/* ── Fee breakdown by child ── */
const FALLBACK_FEE_BREAKDOWN = [
  {
    child: 'Aarav Sharma — Grade 5',
    fees: [
      { category: 'Tuition', term1: 18500, term2: 18500, term3: 18500, term4: 18500, total: 74000 },
      { category: 'Transport', term1: 4200, term2: 4200, term3: 4200, term4: 4200, total: 16800 },
      { category: 'Activity (Swimming)', term1: 0, term2: 2800, term3: 2800, term4: 0, total: 5600 },
      { category: 'Lab Fee', term1: 1500, term2: 0, term3: 1500, term4: 0, total: 3000 },
      { category: 'Meals', term1: 3200, term2: 3200, term3: 3200, term4: 3200, total: 12800 },
    ],
    grandTotal: 112200,
  },
  {
    child: 'Meera Sharma — Grade 2',
    fees: [
      { category: 'Tuition', term1: 15000, term2: 15000, term3: 15000, term4: 15000, total: 60000 },
      { category: 'Transport', term1: 3800, term2: 3800, term3: 3800, term4: 3800, total: 15200 },
      { category: 'Meals', term1: 3200, term2: 3200, term3: 3200, term4: 3200, total: 12800 },
      { category: 'Activity (Art)', term1: 1800, term2: 1800, term3: 1800, term4: 1800, total: 7200 },
    ],
    grandTotal: 95200,
  },
];

/* ── Receipts ── */
const FALLBACK_RECEIPTS = [
  { id: 'r1', receipt: '#GIS-2026-4421', item: 'Term 3 Tuition — Aarav', amount: 18500, date: 'Mar 6, 2026', method: 'UPI — SBI' },
  { id: 'r2', receipt: '#GIS-2025-3892', item: 'Term 2 Tuition — Aarav', amount: 18500, date: 'Dec 5, 2025', method: 'UPI — SBI' },
  { id: 'r3', receipt: '#GIS-2025-3893', item: 'Term 2 Tuition — Meera', amount: 15000, date: 'Dec 5, 2025', method: 'UPI — SBI' },
  { id: 'r4', receipt: '#GIS-2025-3401', item: 'Transport (Oct–Dec) — Aarav', amount: 12600, date: 'Oct 2, 2025', method: 'Net Banking — HDFC' },
  { id: 'r5', receipt: '#GIS-2025-3110', item: 'Cricket Camp — Aarav', amount: 3500, date: 'Sep 15, 2025', method: 'Credit Card — ICICI' },
  { id: 'r6', receipt: '#GIS-2025-1001', item: 'Admission Fee — Meera', amount: 25000, date: 'Apr 1, 2025', method: 'Net Banking — SBI' },
];

const statusColor: Record<string, string> = {
  Overdue: 'bg-red-500/10 text-red-600',
  'Due Soon': 'bg-amber-500/10 text-amber-600',
  Upcoming: 'bg-blue-500/10 text-blue-600',
  Paid: 'bg-emerald-500/10 text-emerald-600',
  Due: 'bg-amber-500/10 text-amber-600',
};

export function ParentConciergePayments() {
  const { activeSubNav } = useNavigationStore();
  useAuthStore((s) => s.schoolId);

  const { data: apiInvoices } = useParentV2Invoices();
  const { data: apiPayments } = useParentV2Payments();
  const { data: apiReceipts } = useParentV2Receipts();
  const { data: apiHome } = useParentV2Home();

  const outstandingFees = (apiInvoices as any[]) ?? FALLBACK_OUTSTANDING_FEES;
  const paymentHistory = (apiPayments as any[]) ?? FALLBACK_PAYMENT_HISTORY;
  const installmentPlans = (apiHome as any)?.installmentPlans ?? FALLBACK_INSTALLMENT_PLANS;
  const feeBreakdown = (apiHome as any)?.feeBreakdown ?? FALLBACK_FEE_BREAKDOWN;
  const receipts = (apiReceipts as any[]) ?? FALLBACK_RECEIPTS;

  /* ── Outstanding (default) ── */
  if (!activeSubNav || activeSubNav === 'c_outstanding') {
    const feeList = (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Outstanding Fees</span>
          <span className="text-[10px] text-muted-foreground">
            Total: ₹{outstandingFees.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}
          </span>
        </div>
        {outstandingFees.map((f) => (
          <div key={f.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-xs font-medium text-foreground">{f.item}</h5>
              <span className="text-sm font-bold text-foreground">₹{f.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{f.child}</span>
                <span>Due: {f.dueDate}</span>
              </div>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusColor[f.status])}>
                {f.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    );

    const summary = (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Payment Summary</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Due', value: `₹${outstandingFees.reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}`, color: 'text-primary' },
            { label: 'Overdue', value: `₹${outstandingFees.filter((f) => f.status === 'Overdue').reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}`, color: 'text-red-600' },
            { label: 'Due This Week', value: `₹${outstandingFees.filter((f) => f.status === 'Due Soon').reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}`, color: 'text-amber-600' },
            { label: 'Items', value: `${outstandingFees.length} pending`, color: 'text-foreground' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/30 bg-background/70 p-3 text-center dark:border-white/5">
              <p className={cn('text-lg font-bold', item.color)}>{item.value}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <ConciergePermissionBadge granted label="Payment authorized" />
        <button className="w-full rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          <CreditCard className="mr-1.5 inline h-3.5 w-3.5" /> Pay All Outstanding
        </button>
      </div>
    );

    return <ConciergeSplitPreviewPanel left={feeList} right={summary} leftLabel="Fee Items" rightLabel="Summary" />;
  }

  /* ── Payment History ── */
  if (activeSubNav === 'c_payment_history') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Payment History</h3>
        <div className="space-y-2">
          {paymentHistory.map((p) => (
            <div key={p.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{p.item}</h5>
                <span className="text-sm font-bold text-emerald-600">₹{p.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{p.date}</span>
                  <span>{p.method}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{p.receipt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Installment Plans ── */
  if (activeSubNav === 'c_installment_plans') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Installment Plans</h3>
        <div className="space-y-3">
          {installmentPlans.map((plan: any) => (
            <div key={plan.id} className="rounded-xl border border-border/30 bg-background/70 p-4 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-semibold text-foreground">{plan.name}</h5>
                <span className="text-[10px] text-muted-foreground">
                  ₹{plan.paid.toLocaleString('en-IN')} / ₹{plan.total.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(plan.paid / plan.total) * 100}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {plan.installments.map((inst: any) => (
                  <div key={inst.label} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      {inst.status === 'Paid' ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ) : inst.status === 'Due' ? (
                        <AlertTriangle className="h-3 w-3 text-amber-600" />
                      ) : (
                        <Clock className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className="font-medium text-foreground">{inst.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">₹{inst.amount.toLocaleString('en-IN')}</span>
                      <span className={cn('rounded-full px-2 py-0.5 font-medium', statusColor[inst.status])}>
                        {inst.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Fee Breakdown ── */
  if (activeSubNav === 'c_fee_breakdown') {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Fee Breakdown by Child</h3>
        {feeBreakdown.map((child: any) => (
          <div key={child.child} className="rounded-xl border border-border/30 bg-background/70 p-4 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-primary/80">{child.child}</h4>
              <span className="text-xs font-bold text-foreground">
                Total: ₹{child.grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr className="border-b border-border/30 text-left text-muted-foreground">
                    <th className="pb-2 pr-3 font-medium">Category</th>
                    <th className="pb-2 px-2 font-medium text-right">T1</th>
                    <th className="pb-2 px-2 font-medium text-right">T2</th>
                    <th className="pb-2 px-2 font-medium text-right">T3</th>
                    <th className="pb-2 px-2 font-medium text-right">T4</th>
                    <th className="pb-2 pl-2 font-medium text-right">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {child.fees.map((f: any) => (
                    <tr key={f.category} className="border-b border-border/10">
                      <td className="py-1.5 pr-3 font-medium text-foreground">{f.category}</td>
                      <td className="py-1.5 px-2 text-right text-muted-foreground">{f.term1 > 0 ? `₹${f.term1.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="py-1.5 px-2 text-right text-muted-foreground">{f.term2 > 0 ? `₹${f.term2.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="py-1.5 px-2 text-right text-muted-foreground">{f.term3 > 0 ? `₹${f.term3.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="py-1.5 px-2 text-right text-muted-foreground">{f.term4 > 0 ? `₹${f.term4.toLocaleString('en-IN')}` : '—'}</td>
                      <td className="py-1.5 pl-2 text-right font-semibold text-foreground">₹{f.total.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* ── Receipts ── */
  if (activeSubNav === 'c_receipts') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Receipts</h3>
        <div className="space-y-2">
          {receipts.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{r.item}</h5>
                <span className="text-sm font-bold text-foreground">₹{r.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <span>{r.date}</span>
                  <span>{r.method}</span>
                </div>
                <span className="font-mono">{r.receipt}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary hover:bg-primary/20">
                  <Download className="h-2.5 w-2.5" /> Download
                </button>
                <button className="inline-flex items-center gap-1 rounded-lg border border-border/30 px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-muted/40">
                  <Share2 className="h-2.5 w-2.5" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Payment Settings ── */
  if (activeSubNav === 'c_payment_settings') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Payment Settings</h3>
        <p className="text-xs text-muted-foreground">Manage auto-pay and payment methods</p>
        <div className="space-y-2">
          {[
            { label: 'Enable auto-pay for tuition fees', enabled: false },
            { label: 'Enable auto-pay for transport fees', enabled: true },
            { label: 'Send payment reminders 3 days before due date', enabled: true },
            { label: 'Email receipt after every payment', enabled: true },
            { label: 'Allow installment splitting', enabled: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <span className="text-xs font-medium text-foreground">{s.label}</span>
              <div className={cn('h-5 w-9 rounded-full relative transition', s.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', s.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-xs font-semibold text-foreground pt-2">Saved Payment Methods</h4>
        <div className="space-y-2">
          {[
            { type: 'UPI', detail: 'sharma.rajesh@sbi', isPrimary: true },
            { type: 'Net Banking', detail: 'HDFC Bank — ****6789', isPrimary: false },
            { type: 'Credit Card', detail: 'ICICI Visa — ****4321', isPrimary: false },
            { type: 'Debit Card', detail: 'Axis Bank — ****8765', isPrimary: false },
          ].map((m) => (
            <div key={m.detail} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <span className="text-xs font-medium text-foreground">{m.type}</span>
                <p className="text-[10px] text-muted-foreground">{m.detail}</p>
              </div>
              {m.isPrimary ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Primary</span>
              ) : (
                <button className="text-[10px] font-medium text-primary hover:underline">Set Primary</button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
