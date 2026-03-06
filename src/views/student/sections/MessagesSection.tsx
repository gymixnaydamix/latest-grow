/* ─── MessagesSection ─── Inbox, threads, compose ────────────────────
 * Teacher threads, class messages, support, read/unread, priority
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  MessageSquare, Search, Send, ArrowLeft, ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useStudentStore, type MessageThread } from '@/store/student-data.store';
import { EmptyState } from '@/components/features/EmptyState';

type MessagesView = 'inbox' | 'sent';

export function MessagesSection() {
  const store = useStudentStore();
  const [view, setView] = useState<MessagesView>('inbox');
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const thread = selectedThread ? store.threads.find((t: MessageThread) => t.id === selectedThread) : null;

  const filteredThreads = useMemo(() => {
    let list = store.threads;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t: MessageThread) =>
        t.participantNames.join(' ').toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q),
      );
    }
    return list.sort((a: MessageThread, b: MessageThread) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }, [store.threads, search]);

  const unreadCount = store.threads.filter((t: MessageThread) => t.unreadCount > 0).length;

  if (thread) {
    return <ThreadDetail thread={thread} onBack={() => setSelectedThread(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white/90">Messages</h2>
          <p className="text-sm text-white/40">{store.threads.length} conversations · {unreadCount} unread</p>
        </div>
      </div>

      {/* View tabs + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1">
          <Button size="sm" variant={view === 'inbox' ? 'default' : 'ghost'}
            onClick={() => setView('inbox')}
            className={cn('text-xs', view !== 'inbox' && 'text-white/40')}>
            Inbox {unreadCount > 0 && <Badge className="ml-1 text-[9px] px-1 bg-indigo-500/20 text-indigo-400 border-0">{unreadCount}</Badge>}
          </Button>
          <Button size="sm" variant={view === 'sent' ? 'default' : 'ghost'}
            onClick={() => setView('sent')}
            className={cn('text-xs', view !== 'sent' && 'text-white/40')}>
            Sent
          </Button>
        </div>
        <div className="relative flex-1 max-w-xs sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..."
            className="pl-9 h-8 text-xs bg-white/[0.03] border-white/8" />
        </div>
      </div>

      {/* Thread list */}
      {filteredThreads.length === 0 ? (
        <EmptyState title="No messages" description={view === 'sent' ? 'Sent messages will appear here.' : 'Your inbox is empty.'} />
      ) : (
        <div className="space-y-1.5">
          {filteredThreads.map((t: MessageThread) => (
            <Card key={t.id} className={cn(
              'border-white/8 bg-white/[0.02] cursor-pointer hover:border-white/12 transition-all group',
              t.unreadCount > 0 && 'border-l-2 border-l-indigo-500/50',
            )} onClick={() => setSelectedThread(t.id)}>
              <CardContent className="flex items-center gap-4 py-3 px-4">
                <div className={cn(
                  'flex items-center justify-center size-9 rounded-full border text-xs font-semibold',
                  t.unreadCount > 0 ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400' : 'border-white/10 bg-white/[0.03] text-white/40',
                )}>
                  {t.participantNames[0]?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', t.unreadCount > 0 ? 'text-white/85' : 'text-white/60')}>
                      {t.participantNames.join(', ')}
                    </span>
                    <CategoryBadge category={t.type} />
                    {t.priority === 'high' && <Badge variant="outline" className="text-[8px] text-red-400 border-red-500/20">Urgent</Badge>}
                  </div>
                  <p className="text-[11px] text-white/40 font-medium truncate">{t.subject}</p>
                  <p className="text-[10px] text-white/30 truncate">{t.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[10px] text-white/25">{formatTime(t.lastMessageAt)}</span>
                  {t.unreadCount > 0 && (
                    <span className="flex items-center justify-center size-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-bold">{t.unreadCount}</span>
                  )}
                </div>
                <ChevronRight className="size-4 text-white/10 group-hover:text-white/25" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Thread Detail ── */
function ThreadDetail({ thread, onBack }: { thread: MessageThread; onBack: () => void }) {
  const store = useStudentStore();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const threadMessages = useMemo(() => {
    return store.messages
      .filter(m => m.threadId === thread.id)
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  }, [store.messages, thread.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length]);

  const handleSend = () => {
    if (!message.trim()) return;
    store.sendMessage(thread.id, message.trim());
    setMessage('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Thread header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/6">
        <Button size="icon" variant="ghost" onClick={onBack} className="text-white/40"><ArrowLeft className="size-5" /></Button>
        <div className="flex items-center justify-center size-9 rounded-full border border-white/10 bg-white/[0.03] text-xs font-semibold text-white/40">
          {thread.participantNames[0]?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? '??'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/85">{thread.participantNames.join(', ')}</p>
          <p className="text-[11px] text-white/40">{thread.subject}</p>
        </div>
        <CategoryBadge category={thread.type} />
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 pr-2">
          {threadMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="size-8 mx-auto text-white/15 mb-2" />
              <p className="text-sm text-white/30">No messages yet. Start the conversation.</p>
            </div>
          ) : (
            threadMessages.map(m => {
              const isStudent = m.senderId === 'student';
              return (
                <div key={m.id} className={cn('flex gap-3', isStudent && 'flex-row-reverse')}>
                  <div className={cn(
                    'max-w-[70%] rounded-xl px-3.5 py-2.5',
                    isStudent
                      ? 'bg-indigo-500/15 border border-indigo-500/20'
                      : 'bg-white/[0.04] border border-white/8',
                  )}>
                    <p className="text-sm text-white/70 leading-relaxed">{m.body}</p>
                    <div className={cn('flex items-center gap-2 mt-1', isStudent ? 'justify-end' : 'justify-start')}>
                      <span className="text-[9px] text-white/25">{m.senderName}</span>
                      <span className="text-[9px] text-white/20">{formatTime(m.sentAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="pt-3 border-t border-white/6">
        <div className="flex gap-2">
          <Input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..."
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 h-10 text-sm bg-white/[0.03] border-white/8" />
          <Button size="icon" onClick={handleSend} disabled={!message.trim()} className="size-10">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function CategoryBadge({ category }: { category: string }) {
  const c: Record<string, string> = {
    teacher: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    support: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };
  return <Badge variant="outline" className={cn('text-[8px] capitalize', c[category] || 'border-white/10 text-white/40')}>{category}</Badge>;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
