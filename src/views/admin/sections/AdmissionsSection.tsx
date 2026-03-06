/* ─── AdmissionsSection ─── Application pipeline, management, enrollment ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import {
  UserPlus, CheckCircle, Eye,
  Download, Calendar, Mail, Edit, Trash2, MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  KanbanBoard, DataTable, StatusBadge, WorkflowStepper,
  FormDialog, DetailPanel, DetailFields,
} from '@/components/features/school-admin';
import type { FormField, DetailTab } from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { admissionsPipeline } from '../data/demo-data';
import { notifySuccess, notifyInfo, notifyWarning } from '@/lib/notify';

/* ── Local type ── */
interface AdmissionApp {
  id: string;
  studentName: string;
  grade: string;
  guardian: string;
  guardianPhone: string;
  appliedDate: string;
  stage: string;
  status: string;
  documents: string[];
  notes: string;
}

/* ─── Form fields ─── */
const appFields: FormField[] = [
  { name: 'studentName', label: 'Student Name', type: 'text', required: true, half: true },
  { name: 'grade', label: 'Applying for Grade', type: 'select', required: true, options: [
    { label: 'Grade 1', value: 'Grade 1' }, { label: 'Grade 3', value: 'Grade 3' },
    { label: 'Grade 5', value: 'Grade 5' }, { label: 'Grade 7', value: 'Grade 7' },
    { label: 'Grade 9', value: 'Grade 9' }, { label: 'Grade 11', value: 'Grade 11' },
  ], half: true },
  { name: 'guardian', label: 'Guardian Name', type: 'text', required: true, half: true },
  { name: 'guardianPhone', label: 'Guardian Phone', type: 'tel', half: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'New', value: 'New' }, { label: 'Under Review', value: 'Under Review' },
    { label: 'Interview Scheduled', value: 'Interview Scheduled' }, { label: 'Accepted', value: 'Accepted' },
    { label: 'Waitlisted', value: 'Waitlisted' }, { label: 'Enrolled', value: 'Enrolled' },
    { label: 'Rejected', value: 'Rejected' },
  ] },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

/* ─── Pipeline (Kanban) ─── */
function PipelineView() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Admissions Pipeline</h2>
          <p className="text-sm text-muted-foreground/60">Drag-style pipeline &mdash; all active applications</p>
        </div>
        <PermissionGate requires="admissions.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => notifyInfo('New Application', 'Switch to Applications tab to create')}>
            <UserPlus className="size-3.5 mr-1.5" /> New Application
          </Button>
        </PermissionGate>
      </div>
      <KanbanBoard
        columns={admissionsPipeline}
        onCardClick={(card) => notifyInfo('Application Details', `Opening application for ${card.title}`)}
        onAddCard={(colId) => notifyInfo('New Application', `Adding application to ${colId}`)}
      />
    </div>
  );
}

/* ─── Applications Table ─── */
type AppRow = AdmissionApp & Record<string, unknown>;

function ApplicationsView() {
  const apps: AppRow[] = []; // TODO: wire API hook for admissions

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdmissionApp | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdmissionApp | null>(null);

  const handleSubmit = (_data: Record<string, unknown>) => {
    notifyInfo('Not yet implemented', 'Admissions write API not available yet');
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    notifyInfo('Not yet implemented', 'Admissions delete API not available yet');
    setDeleteTarget(null);
  };

  const detailTabs: DetailTab[] = selected ? [
    { id: 'info', label: 'Application', content: (
      <DetailFields fields={[
        { label: 'Student', value: selected.studentName },
        { label: 'Grade', value: selected.grade },
        { label: 'Guardian', value: selected.guardian },
        { label: 'Phone', value: selected.guardianPhone },
        { label: 'Submitted', value: selected.appliedDate },
        { label: 'Status', value: <StatusBadge status={selected.status} /> },
        { label: 'Notes', value: selected.notes || '\u2014', full: true },
      ]} />
    )},
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">All Applications</h2>
          <p className="text-sm text-muted-foreground/60">{apps.length} applications total</p>
        </div>
        <PermissionGate requires="admissions.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <UserPlus className="size-3.5 mr-1.5" /> New Application
          </Button>
        </PermissionGate>
      </div>
      <DataTable<AppRow>
        data={apps}
        columns={[
          { key: 'id', label: 'App ID', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'studentName', label: 'Student Name', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'grade', label: 'Grade', sortable: true },
          { key: 'guardian', label: 'Guardian' },
          { key: 'appliedDate', label: 'Submitted', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={String(v)} /> },
          { key: 'notes', label: 'Notes', render: (v) => <span className="text-xs text-muted-foreground/60 truncate max-w-30 inline-block">{String(v) || '\u2014'}</span> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: (r) => { setSelected(r as AdmissionApp); setDetailOpen(true); } },
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Email Guardian', icon: Mail, onClick: (r) => notifySuccess('Email Sent', `Email sent to ${String((r as AdmissionApp).guardian)}`) },
          { label: 'Withdraw', icon: Trash2, onClick: (r) => setDeleteTarget(r as AdmissionApp) },
        ]}
        searchPlaceholder="Search applications..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'New Application' : 'Edit Application'} mode={formMode} fields={appFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Submit' : 'Save Changes'} />

      <DetailPanel open={detailOpen} onOpenChange={setDetailOpen} title={selected?.studentName || ''} subtitle={`${selected?.grade || ''} \u00b7 Applied ${selected?.appliedDate || ''}`} status={selected?.status} tabs={detailTabs} actions={[
        { label: 'Edit', onClick: () => { setDetailOpen(false); if (selected) { setEditData(selected as unknown as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } } },
        { label: 'Email Guardian', variant: 'outline', onClick: () => notifySuccess('Email Sent', `Email sent to ${selected?.guardian}`) },
      ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Withdraw Application" description={`Withdraw application for ${deleteTarget?.studentName}? This cannot be undone.`} confirmLabel="Withdraw" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ─── Documents Review ─── */
function DocumentsView() {
  const docData = [
    { id: 'DOC-001', studentName: 'Emma Richardson', docType: 'Birth Certificate', uploadedDate: '2025-05-10', status: 'Verified', reviewer: 'Admin Sarah' },
    { id: 'DOC-002', studentName: 'Emma Richardson', docType: 'Previous Report Card', uploadedDate: '2025-05-10', status: 'Verified', reviewer: 'Admin Sarah' },
    { id: 'DOC-003', studentName: 'Noah Kim', docType: 'Birth Certificate', uploadedDate: '2025-05-12', status: 'Pending', reviewer: 'Unassigned' },
    { id: 'DOC-004', studentName: 'Noah Kim', docType: 'Medical Records', uploadedDate: '2025-05-12', status: 'Pending', reviewer: 'Unassigned' },
    { id: 'DOC-005', studentName: 'Sophia Mueller', docType: 'Transfer Certificate', uploadedDate: '2025-05-16', status: 'Missing', reviewer: '\u2014' },
    { id: 'DOC-006', studentName: 'Isabella Chen', docType: 'Birth Certificate', uploadedDate: '2025-05-15', status: 'Pending', reviewer: 'Admin Sarah' },
    { id: 'DOC-007', studentName: 'Liam Patel', docType: 'Passport Copy', uploadedDate: '2025-05-08', status: 'Verified', reviewer: 'Admin John' },
    { id: 'DOC-008', studentName: 'Ethan Brown', docType: 'Address Proof', uploadedDate: '2025-05-11', status: 'Rejected', reviewer: 'Admin Sarah' },
  ] as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Document Review</h2>
        <p className="text-sm text-muted-foreground/60">Review and verify submitted enrollment documents</p>
      </div>
      <DataTable
        data={docData}
        columns={[
          { key: 'id', label: 'Doc ID', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'studentName', label: 'Student', sortable: true },
          { key: 'docType', label: 'Document Type', sortable: true },
          { key: 'uploadedDate', label: 'Uploaded', sortable: true },
          { key: 'status', label: 'Status', sortable: true, render: (v) => <StatusBadge status={String(v)} /> },
          { key: 'reviewer', label: 'Reviewer' },
        ]}
        actions={[
          { label: 'Preview', icon: Eye, onClick: (r) => notifyInfo('Preview', `Previewing ${String(r.docType)} for ${String(r.studentName)}`) },
          { label: 'Approve', icon: CheckCircle, onClick: (r) => notifySuccess('Approved', `${String(r.docType)} for ${String(r.studentName)} approved`) },
          { label: 'Download', icon: Download, onClick: (r) => notifySuccess('Downloaded', `${String(r.docType)} downloaded`) },
        ]}
        searchPlaceholder="Search documents..."
      />
    </div>
  );
}

/* ─── Interviews ─── */
function InterviewsView() {
  const interviewData = [
    { id: 'INT-001', studentName: 'Noah Kim', grade: 'Grade 7', interviewDate: '2025-05-20', time: '10:00 AM', interviewer: 'Dr. Patricia Lee', status: 'Scheduled', notes: 'Academic assessment' },
    { id: 'INT-002', studentName: 'Ethan Brown', grade: 'Grade 8', interviewDate: '2025-05-22', time: '2:00 PM', interviewer: 'Mr. James', status: 'Scheduled', notes: 'Parent meeting' },
    { id: 'INT-003', studentName: 'Mia Santos', grade: 'Grade 1', interviewDate: '2025-05-18', time: '9:00 AM', interviewer: 'Ms. Helen', status: 'Completed', notes: 'Excellent fit' },
    { id: 'INT-004', studentName: 'Isabella Chen', grade: 'Grade 5', interviewDate: '2025-05-24', time: '11:00 AM', interviewer: 'Dr. Patricia Lee', status: 'Pending Confirmation', notes: '' },
  ] as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Interviews</h2>
          <p className="text-sm text-muted-foreground/60">Schedule and track admission interviews</p>
        </div>
        <PermissionGate requires="admissions.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => notifyInfo('Schedule', 'Interview scheduling dialog coming soon')}>
            <Calendar className="size-3.5 mr-1.5" /> Schedule Interview
          </Button>
        </PermissionGate>
      </div>
      <DataTable
        data={interviewData}
        columns={[
          { key: 'id', label: 'ID', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'studentName', label: 'Student', sortable: true },
          { key: 'grade', label: 'Grade' },
          { key: 'interviewDate', label: 'Date', sortable: true },
          { key: 'time', label: 'Time' },
          { key: 'interviewer', label: 'Interviewer' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
          { key: 'notes', label: 'Notes', render: (v) => <span className="text-xs text-muted-foreground/60">{String(v) || '\u2014'}</span> },
        ]}
        searchPlaceholder="Search interviews..."
      />
    </div>
  );
}

/* ─── Waitlist ─── */
function WaitlistView() {
  const waitlistData = [
    { id: 'WL-001', studentName: 'Liam Patel', grade: 'Grade 9', position: 3, appliedDate: '2025-05-08', status: 'Active', guardian: 'Priya Patel' },
    { id: 'WL-002', studentName: 'Aiden Clarke', grade: 'Grade 3', position: 1, appliedDate: '2025-04-28', status: 'Active', guardian: 'Mary Clarke' },
    { id: 'WL-003', studentName: 'Zoe Liu', grade: 'Grade 11', position: 2, appliedDate: '2025-05-01', status: 'Offered', guardian: 'Lin Liu' },
  ] as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Waitlist Management</h2>
        <p className="text-sm text-muted-foreground/60">Manage waiting list positions and offers</p>
      </div>
      <DataTable
        data={waitlistData}
        columns={[
          { key: 'position', label: '#', sortable: true, render: (v) => <Badge variant="outline" className="border-border">{String(v)}</Badge> },
          { key: 'studentName', label: 'Student', sortable: true },
          { key: 'grade', label: 'Grade', sortable: true },
          { key: 'guardian', label: 'Guardian' },
          { key: 'appliedDate', label: 'Applied', sortable: true },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Offer Seat', icon: CheckCircle, onClick: (r) => notifySuccess('Seat Offered', `Seat offered to ${String(r.studentName)}`) },
          { label: 'Remove', icon: MoreHorizontal, onClick: (r) => notifyWarning('Removed', `${String(r.studentName)} removed from waitlist`), variant: 'destructive' },
        ]}
        searchPlaceholder="Search waitlist..."
      />
    </div>
  );
}

/* ─── Enrollment ─── */
function EnrollmentView() {
  const enrollmentSteps = [
    { id: 's1', label: 'Application Received' },
    { id: 's2', label: 'Documents Verified' },
    { id: 's3', label: 'Interview Complete' },
    { id: 's4', label: 'Acceptance Sent' },
    { id: 's5', label: 'Fees Paid' },
    { id: 's6', label: 'Enrolled' },
  ];

  const enrollments = [
    { name: 'Mia Santos', grade: 'Grade 1', step: 4, accepted: '2025-05-18' },
    { name: 'James Wilson', grade: 'Grade 11', step: 6, accepted: '2025-05-06' },
    { name: 'Emma Richardson', grade: 'Grade 3', step: 2, accepted: '' },
    { name: 'Noah Kim', grade: 'Grade 7', step: 3, accepted: '' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Enrollment Tracker</h2>
        <p className="text-sm text-muted-foreground/60">Track enrollment progress for accepted students</p>
      </div>

      <div className="space-y-3">
        {enrollments.map(en => (
          <Card key={en.name} className="border-border bg-card backdrop-blur-xl">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/80">{en.name}</p>
                  <p className="text-xs text-muted-foreground/60">{en.grade} {en.accepted && `\u00b7 Accepted ${en.accepted}`}</p>
                </div>
                <StatusBadge status={en.step === 6 ? 'Enrolled' : en.step >= 4 ? 'Accepted' : 'In Progress'} />
              </div>
              <WorkflowStepper steps={enrollmentSteps} currentStep={en.step} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ════════════════ MAIN ════════════════ */
export function AdmissionsSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'adm_applications': return <ApplicationsView />;
      case 'adm_documents': return <DocumentsView />;
      case 'adm_interviews': return <InterviewsView />;
      case 'adm_waitlist': return <WaitlistView />;
      case 'adm_enrollment': return <EnrollmentView />;
      default: return <PipelineView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
