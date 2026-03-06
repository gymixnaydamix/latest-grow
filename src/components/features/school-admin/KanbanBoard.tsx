/* ─── KanbanBoard ─── Drag-less Kanban for admissions pipeline ─── */
import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface KanbanCard {
  id: string;
  title: string;
  subtitle?: string;
  badges?: { label: string; color?: string }[];
  avatar?: string;
  meta?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

interface CardAction {
  label: string;
  onClick: (card: KanbanCard, columnId: string) => void;
}

interface Props {
  columns: KanbanColumn[];
  onCardClick?: (card: KanbanCard, columnId: string) => void;
  cardActions?: CardAction[];
  onAddCard?: (columnId: string) => void;
  renderCard?: (card: KanbanCard, columnId: string) => ReactNode;
}

const priorityColors = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

export function KanbanBoard({ columns, onCardClick, cardActions, onAddCard, renderCard }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[400px]">
      {columns.map((col) => (
        <div key={col.id} className="flex-shrink-0 w-72 flex flex-col rounded-xl border border-border bg-card backdrop-blur-xl">
          {/* Column Header */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full" style={{ backgroundColor: col.color }} />
              <span className="text-sm font-medium text-foreground/80">{col.title}</span>
              <Badge variant="outline" className="text-[10px] px-1.5 h-5 border-border text-muted-foreground/60">
                {col.cards.length}
              </Badge>
            </div>
            {onAddCard && (
              <Button variant="ghost" size="sm" className="size-6 p-0" onClick={() => onAddCard(col.id)}>
                <Plus className="size-3.5 text-muted-foreground/60" />
              </Button>
            )}
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
            {col.cards.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground/30">No items</div>
            ) : (
              col.cards.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group rounded-lg border border-border bg-muted p-3 hover:bg-accent hover:border-white/[0.12] transition-all cursor-pointer"
                  onClick={() => onCardClick?.(card, col.id)}
                >
                  {renderCard ? renderCard(card, col.id) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground/80 truncate">{card.title}</p>
                          {card.subtitle && <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">{card.subtitle}</p>}
                        </div>
                        {cardActions && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="size-5 p-0 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="size-3 text-muted-foreground/60" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-border">
                              {cardActions.map(a => (
                                <DropdownMenuItem key={a.label} onClick={(e) => { e.stopPropagation(); a.onClick(card, col.id); }}>
                                  {a.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      {(card.badges || card.priority) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {card.priority && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${priorityColors[card.priority]}`}>
                              {card.priority}
                            </span>
                          )}
                          {card.badges?.map(b => (
                            <Badge key={b.label} variant="outline" className={`text-[10px] px-1.5 h-5 ${b.color ?? 'border-border text-muted-foreground/60'}`}>
                              {b.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {card.meta && (
                        <p className="text-[10px] text-muted-foreground/40 mt-2">{card.meta}</p>
                      )}
                    </>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
