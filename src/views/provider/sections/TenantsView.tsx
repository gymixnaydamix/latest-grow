/* â”€â”€â”€ TenantsView â€” Functional tenant management: list, add, edit, suspend â”€â”€â”€ */
import { useState } from 'react';
import {
  Users, CreditCard, Search, ArrowUpRight, ArrowDownRight,
  Activity, Building2, Plus, Eye, Edit3, Trash2, Ban,
  Download, Send, CheckCircle, Upload, MoreHorizontal, Loader2,
  X, Mail, Phone, Calendar, Shield, BarChart3, MapPinned, ExternalLink,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useTenants, useTenant, useTenantStats, useDeleteTenant, useSuspendTenant,
  useExportTenantsCsv,
} from '@/hooks/api';
import { buildFallbackBoundingBox, buildOsmEmbedUrl, buildOsmMarkerUrl } from '@/lib/maps';
import { AddTenantDialog, BulkImportDialog, SendInvitesDialog, EditTenantDialog } from '../dialogs';

export function TenantsView({ subNav }: { subNav: string }) {
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editTenant, setEditTenant] = useState<(typeof filtered)[number] | null>(null);

  const isSchools = subNav === 'schools';
  const isIndividuals = subNav === 'individuals';
  const typeFilter = isSchools ? 'SCHOOL' : isIndividuals ? 'INDIVIDUAL' : undefined;

  const { data: tenantData, isLoading } = useTenants(typeFilter, search || undefined);
  const { data: stats } = useTenantStats(typeFilter);
  const { data: detailTenant, isLoading: detailLoading } = useTenant(detailId);
  const deleteTenant = useDeleteTenant();
  const suspendTenant = useSuspendTenant();
  const exportCsv = useExportTenantsCsv();

  const filtered = tenantData?.data ?? [];
  const typeLabel = isIndividuals ? 'Individual Tenants' : isSchools ? 'School Tenants' : 'All Tenants';
  const addLabel = isIndividuals ? 'Add Individual' : isSchools ? 'Add School' : 'Add Tenant';

  const filteredMrr = stats?.totalMrr ?? filtered.reduce((s, t) => s + (t.mrr ?? 0), 0);
  const filteredActive = stats?.active ?? filtered.filter(t => t.status === 'ACTIVE').length;
  const filteredTrial = stats?.trial ?? filtered.filter(t => t.status === 'TRIAL').length;
  const filteredChurned = stats?.churned ?? filtered.filter(t => t.status === 'CHURNED').length;
  const total = stats?.total ?? filtered.length;

  const statusStyles: Record<string, { bg: string; dot: string }> = {
    ACTIVE: { bg: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
    active: { bg: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
    TRIAL: { bg: 'bg-blue-500/10 text-blue-600', dot: 'bg-blue-500' },
    trial: { bg: 'bg-blue-500/10 text-blue-600', dot: 'bg-blue-500' },
    SUSPENDED: { bg: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
    CHURNED: { bg: 'bg-red-500/10 text-red-600', dot: 'bg-red-500' },
    churned: { bg: 'bg-red-500/10 text-red-600', dot: 'bg-red-500' },
  };

  const detailSchool = detailTenant?.school ?? null;
  const detailSchoolHasCoordinates =
    detailTenant?.type === 'SCHOOL' &&
    typeof detailSchool?.latitude === 'number' &&
    typeof detailSchool?.longitude === 'number';

  const detailSchoolLatitude = detailSchoolHasCoordinates ? detailSchool.latitude : null;
  const detailSchoolLongitude = detailSchoolHasCoordinates ? detailSchool.longitude : null;

  const detailSchoolEmbedUrl = detailSchoolLatitude !== null && detailSchoolLongitude !== null
    ? buildOsmEmbedUrl(
        detailSchoolLatitude,
        detailSchoolLongitude,
        buildFallbackBoundingBox(detailSchoolLatitude, detailSchoolLongitude),
      )
    : null;

  const detailSchoolMarkerUrl = detailSchoolLatitude !== null && detailSchoolLongitude !== null
    ? buildOsmMarkerUrl(detailSchoolLatitude, detailSchoolLongitude)
    : null;

  const statCards = [
    { label: 'Total', value: String(total), sub: typeLabel, icon: Building2, gradient: 'from-blue-500/10 to-blue-500/5', borderGlow: 'hover:shadow-blue-500/20', change: '+2', up: true },
    { label: 'Active', value: String(filteredActive), sub: 'Currently subscribed', icon: CheckCircle, gradient: 'from-emerald-500/10 to-emerald-500/5', borderGlow: 'hover:shadow-emerald-500/20', change: `${total > 0 ? Math.round((filteredActive/total)*100) : 0}%`, up: true },
    { label: 'Trial', value: String(filteredTrial), sub: 'In trial period', icon: Activity, gradient: 'from-amber-500/10 to-amber-500/5', borderGlow: 'hover:shadow-amber-500/20', change: filteredTrial > 0 ? 'converting' : 'â€”', up: true },
    { label: 'MRR', value: `$${filteredMrr.toLocaleString()}`, sub: 'Monthly revenue', icon: CreditCard, gradient: 'from-violet-500/10 to-violet-500/5', borderGlow: 'hover:shadow-violet-500/20', change: '+$820', up: true },
  ];

  return (
    <>
    <div className="flex gap-1.5 h-full min-h-0 overflow-hidden">
      <div className="grid flex-1 gap-1 lg:grid-cols-4 lg:grid-rows-[auto_auto_1fr] min-h-0 min-w-0">
        {/* â”€â”€ Row 1: 4 stat cards â”€â”€ */}
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} data-animate className={`group relative overflow-hidden rounded-xl border border-border/60 bg-linear-to-br ${s.gradient} p-2 transition-all duration-300 hover:scale-[1.02] ${s.borderGlow} shadow-sm hover:shadow-lg`}>
              <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/80">{s.label}</p>
                  <p className="text-lg font-extrabold tracking-tight leading-tight">{s.value}</p>
                  <div className="mt-0.5 flex items-center gap-1">
                    <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${s.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                      {s.up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                      {s.change}
                    </span>
                    <span className="text-[8px] text-muted-foreground/70 truncate">{s.sub}</span>
                  </div>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-sm">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          );
        })}

        {/* â”€â”€ Row 2: Header bar with Add + Search â”€â”€ */}
        <div data-animate className="lg:col-span-4 flex items-center justify-between rounded-xl border border-border/60 bg-card px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm">
              {isSchools ? <Building2 className="size-3 text-white" /> : <Users className="size-3 text-white" />}
            </div>
            <div>
              <h3 className="text-[11px] font-semibold">{typeLabel}</h3>
              <p className="text-[8px] text-muted-foreground">{filtered.length} tenants Â· ${filteredMrr.toLocaleString()}/mo MRR</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative w-36">
              <Search className="absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tenantsâ€¦" value={search} onChange={(e) => setSearch(e.target.value)} className="h-7 pl-7 text-[10px] rounded-lg" />
            </div>
            <Button size="sm" className="h-7 gap-1 text-[10px] px-2.5 rounded-lg bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm" onClick={() => setAddOpen(true)}>
              <Plus className="size-3" />{addLabel}
            </Button>
          </div>
        </div>

        {/* â”€â”€ Row 3: Tenant list (scrollable) â”€â”€ */}
        <div data-animate className="lg:col-span-4 flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm min-h-0">
          <div className="flex items-center gap-2 border-b border-border/40 px-3 py-1 text-[8px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            <span className="w-5">#</span>
            <span className="flex-1">Tenant</span>
            <span className="w-16 text-center">Plan</span>
            <span className="w-14 text-center">Users</span>
            <span className="w-16 text-right">MRR</span>
            <span className="w-14 text-center">Status</span>
            <span className="w-6"></span>
          </div>
          <div className="flex flex-1 flex-col overflow-auto min-h-0">
            {isLoading && (
              <div className="flex flex-1 items-center justify-center p-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && filtered.map((t, i) => {
              const sty = statusStyles[t.status] ?? statusStyles['ACTIVE'];
              const joined = t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'â€”';
              return (
                <div key={t.id} className="group/row relative flex items-center gap-2 border-b border-border/20 px-3 py-1.5 transition-all duration-200 hover:bg-muted/30 cursor-pointer">
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.75 rounded-r-full ${sty.dot}`} />
                  <span className="w-5 text-[9px] text-muted-foreground font-mono">{i + 1}</span>
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/40 text-[9px] font-bold">
                      {t.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold leading-tight truncate">{t.name}</p>
                      <p className="text-[8px] text-muted-foreground truncate">{t.email} Â· Joined {joined}</p>
                    </div>
                  </div>
                  <span className="w-16 text-center text-[9px] font-medium">{t.plan ?? 'â€”'}</span>
                  <span className="w-14 text-center text-[9px] font-mono">{(t.userCount ?? 0).toLocaleString()}</span>
                  <span className="w-16 text-right text-[10px] font-bold">${(t.mrr ?? 0).toLocaleString()}</span>
                  <span className={`w-14 text-center shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${sty.bg}`}>{t.status?.toLowerCase()}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-6 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <MoreHorizontal className="size-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setDetailId(t.id)}><Eye className="size-3" />View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => setEditTenant(t)}><Edit3 className="size-3" />Edit Tenant</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-xs gap-2" onClick={() => suspendTenant.mutate(t.id)}><Ban className="size-3" />Suspend</DropdownMenuItem>
                      <DropdownMenuItem className="text-xs gap-2 text-destructive" onClick={() => deleteTenant.mutate(t.id)}><Trash2 className="size-3" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
            {!isLoading && filtered.length === 0 && (
              <div className="flex flex-1 items-center justify-center p-8">
                <p className="text-xs text-muted-foreground">No tenants found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* â•â•â• Right sidebar â•â•â• */}
      <div className="hidden lg:flex w-44 flex-col gap-1 shrink-0 min-h-0">
        {/* Quick Actions */}
        <div data-animate className="group relative flex flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-blue-500/20 overflow-hidden">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-20 blur-sm" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-col gap-1">
            <h3 className="text-[10px] font-semibold text-white mb-0.5">Quick Actions</h3>
            {[
              { label: addLabel, icon: Plus, color: 'from-blue-500 to-indigo-500', action: () => setAddOpen(true) },
              { label: 'Bulk Import', icon: Upload, color: 'from-emerald-500 to-teal-500', action: () => setBulkOpen(true) },
              { label: 'Export CSV', icon: Download, color: 'from-violet-500 to-purple-500', action: () => exportCsv.mutate(typeFilter) },
              { label: 'Send Invites', icon: Send, color: 'from-amber-500 to-orange-500', action: () => setInviteOpen(true) },
            ].map(a => (
              <button key={a.label} onClick={a.action} className="flex items-center gap-1.5 rounded-md bg-slate-900/50 px-2 py-1.5 border border-slate-800/50 text-[9px] text-slate-300 transition-all hover:bg-slate-800/60 hover:text-white hover:border-slate-700/60 cursor-pointer">
                <div className={`flex h-4 w-4 items-center justify-center rounded bg-linear-to-br ${a.color}`}>
                  <a.icon className="size-2.5 text-white" />
                </div>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div data-animate className="group relative flex flex-1 flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-emerald-500/20 overflow-hidden min-h-0">
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-20 blur-sm" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-1 flex-col min-h-0">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-white">Activity</h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-medium text-emerald-500">
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />Live
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-1 overflow-auto min-h-0">
              {[
                { text: 'Springfield Academy renewed', color: 'bg-emerald-500', time: '2h ago' },
                { text: 'Pine Grove started trial', color: 'bg-blue-500', time: '1d ago' },
                { text: 'Maria Santos churned', color: 'bg-red-500', time: '3d ago' },
                { text: 'David Chen upgraded to Pro', color: 'bg-violet-500', time: '5d ago' },
                { text: 'Oak Valley added 20 users', color: 'bg-amber-500', time: '1w ago' },
              ].map((ev, i) => (
                <div key={i} className="flex items-start gap-1.5 rounded-md bg-slate-900/50 p-1 border border-slate-800/50">
                  <span className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${ev.color} ${i === 0 ? 'animate-pulse' : ''}`} />
                  <div className="min-w-0">
                    <p className="text-[8px] text-slate-300 leading-tight">{ev.text}</p>
                    <p className="text-[7px] text-slate-500">{ev.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div data-animate className="group relative flex flex-col rounded-xl bg-slate-950 p-2 shadow-2xl transition-all duration-300 hover:shadow-violet-500/20 overflow-hidden" style={{ minHeight: 85 }}>
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500 via-purple-500 to-pink-500 opacity-20 blur-sm" />
          <div className="absolute inset-px rounded-[11px] bg-slate-950" />
          <div className="relative flex flex-col gap-1">
            <h3 className="text-[10px] font-semibold text-white">Status Breakdown</h3>
            {[
              { label: 'Active', count: filteredActive, pct: Math.round((filteredActive / Math.max(filtered.length, 1)) * 100), color: 'bg-emerald-500' },
              { label: 'Trial', count: filteredTrial, pct: Math.round((filteredTrial / Math.max(filtered.length, 1)) * 100), color: 'bg-blue-500' },
              { label: 'Churned', count: filteredChurned, pct: Math.round((filteredChurned / Math.max(filtered.length, 1)) * 100), color: 'bg-red-500' },
            ].map(s => (
              <div key={s.label}>
                <div className="flex items-center justify-between text-[7px] text-slate-400 mb-0.5">
                  <span>{s.label} ({s.count})</span><span>{s.pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-slate-800">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* â”€â”€ Dialogs â”€â”€ */}
    <AddTenantDialog open={addOpen} onOpenChange={setAddOpen} defaultType={isIndividuals ? 'INDIVIDUAL' : 'SCHOOL'} />
    <BulkImportDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    <SendInvitesDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    {editTenant && (
      <EditTenantDialog open={!!editTenant} onOpenChange={(v) => { if (!v) setEditTenant(null); }} tenant={editTenant} />
    )}

    {/* â”€â”€ Detail Drawer Overlay â”€â”€ */}
    {detailId && (
      <div className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDetailId(null)} />
        <div className="relative w-95 max-w-full h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <h2 className="text-sm font-bold">Tenant Details</h2>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setDetailId(null)}><X className="size-4" /></Button>
          </div>
          {/* Drawer body */}
          <div className="flex-1 overflow-auto p-4">
            {detailLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>
            ) : detailTenant ? (
              <div className="flex flex-col gap-4">
                {/* Name + Avatar */}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-lg">
                    {detailTenant.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{detailTenant.name}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${(statusStyles[detailTenant.status] ?? statusStyles['ACTIVE']).bg}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${(statusStyles[detailTenant.status] ?? statusStyles['ACTIVE']).dot}`} />
                      {detailTenant.status}
                    </span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: Mail, label: 'Email', value: detailTenant.email },
                    { icon: Phone, label: 'Phone', value: detailTenant.phone || 'â€”' },
                    { icon: Shield, label: 'Type', value: detailTenant.type },
                    { icon: CreditCard, label: 'Plan', value: detailTenant.plan || 'â€”' },
                    { icon: BarChart3, label: 'MRR', value: `$${(detailTenant.mrr ?? 0).toLocaleString()}` },
                    { icon: Users, label: 'Users', value: String(detailTenant.userCount ?? 0) },
                    { icon: Calendar, label: 'Joined', value: detailTenant.createdAt ? new Date(detailTenant.createdAt).toLocaleDateString() : 'â€”' },
                  ].map(f => (
                    <div key={f.label} className="flex items-start gap-2 rounded-lg border border-border/40 bg-muted/10 p-2">
                      <f.icon className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[8px] uppercase tracking-wide text-muted-foreground font-semibold">{f.label}</p>
                        <p className="text-[11px] font-medium truncate">{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {detailTenant.type === 'SCHOOL' && (
                  <div className="rounded-xl border border-border/40 bg-muted/10 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                        <MapPinned className="size-3.5 text-blue-600" />
                        School Location
                      </span>
                      {detailSchoolMarkerUrl && (
                        <a
                          href={detailSchoolMarkerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:underline"
                        >
                          Open map
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>

                    {detailSchoolEmbedUrl ? (
                      <>
                        <iframe
                          title="School location map"
                          src={detailSchoolEmbedUrl}
                          className="h-40 w-full rounded-lg border border-border/40"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                        <div className="mt-2 flex flex-col gap-1">
                          <p className="text-[10px] text-muted-foreground">
                            {detailSchool?.address || 'Address not available'}
                          </p>
                          {detailSchool?.website && (
                            <a
                              href={detailSchool.website}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                            >
                              {detailSchool.website}
                              <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-[10px] text-muted-foreground">
                        This school does not have saved map coordinates yet.
                      </p>
                    )}
                  </div>
                )}
                {/* Revenue Metric Bar */}
                <div className="rounded-xl border border-border/40 bg-muted/10 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold">Revenue Health</span>
                    <span className="text-[9px] font-bold text-emerald-600">${(detailTenant.mrr ?? 0).toLocaleString()}/mo</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-blue-500 transition-all duration-500" style={{ width: `${Math.min(100, ((detailTenant.mrr ?? 0) / 500) * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[8px] text-muted-foreground">
                    <span>$0</span><span>$500+/mo</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-8 text-[10px] gap-1.5 rounded-lg" variant="outline" onClick={() => { suspendTenant.mutate(detailTenant.id); setDetailId(null); }}>
                    <Ban className="size-3" />Suspend
                  </Button>
                  <Button size="sm" className="flex-1 h-8 text-[10px] gap-1.5 rounded-lg bg-linear-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700" onClick={() => { deleteTenant.mutate(detailTenant.id); setDetailId(null); }}>
                    <Trash2 className="size-3" />Delete
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-8">Tenant not found</p>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}

