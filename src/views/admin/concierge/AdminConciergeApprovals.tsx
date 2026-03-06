/* Admin Concierge › Approvals — Split layout: queue + detail panel */
import { useNavigationStore } from '@/store/navigation.store';
import { useState } from 'react';
import { ConciergeSplitPreviewPanel, ConciergePermissionBadge, ConciergeAuditNotice } from '@/components/concierge/shared';
import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Approval {
  id: string; type: string; requester: string; affectedRecord: string;
  status: string; priority: string; dueDate: string; summary: string;
}

const approvals: Approval[] = [
  { id: 'a1', type: 'Admission', requester: 'Ms. Fatima', affectedRecord: 'Student: Omar Khalid', status: 'Pending', priority: 'High', dueDate: 'Today', summary: 'New student admission for Grade 4A. Transfers from Al-Noor School with strong GPA.' },
  { id: 'a2', type: 'Discount', requester: 'Mr. Hasan', affectedRecord: 'Invoice #4021', status: 'Pending', priority: 'Medium', dueDate: 'Tomorrow', summary: '15% sibling discount request for the Ali family, 3 children enrolled.' },
  { id: 'a3', type: 'Refund', requester: 'Mrs. Layla', affectedRecord: 'Payment #8812', status: 'Pending', priority: 'High', dueDate: 'Today', summary: 'Partial refund for cancelled transport service — $200.' },
  { id: 'a4', type: 'Attendance Correction', requester: 'Mr. Tariq', affectedRecord: 'Student: Noor Ahmed', status: 'Pending', priority: 'Low', dueDate: 'Jun 14', summary: 'Mark change from Absent to Present for June 10 — teacher error.' },
  { id: 'a5', type: 'Leave Request', requester: 'Ms. Rania', affectedRecord: 'Teacher: Ms. Rania', status: 'Pending', priority: 'Medium', dueDate: 'Jun 15', summary: 'Personal leave request for 3 days (Jun 20-22).' },
  { id: 'a6', type: 'Record Change', requester: 'Registrar', affectedRecord: 'Student: Yasmin Said', status: 'Pending', priority: 'Low', dueDate: 'Jun 16', summary: 'Name correction on enrollment record — middle name update.' },
];

export function AdminConciergeApprovals() {
  const { activeSubNav } = useNavigationStore();
  const [selected, setSelected] = useState<Approval | null>(approvals[0] ?? null);

  const filtered = (() => {
    switch (activeSubNav) {
      case 'c_admissions': return approvals.filter((a) => a.type === 'Admission');
      case 'c_discounts': return approvals.filter((a) => a.type === 'Discount');
      case 'c_refunds': return approvals.filter((a) => a.type === 'Refund');
      case 'c_attendance_corrections': return approvals.filter((a) => a.type === 'Attendance Correction');
      case 'c_leave_requests': return approvals.filter((a) => a.type === 'Leave Request');
      case 'c_record_changes': return approvals.filter((a) => a.type === 'Record Change');
      default: return approvals;
    }
  })();

  const queue = (
    <div className="space-y-2">
      {filtered.map((a) => (
        <button
          key={a.id}
          onClick={() => setSelected(a)}
          className={cn(
            'flex w-full flex-col gap-1 rounded-xl border p-3 text-left transition',
            selected?.id === a.id
              ? 'border-primary/30 bg-primary/5'
              : 'border-border/30 bg-background/70 hover:bg-muted/40 dark:border-white/5',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{a.type}</span>
            <span className={cn('text-[10px] font-medium', a.priority === 'High' ? 'text-amber-500' : a.priority === 'Medium' ? 'text-blue-500' : 'text-zinc-500')}>
              {a.priority}
            </span>
          </div>
          <h5 className="text-xs font-medium text-foreground">{a.affectedRecord}</h5>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-0.5"><User className="h-2.5 w-2.5" />{a.requester}</span>
            <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{a.dueDate}</span>
          </div>
        </button>
      ))}
      {filtered.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">No approvals</p>}
    </div>
  );

  const detail = selected ? (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{selected.affectedRecord}</h4>
        <span className="text-[10px] text-muted-foreground">{selected.type} · Requested by {selected.requester}</span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{selected.summary}</p>
      <ConciergePermissionBadge granted label="Approval permission active" />
      <ConciergeAuditNotice message="This action will be recorded in the audit log" />
      <div className="flex items-center gap-2 pt-2">
        <button className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700">Approve</button>
        <button className="rounded-xl bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700">Reject</button>
        <button className="rounded-xl border border-border/50 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/60">Request Info</button>
        <button className="rounded-xl border border-border/50 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/60">Delegate</button>
        <button className="rounded-xl border border-border/50 px-4 py-2 text-xs font-medium text-foreground hover:bg-muted/60">Escalate</button>
      </div>
    </div>
  ) : <p className="py-8 text-center text-xs text-muted-foreground">Select an approval to review</p>;

  return (
    <ConciergeSplitPreviewPanel left={queue} right={detail} leftLabel="Approval Queue" rightLabel="Approval Detail" />
  );
}
