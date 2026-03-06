/* ─── StudentLearningPathSection ─── Learning path tracker ─────────── */
import { useState } from 'react';
import { Route, CheckCircle2, Circle, Lock, Trophy, Clock, BookOpen, Star, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { notifySuccess } from '@/lib/notify';

type ModuleStatus = 'completed' | 'in-progress' | 'locked';

interface LearningModule {
  id: string;
  title: string;
  description: string;
  status: ModuleStatus;
  progress: number;
  duration: string;
  xp: number;
  lessons: number;
  completedLessons: number;
}

interface LearningPath {
  id: string;
  title: string;
  category: string;
  modules: LearningModule[];
  totalXP: number;
  earnedXP: number;
}

const STATUS_CFG: Record<ModuleStatus, { Icon: typeof CheckCircle2; cls: string; bg: string }> = {
  completed: { Icon: CheckCircle2, cls: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  'in-progress': { Icon: Circle, cls: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  locked: { Icon: Lock, cls: 'text-white/20', bg: 'bg-white/3' },
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
];

export default function StudentLearningPathSection() {
  const containerRef = useStaggerAnimate([]);
  const [activePath, setActivePath] = useState(PATHS[0].id);

  const path = PATHS.find((p) => p.id === activePath)!;
  const overallProgress = Math.round((path.earnedXP / path.totalXP) * 100);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      {/* Header */}
      <div data-animate className="flex items-center gap-2">
        <Route className="size-5 text-indigo-400" />
        <h2 className="text-lg font-bold text-white/90">Learning Paths</h2>
      </div>

      {/* Path selector tabs */}
      <div data-animate className="flex gap-3 overflow-x-auto">
        {PATHS.map((p) => {
          const pct = Math.round((p.earnedXP / p.totalXP) * 100);
          return (
            <Card
              key={p.id}
              onClick={() => setActivePath(p.id)}
              className={cn(
                'shrink-0 w-64 cursor-pointer border-white/6 bg-white/3 backdrop-blur-xl transition-colors',
                activePath === p.id && 'ring-1 ring-indigo-400/40 bg-indigo-500/5',
              )}
            >
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white/80">{p.title}</p>
                    <p className="text-[10px] text-white/30">{p.category}</p>
                  </div>
                  <Badge className="border-0 bg-amber-400/10 text-amber-400 text-[10px]">{p.earnedXP} XP</Badge>
                </div>
                <Progress value={pct} className="h-1.5 bg-white/5" />
                <span className="text-[10px] text-white/30">{pct}% complete • {p.modules.length} modules</span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall progress */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardContent className="flex items-center gap-6 p-4">
          <div className="relative size-20 shrink-0">
            <svg viewBox="0 0 36 36" className="size-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${overallProgress} ${100 - overallProgress}`} className="text-indigo-400" strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white/90">{overallProgress}%</span>
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="text-base font-bold text-white/90">{path.title}</h3>
            <p className="text-xs text-white/40">{path.category}</p>
            <div className="flex items-center gap-4 mt-1 text-[10px] text-white/30">
              <span className="flex items-center gap-1"><Trophy className="size-3 text-amber-400" />{path.earnedXP} / {path.totalXP} XP</span>
              <span className="flex items-center gap-1"><BookOpen className="size-3" />{path.modules.length} modules</span>
              <span className="flex items-center gap-1"><Star className="size-3 text-emerald-400" />{path.modules.filter(m => m.status === 'completed').length} completed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module timeline */}
      <div data-animate className="flex flex-col gap-3">
        {path.modules.map((mod, idx) => {
          const s = STATUS_CFG[mod.status];
          return (
            <div key={mod.id} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className={cn('size-8 rounded-full flex items-center justify-center shrink-0', s.bg)}>
                  <s.Icon className={cn('size-4', s.cls)} />
                </div>
                {idx < path.modules.length - 1 && (
                  <div className={cn('w-0.5 flex-1 my-1', mod.status === 'completed' ? 'bg-emerald-400/30' : 'bg-white/6')} />
                )}
              </div>

              {/* Module card */}
              <Card className={cn(
                'flex-1 border-white/6 backdrop-blur-xl transition-colors',
                mod.status === 'locked' ? 'bg-white/2 opacity-60' : 'bg-white/3 hover:bg-white/5 cursor-pointer',
              )}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white/80">{mod.title}</span>
                      <Badge className={cn('border-0 text-[9px] capitalize', s.bg, s.cls)}>
                        {mod.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-white/40">{mod.description}</p>
                    <div className="flex items-center gap-4 text-[10px] text-white/30 mt-1">
                      <span className="flex items-center gap-0.5"><Clock className="size-2.5" />{mod.duration}</span>
                      <span className="flex items-center gap-0.5"><BookOpen className="size-2.5" />{mod.completedLessons}/{mod.lessons} lessons</span>
                      <span className="flex items-center gap-0.5"><Trophy className="size-2.5 text-amber-400" />{mod.xp} XP</span>
                    </div>
                    {mod.status === 'in-progress' && (
                      <Progress value={mod.progress} className="h-1 bg-white/5 mt-1.5" />
                    )}
                  </div>
                  {mod.status !== 'locked' && (
                    <Button variant="ghost" size="icon" className="size-8 text-white/30" onClick={() => notifySuccess(mod.title, mod.status === 'completed' ? 'Reviewing completed module' : `Continuing lesson ${mod.completedLessons + 1} of ${mod.lessons}`)}>
                      <ChevronRight className="size-4" />
                    </Button>
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
