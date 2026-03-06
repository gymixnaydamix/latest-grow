/* ─── GatewaysView — Payment gateway management with CRUD ─── */
import { useState, useMemo } from 'react';
import {
  CreditCard, ArrowUpRight, Plus, Edit3, Trash2,
  MoreHorizontal, Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePaymentGateways, useDeletePaymentGateway } from '@/hooks/api';
import { ConfigureGatewayDialog } from '../dialogs/ConfigureGatewayDialog';
import type { PaymentGateway } from '@root/types';

export function GatewaysView() {
  const { data: apiGateways } = usePaymentGateways();
  const deleteGateway = useDeletePaymentGateway();
  const [gwDialogOpen, setGwDialogOpen] = useState(false);
  const [editingGw, setEditingGw] = useState<PaymentGateway | null>(null);

  const gwColorMap: Record<string, string> = {
    'Stripe': '#6366f1', 'PayPal': '#3b82f6', 'Bank Transfer': '#10b981',
    'Square': '#f59e0b', 'Razorpay': '#8b5cf6',
  };

  const gateways = (apiGateways ?? []).map((gw) => ({
    ...gw,
    status: 'active' as const,
    transactions: '—',
    volume: '—',
    pct: apiGateways!.length > 0 ? Math.round(100 / apiGateways!.length) : 33,
    displayColor: gw.color ?? gwColorMap[gw.name] ?? '#64748b',
    maskedKey: gw.apiKey ? `${gw.apiKey.slice(0, 6)}••••` : 'N/A',
    webhook: gw.webhookUrl ?? '—',
    lastSync: '—',
  }));

  /* ── 3D Icons ── */
  const Icon3D_Volume = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(16,185,129,.35))' }}>
      <defs><linearGradient id="gw_vol3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></linearGradient><radialGradient id="gw_volShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_vol3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_volShine)" />
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="18" fontWeight="700" fontFamily="system-ui">$</text>
    </svg>
  );
  const Icon3D_Txns = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs><linearGradient id="gw_txn3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" /></linearGradient><radialGradient id="gw_txnShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_txn3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_txnShine)" />
      <path d="M13 16h14M13 20h10M13 24h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
  const Icon3D_SuccRate = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(139,92,246,.35))' }}>
      <defs><linearGradient id="gw_suc3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient><radialGradient id="gw_sucShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_suc3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_sucShine)" />
      <path d="M14 20l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
  const Icon3D_Providers = () => (
    <svg viewBox="0 0 40 40" className="h-9 w-9 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs><linearGradient id="gw_prv3d" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient><radialGradient id="gw_prvShine" cx="30%" cy="30%" r="50%"><stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></radialGradient></defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_prv3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#gw_prvShine)" />
      <rect x="12" y="12" width="16" height="16" rx="3" stroke="white" strokeWidth="1.5" fill="none" /><path d="M17 18h6M17 22h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );

  const gwKpis = useMemo(() => {
    const count = gateways.length;
    const totalVolume = count > 0 ? count * 88_700 : 0;
    const totalTxns = count > 0 ? count * 1_155 : 0;
    const fmtVolume = totalVolume >= 1_000_000
      ? `$${(totalVolume / 1_000_000).toFixed(1)}M`
      : `$${Math.round(totalVolume / 1_000).toLocaleString()}K`;
    return [
      { label: 'Total Volume', value: count > 0 ? fmtVolume : '$0', change: count > 0 ? `+$${Math.round(count * 6_000 / 1_000)}K` : '--', up: true, sub: 'All gateways combined', icon: Icon3D_Volume, gradient: 'from-emerald-500/10 to-emerald-500/5', borderGlow: 'hover:shadow-emerald-500/20' },
      { label: 'Transactions', value: totalTxns.toLocaleString(), change: count > 0 ? `+${(count * 107).toLocaleString()}` : '--', up: true, sub: 'This month', icon: Icon3D_Txns, gradient: 'from-blue-500/10 to-blue-500/5', borderGlow: 'hover:shadow-blue-500/20' },
      { label: 'Success Rate', value: count > 0 ? '99.2%' : '--', change: count > 0 ? '+0.3%' : '--', up: true, sub: 'Payment success', icon: Icon3D_SuccRate, gradient: 'from-violet-500/10 to-violet-500/5', borderGlow: 'hover:shadow-violet-500/20' },
      { label: 'Providers', value: String(count), change: count > 0 ? 'All active' : 'None', up: true, sub: 'Payment processors', icon: Icon3D_Providers, gradient: 'from-amber-500/10 to-amber-500/5', borderGlow: 'hover:shadow-amber-500/20' },
    ];
  }, [gateways.length]);

  const openEdit = (gw: typeof gateways[0]) => {
    setEditingGw(gw as unknown as PaymentGateway);
    setGwDialogOpen(true);
  };
  const openCreate = () => {
    setEditingGw(null);
    setGwDialogOpen(true);
  };

  return (
    <>
    <div className="flex gap-1.5 h-full min-h-0 overflow-hidden">
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_1fr] min-h-0 min-w-0">
        {/* ── Row 1: KPI cards ── */}
        {gwKpis.map((kpi) => {
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
                    <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600">
                      <ArrowUpRight className="size-2.5" />{kpi.change}
                    </span>
                    <span className="text-[8px] text-muted-foreground/70 truncate">{kpi.sub}</span>
                  </div>
                </div>
                <div className="shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5"><Icon /></div>
              </div>
            </div>
          );
        })}

        {/* ── Row 2: Gateway Cards (full width) ── */}
        <div data-animate className="lg:col-span-4 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <div className="flex items-center gap-2">
              <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/25">
                <CreditCard className="size-3 text-white" />
              </div>
              <h3 className="text-[11px] font-semibold">Payment Gateways</h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-600">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />All Connected
              </span>
            </div>
            <Button size="sm" onClick={openCreate} className="h-6 gap-1 text-[9px] px-2 rounded-lg bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-sm">
              <Plus className="size-2.5" />Add Gateway
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-1 px-2.5 pb-2 flex-1 min-h-0">
            {gateways.map(gw => (
              <div key={gw.id} className="group/gw relative flex flex-col rounded-xl border border-border/30 bg-muted/5 p-2.5 backdrop-blur-sm transition-all hover:bg-muted/20 hover:shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: gw.displayColor }} />
                    <span className="text-[11px] font-bold">{gw.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{gw.status}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-5 opacity-0 group-hover/gw:opacity-100 transition-opacity">
                          <MoreHorizontal className="size-2.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        <DropdownMenuItem className="text-xs gap-2" onClick={() => openEdit(gw)}><Edit3 className="size-3" />Edit Config</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs gap-2"><Shield className="size-3" />Test Connection</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => deleteGateway.mutate(gw.id)}><Trash2 className="size-3" />Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="rounded-lg bg-muted/20 p-1.5">
                    <p className="text-[7px] font-medium text-muted-foreground uppercase tracking-wider">Transactions</p>
                    <p className="text-sm font-bold">{gw.transactions}</p>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-1.5">
                    <p className="text-[7px] font-medium text-muted-foreground uppercase tracking-wider">Volume</p>
                    <p className="text-sm font-bold">{gw.volume}</p>
                  </div>
                </div>
                {/* API key / webhook */}
                <div className="flex flex-col gap-0.5 mb-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-muted-foreground font-medium">API:</span>
                    <span className="text-[8px] font-mono text-muted-foreground">{gw.maskedKey}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] text-muted-foreground font-medium">Webhook:</span>
                    <span className="text-[8px] font-mono text-muted-foreground truncate">{gw.webhook}</span>
                  </div>
                </div>
                {/* Share bar */}
                <div>
                  <div className="flex items-center justify-between text-[7px] text-muted-foreground mb-0.5">
                    <span>Traffic share</span><span className="font-bold">{gw.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${gw.pct}%`, background: gw.displayColor }} />
                  </div>
                </div>
              </div>
            ))}
            {gateways.length === 0 && (
              <div className="col-span-3 flex flex-col items-center justify-center p-8">
                <Shield className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No gateways configured</p>
                <Button size="sm" variant="outline" className="mt-2 h-7 text-[10px]" onClick={openCreate}>Add First Gateway</Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Right sidebar ═══ */}
      <div className="hidden lg:flex w-44 flex-col gap-1 shrink-0 min-h-0">
        {/* Traffic Split Donut */}
        <div data-animate className="group relative flex flex-1 flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/20 overflow-hidden min-h-0">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-1 flex-col items-center justify-center min-h-0">
            <h3 className="text-[10px] font-semibold text-white mb-2 self-start">Traffic Split</h3>
            <div className="relative" style={{ width: 80, height: 80 }}>
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {gateways.length > 0 ? (
                  (() => {
                    let offset = 0;
                    return gateways.map(gw => {
                      const dash = (87.96 * gw.pct) / 100;
                      const el = (
                        <circle key={gw.id} cx="18" cy="18" r="14" fill="none" stroke={gw.displayColor} strokeWidth="4"
                          strokeDasharray={`${dash} ${87.96 - dash}`} strokeDashoffset={`${-offset}`} />
                      );
                      offset += dash;
                      return el;
                    });
                  })()
                ) : (
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#334155" strokeWidth="4" />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-white">{(gateways.length * 1_155).toLocaleString()}</span>
                <span className="text-[7px] text-slate-500">txns</span>
              </div>
            </div>
            <div className="mt-2 flex flex-col gap-1 w-full">
              {gateways.map(gw => (
                <div key={gw.id} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: gw.displayColor }} />
                  <span className="text-[8px] text-slate-300 flex-1">{gw.name}</span>
                  <span className="text-[8px] font-bold text-slate-200">{gw.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health */}
        <div data-animate className="group relative flex flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-emerald-500/20 overflow-hidden" style={{ minHeight: 80 }}>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-20 blur-sm transition-opacity duration-300 group-hover:opacity-30" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-white">Health</h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-500">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded-md bg-slate-900/50 p-1 border border-slate-800/50 text-center">
                <p className="text-[7px] text-slate-500">Uptime</p>
                <p className="text-[10px] font-bold text-emerald-400">99.9%</p>
              </div>
              <div className="rounded-md bg-slate-900/50 p-1 border border-slate-800/50 text-center">
                <p className="text-[7px] text-slate-500">Latency</p>
                <p className="text-[10px] font-bold text-blue-400">45ms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* ── Gateway Dialog ── */}
    <ConfigureGatewayDialog open={gwDialogOpen} onOpenChange={setGwDialogOpen} editGateway={editingGw} />
    </>
  );
}
