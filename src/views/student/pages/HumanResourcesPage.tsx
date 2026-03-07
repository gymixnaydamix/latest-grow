/* ─── HumanResourcesPage ─── HR department requests ────────────────── */
import { useState } from 'react';
import {
  Users, UserCheck, Briefcase, FileText, Clock,
  CheckCircle2, XCircle, AlertTriangle, Send, Plus,
  Shield, GraduationCap, Heart, CalendarDays,
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

type ReqStatus = 'pending' | 'approved' | 'denied' | 'in-review';

interface HRRequest {
  id: string;
  title: string;
  type: 'enrollment' | 'id_card' | 'clearance' | 'accommodation' | 'transfer' | 'leave' | 'other';
  status: ReqStatus;
  submittedAt: string;
  updatedAt: string;
  description: string;
  response?: string;
  assignedTo?: string;
}

const STATUS_CFG: Record<ReqStatus, { Icon: typeof Clock; cls: string; bg: string; label: string }> = {
  pending:     { Icon: Clock,        cls: 'text-amber-400',   bg: 'bg-amber-400/10',   label: 'Pending' },
  'in-review': { Icon: AlertTriangle, cls: 'text-blue-400',   bg: 'bg-blue-400/10',    label: 'In Review' },
  approved:    { Icon: CheckCircle2, cls: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Approved' },
  denied:      { Icon: XCircle,       cls: 'text-red-400',    bg: 'bg-red-400/10',     label: 'Denied' },
};

const TYPE_CFG: Record<HRRequest['type'], { label: string; icon: typeof Users; color: string }> = {
  enrollment:    { label: 'Enrollment', icon: GraduationCap, color: 'text-violet-400' },
  id_card:       { label: 'ID Card', icon: Shield, color: 'text-cyan-400' },
  clearance:     { label: 'Clearance', icon: UserCheck, color: 'text-emerald-400' },
  accommodation: { label: 'Accommodation', icon: Heart, color: 'text-pink-400' },
  transfer:      { label: 'Transfer', icon: Briefcase, color: 'text-amber-400' },
  leave:         { label: 'Leave of Absence', icon: CalendarDays, color: 'text-indigo-400' },
  other:         { label: 'Other', icon: FileText, color: 'text-white/50' },
};

const MOCK: HRRequest[] = [
  { id: '1', title: 'Enrollment Verification Letter', type: 'enrollment', status: 'approved', submittedAt: '2026-02-10', updatedAt: '2026-02-12', description: 'Need an official enrollment verification letter for my visa renewal.', response: 'Letter is ready. Pick up at HR office, Room 202.', assignedTo: 'Sarah M.' },
  { id: '2', title: 'Replacement Student ID', type: 'id_card', status: 'approved', submittedAt: '2026-02-18', updatedAt: '2026-02-19', description: 'Lost my student ID card. Requesting a replacement.', response: 'New ID printed. $15 replacement fee applies. Pick up at security desk.', assignedTo: 'Tom K.' },
  { id: '3', title: 'Academic Clearance for Graduation', type: 'clearance', status: 'in-review', submittedAt: '2026-02-25', updatedAt: '2026-02-28', description: 'Requesting academic clearance check for Spring 2026 graduation candidacy.', assignedTo: 'Dr. Patel' },
  { id: '4', title: 'Disability Accommodation Request', type: 'accommodation', status: 'pending', submittedAt: '2026-03-01', updatedAt: '2026-03-01', description: 'Requesting extended test time accommodation due to documented ADHD. Medical documentation attached.' },
  { id: '5', title: 'Internal Transfer to Engineering', type: 'transfer', status: 'denied', submittedAt: '2026-01-20', updatedAt: '2026-02-01', description: 'Requesting department transfer from General Studies to Engineering program.', response: 'Transfer denied — minimum 3.2 GPA required for Engineering. Current GPA: 2.9. Please reapply after improving grades.' },
  { id: '6', title: 'Medical Leave of Absence', type: 'leave', status: 'in-review', submittedAt: '2026-02-28', updatedAt: '2026-03-02', description: 'Requesting leave of absence for April–May 2026 for scheduled surgery and recovery period.', assignedTo: 'HR Director' },
];

export default function HumanResourcesPage() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<'all' | ReqStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | HRRequest['type']>('all');
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  /* ── API data ── */
  const { data: _apiDeptReqs } = useStudentDeptRequests();
  const hrReqs = ((_apiDeptReqs as any[]) ?? []).filter((r: any) => r.department?.toLowerCase() === 'hr' || r.department?.toLowerCase() === 'human resources');

  const filtered = (hrReqs.length > 0 ? hrReqs : MOCK)
    .filter((r) => filter === 'all' || r.status === filter)
    .filter((r) => typeFilter === 'all' || r.type === typeFilter)
    .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()));

  const hrItems = hrReqs.length > 0 ? hrReqs : MOCK;
  const pending = hrItems.filter((r: any) => r.status === 'pending').length;
  const inReview = hrItems.filter((r: any) => r.status === 'in-review').length;
  const approved = hrItems.filter((r: any) => r.status === 'approved').length;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Human Resources" description="Submit and track HR-related requests — enrollment, IDs, clearance, accommodations" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Requests" value={hrItems.length} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pending" value={pending} icon={<Clock className="h-5 w-5" />} trend={pending > 0 ? 'up' : 'neutral'} />
        <StatCard label="In Review" value={inReview} icon={<AlertTriangle className="h-5 w-5" />} />
        <StatCard label="Approved" value={approved} icon={<CheckCircle2 className="h-5 w-5" />} trend="up" />
      </div>

      {/* Toolbar */}
      <div data-animate className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'in-review', 'approved', 'denied'] as const).map((s) => (
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
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search requests…"
            className="h-8 w-48 bg-white/4 border-white/8 text-white/80 text-xs"
          />
          <Button
            onClick={() => setShowNew(!showNew)}
            className="gap-1.5 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/20 text-xs h-8"
          >
            <Plus className="size-3" />New
          </Button>
        </div>
      </div>

      {/* Type filter chips */}
      <div data-animate className="flex flex-wrap gap-2">
        {(['all', ...Object.keys(TYPE_CFG)] as const).map((t) => {
          const cfg = t !== 'all' ? TYPE_CFG[t as HRRequest['type']] : null;
          return (
            <Badge
              key={t}
              onClick={() => setTypeFilter(t as typeof typeFilter)}
              className={cn(
                'cursor-pointer text-[10px] transition-colors gap-1',
                typeFilter === t
                  ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                  : 'bg-white/4 text-white/40 border-white/8 hover:text-white/60',
              )}
            >
              {cfg && <cfg.icon className={cn('size-3', cfg.color)} />}
              {t === 'all' ? 'All Types' : cfg!.label}
            </Badge>
          );
        })}
      </div>

      {/* New request form */}
      {showNew && (
        <Card data-animate className="border-blue-400/20 bg-blue-500/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm flex items-center gap-2">
              <Send className="size-4 text-blue-400" />New HR Request
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Title</label>
                <Input placeholder="Request title…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Type</label>
                <select className="h-8 rounded-md border border-white/8 bg-white/4 px-3 text-xs text-white/60 outline-none">
                  {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 font-medium">Description</label>
              <textarea rows={3} placeholder="Describe your HR request in detail…" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none focus:border-blue-400/40" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 font-medium">Supporting Documents (optional)</label>
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/2 p-3">
                <FileText className="size-4 text-white/30" />
                <span className="text-[10px] text-white/30">Drag & drop or click to upload</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)} className="text-xs border-white/10 text-white/50">Cancel</Button>
              <Button size="sm" onClick={() => notifySuccess('Request', 'HR request submitted')} className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/20 gap-1"><Send className="size-3" />Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests list */}
      <div data-animate className="flex flex-col gap-3">
        {!filtered.length && (
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="py-10 text-center text-white/30 text-sm">No requests match your filters.</CardContent>
          </Card>
        )}
        {filtered.map((req: any) => {
          const s = STATUS_CFG[req.status as ReqStatus];
          const tc = TYPE_CFG[req.type as keyof typeof TYPE_CFG];
          return (
            <Card key={req.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <tc.icon className={cn('size-4 shrink-0', tc.color)} />
                    <div>
                      <p className="text-sm font-semibold text-white/80">{req.title}</p>
                      <p className="text-[10px] text-white/30">{tc.label}{req.assignedTo ? ` • Assigned: ${req.assignedTo}` : ''}</p>
                    </div>
                  </div>
                  <Badge className={cn('border-0 text-[9px]', s.bg, s.cls)}>{s.label}</Badge>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{req.description}</p>
                {req.response && (
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3 flex gap-2">
                    <FileText className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-white/50 leading-relaxed">{req.response}</p>
                  </div>
                )}
                <div className="flex items-center gap-4 text-[10px] text-white/25">
                  <span>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(req.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
