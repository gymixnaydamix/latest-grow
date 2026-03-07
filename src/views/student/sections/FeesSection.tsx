/* ---- FeesSection ---- Fees & payments workspace ---------------------
 * Fee summary, invoice list, payment history, due dates
 * --------------------------------------------------------------------- */
import { useState, useMemo } from 'react';
import {
  Receipt, Clock, CheckCircle2,
  AlertTriangle, Download, Search, DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { type StudentInvoice } from '@/store/student-data.store';
import { useStudentData } from '@/hooks/use-student-data';
import { notifySuccess } from '@/lib/notify';
import { EmptyState } from '@/components/features/EmptyState';

type FeeView = 'overview' | 'invoices' | 'history';

export function FeesSection() {
  const store = useStudentData();
  const [view, setView] = useState<FeeView>('overview');

  const stats = useMemo(() => {
    const invoices = store.invoices;
    const totalDue = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.paidAmount, 0);
    const overdue = invoices.filter(i => i.status === 'overdue');
    const pending = invoices.filter(i => i.status === 'pending');
    return { totalDue, totalPaid, overdue, pending, total: invoices.length };
  }, [store.invoices]);

  const tabs: { id: FeeView; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'history', label: 'Payment History' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white/90">Fees & Payments</h2>
        <p className="text-sm text-white/40">{stats.total} invoices · {stats.overdue.length} overdue</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat icon={DollarSign} label="Total Due" value={`$${stats.totalDue.toLocaleString()}`} color="#f43f5e" />
        <MiniStat icon={CheckCircle2} label="Total Paid" value={`$${stats.totalPaid.toLocaleString()}`} color="#34d399" />
        <MiniStat icon={AlertTriangle} label="Overdue" value={stats.overdue.length.toString()} color="#f97316" />
        <MiniStat icon={Clock} label="Pending" value={stats.pending.length.toString()} color="#38bdf8" />
      </div>

      {/* Overdue warning */}
      {stats.overdue.length > 0 && (
        <Card className="border-red-500/15 bg-red-500/[0.03]">
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <AlertTriangle className="size-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Overdue Payments</p>
              <p className="text-[10px] text-white/40">You have {stats.overdue.length} overdue invoice{stats.overdue.length > 1 ? 's' : ''}. Total: <span className="font-semibold text-red-400">${stats.overdue.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span></p>
            </div>
            <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30"
              onClick={() => { stats.overdue.forEach(i => store.payInvoice(i.id, i.amount - i.paidAmount)); notifySuccess('Payment processed', 'All overdue invoices have been paid'); }}>Pay Now</Button>
          </CardContent>
        </Card>
      )}

      {/* View tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map(t => (
          <Button key={t.id} size="sm" variant="ghost"
            onClick={() => setView(t.id)}
            className={cn('text-xs', view === t.id ? 'text-white bg-white/8' : 'text-white/40')}>
            {t.label}
          </Button>
        ))}
      </div>

      {view === 'overview' && <OverviewView stats={stats} />}
      {view === 'invoices' && <InvoiceList />}
      {view === 'history' && <PaymentHistory />}
    </div>
  );
}

/* -- Overview -- */
function OverviewView({ stats }: { stats: { totalDue: number; totalPaid: number; overdue: StudentInvoice[]; pending: StudentInvoice[]; total: number } }) {
  const store = useStudentData();
  const totalAmount = stats.totalDue + stats.totalPaid;
  const paidPct = totalAmount > 0 ? Math.round((stats.totalPaid / totalAmount) * 100) : 0;

  // Upcoming due dates
  const upcoming = useMemo(() => {
    return store.invoices
      .filter(i => i.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [store.invoices]);

  return (
    <div className="space-y-5">
      {/* Progress */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardContent className="py-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-white/60">Payment Progress</span>
            <span className="text-sm font-semibold text-white/70">{paidPct}% paid</span>
          </div>
          <Progress value={paidPct} className="h-2.5 bg-white/5" />
          <div className="flex justify-between mt-2 text-[10px] text-white/35">
            <span>Paid: ${stats.totalPaid.toLocaleString()}</span>
            <span>Remaining: ${stats.totalDue.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming due dates */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white/60 mb-3">Upcoming Due Dates</h3>
          <div className="space-y-2">
            {upcoming.map(inv => {
              const days = Math.ceil((new Date(inv.dueDate).getTime() - Date.now()) / 86400000);
              return (
                <Card key={inv.id} className="border-white/8 bg-white/[0.02]">
                  <CardContent className="flex items-center gap-4 py-3 px-4">
                    <Receipt className="size-4 text-white/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70">{inv.title}</p>
                      <p className="text-[10px] text-white/35">Due {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <span className={cn('text-xs font-semibold', days <= 7 ? 'text-amber-400' : 'text-white/40')}>
                      {days <= 0 ? 'Due Today' : `${days}d left`}
                    </span>
                    <span className="text-sm font-bold text-white/70">${inv.amount.toLocaleString()}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* -- Invoice list -- */
function InvoiceList() {
  const store = useStudentData();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = store.invoices;
    if (search) {
      list = list.filter(i => i.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (filter !== 'all') {
      list = list.filter(i => i.status === filter);
    }
    return list.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [store.invoices, filter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1">
          {['all', 'pending', 'overdue', 'paid', 'partial'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'ghost'}
              onClick={() => setFilter(f)}
              className={cn('text-xs capitalize', filter !== f && 'text-white/40')}>
              {f}
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..."
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/8" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No invoices" description="No invoices match your filter." />
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => (
            <Card key={inv.id} className={cn('border-white/8 bg-white/[0.02]', inv.status === 'overdue' && 'border-red-500/10')}>
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <Receipt className="size-4 text-white/25" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/70">{inv.title}</p>
                  <div className="flex items-center gap-3 text-[10px] text-white/35 mt-0.5">
                    <span>#{inv.id.slice(-6)}</span>
                    <span>Due {new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span>Issued {new Date(inv.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-white/70">${inv.amount.toLocaleString()}</span>
                <InvoiceStatusBadge status={inv.status} />
                {inv.receiptUrl && (
                  <Button size="icon" variant="ghost" className="size-8 text-white/25 hover:text-white/60"
                    onClick={() => notifySuccess('Downloaded', `Receipt for ${inv.title}`)}>
                    <Download className="size-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* -- Payment History -- */
function PaymentHistory() {
  const store = useStudentData();
  const paid = useMemo(() => {
    return store.invoices.filter(i => i.status === 'paid').sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }, [store.invoices]);

  if (paid.length === 0) return <EmptyState title="No payment history" description="Completed payments will appear here." />;

  return (
    <div className="space-y-2">
      {paid.map(inv => (
        <Card key={inv.id} className="border-white/8 bg-white/[0.02]">
          <CardContent className="flex items-center gap-4 py-3 px-4">
            <CheckCircle2 className="size-4 text-emerald-400" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/70">{inv.title}</p>
              <p className="text-[10px] text-white/35">Paid ${inv.paidAmount.toLocaleString()} · Issued {new Date(inv.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <span className="text-sm font-semibold text-emerald-400">${inv.amount.toLocaleString()}</span>
            {inv.receiptUrl && (
              <Button size="icon" variant="ghost" className="size-8 text-white/25 hover:text-white/60"
                onClick={() => notifySuccess('Downloaded', `Receipt for ${inv.title}`)}><Download className="size-3.5" /></Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* -- Helpers -- */
function MiniStat({ icon: Icon, label, value, color }: { icon: typeof DollarSign; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
      <div className="flex items-center justify-center size-8 rounded-lg bg-white/[0.03]"><Icon className="size-4" style={{ color }} /></div>
      <div>
        <p className="text-lg font-bold text-white/85">{value}</p>
        <p className="text-[10px] text-white/35">{label}</p>
      </div>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    overdue: 'text-red-400 bg-red-500/10 border-red-500/20',
    paid: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    partial: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  return <Badge variant="outline" className={cn('text-[9px] capitalize', m[status] ?? m.pending)}>{status}</Badge>;
}
