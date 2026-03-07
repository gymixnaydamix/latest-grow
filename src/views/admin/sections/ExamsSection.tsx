/* ─── ExamsSection ─── Schedule, gradebook, missing marks, results, report cards ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useExamSchedule, useCreateExam, useUpdateMarks, useDeleteExam,
} from '@/hooks/api/use-school-ops';
import {
  CheckCircle, AlertCircle, Eye, Download,
  Plus, Edit, Award, BarChart3,
  BookOpen, Users, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable, StatusBadge, OperationBlock,
  FormDialog, DetailPanel, DetailFields,
} from '@/components/features/school-admin';
import type { FormField, DetailTab } from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { notifySuccess, notifyError } from '@/lib/notify';

/* ─── Form fields ─── */
const examFields: FormField[] = [
  { name: 'subject', label: 'Subject', type: 'select', required: true, options: [
    { label: 'Mathematics', value: 'Mathematics' }, { label: 'English Literature', value: 'English Literature' },
    { label: 'Physics', value: 'Physics' }, { label: 'Chemistry', value: 'Chemistry' },
    { label: 'Biology', value: 'Biology' }, { label: 'History', value: 'History' },
  ], half: true },
  { name: 'grade', label: 'Grade', type: 'select', required: true, options: [
    { label: 'Grade 8', value: 'Grade 8' }, { label: 'Grade 9', value: 'Grade 9' },
    { label: 'Grade 10', value: 'Grade 10' }, { label: 'Grade 11', value: 'Grade 11' },
    { label: 'Grade 12', value: 'Grade 12' },
  ], half: true },
  { name: 'date', label: 'Date', type: 'date', required: true, half: true },
  { name: 'time', label: 'Time', type: 'text', required: true, placeholder: '09:00-11:00', half: true },
  { name: 'duration', label: 'Duration', type: 'text', placeholder: '2h', half: true },
  { name: 'room', label: 'Room / Hall', type: 'text', required: true, placeholder: 'Hall A', half: true },
  { name: 'invigilator', label: 'Invigilator', type: 'text', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Scheduled', value: 'Scheduled' }, { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }, { label: 'Cancelled', value: 'Cancelled' },
  ] },
];

/* ── Schedule ── */
type ExamRow = Record<string, unknown> & { id: string; subject?: string; status?: string; grade?: string; date?: string; time?: string; duration?: string; room?: string; invigilator?: string; };

function ScheduleView() {
  const { schoolId } = useAuthStore();
  const { data: examScheduleRes, isLoading } = useExamSchedule(schoolId);
  const exams = ((examScheduleRes as any)?.items ?? examScheduleRes ?? []) as ExamRow[];
  const createExam = useCreateExam(schoolId);
  const updateMarks = useUpdateMarks(schoolId);
  const deleteExam = useDeleteExam(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<ExamRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ExamRow | null>(null);

  const handleSubmit = (data: Record<string, unknown>) => {
    if (formMode === 'create') {
      createExam.mutate(data, {
        onSuccess: () => notifySuccess('Exam Scheduled', `${String(data.subject || '')} — ${String(data.grade || '')}`),
      });
    } else if (editData) {
      const id = String(editData.id);
      updateMarks.mutate({ id, ...data } as any, {
        onSuccess: () => notifySuccess('Exam Updated', 'Schedule updated'),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteExam.mutate(deleteTarget.id, {
      onSuccess: () => notifySuccess('Exam Removed', `${deleteTarget.subject ?? ''} exam deleted`),
      onError: (err) => notifyError('Delete Failed', err.message),
    });
    setDeleteTarget(null);
  };

  const detailTabs: DetailTab[] = selected ? [
    { id: 'info', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Subject', value: selected.subject ?? '' },
        { label: 'Grade', value: selected.grade ?? '' },
        { label: 'Date', value: selected.date ?? '' },
        { label: 'Time', value: selected.time ?? '' },
        { label: 'Duration', value: selected.duration || '\u2014' },
        { label: 'Room', value: selected.room ?? '' },
        { label: 'Invigilator', value: selected.invigilator ?? '' },
        { label: 'Status', value: <StatusBadge status={selected.status ?? ''} /> },
      ]} />
    )},
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Exam Schedule</h2>
          <p className="text-sm text-muted-foreground/60">{isLoading ? 'Loading...' : `${exams.length} exams this term`}</p>
        </div>
        <PermissionGate requires="exams.write">
          <Button size="sm" className="h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Schedule Exam
          </Button>
        </PermissionGate>
      </div>
      <DataTable<ExamRow>
        data={exams}
        columns={[
          { key: 'id', label: 'Exam ID', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'subject', label: 'Subject', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'grade', label: 'Grade', sortable: true },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'time', label: 'Time' },
          { key: 'duration', label: 'Duration' },
          { key: 'room', label: 'Room' },
          { key: 'invigilator', label: 'Invigilator' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: (r) => { setSelected(r as ExamRow); setDetailOpen(true); } },
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as ExamRow) },
        ]}
        searchPlaceholder="Search exams..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Schedule Exam' : 'Edit Exam'} mode={formMode} fields={examFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Schedule' : 'Save Changes'} />

      <DetailPanel open={detailOpen} onOpenChange={setDetailOpen} title={selected ? `${selected.subject ?? ''} — ${selected.grade ?? ''}` : ''} subtitle={`${selected?.date || ''} \u00b7 ${selected?.time || ''}`} status={selected?.status} tabs={detailTabs} actions={[
        { label: 'Edit', onClick: () => { setDetailOpen(false); if (selected) { setEditData(selected as unknown as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } } },
      ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Remove Exam" description={`Remove ${deleteTarget?.subject ?? ''} exam for ${deleteTarget?.grade ?? ''}?`} confirmLabel="Remove" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ── Marks form fields ── */
const marksFields: FormField[] = [
  { name: 'obtained', label: 'Marks Obtained', type: 'number', required: true, placeholder: '0' },
  { name: 'maxMarks', label: 'Max Marks', type: 'number', required: true, placeholder: '100' },
  { name: 'grade', label: 'Grade', type: 'select', options: [
    { label: 'A+', value: 'A+' }, { label: 'A', value: 'A' }, { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' }, { label: 'B', value: 'B' }, { label: 'B-', value: 'B-' },
    { label: 'C+', value: 'C+' }, { label: 'C', value: 'C' }, { label: 'D', value: 'D' },
    { label: 'F', value: 'F' },
  ] },
  { name: 'remarks', label: 'Remarks', type: 'text', placeholder: 'Optional comments' },
];

/* ── Gradebook ── */
function GradebookView() {
  const { schoolId } = useAuthStore();
  const updateMarks = useUpdateMarks(schoolId);
  const [marksFormOpen, setMarksFormOpen] = useState(false);
  const [marksTarget, setMarksTarget] = useState<Record<string, unknown> | null>(null);
  const [selectedExam] = useState('Mid-Term Exam');
  const grades = [
    { id: 'G-001', rollNo: 'R-001', name: 'Alice Thompson', subject: 'Mathematics', maxMarks: 100, obtained: 92, grade: 'A', percentage: '92%', status: 'Graded' },
    { id: 'G-002', rollNo: 'R-002', name: 'Alice Thompson', subject: 'English', maxMarks: 100, obtained: 88, grade: 'A-', percentage: '88%', status: 'Graded' },
    { id: 'G-003', rollNo: 'R-003', name: 'Bob Chen', subject: 'Mathematics', maxMarks: 100, obtained: 76, grade: 'B+', percentage: '76%', status: 'Graded' },
    { id: 'G-004', rollNo: 'R-004', name: 'Bob Chen', subject: 'English', maxMarks: 100, obtained: 82, grade: 'B+', percentage: '82%', status: 'Graded' },
    { id: 'G-005', rollNo: 'R-005', name: 'Carlos Rivera', subject: 'Mathematics', maxMarks: 100, obtained: 0, grade: '\u2014', percentage: '\u2014', status: 'Missing' },
    { id: 'G-006', rollNo: 'R-006', name: 'Diana Patel', subject: 'Mathematics', maxMarks: 100, obtained: 95, grade: 'A+', percentage: '95%', status: 'Graded' },
    { id: 'G-007', rollNo: 'R-007', name: 'Diana Patel', subject: 'English', maxMarks: 100, obtained: 91, grade: 'A', percentage: '91%', status: 'Graded' },
    { id: 'G-008', rollNo: 'R-008', name: 'Ethan Brown', subject: 'Science', maxMarks: 100, obtained: 68, grade: 'B-', percentage: '68%', status: 'Graded' },
  ] as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gradebook</h2>
          <p className="text-sm text-muted-foreground/60">{selectedExam} &mdash; Enter and review marks</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-8 text-xs bg-muted border border-border rounded-md px-2 text-muted-foreground">
            <option>Mid-Term Exam</option>
            <option>Unit Test 1</option>
            <option>Final Exam</option>
          </select>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8" onClick={() => notifySuccess('Exported', 'Gradebook exported to CSV')}>
            <Download className="size-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>
      <DataTable
        data={grades}
        columns={[
          { key: 'rollNo', label: 'Roll #', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Student', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'subject', label: 'Subject', sortable: true },
          { key: 'maxMarks', label: 'Max' },
          { key: 'obtained', label: 'Obtained', sortable: true, render: (v) => {
            const num = Number(v);
            const color = num === 0 ? 'text-red-400' : num >= 80 ? 'text-emerald-400' : num >= 60 ? 'text-amber-400' : 'text-red-400';
            return <span className={`font-mono ${color}`}>{String(v)}</span>;
          }},
          { key: 'grade', label: 'Grade', render: (v) => <Badge variant="outline" className="border-border text-muted-foreground">{String(v)}</Badge> },
          { key: 'percentage', label: '%' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Edit Marks', icon: Edit, onClick: (r) => { setMarksTarget(r as Record<string, unknown>); setMarksFormOpen(true); } },
        ]}
        searchPlaceholder="Search grades..."
      />

      <FormDialog
        open={marksFormOpen}
        onOpenChange={setMarksFormOpen}
        title={`Edit Marks — ${String(marksTarget?.name ?? '')}`}
        mode="edit"
        fields={marksFields}
        initialData={marksTarget ?? undefined}
        onSubmit={(data) => {
          const id = String(marksTarget?.id ?? '');
          updateMarks.mutate({ id, marks: { obtained: Number(data.obtained) } } as any, {
            onSuccess: () => notifySuccess('Marks Updated', `Marks saved for ${String(marksTarget?.name ?? '')}`),
            onError: (err: Error) => notifyError('Update Failed', err.message),
          });
          setMarksFormOpen(false);
          setMarksTarget(null);
        }}
        submitLabel="Save Marks"
      />
    </div>
  );
}

/* ── Missing Marks ── */
function MissingMarksView() {
  const missing = [
    { id: 'MM-001', student: 'Carlos Rivera', grade: 'Grade 5A', subject: 'Mathematics', exam: 'Mid-Term', teacher: 'Mr. Johnson', dueDate: '2025-05-20', reason: 'Absent during exam', status: 'Pending Retest' },
    { id: 'MM-002', student: 'Ethan Brown', grade: 'Grade 5B', subject: 'Science', exam: 'Mid-Term', teacher: 'Dr. Lee', dueDate: '2025-05-22', reason: 'Medical leave', status: 'Retest Scheduled' },
    { id: 'MM-003', student: 'Fiona Kim', grade: 'Grade 6A', subject: 'History', exam: 'Unit Test 2', teacher: 'Mr. Davis', dueDate: '2025-05-18', reason: 'Not submitted by teacher', status: 'Overdue' },
    { id: 'MM-004', student: 'George Lee', grade: 'Grade 6A', subject: 'English', exam: 'Mid-Term', teacher: 'Ms. Williams', dueDate: '2025-05-21', reason: 'Paper damaged', status: 'Re-evaluation' },
  ] as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Missing Marks Queue</h2>
        <p className="text-sm text-muted-foreground/60">Grades not yet entered or requiring action</p>
      </div>
      <DataTable
        data={missing}
        columns={[
          { key: 'id', label: 'ID', render: (v) => <span className="font-mono text-xs text-amber-400">{String(v)}</span> },
          { key: 'student', label: 'Student', sortable: true },
          { key: 'grade', label: 'Grade' },
          { key: 'subject', label: 'Subject', sortable: true },
          { key: 'exam', label: 'Exam' },
          { key: 'teacher', label: 'Teacher' },
          { key: 'dueDate', label: 'Due Date', sortable: true },
          { key: 'reason', label: 'Reason', render: (v) => <span className="text-xs text-muted-foreground/60">{String(v)}</span> },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Resolve', icon: CheckCircle, onClick: (r) => notifySuccess('Resolved', `Missing marks for ${String(r.student)} resolved`) },
          { label: 'Notify Teacher', icon: Users, onClick: (r) => notifySuccess('Teacher Notified', `Notification sent to ${String(r.teacher)}`) },
        ]}
        searchPlaceholder="Search missing marks..."
      />
    </div>
  );
}

/* ── Results Analysis ── */
function ResultsView() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Results Analysis</h2>
        <p className="text-sm text-muted-foreground/60">Performance summary and grade distribution</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <OperationBlock icon={Award} label="Class Average" value="78.5%" sublabel="Mid-Term Exam" color="text-blue-400" />
        <OperationBlock icon={BarChart3} label="Pass Rate" value="94.2%" sublabel="Above 40% threshold" color="text-emerald-400" />
        <OperationBlock icon={AlertCircle} label="Failed" value="12" sublabel="Across all subjects" color="text-red-400" />
        <OperationBlock icon={BookOpen} label="Subjects Graded" value="8/10" sublabel="2 pending" color="text-amber-400" />
      </div>

      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">Subject-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { subject: 'Mathematics', avg: 82, highest: 98, lowest: 35, passRate: 92 },
              { subject: 'English', avg: 78, highest: 95, lowest: 42, passRate: 96 },
              { subject: 'Science', avg: 75, highest: 96, lowest: 28, passRate: 88 },
              { subject: 'History', avg: 80, highest: 94, lowest: 45, passRate: 98 },
              { subject: 'Physics', avg: 72, highest: 92, lowest: 30, passRate: 85 },
              { subject: 'Art', avg: 88, highest: 100, lowest: 60, passRate: 100 },
            ].map(s => (
              <div key={s.subject} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card p-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{s.subject}</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground/60">
                    <span>High: <span className="text-emerald-400">{s.highest}</span></span>
                    <span>Low: <span className="text-red-400">{s.lowest}</span></span>
                    <span>Pass: <span className="text-blue-400">{s.passRate}%</span></span>
                  </div>
                </div>
                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${s.avg}%` }} />
                  </div>
                  <span className="text-sm font-mono text-muted-foreground w-12 text-right">{s.avg}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Report Cards ── */
function ReportCardsView() {
  const { schoolId } = useAuthStore();
  const reports = [
    { id: 'RC-001', student: 'Alice Thompson', grade: 'Grade 5A', gpa: 3.85, rank: 2, totalMarks: '542/600', status: 'Generated' },
    { id: 'RC-002', student: 'Diana Patel', grade: 'Grade 5B', gpa: 3.92, rank: 1, totalMarks: '558/600', status: 'Generated' },
    { id: 'RC-003', student: 'Bob Chen', grade: 'Grade 5A', gpa: 3.20, rank: 8, totalMarks: '474/600', status: 'Generated' },
    { id: 'RC-004', student: 'Carlos Rivera', grade: 'Grade 5A', gpa: 0, rank: '\u2014', totalMarks: 'Incomplete', status: 'Pending' },
    { id: 'RC-005', student: 'Ethan Brown', grade: 'Grade 5B', gpa: 2.85, rank: 12, totalMarks: '428/600', status: 'Generated' },
  ] as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Report Cards</h2>
          <p className="text-sm text-muted-foreground/60">Generate and distribute student report cards</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8" onClick={() => notifySuccess('Generated', 'All report cards generated')}>
            Generate All
          </Button>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8" onClick={() => notifySuccess('Downloaded', 'Bulk download started')}>
            <Download className="size-3.5 mr-1" /> Bulk Download
          </Button>
        </div>
      </div>
      <DataTable
        data={reports}
        columns={[
          { key: 'id', label: 'ID', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'student', label: 'Student', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'grade', label: 'Grade' },
          { key: 'gpa', label: 'GPA', sortable: true, render: (v) => <span className="font-mono text-muted-foreground">{Number(v) > 0 ? String(v) : '\u2014'}</span> },
          { key: 'rank', label: 'Rank', sortable: true },
          { key: 'totalMarks', label: 'Total Marks' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Preview', icon: Eye, onClick: (r) => {
            const url = `/api/admin/schools/${schoolId}/exams/reports/${String(r.id)}/preview`;
            window.open(url, '_blank', 'noopener,noreferrer');
          } },
          { label: 'Download PDF', icon: Download, onClick: (r) => {
            const url = `/api/admin/schools/${schoolId}/exams/reports/${String(r.id)}/download`;
            const a = document.createElement('a'); a.href = url; a.download = `report-${String(r.student)}.pdf`; a.click();
            notifySuccess('Downloaded', `Report card for ${String(r.student)} downloaded`);
          } },
        ]}
        searchPlaceholder="Search report cards..."
      />
    </div>
  );
}

/* ════════════════ MAIN ════════════════ */
export function ExamsSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'exam_gradebook': return <GradebookView />;
      case 'exam_missing': return <MissingMarksView />;
      case 'exam_results': return <ResultsView />;
      case 'exam_reports': return <ReportCardsView />;
      default: return <ScheduleView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
