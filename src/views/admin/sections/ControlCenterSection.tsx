/* ─── ControlCenterSection ─── Operations hub for school admin ─── */
import { useEffect, useMemo, useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useAdminStore } from '@/store/admin-data.store';
import {
  useApprovalHistory,
  useLeaveRequests,
  useApproveLeave,
  useComplianceTasks,
  useUpdateComplianceTask,
  useExamSchedule,
} from '@/hooks/api/use-school-ops';
import { useEvents, useCreateEvent, useDeleteEvent } from '@/hooks/api/use-operations';
import { useDashboardKPIs } from '@/hooks/api/use-school';
import { useStaff } from '@/hooks/api/use-admin';
import { useAnnouncements } from '@/hooks/api/use-announcements';
import { useInvoices } from '@/hooks/api/use-finance';
import { useTransportRoutes } from '@/hooks/api/use-transport';
import {
  AlertTriangle,
  Plus, ChevronRight, Users, Check, X,
  BookOpen, CreditCard, Bus, Megaphone,
  FileText, UserPlus, GraduationCap, ClipboardList,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  ActionInboxItem, ApprovalCard, OperationBlock, StatusBadge,
  FormDialog, DetailPanel, DetailFields,
} from '@/components/features/school-admin';
import type { FormField } from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { AdminStatsStrip } from '@/components/features/AdminStatsStrip';
import { notifySuccess } from '@/lib/notify';

/* ── Local types ── */
interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: string;
  color: string;
  description?: string;
}

interface SchoolIssue {
  id: string;
  type: string;
  desc: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: string;
  reportedAt: string;
  assignee?: string;
}

/* ── Quick Create actions ── */
const quickCreateActions = [
  { id: 'qc-1', label: 'New Student', icon: GraduationCap, section: 'students' },
  { id: 'qc-2', label: 'New Admission', icon: UserPlus, section: 'admissions' },
  { id: 'qc-3', label: 'Create Invoice', icon: CreditCard, section: 'finance' },
  { id: 'qc-4', label: 'Announcement', icon: Megaphone, section: 'communication' },
  { id: 'qc-5', label: 'Schedule Exam', icon: FileText, section: 'exams' },
  { id: 'qc-6', label: 'Add Staff', icon: Users, section: 'staff' },
  { id: 'qc-7', label: 'Transport Route', icon: Bus, section: 'transport' },
  { id: 'qc-8', label: 'Timetable Slot', icon: ClipboardList, section: 'academics' },
];

const severityColors = {
  critical: 'border-l-red-500 bg-red-500/5',
  high: 'border-l-orange-500 bg-orange-500/5',
  medium: 'border-l-amber-500 bg-amber-500/5',
  low: 'border-l-blue-500 bg-blue-500/5',
};

/* ─────────────── Action Inbox View ─────────────── */
function ActionInboxView() {
  const navigate = useNavigationStore(s => s.navigate);
  const { schoolId } = useAuthStore();
  const { data: leaveRes } = useLeaveRequests(schoolId);
  const approveLeave = useApproveLeave(schoolId);
  const leaveItems = Array.isArray(leaveRes) ? leaveRes : (leaveRes as any)?.items ?? [];
  const actionItems = leaveItems.map((l: any) => ({
    id: l.id, title: `Leave Request: ${l.userName ?? l.type ?? 'Staff'}`, category: 'leave',
    priority: l.urgent ? 'critical' : 'normal', status: l.status ?? 'pending',
    deepLink: { section: 'control_center', header: 'approvals' },
  }));
  const [filter, setFilter] = useState<string>('all');

  const catSet = new Set(actionItems.map((i: any) => String(i.category)));
  const categories: string[] = ['all', ...Array.from(catSet) as string[]];
  const filtered = filter === 'all' ? actionItems : actionItems.filter((i: any) => i.category === filter);

  const handleDismiss = (id: string) => {
    approveLeave.mutate({ id, status: 'rejected' });
  };

  const handleComplete = (id: string) => {
    approveLeave.mutate({ id, status: 'approved' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Action Inbox</h2>
          <p className="text-sm text-muted-foreground/60">Items requiring your attention — {actionItems.length} pending</p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">
          {actionItems.filter((i: any) => i.priority === 'critical').length} critical
        </Badge>
      </div>

      {/* Category filters */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={filter === cat ? 'default' : 'outline'}
            onClick={() => setFilter(cat)}
            className={`h-7 text-xs capitalize ${filter === cat ? 'bg-accent' : 'border-border text-muted-foreground/70'}`}
          >
            {cat} {cat !== 'all' && <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px] border-border">{actionItems.filter((i: any) => cat === 'all' || i.category === cat).length}</Badge>}
          </Button>
        ))}
      </div>

      {/* Action items */}
      <div className="space-y-1.5">
        {filtered.filter((i: any) => i.status !== 'completed').map((item: any, i: number) => (
          <div key={item.id} className="group relative">
            <ActionInboxItem
              item={item}
              index={i}
              onAction={(it) => {
                if (it.deepLink) navigate(it.deepLink.section, it.deepLink.header ?? '');
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleComplete(item.id)} title="Mark complete">
                <Check className="size-3 text-green-500" />
              </Button>
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDismiss(item.id)} title="Dismiss">
                <X className="size-3 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.filter((i: any) => i.status !== 'completed').length === 0 && (
          <div className="text-center py-8 text-muted-foreground/60 text-sm">
            All caught up! No pending actions.
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Today's Snapshot View ─────────────── */
function TodaySnapshotView() {
  const { schoolId } = useAuthStore();
  const { updateSnapshot } = useAdminStore();

  /* ── Real API data sources ── */
  const { data: kpis } = useDashboardKPIs(schoolId);
  const { data: staffData } = useStaff(schoolId);
  const { data: examData } = useExamSchedule(schoolId);
  const { data: announcementData } = useAnnouncements(schoolId);
  const { data: invoiceData } = useInvoices(schoolId);
  const { data: complianceData } = useComplianceTasks(schoolId);
  const { data: transportData } = useTransportRoutes(schoolId);

  /* ── Derive snapshot from live data ── */
  const snap = useMemo(() => {
    /* KPI quick stats */
    const kpiArr = Array.isArray(kpis) ? kpis : [];
    const kpiMap = Object.fromEntries(kpiArr.map((k: any) => [k.label, k.value]));
    const totalStudents = Number(kpiMap['Total Students'] ?? 0);
    const activeCourses = Number(kpiMap['Active Courses'] ?? 0);

    /* Absent teachers */
    const staffArr: any[] = Array.isArray(staffData) ? staffData : (staffData as any)?.items ?? [];
    const absentTeachers = staffArr
      .filter((s: any) => s.status === 'Absent' || s.status === 'absent' || s.status === 'Leave' || s.status === 'leave')
      .map((s: any) => ({
        name: s.name ?? s.fullName ?? `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim(),
        subject: s.department ?? s.role ?? 'Staff',
        substitute: s.substitute ?? 'Unassigned',
      }));

    /* Exams today */
    const todayStr = new Date().toISOString().slice(0, 10);
    const examArr: any[] = Array.isArray(examData) ? examData : (examData as any)?.items ?? [];
    const examsToday = examArr
      .filter((e: any) => (e.date ?? e.startDate ?? '').slice(0, 10) === todayStr)
      .map((e: any) => ({
        subject: `${e.subject ?? e.name ?? 'Exam'} — ${e.grade ?? ''}`.trim(),
        room: e.room ?? '—',
        invigilator: e.invigilator ?? '—',
        time: e.time ?? e.startTime ?? '—',
      }));

    /* Transport */
    const routeArr: any[] = Array.isArray(transportData) ? transportData : (transportData as any)?.items ?? [];
    const tCompleted = routeArr.filter((r: any) => r.status === 'completed' || r.status === 'Completed').length;
    const tInProgress = routeArr.filter((r: any) => r.status === 'in_progress' || r.status === 'Active' || r.status === 'active').length;
    const tPending = routeArr.filter((r: any) => r.status === 'pending' || r.status === 'Pending' || r.status === 'scheduled').length;
    const tIssues = routeArr.filter((r: any) => r.status === 'incident' || r.status === 'delayed').length;

    /* Invoices */
    const invArr: any[] = Array.isArray(invoiceData) ? invoiceData : (invoiceData as any)?.items ?? [];
    const pendingInv = invArr.filter((i: any) => i.status === 'ISSUED' || i.status === 'OVERDUE' || i.status === 'PARTIALLY_PAID');
    const pendingTotal = pendingInv.reduce((sum: number, inv: any) => sum + Number(inv.balance ?? inv.amountDue ?? inv.amount ?? 0), 0);

    /* Announcements */
    const annArr: any[] = Array.isArray(announcementData) ? announcementData : (announcementData as any)?.items ?? [];
    const announcements = annArr.slice(0, 5).map((a: any) => ({
      text: a.title ?? a.body ?? '',
      priority: (a.priority === 'warning' || a.priority === 'critical' ? a.priority : 'info') as 'info' | 'warning' | 'critical',
    }));

    /* Compliance alerts */
    const compArr: any[] = Array.isArray(complianceData) ? complianceData : (complianceData as any)?.items ?? [];
    const complianceAlerts = compArr
      .filter((c: any) => c.status !== 'completed' && c.status !== 'resolved')
      .slice(0, 5)
      .map((c: any) => ({
        text: c.description ?? c.title ?? '',
        level: (c.priority === 'critical' || c.severity === 'critical' ? 'critical' : 'warning') as 'warning' | 'critical',
      }));

    return {
      totalStudents,
      activeCourses,
      classesRunning: activeCourses,
      totalClasses: activeCourses || 0,
      absentTeachers,
      transportTrips: { completed: tCompleted, inProgress: tInProgress, pending: tPending, issues: tIssues },
      paymentsDue: { count: pendingInv.length, total: `$${pendingTotal.toLocaleString()}` },
      examsToday,
      announcements,
      complianceAlerts,
    };
  }, [kpis, staffData, examData, transportData, invoiceData, announcementData, complianceData]);

  /* ── Sync into admin-data store ── */
  useEffect(() => {
    updateSnapshot({
      classesRunning: snap.classesRunning,
      totalClasses: snap.totalClasses,
      absentTeachers: snap.absentTeachers,
      transportTrips: snap.transportTrips,
      examsToday: snap.examsToday,
      paymentsDue: snap.paymentsDue,
      announcements: snap.announcements,
      complianceAlerts: snap.complianceAlerts,
    });
  }, [snap, updateSnapshot]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Today's Operations</h2>
        <p className="text-sm text-muted-foreground/60">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Operational blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <OperationBlock icon={BookOpen} label="Classes Running" value={`${snap.classesRunning}/${snap.totalClasses}`} sublabel={`${snap.totalStudents} students enrolled`} />
        <OperationBlock icon={Users} label="Absent Teachers" value={snap.absentTeachers.length} sublabel={snap.absentTeachers.map(t => t.name).join(', ')} color="text-amber-400" />
        <OperationBlock icon={Bus} label="Transport Trips" value={`${snap.transportTrips.completed + snap.transportTrips.inProgress}/${snap.transportTrips.completed + snap.transportTrips.inProgress + snap.transportTrips.pending}`} sublabel={snap.transportTrips.issues > 0 ? `${snap.transportTrips.issues} issue` : 'All OK'} />
        <OperationBlock icon={CreditCard} label="Payments Due" value={snap.paymentsDue.count} sublabel={snap.paymentsDue.total} color="text-red-400" />
      </div>

      {/* Absent teachers detail */}
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Absent Teachers Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {snap.absentTeachers.map(t => (
            <div key={t.name} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border bg-muted px-3 py-2">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground/60">{t.subject}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground/60">Substitute</p>
                <StatusBadge status={t.substitute === 'Unassigned' ? 'Overdue' : 'Active'} />
                <p className="text-xs text-muted-foreground mt-0.5">{t.substitute}</p>
              </div>
            </div>
          ))}
          {snap.absentTeachers.length === 0 && <p className="text-xs text-muted-foreground/60 text-center py-4">All teachers present today.</p>}
        </CardContent>
      </Card>

      {/* Exams today */}
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Exams Scheduled Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {snap.examsToday.map(ex => (
            <div key={ex.subject} className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border bg-muted px-3 py-2">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{ex.subject}</p>
                <p className="text-xs text-muted-foreground/60">{ex.room} - Invigilator: {ex.invigilator}</p>
              </div>
              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400">{ex.time}</Badge>
            </div>
          ))}
          {snap.examsToday.length === 0 && <p className="text-xs text-muted-foreground/60 text-center py-4">No exams scheduled today.</p>}
        </CardContent>
      </Card>

      {/* Announcements & Alerts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Megaphone className="size-4" /> Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snap.announcements.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <div className={`size-1.5 rounded-full mt-1.5 ${a.priority === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <span className="text-muted-foreground">{a.text}</span>
              </div>
            ))}
            {snap.announcements.length === 0 && <p className="text-xs text-muted-foreground/60 text-center py-4">No recent announcements.</p>}
          </CardContent>
        </Card>
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><AlertTriangle className="size-4 text-red-400" /> Compliance Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {snap.complianceAlerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs px-2 py-1.5 rounded ${a.level === 'critical' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                <AlertTriangle className={`size-3 mt-0.5 ${a.level === 'critical' ? 'text-red-400' : 'text-amber-400'}`} />
                <span className={a.level === 'critical' ? 'text-red-400' : 'text-amber-400'}>{a.text}</span>
              </div>
            ))}
            {snap.complianceAlerts.length === 0 && <p className="text-xs text-muted-foreground/60 text-center py-4">No compliance alerts.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────── Approvals View ─────────────── */
function ApprovalsView() {
  const { schoolId } = useAuthStore();
  const { data: approvalRes } = useApprovalHistory(schoolId);
  const approvalItems: any[] = Array.isArray(approvalRes) ? approvalRes : (approvalRes as any)?.items ?? [];
  const [filter, setFilter] = useState<string>('all');
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [rejectDialog, setRejectDialog] = useState<string | null>(null);

  const pendingItems = approvalItems.filter((i: any) => i.status === 'pending');
  const types = ['all', ...new Set(pendingItems.map((i: any) => i.type))];
  const filtered = filter === 'all' ? pendingItems : pendingItems.filter((i: any) => i.type === filter);

  const selected = selectedApproval ? approvalItems.find((a: any) => a.id === selectedApproval) : null;

  const approve = useApproveLeave(schoolId);

  const handleApprove = (id: string) => {
    approve.mutate({ id, status: 'approved' });
  };

  const handleReject = (id: string) => {
    approve.mutate({ id, status: 'rejected' }, { onSuccess: () => setRejectDialog(null) });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Approval Center</h2>
          <p className="text-sm text-muted-foreground/60">{pendingItems.length} items pending approval</p>
        </div>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {types.map(t => (
          <Button
            key={t}
            size="sm"
            variant={filter === t ? 'default' : 'outline'}
            onClick={() => setFilter(t)}
            className={`h-7 text-xs capitalize ${filter === t ? 'bg-accent' : 'border-border text-muted-foreground/70'}`}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item: any, i: number) => (
          <ApprovalCard
            key={item.id}
            item={item}
            index={i}
            onApprove={(id) => handleApprove(id)}
            onReject={(id) => setRejectDialog(id)}
            onView={(id) => setSelectedApproval(id)}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground/60 text-sm">
            No pending approvals. All clear!
          </div>
        )}
      </div>

      {/* Detail panel for viewing approval */}
      <DetailPanel
        open={!!selected}
        onOpenChange={() => setSelectedApproval(null)}
        title={selected?.title ?? ''}
        subtitle={`Requested by ${selected?.requestedBy}`}
        status={selected?.status ?? ''}
        statusVariant={selected?.status === 'approved' ? 'default' : selected?.status === 'rejected' ? 'destructive' : 'secondary'}
        actions={selected?.status === 'pending' ? [
          { label: 'Approve', onClick: () => { handleApprove(selected!.id); setSelectedApproval(null); }, icon: <Check className="size-3" /> },
          { label: 'Reject', onClick: () => setRejectDialog(selected!.id), variant: 'destructive', icon: <X className="size-3" /> },
        ] : []}
      >
        {selected && (
          <DetailFields fields={[
            { label: 'Type', value: selected.type },
            { label: 'Priority', value: <StatusBadge status={selected.priority === 'high' ? 'Pending' : 'Active'} /> },
            { label: 'Requested', value: selected.requestedAt },
            { label: 'Due Date', value: selected.dueDate ?? '—' },
            { label: 'Description', value: selected.description, full: true },
          ]} />
        )}
      </DetailPanel>

      {/* Reject confirmation */}
      <ConfirmDialog
        open={!!rejectDialog}
        onOpenChange={() => setRejectDialog(null)}
        title="Reject Approval"
        description="Are you sure you want to reject this item? This action will be logged."
        variant="destructive"
        confirmLabel="Reject"
        onConfirm={() => handleReject(rejectDialog!)}
      />
    </div>
  );
}

/* ─────────────── Calendar View ─────────────── */
const calendarEventFields: FormField[] = [
  { name: 'title', label: 'Event Title', type: 'text', required: true, placeholder: 'e.g. Parent-Teacher Conference' },
  { name: 'date', label: 'Date', type: 'date', required: true, half: true },
  { name: 'time', label: 'Time', type: 'time', half: true },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [
    { label: 'Meeting', value: 'meeting' }, { label: 'Exam', value: 'exam' },
    { label: 'Event', value: 'event' }, { label: 'Training', value: 'training' },
    { label: 'Holiday', value: 'holiday' }, { label: 'Compliance', value: 'compliance' },
  ]},
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional notes...' },
];
// @ts-expect-error kept for future calendar use
const _typeColors: Record<string, string> = {
  meeting: '#818cf8', exam: '#f59e0b', event: '#ef4444', training: '#10b981', holiday: '#ec4899', compliance: '#ef4444',
};

function CalendarView() {
  const { schoolId } = useAuthStore();
  const { data: eventsRes } = useEvents(schoolId);
  const createEvent = useCreateEvent(schoolId!);
  const deleteEvent = useDeleteEvent();
  const rawEvents = Array.isArray(eventsRes) ? eventsRes : (eventsRes as any)?.items ?? [];
  const calendarEvents: CalendarEvent[] = rawEvents.map((e: any) => ({
    id: e.id, title: e.title ?? e.name ?? '', date: (e.date ?? e.startDate ?? '').slice(0, 10),
    time: e.time ?? e.startTime ?? '', type: e.type ?? 'event', color: e.color ?? '#818cf8',
    description: e.description ?? '',
  }));
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === dateStr);
  };

  const handleAddEvent = (data: Record<string, any>) => {
    createEvent.mutate({ title: data.title ?? '', description: data.description ?? '', startDate: data.date ?? data.startDate ?? new Date().toISOString(), endDate: data.date ?? data.endDate ?? new Date().toISOString(), type: data.type ?? 'event' } as any, { onSuccess: () => setShowAdd(false) });
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent.mutate(id, { onSuccess: () => { setConfirmDelete(null); setSelectedEvent(null); } });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">School Calendar</h2>
          <p className="text-sm text-muted-foreground/60">{today.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)} className="h-8">
          <Plus className="size-3.5 mr-1.5" /> Add Event
        </Button>
      </div>

      {/* Calendar grid */}
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardContent className="pt-4">
          <div className="grid grid-cols-7 gap-px">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/60 uppercase pb-2">{d}</div>
            ))}
            {blanks.map(b => <div key={`b-${b}`} />)}
            {days.map(day => {
              const dayEvents = getEventsForDay(day);
              const isToday = day === today.getDate();
              return (
                <div
                  key={day}
                  className={`min-h-18 p-1 rounded-md border transition-colors ${
                    isToday ? 'border-blue-500/30 bg-blue-500/5' : 'border-border hover:bg-muted'
                  }`}
                >
                  <span className={`text-xs ${isToday ? 'font-bold text-blue-400' : 'text-muted-foreground/70'}`}>{day}</span>
                  <div className="space-y-0.5 mt-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: ev.color + '20', color: ev.color }}
                        onClick={() => setSelectedEvent(ev)}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-muted-foreground/50 pl-1">+{dayEvents.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming events list */}
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {calendarEvents
            .filter(e => new Date(e.date) >= today)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 6)
            .map(ev => (
              <div key={ev.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card hover:bg-accent transition-colors cursor-pointer" onClick={() => setSelectedEvent(ev)}>
                <div className="size-2 rounded-full" style={{ backgroundColor: ev.color }} />
                <div className="flex-1">
                  <p className="text-sm text-foreground/80">{ev.title}</p>
                  <p className="text-xs text-muted-foreground/60">{ev.type}</p>
                </div>
                <span className="text-xs text-muted-foreground/60">{new Date(ev.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            ))}
          {calendarEvents.length === 0 && (
            <p className="text-xs text-muted-foreground/60 text-center py-4">No upcoming events.</p>
          )}
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <FormDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        title="New Calendar Event"
        mode="create"
        fields={calendarEventFields}
        onSubmit={handleAddEvent}
      />

      {/* Event Detail Panel */}
      <DetailPanel
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
        title={selectedEvent?.title ?? ''}
        subtitle={selectedEvent?.type}
        actions={[
          { label: 'Delete', onClick: () => setConfirmDelete(selectedEvent!.id), variant: 'destructive' },
        ]}
      >
        {selectedEvent && (
          <DetailFields fields={[
            { label: 'Date', value: new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
            { label: 'Time', value: selectedEvent.time ?? 'All day' },
            { label: 'Type', value: <Badge variant="outline">{selectedEvent.type}</Badge> },
            ...(selectedEvent.description ? [{ label: 'Description', value: selectedEvent.description, full: true }] : []),
          ]} />
        )}
      </DetailPanel>

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
        title="Delete Event"
        description="Are you sure you want to delete this calendar event?"
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={() => handleDeleteEvent(confirmDelete!)}
      />
    </div>
  );
}

/* ─────────────── Issues & Exceptions View ─────────────── */
function IssuesView() {
  const { schoolId } = useAuthStore();
  const { data: compRes } = useComplianceTasks(schoolId);
  const rawTasks = Array.isArray(compRes) ? compRes : (compRes as any)?.items ?? [];
  const issues: SchoolIssue[] = rawTasks.map((t: any) => ({
    id: t.id, type: t.type ?? t.category ?? 'general', desc: t.description ?? t.title ?? '',
    severity: (t.severity ?? t.priority ?? 'medium') as SchoolIssue['severity'],
    status: t.status ?? 'open', reportedAt: t.createdAt ?? t.reportedAt ?? '',
    assignee: t.assignee ?? t.assignedTo ?? undefined,
  }));
  const updateTask = useUpdateComplianceTask(schoolId);
  const [selectedIssue, setSelectedIssue] = useState<SchoolIssue | null>(null);

  const openIssues = issues.filter(i => i.status !== 'resolved');

  const handleResolve = (id: string) => {
    updateTask.mutate({ id, status: 'resolved' } as any, {
      onSuccess: () => notifySuccess('Resolved', `Issue ${id} marked as resolved`),
    });
    setSelectedIssue(null);
  };

  const handleAssign = (id: string) => {
    updateTask.mutate({ id, assignee: 'current_user' } as any, {
      onSuccess: () => notifySuccess('Assigned', `Issue ${id} assigned to you`),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Issues & Exceptions</h2>
          <p className="text-sm text-muted-foreground/60">{openIssues.length} open issues requiring attention</p>
        </div>
        <Badge variant="outline" className="border-red-500/30 text-red-400">
          {openIssues.filter(i => i.severity === 'critical').length} critical
        </Badge>
      </div>

      <div className="space-y-2">
        {openIssues.map((issue) => (
          <div
            key={issue.id}
            className={`rounded-xl border-l-2 border border-border p-4 transition-all hover:bg-muted cursor-pointer ${severityColors[issue.severity]}`}
            onClick={() => setSelectedIssue(issue)}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] h-5 border-border text-muted-foreground/70">{issue.type}</Badge>
                  <StatusBadge status={issue.severity === 'critical' ? 'Overdue' : issue.severity === 'high' ? 'Pending' : 'Active'} />
                  {issue.status === 'assigned' && <Badge variant="secondary" className="text-[10px] h-5">Assigned</Badge>}
                </div>
                <p className="text-sm text-foreground/80">{issue.desc}</p>
              </div>
              <div className="flex items-center gap-1 ml-2">
                {issue.status === 'open' && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground/60" onClick={(e) => { e.stopPropagation(); handleAssign(issue.id); }}>
                    Assign
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-7 text-xs text-green-500" onClick={(e) => { e.stopPropagation(); handleResolve(issue.id); }}>
                  Resolve <ChevronRight className="size-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {openIssues.length === 0 && (
          <div className="text-center py-8 text-muted-foreground/60 text-sm">
            No open issues. Everything is running smoothly!
          </div>
        )}
      </div>

      {/* Issue detail panel */}
      <DetailPanel
        open={!!selectedIssue}
        onOpenChange={() => setSelectedIssue(null)}
        title={selectedIssue?.type ?? ''}
        subtitle={selectedIssue?.desc}
        status={selectedIssue?.status ?? ''}
        actions={selectedIssue?.status !== 'resolved' ? [
          { label: 'Resolve', onClick: () => handleResolve(selectedIssue!.id), icon: <Check className="size-3" /> },
          ...(selectedIssue?.status === 'open' ? [{ label: 'Assign to Me', onClick: () => handleAssign(selectedIssue!.id), variant: 'outline' as const }] : []),
        ] : []}
      >
        {selectedIssue && (
          <DetailFields fields={[
            { label: 'Severity', value: <StatusBadge status={selectedIssue.severity === 'critical' ? 'Overdue' : selectedIssue.severity === 'high' ? 'Pending' : 'Active'} /> },
            { label: 'Status', value: selectedIssue.status },
            { label: 'Reported', value: selectedIssue.reportedAt },
            { label: 'Assignee', value: selectedIssue.assignee ?? 'Unassigned' },
            { label: 'Description', value: selectedIssue.desc, full: true },
          ]} />
        )}
      </DetailPanel>
    </div>
  );
}

/* ═════════════════ MAIN COMPONENT ═════════════════ */
export function ControlCenterSection() {
  const { activeHeader } = useNavigationStore();
  const navigate = useNavigationStore(s => s.navigate);
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'today_snapshot': return <TodaySnapshotView />;
      case 'approvals': return <ApprovalsView />;
      case 'calendar': return <CalendarView />;
      case 'issues': return <IssuesView />;
      default: return <ActionInboxView />;
    }
  })();

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Quick Create Drawer */}
      <div data-animate className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Operations Control Center</h1>
          <p className="text-xs text-muted-foreground/60">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            {' - '}Greenfield International Academy
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="size-3.5 mr-1.5" /> Quick Create
            </Button>
          </SheetTrigger>
          <SheetContent className="border-border bg-card">
            <SheetHeader>
              <SheetTitle className="text-foreground">Quick Create</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 mt-4">
              {quickCreateActions.map(a => {
                const Icon = a.icon;
                return (
                  <Button
                    key={a.id}
                    variant="outline"
                    className="w-full justify-start gap-3 h-11 border-border text-muted-foreground hover:text-foreground hover:border-border"
                    onClick={() => navigate(a.section)}
                  >
                    <Icon className="size-4" />
                    {a.label}
                  </Button>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* KPI Stats Strip */}
      <div data-animate>
        <AdminStatsStrip />
      </div>

      <div data-animate>{content}</div>
    </div>
  );
}
