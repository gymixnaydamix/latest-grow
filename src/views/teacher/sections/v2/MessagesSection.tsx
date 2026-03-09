/* ─── Messages Section ────────────────────────────────────────────
 * Routes: inbox (default) | compose
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  Inbox, MailOpen,
  Plus, Reply, Search, Send, User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useMessageThreads } from '@/hooks/api';
import { useSendTeacherMessage, useCreateTeacherThread, useTeacherMessages, useTeacherThreadMessages } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  TeacherSectionShell, GlassCard, MetricCard, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import { MsgDefaultsView } from './messages/MsgDefaultsView';
import { MsgNotificationsView } from './messages/MsgNotificationsView';
import { MsgSLAPoliciesView } from './messages/MsgSLAPoliciesView';
import { MsgLegalTemplatesView } from './messages/MsgLegalTemplatesView';
import { MsgEmailTemplatesView } from './messages/MsgEmailTemplatesView';
import { MsgAppearanceView } from './messages/MsgAppearanceView';
import {
  type MessageThreadDemo,
} from './teacher-demo-data';

/* ── Compose recipient suggestions ── */
const recipientSuggestions = [
  'Mrs. Kim (Parent)', 'Mr. Wei (Parent)', 'Mr. Brooks (Parent)',
  'Mr. Davis (Admin)', 'Ms. Johnson (Counselor)',
  'Mr. Thompson (Principal)', 'Ms. Rivera (Science Dept)',
];

/* ── Category styling map ── */
const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  parent: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Parent' },
  student: { bg: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-400', label: 'Student' },
  staff: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Staff' },
  admin: { bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400', label: 'Admin' },
};

/* ── Demo conversation messages for expanded threads ── */
export function MessagesSection({ schoolId, teacherId }: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const { user } = useAuthStore();
  const header = activeHeader || 'inbox';

  /* ── Settings sub-sections: delegate to dedicated views ── */
  const settingsViews: Record<string, React.ReactNode> = {
    msg_defaults: <MsgDefaultsView schoolId={schoolId} teacherId={teacherId} />,
    msg_notifications: <MsgNotificationsView schoolId={schoolId} teacherId={teacherId} />,
    msg_sla_policies: <MsgSLAPoliciesView schoolId={schoolId} teacherId={teacherId} />,
    msg_legal_templates: <MsgLegalTemplatesView schoolId={schoolId} teacherId={teacherId} />,
    msg_email_templates: <MsgEmailTemplatesView schoolId={schoolId} teacherId={teacherId} />,
    msg_appearance: <MsgAppearanceView schoolId={schoolId} teacherId={teacherId} />,
  };
  if (header in settingsViews) return <>{settingsViews[header]}</>

  const { data: apiThreads } = useMessageThreads(schoolId);
  const threads: MessageThreadDemo[] = (apiThreads as unknown as MessageThreadDemo[]) ?? [];

  const sendMessageMut = useSendTeacherMessage();
  const createThreadMut = useCreateTeacherThread();
  const { data: apiTeacherMessages } = useTeacherMessages();
  // Use teacher-specific messages as secondary fallback if generic threads empty
  const teacherMsgThreads = (apiTeacherMessages as any)?.data as MessageThreadDemo[] | undefined;
  const effectiveThreads: MessageThreadDemo[] = threads.length > 0 ? threads : (teacherMsgThreads ?? []);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  /* ── Fetch thread messages from API ── */
  const { data: threadMessagesData } = useTeacherThreadMessages(expandedThread);
  const threadMessages: { sender: string; body: string; time: string }[] = useMemo(() => {
    const apiMsgs = (threadMessagesData as any)?.data?.messages ?? (threadMessagesData as any)?.messages;
    if (apiMsgs?.length) return apiMsgs;
    // Fallback: show at least the last message from the thread
    if (expandedThread) {
      const thread = effectiveThreads.find(t => t.id === expandedThread);
      if (thread) return [{ sender: thread.lastSender, body: thread.lastMessage, time: thread.timestamp }];
    }
    return [];
  }, [threadMessagesData, expandedThread, effectiveThreads]);

  /* ── Compose state ── */
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const unreadCount = effectiveThreads.filter(t => t.unread).length;

  const filtered = useMemo(() => {
    let result = effectiveThreads;
    if (filterCategory !== 'all') result = result.filter(t => t.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(t =>
        t.subject.toLowerCase().includes(q) ||
        t.participants.some(p => p.toLowerCase().includes(q)) ||
        t.lastMessage.toLowerCase().includes(q),
      );
    }
    return result;
  }, [effectiveThreads, filterCategory, search]);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    sendMessageMut.mutate({ threadId: expandedThread ?? '', body: replyText }, { onSuccess: () => { notifySuccess('Message sent', 'Reply sent successfully'); setReplyText(''); } });
  };

  const handleComposeSend = () => {
    if (!composeSubject.trim() || !composeBody.trim()) return;
    createThreadMut.mutate({ recipient: composeRecipient, subject: composeSubject, body: composeBody }, { onSuccess: () => { notifySuccess('Message sent', `Message to ${composeRecipient}`); setComposeRecipient(''); setComposeSubject(''); setComposeBody(''); setHeader('inbox'); } });
  };

  return (
    <TeacherSectionShell
      title="Messages"
      description={`${effectiveThreads.length} conversations · ${unreadCount} unread`}
      actions={
        <Button
          size="sm"
          className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
          onClick={() => setHeader('compose')}
        >
          <Plus className="size-3.5" /> Compose
        </Button>
      }
    >
      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-animate>
        <MetricCard label="Total Threads" value={effectiveThreads.length} accent="#818cf8" />
        <MetricCard label="Unread" value={unreadCount} accent="#f472b6" />
        <MetricCard label="Parent Messages" value={effectiveThreads.filter(t => t.category === 'parent').length} accent="#fbbf24" />
        <MetricCard label="Today" value={effectiveThreads.filter(t => t.timestamp.includes('h ago')).length} accent="#34d399" />
      </div>

      {/* ── INBOX VIEW ── */}
      {header === 'inbox' && (
        <div className="space-y-4" data-animate>
          {/* Search + Filter Bar */}
          <GlassCard className="flex flex-wrap items-center gap-3 p-3!">
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="flex gap-1.5">
              {['all', 'parent', 'student', 'staff', 'admin'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    filterCategory === cat
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-card/80 text-muted-foreground border border-border/50 hover:bg-muted/70'
                  }`}
                >
                  {cat === 'all' ? 'All' : categoryStyles[cat]?.label ?? cat}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Thread List */}
          {filtered.length === 0 ? (
            <EmptyState title="No messages" message="No conversations match your search." icon={<Inbox className="size-8" />} />
          ) : (
            <div className="space-y-2">
              {filtered.map(thread => {
                const cat = categoryStyles[thread.category] ?? categoryStyles.staff;
                const isExpanded = expandedThread === thread.id;
                /* threadMessages comes from API hook at top of component */
                const convo = isExpanded ? threadMessages : null;

                return (
                  <div key={thread.id} className="space-y-0">
                    {/* Thread Row */}
                    <button
                      onClick={() => setExpandedThread(isExpanded ? null : thread.id)}
                      className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all ${
                        isExpanded
                          ? 'border-indigo-500/30 bg-indigo-500/5 rounded-b-none'
                          : thread.unread
                            ? 'border-border/70 bg-muted/60 hover:bg-muted/70'
                            : 'border-border/50 bg-card/60 hover:bg-card/80'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread indicator */}
                        <div className="mt-2 shrink-0">
                          {thread.unread ? (
                            <div className="size-2.5 rounded-full bg-indigo-400" />
                          ) : (
                            <MailOpen className="size-4 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-sm font-semibold ${thread.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {thread.subject}
                            </span>
                            <Badge className={`text-[9px] font-medium ${cat.bg} ${cat.text}`}>
                              {cat.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {thread.participants.join(', ')}
                          </p>
                          <p className={`text-xs truncate ${thread.unread ? 'text-muted-foreground' : 'text-muted-foreground/70'}`}>
                            <span className="font-medium text-muted-foreground">{thread.lastSender}:</span> {thread.lastMessage}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-muted-foreground/60 shrink-0 mt-1">{thread.timestamp}</span>
                      </div>
                    </button>

                    {/* Expanded Conversation */}
                    {isExpanded && (
                      <div className="rounded-b-xl border border-t-0 border-indigo-500/30 bg-indigo-500/3 px-4 pb-4">
                        <Separator className="bg-muted/80 mb-4" />
                        {convo && convo.length > 0 ? (
                          <div className="space-y-3 mb-4 max-h-75 overflow-y-auto pr-1">
                            {convo.map((msg, i) => (
                              <div
                                key={i}
                                className={`flex gap-3 ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}
                              >
                                <Avatar className="size-7 shrink-0 border border-border/70">
                                  <AvatarFallback className={`text-[9px] ${msg.sender === 'You' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-muted/70 text-muted-foreground'}`}>
                                    {msg.sender === 'You' ? (user?.firstName?.[0] ?? 'T') : msg.sender[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                                  msg.sender === 'You'
                                    ? 'bg-indigo-500/15 border border-indigo-500/20'
                                    : 'bg-muted/60 border border-border/50'
                                }`}>
                                  <p className="text-[11px] font-medium text-muted-foreground mb-1">{msg.sender} · {msg.time}</p>
                                  <p className="text-sm text-foreground/70 leading-relaxed">{msg.body}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground/70 mb-4 italic">No previous messages loaded.</p>
                        )}

                        {/* Reply Box */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type a reply..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows={2}
                            className="flex-1 bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60 resize-none"
                          />
                          <Button
                            size="sm"
                            className="self-end gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                            onClick={handleSendReply}
                          >
                            <Reply className="size-3.5" /> Reply
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── COMPOSE VIEW ── */}
      {header === 'compose' && (
        <GlassCard data-animate>
          <div className="flex items-center gap-2 mb-5">
            <Send className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-foreground/80">New Message</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Recipient</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <Input
                  placeholder="Search teacher, parent, staff, or student..."
                  value={composeRecipient}
                  onChange={e => setComposeRecipient(e.target.value)}
                  className="pl-9 bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
                />
              </div>
              {composeRecipient.length > 1 && (
                <div className="rounded-lg border border-border/60 bg-card/80 p-1.5 space-y-0.5">
                  {recipientSuggestions
                    .filter(n => n.toLowerCase().includes(composeRecipient.toLowerCase()))
                    .slice(0, 6)
                    .map(name => (
                      <button
                        key={name}
                        onClick={() => setComposeRecipient(name)}
                        className="w-full text-left px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-muted/70 transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Subject</Label>
              <Input
                placeholder="Message subject"
                value={composeSubject}
                onChange={e => setComposeSubject(e.target.value)}
                className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Message</Label>
              <Textarea
                placeholder="Write your message..."
                value={composeBody}
                onChange={e => setComposeBody(e.target.value)}
                rows={6}
                className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-muted-foreground"
                onClick={() => setHeader('inbox')}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
                onClick={handleComposeSend}
              >
                <Send className="size-3.5" /> Send Message
              </Button>
            </div>
          </div>
        </GlassCard>
      )}
    </TeacherSectionShell>
  );
}
