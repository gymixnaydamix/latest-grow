/* ConciergeUtilityRail — Slim right rail with today, recent, drafts, shortcuts, alerts */
import { Bell, Pin, FileEdit, Clock, Zap } from 'lucide-react';
import { useConciergeStore } from '@/store/concierge.store';
import { type TodayChip } from './ConciergeTodayStrip';
import { ConciergeDraftCard } from './ConciergeDraftCard';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface Props {
  todayChips?: TodayChip[];
  todayLabel?: string;
  extraContent?: ReactNode;
  className?: string;
}

export function ConciergeUtilityRail({ todayChips = [], todayLabel = 'Today', extraContent, className }: Props) {
  const { drafts, shortcuts, notifications, history } = useConciergeStore();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <aside className={cn(
      'flex w-56 shrink-0 flex-col gap-4 overflow-y-auto rounded-xl border border-border/30 bg-background/70 p-3 backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/50',
      className,
    )}>
      {/* Today strip */}
      {todayChips.length > 0 && (
        <section>
          <h5 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-3 w-3" /> {todayLabel}
          </h5>
          <div className="flex flex-col gap-1">
            {todayChips.map((c) => (
              <button
                key={c.id}
                onClick={c.onClick}
                className="flex items-center justify-between rounded-lg px-2 py-1 text-[11px] text-foreground hover:bg-muted/50"
              >
                <span>{c.label}</span>
                <span className="font-bold text-primary">{c.count}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent actions */}
      {history.length > 0 && (
        <section>
          <h5 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3 w-3" /> Recent Actions
          </h5>
          <div className="space-y-1">
            {history.slice(0, 4).map((h) => (
              <div key={h.id} className="rounded-lg px-2 py-1 text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">{h.title}</span>
                <span className="ml-1.5">{h.timestamp}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pinned shortcuts */}
      {shortcuts.length > 0 && (
        <section>
          <h5 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Pin className="h-3 w-3" /> Shortcuts
          </h5>
          <div className="space-y-1">
            {shortcuts.map((s) => (
              <button key={s.id} className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted/50">
                {s.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Active drafts */}
      {drafts.length > 0 && (
        <section>
          <h5 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <FileEdit className="h-3 w-3" /> Active Drafts
          </h5>
          <div className="space-y-1.5">
            {drafts.slice(0, 4).map((d) => (
              <ConciergeDraftCard key={d.id} title={d.title} type={d.type} updatedAt={d.updatedAt} linkedEntity={d.linkedEntity} />
            ))}
          </div>
        </section>
      )}

      {/* Notifications */}
      {unread > 0 && (
        <section>
          <h5 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Bell className="h-3 w-3" /> Notifications
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">{unread}</span>
          </h5>
        </section>
      )}

      {extraContent}
    </aside>
  );
}
