/* Student Concierge › Settings — Preferences, Study Goals, Notification Rules, Timetable Display, Theme, Privacy */
import { useNavigationStore } from '@/store/navigation.store';
import { cn } from '@/lib/utils';
import { Target, Bell, Calendar, Palette, Shield } from 'lucide-react';
import { useStudentNotifications, useStudentTimetable } from '@/hooks/api/use-student';

/* ── Study goals ── */
const FALLBACK_STUDY_GOALS = [
  { id: 'sg1', label: 'Daily study hours', current: 3, target: 4, unit: 'hours' },
  { id: 'sg2', label: 'Subjects per day', current: 3, target: 4, unit: 'subjects' },
  { id: 'sg3', label: 'Assignments per week', current: 4, target: 6, unit: 'assignments' },
  { id: 'sg4', label: 'Revision sessions per week', current: 2, target: 5, unit: 'sessions' },
  { id: 'sg5', label: 'Library books per month', current: 1, target: 2, unit: 'books' },
];

/* ── Timetable display modes ── */
const FALLBACK_TIMETABLE_OPTIONS = [
  { id: 'td1', name: 'Day View', description: 'Show one day at a time with full period details', active: true },
  { id: 'td2', name: 'Week View', description: 'Show the entire week in a grid layout', active: false },
  { id: 'td3', name: 'List View', description: 'Simple list of classes sorted by time', active: false },
  { id: 'td4', name: 'Subject View', description: 'Group timetable entries by subject', active: false },
];

/* ── Theme options ── */
const FALLBACK_THEME_OPTIONS = [
  { id: 'th1', name: 'System Default', description: 'Follow your device theme setting', active: true },
  { id: 'th2', name: 'Light Mode', description: 'Clean and bright interface', active: false },
  { id: 'th3', name: 'Dark Mode', description: 'Easy on the eyes for night study', active: false },
];

/* ── Accent color options ── */
const accentColors = [
  { name: 'Blue', color: 'bg-blue-500' },
  { name: 'Purple', color: 'bg-purple-500' },
  { name: 'Emerald', color: 'bg-emerald-500' },
  { name: 'Orange', color: 'bg-orange-500' },
  { name: 'Rose', color: 'bg-rose-500' },
  { name: 'Cyan', color: 'bg-cyan-500' },
];

export function StudentConciergeSettings() {
  const { activeSubNav } = useNavigationStore();

  const { data: _apiNotifications } = useStudentNotifications();
  const { data: _apiTimetable } = useStudentTimetable();

  const studyGoals = FALLBACK_STUDY_GOALS;
  const timetableOptions = FALLBACK_TIMETABLE_OPTIONS;
  const themeOptions = FALLBACK_THEME_OPTIONS;

  /* ── Preferences (default) ── */
  if (!activeSubNav || activeSubNav === 'c_preferences') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Preferences</h3>
        <p className="text-xs text-muted-foreground">Customize your student concierge experience</p>
        <div className="space-y-2">
          {[
            { label: 'Show today strip on launch', enabled: true },
            { label: 'Enable slash command suggestions', enabled: true },
            { label: 'Auto-remind homework before due', enabled: true },
            { label: 'Compact task card view', enabled: false },
            { label: 'Show subject colours in timetable', enabled: true },
            { label: 'Play sound for new messages', enabled: false },
            { label: 'Show exam countdown on dashboard', enabled: true },
            { label: 'Enable study timer notifications', enabled: true },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <span className="text-xs font-medium text-foreground">{s.label}</span>
              <div className={cn('h-5 w-9 rounded-full relative transition cursor-pointer', s.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', s.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Study Goals ── */
  if (activeSubNav === 'c_study_goals') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Study Goals</h3>
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><Target className="h-3 w-3" /> Daily & weekly targets</span>
        </div>
        <p className="text-xs text-muted-foreground">Set personal academic targets and track your progress</p>
        <div className="space-y-2">
          {studyGoals.map((g) => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100));
            return (
              <div key={g.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">{g.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold', pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600')}>
                      {g.current}/{g.target} {g.unit}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{pct}%</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500')}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button className="rounded-lg border border-border/50 px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">−</button>
                  <span className="text-[10px] text-muted-foreground">Target: {g.target} {g.unit}</span>
                  <button className="rounded-lg border border-border/50 px-2.5 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ── Notification Rules ── */
  if (activeSubNav === 'c_notification_rules') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Notification Rules</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Homework due reminder (1 day before)', channel: 'In-App + Push', enabled: true },
            { label: 'Homework due reminder (2 hours before)', channel: 'Push', enabled: true },
            { label: 'Exam alert (3 days before)', channel: 'In-App + Push', enabled: true },
            { label: 'Exam alert (1 day before)', channel: 'Push + SMS', enabled: true },
            { label: 'New grade posted', channel: 'In-App + Push', enabled: true },
            { label: 'Teacher message received', channel: 'In-App + Push', enabled: true },
            { label: 'Class notice / announcement', channel: 'In-App', enabled: true },
            { label: 'Study group message', channel: 'In-App', enabled: false },
            { label: 'Library book due reminder', channel: 'In-App', enabled: true },
            { label: 'Study goal not met (daily)', channel: 'Push', enabled: false },
            { label: 'Bus arrival alert', channel: 'Push', enabled: true },
            { label: 'Timetable change', channel: 'In-App + Push', enabled: true },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div>
                <span className="text-xs font-medium text-foreground">{n.label}</span>
                <p className="text-[10px] text-muted-foreground">{n.channel}</p>
              </div>
              <div className={cn('h-5 w-9 rounded-full relative transition cursor-pointer', n.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', n.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Timetable Display ── */
  if (activeSubNav === 'c_timetable_display') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Timetable Display</h3>
        </div>
        <p className="text-xs text-muted-foreground">Choose how your class timetable appears</p>
        <div className="space-y-2">
          {timetableOptions.map((o) => (
            <div key={o.id} className={cn(
              'rounded-xl border p-3 shadow-lg backdrop-blur-xl dark:border-white/5 cursor-pointer transition',
              o.active ? 'border-primary/30 bg-primary/5' : 'border-white/20 bg-white/60 dark:bg-white/5 hover:bg-white/80',
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-foreground">{o.name}</h5>
                  <p className="text-[10px] text-muted-foreground">{o.description}</p>
                </div>
                {o.active ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Active</span>
                ) : (
                  <button className="text-[10px] font-medium text-primary hover:underline">Select</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
          <h5 className="text-xs font-semibold text-foreground mb-2">Display Options</h5>
          <div className="space-y-2">
            {[
              { label: 'Show room numbers', enabled: true },
              { label: 'Show teacher names', enabled: true },
              { label: 'Highlight current period', enabled: true },
              { label: 'Show break periods', enabled: true },
              { label: 'Show homework due indicators', enabled: false },
            ].map((opt) => (
              <div key={opt.label} className="flex items-center justify-between">
                <span className="text-[10px] text-foreground">{opt.label}</span>
                <div className={cn('h-4 w-7 rounded-full relative transition cursor-pointer', opt.enabled ? 'bg-primary/80' : 'bg-muted')}>
                  <div className={cn('absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition', opt.enabled ? 'right-0.5' : 'left-0.5')} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Theme ── */
  if (activeSubNav === 'c_theme') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Theme</h3>
        </div>
        <p className="text-xs text-muted-foreground">Personalize the look and feel</p>

        <div className="space-y-2">
          <span className="text-[10px] font-medium text-foreground">Appearance</span>
          {themeOptions.map((t) => (
            <div key={t.id} className={cn(
              'rounded-xl border p-3 shadow-lg backdrop-blur-xl dark:border-white/5 cursor-pointer transition',
              t.active ? 'border-primary/30 bg-primary/5' : 'border-white/20 bg-white/60 dark:bg-white/5 hover:bg-white/80',
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-foreground">{t.name}</h5>
                  <p className="text-[10px] text-muted-foreground">{t.description}</p>
                </div>
                {t.active ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Active</span>
                ) : (
                  <button className="text-[10px] font-medium text-primary hover:underline">Apply</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
          <span className="text-[10px] font-medium text-foreground">Accent Colour</span>
          <div className="mt-2 flex items-center gap-3">
            {accentColors.map((c) => (
              <button key={c.name} className="group flex flex-col items-center gap-1" title={c.name}>
                <div className={cn('h-7 w-7 rounded-full border-2 transition', c.color, c.name === 'Blue' ? 'border-foreground ring-2 ring-primary/20' : 'border-transparent hover:border-foreground/30')} />
                <span className="text-[8px] text-muted-foreground">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
          <span className="text-[10px] font-medium text-foreground">Font Size</span>
          <div className="mt-2 flex items-center gap-3">
            {['Small', 'Medium', 'Large'].map((size) => (
              <button key={size} className={cn(
                'rounded-lg border px-3 py-1.5 text-[10px] font-medium transition',
                size === 'Medium' ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border/30 text-foreground hover:bg-muted/40',
              )}>
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Privacy ── */
  if (activeSubNav === 'c_privacy') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Privacy</h3>
        </div>
        <p className="text-xs text-muted-foreground">Control what others can see about you</p>

        <div className="space-y-2">
          {[
            { label: 'Show my profile photo to classmates', enabled: true, description: 'Other students in your class can see your photo' },
            { label: 'Show my grades to study group members', enabled: false, description: 'Only you and teachers can see your grades by default' },
            { label: 'Allow teachers to share my work as example', enabled: true, description: 'Teachers may showcase your best work (anonymously if disabled)' },
            { label: 'Show online status in study groups', enabled: true, description: 'Group members can see when you\'re active' },
            { label: 'Allow feedback from classmates', enabled: false, description: 'Classmates can send you peer feedback on group projects' },
            { label: 'Show my rank in class results', enabled: true, description: 'Your rank appears alongside your results' },
          ].map((p) => (
            <div key={p.label} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-3">
                  <span className="text-xs font-medium text-foreground">{p.label}</span>
                  <p className="text-[10px] text-muted-foreground">{p.description}</p>
                </div>
                <div className={cn('h-5 w-9 rounded-full relative transition cursor-pointer flex-shrink-0', p.enabled ? 'bg-primary/80' : 'bg-muted')}>
                  <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', p.enabled ? 'right-0.5' : 'left-0.5')} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-600">Data Privacy Notice</span>
          </div>
          <p className="text-[10px] text-amber-600/80">
            Your personal data is handled in accordance with school policy and applicable data protection laws. 
            Parents/guardians have access to your academic records. Contact the school IT office for data-related queries.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
