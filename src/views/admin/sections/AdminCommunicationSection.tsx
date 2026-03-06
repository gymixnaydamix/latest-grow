/* ─── AdminCommunicationSection ─── API-backed inbox, announcements, broadcast, templates, logs ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useMessages,
  useOpsAnnouncements,
  useOpsCreateAnnouncement,
  useOpsDeleteAnnouncement,
  useCommLogs,
  useTemplates,
} from '@/hooks/api/use-school-ops';
import {
  Send, Plus, Eye, Edit, Trash2, Mail, Bell, Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable, StatusBadge,
  FormDialog, type FormField,
  DetailPanel, DetailFields, type DetailTab,
} from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { notifySuccess, notifyInfo } from '@/lib/notify';

/* ── Local types ── */
interface MessageThread {
  id: string;
  from: string;
  subject: string;
  category: string;
  date: string;
  preview: string;
  unread: boolean;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  author: string;
  date: string;
  priority: string;
  status: string;
  reads: number;
}

interface Template {
  id: string;
  name: string;
  type: string;
  category: string;
  body: string;
  lastEdited: string;
  status: string;
}

/* ═══════════════ Inbox ═══════════════ */
function InboxView() {
  const { schoolId } = useAuthStore();
  const { data: msgRes } = useMessages(schoolId);
  const messages: MessageThread[] = Array.isArray(msgRes) ? msgRes : (msgRes as any)?.items ?? [];

  const [detail, setDetail] = useState<MessageThread | null>(null);

  const handleOpen = (msg: MessageThread) => {
    if (msg.unread) {
      notifyInfo('Mark as Read', 'Message read-status update API not available yet');
    }
    setDetail(msg);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Message', content: (
      <DetailFields fields={[
        { label: 'From', value: detail.from },
        { label: 'Subject', value: detail.subject },
        { label: 'Category', value: detail.category },
        { label: 'Date', value: detail.date },
        { label: 'Preview', value: detail.preview },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
          <p className="text-sm text-muted-foreground/60">{messages.filter(m => m.unread).length} unread messages</p>
        </div>
        <Button size="sm" className="h-8"
          onClick={() => notifyInfo('Compose', 'Opening message composer...')}>
          <Plus className="size-3.5 mr-1.5" /> Compose
        </Button>
      </div>

      <div className="space-y-1">
        {messages.map(msg => (
          <div
            key={msg.id}
            onClick={() => handleOpen(msg)}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
              !msg.unread ? 'bg-card border-border hover:bg-muted' : 'bg-accent border-border hover:bg-accent'
            }`}
          >
            <div className={`size-2 rounded-full mt-2 shrink-0 ${
              msg.category === 'Official' ? 'bg-red-500' : msg.category === 'Parent' ? 'bg-amber-500' : 'bg-blue-500/50'
            }`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${!msg.unread ? 'text-muted-foreground/70' : 'text-foreground/80 font-medium'}`}>{msg.from}</span>
                <Badge variant="outline" className="h-4 border-border text-[10px] text-muted-foreground/50">{msg.category}</Badge>
              </div>
              <p className={`text-sm truncate ${!msg.unread ? 'text-muted-foreground/60' : 'text-muted-foreground font-medium'}`}>{msg.subject}</p>
              <p className="text-xs text-muted-foreground/50 truncate">{msg.preview}</p>
            </div>
            <span className="text-xs text-muted-foreground/60 sm:whitespace-nowrap">{msg.date}</span>
          </div>
        ))}
      </div>

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={detail?.subject ?? ''} subtitle={`From: ${detail?.from ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Reply', icon: <Send className="size-3.5" />, onClick: () => notifyInfo('Reply', `Replying to ${detail?.from}...`) },
        ]} />
    </div>
  );
}

/* ═══════════════ Announcements ═══════════════ */
function AnnouncementsView() {
  const { schoolId } = useAuthStore();
  const { data: annRes } = useOpsAnnouncements(schoolId);
  const announcements: Announcement[] = Array.isArray(annRes) ? annRes : (annRes as any)?.items ?? [];
  const createMutation = useOpsCreateAnnouncement(schoolId);
  const deleteMutation = useOpsDeleteAnnouncement(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [detail, setDetail] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  const fields: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'body', label: 'Body', type: 'textarea', required: true },
    { name: 'audience', label: 'Audience', type: 'text', required: true, half: true, placeholder: 'All, Parents, Staff...' },
    { name: 'author', label: 'Author', type: 'text', required: true, half: true },
    { name: 'date', label: 'Date', type: 'date', required: true, half: true, defaultValue: new Date().toISOString().split('T')[0] },
    { name: 'priority', label: 'Priority', type: 'select', half: true, options: [
      { label: 'Info', value: 'info' },
      { label: 'Warning', value: 'warning' },
      { label: 'Critical', value: 'critical' },
    ], defaultValue: 'info' },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Draft', value: 'Draft' },
      { label: 'Scheduled', value: 'Scheduled' },
      { label: 'Published', value: 'Published' },
    ], defaultValue: 'Draft' },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      notifyInfo('Not yet implemented', 'Announcement update API not available yet');
    } else {
      createMutation.mutate(data as any, {
        onSuccess: () => notifySuccess('Created', `Announcement "${data.title}" created`),
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Info', content: (
      <DetailFields fields={[
        { label: 'Title', value: detail.title },
        { label: 'Audience', value: detail.audience },
        { label: 'Author', value: detail.author },
        { label: 'Date', value: detail.date },
        { label: 'Priority', value: detail.priority || 'info' },
        { label: 'Reads', value: String(detail.reads) },
        { label: 'Status', value: detail.status },
      ]} />
    ) },
    { id: 'body', label: 'Content', content: (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detail.body || 'No content'}</p>
      </div>
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Announcements</h2>
          <p className="text-sm text-muted-foreground/60">{announcements.length} announcements - {announcements.filter(a => a.status === 'Published').length} published</p>
        </div>
        <Button size="sm" className="h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> New Announcement
        </Button>
      </div>

      <DataTable
        data={announcements as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'title', label: 'Title', sortable: true, render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'audience', label: 'Audience', render: v => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'priority', label: 'Priority', render: v => {
            const c = String(v) === 'critical' ? 'border-red-500/30 text-red-400' : String(v) === 'warning' ? 'border-amber-500/30 text-amber-400' : 'border-blue-500/30 text-blue-400';
            return <Badge variant="outline" className={`text-[10px] capitalize ${c}`}>{String(v || 'info')}</Badge>;
          } },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'reads', label: 'Reads', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as Announcement) },
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as Announcement); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: r => setDeleteTarget(r as unknown as Announcement), variant: 'destructive' },
        ]}
        searchPlaceholder="Search announcements..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Announcement' : 'New Announcement'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={detail?.title ?? ''} subtitle={`${detail?.audience ?? ''} \u00b7 ${detail?.status ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Publish', icon: <Send className="size-3.5" />, onClick: () => {
            if (detail) { notifyInfo('Not yet implemented', 'Announcement publish API not available yet'); setDetail(null); }
          } },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Delete Announcement?" description={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id as any, {
              onSuccess: () => notifySuccess('Deleted', `"${deleteTarget.title}" deleted`),
            });
            setDeleteTarget(null);
          }
        }} />
    </div>
  );
}

/* ═══════════════ Broadcast ═══════════════ */
function BroadcastView() {
  const { schoolId } = useAuthStore();
  const { data: logsRes } = useCommLogs(schoolId);
  const commLogs: any[] = Array.isArray(logsRes) ? logsRes : (logsRes as any)?.items ?? [];
  const recentBroadcasts = commLogs.filter((l: any) => l.type === 'Announcement').slice(0, 4);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Broadcast Messages</h2>
        <p className="text-sm text-muted-foreground/60">Send mass communications via SMS, email, or push</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {([
          { icon: Mail, label: 'Email Blast', desc: 'Send to all or filtered groups', color: 'text-blue-400' },
          { icon: Phone, label: 'SMS Blast', desc: 'Text message to parents', color: 'text-emerald-400' },
          { icon: Bell, label: 'Push Notification', desc: 'App notification blast', color: 'text-purple-400' },
        ] as const).map(ch => {
          const Icon = ch.icon;
          return (
            <Card key={ch.label} className="border-border bg-card backdrop-blur-xl hover:bg-accent transition-colors cursor-pointer">
              <CardContent className="pt-4 text-center space-y-2">
                <div className={`size-10 rounded-xl bg-muted flex items-center justify-center mx-auto ${ch.color}`}>
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-medium text-foreground/80">{ch.label}</p>
                <p className="text-xs text-muted-foreground/60">{ch.desc}</p>
                <Button size="sm" variant="outline" className="w-full border-border text-muted-foreground/70 h-7 text-xs"
                  onClick={() => notifyInfo('Compose', `Opening ${ch.label} composer...`)}>
                  <Send className="size-3 mr-1" /> Compose
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent from comm logs */}
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Recent Broadcasts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {recentBroadcasts.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 text-center py-4">No broadcast logs yet.</p>
          ) : (
            recentBroadcasts.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card hover:bg-accent transition-colors">
                <Badge variant="outline" className="w-12 justify-center border-border text-xs text-muted-foreground/70">{b.channel}</Badge>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{b.subject}</p>
                  <p className="text-xs text-muted-foreground/60">To: {b.recipient} - {b.status}</p>
                </div>
                <span className="text-xs text-muted-foreground/60">{b.sentAt.split(' ')[0]}</span>
              </div>
            ))
          )}

          {/* Also show all comm logs as recent broadcasts summary */}
          {commLogs.filter((l: any) => l.type !== 'Announcement').slice(0, 3).map((b: any) => (
            <div key={b.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card hover:bg-accent transition-colors">
              <Badge variant="outline" className="w-12 justify-center border-border text-xs text-muted-foreground/70">{b.channel}</Badge>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{b.subject}</p>
                <p className="text-xs text-muted-foreground/60">To: {b.recipient} - {b.status}</p>
              </div>
              <span className="text-xs text-muted-foreground/60">{b.sentAt.split(' ')[0]}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ═══════════════ Templates ═══════════════ */
function TemplatesView() {
  const { schoolId } = useAuthStore();
  const { data: tmplRes } = useTemplates(schoolId);
  const templates: Template[] = Array.isArray(tmplRes) ? tmplRes : (tmplRes as any)?.items ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [detail, setDetail] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const fields: FormField[] = [
    { name: 'name', label: 'Template Name', type: 'text', required: true },
    { name: 'type', label: 'Channel', type: 'select', required: true, half: true, options: [
      { label: 'Email', value: 'Email' },
      { label: 'SMS', value: 'SMS' },
      { label: 'Push', value: 'Push' },
    ] },
    { name: 'category', label: 'Category', type: 'text', required: true, half: true },
    { name: 'body', label: 'Template Body', type: 'textarea', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Active', value: 'Active' },
      { label: 'Draft', value: 'Draft' },
      { label: 'Archived', value: 'Archived' },
    ], defaultValue: 'Active' },
  ];

  const handleSave = (_data: Record<string, unknown>) => {
    notifyInfo('Not yet implemented', 'Template save API not available yet');
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Info', content: (
      <DetailFields fields={[
        { label: 'Name', value: detail.name },
        { label: 'Channel', value: detail.type },
        { label: 'Category', value: detail.category },
        { label: 'Last Edited', value: detail.lastEdited },
        { label: 'Status', value: detail.status },
      ]} />
    ) },
    { id: 'body', label: 'Template Body', content: (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">{detail.body}</p>
      </div>
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Message Templates</h2>
          <p className="text-sm text-muted-foreground/60">{templates.length} templates - {templates.filter(t => t.status === 'Active').length} active</p>
        </div>
        <Button size="sm" className="h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> Create Template
        </Button>
      </div>

      <DataTable
        data={templates as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Template', sortable: true, render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'type', label: 'Channel', render: v => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'category', label: 'Category' },
          { key: 'lastEdited', label: 'Last Edited', sortable: true },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as Template) },
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as Template); setFormOpen(true); } },
          { label: 'Use', icon: Send, onClick: r => notifySuccess('Template Applied', `Using template "${String(r.name)}"`) },
          { label: 'Delete', icon: Trash2, onClick: r => setDeleteTarget(r as unknown as Template), variant: 'destructive' },
        ]}
        searchPlaceholder="Search templates..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Template' : 'Create Template'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={detail?.name ?? ''} subtitle={`${detail?.type ?? ''} \u00b7 ${detail?.category ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Use Template', icon: <Send className="size-3.5" />, onClick: () => notifySuccess('Applied', `Using "${detail?.name}"`) },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Delete Template?" description={`Delete template "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            notifyInfo('Not yet implemented', 'Template delete API not available yet');
            setDeleteTarget(null);
          }
        }} />
    </div>
  );
}

/* ═══════════════ Delivery Logs ═══════════════ */
function DeliveryLogsView() {
  const { schoolId } = useAuthStore();
  const { data: logsRes } = useCommLogs(schoolId);
  const logs: any[] = Array.isArray(logsRes) ? logsRes : (logsRes as any)?.items ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Delivery Logs</h2>
        <p className="text-sm text-muted-foreground/60">{logs.length} entries - {logs.filter((l: any) => l.status === 'Failed').length} failed</p>
      </div>

      <DataTable
        data={logs as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'Log ID', render: v => <span className="font-mono text-xs text-muted-foreground/40">{String(v)}</span> },
          { key: 'channel', label: 'Channel', render: v => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'type', label: 'Type' },
          { key: 'recipient', label: 'Recipient', render: v => <span className="font-mono text-xs text-muted-foreground/60">{String(v)}</span> },
          { key: 'subject', label: 'Subject' },
          { key: 'sentAt', label: 'Sent', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Retry', icon: Send, onClick: r => notifySuccess('Retrying', `Retrying delivery for ${String(r.id)}`) },
          { label: 'View', icon: Eye, onClick: r => notifyInfo('View', `Opening log entry ${String(r.id)}`) },
        ]}
        searchPlaceholder="Search logs..."
      />
    </div>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export function AdminCommunicationSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'comm_announcements': return <AnnouncementsView />;
      case 'comm_broadcast': return <BroadcastView />;
      case 'comm_templates': return <TemplatesView />;
      case 'comm_logs': return <DeliveryLogsView />;
      default: return <InboxView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}

