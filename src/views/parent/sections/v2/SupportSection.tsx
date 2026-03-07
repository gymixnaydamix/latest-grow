import { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Headphones, MessageSquare, Plus, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  useCreateParentV2SupportTicket,
  useParentV2SupportTickets,
  useReplyParentV2SupportTicket,
} from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, formatDateTimeLabel, parentSupportTicketsDemo as FALLBACK_SUPPORT_TICKETS } from './parent-v2-demo-data';
import type { ParentSupportTicketDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, PriorityBadge, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const;

export function SupportSection({ scope, childId }: ParentSectionProps) {
  const { data: rawRows } = useParentV2SupportTickets({ scope, childId });
  const createTicketMutation = useCreateParentV2SupportTicket();
  const replyMutation = useReplyParentV2SupportTicket();

  const allRows: ParentSupportTicketDemo[] = (rawRows as ParentSupportTicketDemo[] | undefined) ?? filterByChild(FALLBACK_SUPPORT_TICKETS, childId, scope);

  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(allRows[0]?.id ?? null);

  const rows = useMemo(
    () => allRows.filter((r) => statusFilter === 'ALL' || r.status === statusFilter),
    [allRows, statusFilter],
  );

  const selectedTicket = selectedTicketId ? allRows.find((t) => t.id === selectedTicketId) : null;
  const openCount = allRows.filter((t) => t.status === 'OPEN').length;
  const inProgressCount = allRows.filter((t) => t.status === 'IN_PROGRESS').length;

  return (
    <ParentSectionShell
      title="Support"
      description="Submit and track support tickets for academic, finance, technical, transport, and document issues."
      actions={
        <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(!showCreate)}>
          <Plus className="size-3.5" /> New ticket
        </Button>
      }
    >
      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Headphones className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.length}</p>
              <p className="text-xs text-muted-foreground">Total tickets</p>
            </div>
          </CardContent>
        </Card>
        <Card className={openCount > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{openCount + inProgressCount}</p>
              <p className="text-xs text-muted-foreground">Open / In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{allRows.filter((t) => t.status === 'RESOLVED').length}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Ticket */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Ticket</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ticket subject" />
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the issue, expected behavior, and relevant references..."
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={subject.trim().length < 6 || description.trim().length < 12 || createTicketMutation.isPending}
                onClick={() =>
                  createTicketMutation.mutate(
                    { subject: subject.trim(), description: description.trim(), category: 'GENERAL', childId },
                    { onSuccess: () => { setSubject(''); setDescription(''); setShowCreate(false); } },
                  )
                }
                className="gap-1.5"
              >
                <Send className="size-3.5" /> Submit ticket
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-md border px-3 py-1 text-xs transition-colors ${
              statusFilter === s ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-muted-foreground'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Ticket list + Detail */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Ticket list */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tickets</CardTitle>
            <CardDescription>{rows.length} ticket(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {rows.length === 0 ? (
              <EmptyActionState title="No tickets" message="No tickets match this filter." ctaLabel="Show all" onClick={() => setStatusFilter('ALL')} />
            ) : (
              rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedTicketId(row.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    selectedTicketId === row.id ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{row.subject}</p>
                    <StatusBadge
                      status={row.status}
                      tone={row.status === 'RESOLVED' ? 'good' : row.status === 'IN_PROGRESS' ? 'warn' : 'info'}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {row.category} • {row.childId ? childDisplayName(row.childId) : 'Family-wide'}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <PriorityBadge priority={row.priority} />
                    <span className="text-xs text-muted-foreground">{formatDateTimeLabel(row.updatedAt)}</span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Detail + Responses */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">
              {selectedTicket ? selectedTicket.subject : 'Select a ticket'}
            </CardTitle>
            {selectedTicket && (
              <CardDescription>
                {selectedTicket.category} • {selectedTicket.childId ? childDisplayName(selectedTicket.childId) : 'Family-wide'}
                • Created {formatDateTimeLabel(selectedTicket.createdAt)}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-4">
                {/* Description */}
                {'description' in selectedTicket && selectedTicket.description && (
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Issue Description</p>
                    <p className="mt-1 text-sm">{selectedTicket.description}</p>
                  </div>
                )}

                {/* Response history */}
                {'responses' in selectedTicket && Array.isArray(selectedTicket.responses) && selectedTicket.responses.length > 0 && (
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><MessageSquare className="size-3" /> Conversation</p>
                    {selectedTicket.responses.map((resp, idx) => (
                      <div key={idx} className={`rounded-lg border p-3 ${resp.author === 'parent' ? 'border-primary/30 bg-primary/5 ml-4' : 'border-border/50 bg-muted/20 mr-4'}`}>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{resp.author}</Badge>
                          <span>{formatDateTimeLabel(resp.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-sm">{resp.message}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply */}
                {selectedTicket.status !== 'RESOLVED' && (
                  <div className="space-y-2">
                    <Textarea
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      placeholder="Write your reply..."
                      rows={3}
                    />
                    <Button
                      size="sm"
                      disabled={replyBody.trim().length < 6 || replyMutation.isPending}
                      onClick={() =>
                        replyMutation.mutate(
                          { ticketId: selectedTicket.id, message: replyBody.trim() },
                          { onSuccess: () => setReplyBody('') },
                        )
                      }
                      className="gap-1.5"
                    >
                      <Send className="size-3.5" /> Send reply
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Click on a ticket to view details and conversation history.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ParentSectionShell>
  );
}
