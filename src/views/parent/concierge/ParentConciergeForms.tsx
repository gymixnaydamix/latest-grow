/* Parent Concierge › Forms & Approvals — Pending Forms, Leave Requests, Permission Slips, Medical, Re-enrollment, Submitted */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeSplitPreviewPanel } from '@/components/concierge/shared';
import { FileText, CalendarOff, ShieldCheck, Stethoscope, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Pending forms ── */
const pendingForms = [
  { id: 'pf1', name: 'Annual Health Declaration', child: 'Aarav Sharma — Grade 5', dueDate: 'Mar 10, 2026', status: 'Not Started', category: 'Medical' },
  { id: 'pf2', name: 'Emergency Contact Update', child: 'Meera Sharma — Grade 2', dueDate: 'Mar 12, 2026', status: 'In Progress', category: 'Administrative' },
  { id: 'pf3', name: 'Co-curricular Activity Consent', child: 'Aarav Sharma — Grade 5', dueDate: 'Mar 8, 2026', status: 'Not Started', category: 'Academic' },
  { id: 'pf4', name: 'Parent Feedback Survey — Term 2', child: 'All Children', dueDate: 'Mar 15, 2026', status: 'Not Started', category: 'Feedback' },
  { id: 'pf5', name: 'Transportation Route Change Request', child: 'Meera Sharma — Grade 2', dueDate: 'Mar 18, 2026', status: 'In Progress', category: 'Transport' },
];

/* ── Leave requests ── */
const leaveRequests = [
  { id: 'lr1', child: 'Meera Sharma — Grade 2', from: 'Mar 10, 2026', to: 'Mar 12, 2026', days: 3, reason: 'Family function — cousin\'s wedding in Jaipur', status: 'Draft', teacher: 'Ms. Anita Desai' },
  { id: 'lr2', child: 'Aarav Sharma — Grade 5', from: 'Mar 20, 2026', to: 'Mar 20, 2026', days: 1, reason: 'Doctor appointment — orthodontist follow-up', status: 'Approved', teacher: 'Mrs. Priya Gupta' },
  { id: 'lr3', child: 'Aarav Sharma — Grade 5', from: 'Feb 14, 2026', to: 'Feb 14, 2026', days: 1, reason: 'Fever and cold', status: 'Approved', teacher: 'Mrs. Priya Gupta' },
  { id: 'lr4', child: 'Meera Sharma — Grade 2', from: 'Jan 27, 2026', to: 'Jan 28, 2026', days: 2, reason: 'Stomach infection', status: 'Approved', teacher: 'Ms. Anita Desai' },
];

/* ── Permission slips ── */
const permissionSlips = [
  { id: 'ps1', event: 'Science Museum Field Trip', child: 'Aarav Sharma — Grade 5', date: 'Mar 14, 2026', venue: 'National Science Centre, Delhi', status: 'Pending Signature', fee: 350 },
  { id: 'ps2', event: 'Annual Day Rehearsal (Off-campus)', child: 'Meera Sharma — Grade 2', date: 'Mar 18, 2026', venue: 'City Auditorium', status: 'Pending Signature', fee: 0 },
  { id: 'ps3', event: 'Inter-School Cricket Tournament', child: 'Aarav Sharma — Grade 5', date: 'Mar 22, 2026', venue: 'DPS Sports Complex', status: 'Signed', fee: 200 },
  { id: 'ps4', event: 'Art Exhibition Visit', child: 'Meera Sharma — Grade 2', date: 'Feb 28, 2026', venue: 'National Gallery of Art', status: 'Signed', fee: 150 },
];

/* ── Medical forms ── */
const medicalForms = [
  { id: 'mf1', name: 'Annual Health Checkup Report', child: 'Aarav Sharma — Grade 5', dueDate: 'Mar 15, 2026', status: 'Pending Upload', notes: 'Upload latest medical report from school health camp' },
  { id: 'mf2', name: 'Allergy Information Update', child: 'Meera Sharma — Grade 2', dueDate: 'Mar 10, 2026', status: 'Submitted', notes: 'Peanut allergy — EpiPen in school medical room' },
  { id: 'mf3', name: 'Fitness Certificate for Sports', child: 'Aarav Sharma — Grade 5', dueDate: 'Mar 20, 2026', status: 'Pending Upload', notes: 'Required for inter-school cricket tournament participation' },
  { id: 'mf4', name: 'Immunization Record Update', child: 'Meera Sharma — Grade 2', dueDate: 'Apr 1, 2026', status: 'Submitted', notes: 'All vaccinations up to date per government schedule' },
];

/* ── Re-enrollment ── */
const reEnrollment = [
  {
    id: 're1', child: 'Aarav Sharma', currentGrade: 'Grade 5', nextGrade: 'Grade 6', year: '2026–2027',
    status: 'In Progress', progress: 3, total: 6,
    steps: [
      { label: 'Intent to re-enroll', done: true },
      { label: 'Fee deposit payment', done: true },
      { label: 'Academic record verification', done: true },
      { label: 'Parent declaration form', done: false },
      { label: 'Medical clearance', done: false },
      { label: 'Final confirmation', done: false },
    ],
    deadline: 'Mar 31, 2026', depositPaid: 10000, totalFee: 78000,
  },
  {
    id: 're2', child: 'Meera Sharma', currentGrade: 'Grade 2', nextGrade: 'Grade 3', year: '2026–2027',
    status: 'Not Started', progress: 0, total: 6,
    steps: [
      { label: 'Intent to re-enroll', done: false },
      { label: 'Fee deposit payment', done: false },
      { label: 'Academic record verification', done: false },
      { label: 'Parent declaration form', done: false },
      { label: 'Medical clearance', done: false },
      { label: 'Final confirmation', done: false },
    ],
    deadline: 'Mar 31, 2026', depositPaid: 0, totalFee: 65000,
  },
];

/* ── Submitted forms ── */
const submittedForms = [
  { id: 'sf1', name: 'Emergency Contact Update', child: 'Aarav Sharma — Grade 5', submitted: 'Feb 20, 2026', status: 'Accepted', reviewedBy: 'Admin Office' },
  { id: 'sf2', name: 'Transport Opt-in Form', child: 'Meera Sharma — Grade 2', submitted: 'Jan 5, 2026', status: 'Accepted', reviewedBy: 'Transport Desk' },
  { id: 'sf3', name: 'Allergy Information Form', child: 'Meera Sharma — Grade 2', submitted: 'Jan 10, 2026', status: 'Accepted', reviewedBy: 'School Nurse' },
  { id: 'sf4', name: 'Photo & Video Consent', child: 'All Children', submitted: 'Apr 2, 2025', status: 'Accepted', reviewedBy: 'Admin Office' },
  { id: 'sf5', name: 'Swimming Pool Consent', child: 'Aarav Sharma — Grade 5', submitted: 'Sep 5, 2025', status: 'Under Review', reviewedBy: 'Sports Department' },
];

const formStatusColor: Record<string, string> = {
  'Not Started': 'bg-zinc-500/10 text-zinc-500',
  'In Progress': 'bg-amber-500/10 text-amber-600',
  'Pending Signature': 'bg-amber-500/10 text-amber-600',
  'Pending Upload': 'bg-amber-500/10 text-amber-600',
  Signed: 'bg-emerald-500/10 text-emerald-600',
  Submitted: 'bg-emerald-500/10 text-emerald-600',
  Accepted: 'bg-emerald-500/10 text-emerald-600',
  'Under Review': 'bg-blue-500/10 text-blue-600',
  Draft: 'bg-zinc-500/10 text-zinc-500',
  Approved: 'bg-emerald-500/10 text-emerald-600',
};

export function ParentConciergeForms() {
  const { activeSubNav } = useNavigationStore();

  /* ── Pending Forms (default) ── */
  if (!activeSubNav || activeSubNav === 'c_pending_forms') {
    const formList = (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Pending Forms</span>
          <span className="text-[10px] text-muted-foreground">{pendingForms.length} forms remaining</span>
        </div>
        {pendingForms.map((f) => (
          <div key={f.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-xs font-medium text-foreground">{f.name}</h5>
              <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', formStatusColor[f.status])}>
                {f.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>{f.child}</span>
              <span>·</span>
              <span>Due: {f.dueDate}</span>
              <span>·</span>
              <span>{f.category}</span>
            </div>
          </div>
        ))}
      </div>
    );

    const summary = (
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Forms Overview</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Pending', count: pendingForms.filter((f) => f.status === 'Not Started').length, icon: FileText, color: 'text-zinc-500' },
            { label: 'In Progress', count: pendingForms.filter((f) => f.status === 'In Progress').length, icon: Clock, color: 'text-amber-600' },
            { label: 'Due This Week', count: 3, icon: AlertTriangle, color: 'text-red-600' },
            { label: 'Submitted', count: submittedForms.length, icon: CheckCircle2, color: 'text-emerald-600' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/30 bg-background/70 p-3 text-center dark:border-white/5">
              <item.icon className={cn('mx-auto mb-1 h-4 w-4', item.color)} />
              <p className={cn('text-lg font-bold', item.color)}>{item.count}</p>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    );

    return <ConciergeSplitPreviewPanel left={formList} right={summary} leftLabel="Pending" rightLabel="Overview" />;
  }

  /* ── Leave Requests ── */
  if (activeSubNav === 'c_leave_requests') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Leave Requests</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <CalendarOff className="h-3.5 w-3.5" /> New Leave
          </button>
        </div>
        <div className="space-y-2">
          {leaveRequests.map((l) => (
            <div key={l.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{l.child}</h5>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', formStatusColor[l.status])}>
                  {l.status}
                </span>
              </div>
              <p className="text-xs text-foreground/80 mb-1">{l.reason}</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>{l.from} → {l.to} ({l.days} day{l.days > 1 ? 's' : ''})</span>
                <span>Teacher: {l.teacher}</span>
              </div>
              {l.status === 'Draft' && (
                <div className="flex items-center gap-2 mt-2">
                  <button className="rounded-lg bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90">Submit</button>
                  <button className="rounded-lg border border-border/50 px-3 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Permission Slips ── */
  if (activeSubNav === 'c_permission_slips') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Permission Slips</h3>
        <div className="space-y-2">
          {permissionSlips.map((p) => (
            <div key={p.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{p.event}</h5>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', formStatusColor[p.status])}>
                  {p.status}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-0.5">{p.child}</div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>{p.date}</span>
                <span>{p.venue}</span>
                {p.fee > 0 && <span>Fee: ₹{p.fee}</span>}
              </div>
              {p.status === 'Pending Signature' && (
                <div className="flex items-center gap-2 mt-2">
                  <button className="rounded-lg bg-emerald-600 px-3 py-1 text-[10px] font-medium text-white hover:bg-emerald-700">
                    <ShieldCheck className="mr-1 inline h-2.5 w-2.5" /> Sign & Approve
                  </button>
                  <button className="rounded-lg border border-border/50 px-3 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">View Details</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Medical ── */
  if (activeSubNav === 'c_medical') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Medical Forms & Records</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Stethoscope className="h-3.5 w-3.5" /> Upload Record
          </button>
        </div>
        <div className="space-y-2">
          {medicalForms.map((m) => (
            <div key={m.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{m.name}</h5>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', formStatusColor[m.status])}>
                  {m.status}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-0.5">{m.child}</div>
              <p className="text-[10px] text-muted-foreground italic">{m.notes}</p>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                <span>Due: {m.dueDate}</span>
              </div>
              {m.status === 'Pending Upload' && (
                <button className="mt-2 rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary hover:bg-primary/20">
                  Upload Document
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Re-enrollment ── */
  if (activeSubNav === 'c_reenrollment') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Re-enrollment for 2026–2027</h3>
        <div className="space-y-3">
          {reEnrollment.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/30 bg-background/70 p-4 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h5 className="text-xs font-semibold text-foreground">{r.child}</h5>
                  <span className="text-[10px] text-muted-foreground">{r.currentGrade} → {r.nextGrade} · {r.year}</span>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', formStatusColor[r.status])}>
                  {r.status}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(r.progress / r.total) * 100}%` }}
                />
              </div>
              <div className="space-y-1.5 mb-3">
                {r.steps.map((step) => (
                  <div key={step.label} className="flex items-center gap-2 text-[10px]">
                    {step.done ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-border/50" />
                    )}
                    <span className={step.done ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}>{step.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                <span>Deadline: {r.deadline}</span>
                <span>Deposit: ₹{r.depositPaid.toLocaleString('en-IN')} / ₹{r.totalFee.toLocaleString('en-IN')}</span>
              </div>
              {r.progress < r.total && (
                <button className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                  Continue Re-enrollment
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Submitted ── */
  if (activeSubNav === 'c_submitted') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Submitted Forms</h3>
        <div className="space-y-2">
          {submittedForms.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{s.name}</h5>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', formStatusColor[s.status])}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{s.child}</span>
                <span>·</span>
                <span>Submitted: {s.submitted}</span>
                <span>·</span>
                <span>Reviewed by: {s.reviewedBy}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
