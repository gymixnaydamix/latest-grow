/* ─── ProviderSupportSection ─── Inbox · SLA · Macros · Timeline · KB · CSAT ─── */
import { useState } from 'react';
import {
  BookOpen,
  Bot,
  Clock,
  LifeBuoy,
  Loader2,
  MessageSquare,
  Star,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useProviderModuleData,
  useProviderTenants,
  useCreateProviderSupportTicket,
  useUpdateProviderSupportTicketStatus,
  useProviderSupportExtras,
  useUpdateProviderMacro,
  useUpdateProviderKbArticle,
  useCreateProviderMacro,
  useDeleteProviderMacro,
  useCreateProviderKbArticle,
  useSendProviderCsatSurvey,
} from '@/hooks/api/use-provider-console';
import type { SupportTicketDTO } from '@root/types';
import { notifySuccess } from '@/lib/notify';
import {
  EmptyState,
  Panel,
  SectionPageHeader,
  SectionShell,
  StatCard,
  StatusBadge,
  getAccent,
  reasonPrompt,
  tone,
} from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Main export                                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderSupportSection() {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'support_inbox':
      return <SupportInboxView />;
    case 'support_sla':
      return <SlaMonitorView />;
    case 'support_macros':
      return <MacrosView />;
    case 'support_timeline':
      return <TenantTimelineView />;
    case 'support_kb':
      return <KnowledgeBaseView />;
    case 'support_csat':
      return <CsatView />;
    default:
      return <SupportInboxView />;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Support Inbox                                        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SupportInboxView() {
  const userEmail = useAuthStore((s) => s.user?.email ?? 'provider@growyourneed.dev');
  const moduleQuery = useProviderModuleData();
  const tenantsQuery = useProviderTenants({});
  const createTicket = useCreateProviderSupportTicket();
  const updateTicketStatus = useUpdateProviderSupportTicketStatus();

  const [ticketSubject, setTicketSubject] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const tickets = (moduleQuery.data?.tickets ?? []) as SupportTicketDTO[];
  const tenants = tenantsQuery.data ?? [];
  const accent = getAccent('provider_support');

  const openTickets = tickets.filter((t) => t.status !== 'CLOSED' && t.status !== 'RESOLVED');
  const escalatedTickets = tickets.filter((t) => t.status === 'ESCALATED');
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED');

  const filteredTickets = tickets.filter((t) => {
    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <SectionShell>
      <SectionPageHeader
        icon={LifeBuoy}
        title="Support Inbox"
        description="Tickets, SLA timer, escalation rules"
        accent={accent}
        actions={
          <div className="flex flex-wrap gap-2">
            <select className="h-7 rounded-md border border-violet-500/30 bg-slate-800 px-2 text-xs text-slate-100" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="">All priorities</option>
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <select className="h-7 rounded-md border border-violet-500/30 bg-slate-800 px-2 text-xs text-slate-100" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option value="NEW">New</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Tickets" value={String(tickets.length)} sub="All-time" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Open" value={String(openTickets.length)} sub="Needs attention" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Escalated" value={String(escalatedTickets.length)} sub="Requires manager" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Resolution Rate" value={tickets.length > 0 ? `${Math.round((resolvedTickets.length / tickets.length) * 100)}%` : '—'} sub="Resolved / total" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>

      {/* Create ticket */}
      <Panel title="Create Ticket" subtitle="File a new support request" accentBorder="border-violet-500/20">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            className="h-8 flex-1 border-violet-500/30 bg-slate-800 text-xs text-slate-100"
            placeholder="Ticket subject…"
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
          />
          <div className="flex gap-2">
            <select className="h-8 rounded-md border border-violet-500/30 bg-slate-800 px-2 text-xs text-slate-100" defaultValue="HIGH">
              <option value="LOW">Low</option>
              <option value="NORMAL">Normal</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            <Button
              size="sm"
              className="h-8 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30"
              onClick={() => {
                const tenantId = tenants[0]?.id;
                if (!tenantId || !ticketSubject.trim()) return;
                const reason = reasonPrompt('Create support ticket');
                if (!reason) return;
                createTicket.mutate({ tenantId, category: 'BUG', subject: ticketSubject, priority: 'HIGH', requesterEmail: userEmail, reason });
                setTicketSubject('');
              }}
            >
              <MessageSquare className="mr-1 size-3" />Create
            </Button>
          </div>
        </div>
      </Panel>

      {/* Ticket queue */}
      <Panel title="Ticket Queue" subtitle={`${filteredTickets.length} tickets`} accentBorder="border-violet-500/20">
        <div className="space-y-2">
          {filteredTickets.slice(0, 20).map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} onEscalate={(id) => {
              const reason = reasonPrompt(`Escalate ${id}`);
              if (!reason) return;
              updateTicketStatus.mutate({ ticketId: id, status: 'ESCALATED', reason });
            }} onResolve={(id) => {
              const reason = reasonPrompt(`Resolve ${id}`);
              if (!reason) return;
              updateTicketStatus.mutate({ ticketId: id, status: 'RESOLVED', reason });
            }} />
          ))}
          {filteredTickets.length === 0 && <EmptyState icon={LifeBuoy} title="No Tickets" description="Support queue is empty." />}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Ticket Card ─── */
function TicketCard({
  ticket,
  onEscalate,
  onResolve,
}: {
  ticket: SupportTicketDTO;
  onEscalate: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-violet-500/15 bg-slate-800/60 px-3 py-2 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-100">{ticket.subject}</p>
          <p className="text-slate-400">{ticket.tenantId} · {ticket.category} · {ticket.requesterEmail}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`border text-[10px] ${tone(ticket.priority)}`}>{ticket.priority}</Badge>
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {ticket.status !== 'ESCALATED' && ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
          <>
            <Button size="sm" className="h-6 text-[10px] bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => onEscalate(ticket.id)}>
              Escalate
            </Button>
            <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => onResolve(ticket.id)}>
              Resolve
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: SLA Monitor                                          */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SlaMonitorView() {
  const moduleQuery = useProviderModuleData();
  const accent = getAccent('provider_support');
  const tickets = (moduleQuery.data?.tickets ?? []) as SupportTicketDTO[];

  /* SLA calculations */
  const urgentOpen = tickets.filter((t) => t.priority === 'URGENT' && t.status !== 'CLOSED' && t.status !== 'RESOLVED');
  const highOpen = tickets.filter((t) => t.priority === 'HIGH' && t.status !== 'CLOSED' && t.status !== 'RESOLVED');

  const slaTargets = [
    { priority: 'URGENT', target: '1 hour', count: urgentOpen.length, color: 'border-red-500/20 bg-red-500/5', text: 'text-red-300' },
    { priority: 'HIGH', target: '4 hours', count: highOpen.length, color: 'border-amber-500/20 bg-amber-500/5', text: 'text-amber-300' },
    { priority: 'NORMAL', target: '24 hours', count: tickets.filter((t) => t.priority === 'NORMAL' && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length, color: 'border-blue-500/20 bg-blue-500/5', text: 'text-blue-300' },
    { priority: 'LOW', target: '72 hours', count: tickets.filter((t) => t.priority === 'LOW' && t.status !== 'CLOSED' && t.status !== 'RESOLVED').length, color: 'border-slate-500/20 bg-slate-500/5', text: 'text-slate-300' },
  ];

  return (
    <SectionShell>
      <SectionPageHeader icon={Clock} title="SLA Monitor" description="Service level agreement tracking and breach alerts" accent={accent} />

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {slaTargets.map((sla) => (
          <div key={sla.priority} className={`rounded-2xl border ${sla.color} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-xs font-bold uppercase tracking-widest ${sla.text}`}>{sla.priority}</h4>
              <span className={`text-lg font-bold ${sla.text}`}>{sla.count}</span>
            </div>
            <p className="text-[10px] text-slate-400">Target: First response within {sla.target}</p>
            <p className="text-[10px] text-slate-400">Open tickets at this priority level</p>
          </div>
        ))}
      </div>

      {/* Breach risk */}
      {urgentOpen.length > 0 && (
        <Panel title="SLA Breach Risk" subtitle={`${urgentOpen.length} urgent tickets open`} accentBorder="border-red-500/20">
          <div className="space-y-2">
            {urgentOpen.map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs gap-2">
                <div>
                  <p className="font-semibold text-red-100">{t.subject}</p>
                  <p className="text-red-300/70">{t.tenantId} · Created {new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">BREACH RISK</span>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Macros (canned responses)                            */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function MacrosView() {
  const accent = getAccent('provider_support');
  const { data: extras, isLoading } = useProviderSupportExtras();
  const macros = extras?.macros ?? [];
  const updateMacro = useUpdateProviderMacro();
  const createMacro = useCreateProviderMacro();
  const deleteMacro = useDeleteProviderMacro();
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTemplate, setEditTemplate] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newTemplate, setNewTemplate] = useState('');

  const handleSave = (id: string) => {
    const reason = reasonPrompt('Update macro');
    if (!reason) return;
    updateMacro.mutate({ macroId: id, name: editName, template: editTemplate, reason }, { onSuccess: () => setEditId(null) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Bot} title="Support Macros" description="Canned responses and automation templates" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew((p) => !p)}>+ New Macro</Button>
      } />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Macros" value={String(macros.length)} sub="Active" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Total Uses" value={String(macros.reduce((s, m) => s + m.usageCount, 0))} sub="All-time" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Categories" value={String(new Set(macros.map((m) => m.category)).size)} sub="Organized" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Most Used" value={macros.length > 0 ? macros.reduce((top, m) => m.usageCount > top.usageCount ? m : top, macros[0]).name : '—'} sub={macros.length > 0 ? `${macros.reduce((top, m) => m.usageCount > top.usageCount ? m : top, macros[0]).usageCount}×` : ''} gradient="from-cyan-500/10 to-cyan-500/5" />
      </div>

      {showNew && (
        <Panel title="Create Macro" accentBorder="border-violet-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Macro name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              <option value="general">General</option><option value="billing">Billing</option><option value="technical">Technical</option><option value="onboarding">Onboarding</option>
            </select>
            <textarea value={newTemplate} onChange={(e) => setNewTemplate(e.target.value)} rows={2} placeholder="Response template…" className="w-full rounded-md border border-slate-500/40 bg-slate-700 px-2 py-1 text-xs text-slate-100 resize-none col-span-full md:col-span-1" />
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => {
              if (!newName.trim() || !newTemplate.trim()) return;
              const reason = reasonPrompt('Create macro');
              if (!reason) return;
              createMacro.mutate({ name: newName, category: newCategory, template: newTemplate, reason }, { onSuccess: () => { setShowNew(false); setNewName(''); setNewTemplate(''); } });
            }} disabled={!newName.trim() || !newTemplate.trim() || createMacro.isPending}>
              {createMacro.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}

      <Panel title="Macros Library" subtitle={`${macros.length} macros`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-rose-400" /></div>
        ) : macros.length === 0 ? (
          <EmptyState icon={Bot} title="No Macros" description="No canned responses have been created yet." />
        ) : (
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {macros.map((macro) => (
              <div key={macro.id} className="rounded-lg border border-violet-500/15 bg-slate-800/60 p-3">
                {editId === macro.id ? (
                  <div className="space-y-2">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Macro name" className="h-7 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                    <textarea value={editTemplate} onChange={(e) => setEditTemplate(e.target.value)} rows={3} className="w-full rounded-md border border-slate-500/40 bg-slate-700 px-2 py-1 text-xs text-slate-100 resize-none" />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditId(null)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-[10px] bg-violet-500/20 text-violet-100" onClick={() => handleSave(macro.id)} disabled={updateMacro.isPending}>
                        {updateMacro.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-semibold text-slate-100">{macro.name}</h4>
                      <Badge className="border text-[10px] border-violet-500/30 text-violet-300">{macro.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{macro.template}</p>
                    {(macro.actions?.length ?? 0) > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {macro.actions!.map((a) => <Badge key={a} className="text-[10px] border-slate-500/30 text-slate-400">{a}</Badge>)}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">Used {macro.usageCount}× · Last {new Date(macro.lastUsed).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-violet-500/30" onClick={() => { setEditId(macro.id); setEditName(macro.name); setEditTemplate(macro.template); }}>Edit</Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-violet-500/30" onClick={() => { navigator.clipboard.writeText(macro.template); notifySuccess('Macro template copied to clipboard'); }}>Use</Button>
                        <Button size="sm" variant="outline" className="h-6 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => {
                          const reason = reasonPrompt('Delete macro');
                          if (!reason) return;
                          deleteMacro.mutate({ macroId: macro.id, reason });
                        }} disabled={deleteMacro.isPending}>
                          {deleteMacro.isPending ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Tenant Timeline                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function TenantTimelineView() {
  const moduleQuery = useProviderModuleData();
  const accent = getAccent('provider_support');
  const tickets = (moduleQuery.data?.tickets ?? []) as SupportTicketDTO[];

  /* Group tickets by tenant */
  const tenantGroups = new Map<string, SupportTicketDTO[]>();
  for (const t of tickets) {
    if (!tenantGroups.has(t.tenantId)) tenantGroups.set(t.tenantId, []);
    tenantGroups.get(t.tenantId)!.push(t);
  }

  return (
    <SectionShell>
      <SectionPageHeader icon={TrendingUp} title="Tenant Timeline" description="Support history grouped by tenant" accent={accent} />

      {Array.from(tenantGroups.entries()).slice(0, 10).map(([tenantId, tenantTickets]) => (
        <Panel key={tenantId} title={tenantId} subtitle={`${tenantTickets.length} tickets`} accentBorder="border-violet-500/15">
          <div className="space-y-2">
            {tenantTickets.slice(0, 8).map((t) => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-slate-500/15 bg-slate-800/60 px-3 py-2 text-xs gap-2">
                <div>
                  <p className="font-semibold text-slate-100">{t.subject}</p>
                  <p className="text-slate-400">{t.category} · {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`border text-[10px] ${tone(t.priority)}`}>{t.priority}</Badge>
                  <StatusBadge status={t.status} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}

      {tenantGroups.size === 0 && <EmptyState icon={LifeBuoy} title="No Support History" description="No tickets have been created yet." />}
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Knowledge Base                                       */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function KnowledgeBaseView() {
  const accent = getAccent('provider_support');
  const { data: extras, isLoading } = useProviderSupportExtras();
  const articles = extras?.kbArticles ?? [];
  const createArticle = useCreateProviderKbArticle();
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newBody, setNewBody] = useState('');

  const totalViews = articles.reduce((s, a) => s + a.views, 0);
  const avgHelpful = articles.length > 0 ? Math.round(articles.reduce((s, a) => s + a.helpfulPct, 0) / articles.length) : 0;

  return (
    <SectionShell>
      <SectionPageHeader icon={BookOpen} title="Knowledge Base" description="Self-service help articles and documentation" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew((p) => !p)}>+ New Article</Button>
      } />

      {showNew && (
        <Panel title="Create Article" accentBorder="border-violet-500/20">
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Article title" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
              <option value="general">General</option><option value="billing">Billing</option><option value="technical">Technical</option><option value="getting-started">Getting Started</option>
            </select>
          </div>
          <textarea value={newBody} onChange={(e) => setNewBody(e.target.value)} rows={3} placeholder="Article content…" className="mt-2 w-full rounded-md border border-slate-500/40 bg-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 resize-none" />
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => {
              if (!newTitle.trim() || !newBody.trim()) return;
              const reason = reasonPrompt('Create KB article');
              if (!reason) return;
              createArticle.mutate({ title: newTitle, category: newCategory, body: newBody, reason }, { onSuccess: () => { setShowNew(false); setNewTitle(''); setNewBody(''); } });
            }} disabled={!newTitle.trim() || !newBody.trim() || createArticle.isPending}>
              {createArticle.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Publish
            </Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Articles" value={String(articles.length)} sub="Published" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Total Views" value={String(totalViews)} sub="All-time" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Avg Helpful" value={`${avgHelpful}%`} sub="Rating" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Categories" value={String(new Set(articles.map((a) => a.category)).size)} sub="Organized" gradient="from-cyan-500/10 to-cyan-500/5" />
      </div>
      <Panel title="Article Library" subtitle={`${articles.length} articles`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-rose-400" /></div>
        ) : articles.length === 0 ? (
          <EmptyState icon={BookOpen} title="No Articles" description="No knowledge base articles have been published yet." />
        ) : (
          <KbArticleList articles={articles} />
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── KB Article List with Inline Edit ── */
function KbArticleList({ articles }: { articles: { id: string; title: string; category: string; views: number; helpfulPct: number; status: string; updatedAt: string }[] }) {
  const updateArticle = useUpdateProviderKbArticle();
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editStatus, setEditStatus] = useState('');

  const handleSave = (id: string) => {
    const reason = reasonPrompt('Update KB article');
    if (!reason) return;
    updateArticle.mutate({ articleId: id, title: editTitle, status: editStatus, reason }, { onSuccess: () => setEditId(null) });
  };

  return (
    <div className="space-y-2">
      {articles.map((article) => (
        <div key={article.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-500/20 bg-slate-800/60 px-3 py-2 text-xs">
          {editId === article.id ? (
            <div className="flex flex-1 items-center gap-2">
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="h-7 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
              <select className="h-7 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                <option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option>
              </select>
              <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditId(null)}>Cancel</Button>
              <Button size="sm" className="h-6 text-[10px] bg-violet-500/20 text-violet-100" onClick={() => handleSave(article.id)} disabled={updateArticle.isPending}>
                {updateArticle.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Save
              </Button>
            </div>
          ) : (
            <>
              <div>
                <p className="font-semibold text-slate-100">{article.title}</p>
                <p className="text-slate-400">{article.category} · {article.status} · Updated {new Date(article.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-300">{article.views} views</span>
                <span className={`font-mono ${article.helpfulPct >= 80 ? 'text-emerald-300' : 'text-amber-300'}`}>{article.helpfulPct}% helpful</span>
                <Button size="sm" variant="outline" className="h-6 text-[10px] border-violet-500/30" onClick={() => { setEditId(article.id); setEditTitle(article.title); setEditStatus(article.status); }}>Edit</Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Customer Satisfaction                                */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CsatView() {
  const accent = getAccent('provider_support');
  const { data: extras, isLoading } = useProviderSupportExtras();
  const ratings = extras?.csatRatings ?? [];
  const tenantsQuery = useProviderTenants({});
  const tenants = tenantsQuery.data ?? [];
  const sendSurvey = useSendProviderCsatSurvey();

  const avgScore = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1) : '—';
  const highCount = ratings.filter((r) => r.score >= 4.5).length;
  const lowCount = ratings.filter((r) => r.score < 4.0).length;

  const handleSendSurvey = () => {
    if (tenants.length === 0) return;
    const reason = reasonPrompt('Send CSAT survey to all tenants');
    if (!reason) return;
    sendSurvey.mutate({ tenantIds: tenants.map((t) => t.id), reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Star} title="Customer Satisfaction (CSAT)" description="Tenant satisfaction scores and survey results" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={handleSendSurvey} disabled={sendSurvey.isPending || tenants.length === 0}>
          {sendSurvey.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Send Survey
        </Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Avg CSAT" value={avgScore} sub="Out of 5.0" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Ratings" value={String(ratings.length)} sub="Total" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="High (4.5+)" value={String(highCount)} sub="Ratings" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Low (<4.0)" value={String(lowCount)} sub="Needs attention" gradient="from-red-500/10 to-red-500/5" />
      </div>
      <Panel title="CSAT Ratings" subtitle={`${ratings.length} ratings`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-rose-400" /></div>
        ) : ratings.length === 0 ? (
          <EmptyState icon={Star} title="No Ratings" description="No customer satisfaction ratings have been collected yet." />
        ) : (
          <div className="space-y-2">
            {[...ratings].sort((a, b) => b.score - a.score).map((rating) => (
              <div key={rating.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${rating.score >= 4.5 ? 'border-emerald-500/20 bg-emerald-500/5' : rating.score >= 4.0 ? 'border-slate-500/20 bg-slate-800/60' : 'border-amber-500/20 bg-amber-500/5'}`}>
                <div>
                  <p className="font-semibold text-slate-100">{rating.tenant}</p>
                  <p className="text-slate-400">Ticket {rating.ticketId} · {new Date(rating.createdAt).toLocaleDateString()}</p>
                  {rating.feedback && <p className="mt-1 text-slate-300 italic">"{rating.feedback}"</p>}
                </div>
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`size-3 ${i < Math.round(rating.score) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  ))}
                  <span className={`ml-1 font-bold ${rating.score >= 4.5 ? 'text-emerald-300' : rating.score >= 4.0 ? 'text-slate-100' : 'text-amber-300'}`}>{rating.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
