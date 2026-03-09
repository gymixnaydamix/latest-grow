/* ─── DeptRequestsOverviewPage ─── Full-page department requests ──── */
import { useState } from 'react';
import {
  FileText, Clock, CheckCircle2, AlertCircle,
  XCircle, ChevronDown, ChevronRight, Search,
  Building2, DollarSign, Users, HelpCircle,
  Send, Plus, Filter, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { useStudentDeptRequests, useSubmitDeptRequest } from '@/hooks/api/use-student';

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/15' },
  in_review: { label: 'In Review', icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/15' },
} as const;
type Status = keyof typeof STATUS_CONFIG;

const DEPARTMENTS = [
  { id: 'finance', name: 'Finance', icon: DollarSign, color: 'bg-emerald-500/20 text-emerald-400', requests: 4 },
  { id: 'hr', name: 'Human Resources', icon: Users, color: 'bg-blue-500/20 text-blue-400', requests: 2 },
  { id: 'marketing', name: 'Marketing', icon: Building2, color: 'bg-pink-500/20 text-pink-400', requests: 3 },
  { id: 'inquiries', name: 'General Inquiries', icon: HelpCircle, color: 'bg-amber-500/20 text-amber-400', requests: 2 },
];

const FALLBACK_REQUESTS = [
  { id: 'REQ-001', title: 'Tuition fee installment plan', dept: 'Finance', status: 'approved' as Status, date: '2 d ago', priority: 'High', response: 'Installment plan approved. Payment schedule has been updated.' },
  { id: 'REQ-002', title: 'Transcript request for scholarship', dept: 'Finance', status: 'pending' as Status, date: '1 d ago', priority: 'Medium', response: null },
  { id: 'REQ-003', title: 'Internship placement support', dept: 'Human Resources', status: 'in_review' as Status, date: '3 d ago', priority: 'High', response: null },
  { id: 'REQ-004', title: 'Club event budget approval', dept: 'Marketing', status: 'approved' as Status, date: '5 d ago', priority: 'Low', response: 'Budget of $250 approved for Spring Festival booth.' },
  { id: 'REQ-005', title: 'Course change request', dept: 'General Inquiries', status: 'rejected' as Status, date: '1 w ago', priority: 'Medium', response: 'Course change period has ended. Please submit for next semester.' },
  { id: 'REQ-006', title: 'Lab equipment reimbursement', dept: 'Finance', status: 'pending' as Status, date: '4 h ago', priority: 'Low', response: null },
  { id: 'REQ-007', title: 'Volunteer hours certification', dept: 'Human Resources', status: 'approved' as Status, date: '1 w ago', priority: 'Low', response: '120 volunteer hours verified and certified.' },
  { id: 'REQ-008', title: 'Social media campaign proposal', dept: 'Marketing', status: 'in_review' as Status, date: '2 d ago', priority: 'Medium', response: null },
  { id: 'REQ-009', title: 'Parking permit application', dept: 'General Inquiries', status: 'pending' as Status, date: '6 h ago', priority: 'Low', response: null },
  { id: 'REQ-010', title: 'Scholarship disbursement inquiry', dept: 'Finance', status: 'approved' as Status, date: '2 w ago', priority: 'High', response: 'Funds disbursed to your account on April 15.' },
  { id: 'REQ-011', title: 'Event sponsorship request', dept: 'Marketing', status: 'pending' as Status, date: '1 d ago', priority: 'Medium', response: null },
];

export default function DeptRequestsOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  /* ── API data ── */
  const { data: apiDeptReqs } = useStudentDeptRequests();
  const submitDeptRequestMut = useSubmitDeptRequest();
  const requests = (apiDeptReqs as any[])?.length > 0 ? (apiDeptReqs as any[]) : FALLBACK_REQUESTS;

  const counts = {
    pending: requests.filter((r: any) => r.status === 'pending').length,
    approved: requests.filter((r: any) => r.status === 'approved').length,
    rejected: requests.filter((r: any) => r.status === 'rejected').length,
    in_review: requests.filter((r: any) => r.status === 'in_review').length,
  };

  const filtered = requests.filter((r: any) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.dept.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Department Requests" description="Submit and track requests across school departments" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total Requests" value={requests.length} icon={<FileText className="h-5 w-5" />} />
        <StatCard label="Pending" value={counts.pending} icon={<Clock className="h-5 w-5" />} accentColor="#f59e0b" />
        <StatCard label="Approved" value={counts.approved} icon={<CheckCircle2 className="h-5 w-5" />} accentColor="#10b981" />
        <StatCard label="In Review" value={counts.in_review} icon={<AlertCircle className="h-5 w-5" />} accentColor="#3b82f6" />
      </div>

      {/* Department cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {DEPARTMENTS.map((dept) => (
          <Card key={dept.id} onClick={() => notifySuccess('Department', 'Opening department details…')} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('size-9 rounded-xl flex items-center justify-center', dept.color)}>
                <dept.icon className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-white/75">{dept.name}</p>
                <p className="text-[8px] text-white/25">{dept.requests} requests</p>
              </div>
              <ChevronRight className="size-3 text-white/15 group-hover:text-white/30 transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main – Request list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Search + filter bar */}
          <div className="flex items-center gap-2" data-animate>
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-white/25" />
              <Input
                placeholder="Search requests…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
              />
            </div>
            <div className="flex items-center gap-1">
              <Filter className="size-3 text-white/25" />
              {(['all', 'pending', 'in_review', 'approved', 'rejected'] as const).map((s) => (
                <Button
                  key={s}
                  variant="ghost"
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'text-[9px] h-6 px-2 rounded-full border border-white/6 bg-white/3',
                    statusFilter === s && 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400',
                  )}
                >
                  {s === 'all' ? 'All' : s === 'in_review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Request list */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-white/90 text-sm">All Requests</CardTitle>
              <Button size="sm" onClick={() => submitDeptRequestMut.mutate({ title: 'New Request', dept: 'General Inquiries', priority: 'Medium' } as any, { onSuccess: () => notifySuccess('Request Submitted', 'Your request has been sent to the department') })} className="text-[10px] h-7 bg-indigo-600 hover:bg-indigo-500 text-white gap-1">
                <Plus className="size-3" />New Request
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {filtered.length === 0 && (
                <p className="text-xs text-white/25 text-center py-6">No requests match your filters</p>
              )}
              {filtered.map((req: any) => {
                const cfg = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG];
                const isExpanded = expanded === req.id;
                return (
                  <div key={req.id} className="rounded-lg border border-white/6 bg-white/2 overflow-hidden">
                    <div
                      className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-white/2 transition-colors"
                      onClick={() => setExpanded(isExpanded ? null : req.id)}
                    >
                      <div className={cn('size-7 rounded-md flex items-center justify-center', cfg.bg)}>
                        <cfg.icon className={cn('size-3.5', cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-medium text-white/70 truncate">{req.title}</p>
                          <Badge variant="outline" className={cn('text-[7px] border-0 shrink-0', cfg.bg, cfg.color)}>{cfg.label}</Badge>
                        </div>
                        <p className="text-[8px] text-white/25">{req.id} · {req.dept} · {req.date}</p>
                      </div>
                      <Badge variant="outline" className={cn(
                        'text-[7px] border-white/6 shrink-0',
                        req.priority === 'High' ? 'text-red-400' : req.priority === 'Medium' ? 'text-amber-400' : 'text-white/30',
                      )}>
                        {req.priority}
                      </Badge>
                      {isExpanded ? <ChevronDown className="size-3 text-white/20" /> : <ChevronRight className="size-3 text-white/20" />}
                    </div>
                    {isExpanded && req.response && (
                      <div className="px-3 pb-3 pt-0">
                        <div className="rounded-md bg-white/2 border border-white/5 p-2.5">
                          <p className="text-[9px] text-white/40 mb-0.5 font-medium">Response</p>
                          <p className="text-[10px] text-white/55">{req.response}</p>
                        </div>
                      </div>
                    )}
                    {isExpanded && !req.response && (
                      <div className="px-3 pb-3 pt-0">
                        <p className="text-[9px] text-white/20 italic">Awaiting response…</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Status breakdown */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <BarChart3 className="size-4 text-indigo-400" />Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <cfg.icon className={cn('size-3.5 shrink-0', cfg.color)} />
                  <span className="text-[9px] text-white/40 w-14">{cfg.label}</span>
                  <div className="flex-1">
                    <Progress value={(counts[key] / (requests.length || 1)) * 100} className="h-1.5 bg-white/5" />
                  </div>
                  <span className="text-[10px] text-white/50 w-4 text-right">{counts[key]}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dept breakdown */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Building2 className="size-4 text-pink-400" />By Department
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {DEPARTMENTS.map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('size-6 rounded-md flex items-center justify-center', d.color)}>
                      <d.icon className="size-3" />
                    </div>
                    <span className="text-[9px] text-white/50">{d.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white/60">{d.requests}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick submit */}
          <Card data-animate className="border-indigo-500/15 bg-indigo-500/5 backdrop-blur-xl">
            <CardContent className="p-4 flex flex-col gap-2.5">
              <p className="text-xs text-indigo-400 font-medium flex items-center gap-1.5"><Send className="size-3.5" />Quick Submit</p>
              <p className="text-[9px] text-indigo-300/40">Need something from a department? Start a new request and we'll route it to the right team.</p>
              <Button onClick={() => submitDeptRequestMut.mutate({ title: 'New Request', dept: 'General Inquiries', priority: 'Medium' } as any, { onSuccess: () => notifySuccess('Request Submitted', 'Your request has been sent to the department') })} className="w-full text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1">
                <Plus className="size-3" />New Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
