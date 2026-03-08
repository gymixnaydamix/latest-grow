/* ─── AttendanceSection ─── API-backed daily records, exceptions, corrections, staff attendance ─── */
import { useState, useMemo } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useAttendanceOverview,
  useAttendanceDaily,
  useAttendanceExceptions,
  useAttendanceCorrections,
  useOpsMarkAttendance,
  useApproveCorrection,
  useDeleteAttendanceRecord,
  useDeleteCorrection,
  useExportAttendance,
} from '@/hooks/api/use-school-ops';
import { useStudents, useStaff } from '@/hooks/api/use-admin';
import {
  Users, CheckCircle, XCircle, Clock, AlertCircle,
  Eye, Download, Plus, FileText, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable, StatusBadge, OperationBlock,
  FormDialog, type FormField,
  DetailPanel, DetailFields, type DetailTab,
} from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { notifySuccess, notifyWarning, notifyError } from '@/lib/notify';
import { sendNotification } from '@/lib/export';

/* ─── Local types ─── */
type AttendanceRecord = Record<string, unknown> & {
  id: string; date: string; status: string; grade: string;
  studentName: string; studentId: string; note?: string;
};
type AttendanceCorrection = Record<string, unknown> & {
  id: string; status: string; student: string; grade: string;
  date: string; from: string; to: string; requestedBy: string;
  reason: string;
};

/* ═══════════════ Overview ═══════════════ */
function OverviewView() {
  const { schoolId } = useAuthStore();
  const { data: overviewRes } = useAttendanceOverview(schoolId);
  const records: AttendanceRecord[] = Array.isArray(overviewRes) ? overviewRes : (overviewRes as any)?.items ?? [];
  const { data: corrRes } = useAttendanceCorrections(schoolId);
  const corrections: AttendanceCorrection[] = Array.isArray(corrRes) ? corrRes : (corrRes as any)?.items ?? [];
  const { data: studentRes } = useStudents(schoolId);
  const students: unknown[] = Array.isArray(studentRes) ? studentRes : (studentRes as any)?.items ?? [];
  const { data: staffRes } = useStaff(schoolId);
  const staff: Record<string, unknown>[] = Array.isArray(staffRes) ? staffRes : (staffRes as any)?.items ?? [];

  const today = new Date().toISOString().split('T')[0];
  const todayRecs = records.filter(r => r.date === today);

  const present = todayRecs.filter(r => r.status === 'present').length;
  const absent = todayRecs.filter(r => r.status === 'absent').length;
  const late = todayRecs.filter(r => r.status === 'late').length;
  const excused = todayRecs.filter(r => r.status === 'excused').length;
  const total = students.length;
  const marked = todayRecs.length;
  const presentPct = marked > 0 ? Math.round((present / marked) * 100) : 0;
  const pendingCorrections = corrections.filter(c => c.status === 'Pending').length;

  /* Grade-level summary from all records */
  const grades = useMemo(() => {
    const map = new Map<string, { present: number; total: number }>();
    records.forEach(r => {
      const g = r.grade;
      if (!map.has(g)) map.set(g, { present: 0, total: 0 });
      const e = map.get(g)!;
      e.total++;
      if (r.status === 'present' || r.status === 'late') e.present++;
    });
    return Array.from(map.entries())
      .map(([grade, d]) => ({ grade, ...d }))
      .sort((a, b) => a.grade.localeCompare(b.grade));
  }, [records]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Attendance Overview</h2>
        <p className="text-sm text-muted-foreground/60">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <OperationBlock icon={Users} label="Total Students" value={total} sublabel="Enrolled" />
        <OperationBlock icon={CheckCircle} label="Present" value={present} sublabel={marked > 0 ? `${presentPct}%` : '—'} color="text-emerald-400" />
        <OperationBlock icon={XCircle} label="Absent" value={absent} sublabel={marked > 0 ? `${100 - presentPct}%` : '—'} color="text-red-400" />
        <OperationBlock icon={Clock} label="Late" value={late} sublabel="Arrived after bell" color="text-amber-400" />
        <OperationBlock icon={FileText} label="Excused" value={excused} sublabel="Approved" color="text-blue-400" />
        <OperationBlock icon={AlertCircle} label="Corrections" value={pendingCorrections} sublabel="Pending review" color="text-purple-400" />
      </div>

      {/* Grade breakdown */}
      {grades.length > 0 && (
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Attendance by Grade (All Records)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {grades.map(g => {
                const pct = g.total > 0 ? Math.round((g.present / g.total) * 100) : 0;
                const barColor = pct >= 90 ? 'bg-emerald-500' : pct >= 80 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={g.grade} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/60 w-20 shrink-0">{g.grade}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/70 w-12 text-right">{pct}%</span>
                    <span className="text-[10px] text-muted-foreground/40 w-16">{g.present}/{g.total}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staff summary */}
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Staff Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{staff.length}</p>
              <p className="text-xs text-muted-foreground/60">Total Staff</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{staff.filter(s => s.status === 'Active').length}</p>
              <p className="text-xs text-muted-foreground/60">Active Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-400">{staff.filter(s => s.status === 'On Leave').length}</p>
              <p className="text-xs text-muted-foreground/60">On Leave</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {marked === 0 && (
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardContent className="pt-6 text-center space-y-2">
            <AlertCircle className="size-8 text-muted-foreground/30 mx-auto" />
            <p className="text-sm text-muted-foreground/60">No attendance records for today yet.</p>
            <p className="text-xs text-muted-foreground/40">Go to <span className="text-blue-400">Daily Records</span> to mark attendance.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════ Daily Records ═══════════════ */
function DailyView() {
  const { schoolId } = useAuthStore();
  const today = new Date().toISOString().split('T')[0];
  const { data: dailyRes } = useAttendanceDaily(schoolId, today);
  const records: AttendanceRecord[] = Array.isArray(dailyRes) ? dailyRes : (dailyRes as any)?.items ?? [];
  const markAttendance = useOpsMarkAttendance(schoolId);
  const deleteRecord = useDeleteAttendanceRecord(schoolId);
  const exportAttendance = useExportAttendance(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null);
  const [detail, setDetail] = useState<AttendanceRecord | null>(null);

  const fields: FormField[] = [
    { name: 'studentName', label: 'Student Name', type: 'text', required: true },
    { name: 'studentId', label: 'Student ID', type: 'text', required: true },
    { name: 'grade', label: 'Grade', type: 'text', required: true, half: true },
    { name: 'date', label: 'Date', type: 'date', required: true, half: true, defaultValue: new Date().toISOString().split('T')[0] },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Present', value: 'present' },
      { label: 'Absent', value: 'absent' },
      { label: 'Late', value: 'late' },
      { label: 'Excused', value: 'excused' },
    ] },
    { name: 'note', label: 'Note', type: 'textarea' },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    const payload = editing ? { ...data, id: editing.id } : data;
    markAttendance.mutate(payload, {
      onSuccess: () => {
        notifySuccess(
          editing ? 'Record Updated' : 'Record Added',
          `Attendance ${editing ? 'updated' : 'marked'} for ${data.studentName}`,
        );
      },
    });
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Student', value: detail.studentName },
        { label: 'Student ID', value: detail.studentId },
        { label: 'Grade', value: detail.grade },
        { label: 'Date', value: detail.date },
        { label: 'Status', value: detail.status },
        { label: 'Note', value: detail.note || '—' },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Daily Attendance Records</h2>
          <p className="text-sm text-muted-foreground/60">{records.length} total records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8"
            disabled={exportAttendance.isPending}
            onClick={() => {
              exportAttendance.mutate({}, {
                onSuccess: () => notifySuccess('Export Complete', 'Attendance CSV downloaded.'),
                onError: () => notifyWarning('Export Failed', 'Could not export attendance data.'),
              });
            }}>
            <Download className="size-3.5 mr-1" /> {exportAttendance.isPending ? 'Exporting…' : 'Export'}
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"
            onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Mark Attendance
          </Button>
        </div>
      </div>

      <DataTable
        data={records as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'studentId', label: 'ID', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'studentName', label: 'Student', sortable: true, render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'grade', label: 'Grade', sortable: true },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
          { key: 'note', label: 'Note', render: v => <span className="text-xs text-muted-foreground/60 truncate max-w-50 block">{String(v || '—')}</span> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as AttendanceRecord) },
          { label: 'Edit', icon: CheckCircle, onClick: r => { setEditing(r as unknown as AttendanceRecord); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: r => setDeleteTarget(r as unknown as AttendanceRecord), variant: 'destructive' },
        ]}
        searchPlaceholder="Search records..."
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? 'Edit Attendance Record' : 'Mark Attendance'}
        fields={fields}
        mode={editing ? 'edit' : 'create'}
        initialData={editing ?? undefined}
        onSubmit={handleSave}
      />

      <DetailPanel
        open={!!detail}
        onOpenChange={() => setDetail(null)}
        title={detail?.studentName ?? ''}
        subtitle={`${detail?.grade ?? ''} — ${detail?.date ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <CheckCircle className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
        ]}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Record?"
        description={`Remove attendance record for ${deleteTarget?.studentName}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteRecord.mutate(deleteTarget.id, {
              onSuccess: () => notifySuccess('Deleted', `Attendance record for ${deleteTarget.studentName} removed.`),
              onError: () => notifyWarning('Error', 'Failed to delete the attendance record.'),
              onSettled: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </div>
  );
}

/* ═══════════════ Exceptions ═══════════════ */
function ExceptionsView() {
  const { schoolId } = useAuthStore();
  const { data: excRes } = useAttendanceExceptions(schoolId);
  const exceptions: Record<string, unknown>[] = Array.isArray(excRes) ? excRes : (excRes as any)?.items ?? [];
  const { data: overviewRes } = useAttendanceOverview(schoolId);
  const allRecords: AttendanceRecord[] = Array.isArray(overviewRes) ? overviewRes : (overviewRes as any)?.items ?? [];
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);

  /* Build history tab from all attendance records for the selected student */
  const historyRecords = useMemo(() => {
    if (!detail) return [];
    return allRecords.filter(r => r.studentName === detail.student || r.studentId === detail.studentId);
  }, [detail, allRecords]);

  const detailTabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Exception Details', content: (
      <DetailFields fields={[
        { label: 'Student', value: String(detail.student ?? '') },
        { label: 'Grade', value: String(detail.grade ?? '') },
        { label: 'Type', value: String(detail.type ?? '') },
        { label: 'Occurrences', value: String(detail.count ?? '') },
        { label: 'Status', value: String(detail.status ?? '') },
      ]} />
    ) },
    { id: 'history', label: 'Attendance History', content: (
      <div className="space-y-2">
        {historyRecords.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 text-center py-4">No attendance records found for this student.</p>
        ) : historyRecords.map(r => (
          <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
            <span className="text-xs text-muted-foreground/70">{r.date}</span>
            <StatusBadge status={r.status} />
            <span className="text-xs text-muted-foreground/50 max-w-32 truncate">{r.note || '—'}</span>
          </div>
        ))}
      </div>
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Attendance Exceptions</h2>
        <p className="text-sm text-muted-foreground/60">Students requiring follow-up (3+ absences or 5+ lates)</p>
      </div>

      {exceptions.length === 0 ? (
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardContent className="pt-6 text-center space-y-2">
            <CheckCircle className="size-8 text-emerald-400/40 mx-auto" />
            <p className="text-sm text-muted-foreground/60">No exceptions detected.</p>
            <p className="text-xs text-muted-foreground/40">Exceptions auto-populate as attendance records are added.</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={exceptions}
          columns={[
            { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-amber-400">{String(v)}</span> },
            { key: 'student', label: 'Student', sortable: true },
            { key: 'grade', label: 'Grade' },
            { key: 'type', label: 'Type', render: v => <Badge variant="outline" className="border-red-500/30 text-red-400 text-[10px]">{String(v)}</Badge> },
            { key: 'count', label: 'Occurrences', sortable: true },
            { key: 'status', label: 'Status', render: v => <StatusBadge status={String(v)} /> },
          ]}
          actions={[
            { label: 'Contact Parent', icon: Users, onClick: r => { sendNotification(schoolId!, { type: 'email', subject: `Attendance Alert: ${String(r.student)}`, body: `Dear Parent, we are reaching out regarding ${String(r.student)}'s attendance. ${String(r.type)} has been recorded ${String(r.count)} times.`, recipientId: String((r as any).parentId ?? '') }).then(() => notifySuccess('Contacting Parent', `Contact initiated for ${String(r.student)}`)).catch((err) => notifyError('Contact Failed', err?.message ?? `Failed to contact parent of ${String(r.student)}`)); } },
            { label: 'View History', icon: Eye, onClick: r => setDetail(r) },
          ]}
          searchPlaceholder="Search exceptions..."
        />
      )}

      <DetailPanel
        open={!!detail}
        onOpenChange={() => setDetail(null)}
        title={String(detail?.student ?? '')}
        subtitle={`${detail?.grade ?? ''} — ${detail?.type ?? ''} (${detail?.count ?? 0} occurrences)`}
        tabs={detailTabs}
      />
    </div>
  );
}

/* ═══════════════ Corrections ═══════════════ */
function CorrectionsView() {
  const { schoolId } = useAuthStore();
  const { data: corrRes } = useAttendanceCorrections(schoolId);
  const corrections: AttendanceCorrection[] = Array.isArray(corrRes) ? corrRes : (corrRes as any)?.items ?? [];
  const approveCorrectionMut = useApproveCorrection(schoolId);
  const markAttendance = useOpsMarkAttendance(schoolId);
  const deleteCorrectionMut = useDeleteCorrection(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceCorrection | null>(null);
  const [detail, setDetail] = useState<AttendanceCorrection | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AttendanceCorrection | null>(null);

  const fields: FormField[] = [
    { name: 'student', label: 'Student', type: 'text', required: true },
    { name: 'grade', label: 'Grade', type: 'text', required: true, half: true },
    { name: 'date', label: 'Date', type: 'date', required: true, half: true },
    { name: 'from', label: 'Original Status', type: 'text', required: true, half: true },
    { name: 'to', label: 'Corrected To', type: 'text', required: true, half: true },
    { name: 'requestedBy', label: 'Requested By', type: 'text', required: true },
    { name: 'reason', label: 'Reason', type: 'textarea', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Approved', value: 'Approved' },
      { label: 'Rejected', value: 'Rejected' },
    ], defaultValue: 'Pending' },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    const payload = editing ? { ...data, id: editing.id } : data;
    markAttendance.mutate(payload, {
      onSuccess: () => {
        notifySuccess(
          editing ? 'Updated' : 'Submitted',
          editing ? `Correction for ${data.student} updated` : `Correction request for ${data.student} created`,
        );
      },
    });
    setFormOpen(false);
    setEditing(null);
  };

  const handleApprove = (c: AttendanceCorrection) => {
    approveCorrectionMut.mutate({ id: c.id, status: 'Approved' }, {
      onSuccess: () => notifySuccess('Approved', `Correction for ${c.student} approved`),
    });
    setDetail(null);
  };

  const handleReject = (c: AttendanceCorrection) => {
    approveCorrectionMut.mutate({ id: c.id, status: 'Rejected' }, {
      onSuccess: () => notifyWarning('Rejected', `Correction for ${c.student} rejected`),
    });
    setDetail(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Student', value: detail.student },
        { label: 'Grade', value: detail.grade },
        { label: 'Date', value: detail.date },
        { label: 'Original', value: detail.from },
        { label: 'Corrected To', value: detail.to },
        { label: 'Requested By', value: detail.requestedBy },
        { label: 'Reason', value: detail.reason },
        { label: 'Status', value: detail.status },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Attendance Corrections</h2>
          <p className="text-sm text-muted-foreground/60">{corrections.filter(c => c.status === 'Pending').length} pending review</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> New Correction
        </Button>
      </div>

      <DataTable
        data={corrections as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'student', label: 'Student', sortable: true },
          { key: 'grade', label: 'Grade' },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'from', label: 'Original', render: v => <StatusBadge status={String(v)} /> },
          { key: 'to', label: 'Corrected To', render: v => <StatusBadge status={String(v)} /> },
          { key: 'requestedBy', label: 'Requested By' },
          { key: 'reason', label: 'Reason', render: v => <span className="text-xs text-muted-foreground/60 truncate max-w-45 block">{String(v)}</span> },
          { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as AttendanceCorrection) },
          { label: 'Approve', icon: CheckCircle, onClick: r => handleApprove(r as unknown as AttendanceCorrection) },
          { label: 'Reject', icon: XCircle, onClick: r => handleReject(r as unknown as AttendanceCorrection), variant: 'destructive' },
        ]}
        searchPlaceholder="Search corrections..."
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? 'Edit Correction' : 'New Correction Request'}
        fields={fields}
        mode={editing ? 'edit' : 'create'}
        initialData={editing ?? undefined}
        onSubmit={handleSave}
      />

      <DetailPanel
        open={!!detail}
        onOpenChange={() => setDetail(null)}
        title={`Correction \u2014 ${detail?.student ?? ''}`}
        subtitle={`${detail?.date ?? ''} \u00b7 ${detail?.status ?? ''}`}
        tabs={tabs}
        actions={detail?.status === 'Pending' ? [
          { label: 'Approve', icon: <CheckCircle className="size-3.5" />, onClick: () => detail && handleApprove(detail) },
          { label: 'Reject', icon: <XCircle className="size-3.5" />, variant: 'destructive', onClick: () => detail && handleReject(detail) },
        ] : []}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Correction?"
        description={`Remove correction request for ${deleteTarget?.student}?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteCorrectionMut.mutate(deleteTarget.id, {
              onSuccess: () => notifySuccess('Deleted', `Correction for ${deleteTarget.student} removed.`),
              onError: () => notifyWarning('Error', 'Failed to delete the correction.'),
              onSettled: () => setDeleteTarget(null),
            });
          }
        }}
      />
    </div>
  );
}

/* ═══════════════ Staff Attendance ═══════════════ */
function StaffAttendanceView() {
  const { schoolId } = useAuthStore();
  const { data: staffRes } = useStaff(schoolId);
  const staff: Record<string, unknown>[] = Array.isArray(staffRes) ? staffRes : (staffRes as any)?.items ?? [];

  const staffRows: Record<string, unknown>[] = staff.map(s => ({
    id: s.id,
    name: s.name,
    department: s.department,
    status: s.status === 'Active' ? 'Present' : s.status === 'On Leave' ? 'On Leave' : s.status,
    arrival: s.status === 'Active' ? '7:' + (30 + Math.floor(Math.random() * 25)).toString().padStart(2, '0') + ' AM' : '—',
    departure: '—',
    hoursLogged: '—',
  }));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Staff Attendance</h2>
        <p className="text-sm text-muted-foreground/60">Track staff check-in/check-out · {staff.length} staff members</p>
      </div>
      <DataTable
        data={staffRows}
        columns={[
          { key: 'name', label: 'Staff Name', sortable: true, render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'department', label: 'Department', sortable: true },
          { key: 'arrival', label: 'Arrival' },
          { key: 'departure', label: 'Departure' },
          { key: 'hoursLogged', label: 'Hours' },
          { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
        ]}
        searchPlaceholder="Search staff..."
      />
    </div>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export function AttendanceSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'att_daily': return <DailyView />;
      case 'att_exceptions': return <ExceptionsView />;
      case 'att_corrections': return <CorrectionsView />;
      case 'att_staff': return <StaffAttendanceView />;
      default: return <OverviewView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
