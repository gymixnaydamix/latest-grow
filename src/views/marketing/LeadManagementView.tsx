/* ─── LeadManagementView ─── Marketing lead pipeline ───────────────── */
import { useState } from 'react';
import { Target, Plus, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useCrmDeals, useCreateCrmDeal } from '@/hooks/api/use-crm';
import { notifySuccess } from '@/lib/notify';

type LeadStage = 'new' | 'contacted' | 'qualified' | 'proposal' | 'enrolled' | 'lost';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  stage: LeadStage;
  interest: string;
  score: number;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  value: number;
}

const STAGE_CFG: Record<LeadStage, { cls: string; bg: string; label: string }> = {
  new: { cls: 'text-cyan-400', bg: 'bg-cyan-400/10', label: 'New' },
  contacted: { cls: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'Contacted' },
  qualified: { cls: 'text-violet-400', bg: 'bg-violet-400/10', label: 'Qualified' },
  proposal: { cls: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Proposal' },
  enrolled: { cls: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Enrolled' },
  lost: { cls: 'text-red-400', bg: 'bg-red-400/10', label: 'Lost' },
};

const PIPELINE_ORDER: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'enrolled'];

const FALLBACK_LEADS: Lead[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@family.com', phone: '+1 555-0101', source: 'Website', stage: 'qualified', interest: 'Elementary K-5', score: 85, assignedTo: 'Alex M.', createdAt: '2025-03-01', lastContact: '2025-03-14', value: 12000 },
  { id: '2', name: 'Michael Chen', email: 'mchen@gmail.com', phone: '+1 555-0102', source: 'Referral', stage: 'proposal', interest: 'Middle School', score: 92, assignedTo: 'Beth K.', createdAt: '2025-02-15', lastContact: '2025-03-13', value: 15000 },
  { id: '3', name: 'Lisa Williams', email: 'lwilliams@mail.com', phone: '+1 555-0103', source: 'Social Media', stage: 'new', interest: 'Pre-K', score: 45, assignedTo: 'Alex M.', createdAt: '2025-03-14', lastContact: '2025-03-14', value: 8000 },
  { id: '4', name: 'David Park', email: 'dpark@outlook.com', phone: '+1 555-0104', source: 'Open House', stage: 'contacted', interest: 'High School', score: 60, assignedTo: 'Chris D.', createdAt: '2025-03-05', lastContact: '2025-03-12', value: 18000 },
  { id: '5', name: 'Emma Rodriguez', email: 'emma.r@family.com', phone: '+1 555-0105', source: 'Website', stage: 'enrolled', interest: 'Elementary K-5', score: 100, assignedTo: 'Beth K.', createdAt: '2025-01-20', lastContact: '2025-03-10', value: 12000 },
  { id: '6', name: 'James Taylor', email: 'jtaylor@corp.com', phone: '+1 555-0106', source: 'Referral', stage: 'qualified', interest: 'After-School Program', score: 72, assignedTo: 'Chris D.', createdAt: '2025-02-28', lastContact: '2025-03-11', value: 5000 },
  { id: '7', name: 'Anna Kim', email: 'akim@mail.com', phone: '+1 555-0107', source: 'Event', stage: 'contacted', interest: 'Middle School', score: 55, assignedTo: 'Alex M.', createdAt: '2025-03-08', lastContact: '2025-03-13', value: 15000 },
  { id: '8', name: 'Mark Thompson', email: 'mark.t@gmail.com', phone: '+1 555-0108', source: 'Website', stage: 'lost', interest: 'High School', score: 30, assignedTo: 'Beth K.', createdAt: '2025-01-15', lastContact: '2025-02-20', value: 18000 },
];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function LeadManagementView() {
  const containerRef = useStaggerAnimate([]);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'pipeline' | 'list'>('pipeline');

  const { data: apiLeads } = useCrmDeals();
  const createDeal = useCreateCrmDeal();

  const leads: Lead[] = (apiLeads as any[])?.map((d: any) => ({
    id: d.id, name: d.name ?? d.title ?? '', email: d.email ?? '', phone: d.phone ?? '',
    source: d.source ?? '', stage: (d.stage?.toLowerCase() ?? 'new') as LeadStage,
    interest: d.interest ?? d.description ?? '', score: d.score ?? d.value ?? 0,
    assignedTo: d.assignedTo ?? '', createdAt: d.createdAt ?? '', lastContact: d.lastContact ?? d.updatedAt ?? '',
    value: d.value ?? 0,
  })) ?? FALLBACK_LEADS;

  const filtered = leads.filter(
    (l) => l.name.toLowerCase().includes(search.toLowerCase()) || l.interest.toLowerCase().includes(search.toLowerCase()),
  );

  const pipelineTotal = leads.filter((l) => l.stage !== 'lost').reduce((s, l) => s + l.value, 0);
  const conversionRate = leads.length > 0 ? Math.round((leads.filter((l) => l.stage === 'enrolled').length / leads.length) * 100) : 0;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white/90">Lead Management</h2>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-white/8 rounded-md overflow-hidden text-[11px]">
            {(['pipeline', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1 capitalize', view === v ? 'bg-white/10 text-white/70' : 'text-white/30')}>{v}</button>
            ))}
          </div>
          <Button className="gap-1.5 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border border-violet-400/20 text-xs h-8" onClick={() => createDeal.mutate({}, { onSuccess: () => notifySuccess('Lead created', 'New lead added to pipeline') })}>
            <Plus className="size-3" />Add Lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: leads.length.toString(), cls: 'text-white/90' },
          { label: 'Pipeline Value', value: fmt(pipelineTotal), cls: 'text-emerald-400' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, cls: 'text-indigo-400' },
          { label: 'New This Week', value: leads.filter(l => l.stage === 'new').length.toString(), cls: 'text-cyan-400' },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="flex flex-col gap-1 p-4">
              <span className="text-[10px] text-white/40 uppercase">{kpi.label}</span>
              <span className={cn('text-xl font-bold font-mono tabular-nums', kpi.cls)}>{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div data-animate className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…" className="pl-9 bg-white/4 border-white/8 text-white/80 text-xs h-8" />
      </div>

      {view === 'pipeline' ? (
        /* Pipeline kanban */
        <div data-animate className="flex gap-3 overflow-x-auto pb-2">
          {PIPELINE_ORDER.map((stage) => {
            const sc = STAGE_CFG[stage];
            const stageLeads = filtered.filter((l) => l.stage === stage);
            return (
              <div key={stage} className="shrink-0 w-64 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-1">
                  <span className={cn('size-2 rounded-full', sc.cls.replace('text-', 'bg-'))} />
                  <span className="text-xs font-medium text-white/60">{sc.label}</span>
                  <Badge className="border-0 bg-white/5 text-white/30 text-[9px] ml-auto">{stageLeads.length}</Badge>
                </div>
                <div className="flex flex-col gap-2">
                  {stageLeads.map((l) => (
                    <Card key={l.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors cursor-pointer">
                      <CardContent className="flex flex-col gap-2 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white/80">{l.name}</span>
                          <span className="text-[10px] text-white/30 font-mono">{l.score}pts</span>
                        </div>
                        <p className="text-[10px] text-white/30">{l.interest}</p>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-white/25">{l.source}</span>
                          <span className="text-emerald-400/80 font-mono tabular-nums">{fmt(l.value)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-white/20">
                          <User className="size-2.5" />{l.assignedTo}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List view */
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/6 text-white/40">
                  <th className="px-3 py-2 text-left font-medium">Lead</th>
                  <th className="px-3 py-2 text-left font-medium">Interest</th>
                  <th className="px-3 py-2 text-center font-medium">Stage</th>
                  <th className="px-3 py-2 text-center font-medium">Score</th>
                  <th className="px-3 py-2 text-right font-medium">Value</th>
                  <th className="px-3 py-2 text-right font-medium">Last Contact</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const sc = STAGE_CFG[l.stage];
                  return (
                    <tr key={l.id} className="border-b border-white/4 hover:bg-white/2 transition-colors cursor-pointer">
                      <td className="px-3 py-2.5">
                        <p className="text-white/70 font-medium">{l.name}</p>
                        <p className="text-[10px] text-white/25">{l.email}</p>
                      </td>
                      <td className="px-3 py-2.5 text-white/50">{l.interest}</td>
                      <td className="px-3 py-2.5 text-center"><Badge className={cn('border-0 text-[9px]', sc.bg, sc.cls)}>{sc.label}</Badge></td>
                      <td className="px-3 py-2.5 text-center text-white/50 font-mono tabular-nums">{l.score}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-400/80 font-mono tabular-nums">{fmt(l.value)}</td>
                      <td className="px-3 py-2.5 text-right text-white/30">{new Date(l.lastContact).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
