/* ConciergeChatView — Default assistant chat screen with welcome + quick actions + today + conversation */
import type { LucideIcon } from 'lucide-react';
import type { ConciergeMessage } from '@/store/concierge.store';
import { ConciergeWelcomeBlock } from './ConciergeWelcomeBlock';
import { ConciergeQuickActionGrid, type QuickAction } from './ConciergeQuickActionGrid';
import { ConciergeTodayStrip, type TodayChip } from './ConciergeTodayStrip';
import { ConciergeConversationPanel } from './ConciergeConversationPanel';
import { ConciergeCommandComposer } from './ConciergeCommandComposer';
import { cn } from '@/lib/utils';

interface Props {
  greeting: string;
  contextSummary: string;
  suggestions: { label: string; icon?: LucideIcon; onClick?: () => void }[];
  quickActions: QuickAction[];
  todayChips: TodayChip[];
  starterMessages?: ConciergeMessage[];
  suggestionChips?: string[];
  slashCommands?: string[];
  isLoading?: boolean;
  onSend?: (text: string) => void;
  onChipClick?: (label: string) => void;
  className?: string;
}

export function ConciergeChatView({
  greeting, contextSummary, suggestions, quickActions, todayChips,
  starterMessages, suggestionChips, slashCommands, isLoading, onSend, onChipClick, className,
}: Props) {
  return (
    <div className={cn('flex flex-1 flex-col gap-4', className)}>
      <ConciergeWelcomeBlock greeting={greeting} contextSummary={contextSummary} suggestions={suggestions} />
      <ConciergeQuickActionGrid actions={quickActions} />
      <ConciergeTodayStrip chips={todayChips} />
      <ConciergeConversationPanel
        starterMessages={starterMessages}
        suggestionChips={suggestionChips}
        onChipClick={onChipClick}
        isLoading={isLoading}
      />
      <ConciergeCommandComposer
        slashCommands={slashCommands}
        onSend={onSend}
        placeholder="Ask the concierge..."
      />
    </div>
  );
}
