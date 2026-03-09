/* ─── WellnessDashboardPage ─── Full-page wellness overview ────────── */
import { useState } from 'react';
import {
  Heart, Brain, Moon, Activity, Smile, Frown, Meh,
  Sun, Droplets, Footprints, Wind, Timer, TrendingUp,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useStudentWellness, useStudentMoodHistory, useLogMood } from '@/hooks/api/use-student';

type Mood = 'great' | 'good' | 'okay' | 'low' | 'bad';

const MOOD_CFG: Record<Mood, { Icon: typeof Smile; cls: string; label: string }> = {
  great: { Icon: Smile, cls: 'text-emerald-400', label: 'Great' },
  good:  { Icon: Smile, cls: 'text-green-400', label: 'Good' },
  okay:  { Icon: Meh, cls: 'text-amber-400', label: 'Okay' },
  low:   { Icon: Frown, cls: 'text-orange-400', label: 'Low' },
  bad:   { Icon: Frown, cls: 'text-red-400', label: 'Bad' },
};

interface Metric {
  label: string; value: number; max: number; unit: string;
  icon: typeof Heart; color: string;
}

const METRICS: Metric[] = [
  { label: 'Sleep',       value: 7.5,  max: 9,     unit: 'hrs',    icon: Moon,       color: 'text-violet-400' },
  { label: 'Water',       value: 6,    max: 8,     unit: 'glasses', icon: Droplets,  color: 'text-cyan-400' },
  { label: 'Steps',       value: 8432, max: 10000, unit: 'steps',  icon: Footprints, color: 'text-emerald-400' },
  { label: 'Focus',       value: 4.2,  max: 6,     unit: 'hrs',    icon: Brain,      color: 'text-indigo-400' },
  { label: 'Exercise',    value: 35,   max: 60,    unit: 'min',    icon: Activity,   color: 'text-red-400' },
  { label: 'Mindfulness', value: 15,   max: 20,    unit: 'min',    icon: Wind,       color: 'text-amber-400' },
];

const FALLBACK_MOOD_LOG = [
  { date: '2026-03-04', mood: 'great' as Mood, note: 'Aced my math test!' },
  { date: '2026-03-03', mood: 'good' as Mood, note: 'Good study session' },
  { date: '2026-03-02', mood: 'okay' as Mood, note: 'Regular day' },
  { date: '2026-03-01', mood: 'good' as Mood, note: 'Fun art class' },
  { date: '2026-02-28', mood: 'low' as Mood, note: 'Stressed about deadline' },
  { date: '2026-02-27', mood: 'great' as Mood, note: 'Weekend recovery!' },
  { date: '2026-02-26', mood: 'good' as Mood, note: 'Hung out with friends' },
];

const FALLBACK_WEEKLY_TREND = [
  { day: 'Mon', score: 72 }, { day: 'Tue', score: 78 }, { day: 'Wed', score: 85 },
  { day: 'Thu', score: 80 }, { day: 'Fri', score: 88 }, { day: 'Sat', score: 92 }, { day: 'Sun', score: 86 },
];

const FALLBACK_TIPS = [
  { title: 'Take a 5-Minute Break', desc: 'Step away from screens and stretch', icon: Timer, color: 'text-emerald-400 bg-emerald-400/10' },
  { title: 'Deep Breathing', desc: 'Try 4-7-8 breathing technique', icon: Wind, color: 'text-indigo-400 bg-indigo-400/10' },
  { title: 'Stay Hydrated', desc: 'Drink water between classes', icon: Droplets, color: 'text-cyan-400 bg-cyan-400/10' },
  { title: 'Get Outside', desc: '15 min of sunlight boosts mood', icon: Sun, color: 'text-amber-400 bg-amber-400/10' },
];

export default function WellnessDashboardPage() {
  const containerRef = useStaggerAnimate([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  /* ── API data ── */
  const { data: apiWellness } = useStudentWellness();
  const { data: apiMoodHist } = useStudentMoodHistory();
  const logMoodMut = useLogMood();
  const metricsData = ((apiWellness as any)?.metrics as any[]) ?? [];
  const metrics = metricsData.length > 0 ? metricsData : METRICS;
  const moodLogData = (apiMoodHist as any[]) ?? [];
  const moodLog = moodLogData.length > 0 ? moodLogData : FALLBACK_MOOD_LOG;
  const weeklyTrend = (apiWellness as any)?.weeklyTrend ?? FALLBACK_WEEKLY_TREND;
  const tips = (apiWellness as any)?.tips ?? FALLBACK_TIPS;

  const wellnessScore = Math.round(metrics.reduce((s: number, m: any) => s + ((m.value ?? 0) / (m.max ?? 1)), 0) / (metrics.length || 1) * 100);
  const streakDays = (apiWellness as any)?.streakDays ?? 0;
  const todaySteps = (metrics.find((m: any) => m.label === 'Steps') as any)?.value ?? 0;
  const avgMood = moodLog.length > 0
    ? Number((moodLog.reduce((s: number, e: any) => s + ({ great: 5, good: 4, okay: 3, low: 2, bad: 1 }[e.mood as Mood] ?? 3), 0) / moodLog.length).toFixed(1))
    : 4.2;

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Wellness Dashboard" description="Track your physical and mental wellbeing" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Wellness Score" value={wellnessScore} suffix="%" icon={<Heart className="h-5 w-5" />} trend="up" />
        <StatCard label="Active Streak" value={streakDays} suffix=" days" icon={<TrendingUp className="h-5 w-5" />} trend="up" />
        <StatCard label="Today's Steps" value={todaySteps} icon={<Footprints className="h-5 w-5" />} />
        <StatCard label="Mood Score" value={avgMood} suffix="/5" icon={<Smile className="h-5 w-5" />} decimals={1} />
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
              <input placeholder="Add a note (optional)…" className="flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 outline-none" />
              <Button size="sm" className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-400/20" onClick={() => logMoodMut.mutate({ mood: selectedMood } as any, { onSuccess: () => notifySuccess('Mood', 'Mood logged successfully') })}>Log Mood</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics grid */}
      <div data-animate className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m: any) => {
          const pct = Math.round(((m.value ?? 0) / (m.max ?? 1)) * 100);
          return (
            <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardContent className="flex flex-col items-center gap-2 p-3">
                <m.icon className={cn('size-5', m.color)} />
                <span className="text-[10px] text-white/40 font-medium">{m.label}</span>
                <span className="text-lg font-bold text-white/90 tabular-nums">{m.value.toLocaleString()}</span>
                <span className="text-[9px] text-white/25">{m.unit} / {m.max.toLocaleString()}</span>
                <Progress value={pct} className="h-1 bg-white/5 w-full" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mood history */}
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader><CardTitle className="text-white/90 text-sm">Mood History</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2">
            {moodLog.map((entry: any) => {
              const cfg = MOOD_CFG[entry.mood as Mood];
              return (
                <div key={entry.date} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-2.5">
                  <cfg.Icon className={cn('size-4 shrink-0', cfg.cls)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/70 truncate">{entry.note}</p>
                    <p className="text-[10px] text-white/30">{new Date(entry.date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={cn('border-0 text-[9px]', cfg.cls, 'bg-white/5')}>{cfg.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Tips & Daily Challenge */}
        <div className="flex flex-col gap-4">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm flex items-center gap-2"><Sparkles className="size-4 text-amber-400" />Wellness Tips</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tips.map((tip: any) => (
                <div key={tip.title} className="flex items-start gap-2.5 rounded-lg border border-white/6 bg-white/2 p-3 hover:bg-white/4 transition-colors cursor-pointer" onClick={() => notifySuccess('Tip', 'Wellness tip opened')}>
                  <div className={cn('size-7 shrink-0 rounded-lg flex items-center justify-center', tip.color)}>
                    <tip.icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/70">{tip.title}</p>
                    <p className="text-[10px] text-white/30">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Weekly trend */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-sm">Weekly Wellness Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-28">
                {weeklyTrend.map((d: any) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-500/30 to-indigo-500/60"
                      style={{ height: `${d.score}%` }}
                    />
                    <span className="text-[9px] text-white/30">{d.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
