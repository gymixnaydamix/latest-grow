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
import { useSendTeacherMessage, useCreateTeacherThread, useTeacherMessages } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  TeacherSectionShell, GlassCard, MetricCard, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  messageThreadsDemo as FALLBACK_messageThreadsDemo, type MessageThreadDemo,
} from './teacher-demo-data';

/* ── Category styling map ── */
const categoryStyles: Record<string, { bg: string; text: string; label: string }> = {
  parent: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'Parent' },
  student: { bg: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-400', label: 'Student' },
  staff: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Staff' },
  admin: { bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-400', label: 'Admin' },
};

/* ── Demo conversation messages for expanded threads ── */
const threadMessagesDemo: Record<string, { sender: string; body: string; time: string }[]> = {
  mt1: [
    { sender: 'You', body: 'Hi Mrs. Kim, I wanted to reach out about Jordan\'s missing assignments in Pre-Algebra. He has 3 outstanding this month.', time: 'Mar 4, 2:30 PM' },
    { sender: 'Mrs. Kim', body: 'Thank you for letting me know, Ms. Chen. We were not aware of this. Can you send the list of assignments?', time: 'Mar 4, 4:15 PM' },
    { sender: 'You', body: 'Of course — HW Set 5, Chapter 4 Practice, and the Fraction Review worksheet. All were due within the past 2 weeks.', time: 'Mar 4, 4:45 PM' },
    { sender: 'Mrs. Kim', body: 'Thank you, Ms. Chen. We will make sure Jordan completes the work this weekend.', time: 'Mar 5, 9:20 AM' },
  ],
  mt3: [
    { sender: 'Chen Wei', body: 'Ms. Chen, can I do the advanced projectile problem for extra credit?', time: 'Mar 4, 3:10 PM' },
  ],
  mt4: [
    { sender: 'Ms. Johnson', body: 'Hi Sarah, I noticed Maria Garcia\'s grades are slipping. Have you seen anything in class?', time: 'Mar 3, 11:00 AM' },
    { sender: 'You', body: 'Yes, she\'s been very withdrawn the past two weeks. Not participating at all.', time: 'Mar 3, 12:15 PM' },
    { sender: 'Ms. Johnson', body: 'I spoke with Maria today. There may be issues at home. Let\'s coordinate.', time: 'Mar 4, 10:30 AM' },
  ],
};

export function MessagesSection({ schoolId }: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const { user } = useAuthStore();
  const header = activeHeader || 'inbox';

  const { data: apiThreads } = useMessageThreads(schoolId);
  const threads: MessageThreadDemo[] = (apiThreads as unknown as MessageThreadDemo[]) ?? FALLBACK_messageThreadsDemo;

  const sendMessageMut = useSendTeacherMessage();
  const createThreadMut = useCreateTeacherThread();
  const { data: apiTeacherMessages } = useTeacherMessages();
  // Use teacher-specific messages as secondary fallback if generic threads empty
  const teacherMsgThreads = (apiTeacherMessages as any)?.data as MessageThreadDemo[] | undefined;
  const effectiveThreads: MessageThreadDemo[] = threads.length > 0 ? threads : (teacherMsgThreads ?? FALLBACK_messageThreadsDemo);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [expandedThread, setExpandedThread] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25" />
              <Input
                placeholder="Search messages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
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
                      : 'bg-white/3 text-white/40 border border-white/6 hover:bg-white/5'
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
                const convo = threadMessagesDemo[thread.id];

                return (
                  <div key={thread.id} className="space-y-0">
                    {/* Thread Row */}
                    <button
                      onClick={() => setExpandedThread(isExpanded ? null : thread.id)}
                      className={`w-full text-left rounded-xl border px-4 py-3.5 transition-all ${
                        isExpanded
                          ? 'border-indigo-500/30 bg-indigo-500/5 rounded-b-none'
                          : thread.unread
                            ? 'border-white/10 bg-white/4 hover:bg-white/5'
                            : 'border-white/6 bg-white/2 hover:bg-white/3'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Unread indicator */}
                        <div className="mt-2 shrink-0">
                          {thread.unread ? (
                            <div className="size-2.5 rounded-full bg-indigo-400" />
                          ) : (
                            <MailOpen className="size-4 text-white/15" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-sm font-semibold ${thread.unread ? 'text-white/90' : 'text-white/60'}`}>
                              {thread.subject}
                            </span>
                            <Badge className={`text-[9px] font-medium ${cat.bg} ${cat.text}`}>
                              {cat.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-white/40 mb-1">
                            {thread.participants.join(', ')}
                          </p>
                          <p className={`text-xs truncate ${thread.unread ? 'text-white/55' : 'text-white/30'}`}>
                            <span className="font-medium text-white/45">{thread.lastSender}:</span> {thread.lastMessage}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <span className="text-[10px] text-white/25 shrink-0 mt-1">{thread.timestamp}</span>
                      </div>
                    </button>

                    {/* Expanded Conversation */}
                    {isExpanded && (
                      <div className="rounded-b-xl border border-t-0 border-indigo-500/30 bg-indigo-500/3 px-4 pb-4">
                        <Separator className="bg-white/6 mb-4" />
                        {convo ? (
                          <div className="space-y-3 mb-4 max-h-75 overflow-y-auto pr-1">
                            {convo.map((msg, i) => (
                              <div
                                key={i}
                                className={`flex gap-3 ${msg.sender === 'You' ? 'flex-row-reverse' : ''}`}
                              >
                                <Avatar className="size-7 shrink-0 border border-white/10">
                                  <AvatarFallback className={`text-[9px] ${msg.sender === 'You' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/50'}`}>
                                    {msg.sender === 'You' ? (user?.firstName?.[0] ?? 'T') : msg.sender[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                                  msg.sender === 'You'
                                    ? 'bg-indigo-500/15 border border-indigo-500/20'
                                    : 'bg-white/4 border border-white/6'
                                }`}>
                                  <p className="text-[11px] font-medium text-white/50 mb-1">{msg.sender} · {msg.time}</p>
                                  <p className="text-sm text-white/75 leading-relaxed">{msg.body}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-white/30 mb-4 italic">No previous messages loaded.</p>
                        )}

                        {/* Reply Box */}
                        <div className="flex gap-2">
                          <Textarea
                            placeholder="Type a reply..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            rows={2}
                            className="flex-1 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25 resize-none"
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
            <h3 className="text-sm font-semibold text-white/80">New Message</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Recipient</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25" />
                <Input
                  placeholder="Search teacher, parent, staff, or student..."
                  value={composeRecipient}
                  onChange={e => setComposeRecipient(e.target.value)}
                  className="pl-9 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
                />
              </div>
              {composeRecipient.length > 1 && (
                <div className="rounded-lg border border-white/8 bg-white/3 p-1.5 space-y-0.5">
                  {['Mrs. Kim (Parent)', 'Mr. Davis (Admin)', 'Ms. Johnson (Counselor)', 'Chen Wei (Student)']
                    .filter(n => n.toLowerCase().includes(composeRecipient.toLowerCase()))
                    .map(name => (
                      <button
                        key={name}
                        onClick={() => setComposeRecipient(name)}
                        className="w-full text-left px-3 py-2 text-sm text-white/60 rounded-md hover:bg-white/5 transition-colors"
                      >
                        {name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Subject</Label>
              <Input
                placeholder="Message subject"
                value={composeSubject}
                onChange={e => setComposeSubject(e.target.value)}
                className="bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-white/50">Message</Label>
              <Textarea
                placeholder="Write your message..."
                value={composeBody}
                onChange={e => setComposeBody(e.target.value)}
                rows={6}
                className="bg-white/3 border-white/8 text-white/80 placeholder:text-white/25 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white/60"
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
