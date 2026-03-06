/* ─── LearningPathOverviewPage ─── Full-page learning-path landing ── */
import { useState } from 'react';
import {
  Route, Map, Trophy, Star, ChevronRight,
  Flame, ArrowUpRight, Layers, Globe,
  Compass, Target, Zap, Clock, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

const PATHS = [
  { id: 'stem', name: 'STEM Explorer', color: 'bg-cyan-500/20 text-cyan-400', icon: Globe, modules: 12, completed: 8, xp: 2400 },
  { id: 'humanities', name: 'Humanities Scholar', color: 'bg-amber-500/20 text-amber-400', icon: Layers, modules: 10, completed: 6, xp: 1800 },
  { id: 'leadership', name: 'Leadership Track', color: 'bg-violet-500/20 text-violet-400', icon: Compass, modules: 8, completed: 3, xp: 900 },
];

const MODULES = [
  { title: 'Algebra Foundations', status: 'completed', xp: 300 },
  { title: 'Geometry & Proofs', status: 'completed', xp: 350 },
  { title: 'Trigonometry Basics', status: 'completed', xp: 320 },
  { title: 'Pre-Calculus', status: 'completed', xp: 400 },
  { title: 'Intro to Calculus', status: 'in_progress', xp: 450, progress: 65 },
  { title: 'Differential Equations', status: 'locked', xp: 500 },
  { title: 'Linear Algebra', status: 'locked', xp: 480 },
  { title: 'Multivariable Calculus', status: 'locked', xp: 550 },
];

const ACHIEVEMENTS = [
  { title: 'First Steps', desc: 'Complete your first module', earned: true, icon: Star },
  { title: 'Week Warrior', desc: '7-day study streak', earned: true, icon: Flame },
  { title: 'Speed Learner', desc: 'Complete a module in under 2 hours', earned: true, icon: Clock },
  { title: 'Knowledge Seeker', desc: 'Complete 10 modules', earned: false, icon: Target },
  { title: 'Master Mind', desc: 'Earn 5000 XP total', earned: false, icon: Trophy },
  { title: 'Pathfinder', desc: 'Complete an entire learning path', earned: false, icon: Route },
];

const LEADERBOARD = [
  { name: 'Sarah Chen', xp: 4820, rank: 1, avatar: 'SC' },
  { name: 'You', xp: 3900, rank: 2, avatar: 'ME' },
  { name: 'James Miller', xp: 3650, rank: 3, avatar: 'JM' },
  { name: 'Emily Rodriguez', xp: 3200, rank: 4, avatar: 'ER' },
  { name: 'David Kim', xp: 2980, rank: 5, avatar: 'DK' },
];

const SKILLS = [
  { name: 'Problem Solving', level: 88 },
  { name: 'Critical Thinking', level: 82 },
  { name: 'Research', level: 75 },
  { name: 'Communication', level: 70 },
  { name: 'Analytical Writing', level: 65 },
];

export default function LearningPathOverviewPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const [activePath, setActivePath] = useState('stem');
  const currentPath = PATHS.find((p) => p.id === activePath) ?? PATHS[0];
  const totalXP = PATHS.reduce((s, p) => s + p.xp, 0);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Learning Path" description="Track your personalized learning journey and milestones" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Total XP" value={totalXP} icon={<Zap className="h-5 w-5" />} trend="up" accentColor="#06b6d4" />
        <StatCard label="Modules Completed" value={17} icon={<Target className="h-5 w-5" />} />
        <StatCard label="Current Streak" value={12} suffix=" days" icon={<Flame className="h-5 w-5" />} accentColor="#f59e0b" />
        <StatCard label="Achievements" value={3} suffix="/6" icon={<Trophy className="h-5 w-5" />} />
      </div>

      {/* Path selector */}
      <div className="grid gap-3 sm:grid-cols-3" data-animate>
        {PATHS.map((path) => (
          <Card
            key={path.id}
            onClick={() => setActivePath(path.id)}
            className={cn(
              'border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer transition-all',
              activePath === path.id && 'ring-1 ring-cyan-500/40 border-cyan-500/20',
            )}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('size-10 rounded-xl flex items-center justify-center', path.color)}>
                <path.icon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/80">{path.name}</p>
                <p className="text-[9px] text-white/30">{path.completed}/{path.modules} modules · {path.xp} XP</p>
                <Progress value={(path.completed / path.modules) * 100} className="h-1 mt-1.5 bg-white/5" />
              </div>
              {activePath === path.id && <ChevronRight className="size-4 text-cyan-400 shrink-0" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main – Modules Timeline + Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Tabs defaultValue="modules" className="w-full">
            <TabsList data-animate className="bg-white/3 border border-white/[0.06] w-full justify-start gap-1">
              <TabsTrigger value="modules" className="text-[10px]">Module Timeline</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-[10px]">Leaderboard</TabsTrigger>
              <TabsTrigger value="achievements" className="text-[10px]">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="modules">
              <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                    <Map className="size-4 text-cyan-400" />{currentPath.name} — Modules
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-0.5 relative pl-6">
                  <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-white/6 to-white/3" />
                  {MODULES.map((m, i) => {
                    const done = m.status === 'completed';
                    const active = m.status === 'in_progress';
                    const locked = m.status === 'locked';
                    return (
                      <div key={i} className={cn('flex items-center gap-3 py-2 pl-4 relative', locked && 'opacity-40')}>
                        <div className={cn(
                          'absolute -left-[3px] size-3 rounded-full border-2 ring-2 ring-black',
                          done && 'bg-emerald-400 border-emerald-500',
                          active && 'bg-cyan-400 border-cyan-500 animate-pulse',
                          locked && 'bg-white/10 border-white/15',
                        )} />
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <p className="text-[11px] text-white/70">{m.title}</p>
                            {active && m.progress != null && (
                              <Progress value={m.progress} className="h-1 mt-1 w-28 bg-white/5" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[8px] border-white/6 text-white/25">+{m.xp} XP</Badge>
                            {done && <Star className="size-3 text-amber-400 fill-amber-400" />}
                            {active && <ArrowUpRight className="size-3 text-cyan-400" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard">
              <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                    <Award className="size-4 text-amber-400" />XP Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {LEADERBOARD.map((l) => (
                    <div key={l.rank} className={cn(
                      'flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-2.5',
                      l.name === 'You' && 'border-cyan-500/20 bg-cyan-500/5',
                    )}>
                      <span className="text-xs font-bold text-white/35 w-5 text-center">{l.rank}</span>
                      <div className="size-7 rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30 flex items-center justify-center text-[9px] font-bold text-white/60">{l.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-[11px] text-white/65', l.name === 'You' && 'text-cyan-400 font-semibold')}>{l.name}</p>
                      </div>
                      <span className="text-[10px] text-amber-400 font-semibold">{l.xp.toLocaleString()} XP</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="border-white/6 bg-white/3 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                    <Trophy className="size-4 text-violet-400" />Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 sm:grid-cols-2">
                  {ACHIEVEMENTS.map((a) => (
                    <div key={a.title} className={cn(
                      'flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/2 p-2.5',
                      !a.earned && 'opacity-40',
                    )}>
                      <div className={cn('size-8 rounded-lg flex items-center justify-center', a.earned ? 'bg-amber-500/15' : 'bg-white/5')}>
                        <a.icon className={cn('size-4', a.earned ? 'text-amber-400' : 'text-white/20')} />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-white/70">{a.title}</p>
                        <p className="text-[8px] text-white/25">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Skills radar-like */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Target className="size-4 text-emerald-400" />Skill Levels
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2.5">
              {SKILLS.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-white/50">{s.name}</span>
                    <span className="text-white/35">{s.level}%</span>
                  </div>
                  <Progress value={s.level} className="h-1.5 bg-white/5" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* XP Breakdown */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Zap className="size-4 text-amber-400" />XP Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {PATHS.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('size-6 rounded-md flex items-center justify-center', p.color)}>
                      <p.icon className="size-3" />
                    </div>
                    <span className="text-[10px] text-white/50">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-400">{p.xp}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1 border-t border-white/6">
                <span className="text-[10px] text-white/40">Total</span>
                <span className="text-xs font-bold text-amber-400">{totalXP} XP</span>
              </div>
            </CardContent>
          </Card>

          {/* Next milestone */}
          <Card data-animate className="border-cyan-500/15 bg-cyan-500/5 backdrop-blur-xl">
            <CardContent className="p-3">
              <p className="text-[10px] text-cyan-400 font-medium mb-1">Next Milestone</p>
              <p className="text-xs text-white/60">Complete "Intro to Calculus" to unlock Differential Equations</p>
              <Progress value={65} className="h-1.5 mt-2 bg-white/5" />
              <p className="text-[8px] text-white/25 mt-1">65% complete — keep going!</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
