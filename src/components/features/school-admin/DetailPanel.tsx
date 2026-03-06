/* ══════════════════════════════════════════════════════════════════════
 * DetailPanel — slide-in side panel for viewing/editing entity details
 * Usage:
 *   <DetailPanel open={!!selected} onOpenChange={() => setSelected(null)}
 *     title={student.name} subtitle={student.grade}
 *     tabs={[{ id:'info', label:'Info', content:<InfoTab /> }, ...]}
 *     actions={[{ label:'Edit', onClick:() => openEdit(student) }]}
 *   />
 * ══════════════════════════════════════════════════════════════════════ */
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────── Types ─────────── */

export interface DetailTab {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: string | number;
}

export interface DetailAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost' | 'secondary';
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DetailField {
  label: string;
  value: React.ReactNode;
  /** Full-width (no grid) */
  full?: boolean;
}

export interface DetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  /** Status badge text */
  status?: string;
  statusVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  tabs?: DetailTab[];
  /** Simple content when no tabs */
  children?: React.ReactNode;
  actions?: DetailAction[];
  /** Panel width class — defaults to 'sm:max-w-md' */
  maxWidth?: string;
}

/* ─────────── Helper: Detail Fields Grid ─────────── */

export function DetailFields({ fields, className }: { fields: DetailField[]; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {fields.map((f, i) => (
        <div key={i} className={cn(f.full ? '' : 'grid grid-cols-[140px_1fr] gap-2 items-start')}>
          <span className="text-sm text-muted-foreground font-medium">{f.label}</span>
          <span className="text-sm text-foreground">{f.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────── Component ─────────── */

export function DetailPanel({
  open,
  onOpenChange,
  title,
  subtitle,
  status,
  statusVariant = 'default',
  tabs,
  children,
  actions,
  maxWidth = 'sm:max-w-md',
}: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState(tabs?.[0]?.id ?? '');

  // Reset tab when opening
  React.useEffect(() => {
    if (open && tabs?.length) setActiveTab(tabs[0].id);
  }, [open, tabs]);

  const currentTab = tabs?.find((t) => t.id === activeTab);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(maxWidth, 'w-full flex flex-col p-0')}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 pt-6 pb-3">
          <div className="space-y-1 flex-1 min-w-0">
            <SheetHeader className="p-0 space-y-0">
              <SheetTitle className="text-lg font-semibold truncate">{title}</SheetTitle>
              {subtitle && <SheetDescription className="text-sm text-muted-foreground truncate">{subtitle}</SheetDescription>}
            </SheetHeader>
            {status && (
              <Badge variant={statusVariant} className="mt-1">{status}</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-2 shrink-0 h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* ── Actions bar ── */}
        {actions && actions.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-6 pb-3">
              {actions.map((a, i) => (
                <Button
                  key={i}
                  variant={a.variant ?? 'outline'}
                  size="sm"
                  onClick={a.onClick}
                  disabled={a.disabled}
                  className="h-8"
                >
                  {a.icon && <span className="mr-1.5">{a.icon}</span>}
                  {a.label}
                </Button>
              ))}
            </div>
          </>
        )}

        <Separator />

        {/* ── Tab bar ── */}
        {tabs && tabs.length > 1 && (
          <div className="flex items-center gap-1 px-6 pt-3 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                )}
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        <ScrollArea className="flex-1 px-6 py-4">
          {tabs ? currentTab?.content : children}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
