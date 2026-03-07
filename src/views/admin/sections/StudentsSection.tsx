/* ─── StudentsSection ─── Student directory, profiles, transfers, disciplinary ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import {
  GraduationCap, Users, Eye, Edit, Download, Trash2,
  ArrowLeftRight, AlertTriangle, FileText,
  Phone, Mail, Heart, Shield, BookOpen,
  Calendar, CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DataTable, StatusBadge,
  FormDialog, DetailPanel, DetailFields,
} from '@/components/features/school-admin';
import type { Column, DataTableAction, FormField, DetailTab } from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { useAuthStore } from '@/store/auth.store';
import { useStudents, useCreateSchoolUser, useUpdateSchoolUser, useDeleteSchoolUser } from '@/hooks/api/use-admin';
import { notifySuccess, notifyInfo } from '@/lib/notify';

/* ── Local types ── */
interface Student {
  id: string;
  name: string;
  grade: string;
  rollNo: string;
  guardian: string;
  guardianPhone: string;
  guardianEmail: string;
  status: string;
  attendance: string;
  gpa: string;
  feeStatus: string;
  joinDate: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
}

interface TransferRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  fromSchool: string;
  toSchool: string;
  reason: string;
  date: string;
  status: string;
}

interface DisciplinaryRecord {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  date: string;
  type: string;
  description: string;
  actionTaken: string;
  followUpDate?: string;
  status: string;
}

/* ─── Student form fields ─── */
const studentFields: FormField[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g. Emma Clark', half: true },
  { name: 'rollNo', label: 'Roll Number', type: 'text', required: true, placeholder: 'e.g. 1001', half: true },
  { name: 'grade', label: 'Grade', type: 'select', required: true, options: [
    { label: 'Grade 1A', value: 'Grade 1A' }, { label: 'Grade 2A', value: 'Grade 2A' },
    { label: 'Grade 5A', value: 'Grade 5A' }, { label: 'Grade 5B', value: 'Grade 5B' },
    { label: 'Grade 6A', value: 'Grade 6A' }, { label: 'Grade 7A', value: 'Grade 7A' },
    { label: 'Grade 7B', value: 'Grade 7B' }, { label: 'Grade 8A', value: 'Grade 8A' },
    { label: 'Grade 9A', value: 'Grade 9A' }, { label: 'Grade 9B', value: 'Grade 9B' },
    { label: 'Grade 10A', value: 'Grade 10A' }, { label: 'Grade 10B', value: 'Grade 10B' },
    { label: 'Grade 11A', value: 'Grade 11A' }, { label: 'Grade 12A', value: 'Grade 12A' },
  ], half: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { label: 'Active', value: 'Active' }, { label: 'Inactive', value: 'Inactive' },
    { label: 'Suspended', value: 'Suspended' }, { label: 'Transferred', value: 'Transferred' },
  ], half: true },
  { name: 'dob', label: 'Date of Birth', type: 'date', half: true },
  { name: 'gender', label: 'Gender', type: 'select', options: [
    { label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }, { label: 'Other', value: 'Other' },
  ], half: true },
  { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: [
    { label: 'A+', value: 'A+' }, { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' }, { label: 'B-', value: 'B-' },
    { label: 'O+', value: 'O+' }, { label: 'O-', value: 'O-' },
    { label: 'AB+', value: 'AB+' }, { label: 'AB-', value: 'AB-' },
  ], half: true },
  { name: 'feeStatus', label: 'Fee Status', type: 'select', options: [
    { label: 'Paid', value: 'Paid' }, { label: 'Partial', value: 'Partial' }, { label: 'Overdue', value: 'Overdue' },
  ], half: true },
  { name: 'guardian', label: 'Guardian Name', type: 'text', required: true, placeholder: 'Primary guardian' },
  { name: 'guardianPhone', label: 'Guardian Phone', type: 'tel', placeholder: '+1-555-0000', half: true },
  { name: 'guardianEmail', label: 'Guardian Email', type: 'email', placeholder: 'guardian@email.com', half: true },
  { name: 'address', label: 'Address', type: 'textarea', placeholder: 'Full address' },
  { name: 'emergencyContact', label: 'Emergency Contact', type: 'tel', placeholder: '+1-555-0000' },
];

/* ─── Student Directory ─── */
type StudentRow = Student & Record<string, unknown>;

function DirectoryView() {
  const { schoolId } = useAuthStore();
  const { data: stuRes } = useStudents(schoolId);
  const createUser = useCreateSchoolUser(schoolId!);
  const updateUser = useUpdateSchoolUser(schoolId!);
  const deleteUser = useDeleteSchoolUser(schoolId!);
  const rawStudents = Array.isArray(stuRes) ? stuRes : (stuRes as any)?.items ?? [];
  const students: StudentRow[] = rawStudents.map((s: any) => ({ ...s, rollNo: s.rollNo ?? s.id?.slice(0,6), grade: s.grade ?? s.className ?? '', guardian: s.guardianName ?? s.guardian ?? '', attendance: s.attendance ?? '—', gpa: s.gpa ?? '—', feeStatus: s.feeStatus ?? 'Paid', status: s.status ?? 'Active' }));

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const stuColumns: Column<StudentRow>[] = [
    { key: 'rollNo', label: 'Roll #', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
    { key: 'name', label: 'Name', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
    { key: 'grade', label: 'Grade', sortable: true },
    { key: 'guardian', label: 'Guardian' },
    { key: 'attendance', label: 'Attendance', sortable: true, render: (v) => {
      const num = parseFloat(String(v));
      const color = num >= 90 ? 'text-emerald-400' : num >= 75 ? 'text-amber-400' : 'text-red-400';
      return <span className={`font-mono text-xs ${color}`}>{String(v)}</span>;
    }},
    { key: 'gpa', label: 'GPA', sortable: true, render: (v) => {
      const num = parseFloat(String(v));
      const color = num >= 3.5 ? 'text-emerald-400' : num >= 2.5 ? 'text-amber-400' : 'text-red-400';
      return <span className={`font-mono text-xs ${color}`}>{String(v)}</span>;
    }},
    { key: 'feeStatus', label: 'Fee Status', sortable: true, render: (v) => <StatusBadge status={String(v)} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
  ];

  const stuActions: DataTableAction<StudentRow>[] = [
    { label: 'View Profile', icon: Eye, onClick: (r) => { setSelectedStudent(r as Student); setDetailOpen(true); } },
    { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
    { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as Student) },
  ];

  const handleSubmit = (data: Record<string, unknown>) => {
    if (formMode === 'edit' && editData) {
      updateUser.mutate({ userId: editData.id as string, ...data } as any, { onSuccess: () => { setFormOpen(false); setEditData(undefined); } });
    } else {
      createUser.mutate({ ...data, role: 'student' } as any, { onSuccess: () => { setFormOpen(false); setEditData(undefined); } });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate({ userId: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  };

  const detailTabs: DetailTab[] = selectedStudent ? [
    { id: 'personal', label: 'Personal', content: (
      <DetailFields fields={[
        { label: 'Full Name', value: selectedStudent.name },
        { label: 'Roll Number', value: selectedStudent.rollNo },
        { label: 'Grade', value: selectedStudent.grade },
        { label: 'Date of Birth', value: selectedStudent.dob || '\u2014' },
        { label: 'Gender', value: selectedStudent.gender || '\u2014' },
        { label: 'Blood Group', value: selectedStudent.bloodGroup || '\u2014' },
        { label: 'Fee Status', value: <StatusBadge status={selectedStudent.feeStatus} /> },
        { label: 'Status', value: <StatusBadge status={selectedStudent.status} /> },
        { label: 'Admission Date', value: selectedStudent.joinDate },
        { label: 'Address', value: selectedStudent.address || '\u2014', full: true },
      ]} />
    )},
    { id: 'guardian', label: 'Guardian', content: (
      <DetailFields fields={[
        { label: 'Guardian Name', value: selectedStudent.guardian },
        { label: 'Phone', value: selectedStudent.guardianPhone || '\u2014' },
        { label: 'Email', value: selectedStudent.guardianEmail || '\u2014' },
        { label: 'Emergency Contact', value: selectedStudent.emergencyContact || '\u2014' },
      ]} />
    )},
    { id: 'academics', label: 'Academics', content: (
      <DetailFields fields={[
        { label: 'GPA', value: selectedStudent.gpa },
        { label: 'Attendance', value: selectedStudent.attendance },
      ]} />
    )},
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Student Directory</h2>
          <p className="text-sm text-muted-foreground/60">{students.length} students registered</p>
        </div>
        <PermissionGate requires="students.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <GraduationCap className="size-3.5 mr-1.5" /> Add Student
          </Button>
        </PermissionGate>
      </div>
      <DataTable<StudentRow>
        data={students}
        columns={stuColumns}
        actions={stuActions}
        searchPlaceholder="Search students by name, grade, guardian..."
        emptyTitle="No students found"
        emptyDescription="Add a new student or adjust your filters"
      />

      <FormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={formMode === 'create' ? 'Enroll New Student' : 'Edit Student'}
        description={formMode === 'create' ? 'Fill in student details to enroll' : 'Update student information'}
        mode={formMode}
        fields={studentFields}
        initialData={editData}
        onSubmit={handleSubmit}
        submitLabel={formMode === 'create' ? 'Enroll Student' : 'Save Changes'}
      />

      <DetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={selectedStudent?.name || ''}
        subtitle={`${selectedStudent?.grade || ''} \u00b7 Roll #${selectedStudent?.rollNo || ''}`}
        status={selectedStudent?.status}
        statusVariant={selectedStudent?.status === 'Active' ? 'default' : 'destructive'}
        tabs={detailTabs}
        actions={[
          { label: 'Edit', onClick: () => { setDetailOpen(false); if (selectedStudent) { setEditData(selectedStudent as unknown as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } } },
          { label: 'Email Guardian', variant: 'outline', onClick: () => { const email = (selectedStudent as any)?.guardianEmail || ''; if (email) window.open(`mailto:${email}`); else notifyInfo('No Email', 'Guardian email not available'); } },
        ]}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remove Student"
        description={`Are you sure you want to remove ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ─── Student Profile Detail ─── */
function ProfilesView() {
  const { activeSubNav } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const { data: stuRes } = useStudents(schoolId);
  const rawStudents = Array.isArray(stuRes) ? stuRes : (stuRes as any)?.items ?? [];
  const students: Student[] = rawStudents.map((s: any) => ({ ...s, rollNo: s.rollNo ?? s.id?.slice(0,6), grade: s.grade ?? '', guardian: s.guardianName ?? s.guardian ?? '', attendance: s.attendance ?? '—', gpa: s.gpa ?? '—', feeStatus: s.feeStatus ?? 'Paid', status: s.status ?? 'Active' }));
  const student = students[0];

  if (!student) return <div className="text-center py-12 text-muted-foreground/60 text-sm">No students in directory.</div>;

  const tabs = [
    { id: 'personal', label: 'Personal', icon: Users },
    { id: 'guardians', label: 'Guardians', icon: Shield },
    { id: 'academics', label: 'Academics', icon: BookOpen },
    { id: 'health', label: 'Health', icon: Heart },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
  ];

  const activeTab = activeSubNav || 'personal';

  return (
    <div className="space-y-4">
      {/* Student header */}
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-primary-foreground text-lg font-bold">
              {student.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">{student.name}</h2>
              <p className="text-sm text-muted-foreground/60">{student.grade} &middot; Roll #{student.rollNo}</p>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={student.status} />
                <span className="text-xs text-muted-foreground">GPA {student.gpa}</span>
                <span className="text-xs text-muted-foreground">Attendance {student.attendance}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-7 border-border text-muted-foreground/70 text-xs" onClick={() => { const email = student.guardianEmail || ''; if (email) window.open(`mailto:${email}`); else notifyInfo('No Email', 'Guardian email not available'); }}>
                <Mail className="size-3 mr-1" /> Email Guardian
              </Button>
              <Button size="sm" variant="outline" className="h-7 border-border text-muted-foreground/70 text-xs" onClick={() => { const phone = student.guardianPhone || ''; if (phone) window.open(`tel:${phone}`); else notifyInfo('No Phone', 'Guardian phone not available'); }}>
                <Phone className="size-3 mr-1" /> Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} className="space-y-3">
        <TabsList className="h-8 bg-muted">
          {tabs.map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-xs gap-1 data-[state=active]:text-foreground">
              <tab.icon className="size-3" /> {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Full Name', student.name],
                  ['Grade / Section', student.grade],
                  ['Roll Number', student.rollNo],
                  ['Date of Birth', student.dob || '\u2014'],
                  ['Gender', student.gender || '\u2014'],
                  ['Blood Group', student.bloodGroup || '\u2014'],
                  ['Address', student.address || '\u2014'],
                  ['Admission Date', student.joinDate],
                  ['Fee Status', student.feeStatus],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground/40 uppercase">{label}</p>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardians">
          <div className="space-y-3">
            <Card className="border-border bg-card">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/80">{student.guardian}</p>
                    <p className="text-xs text-muted-foreground/60">Primary Guardian</p>
                  </div>
                  <div className="flex gap-2">
                    {student.guardianPhone && (
                      <Button size="sm" variant="outline" className="h-7 border-border text-muted-foreground/70 text-xs">
                        <Phone className="size-3 mr-1" /> {student.guardianPhone}
                      </Button>
                    )}
                    {student.guardianEmail && (
                      <Button size="sm" variant="outline" className="h-7 border-border text-muted-foreground/70 text-xs">
                        <Mail className="size-3 mr-1" /> {student.guardianEmail}
                      </Button>
                    )}
                  </div>
                </div>
                {student.emergencyContact && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-[10px] text-muted-foreground/40 uppercase">Emergency Contact</p>
                    <p className="text-sm text-muted-foreground">{student.emergencyContact}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academics">
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground/40 uppercase">Current GPA</p>
                  <p className="text-2xl font-bold text-foreground">{student.gpa}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] text-muted-foreground/40 uppercase">Attendance Rate</p>
                  <p className="text-2xl font-bold text-foreground">{student.attendance}</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { subject: 'Mathematics', teacher: 'Mrs. Chen', grade: 'A+', progress: 95 },
                  { subject: 'English', teacher: 'Mr. Davis', grade: 'A', progress: 88 },
                  { subject: 'Science', teacher: 'Mr. Patel', grade: 'A+', progress: 92 },
                  { subject: 'History', teacher: 'Mr. Harris', grade: 'B+', progress: 82 },
                  { subject: 'Art', teacher: 'Ms. Rivera', grade: 'A', progress: 90 },
                ].map(s => (
                  <div key={s.subject} className="flex items-center gap-3">
                    <div className="w-24">
                      <p className="text-sm text-muted-foreground font-medium">{s.subject}</p>
                      <p className="text-[10px] text-muted-foreground/40">{s.teacher}</p>
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-accent overflow-hidden">
                      <div className="h-full rounded-full bg-linear-to-r from-blue-600 to-purple-600" style={{ width: `${s.progress}%` }} />
                    </div>
                    <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px] min-w-8 justify-center">{s.grade}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Blood Group', student.bloodGroup || '\u2014'],
                  ['Allergies', 'None'],
                  ['Vaccinations', 'Up to date'],
                  ['Last Medical Check', '2025-01-15'],
                  ['Vision', 'Normal'],
                  ['Hearing', 'Normal'],
                  ['Special Needs', 'None'],
                  ['Insurance #', 'INS-2025-4582'],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground/40 uppercase">{label}</p>
                    <p className="text-sm text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <DataTable
            data={[
              { id: 'D1', name: 'Birth Certificate', type: 'Identity', uploaded: '2024-09-01', status: 'Verified' },
              { id: 'D2', name: 'Report Card', type: 'Academic', uploaded: '2024-09-01', status: 'Verified' },
              { id: 'D3', name: 'Medical Records', type: 'Health', uploaded: '2025-01-15', status: 'Verified' },
              { id: 'D4', name: 'Address Proof', type: 'Identity', uploaded: '2024-09-01', status: 'Verified' },
            ] as Array<Record<string, unknown>>}
            columns={[
              { key: 'name', label: 'Document', sortable: true },
              { key: 'type', label: 'Type' },
              { key: 'uploaded', label: 'Uploaded', sortable: true },
              { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
            ]}
            actions={[
              { label: 'View', icon: Eye, onClick: (r) => { const url = (r as any).url || (r as any).fileUrl; if (url) window.open(url, '_blank'); else notifyInfo('No File', 'Document URL not available'); } },
              { label: 'Download', icon: Download, onClick: (r) => { const url = (r as any).url || (r as any).fileUrl; if (url) { const a = document.createElement('a'); a.href = url; a.download = String(r.name); a.click(); } else notifySuccess('Downloaded', `${String(r.name)} downloaded`); } },
            ]}
            searchPlaceholder="Search documents..."
          />
        </TabsContent>

        <TabsContent value="timeline">
          <Card className="border-border bg-card">
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[
                  { date: '2025-05-10', event: 'Scored A+ in Math Term Exam', type: 'academic' },
                  { date: '2025-04-20', event: 'Won 2nd place in Science Fair', type: 'achievement' },
                  { date: '2025-03-15', event: 'Parent-Teacher conference', type: 'meeting' },
                  { date: '2025-02-01', event: 'Enrolled for Spring Semester', type: 'enrollment' },
                  { date: student.joinDate, event: `Admission \u2014 Enrolled in ${student.grade}`, type: 'enrollment' },
                ].map((ev, i, arr) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <div className="size-2 rounded-full bg-blue-500" />
                      {i < arr.length - 1 && <div className="w-px h-8 bg-accent mt-1" />}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{ev.event}</p>
                      <p className="text-[10px] text-muted-foreground/40">{ev.date} &middot; {ev.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Transfers ─── */
type TransferRow = TransferRecord & Record<string, unknown>;

const transferFields: FormField[] = [
  { name: 'studentName', label: 'Student Name', type: 'text', required: true, half: true },
  { name: 'grade', label: 'Current Grade', type: 'text', required: true, half: true },
  { name: 'fromSchool', label: 'From', type: 'text', required: true, half: true, placeholder: 'School or section' },
  { name: 'toSchool', label: 'To', type: 'text', required: true, half: true, placeholder: 'School or section' },
  { name: 'reason', label: 'Reason', type: 'textarea', required: true, placeholder: 'Reason for transfer' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { label: 'In Progress', value: 'In Progress' }, { label: 'Completed', value: 'Completed' },
    { label: 'Pending Documents', value: 'Pending Documents' }, { label: 'Rejected', value: 'Rejected' },
  ] },
];

function TransfersView() {
  const { schoolId } = useAuthStore();
  const { data: stuRes } = useStudents(schoolId);
  const createUser = useCreateSchoolUser(schoolId!);
  const deleteUser = useDeleteSchoolUser(schoolId!);
  const rawStudents = Array.isArray(stuRes) ? stuRes : (stuRes as any)?.items ?? [];
  const transfers: TransferRow[] = rawStudents.filter((s: any) => s.transferStatus).map((s: any) => ({ ...s, studentName: s.name, fromSchool: s.fromSchool ?? '', toSchool: s.toSchool ?? '', reason: s.transferReason ?? '', date: s.transferDate ?? '' }));

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<TransferRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransferRecord | null>(null);

  const handleSubmit = (data: Record<string, unknown>) => {
    createUser.mutate({ ...data, role: 'student' } as any, { onSuccess: () => { setFormOpen(false); setEditData(undefined); } });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate({ userId: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Student Transfers</h2>
          <p className="text-sm text-muted-foreground/60">{transfers.length} transfer records</p>
        </div>
        <PermissionGate requires="students.write">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <ArrowLeftRight className="size-3.5 mr-1.5" /> New Transfer
          </Button>
        </PermissionGate>
      </div>
      <DataTable<TransferRow>
        data={transfers}
        columns={[
          { key: 'id', label: 'ID', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'studentName', label: 'Student', sortable: true },
          { key: 'grade', label: 'Grade' },
          { key: 'fromSchool', label: 'From' },
          { key: 'toSchool', label: 'To' },
          { key: 'reason', label: 'Reason' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
          { key: 'date', label: 'Date', sortable: true },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: (r) => { setSelected(r as TransferRecord); setDetailOpen(true); } },
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as TransferRecord) },
        ]}
        searchPlaceholder="Search transfers..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'New Transfer' : 'Edit Transfer'} mode={formMode} fields={transferFields} initialData={editData} onSubmit={handleSubmit} />

      <DetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={selected?.studentName || ''}
        subtitle={`${selected?.grade || ''} \u00b7 ${selected?.id || ''}`}
        status={selected?.status}
      >
        {selected && (
          <DetailFields fields={[
            { label: 'Student', value: selected.studentName },
            { label: 'Grade', value: selected.grade },
            { label: 'From', value: selected.fromSchool },
            { label: 'To', value: selected.toSchool },
            { label: 'Reason', value: selected.reason, full: true },
            { label: 'Date', value: selected.date },
            { label: 'Status', value: <StatusBadge status={selected.status} /> },
          ]} />
        )}
      </DetailPanel>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Transfer" description={`Remove transfer record for ${deleteTarget?.studentName}?`} confirmLabel="Delete" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ─── Disciplinary ─── */
type DisciplinaryRow = DisciplinaryRecord & Record<string, unknown>;

const disciplinaryFields: FormField[] = [
  { name: 'studentName', label: 'Student Name', type: 'text', required: true, half: true },
  { name: 'grade', label: 'Grade', type: 'text', required: true, half: true },
  { name: 'type', label: 'Incident Type', type: 'select', required: true, options: [
    { label: 'Behavioral', value: 'Behavioral' }, { label: 'Academic Integrity', value: 'Academic Integrity' },
    { label: 'Attendance', value: 'Attendance' }, { label: 'Bullying', value: 'Bullying' },
    { label: 'Property Damage', value: 'Property Damage' }, { label: 'Other', value: 'Other' },
  ], half: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { label: 'Active', value: 'Active' }, { label: 'Resolved', value: 'Resolved' },
    { label: 'Under Investigation', value: 'Under Investigation' },
  ], half: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true, placeholder: 'Describe the incident in detail' },
  { name: 'actionTaken', label: 'Action Taken', type: 'textarea', required: true, placeholder: 'What action was taken?' },
  { name: 'followUpDate', label: 'Follow-up Date', type: 'date' },
];

function DisciplinaryView() {
  const { schoolId } = useAuthStore();
  const { data: stuRes } = useStudents(schoolId);
  const updateUser = useUpdateSchoolUser(schoolId!);
  const deleteUser = useDeleteSchoolUser(schoolId!);
  const rawStudents = Array.isArray(stuRes) ? stuRes : (stuRes as any)?.items ?? [];
  const records: DisciplinaryRow[] = rawStudents.flatMap((s: any) => (s.disciplinaryRecords ?? []).map((d: any) => ({ ...d, studentName: s.name })));

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<DisciplinaryRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DisciplinaryRecord | null>(null);

  const handleSubmit = (data: Record<string, unknown>) => {
    updateUser.mutate({ userId: data.studentId as string, disciplinaryRecord: data } as any, { onSuccess: () => { setFormOpen(false); setEditData(undefined); } });
  };

  const handleResolve = (item: DisciplinaryRecord) => {
    updateUser.mutate({ userId: item.id, status: 'resolved' } as any);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteUser.mutate({ userId: deleteTarget.id }, { onSuccess: () => setDeleteTarget(null) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Disciplinary Records</h2>
          <p className="text-sm text-muted-foreground/60">{records.length} records</p>
        </div>
        <PermissionGate requires="students.write">
          <Button size="sm" className="bg-amber-600 hover:bg-amber-500 h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <AlertTriangle className="size-3.5 mr-1.5" /> Log Incident
          </Button>
        </PermissionGate>
      </div>
      <DataTable<DisciplinaryRow>
        data={records}
        columns={[
          { key: 'id', label: 'ID', sortable: true, render: (v) => <span className="font-mono text-xs text-amber-400">{String(v)}</span> },
          { key: 'studentName', label: 'Student', sortable: true },
          { key: 'grade', label: 'Grade' },
          { key: 'type', label: 'Type', render: (v) => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'actionTaken', label: 'Action Taken' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: (r) => { setSelected(r as DisciplinaryRecord); setDetailOpen(true); } },
          { label: 'Resolve', icon: CheckCircle, onClick: (r) => handleResolve(r as DisciplinaryRecord) },
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as DisciplinaryRecord) },
        ]}
        searchPlaceholder="Search incidents..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Log Incident' : 'Edit Record'} mode={formMode} fields={disciplinaryFields} initialData={editData} onSubmit={handleSubmit} />

      <DetailPanel
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title={selected?.studentName || ''}
        subtitle={`${selected?.grade || ''} \u00b7 ${selected?.id || ''}`}
        status={selected?.status}
        statusVariant={selected?.status === 'Resolved' ? 'default' : 'destructive'}
        actions={selected?.status !== 'Resolved' ? [
          { label: 'Resolve', onClick: () => { if (selected) { handleResolve(selected); setDetailOpen(false); } } },
        ] : undefined}
      >
        {selected && (
          <DetailFields fields={[
            { label: 'Student', value: selected.studentName },
            { label: 'Grade', value: selected.grade },
            { label: 'Type', value: selected.type },
            { label: 'Date', value: selected.date },
            { label: 'Description', value: selected.description, full: true },
            { label: 'Action Taken', value: selected.actionTaken, full: true },
            { label: 'Follow-up Date', value: selected.followUpDate || '\u2014' },
            { label: 'Status', value: <StatusBadge status={selected.status} /> },
          ]} />
        )}
      </DetailPanel>

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Record" description={`Remove disciplinary record for ${deleteTarget?.studentName}?`} confirmLabel="Delete" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ═════════════════ MAIN ═════════════════ */
export function StudentsSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'stu_profiles': return <ProfilesView />;
      case 'stu_transfers': return <TransfersView />;
      case 'stu_disciplinary': return <DisciplinaryView />;
      default: return <DirectoryView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
