/* ConciergeNextStepPanel — Suggested next actions after execution */
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { steps: string[]; onPickStep?: (step: string) => void; className?: string; }

export function ConciergeNextStepPanel({ steps, onPickStep, className }: Props) {
  if (steps.length === 0) return null;
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {steps.map((s) => (
        <button
          key={s}
          onClick={() => onPickStep?.(s)}
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
        >
          <ArrowRight className="h-3 w-3" /> {s}
        </button>
      ))}
    </div>
  );
}
