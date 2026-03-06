/* ─── ProviderCommsSection ─── Announcements · Messaging · Templates ─── */
import { Loader2, Mail, Megaphone, MessageSquare, PlusCircle, Send } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderComms, useSendProviderAnnouncement, useProviderTenants, useCreateProviderAnnouncement, useSendProviderMessage, useCreateProviderCommsTemplate, useUpdateProviderCommsTemplate } from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderCommsSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'comms_announcements': return <AnnouncementsView />;
    case 'comms_messaging':     return <MessagingView />;
    case 'comms_templates':     return <CommsTemplatesView />;
    default:                    return <AnnouncementsView />;
  }
}

/* ── Announcements ── */
function AnnouncementsView() {
  const accent = getAccent('provider_comms');
  const { data: bundle, isLoading } = useProviderComms();
  const sendMutation = useSendProviderAnnouncement();
  const tenantsQuery = useProviderTenants({});
  const tenantCount = tenantsQuery.data?.length ?? 0;
  const createAnn = useCreateProviderAnnouncement();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('ALL');

  const announcements = bundle?.announcements ?? [];
  const sent = announcements.filter((a) => a.status === 'SENT');
  const drafts = announcements.filter((a) => a.status === 'DRAFT');
  const scheduled = announcements.filter((a) => a.status === 'SCHEDULED');

  const handleCreate = () => {
    const reason = reasonPrompt('Create announcement');
    if (!reason) return;
    createAnn.mutate({ title, body, audience, reason }, { onSuccess: () => { setShowNew(false); setTitle(''); setBody(''); } });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Megaphone} title="Announcements" description="Broadcast announcements to tenants" accent={accent} actions={
        <Button size="sm" className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Announcement</Button>
      } />

      {showNew && (
        <Panel title="New Announcement" accentBorder="border-teal-500/20">
          <div className="grid gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Announcement body…" rows={3} className="w-full rounded-md border border-slate-500/40 bg-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500" />
            <div className="flex gap-2 items-center justify-between">
              <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="ALL">All Tenants</option><option value="ACTIVE">Active Only</option><option value="PREMIUM">Premium Only</option>
              </select>
              <div className="flex gap-2">
                <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button size="sm" className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={handleCreate} disabled={!title.trim() || createAnn.isPending}>
                  {createAnn.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create Draft
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total" value={String(announcements.length)} sub="Announcements" gradient="from-teal-500/10 to-teal-500/5" />
        <StatCard label="Sent" value={String(sent.length)} sub="Delivered" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Drafts" value={String(drafts.length)} sub="Pending" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Scheduled" value={String(scheduled.length)} sub="Queued" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <Panel title="Announcement History" subtitle={isLoading ? 'Loading…' : `${announcements.length} announcements`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-teal-400" /></div>
        ) : announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No Announcements" description="Create your first announcement." />
        ) : (
          <div className="space-y-2">
            {announcements.map((ann) => (
              <Row key={ann.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{ann.title}</p>
                    <p className="text-slate-400">Audience: {ann.audience} · {ann.sentAt ? new Date(ann.sentAt).toLocaleDateString() : 'Not sent'} · {ann.recipients ?? tenantCount} recipients</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ann.status === 'SENT' ? 'COMPLETED' : ann.status === 'DRAFT' ? 'PENDING' : 'MONITORING'} />
                    {ann.status === 'DRAFT' && (
                      <Button size="sm" className="h-6 text-[10px] bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" disabled={sendMutation.isPending}
                        onClick={() => sendMutation.mutate({ announcementId: ann.id, reason: 'Manual send' })}>
                        <Send className="mr-1 size-3" />Send
                      </Button>
                    )}
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Messaging ── */
function MessagingView() {
  const accent = getAccent('provider_comms');
  const [message, setMessage] = useState('');
  const { data: bundle, isLoading } = useProviderComms();
  const sendMsg = useSendProviderMessage();

  const threads = bundle?.threads ?? [];
  const openThreads = threads.filter((t) => t.status === 'OPEN');
  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  const handleSend = () => {
    const threadId = selectedThread ?? threads[0]?.id;
    if (!threadId || !message.trim()) return;
    sendMsg.mutate({ threadId, body: message, reason: 'Quick reply' }, { onSuccess: () => setMessage('') });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={MessageSquare} title="Direct Messaging" description="1:1 communication with tenant admins" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Threads" value={String(threads.length)} sub="Total conversations" gradient="from-teal-500/10 to-teal-500/5" />
        <StatCard label="Open" value={String(openThreads.length)} sub="Active threads" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Unread" value={String(totalUnread)} sub="Pending replies" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Response" value={threads.length > 0 ? '—' : '—'} sub="Avg response time" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>

      <Panel title="Message Threads" subtitle={isLoading ? 'Loading…' : `${threads.length} conversations`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-teal-400" /></div>
        ) : threads.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No Messages" description="Start a conversation with a tenant admin." />
        ) : (
          <div className="space-y-2">
            {threads.map((thr) => (
              <Row key={thr.id} className={`cursor-pointer ${thr.unread > 0 ? 'border-teal-500/20 bg-teal-500/5' : ''} ${selectedThread === thr.id ? 'ring-1 ring-teal-400' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2" onClick={() => setSelectedThread(thr.id)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-100">{thr.tenant}</p>
                      {thr.unread > 0 && <span className="rounded-full bg-teal-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{thr.unread}</span>}
                    </div>
                    <p className="text-slate-400">{thr.subject} · {new Date(thr.lastMessage).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={thr.status === 'OPEN' ? 'IN_PROGRESS' : thr.status === 'RESOLVED' ? 'RESOLVED' : 'CLOSED'} />
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Quick Reply" subtitle={selectedThread ? `Replying to thread` : 'Select a thread above'} accentBorder="border-teal-500/20">
        <div className="flex gap-2">
          <Input className="h-8 flex-1 border-teal-500/30 bg-slate-800 text-xs text-slate-100" placeholder="Type a message…" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button size="sm" className="h-8 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={handleSend} disabled={!message.trim() || sendMsg.isPending || (!selectedThread && threads.length === 0)}>
            {sendMsg.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Send className="mr-1 size-3" />}Send
          </Button>
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Comms Templates ── */
function CommsTemplatesView() {
  const accent = getAccent('provider_comms');
  const { data: bundle, isLoading } = useProviderComms();
  const templates = bundle?.templates ?? [];
  const createTpl = useCreateProviderCommsTemplate();
  const updateTpl = useUpdateProviderCommsTemplate();
  const [showNew, setShowNew] = useState(false);
  const [tName, setTName] = useState('');
  const [tType, setTType] = useState('EMAIL');
  const [tSubject, setTSubject] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Create comms template');
    if (!reason) return;
    createTpl.mutate({ name: tName, type: tType, subject: tSubject, body: '', variables: [], reason }, { onSuccess: () => { setShowNew(false); setTName(''); setTSubject(''); } });
  };

  const handleUpdate = (id: string) => {
    const reason = reasonPrompt('Update template');
    if (!reason) return;
    updateTpl.mutate({ templateId: id, subject: editSubject, reason }, { onSuccess: () => setEditId(null) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Mail} title="Communication Templates" description="Reusable templates for announcements and emails" accent={accent} actions={
        <Button size="sm" className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Template</Button>
      } />

      {showNew && (
        <Panel title="New Template" accentBorder="border-teal-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Template name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={tType} onChange={(e) => setTType(e.target.value)}>
              <option value="EMAIL">Email</option><option value="SMS">SMS</option><option value="IN_APP">In-App</option>
            </select>
            <Input value={tSubject} onChange={(e) => setTSubject(e.target.value)} placeholder="Subject line" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={handleCreate} disabled={!tName.trim() || createTpl.isPending}>
              {createTpl.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-teal-400" /></div>
      ) : templates.length === 0 ? (
        <EmptyState icon={Mail} title="No Templates" description="Create your first communication template." />
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <Panel key={tpl.id} title={tpl.name} subtitle={tpl.type} accentBorder="border-teal-500/15">
              <div className="space-y-2 text-xs">
                {editId === tpl.id ? (
                  <div className="space-y-2">
                    <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="Subject" className="h-7 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditId(null)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-[10px] bg-teal-500/20 text-teal-100" onClick={() => handleUpdate(tpl.id)} disabled={updateTpl.isPending}>Save</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-300">Subject: <span className="text-slate-100">{tpl.subject}</span></p>
                    <div className="flex flex-wrap gap-1">
                      {tpl.variables.map((v) => (
                        <span key={v} className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] text-teal-200 border border-teal-500/30">{`{{${v}}}`}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-teal-500/30" onClick={() => { setEditId(tpl.id); setEditSubject(tpl.subject); }}>Edit</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-teal-500/30" onClick={() => { /* Preview renders in-place */ }}>Preview</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-teal-500/30" onClick={() => { navigator.clipboard.writeText(tpl.subject); }}>Use</Button>
                    </div>
                  </>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
