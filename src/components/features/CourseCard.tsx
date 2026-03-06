/* ─── CourseCard ─── Glass-panel course card with 3D hover + color-coded border ─── */
import { useRef, useCallback, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@root/types';

/* ── Category logic & colours ── */
const categoryConfig: Record<string, { label: string; border: string; badge: string; glow: string }> = {
  Mathematics: { label: 'Math', border: 'border-l-blue-500', badge: 'text-blue-400 border-blue-500/30 bg-blue-500/10', glow: 'group-hover:shadow-blue-500/15' },
  Science:     { label: 'Science', border: 'border-l-emerald-500', badge: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', glow: 'group-hover:shadow-emerald-500/15' },
  Arts:        { label: 'Arts', border: 'border-l-amber-500', badge: 'text-amber-400 border-amber-500/30 bg-amber-500/10', glow: 'group-hover:shadow-amber-500/15' },
  Humanities:  { label: 'Humanities', border: 'border-l-violet-500', badge: 'text-violet-400 border-violet-500/30 bg-violet-500/10', glow: 'group-hover:shadow-violet-500/15' },
};

export function gradeCategory(level: string, name?: string): string {
  const l = (level + ' ' + (name ?? '')).toLowerCase();
  if (l.includes('math') || l.includes('algebra') || l.includes('calc') || l.includes('geom')) return 'Mathematics';
  if (l.includes('sci') || l.includes('bio') || l.includes('phys') || l.includes('chem')) return 'Science';
  if (l.includes('art') || l.includes('music') || l.includes('drama') || l.includes('paint')) return 'Arts';
  return 'Humanities';
}

export interface CourseCardProps {
  course: Course;
  /** Animated stagger attribute */
  animate?: boolean;
}

export function CourseCard({ course, animate = true }: CourseCardProps) {
  const cat = gradeCategory(course.gradeLevel || '', course.name);
  const cfg = categoryConfig[cat] ?? categoryConfig.Humanities;
  const enrollCount = course._count?.enrollments ?? 0;
  const assignmentCount = course._count?.assignments ?? 0;
  const teacher = course.teacher;
  const cardRef = useRef<HTMLDivElement>(null);

  /* 3D tilt on hover */
  const handleMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale3d(1.02,1.02,1.02)`;
  }, []);

  const handleLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = '';
  }, []);

  return (
    <Link to={`/courses/${course.id}`} className="block">
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...(animate ? { 'data-animate': '' } : {})}
        className={`
          group relative overflow-hidden rounded-2xl border border-l-[3px]
          border-white/6 ${cfg.border}
          bg-white/3 backdrop-blur-xl
          transition-all duration-300 ease-out
          hover:border-white/12 hover:shadow-2xl ${cfg.glow}
          cursor-pointer
        `}
      >
        {/* Scan line animation on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-x-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
        </div>

        {/* Card body */}
        <div className="p-5 space-y-4">
          {/* Top row: category badge + semester */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={`text-[10px] font-medium ${cfg.badge}`}>
              {cfg.label}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-semibold bg-white/5 text-white/60 border-white/8">
              {course.semester}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug">
            {course.name}
          </h3>

          {/* Teacher row */}
          {teacher && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="size-7 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-indigo-400/30">
                  {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                </div>
                {/* Neon ring pulse */}
                <div className="absolute inset-0 rounded-full ring-1 ring-indigo-400/40 animate-ping opacity-20" />
              </div>
              <span className="text-xs text-white/50">{teacher.firstName} {teacher.lastName}</span>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center justify-between text-[11px] text-white/40">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" /> {enrollCount} enrolled
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="size-3" /> {assignmentCount} tasks
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {course.gradeLevel}
            </span>
          </div>

          {/* Progress bar (placeholder value — real progress computed from submissions) */}
          <div>
            <div className="flex items-center justify-between text-[10px] mb-1.5">
              <span className="text-white/35">Course Progress</span>
              <span className="font-medium text-white/60">—</span>
            </div>
            <div className="relative h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 w-1/2" />
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-white/30 group-hover:text-white/50 transition-colors">View Course</span>
            <ChevronRight className="size-3.5 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  );
}
