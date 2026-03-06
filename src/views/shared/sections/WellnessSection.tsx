/* ─── WellnessSection ─── Holographic wellness / mind-body views ──── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Heart, Brain, Dumbbell, Smile, BookOpen, Target,
  Award, TrendingUp, Calendar, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useWellnessMetrics,
  useWeeklySummary,
  useJournalEntries,
  useCreateJournalEntry,
  useWellnessGoals,
  useCreateWellnessGoal,
  useMindBodyMetrics,
  useWellnessResources,
} from '@/hooks/api';

/* ── Main Export ───────────────────────────────────────────────── */
export function WellnessSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);

  const view = (() => {
    switch (activeHeader) {
      case 'overview':
      case 'wellness_overview': return <WellnessOverview />;
      case 'mind_body': return <MindBodyView subNav={activeSubNav} />;
      default: return <WellnessOverview />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Sub-views ─────────────────────────────────────────────────── */

function WellnessOverview() {
  const { data: metrics } = useWellnessMetrics();
  const { data: weekly } = useWeeklySummary();

  const m = metrics ?? { wellnessScore: 78, moodTrend: 'Improving', activitiesDone: 12, streak: 5 };
  const weeklyData = (weekly ?? [
    { day: 'Monday', activity: 'Morning meditation — 10 min', mood: 'Great', moodColor: 'border-emerald-500/30 text-emerald-400' },
    { day: 'Tuesday', activity: 'Yoga session — 30 min', mood: 'Good', moodColor: 'border-blue-500/30 text-blue-400' },
    { day: 'Wednesday', activity: 'Journaling — 15 min', mood: 'Neutral', moodColor: 'border-white/10 text-white/40' },
    { day: 'Thursday', activity: 'Group breathing exercise', mood: 'Good', moodColor: 'border-blue-500/30 text-blue-400' },
    { day: 'Friday', activity: 'Mindfulness walk — 20 min', mood: 'Great', moodColor: 'border-emerald-500/30 text-emerald-400' },
  ]) as { day: string; activity: string; mood: string; moodColor: string }[];

  const kpis = [
    { label: 'Wellness Score', value: `${m.wellnessScore}/100`, icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { label: 'Mood Trend', value: m.moodTrend, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Activities Done', value: String(m.activitiesDone), icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Streak', value: `${m.streak} days`, icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Wellness Hub 🧘</h2>
        <p className="text-sm text-white/40">Monitor and improve mental and physical well-being</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="flex items-center gap-3 py-4">
              <div className={`flex size-10 items-center justify-center rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`size-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-xs text-white/40">{kpi.label}</p>
                <p className="text-lg font-bold text-white/85">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Weekly Wellness Summary</CardTitle>
          <CardDescription className="text-white/35">Your wellness activity for the past 7 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3 transition-all hover:bg-white/4 hover:border-white/12">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium w-24 text-white/75">{d.day}</span>
                <span className="text-sm text-white/45">{d.activity}</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${d.moodColor}`}>{d.mood}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Recommended Activities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { title: '5-Minute Breathing', desc: 'Quick calm-down technique', icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { title: 'Gratitude Journal', desc: 'Write 3 things you\'re grateful for', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { title: 'Desk Stretches', desc: '7 stretches for posture relief', icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          ].map((a) => (
            <div key={a.title} className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/2 p-4 hover:border-white/12 hover:bg-white/4 cursor-pointer transition-all">
              <div className={`flex size-8 items-center justify-center rounded-lg ${a.bg} shrink-0 mt-0.5`}>
                <a.icon className={`size-4 ${a.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-white/75">{a.title}</p>
                <p className="text-xs text-white/35">{a.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function MindBodyView({ subNav }: { subNav: string }) {
  const view = (() => {
    switch (subNav) {
      case 'dashboard': return <MBDashboard />;
      case 'resources': return <MBResources />;
      case 'journal': return <MBJournal />;
      case 'goals': return <MBGoals />;
      default: return <MBDashboard />;
    }
  })();
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">
          Mind &amp; Body
          {subNav ? ` — ${subNav.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}` : ''}
        </h2>
        <p className="text-sm text-white/40">Holistic wellness tracking and resources</p>
      </div>
      {view}
    </>
  );
}

function MBDashboard() {
  const { data: mbData } = useMindBodyMetrics();

  const metrics = (mbData ?? [
    { title: 'Stress Level', value: 'Low', pct: 25, color: 'from-emerald-500 to-emerald-600' },
    { title: 'Sleep Quality', value: 'Good', pct: 72, color: 'from-blue-500 to-blue-600' },
    { title: 'Activity Level', value: 'Moderate', pct: 55, color: 'from-amber-500 to-amber-600' },
    { title: 'Social Connection', value: 'High', pct: 80, color: 'from-purple-500 to-purple-600' },
    { title: 'Focus Score', value: 'Above Avg', pct: 68, color: 'from-cyan-500 to-cyan-600' },
    { title: 'Happiness Index', value: '8/10', pct: 80, color: 'from-rose-500 to-rose-600' },
  ]) as { title: string; value: string; pct: number; color: string }[];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
      {metrics.map((m) => (
        <Card key={m.title} className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/75">{m.title}</p>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/50">{m.value}</Badge>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white/5">
              <div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${m.pct}%` }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MBResources() {
  const { data: resData } = useWellnessResources();

  const iconMap: Record<string, { icon: typeof Brain; color: string; bg: string }> = {
    Mindfulness: { icon: Brain, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    Physical: { icon: Dumbbell, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    'Mental Health': { icon: Heart, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    Rest: { icon: Smile, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  };

  const resources = (resData ?? [
    { id: 'r1', title: 'Guided Meditation Library', category: 'Mindfulness', count: 24 },
    { id: 'r2', title: 'Exercise Routines', category: 'Physical', count: 18 },
    { id: 'r3', title: 'Emotional Wellness Guide', category: 'Mental Health', count: 12 },
    { id: 'r4', title: 'Sleep Improvement Tips', category: 'Rest', count: 8 },
    { id: 'r5', title: 'Nutrition & Hydration', category: 'Physical', count: 15 },
    { id: 'r6', title: 'Stress Management', category: 'Mental Health', count: 10 },
  ]) as { id: string; title: string; category: string; count: number }[];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
      {resources.map((r) => {
        const look = iconMap[r.category] ?? { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
        const IconComponent = look.icon;
        return (
          <Card key={r.id ?? r.title} className="border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer hover:border-white/12 hover:bg-white/4 transition-all">
            <CardContent className="flex items-start gap-3 pt-6">
              <div className={`flex size-9 items-center justify-center rounded-lg ${look.bg}`}>
                <IconComponent className={`size-4 ${look.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">{r.title}</p>
                <p className="text-xs text-white/35">{r.category} · {r.count} resources</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MBJournal() {
  const { data: journalData } = useJournalEntries();
  const createEntry = useCreateJournalEntry();
  const [showForm, setShowForm] = useState(false);
  const [mood, setMood] = useState('Good');
  const [summary, setSummary] = useState('');

  const moodOptions = [
    { label: '😊 Great', value: 'Great', emoji: '😊', badge: 'border-emerald-500/30 text-emerald-400' },
    { label: '🙂 Good', value: 'Good', emoji: '🙂', badge: 'border-blue-500/30 text-blue-400' },
    { label: '😐 Okay', value: 'Okay', emoji: '😐', badge: 'border-white/10 text-white/40' },
    { label: '😔 Low', value: 'Low', emoji: '😔', badge: 'border-amber-500/30 text-amber-400' },
  ];

  const entries = (journalData ?? [
    { id: 'j1', date: 'May 14, 2025', mood: 'Great', moodEmoji: '😊', summary: 'Had a productive morning, completed the yoga session. Feeling energized.', createdAt: '' },
    { id: 'j2', date: 'May 13, 2025', mood: 'Okay', moodEmoji: '😐', summary: 'Stressful afternoon meetings but managed with breathing exercises.', createdAt: '' },
    { id: 'j3', date: 'May 12, 2025', mood: 'Good', moodEmoji: '😊', summary: 'Good sleep last night. Started a new meditation routine.', createdAt: '' },
    { id: 'j4', date: 'May 11, 2025', mood: 'Low', moodEmoji: '😔', summary: 'Feeling overwhelmed. Took a walk and it helped.', createdAt: '' },
  ]) as { id: string; date: string; mood: string; moodEmoji: string; summary: string }[];

  const getBadge = (m: string) => moodOptions.find((o) => o.value === m)?.badge ?? 'border-white/10 text-white/40';

  const handleCreate = () => {
    if (!summary.trim()) return;
    const moodEmoji = moodOptions.find((o) => o.value === mood)?.emoji ?? '😐';
    createEntry.mutate(
      { mood, moodEmoji, summary: summary.trim() },
      { onSuccess: () => { setSummary(''); setMood('Good'); setShowForm(false); } },
    );
  };

  return (
    <>
      <div className="flex justify-end gap-2" data-animate>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => setShowForm(!showForm)}>
          <Calendar className="mr-1 size-3" /> {showForm ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      {showForm && (
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="pt-6 space-y-3">
            <div className="flex gap-2">
              {moodOptions.map((o) => (
                <Button
                  key={o.value}
                  size="sm"
                  onClick={() => setMood(o.value)}
                  className={`text-xs ${mood === o.value ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >{o.label}</Button>
              ))}
            </div>
            <Textarea
              placeholder="How are you feeling today?"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25 min-h-20"
            />
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleCreate} disabled={createEntry.isPending}>
              {createEntry.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null} Save Entry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3" data-animate>
        {entries.map((e) => (
          <Card key={e.id} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="flex items-start gap-4 py-4">
              <div className="text-2xl">{e.moodEmoji}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white/80">{e.date}</p>
                  <Badge variant="outline" className={`text-[10px] ${getBadge(e.mood)}`}>{e.moodEmoji} {e.mood}</Badge>
                </div>
                <p className="text-sm text-white/45 mt-1">{e.summary}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function MBGoals() {
  const { data: goalsData } = useWellnessGoals();
  const createGoalMut = useCreateWellnessGoal();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('30 days');

  const goalColors = [
    'from-indigo-500 to-indigo-600',
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-cyan-500 to-cyan-600',
    'from-violet-500 to-violet-600',
    'from-amber-500 to-amber-600',
  ];

  const goals = (goalsData ?? [
    { id: 'g1', title: 'Meditate 10 min daily', progress: 80, target: '30 days', current: '24 days' },
    { id: 'g2', title: 'Exercise 3x per week', progress: 66, target: '12 weeks', current: '8 weeks' },
    { id: 'g3', title: 'Sleep 7+ hours', progress: 90, target: '30 days', current: '27 days' },
    { id: 'g4', title: 'Drink 8 glasses of water', progress: 45, target: '30 days', current: '14 days' },
  ]) as { id: string; title: string; progress: number; target: string; current: string }[];

  const handleCreate = () => {
    if (!title.trim()) return;
    createGoalMut.mutate(
      { title: title.trim(), target },
      { onSuccess: () => { setTitle(''); setTarget('30 days'); setShowForm(false); } },
    );
  };

  return (
    <div className="space-y-3" data-animate>
      <div className="flex justify-end">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500" onClick={() => setShowForm(!showForm)}>
          <Target className="mr-1 size-3" /> {showForm ? 'Cancel' : 'New Goal'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="pt-6 space-y-3">
            <Input
              placeholder="Goal title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25"
            />
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Target:</span>
              {['7 days', '14 days', '30 days', '12 weeks'].map((t) => (
                <Button
                  key={t}
                  size="sm"
                  onClick={() => setTarget(t)}
                  className={`h-6 text-[10px] ${target === t ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >{t}</Button>
              ))}
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleCreate} disabled={createGoalMut.isPending}>
              {createGoalMut.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null} Create Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {goals.map((g, i) => (
        <Card key={g.id} className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80">{g.title}</p>
                <p className="text-xs text-white/35">{g.current} / {g.target}</p>
              </div>
              <span className="text-sm font-bold text-indigo-400">{g.progress}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-white/5">
              <div className={`h-full rounded-full bg-gradient-to-r ${goalColors[i % goalColors.length]}`} style={{ width: `${g.progress}%` }} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
