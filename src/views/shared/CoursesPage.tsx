/* ─── CoursesPage ─── Holographic course grid with filters, sort, search ────── */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Search, Plus, SlidersHorizontal,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/features/EmptyState';
import { CourseCard, gradeCategory } from '@/components/features/CourseCard';
import { useCourses } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';
import type { Course } from '@root/types';

const SEMESTERS = ['All', 'Fall 2024', 'Spring 2025', 'Summer 2025', 'Fall 2025'];

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [semester, setSemester] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'semester' | 'recent'>('name');
  const { schoolId, user } = useAuthStore();
  const { data, isLoading, error } = useCourses(schoolId);
  const containerRef = useStaggerAnimate<HTMLDivElement>([category, semester, sortBy, isLoading]);

  const canCreate = user && ['PROVIDER', 'ADMIN', 'TEACHER'].includes(user.role);

  /* derive enriched + filtered list */
  const filtered = useMemo(() => {
    const courses: (Course & { _category: string })[] = (data ?? []).map((c: Course) => ({
      ...c,
      _category: gradeCategory(c.gradeLevel || '', c.name),
    }));

    return courses
      .filter((c) => {
        const s = search.toLowerCase();
        const matchSearch = !s || c.name.toLowerCase().includes(s) || (c.teacher?.firstName ?? '').toLowerCase().includes(s) || (c.teacher?.lastName ?? '').toLowerCase().includes(s);
        const matchCat = category === 'all' || c._category.toLowerCase() === category;
        const matchSem = semester === 'All' || c.semester === semester;
        return matchSearch && matchCat && matchSem;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'semester') return a.semester.localeCompare(b.semester);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [data, search, category, semester, sortBy]);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3" data-animate>
        <div>
          <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <GraduationCap className="size-5 text-indigo-400" /> Courses
          </h1>
          <p className="text-sm text-white/40 mt-0.5">{data?.length ?? 0} courses available</p>
        </div>
        {canCreate && (
          <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 gap-1.5">
            <Link to="/courses/new"><Plus className="size-3.5" /> New Course</Link>
          </Button>
        )}
      </div>

      {/* ── Filters bar ── */}
      <div className="flex items-center gap-3 flex-wrap" data-animate>
        {/* Search */}
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/25" />
          <Input
            placeholder="Search courses or teachers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/3 border-white/8 text-white/80 placeholder:text-white/25 h-9"
          />
        </div>

        {/* Category tabs */}
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="bg-white/4 border border-white/6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mathematics">Math</TabsTrigger>
            <TabsTrigger value="science">Science</TabsTrigger>
            <TabsTrigger value="humanities">Humanities</TabsTrigger>
            <TabsTrigger value="arts">Arts</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Semester filter */}
        <Select value={semester} onValueChange={setSemester}>
          <SelectTrigger className="w-37.5 h-9 bg-white/3 border-white/8 text-white/70 text-xs">
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            {SEMESTERS.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-32.5 h-9 bg-white/3 border-white/8 text-white/70 text-xs">
            <SlidersHorizontal className="size-3 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name A-Z</SelectItem>
            <SelectItem value="semester">Semester</SelectItem>
            <SelectItem value="recent">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400" data-animate>
          Failed to load courses. Please try again.
        </div>
      )}

      {/* ── Skeleton loading ── */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/6 bg-white/3 p-5 space-y-3">
              <Skeleton className="h-3 w-1/4 bg-white/6" />
              <Skeleton className="h-4 w-3/4 bg-white/6" />
              <Skeleton className="h-3 w-1/2 bg-white/6" />
              <Skeleton className="h-1.5 w-full bg-white/6" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* ── Course grid ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {/* ── Empty state ── */}
          {filtered.length === 0 && (
            <EmptyState
              title="No courses found"
              description="Try adjusting your filters or search term."
              icon={<GraduationCap className="size-10" />}
            />
          )}
        </>
      )}
    </div>
  );
}
