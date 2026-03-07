/* ─── GrantsView ─── Grants & funding management ──────────────────── */
import { useState } from 'react';
import { Landmark, Plus, Search, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useGrants, useCreateGrant } from '@/hooks/api/use-finance';
import { useAuthStore } from '@/store/auth.store';
import { notifySuccess } from '@/lib/notify';

type GrantStatus = 'active' | 'pending' | 'approved' | 'expired' | 'rejected';

interface Grant {
  id: string;
  title: string;
  funder: string;
  amount: number;
  spent: number;
  status: GrantStatus;
  startDate: string;
  endDate: string;
  category: string;
  description: string;
}

const STATUS_CFG: Record<GrantStatus, { cls: string; bg: string }> = {
  active: { cls: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  pending: { cls: 'text-amber-400', bg: 'bg-amber-400/10' },
  approved: { cls: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  expired: { cls: 'text-white/30', bg: 'bg-white/5' },
  rejected: { cls: 'text-red-400', bg: 'bg-red-400/10' },
};

const FALLBACK_GRANTS: Grant[] = [
  { id: '1', title: 'STEM Excellence Initiative', funder: 'National Science Foundation', amount: 250000, spent: 142000, status: 'active', startDate: '2024-09-01', endDate: '2026-08-31', category: 'Academic', description: 'Fund STEM labs and teacher training' },
  { id: '2', title: 'Digital Literacy Program', funder: 'Tech Education Fund', amount: 75000, spent: 68000, status: 'active', startDate: '2024-06-01', endDate: '2025-05-31', category: 'Technology', description: '1:1 device program for under-served students' },
  { id: '3', title: 'Wellness & Mental Health', funder: 'State Dept. of Education', amount: 120000, spent: 0, status: 'approved', startDate: '2025-04-01', endDate: '2026-03-31', category: 'Wellness', description: 'Hiring counselors and wellness resources' },
  { id: '4', title: 'Arts Integration Grant', funder: 'Community Arts Council', amount: 35000, spent: 35000, status: 'expired', startDate: '2023-09-01', endDate: '2024-08-31', category: 'Arts', description: 'Cross-curricular arts integration' },
  { id: '5', title: 'Green Campus Initiative', funder: 'EPA Education Grants', amount: 180000, spent: 0, status: 'pending', startDate: '2025-07-01', endDate: '2027-06-30', category: 'Facilities', description: 'Solar panels and sustainability curriculum' },
  { id: '6', title: 'After-School Enrichment', funder: 'Community Foundation', amount: 50000, spent: 22000, status: 'active', startDate: '2025-01-01', endDate: '2025-12-31', category: 'Programs', description: 'Music, robotics, and language clubs' },
];

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export default function GrantsView() {
  const containerRef = useStaggerAnimate([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GrantStatus>('all');
  const { schoolId } = useAuthStore();
  const { data: apiGrants } = useGrants(schoolId);
  const createGrant = useCreateGrant(schoolId ?? '');

  const grants: Grant[] = (apiGrants as any[])?.map((g: any) => ({
    id: g.id, title: g.name ?? g.title ?? '', funder: g.source ?? g.funder ?? '',
    amount: Number(g.amount ?? 0), spent: Number(g.spent ?? 0),
    status: (g.status?.toLowerCase() ?? 'pending') as GrantStatus,
    startDate: g.startDate ?? g.createdAt ?? '', endDate: g.endDate ?? g.deadline ?? '',
    category: g.category ?? 'General', description: g.description ?? '',
  })) ?? FALLBACK_GRANTS;

  const filtered = grants.filter((g) => {
    const s = statusFilter === 'all' || g.status === statusFilter;
    const q = g.title.toLowerCase().includes(search.toLowerCase()) || g.funder.toLowerCase().includes(search.toLowerCase());
    return s && q;
  });

  const totalFunding = grants.filter((g) => g.status === 'active').reduce((s, g) => s + g.amount, 0);
  const totalSpent = grants.filter((g) => g.status === 'active').reduce((s, g) => s + g.spent, 0);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="size-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white/90">Grants & Funding</h2>
        </div>
        <Button className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/20 text-xs h-8" onClick={() => createGrant.mutate({ name: 'New Grant', amount: 0, source: '', deadline: new Date().toISOString() }, { onSuccess: () => notifySuccess('Grant created', 'New grant record added') })}>
          <Plus className="size-3" />New Grant
        </Button>
      </div>

      {/* Summary */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase">Active Funding</span>
            <span className="text-xl font-bold text-white/90 font-mono tabular-nums">{fmt(totalFunding)}</span>
          </CardContent>
        </Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase">Total Spent</span>
            <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums">{fmt(totalSpent)}</span>
          </CardContent>
        </Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase">Remaining</span>
            <span className="text-xl font-bold text-amber-400 font-mono tabular-nums">{fmt(totalFunding - totalSpent)}</span>
          </CardContent>
        </Card>
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="flex flex-col gap-1 p-4">
            <span className="text-[10px] text-white/40 uppercase">Total Grants</span>
            <span className="text-xl font-bold text-white/90">{grants.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div data-animate className="flex gap-2">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search grants…" className="pl-9 bg-white/4 border-white/8 text-white/80 text-xs h-8" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | GrantStatus)} className="rounded-md border border-white/8 bg-white/4 px-2 py-1 text-[11px] text-white/60 outline-none">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Grant cards */}
      <div data-animate className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((g) => {
          const pct = g.amount > 0 ? Math.round((g.spent / g.amount) * 100) : 0;
          const sc = STATUS_CFG[g.status];
          return (
            <Card key={g.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/80">{g.title}</p>
                    <p className="text-[10px] text-white/30">{g.funder}</p>
                  </div>
                  <Badge className={cn('border-0 text-[9px] capitalize', sc.bg, sc.cls)}>{g.status}</Badge>
                </div>
                <p className="text-[11px] text-white/40">{g.description}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40">Utilisation</span>
                  <span className="text-white/60 font-mono tabular-nums">{fmt(g.spent)} / {fmt(g.amount)}</span>
                </div>
                <Progress value={pct} className="h-1.5 bg-white/5" />
                <div className="flex items-center gap-4 text-[10px] text-white/25">
                  <span className="flex items-center gap-1"><Calendar className="size-2.5" />{new Date(g.startDate).toLocaleDateString()} – {new Date(g.endDate).toLocaleDateString()}</span>
                  <Badge variant="outline" className="border-white/8 text-white/25 text-[8px]">{g.category}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
