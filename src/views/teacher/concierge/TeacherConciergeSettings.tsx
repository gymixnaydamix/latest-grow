/* Teacher Concierge › Settings — Preferences, Quick Replies, Grade Scales, Notification Rules, Class Config, Templates */
import { useNavigationStore } from '@/store/navigation.store';
import { ConciergeTemplatePicker } from '@/components/concierge/shared';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTeacherClasses, useTeacherCommentBank, useSaveTeacherPreferences } from '@/hooks/api/use-teacher';

/* ── Quick replies ── */
const FALLBACK_QUICK_REPLIES = [
  { id: 'qr1', name: 'Homework reminder', preview: 'Please ensure your child completes the assigned homework by the due date.' },
  { id: 'qr2', name: 'Absence follow-up', preview: 'Your child was absent today. Please provide a reason at your earliest convenience.' },
  { id: 'qr3', name: 'Positive feedback', preview: 'I wanted to share that your child has been doing excellent work in class recently.' },
  { id: 'qr4', name: 'Meeting confirmation', preview: 'This confirms our scheduled meeting. I look forward to discussing your child\u2019s progress.' },
  { id: 'qr5', name: 'Behaviour note', preview: 'I would like to discuss a behaviour concern observed in class today.' },
];

/* ── Grade scales ── */
const FALLBACK_GRADE_SCALES = [
  { id: 'gs1', name: 'A–F Letter Grade', ranges: ['A: 90–100', 'B: 80–89', 'C: 70–79', 'D: 60–69', 'F: Below 60'], active: true },
  { id: 'gs2', name: 'Percentage (0–100%)', ranges: ['Pass: 60%+', 'Fail: Below 60%'], active: false },
  { id: 'gs3', name: 'GPA (4.0 Scale)', ranges: ['4.0: 93–100', '3.7: 90–92', '3.3: 87–89', '3.0: 83–86', '2.7: 80–82', '2.0: 73–76'], active: false },
];

/* ── Class config ── */
const FALLBACK_CLASS_CONFIGS = [
  { id: 'cc1', className: 'Grade 5A — Mathematics', students: 30, gradeScale: 'A–F', attendanceMode: 'Per-period', language: 'English' },
  { id: 'cc2', className: 'Grade 5B — Mathematics', students: 30, gradeScale: 'A–F', attendanceMode: 'Per-period', language: 'English' },
  { id: 'cc3', className: 'Grade 4C — Science', students: 28, gradeScale: 'Percentage', attendanceMode: 'Per-period', language: 'English' },
  { id: 'cc4', className: 'Grade 6A — Mathematics', students: 29, gradeScale: 'A–F', attendanceMode: 'Daily', language: 'English' },
];

/* ── Settings templates ── */
const FALLBACK_SETTINGS_TEMPLATES = [
  { id: 'st1', name: 'Lesson Plan Template', type: 'Lesson', lastUsed: 'Yesterday', fieldCount: 8 },
  { id: 'st2', name: 'Weekly Report Template', type: 'Report', lastUsed: '3 days ago', fieldCount: 6 },
  { id: 'st3', name: 'Assignment Rubric Template', type: 'Assessment', lastUsed: '1 week ago', fieldCount: 5 },
  { id: 'st4', name: 'Parent Communication Template', type: 'Communication', lastUsed: '2 days ago', fieldCount: 4 },
];

export function TeacherConciergeSettings() {
  const { activeSubNav } = useNavigationStore();
  const { data: apiClasses } = useTeacherClasses();
  const { data: apiCommentBank } = useTeacherCommentBank();
  useSaveTeacherPreferences();

  const quickReplies = (apiCommentBank as any[]) ?? FALLBACK_QUICK_REPLIES;
  const gradeScales = FALLBACK_GRADE_SCALES;
  const classConfigs = (apiClasses as any[]) ?? FALLBACK_CLASS_CONFIGS;
  const settingsTemplates = FALLBACK_SETTINGS_TEMPLATES;

  /* ── Preferences (default) ── */
  if (!activeSubNav || activeSubNav === 'c_preferences') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Preferences</h3>
        <p className="text-xs text-muted-foreground">Customize your concierge experience</p>
        <div className="space-y-2">
          {[
            { label: 'Auto-save grade drafts', enabled: true },
            { label: 'Show today strip on launch', enabled: true },
            { label: 'Enable slash command suggestions', enabled: true },
            { label: 'Compact task card view', enabled: false },
            { label: 'Dark mode for grade entry', enabled: false },
            { label: 'Sound notifications for messages', enabled: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <span className="text-xs font-medium text-foreground">{s.label}</span>
              <div className={cn('h-5 w-9 rounded-full relative transition', s.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', s.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Quick Replies ── */
  if (activeSubNav === 'c_quick_replies') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Quick Replies</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <MessageSquare className="h-3.5 w-3.5" /> Add Reply
          </button>
        </div>
        <div className="space-y-2">
          {quickReplies.map((r) => (
            <div key={r.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <h5 className="text-xs font-semibold text-foreground">{r.name}</h5>
              <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{r.preview}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Grade Scales ── */
  if (activeSubNav === 'c_grade_scales') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Grade Scales</h3>
        <p className="text-xs text-muted-foreground">Select the grading scale used for your classes</p>
        <div className="space-y-2">
          {gradeScales.map((g) => (
            <div key={g.id} className={cn(
              'rounded-xl border p-3 dark:border-white/5',
              g.active ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-background/70',
            )}>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-semibold text-foreground">{g.name}</h5>
                {g.active ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Active</span>
                ) : (
                  <button className="text-[10px] font-medium text-primary hover:underline">Activate</button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {g.ranges.map((r) => (
                  <span key={r} className="rounded-lg border border-border/20 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">{r}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Notification Rules ── */
  if (activeSubNav === 'c_notification_rules') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Notification Rules</h3>
        <div className="space-y-2">
          {[
            { label: 'Parent message received', channel: 'In-App + Email', enabled: true },
            { label: 'Attendance anomaly detected', channel: 'In-App', enabled: true },
            { label: 'Grade entry deadline approaching', channel: 'In-App + Push', enabled: true },
            { label: 'Meeting request from parent', channel: 'Email + Push', enabled: true },
            { label: 'Substitution request update', channel: 'In-App', enabled: false },
            { label: 'Admin broadcast received', channel: 'In-App', enabled: true },
            { label: 'Student behaviour flag', channel: 'In-App + Push', enabled: true },
            { label: 'Report card generation complete', channel: 'Email', enabled: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <span className="text-xs font-medium text-foreground">{n.label}</span>
                <p className="text-[10px] text-muted-foreground">{n.channel}</p>
              </div>
              <div className={cn('h-5 w-9 rounded-full relative transition', n.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', n.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Class Config ── */
  if (activeSubNav === 'c_class_config') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Class Configuration</h3>
        <div className="space-y-2">
          {classConfigs.map((c) => (
            <div key={c.id} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-semibold text-foreground">{c.className}</h5>
                <button className="text-[10px] font-medium text-primary hover:underline">Edit</button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="text-muted-foreground">Students: <span className="text-foreground font-medium">{c.students}</span></div>
                <div className="text-muted-foreground">Grade Scale: <span className="text-foreground font-medium">{c.gradeScale}</span></div>
                <div className="text-muted-foreground">Attendance: <span className="text-foreground font-medium">{c.attendanceMode}</span></div>
                <div className="text-muted-foreground">Language: <span className="text-foreground font-medium">{c.language}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Templates ── */
  if (activeSubNav === 'c_settings_templates') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Templates</h3>
        <ConciergeTemplatePicker templates={settingsTemplates} />
      </div>
    );
  }

  return null;
}
