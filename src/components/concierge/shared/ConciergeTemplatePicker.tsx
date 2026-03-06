/* ConciergeTemplatePicker — Template library grid picker */
import { FileText, Clock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TemplateItem {
  id: string;
  name: string;
  type: string;
  language?: string;
  lastUsed?: string;
  fieldCount?: number;
}

interface Props { templates: TemplateItem[]; onPick?: (id: string) => void; className?: string; }

export function ConciergeTemplatePicker({ templates, onPick, className }: Props) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-3', className)}>
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onPick?.(t.id)}
          className="flex flex-col items-start gap-2 rounded-xl border border-border/40 bg-background/80 p-3.5 text-left transition hover:shadow-md hover:border-primary/30 dark:border-white/5 dark:bg-zinc-900/60"
        >
          <FileText className="h-5 w-5 text-primary" />
          <h5 className="text-xs font-semibold text-foreground">{t.name}</h5>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>{t.type}</span>
            {t.language && <span>· {t.language}</span>}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            {t.lastUsed && <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{t.lastUsed}</span>}
            {t.fieldCount != null && <span className="inline-flex items-center gap-0.5"><Layers className="h-2.5 w-2.5" />{t.fieldCount} fields</span>}
          </div>
        </button>
      ))}
    </div>
  );
}
