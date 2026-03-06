/* ─── MessagesPage ─── Inbox / messaging centre ──────────────────── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Mail, Send, Search, Star, Paperclip,
  Plus, Archive, Trash2,
} from 'lucide-react';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useMessageThreads, useMessageThread, useSendMessage } from '@/hooks/api';
import type { MessageThread, Message } from '@root/types';
import { useAuthStore } from '@/store/auth.store';

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

export function MessagesPage() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState('inbox');
  const [replyText, setReplyText] = useState('');
  const { schoolId } = useAuthStore();

  const { data: threadsData, isLoading } = useMessageThreads(schoolId);
  const { data: threadDetail } = useMessageThread(selectedId);
  const sendMessage = useSendMessage(selectedId ?? '');
  const containerRef = useStaggerAnimate<HTMLDivElement>([tab, isLoading]);

  const threads = threadsData ?? [];
  const selectedThread = threadDetail;

  const filtered = threads.filter((t) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedId) return;
    sendMessage.mutate({ body: replyText }, {
      onSuccess: () => setReplyText(''),
    });
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Messages</h1>
          <p className="text-sm text-muted-foreground">{threads.length} threads</p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" /> Compose
        </Button>
      </div>

      <div className="flex gap-4 h-[calc(100vh-14rem)]">
        {/* Message List */}
        <div className="flex w-96 shrink-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="h-9">
                <TabsTrigger value="inbox" className="text-xs">Inbox</TabsTrigger>
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-1" data-animate>
                {filtered.map((thread: MessageThread) => {
                  const participantName = (thread.participants ?? []).map((p) => `${p.firstName} ${p.lastName}`).join(', ') || 'Unknown';
                  const ini = initials(participantName);
                  return (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedId(thread.id)}
                      className={`flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors ${
                        selectedId === thread.id
                          ? 'border-primary/40 bg-primary/5'
                          : 'hover:bg-accent/50'
                      }`}
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarFallback className="text-xs">{ini}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{participantName}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {thread.lastMessageAt ? new Date(thread.lastMessageAt).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-xs font-medium truncate">{thread.subject}</p>
                      </div>
                    </button>
                  );
                })}
                {filtered.length === 0 && !isLoading && (
                  <div className="py-8 text-center text-xs text-muted-foreground">No threads found.</div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Detail */}
        <Card className="flex-1" data-animate>
          {selectedThread ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">{selectedThread.subject}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Participants: {(selectedThread.participants ?? []).map((p) => `${p.firstName} ${p.lastName}`).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon"><Star className="size-4" /></Button>
                    <Button variant="ghost" size="icon"><Archive className="size-4" /></Button>
                    <Button variant="ghost" size="icon"><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 flex-1">
                <ScrollArea className="max-h-60">
                  {(selectedThread.messages ?? []).map((msg: Message) => (
                    <div key={msg.id} className="mb-3">
                      <p className="text-xs font-medium">{msg.sender?.firstName} {msg.sender?.lastName}</p>
                      <p className="text-sm leading-relaxed">{msg.body}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                  {(selectedThread.messages ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No messages yet.</p>
                  )}
                </ScrollArea>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">Quick Reply</p>
                  <Textarea placeholder="Type your reply..." rows={3} value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                  <div className="flex items-center gap-2">
                    <Button className="gap-2" onClick={handleSendReply} disabled={sendMessage.isPending}>
                      <Send className="size-4" /> Reply
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Paperclip className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Mail className="mx-auto size-10 opacity-20" />
                <p className="mt-2 text-sm">Select a message to read</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
