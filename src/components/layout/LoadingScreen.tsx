/* ─── LoadingScreen ─── Full-screen loading skeleton ──────────────── */
import { cn } from '@/lib/utils';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ message = 'Loading…', className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-xl',
        className,
      )}
    >
      {/* Animated rings */}
      <div className="relative size-16">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-indigo-400 border-r-transparent border-b-transparent border-l-transparent" />
        <div className="absolute inset-1 animate-spin rounded-full border-2 border-b-violet-400 border-t-transparent border-r-transparent border-l-transparent animation-duration-[1.5s] direction-[reverse]" />
        <div className="absolute inset-2 animate-spin rounded-full border-2 border-l-emerald-400 border-t-transparent border-r-transparent border-b-transparent animation-duration-[2s]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white/90">G</span>
        </div>
      </div>

      {/* Brand */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-semibold text-white/60">{message}</span>
        <span className="text-[10px] text-white/20 uppercase tracking-widest">GROW YouR NEED</span>
      </div>

      {/* Skeleton slots */}
      <div className="flex flex-col gap-2 w-64">
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-white/5 [animation-delay:100ms]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-white/5 [animation-delay:200ms]" />
      </div>
    </div>
  );
}
