/* ─── UpcomingPage ─── Upcoming assignments & deadlines ────────────── */
import { useMemo, useState } from 'react';
import { Clock, CalendarCheck, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useAuthStore } from '@/store/auth.store';
import { useCourses, useAssignments } from '@/hooks/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

const URGENCY: Record<string, { cls: string; label: string }> = {
  overdue: { cls: 'border-red-500/40 bg-red-500/5', label: 'Overdue' },
  today: { cls: 'border-amber-500/40 bg-amber-500/5', label: 'Today' },
  thisWeek: { cls: 'border-blue-500/40 bg-blue-500/5', label: 'This Week' },
  later: { cls: 'border-border', label: 'Later' },
};

function getUrgency(due: string): string {
  const d = new Date(due);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff < 86_400_000) return 'today';
  if (diff < 7 * 86_400_000) return 'thisWeek';
  return 'later';
}

export default function UpcomingPage() {
  const containerRef = useStaggerAnimate([]);
  const { schoolId } = useAuthStore();
  const { data: coursesData } = useCourses(schoolId);
  const courses = coursesData ?? [];
  const [selectedCourse, setSelectedCourse] = useState<string | null>(courses[0]?.id ?? null);
  const { data: assignmentsRaw, isLoading } = useAssignments(selectedCourse);

  const assignments = useMemo(() => {
    const list = (assignmentsRaw ?? []) as { id: string; title: string; dueDate: string; type: string; maxScore: number }[];
    return [...list].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [assignmentsRaw]);

  const grouped = useMemo(() => {
    const g: Record<string, typeof assignments> = { overdue: [], today: [], thisWeek: [], later: [] };
    assignments.forEach((a) => {
      const u = getUrgency(a.dueDate);
      g[u].push(a);
    });
    return g;
  }, [assignments]);

  return (
    <div ref={containerRef} className="space-y-6">
      <PageHeader title="Upcoming" description="Assignments, quizzes, and deadlines ahead" />

      {/* Course filter */}
      {courses.length > 0 && (
        <div data-animate className="flex items-center gap-2 flex-wrap">
          <Filter className="size-4 text-muted-foreground" />
          <Button size="sm" variant={!selectedCourse ? 'default' : 'outline'} className="text-xs h-7" onClick={() => setSelectedCourse(null)}>All</Button>
          {courses.map((c) => (
            <Button key={c.id} size="sm" variant={selectedCourse === c.id ? 'default' : 'outline'} className="text-xs h-7" onClick={() => setSelectedCourse(c.id)}>
              {c.name}
            </Button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3" data-animate>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      )}

      {!isLoading && !assignments.length && (
        <div data-animate className="text-center py-16">
          <CheckCircle2 className="size-12 mx-auto text-emerald-500/60" />
          <p className="text-sm text-muted-foreground mt-3">All caught up! No upcoming assignments.</p>
        </div>
      )}

      {/* Urgency groups */}
      {!isLoading && Object.entries(grouped).map(([key, items]) => {
        if (!items.length) return null;
        const u = URGENCY[key];
        return (
          <div key={key} data-animate>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              {key === 'overdue' && <AlertTriangle className="size-4 text-red-500" />}
              {key === 'today' && <Clock className="size-4 text-amber-500" />}
              {key === 'thisWeek' && <CalendarCheck className="size-4 text-blue-500" />}
              {u.label} <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
            </h3>
            <div className="space-y-2">
              {items.map((a) => (
                <Card key={a.id} className={cn('transition-colors hover:border-primary/30', u.cls)}>
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-primary/10 p-2"><Clock className="size-4 text-primary" /></div>
                      <div>
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">Due {new Date(a.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{a.type}</Badge>
                      <span className="text-xs font-medium tabular-nums">{a.maxScore} pts</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
