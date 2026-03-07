/* ─── Lessons & Lesson Plans Section ─────────────────────────────── 
 * Routes: lesson_calendar | create_lesson | my_lessons | resource_library | curriculum_map
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useMemo } from 'react';
import {
  BookOpen, ChevronLeft, ChevronRight,
  FileText, FolderOpen, Link2, Plus, Search, Target, Upload,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCourses, useCurriculumStandards } from '@/hooks/api';
import { useCreateLessonPlan, useUploadResource, useTeacherLessonPlans } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import type { Course, CurriculumStandard } from '@root/types';
import {
  TeacherSectionShell, GlassCard, MetricCard, StatusBadge, EmptyState,
} from './shared';
import type { TeacherSectionProps } from './shared';
import {
  lessonPlansDemo as FALLBACK_lessonPlansDemo, teacherClassesDemo as FALLBACK_teacherClassesDemo, formatDateLabel,
} from './teacher-demo-data';

/* ── Week helpers ── */
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

function getWeekDates(offset: number): { label: string; iso: string }[] {
  const base = new Date();
  base.setDate(base.getDate() - base.getDay() + 1 + offset * 7); // Monday
  return WEEKDAYS.map((_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return {
      label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      iso: d.toISOString().slice(0, 10),
    };
  });
}

/* ── Resource library demo ── */
const resourceCategories = [
  { id: 'worksheets', name: 'Worksheets', icon: <FileText className="size-4" />, count: 24, color: 'text-indigo-400' },
  { id: 'slides', name: 'Slide Decks', icon: <FolderOpen className="size-4" />, count: 18, color: 'text-emerald-400' },
  { id: 'videos', name: 'Video Links', icon: <Link2 className="size-4" />, count: 12, color: 'text-pink-400' },
  { id: 'activities', name: 'Interactive Activities', icon: <Target className="size-4" />, count: 9, color: 'text-amber-400' },
];

const resourceItems = [
  { id: 'r1', name: 'Quadratic Functions Practice Set', category: 'worksheets', subject: 'Algebra II', date: '2026-03-01', format: 'PDF' },
  { id: 'r2', name: 'Derivatives Intro — Animated Slides', category: 'slides', subject: 'AP Calculus', date: '2026-02-28', format: 'PPTX' },
  { id: 'r3', name: 'Khan Academy: Triangle Proofs', category: 'videos', subject: 'Geometry', date: '2026-02-25', format: 'Link' },
  { id: 'r4', name: 'Desmos: Projectile Motion Sim', category: 'activities', subject: 'Physics', date: '2026-02-20', format: 'Link' },
  { id: 'r5', name: 'Fraction Operations Review Sheet', category: 'worksheets', subject: 'Pre-Algebra', date: '2026-02-18', format: 'PDF' },
  { id: 'r6', name: 'Unit Circle Reference Guide', category: 'worksheets', subject: 'AP Calculus', date: '2026-03-02', format: 'PDF' },
  { id: 'r7', name: 'Polynomial Long Division Walkthrough', category: 'videos', subject: 'Algebra II', date: '2026-02-22', format: 'Link' },
  { id: 'r8', name: 'GeoGebra: Geometric Transformations', category: 'activities', subject: 'Geometry', date: '2026-03-03', format: 'Link' },
];

/* ── Curriculum map demo ── */
const curriculumMapDemo = [
  { standard: 'A-SSE.3', title: 'Factor quadratics to reveal zeros', subject: 'Algebra II', coverage: 85, lessons: 4, status: 'covered' as const },
  { standard: 'A-REI.4', title: 'Solve quadratic equations', subject: 'Algebra II', coverage: 60, lessons: 3, status: 'in-progress' as const },
  { standard: 'G-CO.8', title: 'Triangle congruence criteria', subject: 'Geometry', coverage: 100, lessons: 5, status: 'covered' as const },
  { standard: 'AP.D.1', title: 'Definition of the derivative', subject: 'AP Calculus', coverage: 40, lessons: 2, status: 'in-progress' as const },
  { standard: 'AP.D.2', title: 'Differentiation rules', subject: 'AP Calculus', coverage: 0, lessons: 0, status: 'planned' as const },
  { standard: 'P-FM.1', title: 'Newton\'s Laws of Motion', subject: 'Physics', coverage: 90, lessons: 6, status: 'covered' as const },
  { standard: 'N-RN.1', title: 'Rational & irrational numbers', subject: 'Pre-Algebra', coverage: 100, lessons: 3, status: 'covered' as const },
  { standard: 'EE-7', title: 'Solve linear equations', subject: 'Pre-Algebra', coverage: 75, lessons: 4, status: 'in-progress' as const },
];

export function LessonsSection({ schoolId, teacherId }: TeacherSectionProps) {
  const { activeHeader, setHeader } = useNavigationStore();
  const view = activeHeader || 'lesson_calendar';

  const { data: coursesRes } = useCourses(schoolId);
  const { data: standardsRes } = useCurriculumStandards(schoolId);
  const courses: Course[] = coursesRes ?? [];
  const standards: CurriculumStandard[] = standardsRes ?? [];
  const classes = courses.length > 0
    ? courses.filter(c => !teacherId || c.teacherId === teacherId)
    : FALLBACK_teacherClassesDemo;

  const createLessonMut = useCreateLessonPlan();
  const uploadResourceMut = useUploadResource();
  const { data: apiLessonPlans } = useTeacherLessonPlans();
  const lessonPlans = (apiLessonPlans as unknown as typeof FALLBACK_lessonPlansDemo) ?? FALLBACK_lessonPlansDemo;

  /* ── Calendar state ── */
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  /* ── Create lesson form state ── */
  const [formClass, setFormClass] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formObjectives, setFormObjectives] = useState('');
  const [formResources, setFormResources] = useState('');
  const [formDuration, setFormDuration] = useState('50');

  /* ── My lessons filter ── */
  const [lessonFilter, setLessonFilter] = useState<'all' | 'draft' | 'ready' | 'taught'>('all');
  const filteredLessons = lessonPlans.filter(
    lp => lessonFilter === 'all' || lp.status === lessonFilter,
  );

  /* ── Resource search ── */
  const [resourceSearch, setResourceSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filteredResources = resourceItems.filter(r => {
    const matchSearch = !resourceSearch || r.name.toLowerCase().includes(resourceSearch.toLowerCase());
    const matchCat = !activeCategory || r.category === activeCategory;
    return matchSearch && matchCat;
  });

  const toneMap: Record<string, 'good' | 'warn' | 'neutral' | 'info'> = {
    draft: 'warn', ready: 'good', taught: 'info', reviewed: 'neutral',
  };

  /* ── Render helpers ── */
  const renderCalendar = () => (
    <div className="space-y-4" data-animate>
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" className="text-white/40" onClick={() => setWeekOffset(o => o - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-medium text-white/60">
          {weekDates[0]?.label} — {weekDates[4]?.label}
        </span>
        <Button variant="ghost" size="icon" className="text-white/40" onClick={() => setWeekOffset(o => o + 1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {weekDates.map(day => {
          const plans = lessonPlans.filter(lp => lp.date === day.iso);
          return (
            <div key={day.iso} className="rounded-xl border border-white/6 bg-white/3 p-3 min-h-[160px]">
              <p className="text-[11px] font-medium text-white/40 mb-2">{day.label}</p>
              {plans.length === 0 && (
                <p className="text-[10px] text-white/20 italic">No lessons</p>
              )}
              {plans.map(lp => (
                <div
                  key={lp.id}
                  className="mb-1.5 rounded-lg border border-white/8 bg-white/4 p-2 cursor-pointer hover:bg-white/6 transition-colors"
                  onClick={() => notifySuccess('Lesson plan', `Viewing: ${lp.title}`)}
                >
                  <p className="text-[11px] font-medium text-white/70 truncate">{lp.title}</p>
                  <p className="text-[9px] text-white/30">{lp.className}</p>
                  <StatusBadge status={lp.status} tone={toneMap[lp.status] ?? 'neutral'} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCreateLesson = () => (
    <GlassCard data-animate>
      <div className="flex items-center gap-2 mb-5">
        <Plus className="size-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">New Lesson Plan</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs text-white/50">Title</Label>
          <Input
            value={formTitle}
            onChange={e => setFormTitle(e.target.value)}
            placeholder="e.g. Introduction to Derivatives"
            className="border-white/8 bg-white/4 text-white/80 placeholder:text-white/25"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-white/50">Class</Label>
          <Select value={formClass} onValueChange={setFormClass}>
            <SelectTrigger className="border-white/8 bg-white/4 text-white/80">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {(classes as { id: string; name: string }[]).map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label className="text-xs text-white/50">Learning Objectives</Label>
          <Textarea
            value={formObjectives}
            onChange={e => setFormObjectives(e.target.value)}
            placeholder="Students will be able to..."
            rows={3}
            className="border-white/8 bg-white/4 text-white/80 placeholder:text-white/25"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-white/50">Resources (comma-separated)</Label>
          <Input
            value={formResources}
            onChange={e => setFormResources(e.target.value)}
            placeholder="Textbook Ch. 4, Desmos Activity"
            className="border-white/8 bg-white/4 text-white/80 placeholder:text-white/25"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-white/50">Duration (minutes)</Label>
          <Input
            type="number"
            value={formDuration}
            onChange={e => setFormDuration(e.target.value)}
            className="border-white/8 bg-white/4 text-white/80"
          />
        </div>
      </div>
      <div className="mt-5 flex gap-2 justify-end">
        <Button variant="ghost" className="text-white/40 hover:text-white/60" onClick={() => setHeader('my_lessons')}>Cancel</Button>
        <Button className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30" onClick={() => { createLessonMut.mutate({ title: formTitle, classId: formClass, objectives: formObjectives, resources: formResources, duration: formDuration, status: 'draft' }, { onSuccess: () => { notifySuccess('Draft saved', `"${formTitle}" saved as draft`); setHeader('my_lessons'); } }); }}>
          Save as Draft
        </Button>
        <Button className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30" onClick={() => { createLessonMut.mutate({ title: formTitle, classId: formClass, objectives: formObjectives, resources: formResources, duration: formDuration, status: 'ready' }, { onSuccess: () => { notifySuccess('Lesson plan ready', `"${formTitle}" marked as ready`); setHeader('my_lessons'); } }); }}>
          Save & Mark Ready
        </Button>
      </div>
    </GlassCard>
  );

  const renderMyLessons = () => (
    <div className="space-y-4" data-animate>
      <div className="flex flex-wrap items-center gap-2">
        {(['all', 'draft', 'ready', 'taught'] as const).map(f => (
          <Button
            key={f}
            variant="ghost"
            size="sm"
            className={`text-xs capitalize ${lessonFilter === f ? 'bg-white/8 text-white/80' : 'text-white/35 hover:text-white/60'}`}
            onClick={() => setLessonFilter(f)}
          >
            {f === 'all' ? 'All Plans' : f}
          </Button>
        ))}
        <Button
          size="sm"
          className="ml-auto bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs"
          onClick={() => setHeader('create_lesson')}
        >
          <Plus className="size-3 mr-1" /> New Plan
        </Button>
      </div>

      {filteredLessons.length === 0 ? (
        <EmptyState title="No lesson plans" message="Create your first lesson plan to get started." icon={<BookOpen className="size-8" />} />
      ) : (
        <div className="space-y-2">
          {filteredLessons.map(lp => (
            <GlassCard key={lp.id} className="flex items-start gap-4 hover:bg-white/4 transition-colors cursor-pointer" onClick={() => notifySuccess('Lesson plan', `Viewing: ${lp.title}`)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-white/80 truncate">{lp.title}</p>
                  <StatusBadge status={lp.status} tone={toneMap[lp.status] ?? 'neutral'} />
                </div>
                <p className="text-xs text-white/40">{lp.className} · {formatDateLabel(lp.date)} · {lp.duration}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {lp.objectives.map((obj, i) => (
                    <span key={i} className="rounded-full border border-white/8 bg-white/4 px-2 py-0.5 text-[10px] text-white/40">
                      {obj}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {lp.resources.map((r, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] border-white/10 text-white/30">{r}</Badge>
                ))}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );

  const renderResourceLibrary = () => (
    <div className="space-y-4" data-animate>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/25" />
          <Input
            value={resourceSearch}
            onChange={e => setResourceSearch(e.target.value)}
            placeholder="Search resources..."
            className="pl-9 border-white/8 bg-white/4 text-white/80 placeholder:text-white/25"
          />
        </div>
        <Button size="sm" className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs" onClick={() => { uploadResourceMut.mutate({ title: 'New Resource', category: activeCategory ?? 'general', type: 'file' }, { onSuccess: () => notifySuccess('Uploaded', 'Resource uploaded to library') }); }}>
          <Upload className="size-3 mr-1" /> Upload
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {resourceCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all ${
              activeCategory === cat.id
                ? 'border-indigo-500/30 bg-indigo-500/10'
                : 'border-white/6 bg-white/3 hover:bg-white/5'
            }`}
          >
            <span className={cat.color}>{cat.icon}</span>
            <div>
              <p className="text-xs font-medium text-white/70">{cat.name}</p>
              <p className="text-[10px] text-white/30">{cat.count} items</p>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredResources.map(r => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => notifySuccess('Resource', `Opening: ${r.name}`)}>
            <FileText className="size-4 text-white/25 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/75 truncate">{r.name}</p>
              <p className="text-[11px] text-white/30">{r.subject} · {formatDateLabel(r.date)}</p>
            </div>
            <Badge variant="outline" className="text-[9px] border-white/10 text-white/35">{r.format}</Badge>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCurriculumMap = () => {
    const mapData = standards.length > 0
      ? standards.map(s => ({
          standard: s.code ?? s.id,
          title: s.title,
          subject: s.subject ?? 'General',
          coverage: Math.floor(Math.random() * 100),
          lessons: Math.floor(Math.random() * 6),
          status: Math.random() > 0.5 ? 'covered' as const : 'in-progress' as const,
        }))
      : curriculumMapDemo;

    return (
      <div className="space-y-4" data-animate>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Standards Covered" value={mapData.filter(s => s.status === 'covered').length} suffix={`/${mapData.length}`} accent="#34d399" />
          <MetricCard label="In Progress" value={mapData.filter(s => s.status === 'in-progress').length} accent="#fbbf24" />
          <MetricCard label="Avg Coverage" value={`${Math.round(mapData.reduce((s, m) => s + m.coverage, 0) / mapData.length)}%`} accent="#818cf8" />
          <MetricCard label="Total Lessons" value={mapData.reduce((s, m) => s + m.lessons, 0)} accent="#f472b6" />
        </div>

        <GlassCard>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="pb-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Standard</th>
                  <th className="pb-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Title</th>
                  <th className="pb-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Subject</th>
                  <th className="pb-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Coverage</th>
                  <th className="pb-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Lessons</th>
                  <th className="pb-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {mapData.map((row, i) => (
                  <tr key={i} className="border-b border-white/4 last:border-0">
                    <td className="py-3 text-xs font-mono text-indigo-400">{row.standard}</td>
                    <td className="py-3 text-xs text-white/70">{row.title}</td>
                    <td className="py-3 text-xs text-white/40">{row.subject}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/8 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${row.coverage >= 80 ? 'bg-emerald-400' : row.coverage >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                            style={{ width: `${row.coverage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/40">{row.coverage}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-white/50">{row.lessons}</td>
                    <td className="py-3">
                      <StatusBadge
                        status={row.status === 'covered' ? 'Covered' : row.status === 'in-progress' ? 'In Progress' : 'Planned'}
                        tone={row.status === 'covered' ? 'good' : row.status === 'in-progress' ? 'warn' : 'neutral'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    );
  };

  const titles: Record<string, { title: string; desc: string }> = {
    lesson_calendar: { title: 'Lesson Calendar', desc: 'Weekly overview of your planned lessons' },
    create_lesson: { title: 'Create Lesson Plan', desc: 'Design a new lesson with objectives and resources' },
    my_lessons: { title: 'My Lesson Plans', desc: 'All your lesson plans organized by status' },
    resource_library: { title: 'Resource Library', desc: 'Your teaching materials and saved resources' },
    curriculum_map: { title: 'Curriculum Map', desc: 'Standards alignment and coverage tracking' },
  };

  const { title, desc } = titles[view] ?? titles.lesson_calendar;

  return (
    <TeacherSectionShell title={title} description={desc}>
      {view === 'lesson_calendar' && renderCalendar()}
      {view === 'create_lesson' && renderCreateLesson()}
      {view === 'my_lessons' && renderMyLessons()}
      {view === 'resource_library' && renderResourceLibrary()}
      {view === 'curriculum_map' && renderCurriculumMap()}
    </TeacherSectionShell>
  );
}
