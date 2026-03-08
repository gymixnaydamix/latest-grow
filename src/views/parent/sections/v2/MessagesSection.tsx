import { useMemo, useState } from 'react';
import { Mail, MessageSquare, Paperclip, Plus, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useParentV2MessageThreads, useCreateParentV2MessageThread, usePostParentV2Message } from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, formatDateTimeLabel, parentMessageThreadsDemo as FALLBACK_MESSAGE_THREADS } from './parent-v2-demo-data';
import type { ParentMessageThreadDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, PriorityBadge } from './shared';
import type { ParentSectionProps } from './shared';

const FILTER_OPTIONS = ['ALL', 'UNREAD', 'HIGH', 'WITH_ATTACHMENT'] as const;

export function MessagesSection({ scope, childId }: ParentSectionProps) {
  const { data: rawThreads } = useParentV2MessageThreads({ scope, childId });
  const createThread = useCreateParentV2MessageThread();
  const postMessage = usePostParentV2Message();
  const allRows: ParentMessageThreadDemo[] = (rawThreads as ParentMessageThreadDemo[] | undefined) ?? filterByChild(FALLBACK_MESSAGE_THREADS, childId, scope);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]>('ALL');
  const [showCompose, setShowCompose] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [composeRecipient, setComposeRecipient] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [replyBody, setReplyBody] = useState('');

  const rows = useMemo(
    () =>
      allRows.filter((thread) => {
        const searchMatch =
          query.trim().length === 0 ||
          `${thread.subject} ${thread.counterpart} ${thread.lastMessage}`.toLowerCase().includes(query.toLowerCase());
        const filterMatch =
          filter === 'ALL' ||
          (filter === 'UNREAD' && thread.unreadCount > 0) ||
          (filter === 'HIGH' && thread.priority === 'HIGH') ||
          (filter === 'WITH_ATTACHMENT' && thread.hasAttachment);
        return searchMatch && filterMatch;
      }),
    [allRows, query, filter],
  );

  const unreadTotal = allRows.filter((t) => t.unreadCount > 0).length;
  const selectedThread = selectedThreadId ? allRows.find((t) => t.id === selectedThreadId) : null;

  return (
    <ParentSectionShell
      title="Messages"
      description="Teacher and administration communication center with child-linked conversation context."
      actions={
        <Button size="sm" className="gap-1.5" onClick={() => setShowCompose(!showCompose)}>
          <Plus className="size-3.5" />
          New message
        </Button>
      }
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <MessageSquare className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Total threads</p>
            </div>
          </CardContent>
        </Card>
        <Card className={unreadTotal > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <Mail className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{unreadTotal}</p>
              <p className="text-xs text-muted-foreground">Unread threads</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Paperclip className="size-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{allRows.filter((t) => t.hasAttachment).length}</p>
              <p className="text-xs text-muted-foreground">With attachments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compose area */}
      {showCompose && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compose New Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Recipient (e.g., Mr. Johnson — Homeroom)" value={composeRecipient} onChange={(e) => setComposeRecipient(e.target.value)} />
            <Input placeholder="Subject" value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} />
            <Textarea placeholder="Write your message..." rows={3} value={composeBody} onChange={(e) => setComposeBody(e.target.value)} />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                disabled={!composeRecipient.trim() || !composeSubject.trim() || !composeBody.trim() || createThread.isPending}
                onClick={() =>
                  createThread.mutate(
                    { recipientIds: [composeRecipient.trim()], subject: composeSubject.trim(), body: composeBody.trim() },
                    { onSuccess: () => { setComposeRecipient(''); setComposeSubject(''); setComposeBody(''); setShowCompose(false); } },
                  )
                }
              >
                <Send className="size-3.5" /> {createThread.isPending ? 'Sending…' : 'Send'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCompose(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setFilter(opt)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              filter === opt ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {opt === 'WITH_ATTACHMENT' ? 'Attachments' : opt}
          </button>
        ))}
        <Input
          className="max-w-xs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search threads..."
        />
      </div>

      {/* Thread List + Detail */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inbox</CardTitle>
            <CardDescription>{rows.length} thread(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {rows.length === 0 ? (
              <EmptyActionState title="No threads" message="No messages match your filter." ctaLabel="Show all" onClick={() => { setFilter('ALL'); setQuery(''); }} />
            ) : (
              rows.map((thread) => (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    selectedThreadId === thread.id ? 'border-primary bg-primary/5' : thread.unreadCount > 0 ? 'border-sky-500/30 bg-sky-500/5' : 'border-border/60 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className={`truncate text-sm ${thread.unreadCount > 0 ? 'font-semibold' : 'font-medium'}`}>{thread.subject}</p>
                        {thread.hasAttachment && <Paperclip className="size-3 shrink-0 text-muted-foreground" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{thread.counterpart} • {thread.counterpartRole}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <PriorityBadge priority={thread.priority} />
                      {thread.unreadCount > 0 && (
                        <Badge className="border-sky-500/40 bg-sky-500/10 text-xs text-sky-700 dark:text-sky-300">{thread.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground/70">{formatDateTimeLabel(thread.lastMessageAt)} • {thread.messageCount} msg(s)</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Thread Detail */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedThread ? selectedThread.subject : 'Select a conversation'}
            </CardTitle>
            {selectedThread && (
              <CardDescription>
                {selectedThread.counterpart} ({selectedThread.counterpartRole})
                {selectedThread.childId ? ` • ${childDisplayName(selectedThread.childId)}` : ' • Family-wide'}
                • {selectedThread.messageCount} message(s)
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedThread ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
                  <p className="text-sm">{selectedThread.lastMessage}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTimeLabel(selectedThread.lastMessageAt)}</p>
                </div>

                <div className="space-y-2">
                  <Textarea placeholder="Type your reply..." rows={3} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={!replyBody.trim() || postMessage.isPending}
                      onClick={() =>
                        postMessage.mutate(
                          { threadId: selectedThread.id, body: replyBody.trim() },
                          { onSuccess: () => setReplyBody('') },
                        )
                      }
                    >
                      <Send className="size-3.5" /> {postMessage.isPending ? 'Sending…' : 'Reply'}
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1.5"><Paperclip className="size-3.5" /> Attach</Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Click on a thread from the inbox to view the conversation and reply.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ParentSectionShell>
  );
}
