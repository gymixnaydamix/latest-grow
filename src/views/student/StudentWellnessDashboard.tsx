/* ─── StudentWellnessDashboard ─── Student wellness & wellbeing ──── */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Brain, Moon, Activity, Smile, Frown, Meh, Sun, Droplets, Footprints, Wind, Timer } from 'lucide-react';
import { useStudentData } from '@/hooks/use-student-data';
import { notifySuccess } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';

/* ── SubNav → Route mapping (for split-page navigation) ── */
const SUB_NAV_ROUTES: Record<string, string> = {
  wellness_dashboard: '/student/wellness-dashboard',
  resources: '/student/resources',
  journal: '/student/journal',
  goals: '/student/goals',
};

type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

const MOOD_CFG: Record<Mood, { Icon: typeof Smile; cls: string; label: string }> = {
  great: { Icon: Smile, cls: 'text-emerald-400', label: 'Great' },
  good: { Icon: Smile, cls: 'text-green-400', label: 'Good' },
  okay: { Icon: Meh, cls: 'text-amber-400', label: 'Okay' },
  low: { Icon: Frown, cls: 'text-orange-400', label: 'Low' },
  bad: { Icon: Frown, cls: 'text-red-400', label: 'Bad' },
};

interface WellnessMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: typeof Heart;
  color: string;
}

const METRICS: WellnessMetric[] = [
  { label: 'Sleep', value: 7.5, max: 9, unit: 'hrs', icon: Moon, color: 'text-violet-400' },
  { label: 'Water', value: 6, max: 8, unit: 'glasses', icon: Droplets, color: 'text-cyan-400' },
  { label: 'Steps', value: 8432, max: 10000, unit: 'steps', icon: Footprints, color: 'text-emerald-400' },
  { label: 'Focus', value: 4.2, max: 6, unit: 'hrs', icon: Brain, color: 'text-indigo-400' },
  { label: 'Exercise', value: 35, max: 60, unit: 'min', icon: Activity, color: 'text-red-400' },
  { label: 'Mindfulness', value: 15, max: 20, unit: 'min', icon: Wind, color: 'text-amber-400' },
];

const MOOD_LOG = [
  { date: '2025-03-15', mood: 'great' as Mood, note: 'Aced my math test!' },
  { date: '2025-03-14', mood: 'good' as Mood, note: 'Good study session' },
  { date: '2025-03-13', mood: 'okay' as Mood, note: 'Regular day' },
  { date: '2025-03-12', mood: 'good' as Mood, note: 'Fun art class' },
  { date: '2025-03-11', mood: 'low' as Mood, note: 'Stressed about deadline' },
  { date: '2025-03-10', mood: 'great' as Mood, note: 'Weekend recovery!' },
  { date: '2025-03-09', mood: 'good' as Mood, note: 'Hung out with friends' },
];

const TIPS = [
  { title: 'Take a 5-Minute Break', desc: 'Step away from screens and stretch', icon: Timer, color: 'text-emerald-400 bg-emerald-400/10' },
  { title: 'Deep Breathing', desc: 'Try 4-7-8 breathing technique', icon: Wind, color: 'text-indigo-400 bg-indigo-400/10' },
  { title: 'Stay Hydrated', desc: 'Drink water between classes', icon: Droplets, color: 'text-cyan-400 bg-cyan-400/10' },
  { title: 'Get Outside', desc: '15 min of sunlight boosts mood', icon: Sun, color: 'text-amber-400 bg-amber-400/10' },
];

export default function StudentWellnessDashboard() {
  const containerRef = useStaggerAnimate([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const store = useStudentData();
  const { activeSubNav } = useNavigationStore();
  const navigate = useNavigate();

  // Navigate to split page when a mapped subnav is selected
  useEffect(() => {
    if (activeSubNav && SUB_NAV_ROUTES[activeSubNav]) {
      navigate(SUB_NAV_ROUTES[activeSubNav]);
    }
  }, [activeSubNav, navigate]);

  const wellnessScore = Math.round(METRICS.reduce((sum, m) => sum + (m.value / m.max), 0) / METRICS.length * 100);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center gap-2">
        <Heart className="size-5 text-red-400" />
        <h2 className="text-lg font-bold text-white/90">Wellness Dashboard</h2>
        <Badge className="border-0 bg-emerald-400/10 text-emerald-400 text-[10px] ml-2">Score: {wellnessScore}%</Badge>
      </div>

      {/* Mood check-in */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader><CardTitle className="text-white/90 text-sm">How are you feeling today?</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex justify-center gap-4">
            {(Object.entries(MOOD_CFG) as [Mood, typeof MOOD_CFG[Mood]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedMood(key)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl p-3 border transition-all',
                  selectedMood === key
                    ? 'border-indigo-400/40 bg-indigo-500/10 scale-110'
                    : 'border-white/6 bg-white/2 hover:bg-white/4',
                )}
              >
                <cfg.Icon className={cn('size-6', cfg.cls)} />
                <span className="text-[10px] text-white/50">{cfg.label}</span>
              </button>
            ))}
          </div>
          {selectedMood && (
            <div className="flex gap-2">
              <input value={moodNote} onChange={(e) => setMoodNote(e.target.value)} placeholder="Add a note (optional)…" className="flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 outline-none" />
              <Button size="sm" className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/20" onClick={() => { store.logMood(selectedMood!, moodNote || undefined); notifySuccess('Mood Logged', `Feeling ${MOOD_CFG[selectedMood!].label.toLowerCase()} recorded`); setSelectedMood(null); setMoodNote(''); }}>Log Mood</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics grid */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRICS.map((m) => {
          const pct = Math.round((m.value / m.max) * 100);
          return (
            <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="flex flex-col items-center gap-2 p-3">
                <m.icon className={cn('size-5', m.color)} />
                <span className="text-[10px] text-white/40 font-medium">{m.label}</span>
                <span className="text-lg font-bold text-white/90 tabular-nums">{m.value}</span>
                <span className="text-[9px] text-white/25">{m.unit} / {m.max}</span>
                <Progress value={pct} className="h-1 bg-white/5 w-full" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mood history */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Activity className="size-4 text-indigo-400" />Mood History</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {MOOD_LOG.map((entry, i) => {
              const cfg = MOOD_CFG[entry.mood];
              return (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-white/4 bg-white/2 px-3 py-2">
                  <cfg.Icon className={cn('size-4 shrink-0', cfg.cls)} />
                  <div className="flex-1">
                    <p className="text-xs text-white/60 font-medium">{entry.note}</p>
                    <p className="text-[10px] text-white/25">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <Badge className={cn('border-0 text-[9px]', `bg-${cfg.cls.split('-')[1]}-400/10`, cfg.cls)}>{cfg.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Wellness tips */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Sun className="size-4 text-amber-400" />Wellness Tips</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            {TIPS.map((tip) => (
              <div key={tip.title} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-3 hover:bg-white/4 transition-colors cursor-pointer">
                <div className={cn('size-9 rounded-lg flex items-center justify-center shrink-0', tip.color.split(' ')[1])}>
                  <tip.icon className={cn('size-4', tip.color.split(' ')[0])} />
                </div>
                <div>
                  <p className="text-xs font-medium text-white/70">{tip.title}</p>
                  <p className="text-[10px] text-white/30">{tip.desc}</p>
                </div>
              </div>
            ))}
            <div className="rounded-lg border border-white/6 bg-linear-to-r from-indigo-500/10 via-violet-500/10 to-emerald-500/10 p-4 text-center">
              <p className="text-xs text-white/60 font-medium">Need someone to talk to?</p>
              <p className="text-[10px] text-white/30 mt-1">School counselor available Mon–Fri, 8 AM – 4 PM</p>
              <Button size="sm" variant="outline" className="mt-2 text-xs border-white/10 text-white/50" onClick={() => { const id = store.bookSession(); notifySuccess('Session Booked', `Counselor session ${id} confirmed`); }}>Book a Session</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
