/* ─── ProviderCommsSection ─── Announcements · Email System · Templates ─── */
import { Archive, ArrowLeft, Clock, Edit3, FileText, Forward, Inbox, Loader2, Mail, Megaphone, Paperclip, PenSquare, PlusCircle, Reply, Search, Send, Star, Trash2 } from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderComms,
  useSendProviderAnnouncement,
  useProviderTenants,
  useCreateProviderAnnouncement,
  useCreateProviderCommsTemplate,
  useUpdateProviderCommsTemplate,
  useProviderEmails,
  useComposeProviderEmail,
  useUpdateProviderEmail,
  useDeleteProviderEmail,
} from '@/hooks/api/use-provider-console';
import type { EmailMessageDTO } from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';
import { notifySuccess } from '@/lib/notify';

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

/* ── Email System ── */
type EmailFolder = 'INBOX' | 'SENT' | 'DRAFTS' | 'STARRED' | 'ARCHIVE' | 'TRASH';

const FOLDER_META: Record<EmailFolder, { icon: React.ComponentType<{ className?: string }>; label: string; gradient: string }> = {
  INBOX:   { icon: Inbox,     label: 'Inbox',   gradient: 'from-teal-500/10 to-teal-500/5' },
  SENT:    { icon: Send,      label: 'Sent',    gradient: 'from-blue-500/10 to-blue-500/5' },
  DRAFTS:  { icon: Edit3,     label: 'Drafts',  gradient: 'from-amber-500/10 to-amber-500/5' },
  STARRED: { icon: Star,      label: 'Starred', gradient: 'from-yellow-500/10 to-yellow-500/5' },
  ARCHIVE: { icon: Archive,   label: 'Archive', gradient: 'from-slate-500/10 to-slate-500/5' },
  TRASH:   { icon: Trash2,    label: 'Trash',   gradient: 'from-red-500/10 to-red-500/5' },
};

function folderFromSubNav(subNav: string): EmailFolder | 'COMPOSE' {
  switch (subNav) {
    case 'msg_inbox':   return 'INBOX';
    case 'msg_compose':  return 'COMPOSE';
    case 'msg_sent':     return 'SENT';
    case 'msg_drafts':   return 'DRAFTS';
    case 'msg_starred':  return 'STARRED';
    case 'msg_archive':  return 'ARCHIVE';
    case 'msg_trash':    return 'TRASH';
    default:             return 'INBOX';
  }
}

function MessagingView() {
  const accent = getAccent('provider_comms');
  const { activeSubNav } = useNavigationStore();
  const activeFolder = folderFromSubNav(activeSubNav);

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [composeMode, setComposeMode] = useState<'new' | 'reply' | 'forward' | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<EmailMessageDTO | null>(null);

  const openCompose = useCallback((mode: 'new' | 'reply' | 'forward', msg?: EmailMessageDTO) => {
    setComposeMode(mode);
    setReplyToMessage(msg ?? null);
    setSelectedMessageId(null);
  }, []);

  const closeCompose = useCallback(() => {
    setComposeMode(null);
    setReplyToMessage(null);
  }, []);

  if (activeFolder === 'COMPOSE' || composeMode) {
    return <ComposeView accent={accent} mode={composeMode ?? 'new'} replyTo={replyToMessage} onClose={closeCompose} />;
  }

  if (selectedMessageId) {
    return (
      <MessageDetailView
        messageId={selectedMessageId}
        folder={activeFolder}
        onBack={() => setSelectedMessageId(null)}
        onReply={(msg) => openCompose('reply', msg)}
        onForward={(msg) => openCompose('forward', msg)}
      />
    );
  }

  return <MessageListView accent={accent} folder={activeFolder} onSelect={setSelectedMessageId} onCompose={() => openCompose('new')} />;
}

/* ── Message List View ── */
function MessageListView({ accent, folder, onSelect, onCompose }: {
  accent: ReturnType<typeof getAccent>;
  folder: EmailFolder;
  onSelect: (id: string) => void;
  onCompose: () => void;
}) {
  const { data: bundle, isLoading } = useProviderEmails(folder);
  const updateEmail = useUpdateProviderEmail();
  const deleteEmail = useDeleteProviderEmail();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const messages = bundle?.messages ?? [];
  const folders = bundle?.folders ?? [];
  const folderInfo = FOLDER_META[folder];

  const filtered = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter(
      (m) =>
        m.subject.toLowerCase().includes(q) ||
        m.fromName.toLowerCase().includes(q) ||
        m.from.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q),
    );
  }, [messages, search]);

  const inboxFolder = folders.find((f) => f.name === 'INBOX');
  const unreadCount = inboxFolder?.unread ?? 0;
  const totalMessages = messages.length;

  const toggleStar = (msg: EmailMessageDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    updateEmail.mutate({ messageId: msg.id, isStarred: !msg.isStarred, reason: msg.isStarred ? 'Unstar' : 'Star message' });
  };

  const markRead = (msg: EmailMessageDTO) => {
    if (!msg.isRead) {
      updateEmail.mutate({ messageId: msg.id, isRead: true, reason: 'Mark read' });
    }
  };

  const handleSelect = (id: string) => {
    markRead(messages.find((m) => m.id === id)!);
    onSelect(id);
  };

  const toggleSelectId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkTrash = () => {
    if (selectedIds.size === 0) return;
    const reason = reasonPrompt(`Move ${selectedIds.size} messages to trash`);
    if (!reason) return;
    for (const id of selectedIds) {
      if (folder === 'TRASH') {
        deleteEmail.mutate({ messageId: id, reason });
      } else {
        updateEmail.mutate({ messageId: id, folder: 'TRASH', reason });
      }
    }
    setSelectedIds(new Set());
    notifySuccess(folder === 'TRASH' ? 'Messages permanently deleted' : 'Messages moved to trash');
  };

  const bulkMarkRead = () => {
    if (selectedIds.size === 0) return;
    for (const id of selectedIds) {
      updateEmail.mutate({ messageId: id, isRead: true, reason: 'Bulk mark read' });
    }
    setSelectedIds(new Set());
    notifySuccess('Messages marked as read');
  };

  const bulkArchive = () => {
    if (selectedIds.size === 0) return;
    const reason = reasonPrompt(`Archive ${selectedIds.size} messages`);
    if (!reason) return;
    for (const id of selectedIds) {
      updateEmail.mutate({ messageId: id, folder: 'ARCHIVE', reason });
    }
    setSelectedIds(new Set());
    notifySuccess('Messages archived');
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60_000) return 'Just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    if (diff < 7 * 86_400_000) return d.toLocaleDateString(undefined, { weekday: 'short' });
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <SectionShell>
      <SectionPageHeader
        icon={folderInfo.icon}
        title={folderInfo.label}
        description={`${totalMessages} messages${unreadCount > 0 ? ` · ${unreadCount} unread` : ''}`}
        accent={accent}
        actions={
          <Button size="sm" className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={onCompose}>
            <PenSquare className="mr-1 size-3" />Compose
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        {folders.slice(0, 4).map((f) => {
          const meta = FOLDER_META[f.name as EmailFolder];
          if (!meta) return null;
          return (
            <StatCard
              key={f.name}
              label={meta.label}
              value={String(f.count)}
              sub={f.unread > 0 ? `${f.unread} unread` : 'Messages'}
              gradient={meta.gradient}
            />
          );
        })}
      </div>

      {/* Search + Bulk actions */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
          <Input
            className="h-8 pl-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100"
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400">{selectedIds.size} selected</span>
            <Button size="sm" className="h-7 text-[10px] bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={bulkMarkRead}>
              Mark Read
            </Button>
            {folder !== 'ARCHIVE' && folder !== 'TRASH' && (
              <Button size="sm" className="h-7 text-[10px] bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={bulkArchive}>
                <Archive className="mr-1 size-3" />Archive
              </Button>
            )}
            <Button size="sm" className="h-7 text-[10px] bg-red-500/20 text-red-200 hover:bg-red-500/30" onClick={bulkTrash}>
              <Trash2 className="mr-1 size-3" />{folder === 'TRASH' ? 'Delete' : 'Trash'}
            </Button>
          </div>
        )}
      </div>

      {/* Message list */}
      <Panel title="" subtitle="">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-teal-400" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={folderInfo.icon}
            title={search ? 'No matching messages' : `No messages in ${folderInfo.label}`}
            description={search ? 'Try a different search term.' : folder === 'INBOX' ? 'Your inbox is empty.' : `No messages in ${folderInfo.label.toLowerCase()}.`}
            action={
              folder === 'INBOX' ? (
                <Button size="sm" className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={onCompose}>
                  <PenSquare className="mr-1 size-3" />Compose New
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filtered.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 px-3 py-2.5 cursor-pointer transition-colors hover:bg-slate-700/30 ${!msg.isRead ? 'bg-teal-500/5' : ''} ${selectedIds.has(msg.id) ? 'bg-teal-500/10 ring-1 ring-teal-500/30' : ''}`}
                onClick={() => handleSelect(msg.id)}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  className={`mt-1 size-4 shrink-0 rounded border ${selectedIds.has(msg.id) ? 'border-teal-400 bg-teal-500' : 'border-slate-500'} flex items-center justify-center`}
                  onClick={(e) => toggleSelectId(msg.id, e)}
                >
                  {selectedIds.has(msg.id) && <span className="text-[8px] text-white font-bold">✓</span>}
                </button>

                {/* Star */}
                <button
                  type="button"
                  className="mt-1 shrink-0"
                  onClick={(e) => toggleStar(msg, e)}
                >
                  <Star className={`size-3.5 ${msg.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500 hover:text-yellow-400'}`} />
                </button>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`truncate text-xs ${!msg.isRead ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                        {folder === 'SENT' || folder === 'DRAFTS' ? `To: ${(msg.to ?? []).join(', ') || '(no recipients)'}` : msg.fromName}
                      </span>
                      {!msg.isRead && <span className="size-2 shrink-0 rounded-full bg-teal-400" />}
                    </div>
                    <span className="shrink-0 text-[10px] text-slate-500">{formatDate(msg.sentAt ?? msg.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={`truncate text-xs ${!msg.isRead ? 'font-semibold text-slate-200' : 'text-slate-300'}`}>{msg.subject || '(no subject)'}</p>
                    {msg.hasAttachments && <Paperclip className="size-3 shrink-0 text-slate-500" />}
                  </div>
                  <p className="truncate text-[10px] text-slate-500 mt-0.5">{msg.body.slice(0, 120).replace(/\n/g, ' ')}</p>
                  {(msg.labels ?? []).length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {msg.labels.map((label) => (
                        <span key={label} className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[9px] text-teal-200 border border-teal-500/30">{label}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Message Detail View ── */
function MessageDetailView({ messageId, folder, onBack, onReply, onForward }: {
  messageId: string;
  folder: EmailFolder;
  onBack: () => void;
  onReply: (msg: EmailMessageDTO) => void;
  onForward: (msg: EmailMessageDTO) => void;
}) {
  const { data: bundle } = useProviderEmails(folder);
  const updateEmail = useUpdateProviderEmail();
  const deleteEmail = useDeleteProviderEmail();

  const messages = bundle?.messages ?? [];
  const msg = messages.find((m) => m.id === messageId);

  if (!msg) {
    return (
      <SectionShell>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-500/40" onClick={onBack}>
            <ArrowLeft className="mr-1 size-3" />Back
          </Button>
        </div>
        <EmptyState icon={Mail} title="Message not found" description="This message may have been deleted or moved." />
      </SectionShell>
    );
  }

  const handleStar = () => {
    updateEmail.mutate({ messageId: msg.id, isStarred: !msg.isStarred, reason: msg.isStarred ? 'Unstar' : 'Star message' });
  };

  const handleArchive = () => {
    const reason = reasonPrompt('Archive this message');
    if (!reason) return;
    updateEmail.mutate({ messageId: msg.id, folder: 'ARCHIVE', reason }, { onSuccess: () => { notifySuccess('Message archived'); onBack(); } });
  };

  const handleTrash = () => {
    if (folder === 'TRASH') {
      const reason = reasonPrompt('Permanently delete this message');
      if (!reason) return;
      deleteEmail.mutate({ messageId: msg.id, reason }, { onSuccess: () => { notifySuccess('Message deleted permanently'); onBack(); } });
    } else {
      const reason = reasonPrompt('Move to trash');
      if (!reason) return;
      updateEmail.mutate({ messageId: msg.id, folder: 'TRASH', reason }, { onSuccess: () => { notifySuccess('Message moved to trash'); onBack(); } });
    }
  };

  const formatFullDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SectionShell>
      {/* Top actions */}
      <div className="flex items-center justify-between gap-2">
        <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-500/40" onClick={onBack}>
          <ArrowLeft className="mr-1 size-3" />Back to {FOLDER_META[folder].label}
        </Button>
        <div className="flex items-center gap-1">
          <Button size="sm" className="h-7 text-[10px] bg-teal-500/20 text-teal-100 hover:bg-teal-500/30" onClick={() => onReply(msg)}>
            <Reply className="mr-1 size-3" />Reply
          </Button>
          <Button size="sm" className="h-7 text-[10px] bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => onForward(msg)}>
            <Forward className="mr-1 size-3" />Forward
          </Button>
          <Button size="sm" className="h-7 text-[10px] bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={handleStar}>
            <Star className={`mr-1 size-3 ${msg.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />{msg.isStarred ? 'Unstar' : 'Star'}
          </Button>
          {folder !== 'ARCHIVE' && folder !== 'TRASH' && (
            <Button size="sm" className="h-7 text-[10px] bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={handleArchive}>
              <Archive className="mr-1 size-3" />Archive
            </Button>
          )}
          <Button size="sm" className="h-7 text-[10px] bg-red-500/20 text-red-200 hover:bg-red-500/30" onClick={handleTrash}>
            <Trash2 className="mr-1 size-3" />{folder === 'TRASH' ? 'Delete' : 'Trash'}
          </Button>
        </div>
      </div>

      {/* Message header */}
      <Panel title={msg.subject || '(no subject)'} accentBorder="border-teal-500/20">
        <div className="space-y-3">
          {/* From / To / CC / Date */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-200 text-xs font-bold">
                  {msg.fromName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-100">{msg.fromName}</p>
                  <p className="text-slate-400">&lt;{msg.from}&gt;</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="size-3" />
                <span className="text-[10px]">{formatFullDate(msg.sentAt ?? msg.createdAt)}</span>
              </div>
            </div>
            <div className="pl-10 space-y-0.5">
              <p className="text-slate-400">To: <span className="text-slate-300">{(msg.to ?? []).join(', ') || '—'}</span></p>
              {(msg.cc ?? []).length > 0 && <p className="text-slate-400">Cc: <span className="text-slate-300">{msg.cc.join(', ')}</span></p>}
            </div>
          </div>

          {/* Labels */}
          {(msg.labels ?? []).length > 0 && (
            <div className="flex gap-1 pl-10">
              {msg.labels.map((label) => (
                <span key={label} className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[9px] text-teal-200 border border-teal-500/30">{label}</span>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="rounded-lg border border-slate-600/40 bg-slate-800/50 p-4">
            <pre className="whitespace-pre-wrap text-xs text-slate-200 font-sans leading-relaxed">{msg.body}</pre>
          </div>

          {/* Attachments */}
          {msg.hasAttachments && (msg.attachments ?? []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Paperclip className="size-3" />Attachments ({msg.attachments.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {msg.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 rounded-lg border border-slate-600/40 bg-slate-700/50 px-3 py-2 text-xs">
                    <FileText className="size-4 text-teal-400" />
                    <div>
                      <p className="text-slate-200 font-medium">{att.name}</p>
                      <p className="text-[10px] text-slate-500">{att.size}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-teal-500/30 ml-2" onClick={() => notifySuccess(`Download started: ${att.name}`)}>
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* Quick reply */}
      <QuickReplyPanel messageId={msg.id} />
    </SectionShell>
  );
}

/* ── Quick Reply Panel ── */
function QuickReplyPanel({ messageId }: { messageId: string }) {
  const [replyBody, setReplyBody] = useState('');
  const compose = useComposeProviderEmail();

  const handleQuickReply = () => {
    if (!replyBody.trim()) return;
    const reason = reasonPrompt('Send quick reply');
    if (!reason) return;
    compose.mutate(
      { to: [], subject: '', body: replyBody, replyToId: messageId, reason },
      {
        onSuccess: () => {
          setReplyBody('');
          notifySuccess('Reply sent');
        },
      },
    );
  };

  return (
    <Panel title="Quick Reply" accentBorder="border-teal-500/20">
      <div className="space-y-2">
        <textarea
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          placeholder="Write your reply…"
          rows={3}
          className="w-full rounded-md border border-slate-500/40 bg-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 resize-none"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            className="h-7 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
            onClick={handleQuickReply}
            disabled={!replyBody.trim() || compose.isPending}
          >
            {compose.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Send className="mr-1 size-3" />}
            Send Reply
          </Button>
        </div>
      </div>
    </Panel>
  );
}

/* ── Compose View ── */
function ComposeView({ accent, mode, replyTo, onClose }: {
  accent: ReturnType<typeof getAccent>;
  mode: 'new' | 'reply' | 'forward';
  replyTo: EmailMessageDTO | null;
  onClose: () => void;
}) {
  const compose = useComposeProviderEmail();
  const { setSubNav } = useNavigationStore();

  const [to, setTo] = useState(() => {
    if (mode === 'reply' && replyTo) return replyTo.from;
    return '';
  });
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [subject, setSubject] = useState(() => {
    if (mode === 'reply' && replyTo) return `Re: ${replyTo.subject}`;
    if (mode === 'forward' && replyTo) return `Fwd: ${replyTo.subject}`;
    return '';
  });
  const [body, setBody] = useState(() => {
    if (mode === 'reply' && replyTo) {
      return `\n\n---\nOn ${new Date(replyTo.sentAt ?? replyTo.createdAt).toLocaleString()}, ${replyTo.fromName} wrote:\n\n${replyTo.body}`;
    }
    if (mode === 'forward' && replyTo) {
      return `\n\n--- Forwarded message ---\nFrom: ${replyTo.fromName} <${replyTo.from}>\nDate: ${new Date(replyTo.sentAt ?? replyTo.createdAt).toLocaleString()}\nSubject: ${replyTo.subject}\n\n${replyTo.body}`;
    }
    return '';
  });

  const toRecipients = to.split(',').map((s) => s.trim()).filter(Boolean);
  const ccRecipients = cc.split(',').map((s) => s.trim()).filter(Boolean);
  const bccRecipients = bcc.split(',').map((s) => s.trim()).filter(Boolean);

  const canSend = toRecipients.length > 0 && subject.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    const reason = reasonPrompt('Send email');
    if (!reason) return;
    compose.mutate(
      {
        to: toRecipients,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        subject,
        body,
        folder: 'SENT',
        replyToId: mode === 'reply' && replyTo ? replyTo.id : undefined,
        forwardedFromId: mode === 'forward' && replyTo ? replyTo.id : undefined,
        reason,
      },
      {
        onSuccess: () => {
          notifySuccess('Email sent successfully');
          onClose();
          setSubNav('msg_sent');
        },
      },
    );
  };

  const handleSaveDraft = () => {
    const reason = reasonPrompt('Save draft');
    if (!reason) return;
    compose.mutate(
      {
        to: toRecipients,
        cc: ccRecipients.length > 0 ? ccRecipients : undefined,
        bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
        subject,
        body,
        folder: 'DRAFTS',
        reason,
      },
      {
        onSuccess: () => {
          notifySuccess('Draft saved');
          onClose();
          setSubNav('msg_drafts');
        },
      },
    );
  };

  const handleDiscard = () => {
    onClose();
    setSubNav('msg_inbox');
  };

  const titleText = mode === 'reply' ? 'Reply' : mode === 'forward' ? 'Forward' : 'New Message';
  const Icon = mode === 'reply' ? Reply : mode === 'forward' ? Forward : PenSquare;

  return (
    <SectionShell>
      <SectionPageHeader
        icon={Icon}
        title={titleText}
        description={mode === 'reply' && replyTo ? `Replying to ${replyTo.fromName}` : mode === 'forward' && replyTo ? `Forwarding: ${replyTo.subject}` : 'Compose a new email message'}
        accent={accent}
        actions={
          <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-500/40" onClick={handleDiscard}>
            Discard
          </Button>
        }
      />

      <Panel title="" accentBorder="border-teal-500/20">
        <div className="space-y-3">
          {/* To */}
          <div className="flex items-center gap-2">
            <label className="w-10 text-right text-xs text-slate-400">To</label>
            <Input
              className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100"
              placeholder="recipient@school.edu (comma-separated)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            {!showCcBcc && (
              <Button size="sm" variant="outline" className="h-7 text-[10px] border-slate-500/30" onClick={() => setShowCcBcc(true)}>
                Cc/Bcc
              </Button>
            )}
          </div>

          {/* CC */}
          {showCcBcc && (
            <>
              <div className="flex items-center gap-2">
                <label className="w-10 text-right text-xs text-slate-400">Cc</label>
                <Input
                  className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100"
                  placeholder="cc@school.edu"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="w-10 text-right text-xs text-slate-400">Bcc</label>
                <Input
                  className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100"
                  placeholder="bcc@school.edu"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Subject */}
          <div className="flex items-center gap-2">
            <label className="w-10 text-right text-xs text-slate-400">Subj</label>
            <Input
              className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message…"
            rows={12}
            className="w-full rounded-md border border-slate-500/40 bg-slate-700 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 resize-y"
          />

          {/* Formatting hint */}
          <p className="text-[10px] text-slate-500">Tip: Use line breaks for paragraphs. Rich formatting coming soon.</p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-slate-500">
              <Paperclip className="size-3.5" />
              <span className="text-[10px]">Attachments not yet supported</span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-8 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={handleSaveDraft} disabled={compose.isPending}>
                <Edit3 className="mr-1 size-3" />Save Draft
              </Button>
              <Button
                size="sm"
                className="h-8 bg-teal-500/20 text-teal-100 hover:bg-teal-500/30"
                onClick={handleSend}
                disabled={!canSend || compose.isPending}
              >
                {compose.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Send className="mr-1 size-3" />}
                Send
              </Button>
            </div>
          </div>
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
  const [previewTplId, setPreviewTplId] = useState<string | null>(null);

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
                      {(tpl.variables ?? []).map((v) => (
                        <span key={v} className="rounded-full bg-teal-500/15 px-2 py-0.5 text-[10px] text-teal-200 border border-teal-500/30">{`{{${v}}}`}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-teal-500/30" onClick={() => { setEditId(tpl.id); setEditSubject(tpl.subject); }}>Edit</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-teal-500/30" onClick={() => setPreviewTplId(previewTplId === tpl.id ? null : tpl.id)}>
                        {previewTplId === tpl.id ? 'Close' : 'Preview'}
                      </Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-teal-500/30" onClick={() => { navigator.clipboard.writeText(tpl.subject); notifySuccess('Subject copied to clipboard'); }}>Use</Button>
                    </div>
                    {previewTplId === tpl.id && (
                      <div className="mt-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3 space-y-2 text-[10px]">
                        <p className="font-semibold text-teal-200">Template Preview</p>
                        <div className="rounded-lg border border-slate-600 bg-slate-800/80 p-3">
                          <p className="text-slate-400 mb-1">Subject: <span className="text-slate-100">{tpl.subject}</span></p>
                          <p className="text-slate-400">Type: <span className="text-slate-100">{tpl.type}</span></p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(tpl.variables ?? []).map((v) => (
                              <span key={v} className="rounded bg-teal-500/15 px-1.5 py-0.5 text-teal-200 border border-teal-500/30">{`{{${v}}}`}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
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
