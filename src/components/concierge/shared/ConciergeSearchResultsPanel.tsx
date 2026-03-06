/* ConciergeSearchResultsPanel — Search results with direct actions */
import { Search, ExternalLink } from 'lucide-react';
import { useConciergeStore } from '@/store/concierge.store';
import { cn } from '@/lib/utils';

interface Props {
  onAction?: (resultId: string, action: string) => void;
  className?: string;
}

export function ConciergeSearchResultsPanel({ onAction, className }: Props) {
  const { searchQuery, searchResults, setSearchQuery } = useConciergeStore();

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Search input */}
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/80 px-3 py-2 backdrop-blur-xl dark:border-white/5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search records, actions, entities..."
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      {/* Results */}
      <div className="space-y-2">
        {searchResults.map((r) => (
          <div key={r.id} className="rounded-xl border border-border/30 bg-background/70 p-3 backdrop-blur-lg dark:border-white/5 dark:bg-zinc-900/50">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">{r.type}</span>
              <h4 className="text-sm font-medium text-foreground">{r.title}</h4>
            </div>
            {r.subtitle && <p className="mb-2 text-xs text-muted-foreground">{r.subtitle}</p>}
            <div className="flex flex-wrap gap-1.5">
              {r.actions.map((a) => (
                <button
                  key={a}
                  onClick={() => onAction?.(r.id, a)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/40 bg-background px-2 py-1 text-[10px] font-medium text-foreground transition hover:bg-muted/60 dark:border-white/10"
                >
                  <ExternalLink className="h-2.5 w-2.5" /> {a}
                </button>
              ))}
            </div>
          </div>
        ))}
        {searchQuery && searchResults.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">No results for "{searchQuery}"</p>
        )}
      </div>
    </div>
  );
}
