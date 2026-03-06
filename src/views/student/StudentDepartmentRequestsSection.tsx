/* ─── StudentDepartmentRequestsSection ─── Submit & track requests ── */
import { useState } from 'react';
import { ClipboardList, Plus, Clock, CheckCircle2, XCircle, AlertTriangle, Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useStudentStore } from '@/store/student-data.store';
import { notifySuccess } from '@/lib/notify';

type RequestStatus = 'pending' | 'approved' | 'denied' | 'in-review';
type RequestCategory = 'transcript' | 'schedule_change' | 'excused_absence' | 'club_request' | 'tech_support' | 'other';

interface DepartmentRequest {
  id: string;
  title: string;
  category: RequestCategory;
  status: RequestStatus;
  department: string;
  submittedAt: string;
  updatedAt: string;
  description: string;
  response?: string;
}

const STATUS_CFG: Record<RequestStatus, { Icon: typeof Clock; cls: string; bg: string; label: string }> = {
  pending: { Icon: Clock, cls: 'text-amber-400', bg: 'bg-amber-400/10', label: 'Pending' },
  'in-review': { Icon: AlertTriangle, cls: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'In Review' },
  approved: { Icon: CheckCircle2, cls: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Approved' },
  denied: { Icon: XCircle, cls: 'text-red-400', bg: 'bg-red-400/10', label: 'Denied' },
};

const MOCK_REQUESTS: DepartmentRequest[] = [
  { id: '1', title: 'Official Transcript Request', category: 'transcript', status: 'approved', department: 'Registrar', submittedAt: '2025-03-10', updatedAt: '2025-03-12', description: 'Need official transcript for college application.', response: 'Transcript has been mailed to the address on file.' },
  { id: '2', title: 'Schedule Change: Drop Art 101', category: 'schedule_change', status: 'in-review', department: 'Academic Affairs', submittedAt: '2025-03-14', updatedAt: '2025-03-14', description: 'Would like to drop Art 101 and add Music Theory instead.' },
  { id: '3', title: 'Excused Absence: March 20', category: 'excused_absence', status: 'pending', department: 'Student Affairs', submittedAt: '2025-03-15', updatedAt: '2025-03-15', description: 'Family medical appointment. Will miss morning classes.' },
  { id: '4', title: 'Start Robotics Club', category: 'club_request', status: 'denied', department: 'Student Activities', submittedAt: '2025-03-01', updatedAt: '2025-03-08', description: 'Request to start a robotics club with 15 interested members.', response: 'Unfortunately, we do not have budget allocation this semester. Please resubmit for Fall.' },
  { id: '5', title: 'Laptop Not Charging', category: 'tech_support', status: 'approved', department: 'IT Help Desk', submittedAt: '2025-03-13', updatedAt: '2025-03-13', description: 'School-issued Chromebook won\'t charge. Tried multiple outlets.', response: 'Replacement charger issued. Pick up at IT desk, Room 104.' },
];

export default function StudentDepartmentRequestsSection() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const [showNew, setShowNew] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqCategory, setReqCategory] = useState('transcript');
  const [reqDesc, setReqDesc] = useState('');
  const store = useStudentStore();

  const filtered = filter === 'all' ? MOCK_REQUESTS : MOCK_REQUESTS.filter((r) => r.status === filter);
  const counts = { all: MOCK_REQUESTS.length, pending: 0, 'in-review': 0, approved: 0, denied: 0 };
  MOCK_REQUESTS.forEach((r) => counts[r.status]++);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white/90">Department Requests</h2>
        </div>
        <Button onClick={() => setShowNew(!showNew)} className="gap-1.5 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/20 text-xs h-8">
          <Plus className="size-3" />New Request
        </Button>
      </div>

      {/* Summary cards */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(Object.entries(STATUS_CFG) as [RequestStatus, typeof STATUS_CFG[RequestStatus]][]).map(([key, cfg]) => (
          <Card
            key={key}
            onClick={() => setFilter(filter === key ? 'all' : key)}
            className={cn('border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer transition-colors', filter === key && 'ring-1 ring-indigo-400/40')}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className={cn('size-8 rounded-lg flex items-center justify-center', cfg.bg)}>
                <cfg.Icon className={cn('size-4', cfg.cls)} />
              </div>
              <div>
                <p className="text-lg font-bold text-white/90 tabular-nums">{counts[key]}</p>
                <p className="text-[10px] text-white/30 capitalize">{cfg.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New request form */}
      {showNew && (
        <Card data-animate className="border-indigo-400/20 bg-indigo-500/5 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Send className="size-4 text-indigo-400" />Submit New Request</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Title</label>
                <Input value={reqTitle} onChange={(e) => setReqTitle(e.target.value)} placeholder="Request title…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-white/40 font-medium">Category</label>
                <select value={reqCategory} onChange={(e) => setReqCategory(e.target.value)} className="h-8 rounded-md border border-white/8 bg-white/4 px-3 text-xs text-white/60 outline-none">
                  <option>Transcript</option>
                  <option>Schedule Change</option>
                  <option>Excused Absence</option>
                  <option>Club Request</option>
                  <option>Tech Support</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-white/40 font-medium">Description</label>
              <textarea rows={3} value={reqDesc} onChange={(e) => setReqDesc(e.target.value)} placeholder="Describe your request…" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none focus:border-indigo-400/40" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)} className="text-xs border-white/10 text-white/50">Cancel</Button>
              <Button size="sm" className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/20 gap-1" onClick={() => { if (!reqTitle.trim()) return; store.submitDeptRequest({ title: reqTitle, category: reqCategory, description: reqDesc }); notifySuccess('Request Submitted', `"${reqTitle}" sent to department`); setReqTitle(''); setReqCategory('transcript'); setReqDesc(''); setShowNew(false); }}><Send className="size-3" />Submit</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests list */}
      <div data-animate className="flex flex-col gap-3">
        {filtered.map((req) => {
          const s = STATUS_CFG[req.status];
          return (
            <Card key={req.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <s.Icon className={cn('size-4 shrink-0', s.cls)} />
                    <div>
                      <p className="text-sm font-semibold text-white/80">{req.title}</p>
                      <p className="text-[10px] text-white/30">{req.department} • {req.category.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <Badge className={cn('border-0 text-[9px]', s.bg, s.cls)}>{s.label}</Badge>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed">{req.description}</p>
                {req.response && (
                  <div className="rounded-lg border border-white/6 bg-white/2 p-3 flex gap-2">
                    <MessageSquare className="size-3.5 text-indigo-400 shrink-0 mt-0.5" />
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
