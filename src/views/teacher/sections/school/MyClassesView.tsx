/* ─── MyClassesView ─── Teacher's assigned classes ─────────────── */
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses } from '@/hooks/api';
import type { Course } from '@root/types';

export function MyClassesView({ schoolId, teacherId }: { schoolId: string | null; teacherId: string | null }) {
  const { data: coursesData, isLoading } = useCourses(schoolId);
  const allCourses: Course[] = coursesData ?? [];
  const courses = teacherId ? allCourses.filter((c) => c.teacherId === teacherId) : allCourses;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div data-animate className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 mb-3">
          <BookOpen className="size-7 text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-white/90">No Classes Found</h2>
        <p className="text-sm text-white/40">You haven't been assigned any classes yet.</p>
      </div>
    );
  }

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">My Classes</h2>
        <p className="text-sm text-white/40">{courses.length} classes</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-animate>
        {courses.map((c) => (
          <div key={c.id} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10">
                <BookOpen className="size-4 text-indigo-400" />
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{c.gradeLevel}</Badge>
            </div>
            <p className="text-sm font-semibold text-white/85 mt-2">{c.name}</p>
            <p className="text-xs text-white/40">{c.gradeLevel} · {c.semester}</p>
          </div>
        ))}
      </div>
    </>
  );
}
