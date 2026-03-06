/* ─── PlatformCRMSection ─── Provider: sales pipeline + tenant accounts ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  TrendingUp, DollarSign, Target, Star,
  Phone, Mail, MoreHorizontal, Plus, Search,
  Trash2, Edit, ArrowRight, Loader2, Heart,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useCrmDealStats, useCrmDealsByStage, useDeleteCrmDeal, useUpdateCrmDeal,
  useCrmAccounts, useTouchCrmAccount, useDeleteCrmAccount,
} from '@/hooks/api';
import { CreateDealDialog } from '../dialogs/CreateDealDialog';
import type { CrmDeal } from '@root/types';

/* ── Main Export ───────────────────────────────────────────────── */
export function PlatformCRMSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader]);

  const view = (() => {
    switch (activeHeader) {
      case 'sales_pipeline': return <SalesPipelineView />;
      case 'tenant_accounts': return <TenantAccountsView />;
      default: return <SalesPipelineView />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ═══ Sales Pipeline — Full CRUD with API ═══ */
function SalesPipelineView() {
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<CrmDeal | null>(null);
  const [search, setSearch] = useState('');

  const { data: stats, isLoading: statsLoading } = useCrmDealStats();
  const { data: stageData, isLoading: stagesLoading } = useCrmDealsByStage();
  const deleteDeal = useDeleteCrmDeal();
  const updateDeal = useUpdateCrmDeal();

  const statsData = stats;
  const stages = stageData ?? [];
  // Filter out closed stages for the kanban
  const activePipeline = stages.filter(s => s.stage !== 'CLOSED_WON' && s.stage !== 'CLOSED_LOST');
  const totalValue = statsData?.pipelineValue ?? 0;
  const totalDeals = stages.reduce((s, st) => s + st.count, 0);

  const stageColors: Record<string, string> = {
    PROSPECT: 'from-slate-500 to-slate-600',
    QUALIFIED: 'from-blue-500 to-blue-600',
    PROPOSAL: 'from-violet-500 to-violet-600',
    NEGOTIATION: 'from-amber-500 to-amber-600',
    CLOSED_WON: 'from-emerald-500 to-emerald-600',
    CLOSED_LOST: 'from-red-500 to-red-600',
  };

  const stageLabels: Record<string, string> = {
    PROSPECT: 'Prospect', QUALIFIED: 'Qualified', PROPOSAL: 'Proposal',
    NEGOTIATION: 'Negotiation', CLOSED_WON: 'Closed Won', CLOSED_LOST: 'Closed Lost',
  };

  const openEdit = (deal: CrmDeal) => { setEditingDeal(deal); setDealDialogOpen(true); };
  const openCreate = () => { setEditingDeal(null); setDealDialogOpen(true); };

  const advanceDeal = (deal: CrmDeal) => {
    const order = ['PROSPECT', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'];
    const idx = order.indexOf(deal.stage);
    if (idx >= 0 && idx < order.length - 1) {
      updateDeal.mutate({ id: deal.id, stage: order[idx + 1] as CrmDeal['stage'] });
    }
  };

  return (
    <>
      <CreateDealDialog open={dealDialogOpen} onOpenChange={setDealDialogOpen} editDeal={editingDeal} />

      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold">Sales Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            {statsLoading ? '…' : `${totalDeals} deals · Pipeline $${totalValue.toLocaleString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals…" className="h-8 w-48 pl-7 text-xs" />
          </div>
          <Button size="sm" onClick={openCreate} className="gap-1 text-xs bg-linear-to-r from-violet-500 to-purple-600 text-white">
            <Plus className="size-3" /> New Deal
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-4" data-animate>
        {[
          { label: 'Pipeline Value', value: statsLoading ? '…' : `$${(statsData?.pipelineValue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Active Deals', value: statsLoading ? '…' : String(statsData?.totalDeals ?? 0), icon: Target, color: 'text-blue-500' },
          { label: 'Win Rate', value: statsLoading ? '…' : `${statsData?.winRate ?? 0}%`, icon: TrendingUp, color: 'text-violet-500' },
          { label: 'Avg Deal Size', value: statsLoading ? '…' : `$${(statsData?.avgDealSize ?? 0).toLocaleString()}`, icon: Star, color: 'text-amber-500' },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className={`flex size-9 items-center justify-center rounded-lg bg-muted ${m.color}`}>
                <m.icon className="size-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Pipeline */}
      {stagesLoading ? (
        <div className="flex items-center justify-center py-12" data-animate>
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2" data-animate>
          {activePipeline.map(stageGroup => {
            const filtered = search
              ? stageGroup.deals.filter(d =>
                  d.name.toLowerCase().includes(search.toLowerCase()) ||
                  d.contactName.toLowerCase().includes(search.toLowerCase()))
              : stageGroup.deals;

            return (
              <div key={stageGroup.stage} className="min-w-65 flex-1">
                <div className={`flex items-center justify-between rounded-t-lg bg-linear-to-r ${stageColors[stageGroup.stage] ?? 'from-slate-500 to-slate-600'} px-3 py-2`}>
                  <span className="text-xs font-semibold text-white">{stageLabels[stageGroup.stage] ?? stageGroup.stage}</span>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] border-white/30 text-white bg-white/10">{filtered.length}</Badge>
                    <span className="text-[10px] text-white/70">${stageGroup.totalValue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-1.5 rounded-b-lg border border-t-0 p-2 min-h-25">
                  {filtered.length === 0 && (
                    <p className="text-center text-[10px] text-muted-foreground py-4">No deals</p>
                  )}
                  {filtered.map(deal => (
                    <Card key={deal.id} className="group cursor-pointer hover:border-primary/40 transition-colors">
                      <CardContent className="py-2.5 px-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">{deal.name}</p>
                            {deal.tenant && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${deal.tenant.type === 'SCHOOL' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                                {deal.tenant.name}
                              </p>
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="size-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="size-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem onClick={() => openEdit(deal)}>
                                <Edit className="size-3 mr-1.5" /> Edit Deal
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => advanceDeal(deal)}>
                                <ArrowRight className="size-3 mr-1.5" /> Advance Stage
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => deleteDeal.mutate(deal.id)}>
                                <Trash2 className="size-3 mr-1.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs font-bold text-primary">${deal.value.toLocaleString()}</span>
                          <span className="text-[10px] text-muted-foreground">{deal.probability}% prob</span>
                        </div>
                        {deal.contactName && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">Contact: {deal.contactName}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Closed deals summary */}
      {!stagesLoading && (
        <div className="grid grid-cols-2 gap-3" data-animate>
          {stages.filter(s => s.stage === 'CLOSED_WON' || s.stage === 'CLOSED_LOST').map(sg => (
            <Card key={sg.stage}>
              <CardContent className="py-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold">{stageLabels[sg.stage]}</h4>
                  <Badge variant={sg.stage === 'CLOSED_WON' ? 'default' : 'destructive'} className="text-[10px]">
                    {sg.count} deals · ${sg.totalValue.toLocaleString()}
                  </Badge>
                </div>
                <div className="space-y-1 max-h-32 overflow-auto">
                  {sg.deals.slice(0, 5).map(d => (
                    <div key={d.id} className="flex items-center justify-between text-[10px] py-0.5">
                      <span className="truncate">{d.name}</span>
                      <span className="font-bold">${d.value.toLocaleString()}</span>
                    </div>
                  ))}
                  {sg.count === 0 && <p className="text-[10px] text-muted-foreground">No deals yet</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* ═══ Tenant Accounts — Health management ═══ */
function TenantAccountsView() {
  const [search, setSearch] = useState('');
  const { data: accountData, isLoading } = useCrmAccounts(search || undefined);
  const touchAccount = useTouchCrmAccount();
  const deleteAccount = useDeleteCrmAccount();

  const accounts = accountData ?? [];

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold">Tenant Accounts</h2>
          <p className="text-sm text-muted-foreground">Customer health scores and account management</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts…" className="h-8 w-48 pl-7 text-xs" />
        </div>
      </div>

      {/* Health summary */}
      <div className="grid gap-3 sm:grid-cols-4" data-animate>
        {[
          { label: 'Total Accounts', value: accounts.length, color: 'text-blue-500', icon: Target },
          { label: 'Healthy (80+)', value: accounts.filter(a => a.healthScore >= 80).length, color: 'text-emerald-500', icon: Heart },
          { label: 'At Risk (50-79)', value: accounts.filter(a => a.healthScore >= 50 && a.healthScore < 80).length, color: 'text-amber-500', icon: TrendingUp },
          { label: 'Critical (<50)', value: accounts.filter(a => a.healthScore < 50).length, color: 'text-red-500', icon: Star },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="flex items-center gap-3 py-3">
              <div className={`flex size-8 items-center justify-center rounded-lg bg-muted ${m.color}`}>
                <m.icon className="size-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-base font-bold">{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12" data-animate>
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-2" data-animate>
          {accounts.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No tenant accounts found. Accounts are created when you track tenant health.</p>
              </CardContent>
            </Card>
          )}
          {accounts.map(acc => {
            const t = acc.tenant;
            const healthColor = acc.healthScore >= 80 ? 'text-emerald-500' : acc.healthScore >= 50 ? 'text-amber-500' : 'text-destructive';
            const healthBg = acc.healthScore >= 80 ? 'bg-emerald-500' : acc.healthScore >= 50 ? 'bg-amber-500' : 'bg-destructive';
            const daysSinceTouch = Math.floor((Date.now() - new Date(acc.lastTouchAt).getTime()) / (1000 * 60 * 60 * 24));

            return (
              <Card key={acc.id} className="group cursor-pointer hover:border-primary/40 transition-colors">
                <CardContent className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-xs">{t?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) ?? '??'}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background ${healthBg}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        ${(t?.mrr ?? 0).toLocaleString()}/mo · {t?.userCount ?? 0} users · Last touch {daysSinceTouch}d ago
                      </p>
                      {acc.tags.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {acc.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-[8px] px-1 py-0">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 text-right">
                      <div className="flex justify-between text-[10px]">
                        <span>Health</span>
                        <span className={healthColor}>{acc.healthScore}%</span>
                      </div>
                      <Progress value={acc.healthScore} className="h-1.5 mt-0.5" />
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="size-7" onClick={() => touchAccount.mutate(acc.id)} title="Log touch">
                        <Phone className="size-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7" title="Email">
                        <Mail className="size-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost" className="size-7">
                            <MoreHorizontal className="size-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-xs">
                          <DropdownMenuItem onClick={() => touchAccount.mutate(acc.id)}>
                            <Phone className="size-3 mr-1.5" /> Log Touch
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteAccount.mutate(acc.id)}>
                            <Trash2 className="size-3 mr-1.5" /> Remove Account
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
