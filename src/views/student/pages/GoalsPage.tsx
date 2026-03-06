/* ─── GoalsPage ─── Wellness & personal goals tracker ──────────────── */
import { useState } from 'react';
import {
  Target, Plus, CheckCircle2, Circle,
  Trophy, Flame,
  Calendar, BarChart3, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

type GoalStatus = 'active' | 'completed' | 'paused';
type GoalCategory = 'health' | 'academic' | 'social' | 'mindfulness' | 'fitness' | 'habits';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  progress: number;
  target: string;
  startDate: string;
  endDate: string;
  streak: number;
  milestones: { label: string; done: boolean }[];
}

const CAT_CFG: Record<GoalCategory, { label: string; color: string }> = {
  health:      { label: 'Health', color: 'text-red-400 bg-red-400/10' },
  academic:    { label: 'Academic', color: 'text-indigo-400 bg-indigo-400/10' },
  social:      { label: 'Social', color: 'text-cyan-400 bg-cyan-400/10' },
  mindfulness: { label: 'Mindfulness', color: 'text-violet-400 bg-violet-400/10' },
  fitness:     { label: 'Fitness', color: 'text-emerald-400 bg-emerald-400/10' },
  habits:      { label: 'Habits', color: 'text-amber-400 bg-amber-400/10' },
};

const GOALS: Goal[] = [
  { id: '1', title: 'Sleep 8 Hours Nightly', description: 'Maintain a consistent sleep schedule of 8 hours to improve focus and mood.', category: 'health', status: 'active', progress: 72, target: '30 consecutive days', startDate: '2026-02-10', endDate: '2026-03-12', streak: 5, milestones: [{ label: '7-day streak', done: true }, { label: '14-day streak', done: true }, { label: '21-day streak', done: false }, { label: '30-day streak', done: false }] },
  { id: '2', title: 'Daily 10-Minute Meditation', description: 'Practice mindfulness meditation every morning before class.', category: 'mindfulness', status: 'active', progress: 60, target: 'Every day for a month', startDate: '2026-02-15', endDate: '2026-03-15', streak: 3, milestones: [{ label: 'First week', done: true }, { label: 'Try 3 techniques', done: true }, { label: '20-minute session', done: false }, { label: 'Full month', done: false }] },
  { id: '3', title: 'Run 5K Without Stopping', description: 'Build running endurance using a couch-to-5K program.', category: 'fitness', status: 'active', progress: 45, target: '5K continuous run', startDate: '2026-02-01', endDate: '2026-03-30', streak: 2, milestones: [{ label: 'Run 1K', done: true }, { label: 'Run 2K', done: true }, { label: 'Run 3.5K', done: false }, { label: 'Run 5K', done: false }] },
  { id: '4', title: 'Read 2 Books Per Month', description: 'Read non-academic books for personal growth and relaxation.', category: 'habits', status: 'active', progress: 50, target: '2 books this month', startDate: '2026-03-01', endDate: '2026-03-31', streak: 1, milestones: [{ label: 'Start Book 1', done: true }, { label: 'Finish Book 1', done: false }, { label: 'Start Book 2', done: false }, { label: 'Finish Book 2', done: false }] },
  { id: '5', title: 'Drink 8 Glasses of Water Daily', description: 'Stay hydrated throughout the school day.', category: 'health', status: 'completed', progress: 100, target: '21-day habit', startDate: '2026-02-01', endDate: '2026-02-21', streak: 21, milestones: [{ label: '7 days', done: true }, { label: '14 days', done: true }, { label: '21 days', done: true }, { label: 'Habit formed!', done: true }] },
  { id: '6', title: 'Join a Study Group', description: 'Participate in a weekly study group to build connections.', category: 'social', status: 'paused', progress: 30, target: 'Attend 8 sessions', startDate: '2026-02-15', endDate: '2026-04-15', streak: 0, milestones: [{ label: 'Find a group', done: true }, { label: 'Attend 2', done: true }, { label: 'Attend 5', done: false }, { label: 'Attend 8', done: false }] },
];

export default function GoalsPage() {
  const containerRef = useStaggerAnimate([]);
  const [statusFilter, setStatusFilter] = useState<'all' | GoalStatus>('all');
  const [showNew, setShowNew] = useState(false);

  const filtered = GOALS.filter((g) => statusFilter === 'all' || g.status === statusFilter);
  const active = GOALS.filter((g) => g.status === 'active').length;
  const completed = GOALS.filter((g) => g.status === 'completed').length;
  const longestStreak = Math.max(...GOALS.map((g) => g.streak));

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Goals" description="Set, track, and achieve your wellness and personal goals" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Active Goals" value={active} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Completed" value={completed} icon={<Trophy className="h-5 w-5" />} trend="up" />
        <StatCard label="Best Streak" value={longestStreak} suffix=" days" icon={<Flame className="h-5 w-5" />} />
        <StatCard label="Total Goals" value={GOALS.length} icon={<BarChart3 className="h-5 w-5" />} />
      </div>

      {/* Toolbar */}
      <div data-animate className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'active', 'completed', 'paused'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? 'default' : 'outline'}
              onClick={() => setStatusFilter(s)}
              className={cn('text-xs h-7 capitalize', statusFilter !== s && 'border-white/10 text-white/50')}
            >
              {s === 'all' ? 'All' : s}
            </Button>
          ))}
        </div>
        <Button onClick={() => setShowNew(!showNew)} className="gap-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/20 text-xs h-8">
          <Plus className="size-3" />New Goal
        </Button>
      </div>

      {/* New goal form */}
      {showNew && (
        <Card data-animate className="border-emerald-400/20 bg-emerald-500/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-white/90 text-sm flex items-center gap-2"><Sparkles className="size-4 text-emerald-400" />Create New Goal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input placeholder="Goal title…" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              <select className="h-8 rounded-md border border-white/8 bg-white/4 px-3 text-xs text-white/60 outline-none">
                {Object.entries(CAT_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <textarea rows={2} placeholder="Describe your goal…" className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none focus:border-emerald-400/40" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input type="text" placeholder="Target (e.g., 30 days)" className="bg-white/4 border-white/8 text-white/80 text-xs h-8" />
              <Input type="date" className="bg-white/4 border-white/8 text-white/60 text-xs h-8" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNew(false)} className="text-xs border-white/10 text-white/50">Cancel</Button>
              <Button size="sm" className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 gap-1" onClick={() => notifySuccess('Goal', 'New wellness goal created')}><Target className="size-3" />Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals list */}
      <div data-animate className="flex flex-col gap-4">
        {!filtered.length && (
          <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="py-10 text-center text-white/30 text-sm">No goals match your filter.</CardContent>
          </Card>
        )}
        {filtered.map((goal) => {
          const cat = CAT_CFG[goal.category];
          const doneCount = goal.milestones.filter((m) => m.done).length;
          return (
            <Card key={goal.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-colors">
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('border-0 text-[9px]', cat.color)}>{cat.label}</Badge>
                      <Badge className={cn('border-0 text-[9px]',
                        goal.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' :
                        goal.status === 'completed' ? 'bg-indigo-400/10 text-indigo-400' :
                        'bg-white/5 text-white/30'
                      )}>{goal.status}</Badge>
                    </div>
                    <p className="text-sm font-semibold text-white/80">{goal.title}</p>
                    <p className="text-[11px] text-white/40 mt-0.5">{goal.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {goal.streak > 0 && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Flame className="size-3.5" />
                        <span className="text-xs font-bold">{goal.streak}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  <Progress value={goal.progress} className="h-2 bg-white/5 flex-1" />
                  <span className="text-xs font-medium text-white/60 tabular-nums">{goal.progress}%</span>
                </div>

                {/* Milestones */}
                <div className="flex flex-wrap gap-2">
                  {goal.milestones.map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5">
                      {m.done ? <CheckCircle2 className="size-3 text-emerald-400" /> : <Circle className="size-3 text-white/20" />}
                      <span className={cn('text-[10px]', m.done ? 'text-white/60 line-through' : 'text-white/35')}>{m.label}</span>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-[10px] text-white/25">
                  <span className="flex items-center gap-1"><Calendar className="size-2.5" />{new Date(goal.startDate).toLocaleDateString()} – {new Date(goal.endDate).toLocaleDateString()}</span>
                  <span>Target: {goal.target}</span>
                  <span>{doneCount}/{goal.milestones.length} milestones</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
