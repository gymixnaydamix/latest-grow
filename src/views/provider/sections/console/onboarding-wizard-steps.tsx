/* ─── Onboarding Wizard Steps ─── Real form implementations ─── */
import { useState, useCallback, useMemo, type Dispatch, type SetStateAction } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  FileUp,
  Globe2,
  LayoutGrid,
  Loader2,
  Mail,
  Phone,
  Shield,
  UploadCloud,
  User,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProviderModuleData } from '@/hooks/api/use-provider-console';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Shared types                                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export type WizardFormData = {
  /* Step 1: Tenant Info */
  schoolName: string;
  domain: string;
  country: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  /* Step 2: Plan Selection */
  planCode: string;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  /* Step 3: Module Config */
  enabledModules: string[];
  /* Step 4: Data Migration */
  studentsFile: File | null;
  teachersFile: File | null;
  coursesFile: File | null;
  skipMigration: boolean;
  /* Step 5: Review & Launch */
  agreedToTerms: boolean;
};

export const INITIAL_WIZARD_DATA: WizardFormData = {
  schoolName: '',
  domain: '',
  country: '',
  adminName: '',
  adminEmail: '',
  adminPhone: '',
  planCode: '',
  billingCycle: 'MONTHLY',
  enabledModules: ['attendance', 'gradebook', 'calendar', 'timetable', 'exams', 'assignments'],
  studentsFile: null,
  teachersFile: null,
  coursesFile: null,
  skipMigration: false,
  agreedToTerms: false,
};

type StepProps = {
  data: WizardFormData;
  setData: Dispatch<SetStateAction<WizardFormData>>;
};

/* ── Helper: field wrapper ── */
function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </Label>
      {children}
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

/* ── Helper: input styling for white-bg context ── */
const inputCls = 'h-9 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-teal-500 focus-visible:ring-teal-500/20';

/* ── Countries list ── */
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Singapore', 'UAE', 'South Africa', 'Brazil', 'Japan', 'South Korea', 'Nigeria',
  'Kenya', 'Indonesia', 'Malaysia', 'Philippines', 'Saudi Arabia', 'Mexico',
];

/* ── Platform modules ── */
const PLATFORM_MODULES = [
  { id: 'attendance', name: 'Attendance Tracking', description: 'Daily attendance, late tracking, reports', icon: CheckCircle2 },
  { id: 'gradebook', name: 'Gradebook', description: 'Grades, GPA, transcripts', icon: LayoutGrid },
  { id: 'exams', name: 'Examinations', description: 'Exam scheduling, hall tickets, results', icon: Shield },
  { id: 'assignments', name: 'Assignments', description: 'Homework, submissions, grading', icon: FileUp },
  { id: 'timetable', name: 'Timetable', description: 'Class schedules, room allocation', icon: LayoutGrid },
  { id: 'calendar', name: 'Calendar & Events', description: 'Academic calendar, holidays, events', icon: LayoutGrid },
  { id: 'library', name: 'Library Management', description: 'Book catalog, issue/return, fines', icon: Building2 },
  { id: 'transport', name: 'Transport', description: 'Routes, buses, GPS tracking', icon: Globe2 },
  { id: 'hostel', name: 'Hostel / Boarding', description: 'Room allocation, mess, attendance', icon: Building2 },
  { id: 'fee_mgmt', name: 'Fee Management', description: 'Fee structure, payments, receipts', icon: CreditCard },
  { id: 'communication', name: 'Communication Hub', description: 'Messaging, SMS, email, push', icon: Mail },
  { id: 'reports', name: 'Advanced Reports', description: 'Custom analytics, dashboards', icon: LayoutGrid },
  { id: 'parent_portal', name: 'Parent Portal', description: 'Parent self-service dashboard', icon: User },
  { id: 'student_portal', name: 'Student Portal', description: 'Student self-service dashboard', icon: User },
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Step 1: Tenant Info                                             */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function TenantInfoStep({ data, setData }: StepProps) {
  const update = useCallback(
    <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [setData],
  );

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="School / Institution Name" required>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className={`${inputCls} pl-9`}
            placeholder="Oakridge International School"
            value={data.schoolName}
            onChange={(e) => update('schoolName', e.target.value)}
          />
        </div>
      </Field>

      <Field label="Tenant Domain" required hint="Letters, numbers, hyphens only. Will be: domain.growyourneed.com">
        <div className="relative">
          <Globe2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className={`${inputCls} pl-9 pr-[11rem]`}
            placeholder="oakridge-intl"
            value={data.domain}
            onChange={(e) => update('domain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">.growyourneed.com</span>
        </div>
      </Field>

      <Field label="Country" required>
        <Select value={data.country} onValueChange={(v) => update('country', v)}>
          <SelectTrigger className={`w-full ${inputCls}`}>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {COUNTRIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div /> {/* spacer for grid alignment */}

      <Field label="Admin Full Name" required>
        <div className="relative">
          <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className={`${inputCls} pl-9`}
            placeholder="Jane Doe"
            value={data.adminName}
            onChange={(e) => update('adminName', e.target.value)}
          />
        </div>
      </Field>

      <Field label="Admin Email" required>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className={`${inputCls} pl-9`}
            type="email"
            placeholder="admin@oakridge.edu"
            value={data.adminEmail}
            onChange={(e) => update('adminEmail', e.target.value)}
          />
        </div>
      </Field>

      <Field label="Admin Phone" hint="Include country code, e.g. +91-9876543210">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className={`${inputCls} pl-9`}
            type="tel"
            placeholder="+91-9876543210"
            value={data.adminPhone}
            onChange={(e) => update('adminPhone', e.target.value)}
          />
        </div>
      </Field>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Step 2: Plan Selection                                          */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
type PlanCard = {
  code: string;
  name: string;
  price: number;
  annualPrice: number;
  features: string[];
  recommended?: boolean;
};

const FALLBACK_PLANS: PlanCard[] = [
  {
    code: 'BASIC',
    name: 'Basic',
    price: 299,
    annualPrice: 2990,
    features: ['Up to 500 students', '5 admin users', 'Core modules', 'Email support'],
  },
  {
    code: 'STANDARD',
    name: 'Standard',
    price: 599,
    annualPrice: 5990,
    features: ['Up to 2,000 students', '15 admin users', 'All modules', 'Priority support', 'Custom branding'],
    recommended: true,
  },
  {
    code: 'PREMIUM',
    name: 'Premium',
    price: 999,
    annualPrice: 9990,
    features: ['Up to 10,000 students', 'Unlimited admins', 'All modules', '24/7 support', 'Custom domain', 'API access'],
  },
  {
    code: 'ENTERPRISE',
    name: 'Enterprise',
    price: 0,
    annualPrice: 0,
    features: ['Unlimited students', 'Unlimited admins', 'All modules', 'Dedicated success manager', 'SLA guarantee', 'On-premise option'],
  },
];

export function PlanSelectionStep({ data, setData }: StepProps) {
  const moduleQuery = useProviderModuleData();
  const apiPlans = (moduleQuery.data?.plans ?? []) as Array<Record<string, unknown>>;

  /* Merge API plans into card format (fall back to built-in if empty) */
  const plans: PlanCard[] = useMemo(() => {
    if (apiPlans.length === 0) return FALLBACK_PLANS;
    return apiPlans.map((p) => ({
      code: String(p.code ?? p.id ?? ''),
      name: String(p.name ?? p.code ?? ''),
      price: Number(p.priceMonthly ?? p.price ?? 0),
      annualPrice: Number(p.priceAnnual ?? Number(p.priceMonthly ?? 0) * 10),
      features: Array.isArray(p.features) ? (p.features as string[]) : [],
      recommended: Boolean(p.recommended),
    }));
  }, [apiPlans]);

  const update = useCallback(
    <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [setData],
  );

  const priceDisplay = (plan: PlanCard) => {
    if (plan.price === 0) return 'Custom';
    return data.billingCycle === 'MONTHLY'
      ? `$${plan.price}/mo`
      : `$${plan.annualPrice}/yr`;
  };

  return (
    <div className="space-y-5">
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <span className={`text-xs font-semibold ${data.billingCycle === 'MONTHLY' ? 'text-teal-700' : 'text-slate-400'}`}>Monthly</span>
        <Switch
          checked={data.billingCycle === 'ANNUAL'}
          onCheckedChange={(checked) => update('billingCycle', checked ? 'ANNUAL' : 'MONTHLY')}
          className="data-[state=checked]:bg-teal-600"
        />
        <span className={`text-xs font-semibold ${data.billingCycle === 'ANNUAL' ? 'text-teal-700' : 'text-slate-400'}`}>
          Annual <span className="ml-1 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-700">Save 17%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => {
          const selected = data.planCode === plan.code;
          return (
            <button
              key={plan.code}
              onClick={() => update('planCode', plan.code)}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                selected
                  ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/30'
                  : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/30'
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-teal-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  RECOMMENDED
                </span>
              )}
              {selected && (
                <div className="absolute right-3 top-3">
                  <Check className="size-5 text-teal-600" />
                </div>
              )}
              <h4 className="text-sm font-bold text-slate-900">{plan.name}</h4>
              <p className="mt-1 text-lg font-bold text-teal-700">{priceDisplay(plan)}</p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <Check className="mt-0.5 size-3 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Step 3: Module Config                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ModuleConfigStep({ data, setData }: StepProps) {
  const toggleModule = useCallback(
    (moduleId: string) => {
      setData((prev) => {
        const exists = prev.enabledModules.includes(moduleId);
        return {
          ...prev,
          enabledModules: exists
            ? prev.enabledModules.filter((m) => m !== moduleId)
            : [...prev.enabledModules, moduleId],
        };
      });
    },
    [setData],
  );

  const toggleAll = useCallback(
    (on: boolean) => {
      setData((prev) => ({
        ...prev,
        enabledModules: on ? PLATFORM_MODULES.map((m) => m.id) : [],
      }));
    },
    [setData],
  );

  return (
    <div className="space-y-4">
      {/* Toggle-all bar */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">
        <div>
          <p className="text-xs font-semibold text-slate-700">{data.enabledModules.length} of {PLATFORM_MODULES.length} modules enabled</p>
          <p className="text-[10px] text-slate-400">Toggle modules the tenant needs. Extra modules can be enabled later.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="h-7 border-slate-300 text-[10px] text-slate-600 hover:bg-white" onClick={() => toggleAll(true)}>
            Enable All
          </Button>
          <Button size="sm" variant="outline" className="h-7 border-slate-300 text-[10px] text-slate-600 hover:bg-white" onClick={() => toggleAll(false)}>
            Disable All
          </Button>
        </div>
      </div>

      {/* Module grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_MODULES.map((mod) => {
          const enabled = data.enabledModules.includes(mod.id);
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => toggleModule(mod.id)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                enabled
                  ? 'border-teal-400/50 bg-teal-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                enabled ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
              }`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-semibold ${enabled ? 'text-teal-800' : 'text-slate-600'}`}>{mod.name}</p>
                  <Switch checked={enabled} size="sm" className="data-[state=checked]:bg-teal-600" tabIndex={-1} />
                </div>
                <p className="text-[10px] text-slate-400">{mod.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Step 4: Data Migration                                          */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
type FileUploadCardProps = {
  label: string;
  description: string;
  accept: string;
  file: File | null;
  onSelect: (file: File | null) => void;
  disabled?: boolean;
};

function FileUploadCard({ label, description, accept, file, onSelect, disabled }: FileUploadCardProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) onSelect(dropped);
    },
    [disabled, onSelect],
  );

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
        disabled
          ? 'border-slate-200 bg-slate-50 opacity-50'
          : dragging
            ? 'border-teal-400 bg-teal-50'
            : file
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-slate-300 bg-white hover:border-teal-300'
      }`}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {file ? (
        <div className="space-y-2">
          <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
          <p className="text-xs font-semibold text-emerald-700">{file.name}</p>
          <p className="text-[10px] text-emerald-500">{(file.size / 1024).toFixed(1)} KB</p>
          <Button
            size="sm"
            variant="outline"
            className="h-6 border-red-200 text-[10px] text-red-600 hover:bg-red-50"
            onClick={() => onSelect(null)}
            disabled={disabled}
          >
            <X className="mr-1 size-3" />Remove
          </Button>
        </div>
      ) : (
        <label className={`space-y-2 ${disabled ? '' : 'cursor-pointer'}`}>
          <UploadCloud className="mx-auto size-8 text-slate-400" />
          <p className="text-xs font-semibold text-slate-700">{label}</p>
          <p className="text-[10px] text-slate-400">{description}</p>
          <p className="text-[10px] text-teal-600">Click or drag & drop</p>
          <input
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onSelect(f);
              e.target.value = '';
            }}
          />
        </label>
      )}
    </div>
  );
}

export function DataMigrationStep({ data, setData }: StepProps) {
  const update = useCallback(
    <K extends keyof WizardFormData>(key: K, value: WizardFormData[K]) =>
      setData((prev) => ({ ...prev, [key]: value })),
    [setData],
  );

  return (
    <div className="space-y-5">
      {/* Skip migration toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="text-xs font-semibold text-slate-700">Skip Data Migration</p>
          <p className="text-[10px] text-slate-400">Enable if the tenant will import data manually later.</p>
        </div>
        <Switch
          checked={data.skipMigration}
          onCheckedChange={(v) => update('skipMigration', v)}
          className="data-[state=checked]:bg-amber-500"
        />
      </div>

      {/* File uploads */}
      <div className="grid gap-4 sm:grid-cols-3">
        <FileUploadCard
          label="Students CSV"
          description="Columns: name, email, class, section, roll_no"
          accept=".csv,.xlsx"
          file={data.studentsFile}
          onSelect={(f) => update('studentsFile', f)}
          disabled={data.skipMigration}
        />
        <FileUploadCard
          label="Teachers CSV"
          description="Columns: name, email, department, subjects"
          accept=".csv,.xlsx"
          file={data.teachersFile}
          onSelect={(f) => update('teachersFile', f)}
          disabled={data.skipMigration}
        />
        <FileUploadCard
          label="Courses CSV"
          description="Columns: code, name, class, teacher_email"
          accept=".csv,.xlsx"
          file={data.coursesFile}
          onSelect={(f) => update('coursesFile', f)}
          disabled={data.skipMigration}
        />
      </div>

      {/* Summary bar */}
      {!data.skipMigration && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              {data.studentsFile ? <CheckCircle2 className="size-3 text-emerald-500" /> : <X className="size-3 text-slate-300" />}
              Students
            </span>
            <span className="flex items-center gap-1">
              {data.teachersFile ? <CheckCircle2 className="size-3 text-emerald-500" /> : <X className="size-3 text-slate-300" />}
              Teachers
            </span>
            <span className="flex items-center gap-1">
              {data.coursesFile ? <CheckCircle2 className="size-3 text-emerald-500" /> : <X className="size-3 text-slate-300" />}
              Courses
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Step 5: Review & Launch                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ReviewRow({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-2 py-1.5">
      {Icon && <Icon className="mt-0.5 size-3.5 shrink-0 text-slate-400" />}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-xs font-semibold text-slate-800">{value || '—'}</p>
      </div>
    </div>
  );
}

export function ReviewLaunchStep({ data, setData, isLaunching }: StepProps & { isLaunching?: boolean }) {
  const selectedModules = PLATFORM_MODULES.filter((m) => data.enabledModules.includes(m.id));
  const filesCount = [data.studentsFile, data.teachersFile, data.coursesFile].filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Summary sections */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Tenant info summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700">
            <Building2 className="size-4 text-teal-500" />Tenant Information
          </h4>
          <div className="space-y-1">
            <ReviewRow label="School Name" value={data.schoolName} icon={Building2} />
            <ReviewRow label="Domain" value={data.domain ? `${data.domain}.growyourneed.com` : ''} icon={Globe2} />
            <ReviewRow label="Country" value={data.country} icon={Globe2} />
            <ReviewRow label="Admin" value={data.adminName} icon={User} />
            <ReviewRow label="Email" value={data.adminEmail} icon={Mail} />
            {data.adminPhone && <ReviewRow label="Phone" value={data.adminPhone} icon={Phone} />}
          </div>
        </div>

        {/* Plan & billing summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700">
            <CreditCard className="size-4 text-teal-500" />Plan & Billing
          </h4>
          <div className="space-y-1">
            <ReviewRow label="Plan" value={data.planCode || 'Not selected'} icon={CreditCard} />
            <ReviewRow label="Billing Cycle" value={data.billingCycle} icon={CreditCard} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Modules summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700">
            <LayoutGrid className="size-4 text-teal-500" />Modules ({selectedModules.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {selectedModules.map((m) => (
              <span key={m.id} className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-medium text-teal-700">
                {m.name}
              </span>
            ))}
            {selectedModules.length === 0 && <p className="text-[10px] text-slate-400">No modules selected</p>}
          </div>
        </div>

        {/* Migration summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700">
            <FileUp className="size-4 text-teal-500" />Data Migration
          </h4>
          {data.skipMigration ? (
            <p className="text-xs text-amber-600">Migration skipped — tenant will import later</p>
          ) : (
            <p className="text-xs text-slate-600">{filesCount} file{filesCount !== 1 ? 's' : ''} ready for import</p>
          )}
        </div>
      </div>

      {/* Validation checklist */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h4 className="mb-3 text-xs font-bold text-slate-700">Pre-Launch Checklist</h4>
        <div className="space-y-2">
          <ChecklistItem ok={!!data.schoolName && !!data.domain && !!data.country && !!data.adminName && !!data.adminEmail} label="Tenant information is complete" />
          <ChecklistItem ok={!!data.planCode} label="Pricing plan is selected" />
          <ChecklistItem ok={data.enabledModules.length > 0} label="At least one module is enabled" />
          <ChecklistItem ok={data.skipMigration || filesCount > 0} label="Data migration is configured (or skipped)" />
          <ChecklistItem ok={data.agreedToTerms} label="Terms & conditions accepted" />
        </div>
      </div>

      {/* Terms agreement */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <Checkbox
          checked={data.agreedToTerms}
          onCheckedChange={(checked) => setData((prev) => ({ ...prev, agreedToTerms: Boolean(checked) }))}
          className="mt-0.5 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
        />
        <div>
          <p className="text-xs font-semibold text-slate-700">I confirm that all details are correct</p>
          <p className="text-[10px] text-slate-400">
            By launching this tenant, you agree to the platform terms of service and acknowledge that the tenant will be provisioned immediately.
          </p>
        </div>
      </div>

      {/* Launch status */}
      {isLaunching && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-4">
          <Loader2 className="size-4 animate-spin text-teal-600" />
          <p className="text-xs font-semibold text-teal-700">Provisioning tenant… This may take a moment.</p>
        </div>
      )}
    </div>
  );
}

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {ok
        ? <CheckCircle2 className="size-4 text-emerald-500" />
        : <div className="size-4 rounded-full border-2 border-slate-300" />
      }
      <span className={`text-xs ${ok ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Validation helper                                               */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function validateStep(step: number, data: WizardFormData): string | null {
  switch (step) {
    case 0: {
      if (!data.schoolName.trim()) return 'School name is required';
      if (!data.domain.trim()) return 'Domain is required';
      if (data.domain.length < 3) return 'Domain must be at least 3 characters';
      if (!data.country) return 'Country is required';
      if (!data.adminName.trim()) return 'Admin name is required';
      if (!data.adminEmail.trim()) return 'Admin email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adminEmail)) return 'Invalid email format';
      return null;
    }
    case 1: {
      if (!data.planCode) return 'Please select a plan';
      return null;
    }
    case 2: {
      if (data.enabledModules.length === 0) return 'Enable at least one module';
      return null;
    }
    case 3: {
      /* Migration step — files are optional if skipMigration is on */
      return null;
    }
    case 4: {
      if (!data.agreedToTerms) return 'Please accept the terms to proceed';
      return null;
    }
    default:
      return null;
  }
}
