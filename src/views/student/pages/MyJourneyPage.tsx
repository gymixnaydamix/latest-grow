/* ─── MyJourneyPage ─── Full learning-path tracker page ────────────── */
import { useState } from 'react';
import { Route, CheckCircle2, Circle, Lock, Trophy, Clock, BookOpen, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useStudentLearningPaths } from '@/hooks/api/use-student';

type ModuleStatus = 'completed' | 'in-progress' | 'locked';

interface LearningModule {
  id: string; title: string; description: string; status: ModuleStatus;
  progress: number; duration: string; xp: number; lessons: number; completedLessons: number;
}
interface LearningPath {
  id: string; title: string; category: string; modules: LearningModule[];
  totalXP: number; earnedXP: number;
}

const STATUS_CFG: Record<ModuleStatus, { Icon: typeof CheckCircle2; cls: string; bg: string }> = {
  completed: { Icon: CheckCircle2, cls: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'in-progress': { Icon: Circle, cls: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  locked: { Icon: Lock, cls: 'text-muted-foreground/30', bg: 'bg-muted/30' },
};

const PATHS: LearningPath[] = [
  {
    id: 'p1', title: 'Web Development Fundamentals', category: 'Computer Science', totalXP: 2400, earnedXP: 1650,
    modules: [
      { id: 'm1', title: 'HTML & CSS Basics', description: 'Build your first web pages', status: 'completed', progress: 100, duration: '4h', xp: 300, lessons: 12, completedLessons: 12 },
      { id: 'm2', title: 'JavaScript Essentials', description: 'Variables, functions, and control flow', status: 'completed', progress: 100, duration: '6h', xp: 450, lessons: 18, completedLessons: 18 },
      { id: 'm3', title: 'React Foundations', description: 'Components, state, and props', status: 'completed', progress: 100, duration: '8h', xp: 600, lessons: 24, completedLessons: 24 },
      { id: 'm4', title: 'API Integration', description: 'Fetching data and REST APIs', status: 'in-progress', progress: 45, duration: '5h', xp: 400, lessons: 15, completedLessons: 7 },
      { id: 'm5', title: 'Full-Stack Project', description: 'Build a complete application', status: 'locked', progress: 0, duration: '10h', xp: 650, lessons: 20, completedLessons: 0 },
    ],
  },
  {
    id: 'p2', title: 'Data Science Intro', category: 'Mathematics', totalXP: 1800, earnedXP: 450,
    modules: [
      { id: 'm6', title: 'Statistics Review', description: 'Mean, median, distributions', status: 'completed', progress: 100, duration: '3h', xp: 250, lessons: 10, completedLessons: 10 },
      { id: 'm7', title: 'Python for Data', description: 'Pandas, NumPy basics', status: 'in-progress', progress: 30, duration: '6h', xp: 400, lessons: 16, completedLessons: 5 },
      { id: 'm8', title: 'Data Visualisation', description: 'Charts and storytelling with data', status: 'locked', progress: 0, duration: '5h', xp: 350, lessons: 14, completedLessons: 0 },
      { id: 'm9', title: 'Machine Learning Basics', description: 'Intro to ML concepts', status: 'locked', progress: 0, duration: '8h', xp: 500, lessons: 20, completedLessons: 0 },
    ],
  },
  {
    id: 'p3', title: 'Creative Writing', category: 'Language Arts', totalXP: 1200, earnedXP: 800,
    modules: [
      { id: 'm10', title: 'Story Structure', description: 'Plot, characters, setting', status: 'completed', progress: 100, duration: '3h', xp: 200, lessons: 8, completedLessons: 8 },
      { id: 'm11', title: 'Voice & Style', description: 'Developing your unique voice', status: 'completed', progress: 100, duration: '4h', xp: 300, lessons: 10, completedLessons: 10 },
      { id: 'm12', title: 'Poetry Workshop', description: 'Forms, rhythm, and imagery', status: 'in-progress', progress: 60, duration: '3h', xp: 250, lessons: 8, completedLessons: 5 },
      { id: 'm13', title: 'Peer Review', description: 'Giving and receiving feedback', status: 'locked', progress: 0, duration: '2h', xp: 150, lessons: 6, completedLessons: 0 },
    ],
  },
];

export default function MyJourneyPage() {
  const containerRef = useStaggerAnimate([]);
  const [activePath, setActivePath] = useState(PATHS[0].id);

  /* ── API data ── */
  const { data: _apiPaths } = useStudentLearningPaths();
  const journeyPaths = (_apiPaths as any[]) ?? [];

  const path = (journeyPaths.length > 0 ? journeyPaths : PATHS).find((p: any) => p.id === activePath)!;
  const pct = Math.round((path.earnedXP / path.totalXP) * 100);

  const totalXP = (journeyPaths.length > 0 ? journeyPaths : PATHS).reduce((s: number, p: any) => s + (p.earnedXP ?? 0), 0);
  const totalModules = (journeyPaths.length > 0 ? journeyPaths : PATHS).reduce((s: number, p: any) => s + (p.modules?.length ?? 0), 0);
  const completedModules = (journeyPaths.length > 0 ? journeyPaths : PATHS).reduce((s: number, p: any) => s + (p.modules?.filter((m: any) => m.status === 'completed')?.length ?? 0), 0);

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="My Journey" description="Your personalised learning paths and progress" />

      {/* Global Stats */}
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        <StatCard label="Total XP Earned" value={totalXP} icon={<Trophy className="h-5 w-5" />} trend="up" />
        <StatCard label="Modules Completed" value={completedModules} suffix={`/${totalModules}`} icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Active Paths" value={(journeyPaths.length > 0 ? journeyPaths : PATHS).length} icon={<Route className="h-5 w-5" />} />
      </div>

      {/* Path selector */}
      <div data-animate className="flex gap-3 overflow-x-auto pb-1">
        {(journeyPaths.length > 0 ? journeyPaths : PATHS).map((p: any) => {
          const pp = Math.round((p.earnedXP / p.totalXP) * 100);
          return (
            <Card
              key={p.id}
              onClick={() => setActivePath(p.id)}
              className={cn(
                'shrink-0 w-64 cursor-pointer transition-colors',
                activePath === p.id && 'ring-1 ring-primary/40 border-primary/30',
              )}
            >
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">{p.category}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{p.earnedXP} XP</Badge>
                </div>
                <Progress value={pp} className="h-1.5" />
                <span className="text-[10px] text-muted-foreground">{pp}% complete · {p.modules.length} modules</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Active path progress */}
      <Card data-animate>
        <CardContent className="flex items-center gap-6 p-5">
          <div className="relative size-20 shrink-0">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted/30" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${pct} ${100 - pct}`} className="text-primary" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="text-base font-bold">{path.title}</h3>
            <p className="text-xs text-muted-foreground">{path.category}</p>
            <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><Trophy className="size-3 text-amber-500" />{path.earnedXP} / {path.totalXP} XP</span>
              <span className="flex items-center gap-1"><BookOpen className="size-3" />{path.modules.length} modules</span>
              <span className="flex items-center gap-1"><Star className="size-3 text-emerald-500" />{path.modules?.filter((m: any) => m.status === 'completed').length ?? 0} done</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module timeline */}
      <div data-animate className="flex flex-col gap-3">
        {path.modules?.map((mod: any, idx: number) => {
          const s = STATUS_CFG[mod.status as keyof typeof STATUS_CFG];
          return (
            <div key={mod.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={cn('size-8 rounded-full flex items-center justify-center shrink-0', s.bg)}>
                  <s.Icon className={cn('size-4', s.cls)} />
                </div>
                {idx < path.modules.length - 1 && (
                  <div className={cn('w-0.5 flex-1 my-1', mod.status === 'completed' ? 'bg-emerald-500/30' : 'bg-border')} />
                )}
              </div>
              <Card className={cn(
                'flex-1 transition-colors',
                mod.status === 'locked' ? 'opacity-50' : 'hover:border-primary/30 cursor-pointer',
              )} onClick={mod.status !== 'locked' ? () => notifySuccess('Module', 'Opening learning module…') : undefined}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{mod.title}</span>
                      <Badge variant="outline" className="text-[9px] capitalize">{mod.status.replace('-', ' ')}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{mod.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-0.5"><Clock className="size-2.5" />{mod.duration}</span>
                      <span className="flex items-center gap-0.5"><BookOpen className="size-2.5" />{mod.completedLessons}/{mod.lessons}</span>
                      <span className="flex items-center gap-0.5"><Trophy className="size-2.5 text-amber-500" />{mod.xp} XP</span>
                    </div>
                    {mod.status === 'in-progress' && <Progress value={mod.progress} className="h-1 mt-1.5" />}
                  </div>
                  {mod.status !== 'locked' && (
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => notifySuccess('Module', 'Opening module details…')}><ChevronRight className="size-4" /></Button>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
