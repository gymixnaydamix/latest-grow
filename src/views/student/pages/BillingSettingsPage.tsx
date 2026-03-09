/* ─── BillingSettingsPage ─── Full-page student billing settings ──── */
import { useState } from 'react';
import {
  CreditCard, Receipt, Download, ChevronRight,
  DollarSign, Calendar, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Shield, Wallet,
  ArrowUpRight, FileText, Star, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess, notifyError } from '@/lib/notify';
import { useStudentFees, usePayInvoice, useDownloadDocument } from '@/hooks/api/use-student';

const PLAN = {
  name: 'Pro Student Plan',
  price: 49,
  cycle: 'month',
  renewDate: 'June 1, 2026',
  features: [
    { label: 'All Courses Access', included: true },
    { label: 'AI Study Tools', included: true },
    { label: 'Unlimited Storage', included: true },
    { label: 'Priority Support', included: true },
    { label: 'Career Coaching', included: false },
    { label: 'Certification Exams', included: false },
  ],
  usage: { courses: { used: 8, total: 25 }, storage: { used: 12.4, total: 50 }, aiQueries: { used: 342, total: 'Unlimited' } },
};

const FALLBACK_PAYMENT_METHODS = [
  { id: '1', type: 'Visa', last4: '4242', expiry: '12/2026', isDefault: true },
  { id: '2', type: 'Mastercard', last4: '8888', expiry: '03/2027', isDefault: false },
];

const FALLBACK_INVOICES = [
  { id: 'INV-2026-03', date: 'Mar 1, 2026', amount: '$49.00', status: 'paid' as const },
  { id: 'INV-2026-02', date: 'Feb 1, 2026', amount: '$49.00', status: 'paid' as const },
  { id: 'INV-2026-01', date: 'Jan 1, 2026', amount: '$49.00', status: 'paid' as const },
  { id: 'INV-2025-12', date: 'Dec 1, 2025', amount: '$49.00', status: 'paid' as const },
  { id: 'INV-2025-11', date: 'Nov 1, 2025', amount: '$49.00', status: 'paid' as const },
  { id: 'INV-2025-10', date: 'Oct 1, 2025', amount: '$49.00', status: 'paid' as const },
];

const FALLBACK_TRANSACTIONS = [
  { desc: 'Monthly subscription', date: 'Mar 1, 2026', amount: '-$49.00', type: 'charge' },
  { desc: 'Referral credit', date: 'Feb 20, 2026', amount: '+$10.00', type: 'credit' },
  { desc: 'Monthly subscription', date: 'Feb 1, 2026', amount: '-$49.00', type: 'charge' },
  { desc: 'Course material fee', date: 'Jan 15, 2026', amount: '-$12.00', type: 'charge' },
  { desc: 'Monthly subscription', date: 'Jan 1, 2026', amount: '-$49.00', type: 'charge' },
];

const FALLBACK_SPENDING_MONTHS = [
  { month: 'Oct', amount: 49 },
  { month: 'Nov', amount: 49 },
  { month: 'Dec', amount: 49 },
  { month: 'Jan', amount: 61 },
  { month: 'Feb', amount: 39 },
  { month: 'Mar', amount: 49 },
];

export default function BillingSettingsPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);

  /* ── API data ── */
  const { data: apiFees } = useStudentFees();
  const payInvoiceMut = usePayInvoice();
  const downloadDocMut = useDownloadDocument();
  const feesData = (apiFees as any) ?? {};
  const paymentMethods = (feesData?.paymentMethods as any[])?.length > 0 ? (feesData.paymentMethods as any[]) : FALLBACK_PAYMENT_METHODS;
  const invoices = (feesData?.invoices as any[])?.length > 0 ? (feesData.invoices as any[]) : FALLBACK_INVOICES;
  const transactions = (feesData?.transactions as any[])?.length > 0 ? (feesData.transactions as any[]) : FALLBACK_TRANSACTIONS;
  const spendingMonths = (feesData?.spendingMonths as any[])?.length > 0 ? (feesData.spendingMonths as any[]) : FALLBACK_SPENDING_MONTHS;
  const maxSpend = Math.max(...spendingMonths.map((m: any) => m.amount));
  const totalPaidYTD = invoices.filter((inv: any) => inv.status === 'paid').reduce((s: number, inv: any) => s + parseFloat(String(inv.amount).replace(/[^\d.]/g, '') || '0'), 0);
  const creditsAvailable = (feesData?.credits as number) ?? 10;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Billing & Subscription" description="Manage your plan, payment methods, and invoices" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Monthly Cost" value={PLAN.price} prefix="$" icon={<DollarSign className="h-5 w-5" />} accentColor="#10b981" />
        <StatCard label="Next Payment" value={(feesData?.nextPaymentDay as number) ?? PLAN.price} suffix={` ${(feesData?.nextPaymentMonth as string) ?? PLAN.cycle}`} icon={<Calendar className="h-5 w-5" />} />
        <StatCard label="Total Paid (YTD)" value={totalPaidYTD || 147} prefix="$" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Credits Available" value={creditsAvailable} prefix="$" icon={<Wallet className="h-5 w-5" />} accentColor="#f59e0b" />
      </div>

      {/* Current Plan */}
      <Card data-animate className="border-indigo-500/15 bg-indigo-500/5 backdrop-blur-xl">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Zap className="size-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/90">{PLAN.name}</p>
                <p className="text-[10px] text-white/35">${PLAN.price}/{PLAN.cycle} · Renews {PLAN.renewDate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-[10px] h-7 border-white/10 text-white/40" onClick={() => notifySuccess('Plan', 'Plan selection opened')}>Change Plan</Button>
              <Button size="sm" className="text-[10px] h-7 bg-indigo-600 hover:bg-indigo-500 text-white gap-1" onClick={() => notifySuccess('Upgrade', 'Redirecting to premium options…')}>
                <Star className="size-3" />Upgrade
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/6 bg-white/3 p-3">
              <p className="text-[9px] text-white/30 mb-1">Courses</p>
              <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-white/80">{PLAN.usage.courses.used}<span className="text-xs text-white/25">/{PLAN.usage.courses.total}</span></p>
              </div>
              <Progress value={(PLAN.usage.courses.used / PLAN.usage.courses.total) * 100} className="h-1.5 mt-1.5 bg-white/5" />
            </div>
            <div className="rounded-lg border border-white/6 bg-white/3 p-3">
              <p className="text-[9px] text-white/30 mb-1">Storage</p>
              <div className="flex items-end justify-between">
                <p className="text-lg font-bold text-white/80">{PLAN.usage.storage.used}<span className="text-xs text-white/25">/{PLAN.usage.storage.total} GB</span></p>
              </div>
              <Progress value={(PLAN.usage.storage.used / PLAN.usage.storage.total) * 100} className="h-1.5 mt-1.5 bg-white/5" />
            </div>
            <div className="rounded-lg border border-white/6 bg-white/3 p-3">
              <p className="text-[9px] text-white/30 mb-1">AI Queries</p>
              <p className="text-lg font-bold text-white/80">{PLAN.usage.aiQueries.used}</p>
              <p className="text-[8px] text-emerald-400 mt-1">Unlimited</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 mt-3">
            {PLAN.features.map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 text-[9px]">
                {f.included
                  ? <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                  : <div className="size-3 rounded-full border border-white/10 shrink-0" />
                }
                <span className={cn('text-white/40', !f.included && 'line-through text-white/15')}>{f.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main – Tabs (Invoices + Transactions) + Payment methods */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Payment Methods */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3 flex-row items-center justify-between">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <CreditCard className="size-4 text-violet-400" />Payment Methods
              </CardTitle>
              <Button size="sm" className="text-[10px] h-7 bg-indigo-600 hover:bg-indigo-500 text-white gap-1" onClick={() => notifySuccess('Payment', 'Add card form opened')}>+ Add Card</Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {paymentMethods.map((pm: any) => (
                <div key={pm.id} className={cn(
                  'flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-3',
                  pm.isDefault && 'border-indigo-500/15 bg-indigo-500/5',
                )}>
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10">
                      <CreditCard className="size-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/75">{pm.type} ending in {pm.last4}</p>
                      <p className="text-[9px] text-white/30">Expires {pm.expiry}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pm.isDefault && <Badge className="text-[7px] bg-indigo-500/15 text-indigo-400 border-0">Default</Badge>}
                    <Button size="sm" variant="ghost" className="h-6 text-[9px] text-white/30 hover:text-white/60" onClick={() => notifySuccess('Payment', 'Editing payment method')}>Edit</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Invoices + Transactions tabs */}
          <Tabs defaultValue="invoices" className="w-full" data-animate>
            <TabsList className="bg-white/3 border border-white/[0.06] w-full justify-start gap-1">
              <TabsTrigger value="invoices" className="text-[10px]">Invoices</TabsTrigger>
              <TabsTrigger value="transactions" className="text-[10px]">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="invoices">
              <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                    <Receipt className="size-4 text-emerald-400" />Invoice History
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {invoices.map((inv: any) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-3 cursor-pointer hover:bg-white/3 transition-colors"
                      onClick={() => setExpandedInvoice(expandedInvoice === inv.id ? null : inv.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                          <Receipt className="size-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-white/75">{inv.id}</p>
                          <p className="text-[9px] text-white/30">{inv.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/60">{inv.amount}</span>
                        <Badge className="text-[7px] bg-emerald-500/15 text-emerald-400 border-0 capitalize">{inv.status}</Badge>
                        {inv.status !== 'paid' && (
                          <Button size="sm" className="text-[10px] h-6 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={(e) => { e.stopPropagation(); payInvoiceMut.mutate({ invoiceId: inv.id } as any, { onSuccess: () => notifySuccess('Payment', 'Invoice paid successfully'), onError: () => notifyError('Payment', 'Payment failed. Please try again.') }); }}>Pay</Button>
                        )}
                        <Button size="icon" className="size-7 bg-transparent text-white/20 hover:text-white/50 hover:bg-white/5" onClick={(e) => { e.stopPropagation(); downloadDocMut.mutate({ documentId: inv.id } as any, { onSuccess: () => notifySuccess('Invoice', 'Invoice downloaded'), onError: () => notifyError('Invoice', 'Download failed') }); }}>
                          <Download className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions">
              <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                    <FileText className="size-4 text-blue-400" />Transaction History
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {transactions.map((tx: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-2.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'size-7 rounded-md flex items-center justify-center',
                          tx.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10',
                        )}>
                          <ArrowUpRight className={cn('size-3', tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400 rotate-180')} />
                        </div>
                        <div>
                          <p className="text-[10px] text-white/65">{tx.desc}</p>
                          <p className="text-[8px] text-white/20">{tx.date}</p>
                        </div>
                      </div>
                      <span className={cn('text-xs font-semibold', tx.type === 'credit' ? 'text-emerald-400' : 'text-red-400/70')}>
                        {tx.amount}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Spending chart */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <TrendingUp className="size-4 text-emerald-400" />Monthly Spending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-20">
                {spendingMonths.map((m: any) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-gradient-to-t from-emerald-500/30 to-emerald-500/60"
                      style={{ height: `${(m.amount / maxSpend) * 100}%` }}
                    />
                    <span className="text-[7px] text-white/25">{m.month}</span>
                    <span className="text-[8px] text-white/35">${m.amount}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security note */}
          <Card data-animate className="border-emerald-500/15 bg-emerald-500/5 backdrop-blur-xl">
            <CardContent className="p-3 flex items-start gap-2.5">
              <Shield className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-emerald-400 font-medium">Payment Security</p>
                <p className="text-[9px] text-emerald-300/40">All transactions are encrypted with 256-bit SSL. We never store your full card number.</p>
              </div>
            </CardContent>
          </Card>

          {/* Billing alerts */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <AlertCircle className="size-4 text-amber-400" />Billing Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {[
                { text: 'Payment due in 28 days', icon: Clock, color: 'text-amber-400' },
                { text: 'Auto-renewal is enabled', icon: CheckCircle2, color: 'text-emerald-400' },
                { text: 'No failed payments', icon: CheckCircle2, color: 'text-emerald-400' },
              ].map((alert, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 p-2">
                  <alert.icon className={cn('size-3 shrink-0', alert.color)} />
                  <span className="text-[9px] text-white/40">{alert.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Help */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="p-3 text-center">
              <p className="text-[10px] text-white/30 mb-2">Need help with billing?</p>
              <Button size="sm" variant="outline" className="text-[10px] h-7 border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('Support', 'Opening support chat…')}>
                <ChevronRight className="size-3" />Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
