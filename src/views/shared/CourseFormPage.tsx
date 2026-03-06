/* ─── CourseFormPage ─── Multi-step wizard for course create/edit ─── */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Check,
  BookOpen, Settings, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownPreview } from '@/components/features/MarkdownPreview';
import { useCourse, useCreateCourse, useUpdateCourse } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';

/* ── Constants ── */
const GRADE_LEVELS = ['K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'];
const SEMESTERS = ['Fall 2024', 'Spring 2025', 'Summer 2025', 'Fall 2025', 'Spring 2026'];

const STEPS = [
  { id: 'basic', label: 'Basic Info', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'review', label: 'Review', icon: Eye },
] as const;

interface FormData {
  name: string;
  description: string;
  gradeLevel: string;
  semester: string;
  teacherId: string;
}

const emptyForm: FormData = {
  name: '',
  description: '',
  gradeLevel: '',
  semester: '',
  teacherId: '',
};

/* ── Validation ── */
function validateStep(step: number, data: FormData): string[] {
  const errors: string[] = [];
  if (step === 0) {
    if (!data.name.trim()) errors.push('Course name is required');
    if (data.name.length > 200) errors.push('Name must be under 200 characters');
  }
  if (step === 1) {
    if (!data.gradeLevel) errors.push('Grade level is required');
    if (!data.semester) errors.push('Semester is required');
    if (!data.teacherId.trim()) errors.push('Teacher ID is required');
  }
  return errors;
}

/* ──────────────────────────────────────────────────────────────── */
export function CourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { schoolId, user } = useAuthStore();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { data: existingCourse, isLoading: courseLoading } = useCourse(isEdit ? id! : null);
  const createMut = useCreateCourse(schoolId ?? '');
  const updateMut = useUpdateCourse();

  /* Pre-fill form when editing */
  useEffect(() => {
    if (existingCourse && isEdit) {
      setForm({
        name: existingCourse.name ?? '',
        description: existingCourse.description ?? '',
        gradeLevel: existingCourse.gradeLevel ?? '',
        semester: existingCourse.semester ?? '',
        teacherId: existingCourse.teacherId ?? '',
      });
    }
  }, [existingCourse, isEdit]);

  /* Auto-fill teacher ID for teachers creating their own course */
  useEffect(() => {
    if (!isEdit && user?.role === 'TEACHER' && user.id && !form.teacherId) {
      setForm((f) => ({ ...f, teacherId: user.id }));
    }
  }, [isEdit, user, form.teacherId]);

  const update = (key: keyof FormData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors([]);
  };

  const next = () => {
    const errs = validateStep(step, form);
    if (errs.length) { setErrors(errs); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    setErrors([]);
  };

  const prev = () => { setStep((s) => Math.max(s - 1, 0)); setErrors([]); };

  const handleSubmit = () => {
    setSubmitted(true);
    if (isEdit) {
      updateMut.mutate({ id: id!, ...form }, {
        onSuccess: () => navigate(`/courses/${id}`),
      });
    } else {
      createMut.mutate(form, {
        onSuccess: () => navigate('/courses'),
      });
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  if (isEdit && courseLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-6">
        <Skeleton className="h-6 w-1/3 bg-white/6" />
        <Skeleton className="h-64 w-full rounded-2xl bg-white/4" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <Link to="/courses" className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors mb-3">
          <ChevronLeft className="size-3" /> Back to Courses
        </Link>
        <h1 className="text-xl font-bold text-white/90">
          {isEdit ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {isEdit ? 'Update course details below.' : 'Fill out the wizard to create a new course.'}
        </p>
      </div>

      {/* ── Step indicator ── */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => {
          const StepIcon = s.icon;
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={s.id}
              onClick={() => { if (i < step) setStep(i); }}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all
                ${isActive ? 'bg-indigo-600 text-white' : isDone ? 'bg-indigo-500/15 text-indigo-400 cursor-pointer' : 'bg-white/4 text-white/30 cursor-default'}
              `}
            >
              {isDone ? <Check className="size-3" /> : <StepIcon className="size-3" />}
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Error display ── */}
      {errors.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-1">
          {errors.map((e, i) => (
            <p key={i} className="text-xs text-red-400">• {e}</p>
          ))}
        </div>
      )}

      {/* ═══ Step 0: Basic Info ═══ */}
      {step === 0 && (
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs text-white/60">Course Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Introduction to Algebra"
                className="bg-white/3 border-white/8 text-white/80 placeholder:text-white/25 h-10"
                maxLength={200}
              />
              <p className="text-[10px] text-white/25">{form.name.length}/200 characters</p>
            </div>

            <MarkdownPreview
              label="Description"
              value={form.description}
              onChange={(v) => update('description', v)}
              placeholder="Describe what students will learn in this course..."
              rows={6}
            />
          </CardContent>
        </Card>
      )}

      {/* ═══ Step 1: Settings ═══ */}
      {step === 1 && (
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Course Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-white/60">Grade Level *</Label>
                <Select value={form.gradeLevel} onValueChange={(v) => update('gradeLevel', v)}>
                  <SelectTrigger className="bg-white/3 border-white/8 text-white/70 h-10">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-white/60">Semester *</Label>
                <Select value={form.semester} onValueChange={(v) => update('semester', v)}>
                  <SelectTrigger className="bg-white/3 border-white/8 text-white/70 h-10">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-white/60">Teacher ID *</Label>
              <Input
                value={form.teacherId}
                onChange={(e) => update('teacherId', e.target.value)}
                placeholder="Teacher user ID"
                className="bg-white/3 border-white/8 text-white/80 placeholder:text-white/25 h-10"
                disabled={user?.role === 'TEACHER'}
              />
              {user?.role === 'TEACHER' && (
                <p className="text-[10px] text-white/25">Automatically set to your account.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ Step 2: Review ═══ */}
      {step === 2 && (
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-sm text-white/80">Review &amp; Confirm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-white/6 bg-white/2 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white/85">{form.name || 'Untitled Course'}</h3>
                <Badge variant="secondary" className="bg-white/8 text-white/60 border-white/10 text-xs">
                  {form.gradeLevel || '—'}
                </Badge>
              </div>
              <p className="text-sm text-white/50 whitespace-pre-line">{form.description || 'No description'}</p>
              <div className="flex gap-4 text-xs text-white/40 pt-2 border-t border-white/5">
                <span>Semester: <strong className="text-white/60">{form.semester || '—'}</strong></span>
                <span>Teacher: <strong className="text-white/60 font-mono">{form.teacherId || '—'}</strong></span>
              </div>
            </div>

            {submitted && (createMut.isError || updateMut.isError) && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <p className="text-xs text-red-400">
                  {(createMut.error || updateMut.error)?.message || 'Something went wrong. Please try again.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Navigation buttons ── */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={step === 0 ? () => navigate('/courses') : prev}
          className="border-white/10 text-white/60 text-xs h-9 gap-1"
        >
          <ChevronLeft className="size-3" /> {step === 0 ? 'Cancel' : 'Back'}
        </Button>

        {step < STEPS.length - 1 ? (
          <Button onClick={next} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 gap-1">
            Next <ChevronRight className="size-3" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 gap-1.5"
          >
            {isPending ? 'Saving...' : isEdit ? 'Update Course' : 'Create Course'}
            <Check className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
