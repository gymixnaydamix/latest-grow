/* ConciergeBottomSheetWizard — Premium frosted bottom-sheet with multi-step wizard */
import { X, ChevronLeft, ChevronRight, Check, GripHorizontal } from 'lucide-react';
import { useConciergeStore } from '@/store/concierge.store';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  renderStep?: (stepIndex: number, data: Record<string, unknown>) => ReactNode;
  onComplete?: (data: Record<string, unknown>) => void;
  className?: string;
}

export function ConciergeBottomSheetWizard({ renderStep, onComplete, className }: Props) {
  const { wizard, closeWizard, nextWizardStep, prevWizardStep, completeWizardStep } = useConciergeStore();
  if (!wizard.open) return null;

  const isLast = wizard.currentStep === wizard.steps.length - 1;
  const isFirst = wizard.currentStep === 0;
  const progress = ((wizard.currentStep + 1) / wizard.steps.length) * 100;

  const handleNext = () => {
    completeWizardStep(wizard.currentStep);
    if (isLast) { onComplete?.(wizard.data); closeWizard(); }
    else nextWizardStep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeWizard} />
      {/* Sheet */}
      <div className={cn(
        'relative z-10 w-full max-w-2xl rounded-t-3xl border-t border-border/40 bg-background/95 pb-6 pt-2 shadow-2xl backdrop-blur-2xl dark:border-white/5 dark:bg-zinc-900/95',
        className,
      )}>
        {/* Drag handle */}
        <div className="mb-2 flex justify-center">
          <GripHorizontal className="h-5 w-8 text-muted-foreground/40" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-3">
          <h3 className="text-base font-semibold text-foreground">{wizard.title}</h3>
          <button onClick={closeWizard} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted/60">
            <X className="h-4 w-4" />
          </button>
        </div>
        {/* Progress */}
        <div className="mx-6 mb-4 h-1 overflow-hidden rounded-full bg-muted/40">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        {/* Step indicators */}
        <div className="mb-4 flex items-center justify-center gap-2 px-6">
          {wizard.steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition',
                i < wizard.currentStep ? 'bg-primary text-primary-foreground' :
                i === wizard.currentStep ? 'border-2 border-primary bg-primary/10 text-primary' :
                'border border-border/60 bg-muted/30 text-muted-foreground dark:border-white/10',
              )}>
                {i < wizard.currentStep ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={cn('text-[10px] hidden sm:inline', i === wizard.currentStep ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {s.label}
              </span>
              {i < wizard.steps.length - 1 && <div className="mx-1 h-px w-4 bg-border/60 dark:bg-white/10" />}
            </div>
          ))}
        </div>
        {/* Step content */}
        <div className="min-h-[200px] px-6">
          {renderStep?.(wizard.currentStep, wizard.data) ?? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              Step {wizard.currentStep + 1}: {wizard.steps[wizard.currentStep]?.label}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="mt-4 flex items-center justify-between px-6">
          <button
            onClick={prevWizardStep}
            disabled={isFirst}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition',
              isFirst ? 'text-muted-foreground/40 cursor-not-allowed' : 'text-foreground hover:bg-muted/60',
            )}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            {isLast ? 'Confirm' : 'Next'} {isLast ? <Check className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
