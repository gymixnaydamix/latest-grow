/* ─── StaffSection ─── Directory, leave, departments, payroll, onboarding, documents ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useLeaveRequests, useApproveLeave } from '@/hooks/api/use-school-ops';
import { useStaff, useCreateSchoolUser, useUpdateSchoolUser, useDeleteSchoolUser } from '@/hooks/api/use-admin';
import { useDepartments, useCreateDepartment } from '@/hooks/api/use-academic';
import { exportToCsv, downloadFromUrl } from '@/lib/export';
import {
  Plus, Eye, Edit, Download, UserPlus, Trash2,
  Building2, CheckCircle, XCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable, StatusBadge, WorkflowStepper,
  FormDialog, DetailPanel, DetailFields,
} from '@/components/features/school-admin';
import type { FormField, DetailTab } from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { notifySuccess, notifyWarning } from '@/lib/notify';

/* ── Local types ── */
interface StaffMember {
  id: string;
  name: string;
  department: string;
  role: string;
  status: string;
  joinDate: string;
  email: string;
  phone: string;
  leaveBalance: string;
  salary: string;
  emergencyContact: string;
  qualification: string;
}

interface LeaveRequest {
  id: string;
  staff: string;
  department: string;
  type: string;
  dates: string;
  days: number;
  substitute: string;
  reason: string;
  status: string;
}

/* ─── Staff form fields ─── */
const staffFields: FormField[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, half: true },
  { name: 'email', label: 'Email', type: 'email', required: true, half: true },
  { name: 'phone', label: 'Phone', type: 'tel', half: true },
  { name: 'department', label: 'Department', type: 'select', required: true, options: [
    { label: 'Mathematics', value: 'Mathematics' }, { label: 'Science', value: 'Science' },
    { label: 'English', value: 'English' }, { label: 'History', value: 'History' },
    { label: 'Physical Ed', value: 'Physical Ed' }, { label: 'Primary', value: 'Primary' },
    { label: 'Admissions', value: 'Admissions' }, { label: 'Administration', value: 'Administration' },
  ], half: true },
  { name: 'role', label: 'Role', type: 'select', required: true, options: [
    { label: 'Teacher', value: 'Teacher' }, { label: 'Senior Teacher', value: 'Senior Teacher' },
    { label: 'Head of Department', value: 'Head of Department' }, { label: 'Registrar', value: 'Registrar' },
    { label: 'Coordinator', value: 'Coordinator' }, { label: 'Support Staff', value: 'Support Staff' },
  ], half: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { label: 'Active', value: 'Active' }, { label: 'Leave', value: 'Leave' },
    { label: 'Absent', value: 'Absent' }, { label: 'Inactive', value: 'Inactive' },
  ], half: true },
  { name: 'qualification', label: 'Qualification', type: 'text', placeholder: 'e.g. M.Sc Mathematics' },
  { name: 'salary', label: 'Salary', type: 'text', placeholder: 'e.g. $58,000', half: true },
  { name: 'leaveBalance', label: 'Leave Balance', type: 'text', placeholder: 'e.g. 12 days', half: true },
  { name: 'emergencyContact', label: 'Emergency Contact', type: 'tel', placeholder: '+1-555-0000' },
];

/* ── Directory ── */
type StaffRow = StaffMember & Record<string, unknown>;

function DirectoryView() {
  const { schoolId } = useAuthStore();
  const { data: staffRes } = useStaff(schoolId);
  const createMutation = useCreateSchoolUser(schoolId!);
  const updateMutation = useUpdateSchoolUser(schoolId!);
  const deleteMutation = useDeleteSchoolUser(schoolId!);

  const staff: StaffRow[] = ((staffRes as any)?.data ?? []).map((u: any) => ({
    id: u.id,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    department: u.department ?? '\u2014',
    role: u.role ?? '\u2014',
    status: u.isActive ? 'Active' : 'Inactive',
    joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '\u2014',
    email: u.email ?? '',
    phone: u.phone ?? '\u2014',
    leaveBalance: u.leaveBalance ?? '\u2014',
    salary: u.salary ?? '\u2014',
    emergencyContact: u.emergencyContact ?? '\u2014',
    qualification: u.qualification ?? '\u2014',
  }));

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<StaffMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const handleSubmit = (data: Record<string, unknown>) => {
    const [firstName, ...rest] = String(data.name ?? '').split(' ');
    const lastName = rest.join(' ') || firstName;
    if (formMode === 'create') {
      createMutation.mutate(
        { email: String(data.email ?? ''), firstName, lastName, role: 'TEACHER' },
        { onSuccess: () => notifySuccess('Staff Created', `${data.name} added successfully`) },
      );
    } else {
      updateMutation.mutate(
        { userId: String(data.id ?? ''), email: String(data.email ?? ''), firstName, lastName },
        { onSuccess: () => notifySuccess('Staff Updated', `${data.name} updated successfully`) },
      );
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(
      { userId: deleteTarget.id },
      { onSuccess: () => notifySuccess('Staff Removed', `${deleteTarget.name} has been removed`) },
    );
    setDeleteTarget(null);
  };

  const detailTabs: DetailTab[] = selected ? [
    { id: 'info', label: 'Info', content: (
      <DetailFields fields={[
        { label: 'Full Name', value: selected.name },
        { label: 'Email', value: selected.email },
        { label: 'Phone', value: selected.phone },
        { label: 'Department', value: selected.department },
        { label: 'Role', value: selected.role },
        { label: 'Status', value: <StatusBadge status={selected.status} /> },
        { label: 'Join Date', value: selected.joinDate },
        { label: 'Qualification', value: selected.qualification || '\u2014' },
      ]} />
    )},
    { id: 'employment', label: 'Employment', content: (
      <DetailFields fields={[
        { label: 'Salary', value: selected.salary || '\u2014' },
        { label: 'Leave Balance', value: selected.leaveBalance },
        { label: 'Emergency Contact', value: selected.emergencyContact || '\u2014' },
      ]} />
    )},
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Staff Directory</h2>
          <p className="text-sm text-muted-foreground/60">{staff.length} staff members</p>
        </div>
        <PermissionGate requires="staff.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <UserPlus className="size-3.5 mr-1.5" /> Add Staff
          </Button>
        </PermissionGate>
      </div>
      <DataTable<StaffRow>
        data={staff}
        columns={[
          { key: 'id', label: 'ID', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'department', label: 'Department', sortable: true },
          { key: 'role', label: 'Role' },
          { key: 'joinDate', label: 'Joined', sortable: true },
          { key: 'leaveBalance', label: 'Leave Bal.', sortable: true, render: (v) => <span className="font-mono text-xs text-muted-foreground/70">{String(v)}</span> },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View Profile', icon: Eye, onClick: (r) => { setSelected(r as StaffMember); setDetailOpen(true); } },
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as StaffMember) },
        ]}
        searchPlaceholder="Search staff..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Add Staff Member' : 'Edit Staff'} mode={formMode} fields={staffFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Add Staff' : 'Save Changes'} />

      <DetailPanel open={detailOpen} onOpenChange={setDetailOpen} title={selected?.name || ''} subtitle={`${selected?.department || ''} \u00b7 ${selected?.role || ''}`} status={selected?.status} tabs={detailTabs} actions={[
        { label: 'Edit', onClick: () => { setDetailOpen(false); if (selected) { setEditData(selected as unknown as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } } },
        { label: 'Email', variant: 'outline', onClick: () => { if (selected?.email) window.open(`mailto:${selected.email}`); } },
      ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Remove Staff" description={`Are you sure you want to remove ${deleteTarget?.name}?`} confirmLabel="Remove" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ── Leave Management ── */
type LeaveRow = LeaveRequest & Record<string, unknown>;

function LeaveView() {
  const { schoolId } = useAuthStore();
  const { data: leaveRes } = useLeaveRequests(schoolId);
  const approveMutation = useApproveLeave(schoolId);

  const leaves = (Array.isArray(leaveRes) ? leaveRes : (leaveRes as any)?.items ?? []) as LeaveRow[];
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<LeaveRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<LeaveRequest | null>(null);

  const pendingCount = leaves.filter(l => l.status === 'Pending').length;

  const handleApprove = (item: LeaveRequest) => {
    approveMutation.mutate(
      { leaveId: item.id, status: 'Approved' } as any,
      { onSuccess: () => notifySuccess('Leave Approved', `Leave for ${item.staff} approved`) },
    );
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    approveMutation.mutate(
      { leaveId: rejectTarget.id, status: 'Rejected' } as any,
      { onSuccess: () => notifyWarning('Leave Rejected', `Leave for ${rejectTarget.staff} rejected`) },
    );
    setRejectTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Leave Requests</h2>
          <p className="text-sm text-muted-foreground/60">{pendingCount} pending approval</p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="outline" className="border-amber-500/30 text-amber-400">{pendingCount} pending</Badge>
        )}
      </div>
      <DataTable<LeaveRow>
        data={leaves}
        columns={[
          { key: 'id', label: 'ID', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'staff', label: 'Staff', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'department', label: 'Dept' },
          { key: 'type', label: 'Type', render: (v) => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'dates', label: 'Dates', sortable: true },
          { key: 'days', label: 'Days', render: (v) => <span className="font-mono text-xs">{String(v)}</span> },
          { key: 'substitute', label: 'Substitute', render: (v) => <span className="text-xs text-muted-foreground/60">{String(v) || '\u2014'}</span> },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Approve', icon: CheckCircle, onClick: (r) => handleApprove(r as LeaveRequest) },
          { label: 'Reject', icon: XCircle, onClick: (r) => setRejectTarget(r as LeaveRequest) },
          { label: 'View Details', icon: Eye, onClick: (r) => { setSelected(r as LeaveRequest); setDetailOpen(true); } },
        ]}
        searchPlaceholder="Search leave requests..."
      />

      <DetailPanel open={detailOpen} onOpenChange={setDetailOpen} title={selected?.staff || ''} subtitle={`${selected?.department || ''} \u00b7 ${selected?.type || ''} Leave`} status={selected?.status} actions={selected?.status === 'Pending' ? [
        { label: 'Approve', onClick: () => { if (selected) { handleApprove(selected); setDetailOpen(false); } } },
        { label: 'Reject', variant: 'destructive', onClick: () => { if (selected) { setDetailOpen(false); setRejectTarget(selected); } } },
      ] : undefined}>
        {selected && (
          <DetailFields fields={[
            { label: 'Staff', value: selected.staff },
            { label: 'Department', value: selected.department },
            { label: 'Type', value: selected.type },
            { label: 'Dates', value: selected.dates },
            { label: 'Days', value: String(selected.days) },
            { label: 'Substitute', value: selected.substitute || '\u2014' },
            { label: 'Reason', value: selected.reason, full: true },
            { label: 'Status', value: <StatusBadge status={selected.status} /> },
          ]} />
        )}
      </DetailPanel>

      <ConfirmDialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)} title="Reject Leave" description={`Reject leave request from ${rejectTarget?.staff}?`} confirmLabel="Reject" variant="destructive" onConfirm={handleReject} />
    </div>
  );
}

/* ── Departments ── */
const deptFormFields: FormField[] = [
  { name: 'name', label: 'Department Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'text' },
];

function DepartmentsView() {
  const { schoolId } = useAuthStore();
  const { data: staffRes } = useStaff(schoolId);
  const { data: deptRes } = useDepartments(schoolId);
  const createDeptMutation = useCreateDepartment(schoolId!);

  const staff: StaffMember[] = ((staffRes as any)?.data ?? []).map((u: any) => ({
    id: u.id,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    department: u.department ?? '\u2014',
    role: u.role ?? '\u2014',
    status: u.isActive ? 'Active' : 'Inactive',
    joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '\u2014',
    email: u.email ?? '',
    phone: u.phone ?? '\u2014',
    leaveBalance: u.leaveBalance ?? '\u2014',
    salary: u.salary ?? '\u2014',
    emergencyContact: u.emergencyContact ?? '\u2014',
    qualification: u.qualification ?? '\u2014',
  }));

  const departments = ((deptRes as any)?.data ?? []).map((d: any) => ({
    id: d.id,
    name: d.name,
    head: d.head ? `${d.head.firstName ?? ''} ${d.head.lastName ?? ''}`.trim() : '\u2014',
    budget: '\u2014',
  }));

  const [deptFormOpen, setDeptFormOpen] = useState(false);

  const handleCreateDept = (data: Record<string, unknown>) => {
    createDeptMutation.mutate(
      { name: String(data.name ?? ''), description: String(data.description ?? '') },
      { onSuccess: () => notifySuccess('Department Created', `${data.name} created successfully`) },
    );
    setDeptFormOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Departments</h2>
          <p className="text-sm text-muted-foreground/60">{departments.length} departments configured</p>
        </div>
        <PermissionGate requires="staff.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => setDeptFormOpen(true)}>
            <Plus className="size-3.5 mr-1.5" /> Add Department
          </Button>
        </PermissionGate>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {departments.map((d: any) => {
          const memberCount = staff.filter(s => s.department === d.name).length;
          return (
            <Card key={d.id} className="border-border bg-card backdrop-blur-xl hover:bg-accent transition-colors">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="size-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground/80">{d.name}</p>
                      <p className="text-xs text-muted-foreground/60">Head: {d.head}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-center">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">{memberCount}</p>
                      <p className="text-[9px] text-muted-foreground/30">Members</p>
                    </div>
                    <div>
                      <p className="text-sm font-mono text-emerald-400/70">{d.budget}</p>
                      <p className="text-[9px] text-muted-foreground/30">Budget</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <FormDialog open={deptFormOpen} onOpenChange={setDeptFormOpen} title="Add Department" mode="create" fields={deptFormFields} onSubmit={handleCreateDept} submitLabel="Create Department" />
    </div>
  );
}

/* ── Payroll ── */
function PayrollView() {
  const { schoolId } = useAuthStore();
  const { data: staffRes } = useStaff(schoolId);
  const staff: StaffMember[] = ((staffRes as any)?.data ?? []).map((u: any) => ({
    id: u.id,
    name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
    department: u.department ?? '\u2014',
    role: u.role ?? '\u2014',
    status: u.isActive ? 'Active' : 'Inactive',
    joinDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '\u2014',
    email: u.email ?? '',
    phone: u.phone ?? '\u2014',
    leaveBalance: u.leaveBalance ?? '\u2014',
    salary: u.salary ?? '\u2014',
    emergencyContact: u.emergencyContact ?? '\u2014',
    qualification: u.qualification ?? '\u2014',
  }));
  const payroll = staff.filter(s => s.salary).map((s, i) => ({
    id: `PR-${String(i + 1).padStart(3, '0')}`,
    name: s.name,
    department: s.department,
    baseSalary: parseInt(String(s.salary).replace(/[^0-9]/g, '')) || 0,
    allowances: Math.round((parseInt(String(s.salary).replace(/[^0-9]/g, '')) || 0) * 0.15),
    deductions: Math.round((parseInt(String(s.salary).replace(/[^0-9]/g, '')) || 0) * 0.08),
    netPay: 0,
    status: s.status === 'Active' ? 'Processed' : 'Pending',
  })).map(p => ({ ...p, netPay: p.baseSalary + p.allowances - p.deductions })) as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Payroll Management</h2>
          <p className="text-sm text-muted-foreground/60">Current payroll cycle &middot; {payroll.length} staff</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8" onClick={() => { notifySuccess('Payroll Processed', 'All payroll entries processed'); }}>
            Process All
          </Button>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8" onClick={() => { exportToCsv(payroll.map((p: any) => ({ id: p.id, name: p.name, department: p.department, baseSalary: p.baseSalary, allowances: p.allowances, deductions: p.deductions, netPay: p.netPay, status: p.status })), 'payroll-export.csv'); notifySuccess('Exported', 'Payroll exported to CSV'); }}>
            <Download className="size-3.5 mr-1" /> Export
          </Button>
        </div>
      </div>
      <DataTable
        data={payroll}
        columns={[
          { key: 'id', label: 'ID', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Staff', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'department', label: 'Dept' },
          { key: 'baseSalary', label: 'Base', sortable: true, render: (v) => <span className="font-mono text-muted-foreground">${Number(v).toLocaleString()}</span> },
          { key: 'allowances', label: 'Allowances', render: (v) => <span className="font-mono text-emerald-400/70">+${Number(v).toLocaleString()}</span> },
          { key: 'deductions', label: 'Deduct.', render: (v) => <span className="font-mono text-red-400/70">-${Number(v).toLocaleString()}</span> },
          { key: 'netPay', label: 'Net Pay', sortable: true, render: (v) => <span className="font-mono text-foreground/80 font-semibold">${Number(v).toLocaleString()}</span> },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        searchPlaceholder="Search payroll..."
      />
    </div>
  );
}

/* ── Onboarding ── */
function OnboardingView() {
  const onboardingSteps = [
    { id: '1', label: 'Offer Accepted' },
    { id: '2', label: 'Documents Submitted' },
    { id: '3', label: 'Background Check' },
    { id: '4', label: 'IT Setup' },
    { id: '5', label: 'Orientation' },
    { id: '6', label: 'Active' },
  ];

  const newHires = [
    { name: 'Dr. Amanda Foster', role: 'Chemistry Teacher', department: 'Science', startDate: '2025-06-01', step: 3 },
    { name: 'Mr. Kevin Park', role: 'IT Specialist', department: 'IT', startDate: '2025-06-15', step: 2 },
    { name: 'Ms. Laura Chen', role: 'School Nurse', department: 'Health', startDate: '2025-06-01', step: 4 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Staff Onboarding</h2>
        <p className="text-sm text-muted-foreground/60">Track new hire onboarding progress</p>
      </div>

      <div className="space-y-3">
        {newHires.map(h => (
          <Card key={h.name} className="border-border bg-card backdrop-blur-xl">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground/80">{h.name}</p>
                  <p className="text-xs text-muted-foreground/60">{h.role} &middot; {h.department} &middot; Start: {h.startDate}</p>
                </div>
                <StatusBadge status={h.step >= 5 ? 'Active' : 'In Progress'} />
              </div>
              <WorkflowStepper steps={onboardingSteps} currentStep={h.step} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Staff Documents ── */
function StaffDocumentsView() {
  const docs = [
    { id: 'SD-001', staffName: 'Mrs. Chen', docType: 'Employment Contract', uploaded: '2019-08-15', expiry: '\u2014', status: 'Valid' },
    { id: 'SD-002', staffName: 'Mrs. Chen', docType: 'Teaching License', uploaded: '2019-08-15', expiry: '2025-12-31', status: 'Valid' },
    { id: 'SD-003', staffName: 'Mrs. Nelson', docType: 'Ph.D Certificate', uploaded: '2016-08-01', expiry: '\u2014', status: 'Valid' },
    { id: 'SD-004', staffName: 'Mr. Okoro', docType: 'First Aid Cert', uploaded: '2023-01-15', expiry: '2025-01-15', status: 'Expired' },
    { id: 'SD-005', staffName: 'Mr. Davis', docType: 'Background Check', uploaded: '2021-09-01', expiry: '2025-09-01', status: 'Expiring Soon' },
  ] as Array<Record<string, unknown>>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Staff Documents</h2>
        <p className="text-sm text-muted-foreground/60">Manage staff certifications and compliance documents</p>
      </div>
      <DataTable
        data={docs}
        columns={[
          { key: 'id', label: 'ID', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'staffName', label: 'Staff', sortable: true },
          { key: 'docType', label: 'Document Type', sortable: true },
          { key: 'uploaded', label: 'Uploaded' },
          { key: 'expiry', label: 'Expiry', sortable: true },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: (r) => { const url = String((r as any).fileUrl ?? (r as any).url ?? ''); if (url) window.open(url, '_blank'); else notifyWarning('No File', `No file URL available for ${String(r.docType)}`); } },
          { label: 'Download', icon: Download, onClick: (r) => { const url = String((r as any).fileUrl ?? (r as any).url ?? ''); if (url) { downloadFromUrl(url, `${String(r.docType)}-${String(r.staffName)}.pdf`); notifySuccess('Downloaded', `${String(r.docType)} downloaded`); } else notifyWarning('No File', 'Download URL not available'); } },
        ]}
        searchPlaceholder="Search documents..."
      />
    </div>
  );
}

/* ═════════════════ MAIN ═════════════════ */
export function StaffSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'hr_leave': return <LeaveView />;
      case 'hr_departments': return <DepartmentsView />;
      case 'hr_payroll': return <PayrollView />;
      case 'hr_onboarding': return <OnboardingView />;
      case 'hr_documents': return <StaffDocumentsView />;
      default: return <DirectoryView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
