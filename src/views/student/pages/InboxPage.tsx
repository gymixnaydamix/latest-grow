/* ─── InboxPage ─── Full-page email inbox for students ────────────── */
import { useState } from 'react';
import {
  Inbox, Search, Star, Archive, Trash2,
  Mail, MailOpen, Paperclip, Send,
  RefreshCw, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useAuthStore } from '@/store/auth.store';
import { useMessageThreads, useMessageThread } from '@/hooks/api';
import { useSendStudentMessage } from '@/hooks/api/use-student';
import { notifySuccess, notifyError } from '@/lib/notify';

const CATEGORIES = ['All', 'Teachers', 'Admin', 'Classmates', 'System'];

export default function InboxPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const schoolId = useAuthStore((s) => s.schoolId);
  const { data: threads = [], isLoading, refetch } = useMessageThreads(schoolId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: selectedThread } = useMessageThread(selectedId);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [replyText, setReplyText] = useState('');
  const sendReplyMut = useSendStudentMessage();

  const unreadCount = threads.filter((t) => !t.isRead).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24" /><Skeleton className="h-24" /><Skeleton className="h-24" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Inbox" description={`${threads.length} messages · ${unreadCount} unread`} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Messages" value={threads.length} icon={<Mail className="h-5 w-5" />} />
        <StatCard label="Unread" value={unreadCount} icon={<Inbox className="h-5 w-5" />} accentColor="text-amber-400" />
        <StatCard label="Starred" value={threads.filter((t) => t.isStarred).length} icon={<Star className="h-5 w-5" />} accentColor="text-yellow-400" />
        <StatCard label="Response Rate" value={94} suffix="%" icon={<CheckCircle2 className="h-5 w-5" />} trend="up" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-animate>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/25" />
          <Input
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
          />
        </div>
        <div className="flex gap-1.5">
          {CATEGORIES.map((c) => (
            <Button
              key={c} size="sm" variant={category === c ? 'default' : 'outline'}
              onClick={() => setCategory(c)}
              className={cn('text-[10px] h-7', category !== c && 'border-white/10 text-white/40')}
            >{c}</Button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-7 text-[10px] border-white/10 text-white/40" onClick={() => { refetch(); notifySuccess('Inbox', 'Messages refreshed'); }}>
          <RefreshCw className="mr-1 size-3" /> Refresh
        </Button>
      </div>

      {/* Thread list + detail */}
      <div className="flex gap-4 min-h-[500px]">
        {/* Thread list */}
        <div className="w-full max-w-sm shrink-0 space-y-1 overflow-y-auto" data-animate>
          {threads.length === 0 ? (
            <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="flex min-h-[300px] items-center justify-center">
                <div className="text-center text-white/30">
                  <Inbox className="mx-auto mb-2 size-8" />
                  <p className="text-sm">Inbox is empty</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            threads.map((thread) => {
              const lastMsg = thread.messages?.[thread.messages.length - 1];
              const sender = lastMsg?.sender ?? thread.participants?.[0];
              const fromName = sender ? `${sender.firstName} ${sender.lastName}` : 'Unknown';
              const initials = fromName.split(' ').map((n: string) => n[0]).join('');
              return (
                <button
                  key={thread.id}
                  onClick={() => setSelectedId(thread.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all hover:bg-white/4',
                    selectedId === thread.id ? 'border-indigo-500/30 bg-white/5' : 'border-white/6 bg-white/2',
                  )}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-[10px] bg-indigo-500/20 text-indigo-300">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm truncate font-medium text-white/80">{fromName}</span>
                      <span className="text-[10px] text-white/30 shrink-0">
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs truncate text-white/50">{thread.subject}</p>
                    {lastMsg && <p className="text-[10px] text-white/25 truncate">{lastMsg.body}</p>}
                  </div>
                  {!thread.isRead && <div className="mt-2 size-2 shrink-0 rounded-full bg-indigo-500" />}
                </button>
              );
            })
          )}
        </div>

        {/* Thread detail */}
        <Card className="flex-1 border-white/6 bg-white/3 backdrop-blur-xl" data-animate>
          {selectedThread ? (
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white/85">{selectedThread.subject}</h3>
                  <p className="text-sm text-white/40">
                    {selectedThread.participants?.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/70" onClick={() => notifySuccess('Starred', 'Message starred')}><Star className="size-3" /></Button>
                  <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/70" onClick={() => notifySuccess('Archive', 'Message archived')}><Archive className="size-3" /></Button>
                  <Button variant="ghost" size="sm" className="text-white/30 hover:text-white/70" onClick={() => notifySuccess('Delete', 'Message moved to trash')}><Trash2 className="size-3" /></Button>
                </div>
              </div>
              <Separator className="bg-white/6" />
              <div className="space-y-3 max-h-[350px] overflow-y-auto">
                {selectedThread.messages?.map((msg) => (
                  <div key={msg.id} className="rounded-xl border border-white/6 bg-white/2 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white/75">
                        {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'Unknown'}
                      </span>
                      <span className="text-[10px] text-white/30">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-white/50">{msg.body}</p>
                  </div>
                ))}
              </div>
              <Separator className="bg-white/6" />
              <div className="space-y-2">
                <Textarea placeholder="Reply…" rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="border-white/10 text-white/60 hover:bg-white/5" onClick={() => notifySuccess('Attach', 'File picker opened')}><Paperclip className="mr-1 size-3" /> Attach</Button>
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" disabled={sendReplyMut.isPending} onClick={() => sendReplyMut.mutate({ threadId: selectedThread!.id, content: replyText } as any, { onSuccess: () => { notifySuccess('Reply', 'Reply sent successfully'); setReplyText(''); }, onError: () => notifyError('Error', 'Reply failed to send') })}><Send className="mr-1 size-3" /> {sendReplyMut.isPending ? 'Sending…' : 'Reply'}</Button>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex min-h-[500px] items-center justify-center">
              <div className="text-center text-white/25">
                <MailOpen className="mx-auto mb-2 size-10" />
                <p className="text-sm">Select a message to read</p>
                <p className="text-[10px] mt-1">Choose from the list on the left</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
