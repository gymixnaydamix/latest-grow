/* ─── PlannerPage ─── AI-optimized study schedule ──────────────────── */
import { useState, useEffect } from 'react';
import { Plus, Sparkles, CalendarDays, GripVertical, Check, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import { notifySuccess } from '@/lib/notify';
import { useStudentPlanner, useAddPlannerBlock, useOptimizePlanner } from '@/hooks/api/use-student';

interface StudyBlock {
  id: string;
  time: string;
  task: string;
  subject: string;
  duration: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const INITIAL_BLOCKS: StudyBlock[] = [
  { id: '1', time: '3:30 PM', task: 'Review Chemistry notes — Organic Compounds', subject: 'Chemistry', duration: '30 min', priority: 'high', completed: false },
  { id: '2', time: '4:00 PM', task: 'Complete Algebra II problem set #12', subject: 'Math', duration: '45 min', priority: 'high', completed: false },
  { id: '3', time: '4:45 PM', task: 'Break — Stretch & Snack', subject: 'Break', duration: '15 min', priority: 'low', completed: false },
  { id: '4', time: '5:00 PM', task: 'Read History Chapter 16', subject: 'History', duration: '30 min', priority: 'medium', completed: false },
  { id: '5', time: '5:30 PM', task: 'English essay — Draft introduction', subject: 'English', duration: '40 min', priority: 'high', completed: false },
  { id: '6', time: '6:10 PM', task: 'Physics — Kinematics practice', subject: 'Physics', duration: '30 min', priority: 'medium', completed: false },
  { id: '7', time: '6:40 PM', task: 'Review flashcards — Spanish vocab', subject: 'Spanish', duration: '20 min', priority: 'low', completed: false },
];

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function PlannerPage() {
  const containerRef = useStaggerAnimate([]);
  const [blocks, setBlocks] = useState<StudyBlock[]>(INITIAL_BLOCKS);

  /* ── API data ── */
  const { data: apiPlanner } = useStudentPlanner();
  const addBlockMut = useAddPlannerBlock();
  const optimizeMut = useOptimizePlanner();

  /* Hydrate blocks from API when data arrives */
  useEffect(() => {
    if (apiPlanner && Array.isArray(apiPlanner) && apiPlanner.length > 0) {
      setBlocks(
        (apiPlanner as any[]).map((b: any, i: number) => ({
          id: b.id ?? String(i + 1),
          time: b.time ?? '',
          task: b.task ?? b.title ?? '',
          subject: b.subject ?? '',
          duration: b.duration ?? '30 min',
          priority: b.priority ?? 'medium',
          completed: !!b.completed,
        })),
      );
    }
  }, [apiPlanner]);

  const toggle = (id: string) =>
    setBlocks((b) => b.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)));

  const remove = (id: string) => setBlocks((b) => b.filter((x) => x.id !== id));

  const done = blocks.filter((b) => b.completed).length;
  const pct = Math.round((done / blocks.length) * 100);

  const totalMin = blocks.reduce((s, b) => s + parseInt(b.duration), 0);
  const doneMin = blocks.filter((b) => b.completed).reduce((s, b) => s + parseInt(b.duration), 0);

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="Study Planner" description="AI-optimized daily study schedule" />

      {/* Progress bar */}
      <Card data-animate>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Today's Progress</p>
                <p className="text-xs text-muted-foreground">{done}/{blocks.length} tasks · {doneMin}/{totalMin} min</p>
              </div>
            </div>
            <span className="text-lg font-bold text-primary tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div data-animate className="flex gap-2">
        <Button size="sm" className="gap-1.5 text-xs h-8" onClick={() => addBlockMut.mutate({} as any, { onSuccess: () => notifySuccess('Planner', 'New time block added') })}>
          <Plus className="size-3" /> Add Block
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8" onClick={() => optimizeMut.mutate(undefined as any, { onSuccess: () => notifySuccess('AI Optimize', 'Schedule optimized by AI') })}>
          <Sparkles className="size-3" /> AI Optimize
        </Button>
      </div>

      {/* Schedule blocks */}
      <div className="space-y-2" data-animate>
        {blocks.map((b) => (
          <Card
            key={b.id}
            className={cn(
              'transition-all',
              b.completed && 'opacity-50',
            )}
          >
            <CardContent className="flex items-center gap-3 py-3 px-4">
              <GripVertical className="size-4 text-muted-foreground/40 cursor-grab shrink-0" />
              <button onClick={() => toggle(b.id)} className={cn(
                'size-5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                b.completed ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/30',
              )}>
                {b.completed && <Check className="size-3 text-white" />}
              </button>
              <span className="text-xs font-mono text-muted-foreground w-16 shrink-0">{b.time}</span>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', b.completed && 'line-through')}>{b.task}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[9px] h-4">{b.subject}</Badge>
                  <span className="text-[10px] text-muted-foreground">{b.duration}</span>
                </div>
              </div>
              <Badge className={cn('text-[9px] border', PRIORITY_COLORS[b.priority])}>{b.priority}</Badge>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground/50 hover:text-red-400" onClick={() => remove(b.id)}>
                <Trash2 className="size-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
