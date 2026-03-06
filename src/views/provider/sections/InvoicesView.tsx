/* ─── InvoicesView — Platform invoice management with CRUD ─── */
import { useState } from 'react';
import {
  ArrowUpRight, ArrowDownRight, Search,
  Plus, FileText, CheckCircle, Trash2, MoreHorizontal, Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  usePlatformInvoices, usePlatformInvoiceStats,
  useMarkInvoicePaid, useDeletePlatformInvoice,
} from '@/hooks/api';
import { CreateInvoiceDialog } from '../dialogs/CreateInvoiceDialog';

export function InvoicesView() {
  const [invSearch, setInvSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: invoiceData, isLoading } = usePlatformInvoices(invSearch || undefined, statusFilter);
  const { data: invStatsData } = usePlatformInvoiceStats();
  const markPaid = useMarkInvoicePaid();
  const deleteInvoice = useDeletePlatformInvoice();

  const invoices = (invoiceData?.data ?? []).map((inv) => ({
    id: inv.id,
    tenant: (inv as { tenant?: { name?: string; type?: string } }).tenant?.name ?? '—',
    tenantType: (inv as { tenant?: { name?: string; type?: string } }).tenant?.type as string | undefined,
    amount: `$${inv.amount.toLocaleString()}`,
    amountNum: inv.amount,
    due: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    issued: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    status: inv.status?.toLowerCase() as 'paid' | 'pending' | 'overdue',
    method: inv.method ?? 'Stripe',
  }));

  /* ── 3D Icons ── */
  const Icon3D_TotalBilled = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs><linearGradient id="iv_bil3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></linearGradient><radialGradient id="iv_bilShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_bil3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_bilShine)" />
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="system-ui">$</text>
    </svg>
  );
  const Icon3D_Paid = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs><linearGradient id="iv_paid3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient><radialGradient id="iv_paidShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_paid3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_paidShine)" />
      <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
  const Icon3D_Pending = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs><linearGradient id="iv_pend3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient><radialGradient id="iv_pendShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_pend3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_pendShine)" />
      <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none" /><path d="M20 15v5l3.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
  const Icon3D_Overdue = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(239,68,68,.35))' }}>
      <defs><linearGradient id="iv_od3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f87171" /><stop offset="100%" stopColor="#dc2626" /></linearGradient><radialGradient id="iv_odShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_od3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#iv_odShine)" />
      <path d="M20 14v6" stroke="white" strokeWidth="2.5" strokeLinecap="round" /><circle cx="20" cy="25" r="1.5" fill="white" />
    </svg>
  );

  const paid = invoices.filter(i => i.status === 'paid');
  const pending = invoices.filter(i => i.status === 'pending');
  const overdue = invoices.filter(i => i.status === 'overdue');
  const totalBilled = invStatsData?.totalBilled ?? invoices.reduce((s, i) => s + i.amountNum, 0);
  const paidAmt = invStatsData?.paid?.amount ?? paid.reduce((s, i) => s + i.amountNum, 0);
  const pendingAmt = invStatsData?.pending?.amount ?? pending.reduce((s, i) => s + i.amountNum, 0);
  const overdueAmt = invStatsData?.overdue?.amount ?? overdue.reduce((s, i) => s + i.amountNum, 0);
  const invKpis = [
    { label: 'Total Billed', value: `$${totalBilled.toLocaleString()}`, change: '+$2.4K', up: true, sub: `${invoices.length} invoices`, icon: Icon3D_TotalBilled, gradient: 'from-emerald-500/10 to-emerald-500/5', borderGlow: 'hover:shadow-emerald-500/20' },
    { label: 'Paid', value: `$${paidAmt.toLocaleString()}`, change: `${paid.length} invoices`, up: true, sub: 'On time', icon: Icon3D_Paid, gradient: 'from-blue-500/10 to-blue-500/5', borderGlow: 'hover:shadow-blue-500/20' },
    { label: 'Pending', value: `$${pendingAmt.toLocaleString()}`, change: `${pending.length} invoices`, up: false, sub: 'Awaiting payment', icon: Icon3D_Pending, gradient: 'from-amber-500/10 to-amber-500/5', borderGlow: 'hover:shadow-amber-500/20' },
    { label: 'Overdue', value: `$${overdueAmt.toLocaleString()}`, change: `${overdue.length} invoices`, up: false, sub: 'Needs attention', icon: Icon3D_Overdue, gradient: 'from-red-500/10 to-red-500/5', borderGlow: 'hover:shadow-red-500/20' },
  ];

  const invStatusStyles: Record<string, { bg: string; text: string; bar: string }> = {
    paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', bar: 'bg-emerald-500' },
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', bar: 'bg-amber-500' },
    overdue: { bg: 'bg-red-500/10', text: 'text-red-600', bar: 'bg-red-500' },
  };

  const statusTabs = [
    { label: 'All', value: undefined, count: invoices.length },
    { label: 'Paid', value: 'PAID', count: paid.length },
    { label: 'Pending', value: 'PENDING', count: pending.length },
    { label: 'Overdue', value: 'OVERDUE', count: overdue.length },
  ];

  return (
    <>
    <div className="flex gap-1.5 h-full min-h-0 overflow-hidden">
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr] min-h-0 min-w-0">
        {/* ── Row 1: KPI cards ── */}
        {invKpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} data-animate className={`group relative overflow-hidden rounded-xl border border-border/60 bg-linear-to-br ${kpi.gradient} p-2 transition-all duration-300 hover:scale-[1.02] ${kpi.borderGlow} shadow-sm hover:shadow-lg`}>
              <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/80">{kpi.label}</p>
                  <p className="text-lg font-extrabold tracking-tight leading-tight">{kpi.value}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${kpi.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      {kpi.up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                      {kpi.change}
                    </span>
                    <span className="text-[8px] text-muted-foreground/70 truncate">{kpi.sub}</span>
                  </div>
                </div>
                <div className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"><Icon /></div>
              </div>
            </div>
          );
        })}

        {/* ── Row 2: Header bar with filters + Create ── */}
        <div data-animate className="lg:col-span-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm">
              <FileText className="size-3 text-white" />
            </div>
            <h3 className="text-[11px] font-semibold">Invoices</h3>
            {/* Status tabs */}
            <div className="flex items-center gap-0.5 ml-2">
              {statusTabs.map(tab => (
                <button key={tab.label}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium transition-all cursor-pointer ${statusFilter === tab.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted/50'}`}>
                  {tab.label}
                  <span className={`text-[8px] ${statusFilter === tab.value ? 'text-primary-foreground/70' : 'text-muted-foreground/50'}`}>({tab.count})</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-36">
              <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search invoices…" value={invSearch} onChange={(e) => setInvSearch(e.target.value)} className="h-7 pl-7 text-[10px] rounded-lg" />
            </div>
            <Button size="sm" className="h-7 gap-1 text-[10px] px-2.5 rounded-lg bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm" onClick={() => setCreateOpen(true)}>
              <Plus className="size-3" />New Invoice
            </Button>
          </div>
        </div>

        {/* ── Row 3: Invoice List (full width) ── */}
        <div data-animate className="lg:col-span-4 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          {/* Table header */}
          <div className="flex items-center gap-2 border-b border-border/40 px-3 py-1 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            <span className="w-5">#</span>
            <span className="flex-1">Client</span>
            <span className="w-14 text-center">Type</span>
            <span className="w-20 text-center">Method</span>
            <span className="w-20 text-center">Due</span>
            <span className="w-16 text-right">Amount</span>
            <span className="w-14 text-center">Status</span>
            <span className="w-6"></span>
          </div>
          <div className="flex flex-1 flex-col overflow-auto min-h-0">
            {isLoading && (
              <div className="flex flex-1 items-center justify-center p-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && invoices.map((inv, i) => {
              const style = invStatusStyles[inv.status] ?? invStatusStyles['pending'];
              return (
                <div key={inv.id} className="group/inv relative flex items-center gap-2 border-b border-border/20 px-3 py-1.5 transition-all duration-200 hover:bg-muted/30 cursor-pointer">
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full ${style.bar}`} />
                  <span className="w-5 text-[9px] text-muted-foreground font-mono">{i + 1}</span>
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm">
                      <FileText className="size-2.5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold leading-tight truncate">{inv.tenant}</p>
                      <p className="text-[8px] text-muted-foreground truncate">#{inv.id.slice(0, 8)} · Issued {inv.issued}</p>
                    </div>
                  </div>
                  <span className="w-14 text-center">
                    <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-medium ${inv.tenantType === 'SCHOOL' ? 'bg-blue-500/10 text-blue-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                      {inv.tenantType === 'SCHOOL' ? 'School' : 'Individual'}
                    </span>
                  </span>
                  <span className="w-20 text-center text-[9px] text-muted-foreground">{inv.method}</span>
                  <span className="w-20 text-center text-[9px] text-muted-foreground">{inv.due}</span>
                  <span className="w-16 text-right text-[10px] font-bold">{inv.amount}</span>
                  <span className={`w-14 text-center shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${style.bg} ${style.text}`}>{inv.status}</span>
                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-6 shrink-0 opacity-0 group-hover/inv:opacity-100 transition-opacity">
                        <MoreHorizontal className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {inv.status !== 'paid' && (
                        <DropdownMenuItem className="text-xs gap-2" onClick={() => markPaid.mutate(inv.id)}>
                          <CheckCircle className="size-3" />Mark as Paid
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-xs gap-2"><FileText className="size-3" />View Details</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => deleteInvoice.mutate(inv.id)}>
                        <Trash2 className="size-3" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {!isLoading && invoices.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center p-8">
                <FileText className="size-6 text-muted-foreground/30 mb-1" />
                <p className="text-xs text-muted-foreground">No invoices found</p>
                <Button size="sm" variant="outline" className="mt-2 h-7 text-[10px]" onClick={() => setCreateOpen(true)}>Create First Invoice</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Right sidebar ═══ */}
      <div className="hidden lg:flex w-44 flex-col gap-1 shrink-0 min-h-0">
        {/* Payment Status */}
        <div data-animate className="group relative flex flex-1 flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-blue-500/20 overflow-hidden min-h-0">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-1 flex-col min-h-0">
            <h3 className="text-[10px] font-semibold text-white mb-1.5">Payment Status</h3>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Collected', value: `$${paidAmt.toLocaleString()}`, pct: totalBilled > 0 ? Math.round((paidAmt / totalBilled) * 100) : 0, color: 'bg-emerald-500' },
                { label: 'Pending', value: `$${pendingAmt.toLocaleString()}`, pct: totalBilled > 0 ? Math.round((pendingAmt / totalBilled) * 100) : 0, color: 'bg-amber-500' },
                { label: 'Overdue', value: `$${overdueAmt.toLocaleString()}`, pct: totalBilled > 0 ? Math.round((overdueAmt / totalBilled) * 100) : 0, color: 'bg-red-500' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-[7px] text-slate-400 mb-0.5">
                    <span>{s.label}</span><span className="font-bold text-slate-300">{s.value}</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full">
              <div className="bg-emerald-500" style={{ width: `${totalBilled > 0 ? Math.round((paidAmt / totalBilled) * 100) : 52}%` }} />
              <div className="bg-amber-500" style={{ width: `${totalBilled > 0 ? Math.round((pendingAmt / totalBilled) * 100) : 36}%` }} />
              <div className="bg-red-500" style={{ width: `${totalBilled > 0 ? Math.round((overdueAmt / totalBilled) * 100) : 12}%` }} />
            </div>
          </div>
        </div>

        {/* Client Breakdown */}
        <div data-animate className="group relative flex flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-violet-500/20 overflow-hidden" style={{ minHeight: 80 }}>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-col gap-1">
            <h3 className="text-[10px] font-semibold text-white">By Client Type</h3>
            {(() => {
              const schools = invoices.filter(i => i.tenantType === 'SCHOOL');
              const individuals = invoices.filter(i => i.tenantType === 'INDIVIDUAL');
              const schoolAmt = schools.reduce((s, i) => s + i.amountNum, 0);
              const indAmt = individuals.reduce((s, i) => s + i.amountNum, 0);
              return [
                { label: 'Schools', count: schools.length, amount: `$${schoolAmt.toLocaleString()}`, color: 'bg-blue-500', pct: totalBilled > 0 ? Math.round((schoolAmt / totalBilled) * 100) : 60 },
                { label: 'Individuals', count: individuals.length, amount: `$${indAmt.toLocaleString()}`, color: 'bg-emerald-500', pct: totalBilled > 0 ? Math.round((indAmt / totalBilled) * 100) : 40 },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-[7px] text-slate-400 mb-0.5">
                    <span>{s.label} ({s.count})</span><span className="font-bold text-slate-300">{s.amount}</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Alerts */}
        <div data-animate className="group relative flex flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-amber-500/20 overflow-hidden" style={{ minHeight: 80 }}>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-amber-500 via-orange-500 to-red-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-white">Alerts</h3>
              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[8px] font-medium text-red-400">
                <span className="h-1 w-1 rounded-full bg-red-500 animate-pulse" />{overdue.length}
              </span>
            </div>
            <p className="text-[8px] text-slate-400">{overdue.length} overdue invoice{overdue.length !== 1 ? 's' : ''} requiring follow-up</p>
            {overdue.slice(0, 3).map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-md bg-red-500/5 px-1.5 py-0.5 border border-red-500/10">
                <span className="text-[8px] text-red-300 truncate flex-1">{inv.tenant}</span>
                <span className="text-[8px] font-bold text-red-400 ml-1">{inv.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ── Create Invoice Dialog ── */}
    <CreateInvoiceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
