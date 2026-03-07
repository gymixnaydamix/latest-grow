/* ─── VirtualLabsPage ─── Interactive STEM virtual laboratories ─────── */
import { useState } from 'react';
import {
  FlaskConical, Atom, Microscope, Dna, Zap, Play,
  RotateCcw, BookOpen, Star, Clock, Trophy, Beaker,
  Gauge, Settings, ChevronRight, CheckCircle2, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

const FALLBACK_LABS = [
  { id: '1', title: 'Acid-Base Titration', subject: 'Chemistry', icon: FlaskConical, difficulty: 'Beginner', progress: 100, rating: 4.8, duration: '20 min', locked: false },
  { id: '2', title: 'Pendulum Motion', subject: 'Physics', icon: Gauge, difficulty: 'Intermediate', progress: 60, rating: 4.5, duration: '25 min', locked: false },
  { id: '3', title: 'Cell Division Stages', subject: 'Biology', icon: Microscope, difficulty: 'Beginner', progress: 85, rating: 4.9, duration: '15 min', locked: false },
  { id: '4', title: 'DNA Extraction', subject: 'Biology', icon: Dna, difficulty: 'Intermediate', progress: 30, rating: 4.7, duration: '30 min', locked: false },
  { id: '5', title: 'Circuit Builder', subject: 'Physics', icon: Zap, difficulty: 'Advanced', progress: 0, rating: 4.6, duration: '35 min', locked: false },
  { id: '6', title: 'Atomic Structure', subject: 'Chemistry', icon: Atom, difficulty: 'Advanced', progress: 0, rating: 4.4, duration: '40 min', locked: true },
];

const FALLBACK_RECENT_RESULTS = [
  { lab: 'Acid-Base Titration', score: 95, accuracy: 98, date: '1 d ago', badge: 'Perfect Run' },
  { lab: 'Cell Division Stages', score: 87, accuracy: 92, date: '3 d ago', badge: null },
  { lab: 'Pendulum Motion', score: 78, accuracy: 85, date: '5 d ago', badge: null },
];

const FALLBACK_ACTIVE_STEPS = [
  { label: 'Prepare Equipment', done: true },
  { label: 'Measure solutions', done: true },
  { label: 'Add indicator', done: false },
  { label: 'Titrate until endpoint', done: false },
  { label: 'Record results', done: false },
];

const subjectColor: Record<string, string> = {
  Chemistry: 'bg-indigo-500/20 text-indigo-400',
  Physics: 'bg-amber-500/20 text-amber-400',
  Biology: 'bg-emerald-500/20 text-emerald-400',
};

export default function VirtualLabsPage() {
  const containerRef = useStaggerAnimate([]);
  const [filter, setFilter] = useState<string>('all');
  const [activeLab, setActiveLab] = useState<string | null>(null);
  const LABS = FALLBACK_LABS;
  const RECENT_RESULTS = FALLBACK_RECENT_RESULTS;
  const ACTIVE_STEPS = FALLBACK_ACTIVE_STEPS;

  const filtered = filter === 'all' ? LABS : LABS.filter((l) => l.subject === filter);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Virtual Labs" description="Hands-on STEM experiments in a safe virtual environment" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Labs Completed" value={3} icon={<FlaskConical className="h-5 w-5" />} />
        <StatCard label="Avg Accuracy" value={92} suffix="%" icon={<Gauge className="h-5 w-5" />} trend="up" />
        <StatCard label="Badges Earned" value={5} icon={<Trophy className="h-5 w-5" />} />
        <StatCard label="Time in Labs" value={4.5} suffix="h" icon={<Clock className="h-5 w-5" />} decimals={1} />
      </div>

      {!activeLab ? (
        <>
          {/* Filters */}
          <div className="flex gap-2" data-animate>
            {['all', 'Chemistry', 'Physics', 'Biology'].map((f) => (
              <Button
                key={f} size="sm" variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className={cn('text-xs capitalize', filter !== f && 'border-white/10 text-white/40')}
              >{f}</Button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Lab cards */}
            <div className="lg:col-span-2 grid gap-3 sm:grid-cols-2">
              {filtered.map((lab) => (
                <Card key={lab.id} data-animate className={cn('border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all cursor-pointer group', lab.locked && 'opacity-50')} onClick={() => notifySuccess('Virtual Lab', 'Opening virtual lab…')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn('size-10 rounded-lg flex items-center justify-center', subjectColor[lab.subject])}>
                        {lab.locked ? <Lock className="size-4" /> : <lab.icon className="size-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white/80">{lab.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={cn('text-[8px]', subjectColor[lab.subject])}>{lab.subject}</Badge>
                          <Badge variant="outline" className="text-[8px] border-white/8 text-white/25">{lab.difficulty}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[9px] text-white/30">
                      <Clock className="size-2.5" />{lab.duration}
                      <span className="ml-auto flex items-center gap-0.5"><Star className="size-2.5 text-amber-400" />{lab.rating}</span>
                    </div>

                    {lab.progress > 0 && !lab.locked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[9px] text-white/25 mb-1">
                          <span>Progress</span><span>{lab.progress}%</span>
                        </div>
                        <Progress value={lab.progress} className="h-1 bg-white/5" />
                      </div>
                    )}

                    {!lab.locked && (
                      <Button
                        size="sm"
                        onClick={() => setActiveLab(lab.id)}
                        className="w-full mt-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {lab.progress > 0 && lab.progress < 100 ? <><Play className="size-3" />Continue</> : lab.progress === 100 ? <><RotateCcw className="size-3" />Redo</> : <><Play className="size-3" />Start Lab</>}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Results */}
            <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white/90 text-sm">Recent Results</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {RECENT_RESULTS.map((r, i) => (
                  <div key={i} className="rounded-lg border border-white/6 bg-white/2 p-2.5">
                    <p className="text-xs text-white/70 font-medium">{r.lab}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[9px] text-white/30">
                      <span>Score: <span className="text-white/60">{r.score}</span></span>
                      <span>Accuracy: <span className="text-white/60">{r.accuracy}%</span></span>
                    </div>
                    {r.badge && (
                      <Badge className="text-[8px] bg-amber-500/15 text-amber-400 mt-1.5"><Trophy className="size-2 mr-0.5" />{r.badge}</Badge>
                    )}
                    <p className="text-[9px] text-white/20 mt-1">{r.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Active lab view */
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white/90 text-sm">Acid-Base Titration</CardTitle>
                <p className="text-[10px] text-white/30 mt-0.5">Step 2 of 5 — Measure solutions</p>
              </div>
              <div className="flex gap-1.5">
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" onClick={() => notifySuccess('Settings', 'Lab settings opened')}><Settings className="size-3" />Settings</Button>
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40 gap-1" onClick={() => setActiveLab(null)}><RotateCcw className="size-3" />Exit</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {/* Experiment view */}
            <div className="lg:col-span-2 rounded-xl border border-white/6 bg-black/30 flex items-center justify-center" style={{ minHeight: 300 }}>
              <div className="text-center">
                <Beaker className="size-12 text-indigo-400/40 mx-auto mb-3" />
                <p className="text-sm text-white/40">3D Lab Simulation</p>
                <p className="text-[10px] text-white/20">Drag to rotate · Scroll to zoom</p>
                <Button size="sm" className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1" onClick={() => notifySuccess('Experiment', 'Starting experiment…')}><Play className="size-3" />Run Experiment</Button>
              </div>
            </div>

            {/* Steps sidebar */}
            <div className="flex flex-col gap-2">
              <h4 className="text-xs font-medium text-white/60">Procedure Steps</h4>
              {ACTIVE_STEPS.map((s, i) => (
                <div key={i} className={cn(
                  'flex items-center gap-2 rounded-lg border p-2.5 text-xs transition-all',
                  s.done ? 'border-emerald-500/20 bg-emerald-500/5 text-white/50' : i === 2 ? 'border-indigo-500/30 bg-indigo-500/8 text-white/80' : 'border-white/6 bg-white/2 text-white/30',
                )}>
                  {s.done ? <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" /> : <ChevronRight className={cn('size-3.5 shrink-0', i === 2 ? 'text-indigo-400' : 'text-white/15')} />}
                  <span className={cn(s.done && 'line-through')}>{s.label}</span>
                </div>
              ))}
              <div className="mt-2">
                <Progress value={40} className="h-1.5 bg-white/5" />
                <p className="text-[9px] text-white/25 mt-1 text-right">40% complete</p>
              </div>

              <Card className="border-amber-500/15 bg-amber-500/5 mt-2">
                <CardContent className="p-2.5">
                  <p className="text-[10px] text-amber-400 font-medium flex items-center gap-1"><BookOpen className="size-3" />Hint</p>
                  <p className="text-[9px] text-amber-300/60 mt-1">Add 2-3 drops of phenolphthalein indicator to the acid solution before titrating.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
