/* ─── InquiriesPage ─── General department inquiries ───────────────── */
import { useState } from 'react';
import {
  HelpCircle, MessageCircle, Search, Clock,
  CheckCircle2, XCircle, AlertTriangle, Send, Plus,
  Tag, ChevronDown, ChevronUp, FileText, ThumbsUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentDeptRequests } from '@/hooks/api/use-student';

type InqStatus = 'open' | 'answered' | 'closed' | 'escalated';

interface Inquiry {
  id: string;
  title: string;
  department: string;
  topic: 'academic' | 'financial' | 'technical' | 'facilities' | 'policy' | 'general';
  status: InqStatus;
  submittedAt: string;
  updatedAt: string;
  question: string;
  answer?: string;
  helpful?: boolean;
  followUps?: { question: string; answer?: string; at: string }[];
}

const STATUS_CFG: Record<InqStatus, { Icon: typeof Clock; cls: string; bg: string; label: string }> = {
  open:      { Icon: HelpCircle,    cls: 'text-amber-400',   bg: 'bg-amber-400/10',   label: 'Open' },
  answered:  { Icon: CheckCircle2,  cls: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Answered' },
  closed:    { Icon: XCircle,       cls: 'text-white/30',    bg: 'bg-white/5',        label: 'Closed' },
  escalated: { Icon: AlertTriangle, cls: 'text-red-400',     bg: 'bg-red-400/10',     label: 'Escalated' },
};

const TOPIC_CFG: Record<Inquiry['topic'], { label: string; color: string }> = {
  academic:   { label: 'Academic', color: 'text-violet-400 bg-violet-400/10' },
  financial:  { label: 'Financial', color: 'text-emerald-400 bg-emerald-400/10' },
  technical:  { label: 'Technical', color: 'text-cyan-400 bg-cyan-400/10' },
  facilities: { label: 'Facilities', color: 'text-amber-400 bg-amber-400/10' },
  policy:     { label: 'Policy', color: 'text-pink-400 bg-pink-400/10' },
  general:    { label: 'General', color: 'text-white/40 bg-white/5' },
};

const FALLBACK_INQUIRIES: Inquiry[] = [
  {
    id: '1', title: 'Library hours during exam week', department: 'Library Services', topic: 'facilities',
    status: 'answered', submittedAt: '2026-02-20', updatedAt: '2026-02-21',
    question: 'What are the library hours during the March exam week? Will there be extended hours?',
    answer: 'Yes! During exam week (March 16–20), the library will be open 7 AM – 12 AM (extended from the usual 9 PM close). Study rooms can be reserved via the library portal.',
    helpful: true,
  },
  {
    id: '2', title: 'Credit transfer from community college', department: 'Registrar', topic: 'academic',
    status: 'answered', submittedAt: '2026-02-15', updatedAt: '2026-02-18',
    question: 'I completed Calculus I at my community college last summer. How do I get it transferred and credited here?',
    answer: 'Submit your official transcript through the Transfer Credits portal. Processing takes 5–7 business days. Contact the Registrar if your course doesn\'t appear after 10 days.',
    followUps: [{ question: 'Is there a deadline for submitting transfer credits?', answer: 'Transfer credits must be submitted within the first semester of enrollment. You still have time.', at: '2026-02-19' }],
  },
  {
    id: '3', title: 'Parking permit application', department: 'Campus Security', topic: 'facilities',
    status: 'open', submittedAt: '2026-03-01', updatedAt: '2026-03-01',
    question: 'I just got a car and need a student parking permit. Where do I apply and what\'s the cost?',
  },
  {
    id: '4', title: 'Wi-Fi not working in Building C', department: 'IT Services', topic: 'technical',
    status: 'escalated', submittedAt: '2026-02-28', updatedAt: '2026-03-02',
    question: 'The Wi-Fi in Building C (rooms 301–310) has been dropping constantly for the past week. Multiple students affected.',
    answer: 'We\'re aware of the issue. It has been escalated to our network infrastructure team. Temporary hotspot stations have been placed on Floor 3.',
  },
  {
    id: '5', title: 'Policy on recording lectures', department: 'Academic Affairs', topic: 'policy',
    status: 'answered', submittedAt: '2026-02-10', updatedAt: '2026-02-12',
    question: 'Are students allowed to record lectures? Some professors say yes, others say no. Is there an official policy?',
    answer: 'Per the Student Handbook (Section 4.7): Students may audio-record lectures for personal study with instructor consent. Video recording requires written approval from both the instructor and department chair.',
    helpful: true,
  },
  {
    id: '6', title: 'Financial aid for summer courses', department: 'Financial Aid', topic: 'financial',
    status: 'open', submittedAt: '2026-03-02', updatedAt: '2026-03-02',
    question: 'Does financial aid cover summer semester courses? I need to take 2 courses this summer to stay on track.',
  },
];

export default function InquiriesPage() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<'all' | InqStatus>('all');
  const [topicFilter, setTopicFilter] = useState<'all' | Inquiry['topic']>('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /* ── API data ── */
  const { data: apiDeptRequests } = useStudentDeptRequests();
  const inquiries: Inquiry[] = (apiDeptRequests as unknown as Inquiry[]) ?? FALLBACK_INQUIRIES;

  const toggle = (id: string) => setExpanded((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const filtered = inquiries
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => topicFilter === 'all' || r.topic === topicFilter)
    .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.question.toLowerCase().includes(search.toLowerCase()));

  const open = inquiries.filter((r) => r.status === 'open').length;
  const answered = inquiries.filter((r) => r.status === 'answered').length;
  const esc = inquiries.filter((r) => r.status === 'escalated').length;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Inquiries" description="Ask questions to any department and track responses" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Inquiries" value={inquiries.length} icon={<HelpCircle className="h-5 w-5" />} />
        <StatCard label="Open" value={open} icon={<MessageCircle className="h-5 w-5" />} trend={open > 0 ? 'up' : 'neutral'} />
        <StatCard label="Answered" value={answered} icon={<CheckCircle2 className="h-5 w-5" />} trend="up" />
        <StatCard label="Escalated" value={esc} icon={<AlertTriangle className="h-5 w-5" />} trend={esc > 0 ? 'down' : 'neutral'} />
      </div>

      {/* Toolbar */}
      <div data-animate className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'open', 'answered', 'escalated', 'closed'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={filter === s ? 'default' : 'outline'}
              onClick={() => setFilter(s)}
              className={cn('text-xs h-7 capitalize', filter !== s && 'border-white/10 text-white/50')}
            >
              {s === 'all' ? 'All' : STATUS_CFG[s].label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-white/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inquiries…"
              className="h-8 w-52 pl-7 bg-white/4 border-white/8 text-white/80 text-xs"
            />
          </div>
          <Button
            onClick={() => setShowNew(!showNew)}
            className="gap-1.5 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-400/20 text-xs h-8"
          >
            <Plus className="size-3" />Ask
          </Button>
        </div>
      </div>

      {/* Topic filter chips */}
      <div data-animate className="flex flex-wrap gap-2">
        {(['all', ...Object.keys(TOPIC_CFG)] as const).map((t) => {
          const cfg = t !== 'all' ? TOPIC_CFG[t as Inquiry['topic']] : null;
          return (
            <Badge
              key={t}
              onClick={() => setTopicFilter(t as typeof topicFilter)}
              className={cn(
                'cursor-pointer text-[10px] transition-colors gap-1',
                topicFilter === t
                  ? 'bg-violet-500/20 text-violet-300 border-violet-400/30'
                  : 'bg-white/4 text-white/40 border-white/8 hover:text-white/60',
              )}
            >
              {cfg && <Tag className="size-2.5" />}
              {t === 'all' ? 'All Topics' : cfg!.label}
            </Badge>
          );
        })}
      </div>

      {/* New inquiry form */}
      {showNew && (
        <Card data-animate className="border-violet-400/20 bg-violet-500/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm flex items-center gap-2">
              <HelpCircle className="size-4 text-violet-400" />Ask a Question
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Title</label>
                <Input placeholder="Brief summary…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Department</label>
                <Input placeholder="e.g., IT Services, Registrar" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Topic</label>
                <select className="h-8 rounded-md border border-white/8 bg-white/4 px-3 text-xs text-white/60 outline-none">
                  {Object.entries(TOPIC_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 font-medium">Your Question</label>
              <textarea rows={3} placeholder="Describe your question in detail…" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none focus:border-violet-400/40" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)} className="text-xs border-white/10 text-white/50">Cancel</Button>
              <Button size="sm" onClick={() => notifySuccess('Inquiry', 'Your inquiry has been submitted')} className="text-xs bg-violet-500/20 text-violet-300 border border-violet-400/20 gap-1"><Send className="size-3" />Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inquiries list */}
      <div data-animate className="flex flex-col gap-3">
        {!filtered.length && (
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="py-10 text-center text-white/30 text-sm">No inquiries match your filters.</CardContent>
          </Card>
        )}
        {filtered.map((inq) => {
          const s = STATUS_CFG[inq.status];
          const tc = TOPIC_CFG[inq.topic];
          const isOpen = expanded.has(inq.id);
          return (
            <Card key={inq.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors">
              <CardContent className="flex flex-col gap-3 p-4">
                {/* Header */}
                <div className="flex items-start justify-between cursor-pointer" onClick={() => toggle(inq.id)}>
                  <div className="flex items-center gap-2">
                    <s.Icon className={cn('size-4 shrink-0', s.cls)} />
                    <div>
                      <p className="text-sm font-semibold text-white/80">{inq.title}</p>
                      <p className="text-[10px] text-white/30">{inq.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge className={cn('border-0 text-[9px]', tc.color)}>{tc.label}</Badge>
                    <Badge className={cn('border-0 text-[9px]', s.bg, s.cls)}>{s.label}</Badge>
                    {isOpen ? <ChevronUp className="size-3.5 text-white/30" /> : <ChevronDown className="size-3.5 text-white/30" />}
                  </div>
                </div>

                {/* Question */}
                <p className="text-[11px] text-white/40 leading-relaxed">{inq.question}</p>

                {/* Answer + follow-ups (collapsible) */}
                {isOpen && (
                  <div className="flex flex-col gap-2 ml-6">
                    {inq.answer && (
                      <div className="rounded-lg border border-white/6 bg-white/2 p-3 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <FileText className="size-3.5 text-violet-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-white/50 leading-relaxed">{inq.answer}</p>
                        </div>
                        {inq.helpful !== undefined && (
                          <div className="flex items-center gap-1.5 ml-5">
                            <ThumbsUp className={cn('size-3', inq.helpful ? 'text-emerald-400' : 'text-white/20')} />
                            <span className="text-[9px] text-white/25">{inq.helpful ? 'Marked as helpful' : 'Not helpful'}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {inq.followUps?.map((fu, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <p className="text-[11px] text-white/50 italic">↳ {fu.question}</p>
                        {fu.answer && (
                          <div className="rounded-lg border border-white/6 bg-white/2 p-2 ml-4">
                            <p className="text-[10px] text-white/40 leading-relaxed">{fu.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-[10px] text-white/25">
                  <span>Asked: {new Date(inq.submittedAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(inq.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
