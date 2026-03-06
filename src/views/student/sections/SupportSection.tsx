/* ─── SupportSection ─── Help desk & support tickets ─────────────────
 * FAQ, submit request, track tickets, response history
 * ─────────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  HelpCircle, MessageSquare, Plus, Search, Clock, CheckCircle2,
  AlertTriangle, ChevronDown, Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useStudentStore, type SupportTicket } from '@/store/student-data.store';
import { EmptyState } from '@/components/features/EmptyState';

type SupportView = 'tickets' | 'new' | 'faq';

const FAQ_ITEMS = [
  { q: 'How do I reset my password?', a: 'Go to Profile & Settings > Account > Change Password. If you can\'t login, use the "Forgot Password" link on the login page.' },
  { q: 'How do I submit a late assignment?', a: 'Go to the assignment detail page and click "Late Submission" if the teacher allows resubmission. Late submissions may have point deductions.' },
  { q: 'Where can I find my report card?', a: 'Navigate to Documents and filter by "Report Card". You can view or download your report cards for each term.' },
  { q: 'How do I register for an event?', a: 'Go to Activities & Events, find the event you\'re interested in, and click "Register Now". Check capacity before registering.' },
  { q: 'Why is my attendance showing incorrectly?', a: 'If you believe there\'s an attendance error, please submit a support ticket with the date and class details. Your class teacher will review it.' },
  { q: 'How can I pay my fees online?', a: 'Go to Fees & Payments, select the pending invoice, and click "Pay Now". We accept credit/debit cards and bank transfers.' },
  { q: 'How do I contact my teacher?', a: 'Use the Messages section to send a direct message to your teacher. You can also find teacher contact details in Subjects > [Subject] > Overview.' },
  { q: 'Can I change my profile photo?', a: 'Go to Profile & Settings, click on the camera icon over your avatar, and upload a new photo. Images must be under 5MB.' },
];

export function SupportSection() {
  const store = useStudentStore();
  const [view, setView] = useState<SupportView>('tickets');

  const openTickets = store.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const tabs: { id: SupportView; label: string; icon: typeof HelpCircle }[] = [
    { id: 'tickets', label: 'My Tickets', icon: MessageSquare },
    { id: 'new', label: 'New Request', icon: Plus },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white/90">Help & Support</h2>
        <p className="text-sm text-white/40">{store.tickets.length} tickets · {openTickets} open</p>
      </div>

      {/* View tabs */}
      <div className="flex gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <Button key={t.id} size="sm" variant={view === t.id ? 'default' : 'ghost'}
              onClick={() => setView(t.id)}
              className={cn('text-xs gap-1.5', view !== t.id && 'text-white/40')}>
              <Icon className="size-3.5" />
              {t.label}
            </Button>
          );
        })}
      </div>

      {view === 'tickets' && <TicketsList />}
      {view === 'new' && <NewTicketForm onSubmitted={() => setView('tickets')} />}
      {view === 'faq' && <FaqView />}
    </div>
  );
}

/* ── Tickets List ── */
function TicketsList() {
  const store = useStudentStore();
  const tickets = useMemo(() => {
    return [...store.tickets].sort((a: SupportTicket, b: SupportTicket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [store.tickets]);

  if (tickets.length === 0) return <EmptyState title="No support tickets" description="You haven't submitted any support requests yet." />;

  return (
    <div className="space-y-3">
      {tickets.map(ticket => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: SupportTicket }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn('border-white/8 bg-white/[0.02]', ticket.status === 'open' && 'border-l-2 border-l-amber-500/40')}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className={cn(
            'flex items-center justify-center size-8 rounded-lg flex-shrink-0',
            ticket.status === 'resolved' ? 'bg-emerald-500/10' : ticket.status === 'in_progress' ? 'bg-blue-500/10' : 'bg-amber-500/10',
          )}>
            {ticket.status === 'resolved' ? <CheckCircle2 className="size-3.5 text-emerald-400" /> :
             ticket.status === 'in_progress' ? <Clock className="size-3.5 text-blue-400" /> :
             <AlertTriangle className="size-3.5 text-amber-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-medium text-white/80">{ticket.title}</span>
              <TicketStatusBadge status={ticket.status} />
              <Badge variant="outline" className="text-[8px] capitalize border-white/10 text-white/35">{ticket.category}</Badge>
            </div>
            <p className="text-[11px] text-white/35 line-clamp-1">{ticket.description}</p>
            <span className="text-[10px] text-white/25 mt-1 inline-block">
              #{ticket.id.slice(-6)} · {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <ChevronDown className={cn('size-4 text-white/20 transition-transform', expanded && 'rotate-180')} />
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-white/5 space-y-3">
            <div>
              <p className="text-[10px] text-white/30 mb-1">Description</p>
              <p className="text-sm text-white/50">{ticket.description}</p>
            </div>
            {ticket.responses && ticket.responses.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 mb-2">Responses</p>
                <div className="space-y-2">
                  {ticket.responses.map((r, i) => (
                    <div key={i} className={cn(
                      'rounded-lg p-3 text-sm',
                      r.from === 'support' ? 'bg-indigo-500/5 border border-indigo-500/10' : 'bg-white/[0.03] border border-white/5',
                    )}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-medium text-white/50">{r.from === 'support' ? 'Support Team' : 'You'}</span>
                        <span className="text-[9px] text-white/25">{new Date(r.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-white/55">{r.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── New Ticket Form ── */
function NewTicketForm({ onSubmitted }: { onSubmitted: () => void }) {
  const store = useStudentStore();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('general');

  const categories: SupportTicket['category'][] = ['general', 'academic', 'technical', 'finance', 'document'];

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;
    store.addTicket({
      title: subject.trim(),
      description: description.trim(),
      category,
      status: 'open',
      priority: 'medium',
    });
    onSubmitted();
  };

  return (
    <Card className="border-white/8 bg-white/[0.02] max-w-lg">
      <CardHeader>
        <CardTitle className="text-base text-white/85">Submit a Support Request</CardTitle>
        <CardDescription className="text-[11px] text-white/35">Describe your issue and we'll get back to you as soon as possible.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-[11px] text-white/40 mb-1.5 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <Button key={c} size="sm" variant={category === c ? 'default' : 'outline'}
                onClick={() => setCategory(c)}
                className={cn('text-xs capitalize', category !== c && 'border-white/10 text-white/40')}>
                {c}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[11px] text-white/40 mb-1.5 block">Subject</label>
          <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief summary of your issue"
            className="text-sm bg-white/[0.03] border-white/8" />
        </div>
        <div>
          <label className="text-[11px] text-white/40 mb-1.5 block">Description</label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the issue in detail..."
            className="min-h-[120px] text-sm bg-white/[0.03] border-white/8 resize-none" />
        </div>
        <Button onClick={handleSubmit} disabled={!subject.trim() || !description.trim()} className="w-full gap-2">
          <Send className="size-4" /> Submit Request
        </Button>
      </CardContent>
    </Card>
  );
}

/* ── FAQ ── */
function FaqView() {
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = FAQ_ITEMS.filter(item =>
    !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/30" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search FAQ..."
          className="pl-9 h-9 text-sm bg-white/[0.03] border-white/8" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No results" description="Try different keywords." />
      ) : (
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <Card key={i} className="border-white/8 bg-white/[0.02]">
              <CardContent className="py-0">
                <button className="flex items-center gap-3 w-full py-3 text-left"
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}>
                  <HelpCircle className="size-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-sm text-white/70 flex-1">{item.q}</span>
                  <ChevronDown className={cn('size-4 text-white/20 transition-transform', openIdx === i && 'rotate-180')} />
                </button>
                {openIdx === i && (
                  <div className="pb-3 pl-7">
                    <p className="text-sm text-white/45 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Helpers ── */
function TicketStatusBadge({ status }: { status: string }) {
  const m: Record<string, string> = {
    open: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    in_progress: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    resolved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    closed: 'text-white/35 bg-white/5 border-white/10',
  };
  return <Badge variant="outline" className={cn('text-[9px] capitalize', m[status] ?? m.open)}>{status.replace(/_/g, ' ')}</Badge>;
}
