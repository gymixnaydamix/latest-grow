/* ConciergeConversationPanel — Main chat area with messages + action cards + receipts */
import { useRef, useEffect } from 'react';
import { useConciergeStore, type ConciergeMessage } from '@/store/concierge.store';
import { ConciergeActionCard } from './ConciergeActionCard';
import { ConciergeExecutionReceipt } from './ConciergeExecutionReceipt';
import { cn } from '@/lib/utils';

interface Props {
  starterMessages?: ConciergeMessage[];
  suggestionChips?: string[];
  onChipClick?: (label: string) => void;
  className?: string;
}

export function ConciergeConversationPanel({ starterMessages = [], suggestionChips = [], onChipClick, className }: Props) {
  const { messages } = useConciergeStore();
  const endRef = useRef<HTMLDivElement>(null);
  const all = messages.length > 0 ? messages : starterMessages;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [all.length]);

  return (
    <div className={cn('flex flex-1 flex-col gap-3 overflow-y-auto px-1 py-4', className)}>
      {all.map((msg) => (
        <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
          <div className={cn(
            'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            msg.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/60 text-foreground dark:bg-zinc-800/60',
          )}>
            <p>{msg.content}</p>
            {msg.actionCard && (
              <div className="mt-3">
                <ConciergeActionCard card={msg.actionCard} />
              </div>
            )}
            {msg.receipt && (
              <div className="mt-3">
                <ConciergeExecutionReceipt receipt={msg.receipt} />
              </div>
            )}
          </div>
        </div>
      ))}
      {suggestionChips.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              onClick={() => onChipClick?.(chip)}
              className="rounded-full border border-border/50 bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted/60 dark:border-white/10"
            >
              {chip}
            </button>
          ))}
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
