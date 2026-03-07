/* ─── AcademicsSection ─── Academic years, classes, subjects, timetable, promotion ─── */
import { useState, Fragment } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useAcademicYears,
  useClasses,
  useSubjects,
  useTeacherAssignments,
  useCreateClass,
  useUpdateClass,
  useDeleteClass,
  useCreateSubject,
  useUpdateSubject,
  useDeleteSubject,
  useCreateAcademicYear,
  usePromotionRules,
  useCreatePromotionRule,
  useUpdatePromotionRule,
  useCreateTeacherAssignment,
  useUpdateTeacherAssignment,
} from '@/hooks/api/use-school-ops';
import {
  Calendar, Plus, Edit, Eye, Trash2,
  Settings, Copy,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DataTable, StatusBadge, FormDialog, DetailPanel, DetailFields,
} from '@/components/features/school-admin';
import type { FormField, DetailTab } from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { notifySuccess, notifyError } from '@/lib/notify';

/* ─── Local types ─── */
interface AcademicClass {
  id: string;
  name: string;
  level: string;
  section: string;
  classTeacher: string;
  students: number;
  capacity: number;
  room: string;
  subjects: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  credits: number;
  teacher: string;
  classes: string;
  periods: number;
}

/* ─── Form fields ─── */
const classFields: FormField[] = [
  { name: 'name', label: 'Class Name', type: 'text', required: true, placeholder: 'e.g. Grade 5A', half: true },
  { name: 'level', label: 'Level', type: 'text', required: true, placeholder: 'e.g. Grade 5', half: true },
  { name: 'section', label: 'Section', type: 'text', required: true, placeholder: 'A', half: true },
  { name: 'classTeacher', label: 'Class Teacher', type: 'text', required: true, half: true },
  { name: 'room', label: 'Room', type: 'text', required: true, placeholder: 'Room 201', half: true },
  { name: 'capacity', label: 'Capacity', type: 'number', required: true, half: true },
  { name: 'students', label: 'Students', type: 'number', half: true },
  { name: 'subjects', label: 'Subjects Count', type: 'number', half: true },
];

const subjectFields: FormField[] = [
  { name: 'name', label: 'Subject Name', type: 'text', required: true, half: true },
  { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g. MATH', half: true },
  { name: 'department', label: 'Department', type: 'select', required: true, options: [
    { label: 'Mathematics', value: 'Mathematics' }, { label: 'Science', value: 'Science' },
    { label: 'English', value: 'English' }, { label: 'Humanities', value: 'Humanities' },
    { label: 'Arts', value: 'Arts' }, { label: 'Physical Ed', value: 'Physical Ed' },
    { label: 'Technology', value: 'Technology' },
  ], half: true },
  { name: 'teacher', label: 'Teacher', type: 'text', required: true, half: true },
  { name: 'credits', label: 'Credits', type: 'number', required: true, half: true },
  { name: 'periods', label: 'Periods/Week', type: 'number', required: true, half: true },
  { name: 'classes', label: 'Applicable Grades', type: 'text', placeholder: 'e.g. Grade 9-12' },
];

/* ─── Academic Year form fields ─── */
const academicYearFields: FormField[] = [
  { name: 'name', label: 'Year Name', type: 'text', required: true, placeholder: 'e.g. 2025-2026', half: true },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true, half: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true, half: true },
  { name: 'terms', label: 'Number of Terms', type: 'number', required: true, half: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { label: 'Planning', value: 'Planning' }, { label: 'Active', value: 'Active' }, { label: 'Closed', value: 'Closed' },
  ], half: true },
];

/* ─── Teacher Assignment form fields ─── */
const teacherAssignmentFields: FormField[] = [
  { name: 'teacher', label: 'Teacher', type: 'text', required: true, half: true },
  { name: 'subject', label: 'Subject', type: 'text', required: true, half: true },
  { name: 'classes', label: 'Classes Assigned', type: 'text', required: true, placeholder: 'e.g. Grade 5A, Grade 6B' },
  { name: 'periodsPerWeek', label: 'Periods/Week', type: 'number', required: true, half: true },
];

/* ─── Promotion Rule form fields ─── */
const promotionRuleFields: FormField[] = [
  { name: 'fromGrade', label: 'From Grade', type: 'text', required: true, half: true },
  { name: 'toGrade', label: 'To Grade', type: 'text', required: true, half: true },
  { name: 'minAttendance', label: 'Min Attendance %', type: 'text', required: true, placeholder: 'e.g. 75%', half: true },
  { name: 'minGPA', label: 'Min GPA', type: 'text', required: true, placeholder: 'e.g. 2.0', half: true },
  { name: 'passingSubjects', label: 'Passing Subjects', type: 'text', required: true, placeholder: 'e.g. 5/7', half: true },
];

/* ─── Academic Years ─── */
function AcademicYearsView() {
  const { schoolId } = useAuthStore();
  const { navigate } = useNavigationStore();
  const { data: yearRes } = useAcademicYears(schoolId);
  const years = Array.isArray(yearRes) ? yearRes : (yearRes as any)?.items ?? [];
  const createYear = useCreateAcademicYear(schoolId);

  const [formOpen, setFormOpen] = useState(false);

  const handleYearSubmit = (data: Record<string, unknown>) => {
    createYear.mutate(data, {
      onSuccess: () => notifySuccess('Year Created', `${String(data.name)} added`),
      onError: () => notifyError('Error', 'Failed to create academic year'),
    });
    setFormOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Academic Years</h2>
          <p className="text-sm text-muted-foreground/60">Manage academic year cycles and terms</p>
        </div>
        <PermissionGate requires="academics.write">
          <Button size="sm" className="h-8" onClick={() => setFormOpen(true)}>
            <Plus className="size-3.5 mr-1.5" /> New Academic Year
          </Button>
        </PermissionGate>
      </div>

      <div className="space-y-3">
        {years.map((yr: Record<string, unknown>) => (
          <Card key={yr.id as string} className={`border-border bg-card backdrop-blur-xl ${yr.status === 'Active' ? 'border-l-2 border-l-emerald-500' : ''}`}>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className={`size-5 ${yr.status === 'Active' ? 'text-emerald-400' : 'text-muted-foreground/40'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground/80">{yr.name as string}</p>
                      <StatusBadge status={yr.status as string} />
                    </div>
                    <p className="text-xs text-muted-foreground/60">{yr.startDate as string} &rarr; {yr.endDate as string} &middot; {yr.terms as number} terms</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-muted-foreground">{yr.students as number}</p>
                    <p className="text-xs text-muted-foreground/60">Students</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-muted-foreground">{yr.staff as number}</p>
                    <p className="text-xs text-muted-foreground/60">Staff</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8" onClick={() => navigate('academics', `acad_year_${yr.id as string}`)}>
                    <Settings className="size-3.5 mr-1" /> Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title="New Academic Year" mode="create" fields={academicYearFields} onSubmit={handleYearSubmit} submitLabel="Create Year" />
    </div>
  );
}

/* ─── Classes & Sections ─── */
type ClassRow = AcademicClass & Record<string, unknown>;

function ClassesView() {
  const { schoolId } = useAuthStore();
  const { data: classRes } = useClasses(schoolId);
  const classes = Array.isArray(classRes) ? classRes : (classRes as any)?.items ?? [];
  const createClass = useCreateClass(schoolId);
  const updateClass = useUpdateClass(schoolId);
  const deleteClass = useDeleteClass(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AcademicClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicClass | null>(null);

  const handleSubmit = (data: Record<string, unknown>) => {
    if (formMode === 'create') {
      const payload = {
        name: String(data.name || ''),
        level: String(data.level || ''),
        section: String(data.section || 'A'),
        classTeacher: String(data.classTeacher || ''),
        students: Number(data.students) || 0,
        capacity: Number(data.capacity) || 30,
        room: String(data.room || ''),
        subjects: Number(data.subjects) || 0,
      };
      createClass.mutate(payload, {
        onSuccess: () => notifySuccess('Class Created', `${payload.name} added`),
      });
    } else if (editData) {
      const id = String(editData.id);
      updateClass.mutate({ id, ...data, students: Number(data.students), capacity: Number(data.capacity), subjects: Number(data.subjects) }, {
        onSuccess: () => notifySuccess('Class Updated', 'Class details saved'),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteClass.mutate(deleteTarget.id, {
      onSuccess: () => notifySuccess('Removed', `${deleteTarget.name} has been deleted`),
      onError: () => notifyError('Error', 'Failed to delete class'),
    });
    setDeleteTarget(null);
  };

  const detailTabs: DetailTab[] = selected ? [
    { id: 'info', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Class Name', value: selected.name },
        { label: 'Level', value: selected.level },
        { label: 'Section', value: selected.section },
        { label: 'Class Teacher', value: selected.classTeacher },
        { label: 'Room', value: selected.room },
        { label: 'Students', value: String(selected.students) },
        { label: 'Capacity', value: String(selected.capacity) },
        { label: 'Utilization', value: `${Math.round((selected.students / selected.capacity) * 100)}%` },
        { label: 'Subjects', value: String(selected.subjects) },
      ]} />
    )},
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Classes & Sections</h2>
          <p className="text-sm text-muted-foreground/60">{classes.length} classes configured</p>
        </div>
        <PermissionGate requires="academics.write">
          <Button size="sm" className="h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Add Class
          </Button>
        </PermissionGate>
      </div>
      <DataTable<ClassRow>
        data={classes}
        columns={[
          { key: 'name', label: 'Class', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'section', label: 'Section' },
          { key: 'classTeacher', label: 'Class Teacher', sortable: true },
          { key: 'room', label: 'Room' },
          { key: 'students', label: 'Students', sortable: true },
          { key: 'capacity', label: 'Capacity', sortable: true },
          { key: 'students', label: 'Utilization', render: (v, row) => {
            const pct = Math.round((Number(v) / Number(row.capacity)) * 100);
            const color = pct > 90 ? 'bg-red-500' : pct > 75 ? 'bg-amber-500' : 'bg-emerald-500';
            return (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-mono text-muted-foreground/60">{pct}%</span>
              </div>
            );
          }},
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: (r) => { setSelected(r as AcademicClass); setDetailOpen(true); } },
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as AcademicClass) },
        ]}
        searchPlaceholder="Search classes..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Add Class' : 'Edit Class'} mode={formMode} fields={classFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Create Class' : 'Save Changes'} />

      <DetailPanel open={detailOpen} onOpenChange={setDetailOpen} title={selected?.name || ''} subtitle={`${selected?.classTeacher || ''} \u00b7 ${selected?.room || ''}`} tabs={detailTabs} actions={[
        { label: 'Edit', onClick: () => { setDetailOpen(false); if (selected) { setEditData(selected as unknown as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } } },
      ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Remove Class" description={`Remove ${deleteTarget?.name}? This cannot be undone.`} confirmLabel="Remove" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ─── Subjects ─── */
type SubjectRow = Subject & Record<string, unknown>;

function SubjectsView() {
  const { schoolId } = useAuthStore();
  const { data: subjectRes } = useSubjects(schoolId);
  const subjects = Array.isArray(subjectRes) ? subjectRes : (subjectRes as any)?.items ?? [];
  const createSubject = useCreateSubject(schoolId);
  const updateSubject = useUpdateSubject(schoolId);
  const deleteSubject = useDeleteSubject(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const handleSubmit = (data: Record<string, unknown>) => {
    if (formMode === 'create') {
      createSubject.mutate(data, {
        onSuccess: () => notifySuccess('Subject Added', `${String(data.name)} created`),
        onError: () => notifyError('Error', 'Failed to create subject'),
      });
    } else if (editData) {
      const id = String(editData.id);
      updateSubject.mutate({ id, ...data }, {
        onSuccess: () => notifySuccess('Subject Updated', 'Subject details saved'),
        onError: () => notifyError('Error', 'Failed to update subject'),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteSubject.mutate(deleteTarget.id, {
      onSuccess: () => notifySuccess('Removed', `${deleteTarget.name} has been deleted`),
      onError: () => notifyError('Error', 'Failed to delete subject'),
    });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Subject Catalog</h2>
          <p className="text-sm text-muted-foreground/60">{subjects.length} subjects configured</p>
        </div>
        <PermissionGate requires="academics.write">
          <Button size="sm" className="h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Add Subject
          </Button>
        </PermissionGate>
      </div>
      <DataTable<SubjectRow>
        data={subjects}
        columns={[
          { key: 'code', label: 'Code', sortable: true, render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Subject', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'department', label: 'Dept', sortable: true },
          { key: 'teacher', label: 'Teacher' },
          { key: 'classes', label: 'Grades' },
          { key: 'credits', label: 'Credits', sortable: true },
          { key: 'periods', label: 'Periods/Wk', sortable: true },
        ]}
        actions={[
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: (r) => setDeleteTarget(r as Subject) },
        ]}
        searchPlaceholder="Search subjects..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Add Subject' : 'Edit Subject'} mode={formMode} fields={subjectFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Add Subject' : 'Save Changes'} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Remove Subject" description={`Remove ${deleteTarget?.name}? This will affect timetables and assignments.`} confirmLabel="Remove" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ─── Teacher Assignment ─── */
function TeacherAssignmentView() {
  const { schoolId } = useAuthStore();
  const { navigate } = useNavigationStore();
  const { data: assignmentRes } = useTeacherAssignments(schoolId);
  const rawAssignments = Array.isArray(assignmentRes) ? assignmentRes : (assignmentRes as any)?.items ?? [];
  const createAssignment = useCreateTeacherAssignment(schoolId);
  const updateAssignment = useUpdateTeacherAssignment(schoolId);

  const assignments = rawAssignments.map((a: any, i: number) => ({
    id: a.id || `TA-${String(i + 1).padStart(3, '0')}`,
    teacher: a.teacher || a.teacherName || '',
    subject: a.subject || a.subjectName || '',
    classes: a.classes || '',
    periodsPerWeek: a.periodsPerWeek || a.periods || 0,
    status: a.status || 'Active',
  })) as Array<Record<string, unknown>>;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();

  const handleSubmit = (data: Record<string, unknown>) => {
    if (formMode === 'create') {
      createAssignment.mutate(data, {
        onSuccess: () => notifySuccess('Assigned', `${String(data.teacher)} assigned to ${String(data.subject)}`),
        onError: () => notifyError('Error', 'Failed to assign teacher'),
      });
    } else if (editData) {
      const id = String(editData.id);
      updateAssignment.mutate({ id, ...data }, {
        onSuccess: () => notifySuccess('Updated', 'Assignment updated'),
        onError: () => notifyError('Error', 'Failed to update assignment'),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Teacher-Subject Assignment</h2>
          <p className="text-sm text-muted-foreground/60">{assignments.length} assignments</p>
        </div>
        <PermissionGate requires="academics.write">
          <Button size="sm" className="h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Assign Teacher
          </Button>
        </PermissionGate>
      </div>
      <DataTable
        data={assignments}
        columns={[
          { key: 'teacher', label: 'Teacher', sortable: true, render: (v) => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'subject', label: 'Subject', sortable: true },
          { key: 'classes', label: 'Classes Assigned' },
          { key: 'periodsPerWeek', label: 'Periods/Week', sortable: true },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Edit Assignment', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
          { label: 'View Schedule', icon: Calendar, onClick: () => navigate('academics', 'acad_timetable') },
        ]}
        searchPlaceholder="Search assignments..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Assign Teacher' : 'Edit Assignment'} mode={formMode} fields={teacherAssignmentFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Assign' : 'Save Changes'} />
    </div>
  );
}

/* ─── Timetable ─── */
function TimetableView() {
  const { schoolId } = useAuthStore();
  const { data: classRes } = useClasses(schoolId);
  const classes = Array.isArray(classRes) ? classRes : (classRes as any)?.items ?? [];
  const [selectedClass, setSelectedClass] = useState('Grade 5A');
  const periods = ['8:00-8:45', '8:50-9:35', '9:40-10:25', '10:40-11:25', '11:30-12:15', '1:00-1:45', '1:50-2:35'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const timetable: Record<string, Record<string, string>> = {
    Monday:    { '8:00-8:45': 'Math', '8:50-9:35': 'English', '9:40-10:25': 'Science', '10:40-11:25': 'History', '11:30-12:15': 'PE', '1:00-1:45': 'Art', '1:50-2:35': 'Math' },
    Tuesday:   { '8:00-8:45': 'English', '8:50-9:35': 'Math', '9:40-10:25': 'PE', '10:40-11:25': 'Science', '11:30-12:15': 'Music', '1:00-1:45': 'History', '1:50-2:35': 'CS' },
    Wednesday: { '8:00-8:45': 'Science', '8:50-9:35': 'Math', '9:40-10:25': 'English', '10:40-11:25': 'Art', '11:30-12:15': 'History', '1:00-1:45': 'PE', '1:50-2:35': 'Library' },
    Thursday:  { '8:00-8:45': 'Math', '8:50-9:35': 'Science', '9:40-10:25': 'English', '10:40-11:25': 'PE', '11:30-12:15': 'CS', '1:00-1:45': 'Math', '1:50-2:35': 'Hindi' },
    Friday:    { '8:00-8:45': 'English', '8:50-9:35': 'Art', '9:40-10:25': 'Math', '10:40-11:25': 'Science', '11:30-12:15': 'History', '1:00-1:45': 'Assembly', '1:50-2:35': '\u2014' },
  };

  const subjectColors: Record<string, string> = {
    Math: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    English: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Science: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    History: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    PE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    Art: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Music: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    CS: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    Hindi: 'bg-red-500/10 text-red-400 border-red-500/20',
    Library: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    Assembly: 'bg-muted text-muted-foreground/60 border-border',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Timetable</h2>
          <p className="text-sm text-muted-foreground/60">Weekly class schedule &mdash; {selectedClass}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="h-8 text-xs bg-muted border border-border rounded-md px-2 text-muted-foreground"
          >
            {classes.map((c: any) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-8" onClick={() => notifySuccess('Copied', 'Timetable copied to clipboard')}>
            <Copy className="size-3.5 mr-1" /> Copy
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card backdrop-blur-xl overflow-x-auto">
        <CardContent className="pt-4">
          <div className="min-w-200">
            <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-px">
              <div className="text-[10px] text-muted-foreground/40 font-medium p-2">Period</div>
              {days.map(d => (
                <div key={d} className="text-[10px] text-muted-foreground/60 font-medium text-center p-2 bg-card">{d}</div>
              ))}
              {periods.map((period, pi) => (
                <Fragment key={`row-${pi}`}>
                  <div className="text-[10px] text-muted-foreground/40 p-2 flex items-center">{period}</div>
                  {days.map(day => {
                    const subj = timetable[day]?.[period] || '\u2014';
                    const colorCls = subjectColors[subj] || 'bg-muted text-muted-foreground/40 border-border';
                    return (
                      <div key={`${day}-${pi}`} className={`p-1.5 m-0.5 rounded-md border text-center text-xs font-medium ${colorCls}`}>
                        {subj}
                      </div>
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Promotion Rules ─── */
function PromotionView() {
  const { schoolId } = useAuthStore();
  const { data: ruleRes } = usePromotionRules(schoolId);
  const rules = Array.isArray(ruleRes) ? ruleRes : (ruleRes as any)?.items ?? [];
  const createRule = useCreatePromotionRule(schoolId);
  const updateRule = useUpdatePromotionRule(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editData, setEditData] = useState<Record<string, unknown> | undefined>();

  const handleSubmit = (data: Record<string, unknown>) => {
    if (formMode === 'create') {
      createRule.mutate({ ...data, status: 'Active' }, {
        onSuccess: () => notifySuccess('Rule Added', `${String(data.fromGrade)} → ${String(data.toGrade)} rule created`),
        onError: () => notifyError('Error', 'Failed to create promotion rule'),
      });
    } else if (editData) {
      const id = String(editData.id);
      updateRule.mutate({ id, ...data }, {
        onSuccess: () => notifySuccess('Rule Updated', 'Promotion rule saved'),
        onError: () => notifyError('Error', 'Failed to update promotion rule'),
      });
    }
    setFormOpen(false);
    setEditData(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Promotion Rules</h2>
          <p className="text-sm text-muted-foreground/60">Define grade promotion criteria and policies</p>
        </div>
        <PermissionGate requires="academics.write">
          <Button size="sm" className="h-8" onClick={() => { setFormMode('create'); setEditData(undefined); setFormOpen(true); }}>
            <Plus className="size-3.5 mr-1.5" /> Add Rule
          </Button>
        </PermissionGate>
      </div>
      <DataTable
        data={rules}
        columns={[
          { key: 'fromGrade', label: 'From', sortable: true },
          { key: 'toGrade', label: 'To', sortable: true },
          { key: 'minAttendance', label: 'Min Attendance', render: (v) => <span className="font-mono text-xs text-amber-400">{String(v)}</span> },
          { key: 'minGPA', label: 'Min GPA', render: (v) => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'passingSubjects', label: 'Pass Subjects' },
          { key: 'status', label: 'Status', render: (v) => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Edit Rule', icon: Edit, onClick: (r) => { setEditData(r as Record<string, unknown>); setFormMode('edit'); setFormOpen(true); } },
        ]}
        searchPlaceholder="Search rules..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen} title={formMode === 'create' ? 'Add Promotion Rule' : 'Edit Promotion Rule'} mode={formMode} fields={promotionRuleFields} initialData={editData} onSubmit={handleSubmit} submitLabel={formMode === 'create' ? 'Add Rule' : 'Save Changes'} />
    </div>
  );
}

/* ════════════════ MAIN ════════════════ */
export function AcademicsSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'acad_classes': return <ClassesView />;
      case 'acad_subjects': return <SubjectsView />;
      case 'acad_teachers': return <TeacherAssignmentView />;
      case 'acad_timetable': return <TimetableView />;
      case 'acad_promotion': return <PromotionView />;
      default: return <AcademicYearsView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
