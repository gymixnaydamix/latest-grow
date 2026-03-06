/* ConciergeLayout — 3-zone layout: context bar (top) + main area (center) + utility rail (right) */
import type { ReactNode } from 'react';
import type { ConciergeContextField } from '@/store/concierge.store';
import { ConciergeContextBar } from './ConciergeContextBar';
import { ConciergeUtilityRail } from './ConciergeUtilityRail';
import type { TodayChip } from './ConciergeTodayStrip';
import { ConciergeBottomSheetWizard } from './ConciergeBottomSheetWizard';
import { cn } from '@/lib/utils';

interface Props {
  contextFields: ConciergeContextField[];
  onContextFieldChange?: (key: string, value: string) => void;
  todayChips?: TodayChip[];
  todayLabel?: string;
  children: ReactNode;
  utilityExtra?: ReactNode;
  renderWizardStep?: (stepIndex: number, data: Record<string, unknown>) => ReactNode;
  onWizardComplete?: (data: Record<string, unknown>) => void;
  className?: string;
}

export function ConciergeLayout({
  contextFields, onContextFieldChange, todayChips = [], todayLabel,
  children, utilityExtra, renderWizardStep, onWizardComplete, className,
}: Props) {
  return (
    <div className={cn('flex h-full flex-col gap-3', className)}>
      {/* Zone 1: Context bar */}
      <ConciergeContextBar fields={contextFields} onFieldChange={onContextFieldChange} />

      {/* Zone 2 + Zone 3 side-by-side */}
      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Zone 2: Main content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>
        {/* Zone 3: Utility rail */}
        <ConciergeUtilityRail todayChips={todayChips} todayLabel={todayLabel} extraContent={utilityExtra} />
      </div>

      {/* Bottom-sheet wizard overlay */}
      <ConciergeBottomSheetWizard renderStep={renderWizardStep} onComplete={onWizardComplete} />
    </div>
  );
}
