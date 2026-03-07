/* ---- AdminSettingsSection ---- School configuration and management settings ---- */
import { useState, useCallback, useMemo } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useFeeConfig,
  useRoles,
  useSaveSchoolProfile,
  useSaveFeeConfig,
  useGradingScales,
  useDeleteFeeType,
  useTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useCreateGradingScale,
  useCreateSchoolRole,
  useUpdateSchoolRole,
} from '@/hooks/api/use-school-ops';
import {
  Building, BookOpen, GraduationCap, Shield,
  FileText, Palette, Save, Plus, Edit, Check, Globe,
  Phone, Mail, MapPin, Clock, Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DataTable, FormDialog, DetailPanel, DetailFields, StatusBadge,
  type Column, type FormField as FormFieldDef, type DetailTab,
} from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { notifySuccess } from '@/lib/notify';

/* ---- Local types ---- */
interface FeeType {
  id: string;
  name: string;
  category: string;
  amount: string;
  frequency: string;
  mandatory: boolean;
}

interface Template {
  id: string;
  name: string;
  type: string;
  category: string;
  body: string;
  lastEdited: string;
  status: string;
}

/* ---- School Profile (local state -- no store entity) ---- */
const defaultGeneral = {
  schoolName: 'Sunrise International Academy',
  regNumber: 'SIA-2018-08432',
  email: 'admin@sunriseacademy.edu',
  phone: '+1 (555) 123-4567',
  website: 'www.sunriseacademy.edu',
};
const defaultAddress = {
  address: '123 Education Boulevard, Springfield, IL 62701',
  timezone: 'America/Chicago (CST)',
  schoolHours: '7:45 AM -- 3:15 PM',
  officeHours: '7:00 AM -- 5:00 PM',
  foundedYear: '2018',
};

function SchoolProfileView() {
  const { schoolId } = useAuthStore();
  const saveProfile = useSaveSchoolProfile(schoolId);
  const [general, setGeneral] = useState(defaultGeneral);
  const [address, setAddress] = useState(defaultAddress);

  const updateGeneral = useCallback((key: keyof typeof defaultGeneral, val: string) => setGeneral((p) => ({ ...p, [key]: val })), []);
  const updateAddress = useCallback((key: keyof typeof defaultAddress, val: string) => setAddress((p) => ({ ...p, [key]: val })), []);

  const handleSave = () => {
    saveProfile.mutate({ ...general, ...address }, {
      onSuccess: () => notifySuccess('Settings Saved', 'School profile updated successfully'),
    });
  };

  const generalFields: { label: string; key: keyof typeof defaultGeneral; icon: typeof Building }[] = [
    { label: 'School Name', key: 'schoolName', icon: Building },
    { label: 'Registration Number', key: 'regNumber', icon: FileText },
    { label: 'Email', key: 'email', icon: Mail },
    { label: 'Phone', key: 'phone', icon: Phone },
    { label: 'Website', key: 'website', icon: Globe },
  ];
  const addressFields: { label: string; key: keyof typeof defaultAddress }[] = [
    { label: 'Address', key: 'address' },
    { label: 'Timezone', key: 'timezone' },
    { label: 'School Hours', key: 'schoolHours' },
    { label: 'Office Hours', key: 'officeHours' },
    { label: 'Founded Year', key: 'foundedYear' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">School Profile</h2>
          <p className="text-sm text-muted-foreground/60">Manage school identity and contact information</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={handleSave}><Save className="size-3.5 mr-1.5" /> Save Changes</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground"><Building className="size-4 inline mr-2" />General Information</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {generalFields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground/40 flex items-center gap-1.5"><f.icon className="size-3" />{f.label}</Label>
                <Input value={general[f.key]} onChange={(e) => updateGeneral(f.key, e.target.value)} className="bg-muted border-border text-foreground/80 h-8 text-sm" />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground"><MapPin className="size-4 inline mr-2" />Address & Timing</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {addressFields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground/40">{f.label}</Label>
                <Input value={address[f.key]} onChange={(e) => updateAddress(f.key, e.target.value)} className="bg-muted border-border text-foreground/80 h-8 text-sm" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ---- Academic Config (local terms, class periods reference) ---- */
function AcademicConfigView() {
  const [terms, setTerms] = useState([
    { id: 't1', name: 'Term 1 (Fall)', start: 'Aug 20', end: 'Dec 15', weeks: 17, status: 'Active' },
    { id: 't2', name: 'Term 2 (Spring)', start: 'Jan 8', end: 'May 30', weeks: 20, status: 'Upcoming' },
    { id: 't3', name: 'Summer Session', start: 'Jun 10', end: 'Jul 20', weeks: 6, status: 'Planned' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<(typeof terms)[0] | null>(null);

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Term Name', type: 'text', required: true },
    { name: 'start', label: 'Start Date', type: 'text', required: true },
    { name: 'end', label: 'End Date', type: 'text', required: true },
    { name: 'weeks', label: 'Weeks', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Upcoming', label: 'Upcoming' }, { value: 'Planned', label: 'Planned' }] },
  ];

  const handleSave = (data: Record<string, string>) => {
    if (editing) {
      setTerms((p) => p.map((t) => (t.id === editing.id ? { ...t, ...data, weeks: parseInt(data.weeks) || t.weeks } : t)));
      notifySuccess('Term Updated', `${data.name} updated`);
    } else {
      setTerms((p) => [...p, { id: `t${Date.now()}`, name: data.name, start: data.start, end: data.end, weeks: parseInt(data.weeks) || 0, status: data.status || 'Planned' }]);
      notifySuccess('Term Added', `${data.name} created`);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Academic Configuration</h2>
          <p className="text-sm text-muted-foreground/60">Terms, periods, and academic calendar settings</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-3.5 mr-1.5" /> Add Term</Button>
      </div>
      <div className="space-y-2">
        {terms.map((t) => (
          <Card key={t.id} className="border-border bg-card backdrop-blur-xl">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10"><BookOpen className="size-4 text-blue-400" /></div>
                <div>
                  <p className="text-sm font-medium text-foreground/80">{t.name}</p>
                  <p className="text-xs text-muted-foreground/40">{t.start} -- {t.end} | {t.weeks} weeks</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={t.status === 'Active' ? 'text-emerald-400 border-emerald-400/30' : t.status === 'Upcoming' ? 'text-blue-400 border-blue-400/30' : 'text-muted-foreground/40 border-border'}>{t.status}</Badge>
                <Button variant="ghost" size="sm" className="text-muted-foreground/40 h-7" onClick={() => { setEditing(t); setShowForm(true); }}><Edit className="size-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground"><Clock className="size-4 inline mr-2" />Class Periods</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              { period: 'Period 1', time: '7:45 -- 8:35' }, { period: 'Period 2', time: '8:40 -- 9:30' },
              { period: 'Period 3', time: '9:35 -- 10:25' }, { period: 'Break', time: '10:25 -- 10:45' },
              { period: 'Period 4', time: '10:45 -- 11:35' }, { period: 'Period 5', time: '11:40 -- 12:30' },
              { period: 'Lunch', time: '12:30 -- 1:15' }, { period: 'Period 6', time: '1:15 -- 2:05' },
            ].map((p) => (
              <div key={p.period} className="flex items-center justify-between px-3 py-2 rounded-lg bg-card border border-border">
                <span className="text-xs font-medium text-muted-foreground">{p.period}</span>
                <span className="text-xs font-mono text-muted-foreground/60">{p.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <FormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Term' : 'Add Term'} fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ? { name: editing.name, start: editing.start, end: editing.end, weeks: String(editing.weeks), status: editing.status } : undefined} onSubmit={handleSave} />
    </div>
  );
}

/* ---- Grading Scales (API-wired) ---- */
function GradingScalesView() {
  const { schoolId } = useAuthStore();
  const { data: scalesRes } = useGradingScales(schoolId);
  const createScale = useCreateGradingScale(schoolId);
  const [showForm, setShowForm] = useState(false);

  const defaultScales = [
    { grade: 'A+', min: 95, max: 100, gpa: '4.0', desc: 'Outstanding' },
    { grade: 'A', min: 90, max: 94, gpa: '4.0', desc: 'Excellent' },
    { grade: 'B+', min: 85, max: 89, gpa: '3.5', desc: 'Very Good' },
    { grade: 'B', min: 80, max: 84, gpa: '3.0', desc: 'Good' },
    { grade: 'C+', min: 75, max: 79, gpa: '2.5', desc: 'Above Average' },
    { grade: 'C', min: 70, max: 74, gpa: '2.0', desc: 'Average' },
    { grade: 'D', min: 60, max: 69, gpa: '1.0', desc: 'Below Average' },
    { grade: 'F', min: 0, max: 59, gpa: '0.0', desc: 'Fail' },
  ];
  const scales: typeof defaultScales = Array.isArray(scalesRes) ? scalesRes as typeof defaultScales : (scalesRes as any)?.items ?? defaultScales;

  const scaleFields: FormFieldDef[] = [
    { name: 'grade', label: 'Grade Letter', type: 'text', required: true },
    { name: 'min', label: 'Min %', type: 'text', required: true },
    { name: 'max', label: 'Max %', type: 'text', required: true },
    { name: 'gpa', label: 'GPA Value', type: 'text', required: true },
    { name: 'desc', label: 'Description', type: 'text' },
  ];

  const handleSaveScale = (data: Record<string, string>) => {
    createScale.mutate({ grade: data.grade, min: Number(data.min), max: Number(data.max), gpa: data.gpa, desc: data.desc }, {
      onSuccess: () => { notifySuccess('Scale Created', `Grade ${data.grade} added`); setShowForm(false); },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Grading Scales</h2>
          <p className="text-sm text-muted-foreground/60">Configure grade boundaries and GPA mappings</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => setShowForm(true)}><Plus className="size-3.5 mr-1.5" /> New Scale</Button>
      </div>
      <Card className="border-border bg-card backdrop-blur-xl">
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground"><GraduationCap className="size-4 inline mr-2" />Default Grading Scale</CardTitle></CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {scales.map((s) => (
              <div key={s.grade} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center font-mono font-bold text-sm text-foreground">{s.grade}</span>
                  <span className="text-xs text-muted-foreground/60">{s.min}% -- {s.max}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground/40">{s.desc}</span>
                  <Badge variant="outline" className="text-xs text-muted-foreground/70 border-border font-mono">GPA {s.gpa}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <FormDialog open={showForm} onOpenChange={setShowForm} title="New Grading Scale" fields={scaleFields} mode="create" onSubmit={handleSaveScale} />
    </div>
  );
}

/* ---- Fee Structure ---- */
function FeeConfigView() {
  const { schoolId } = useAuthStore();
  const { data: feeRes } = useFeeConfig(schoolId);
  const fees = Array.isArray(feeRes) ? feeRes : (feeRes as any)?.items ?? [];
  const saveFee = useSaveFeeConfig(schoolId);
  const deleteFee = useDeleteFeeType(schoolId);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FeeType | null>(null);
  const [detail, setDetail] = useState<FeeType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeeType | null>(null);

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Fee Name', type: 'text', required: true },
    { name: 'category', label: 'Category', type: 'select', options: [{ value: 'Academic', label: 'Academic' }, { value: 'Services', label: 'Services' }, { value: 'Extra', label: 'Extra-curricular' }] },
    { name: 'amount', label: 'Amount', type: 'text', required: true, placeholder: '$3,500' },
    { name: 'frequency', label: 'Frequency', type: 'select', options: [{ value: 'Per Term', label: 'Per Term' }, { value: 'Monthly', label: 'Monthly' }, { value: 'Annual', label: 'Annual' }] },
    { name: 'mandatory', label: 'Mandatory', type: 'select', options: [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }] },
  ];

  const columns: Column<FeeType>[] = [
    { key: 'name', label: 'Fee Name' },
    { key: 'category', label: 'Category', render: (_v, r) => <Badge variant="outline" className="text-[10px] text-muted-foreground/60 border-border">{r.category}</Badge> },
    { key: 'amount', label: 'Amount', render: (_v, r) => <span className="font-mono text-emerald-400">{r.amount}</span> },
    { key: 'frequency', label: 'Frequency' },
    { key: 'mandatory', label: 'Required', render: (_v, r) => r.mandatory ? <Check className="size-4 text-emerald-400" /> : <span className="text-muted-foreground/30">Optional</span> },
  ];

  const handleSave = (data: Record<string, string>) => {
    const entry = { name: data.name, category: data.category || 'Academic', amount: data.amount, frequency: data.frequency || 'Per Term', mandatory: data.mandatory === 'true' };
    if (editing) {
      saveFee.mutate({ id: editing.id, ...entry }, {
        onSuccess: () => notifySuccess('Fee Updated', `${data.name} updated`),
      });
    } else {
      saveFee.mutate(entry, {
        onSuccess: () => notifySuccess('Fee Added', `${data.name} created`),
      });
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFee.mutate(deleteTarget.id, {
      onSuccess: () => { notifySuccess('Fee Deleted', `${deleteTarget.name} removed`); setDeleteTarget(null); setDetail(null); },
    });
  };

  const detailTabs: DetailTab[] | undefined = detail
    ? [{ id: 'info', label: 'Info', content: (
        <DetailFields fields={[
          { label: 'Fee Name', value: detail.name },
          { label: 'Category', value: detail.category },
          { label: 'Amount', value: detail.amount },
          { label: 'Frequency', value: detail.frequency },
          { label: 'Mandatory', value: detail.mandatory ? 'Yes' : 'No' },
        ]} />
      ) }]
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Fee Structure</h2>
          <p className="text-sm text-muted-foreground/60">Configure fee types, amounts, and billing frequencies</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-3.5 mr-1.5" /> Add Fee Type</Button>
      </div>
      <DataTable
        columns={columns as unknown as Column<Record<string, unknown>>[]}        data={fees as unknown as Record<string, unknown>[]}
        searchPlaceholder="Search fee types..."
        onRowClick={(r) => setDetail(r as unknown as FeeType)}
        actions={[
          { label: 'Edit', icon: Edit, onClick: (r) => { setEditing(r as unknown as FeeType); setShowForm(true); } },
          { label: 'Delete', icon: Trash2, variant: 'destructive', onClick: (r) => setDeleteTarget(r as unknown as FeeType) },
        ]}
      />
      <FormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Fee Type' : 'Add Fee Type'} fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ? { ...editing, mandatory: String(editing.mandatory) } as Record<string, string> : undefined} onSubmit={handleSave} />
      {detail && detailTabs && (
        <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)} title={detail.name} subtitle={detail.category} tabs={detailTabs} actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setShowForm(true); setDetail(null); } },
          { label: 'Delete', icon: <Trash2 className="size-3.5" />, variant: 'destructive', onClick: () => setDeleteTarget(detail) },
        ]} />
      )}
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Fee Type" description={`Remove "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ---- Roles & Permissions (API-wired) ---- */
function RolesView() {
  const { schoolId } = useAuthStore();
  const { data: rolesRes } = useRoles(schoolId);
  const createRole = useCreateSchoolRole(schoolId);
  const updateRole = useUpdateSchoolRole(schoolId);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ id: string; role: string; users: number; perms: string; desc: string } | null>(null);

  const defaultRoles = [
    { id: 'r1', role: 'Super Admin', users: 1, perms: 'Full Access', desc: 'Complete system control' },
    { id: 'r2', role: 'Principal', users: 1, perms: '48/52 permissions', desc: 'All operations except billing config' },
    { id: 'r3', role: 'Vice Principal', users: 2, perms: '40/52 permissions', desc: 'Academic and student management' },
    { id: 'r4', role: 'Head of Department', users: 6, perms: '25/52 permissions', desc: 'Department-level access' },
    { id: 'r5', role: 'Teacher', users: 35, perms: '12/52 permissions', desc: 'Class and grade management' },
    { id: 'r6', role: 'Accountant', users: 2, perms: '18/52 permissions', desc: 'Finance and billing' },
    { id: 'r7', role: 'Receptionist', users: 2, perms: '8/52 permissions', desc: 'Admissions and communication' },
    { id: 'r8', role: 'Transport Manager', users: 1, perms: '10/52 permissions', desc: 'Transport operations' },
  ];
  const roles: typeof defaultRoles = useMemo(() => {
    const apiRoles = Array.isArray(rolesRes) ? rolesRes : (rolesRes as any)?.items;
    if (apiRoles?.length) return apiRoles.map((r: any) => ({ id: r.id, role: r.name ?? r.role, users: r.userCount ?? r.users ?? 0, perms: r.permissions ?? r.perms ?? '', desc: r.description ?? r.desc ?? '' }));
    return defaultRoles;
  }, [rolesRes]);

  const roleFields: FormFieldDef[] = [
    { name: 'role', label: 'Role Name', type: 'text', required: true },
    { name: 'desc', label: 'Description', type: 'text' },
    { name: 'perms', label: 'Permissions', type: 'text', placeholder: 'e.g. 12/52 permissions' },
  ];

  const handleSaveRole = (data: Record<string, string>) => {
    if (editing) {
      updateRole.mutate({ id: editing.id, name: data.role, description: data.desc, permissions: data.perms }, {
        onSuccess: () => { notifySuccess('Role Updated', `${data.role} updated`); setShowForm(false); setEditing(null); },
      });
    } else {
      createRole.mutate({ name: data.role, description: data.desc, permissions: data.perms }, {
        onSuccess: () => { notifySuccess('Role Created', `${data.role} created`); setShowForm(false); setEditing(null); },
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Roles & Permissions</h2>
          <p className="text-sm text-muted-foreground/60">Manage staff roles and access control</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-3.5 mr-1.5" /> Create Role</Button>
      </div>
      <div className="space-y-2">
        {roles.map((r) => (
          <Card key={r.id} className="border-border bg-card backdrop-blur-xl">
            <CardContent className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10"><Shield className="size-4 text-purple-400" /></div>
                <div>
                  <p className="text-sm font-medium text-foreground/80">{r.role}</p>
                  <p className="text-xs text-muted-foreground/40">{r.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground/70">{r.perms}</p>
                  <p className="text-[10px] text-muted-foreground/30">{r.users} user{r.users > 1 ? 's' : ''}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground/40 h-7" onClick={() => { setEditing(r); setShowForm(true); }}><Edit className="size-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <FormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Role' : 'Create Role'} fields={roleFields} mode={editing ? 'edit' : 'create'} initialData={editing ? { role: editing.role, desc: editing.desc, perms: editing.perms } : undefined} onSubmit={handleSaveRole} />
    </div>
  );
}

/* ---- Document Templates ---- */
function TemplatesSettingsView() {
  const { schoolId } = useAuthStore();
  const { data: tplRes } = useTemplates(schoolId);
  const createTpl = useCreateTemplate(schoolId);
  const updateTpl = useUpdateTemplate(schoolId);
  const deleteTpl = useDeleteTemplate(schoolId);
  const tplItems = Array.isArray(tplRes) ? tplRes : (tplRes as any)?.items ?? [];
  const templates = tplItems as Template[];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [detail, setDetail] = useState<Template | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const fields: FormFieldDef[] = [
    { name: 'name', label: 'Template Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', options: [{ value: 'PDF', label: 'PDF' }, { value: 'DOCX', label: 'DOCX' }, { value: 'HTML', label: 'HTML' }] },
    { name: 'category', label: 'Category', type: 'select', options: [{ value: 'Certificate', label: 'Certificate' }, { value: 'Letter', label: 'Letter' }, { value: 'Receipt', label: 'Receipt' }, { value: 'Report', label: 'Report' }] },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: 'Active', label: 'Active' }, { value: 'Draft', label: 'Draft' }] },
    { name: 'body', label: 'Template Body', type: 'textarea' },
  ];

  const handleSave = (data: Record<string, string>) => {
    const payload = { name: data.name, type: data.type || 'PDF', category: data.category || 'Certificate', status: data.status || 'Draft', body: data.body || '' };
    if (editing) {
      updateTpl.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { notifySuccess('Template Updated', `${data.name} updated`); setShowForm(false); setEditing(null); },
      });
    } else {
      createTpl.mutate(payload, {
        onSuccess: () => { notifySuccess('Template Created', `${data.name} created`); setShowForm(false); setEditing(null); },
      });
    }
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteTpl.mutate(deleteTarget.id, {
      onSuccess: () => { notifySuccess('Template Deleted', `${deleteTarget.name} removed`); setDeleteTarget(null); setDetail(null); },
    });
  };

  const detailTabs: DetailTab[] | undefined = detail
    ? [
        { id: 'info', label: 'Info', content: <DetailFields fields={[{ label: 'Name', value: detail.name }, { label: 'Type', value: detail.type }, { label: 'Category', value: detail.category }, { label: 'Status', value: detail.status }, { label: 'Last Edited', value: detail.lastEdited }]} /> },
        { id: 'content', label: 'Content', content: <DetailFields fields={[{ label: 'Template Body', value: detail.body || 'No content' }]} /> },
      ]
    : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Document Templates</h2>
          <p className="text-sm text-muted-foreground/60">Manage printable document and certificate templates</p>
        </div>
        <Button size="sm" variant="outline" className="border-border text-muted-foreground" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="size-3.5 mr-1.5" /> Upload Template</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((t) => (
          <Card key={t.id} className="border-border bg-card backdrop-blur-xl hover:bg-accent transition-colors cursor-pointer" onClick={() => setDetail(t)}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10"><FileText className="size-4 text-amber-400" /></div>
                <StatusBadge status={t.status} />
              </div>
              <p className="text-sm font-medium text-foreground/80">{t.name}</p>
              <p className="text-xs text-muted-foreground/40 mt-1">{t.type} | Last edited {t.lastEdited}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <FormDialog open={showForm} onOpenChange={setShowForm} title={editing ? 'Edit Template' : 'New Template'} fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing as unknown as Record<string, string> | undefined} onSubmit={handleSave} />
      {detail && detailTabs && (
        <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)} title={detail.name} subtitle={`${detail.type} | ${detail.category}`} tabs={detailTabs} actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setShowForm(true); setDetail(null); } },
          { label: 'Delete', icon: <Trash2 className="size-3.5" />, variant: 'destructive', onClick: () => setDeleteTarget(detail) },
        ]} />
      )}
      <ConfirmDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)} title="Delete Template" description={`Remove "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" variant="destructive" onConfirm={handleDelete} />
    </div>
  );
}

/* ---- Branding (local state) ---- */
const defaultBrandColors = { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' };

function BrandingView() {
  const [colors, setColors] = useState(defaultBrandColors);

  const handleSave = () => notifySuccess('Branding Saved', 'Brand colors and appearance updated');

  const colorFields: { label: string; key: keyof typeof defaultBrandColors; name: string }[] = [
    { label: 'Primary Color', key: 'primary', name: 'Blue' },
    { label: 'Secondary Color', key: 'secondary', name: 'Emerald' },
    { label: 'Accent Color', key: 'accent', name: 'Amber' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Branding & Appearance</h2>
          <p className="text-sm text-muted-foreground/60">Customize school logos, colors, and portal appearance</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={handleSave}><Save className="size-3.5 mr-1.5" /> Save</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground"><Palette className="size-4 inline mr-2" />School Logo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-muted-foreground/30 transition-colors" onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/svg+xml'; input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) notifySuccess('Logo Selected', `${file.name} ready for upload`); }; input.click(); }}>
              <div className="text-center">
                <Building className="size-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground/40">Drop logo here or click to upload</p>
                <p className="text-[10px] text-muted-foreground/20 mt-1">PNG, SVG | Max 2MB | 512x512 recommended</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card backdrop-blur-xl">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-muted-foreground"><Palette className="size-4 inline mr-2" />Brand Colors</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {colorFields.map((c) => (
              <div key={c.key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="relative">
                    <div className="size-8 rounded-lg border border-border" style={{ backgroundColor: colors[c.key] }} />
                    <input type="color" value={colors[c.key]} onChange={(e) => setColors((p) => ({ ...p, [c.key]: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </label>
                  <div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="text-[10px] text-muted-foreground/30 font-mono">{colors[c.key]}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground/40">{c.name}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ================ MAIN ================ */
export function AdminSettingsSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'set_academic': return <AcademicConfigView />;
      case 'set_grading': return <GradingScalesView />;
      case 'set_fees': return <FeeConfigView />;
      case 'set_roles': return <RolesView />;
      case 'set_templates': return <TemplatesSettingsView />;
      case 'set_branding': return <BrandingView />;
      default: return <SchoolProfileView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
