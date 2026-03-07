/* --- AdminCommunicationSection --- API-backed inbox, announcements, broadcast, templates, logs --- */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useMessages,
  useOpsAnnouncements,
  useOpsCreateAnnouncement,
  useOpsUpdateAnnouncement,
  useOpsDeleteAnnouncement,
  useCommLogs,
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useMarkMessageRead,
  useSendBroadcast,
} from '@/hooks/api/use-school-ops';
import { useCreateThread } from '@/hooks/api/use-messages';
import { Send, Plus, Edit, Trash2, Mail, Bell, Megaphone, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  StatusBadge, FormDialog, type FormField,
  DetailPanel, DetailFields, type DetailTab,
} from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { notifySuccess, notifyError } from '@/lib/notify';

/* -- Local types -- */
interface MessageThread {
  id: string; from: string; subject: string; category: string;
  date: string; preview: string; unread: boolean;
}
interface Announcement {
  id: string; title: string; body: string; audience: string;
  author: string; date: string; priority: string; status: string; reads: number;
}
interface Template {
  id: string; name: string; type: string; category: string;
  body: string; lastEdited: string; status: string;
}

/* --- Inbox View --- */
function InboxView() {
  const { schoolId } = useAuthStore();
  const { data: msgRes } = useMessages(schoolId);
  const markRead = useMarkMessageRead(schoolId);
  const createThread = useCreateThread(schoolId ?? '');
  const messages: MessageThread[] = (Array.isArray(msgRes) ? msgRes : (msgRes as any)?.items ?? []).map((m: any) => ({
    id: m.id, from: m.from ?? m.sender ?? '', subject: m.subject ?? '', category: m.category ?? 'general',
    date: m.createdAt ?? m.date ?? '', preview: m.preview ?? m.body?.slice(0, 80) ?? '', unread: !!m.unread,
  }));
  const [selected, setSelected] = useState<MessageThread | null>(null);
  const [compose, setCompose] = useState(false);
  const formMode: 'create' | 'edit' = 'create';
  const [replyText, setReplyText] = useState('');

  const composeFields: FormField[] = [
    { name: 'to', label: 'To', type: 'text', required: true },
    { name: 'subject', label: 'Subject', type: 'text', required: true },
    { name: 'body', label: 'Message', type: 'textarea', required: true },
  ];

  const handleCompose = (data: Record<string, any>) => {
    createThread.mutate({ subject: String(data.subject ?? ''), body: String(data.body ?? ''), recipientId: String(data.to ?? '') } as any, {
      onSuccess: () => { setCompose(false); notifySuccess('Sent', 'Message sent'); },
      onError: () => notifyError('Error', 'Failed to send message'),
    });
  };

  const handleMarkRead = (id: string) => { markRead.mutate(id); };

  const handleReply = () => {
    if (!selected || !replyText.trim()) return;
    createThread.mutate({ subject: 'Re: ' + selected.subject, body: replyText, recipientId: selected.from } as any, {
      onSuccess: () => { setReplyText(''); notifySuccess('Sent', 'Reply sent'); },
    });
  };

  const detailTabs: DetailTab[] = selected ? [
    { id: 'message', label: 'Message', content: (
      <div className="space-y-4">
        <DetailFields fields={[
          { label: 'From', value: selected.from }, { label: 'Subject', value: selected.subject },
          { label: 'Date', value: selected.date }, { label: 'Category', value: selected.category },
        ]} />
        <p className="text-sm text-foreground/80">{selected.preview}</p>
        <div className="pt-4 border-t border-border space-y-2">
          <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3} />
          <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}><Send className="size-3.5 mr-1.5" /> Reply</Button>
        </div>
      </div>
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-foreground">Inbox</h2>
          <p className="text-sm text-muted-foreground/60">{messages.filter(m => m.unread).length} unread</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => setCompose(true)}><Plus className="size-3.5 mr-1.5" /> Compose</Button>
      </div>
      <div className="space-y-2">
        {messages.map(m => (
          <Card key={m.id} className={'border-border bg-card backdrop-blur-xl cursor-pointer hover:ring-1 hover:ring-accent/40 transition ' + (m.unread ? 'border-l-2 border-l-accent/60' : '')}
            onClick={() => { setSelected(m); if (m.unread) handleMarkRead(m.id); }}>
            <CardContent className="py-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="text-sm font-medium text-foreground/80 truncate">{m.from}</span>
                  {m.unread && <Badge className="bg-accent/20 text-accent text-[10px] px-1.5">New</Badge>}
                </div>
                <p className="text-sm text-foreground/60 truncate">{m.subject}</p>
                <p className="text-xs text-muted-foreground/40 truncate">{m.preview}</p>
              </div>
              <span className="text-xs text-muted-foreground/40 whitespace-nowrap ml-4">{m.date}</span>
            </CardContent>
          </Card>
        ))}
        {messages.length === 0 && <p className="text-sm text-muted-foreground/40 text-center py-8">No messages</p>}
      </div>
      <FormDialog title="Compose Message" mode={formMode} fields={composeFields} open={compose} onOpenChange={setCompose} onSubmit={handleCompose} />
      {selected && <DetailPanel title={selected.subject} tabs={detailTabs} open={!!selected} onOpenChange={() => setSelected(null)} />}
    </div>
  );
}

/* --- Announcements View --- */
function AnnouncementsView() {
  const { schoolId } = useAuthStore();
  const { data: annRes } = useOpsAnnouncements(schoolId);
  const createAnn = useOpsCreateAnnouncement(schoolId);
  const updateAnn = useOpsUpdateAnnouncement(schoolId);
  const deleteAnn = useOpsDeleteAnnouncement(schoolId);
  const items: Announcement[] = (Array.isArray(annRes) ? annRes : (annRes as any)?.items ?? []).map((a: any) => ({
    id: a.id, title: a.title ?? '', body: a.body ?? a.content ?? '', audience: a.audience ?? 'all',
    author: a.author ?? '', date: a.createdAt ?? a.date ?? '', priority: a.priority ?? 'normal',
    status: a.status ?? 'active', reads: a.reads ?? 0,
  }));
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const fields: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'body', label: 'Content', type: 'textarea', required: true },
    { name: 'audience', label: 'Audience', type: 'select', options: [
      { label: 'All', value: 'all' }, { label: 'Teachers', value: 'teachers' },
      { label: 'Students', value: 'students' }, { label: 'Parents', value: 'parents' },
    ] },
    { name: 'priority', label: 'Priority', type: 'select', options: [
      { label: 'Normal', value: 'normal' }, { label: 'High', value: 'high' }, { label: 'Urgent', value: 'urgent' },
    ] },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    if (editData) {
      updateAnn.mutate({ id: editData.id, ...data } as any, { onSuccess: () => { setFormOpen(false); setEditData(null); notifySuccess('Updated', 'Announcement updated'); } });
    } else {
      createAnn.mutate(data as any, { onSuccess: () => { setFormOpen(false); notifySuccess('Created', 'Announcement published'); } });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAnn.mutate(deleteTarget.id as any, {
      onSuccess: () => { setDeleteTarget(null); notifySuccess('Deleted', 'Announcement removed'); },
      onError: () => notifyError('Error', 'Failed to delete announcement'),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground/60">{items.length} announcements</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => { setEditData(null); setFormMode('create'); setFormOpen(true); }}><Plus className="size-3.5 mr-1.5" /> New Announcement</Button>
      </div>
      <div className="space-y-2">
        {items.map(a => (
          <Card key={a.id} className="border-border bg-card backdrop-blur-xl">
            <CardContent className="py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground/80">{a.title}</span>
                    <Badge variant="outline" className="text-[10px] border-border">{a.priority}</Badge>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-muted-foreground/40 mt-1 line-clamp-2">{a.body}</p>
                  <p className="text-xs text-muted-foreground/30 mt-1">{a.audience} -- {a.date} -- {a.reads} reads</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-7 text-muted-foreground/40" onClick={() => { setEditData(a); setFormMode('edit'); setFormOpen(true); }}><Edit className="size-3" /></Button>
                  <Button variant="ghost" size="sm" className="h-7 text-red-400/60" onClick={() => setDeleteTarget(a)}><Trash2 className="size-3" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground/40 text-center py-8">No announcements</p>}
      </div>
      <FormDialog title={editData ? 'Edit Announcement' : 'New Announcement'} mode={formMode} fields={fields} open={formOpen} onOpenChange={setFormOpen}
        onSubmit={handleSubmit} initialData={editData ? { title: editData.title, body: editData.body, audience: editData.audience, priority: editData.priority } : undefined} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete Announcement"
        description={'Delete "' + (deleteTarget?.title ?? '') + '"?'} onConfirm={handleDelete} variant="destructive" />
    </div>
  );
}

/* --- Broadcast View --- */
function BroadcastView() {
  const { schoolId } = useAuthStore();
  const broadcast = useSendBroadcast(schoolId);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('all');

  const handleSend = () => {
    if (!message.trim()) return;
    broadcast.mutate({ message, audience } as any, {
      onSuccess: () => { setMessage(''); notifySuccess('Sent', 'Broadcast sent to ' + audience); },
      onError: () => notifyError('Error', 'Failed to send broadcast'),
    });
  };

  return (
    <div className="space-y-4">
      <div><h2 className="text-lg font-semibold text-foreground">Broadcast Message</h2>
        <p className="text-sm text-muted-foreground/60">Send instant messages to groups</p>
      </div>
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardContent className="py-4 space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'teachers', 'students', 'parents', 'staff'].map(a => (
              <Button key={a} size="sm" variant={audience === a ? 'default' : 'outline'}
                className={'h-7 text-xs capitalize ' + (audience === a ? 'bg-accent' : 'border-border text-muted-foreground/70')}
                onClick={() => setAudience(a)}>{a}</Button>
            ))}
          </div>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your broadcast message..." rows={4} />
          <Button size="sm" onClick={handleSend} disabled={!message.trim() || broadcast.isPending}>
            <Send className="size-3.5 mr-1.5" /> Send Broadcast
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* --- Templates View --- */
function TemplatesView() {
  const { schoolId } = useAuthStore();
  const { data: tplRes } = useTemplates(schoolId);
  const createTpl = useCreateTemplate(schoolId);
  const updateTpl = useUpdateTemplate(schoolId);
  const deleteTpl = useDeleteTemplate(schoolId);
  const templates: Template[] = (Array.isArray(tplRes) ? tplRes : (tplRes as any)?.items ?? []).map((t: any) => ({
    id: t.id, name: t.name ?? '', type: t.type ?? 'email', category: t.category ?? 'general',
    body: t.body ?? t.content ?? '', lastEdited: t.updatedAt ?? t.lastEdited ?? '', status: t.status ?? 'active',
  }));
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const fields: FormField[] = [
    { name: 'name', label: 'Template Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', options: [
      { label: 'Email', value: 'email' }, { label: 'SMS', value: 'sms' }, { label: 'Push', value: 'push' },
    ] },
    { name: 'category', label: 'Category', type: 'text' },
    { name: 'body', label: 'Template Body', type: 'textarea', required: true },
  ];

  const handleSubmit = (data: Record<string, any>) => {
    if (editData) {
      updateTpl.mutate({ id: editData.id, ...data } as any, { onSuccess: () => { setFormOpen(false); setEditData(null); notifySuccess('Updated', 'Template updated'); } });
    } else {
      createTpl.mutate(data as any, { onSuccess: () => { setFormOpen(false); notifySuccess('Created', 'Template created'); } });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTpl.mutate(deleteTarget.id as any, {
      onSuccess: () => { setDeleteTarget(null); notifySuccess('Deleted', 'Template "' + deleteTarget.name + '" deleted'); },
      onError: () => notifyError('Error', 'Failed to delete template'),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h2 className="text-lg font-semibold text-foreground">Templates</h2>
          <p className="text-sm text-muted-foreground/60">{templates.length} templates</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => { setEditData(null); setFormMode('create'); setFormOpen(true); }}><Plus className="size-3.5 mr-1.5" /> New Template</Button>
      </div>
      <div className="space-y-2">
        {templates.map(t => (
          <Card key={t.id} className="border-border bg-card backdrop-blur-xl">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground/40" />
                  <span className="text-sm font-medium text-foreground/80">{t.name}</span>
                  <Badge variant="outline" className="text-[10px] border-border">{t.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground/40 mt-0.5">{t.category} -- Last edited {t.lastEdited}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-7 text-muted-foreground/40" onClick={() => { setEditData(t); setFormMode('edit'); setFormOpen(true); }}><Edit className="size-3" /></Button>
                <Button variant="ghost" size="sm" className="h-7 text-red-400/60" onClick={() => setDeleteTarget(t)}><Trash2 className="size-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {templates.length === 0 && <p className="text-sm text-muted-foreground/40 text-center py-8">No templates</p>}
      </div>
      <FormDialog title={editData ? 'Edit Template' : 'New Template'} mode={formMode} fields={fields} open={formOpen} onOpenChange={setFormOpen}
        onSubmit={handleSubmit} initialData={editData ? { name: editData.name, type: editData.type, category: editData.category, body: editData.body } : undefined} />
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }} title="Delete Template"
        description={'Delete template "' + (deleteTarget?.name ?? '') + '"?'} onConfirm={handleDelete} variant="destructive" />
    </div>
  );
}

/* --- Logs View --- */
function LogsView() {
  const { schoolId } = useAuthStore();
  const { data: logRes } = useCommLogs(schoolId);
  const logs: any[] = Array.isArray(logRes) ? logRes : (logRes as any)?.items ?? [];
  const [selected, setSelected] = useState<any>(null);

  const detailTabs: DetailTab[] = selected ? [
    { id: 'details', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Type', value: selected.type ?? '' },
        { label: 'Recipient', value: selected.recipient ?? '' },
        { label: 'Subject', value: selected.subject ?? '' },
        { label: 'Status', value: selected.status ?? '' },
        { label: 'Date', value: selected.date ?? selected.createdAt ?? '' },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div><h2 className="text-lg font-semibold text-foreground">Communication Logs</h2>
        <p className="text-sm text-muted-foreground/60">{logs.length} log entries</p>
      </div>
      <div className="space-y-2">
        {logs.map((l: any) => (
          <Card key={l.id} className="border-border bg-card backdrop-blur-xl cursor-pointer hover:ring-1 hover:ring-accent/30 transition" onClick={() => setSelected(l)}>
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {l.type === 'email' ? <Mail className="size-4 text-blue-400/60" /> : l.type === 'sms' ? <Send className="size-4 text-green-400/60" /> : <Bell className="size-4 text-amber-400/60" />}
                <div>
                  <p className="text-sm text-foreground/80">{l.subject ?? l.type}</p>
                  <p className="text-xs text-muted-foreground/40">{l.recipient ?? 'Unknown'} -- {l.date ?? l.createdAt ?? ''}</p>
                </div>
              </div>
              <StatusBadge status={l.status ?? 'sent'} />
            </CardContent>
          </Card>
        ))}
        {logs.length === 0 && <p className="text-sm text-muted-foreground/40 text-center py-8">No communication logs</p>}
      </div>
      {selected && <DetailPanel title="Log Details" tabs={detailTabs} open={!!selected} onOpenChange={() => setSelected(null)} />}
    </div>
  );
}

/* --- Header tabs --- */
const headers = [
  { id: 'inbox', label: 'Inbox', icon: Mail },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'broadcast', label: 'Broadcast', icon: Send },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'logs', label: 'Logs', icon: Clock },
];

/* --- Main export --- */
export function AdminCommunicationSection() {
  const { activeHeader, setHeader } = useNavigationStore();
  const current = activeHeader || 'inbox';
  const containerRef = useStaggerAnimate([current]);

  const renderView = () => {
    switch (current) {
      case 'inbox': return <InboxView />;
      case 'announcements': return <AnnouncementsView />;
      case 'broadcast': return <BroadcastView />;
      case 'templates': return <TemplatesView />;
      case 'logs': return <LogsView />;
      default: return <InboxView />;
    }
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Sub-nav */}
      <div className="flex gap-1.5 flex-wrap">
        {headers.map((h) => {
          const Icon = h.icon;
          return (
            <Button key={h.id} size="sm" variant={current === h.id ? 'default' : 'outline'}
              className={'h-8 text-xs gap-1.5 ' + (current === h.id ? 'bg-accent' : 'border-border text-muted-foreground/70')}
              data-animate
              onClick={() => setHeader(h.id)}>
              <Icon className="size-3.5" /> {h.label}
            </Button>
          );
        })}
      </div>
      {renderView()}
    </div>
  );
}