/* ─── GradeIndicator ─── Letter grade / score badge with adaptive color ─── */
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface GradeIndicatorProps {
  /** Numeric value 0-100 (or letter grade via `letter`) */
  value?: number;
  /** Override letter grade display (e.g. 'A+') */
  letter?: string;
  /** Show numeric percentage alongside letter */
  showPercentage?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function scoreToLetter(score: number): string {
  if (score >= 97) return 'A+';
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 77) return 'C+';
  if (score >= 73) return 'C';
  if (score >= 70) return 'C-';
  if (score >= 67) return 'D+';
  if (score >= 63) return 'D';
  if (score >= 60) return 'D-';
  return 'F';
}

function gradeColor(score: number): string {
  if (score >= 90) return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
  if (score >= 80) return 'border-blue-500/30 bg-blue-500/10 text-blue-400';
  if (score >= 70) return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
  if (score >= 60) return 'border-orange-500/30 bg-orange-500/10 text-orange-400';
  return 'border-red-500/30 bg-red-500/10 text-red-400';
}

const sizeStyles = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5 font-semibold',
};

export function GradeIndicator({
  value,
  letter,
  showPercentage = false,
  size = 'md',
  className,
}: GradeIndicatorProps) {
  const score = value ?? 0;
  const display = letter ?? scoreToLetter(score);
  const colorCls = gradeColor(score);

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono font-semibold tabular-nums tracking-wide',
        colorCls,
        sizeStyles[size],
        className,
      )}
    >
      {display}
      {showPercentage && value != null && (
        <span className="ml-1 opacity-60">{Math.round(value)}%</span>
      )}
    </Badge>
  );
}
