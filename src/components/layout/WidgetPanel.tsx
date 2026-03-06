/* ─── WidgetPanel ─── Collapsible side panel with mini widgets ────── */
import { useState } from 'react';
import { PanelRightClose, PanelRightOpen, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { ClockWidget } from '@/components/widgets/ClockWidget';
import { QuickNoteWidget } from '@/components/widgets/QuickNoteWidget';
import { CountdownWidget } from '@/components/widgets/CountdownWidget';
import { CalendarMiniWidget } from '@/components/widgets/CalendarMiniWidget';
import { SystemStatusWidget } from '@/components/widgets/SystemStatusWidget';

const SCHOOL_EVENTS = [
  { date: '2026-03-10', label: 'Parent-Teacher Conf', color: '#818cf8' },
  { date: '2026-03-15', label: 'Spring Break Starts', color: '#34d399' },
  { date: '2026-03-20', label: 'Science Fair', color: '#fbbf24' },
  { date: '2026-04-01', label: 'Registration Opens', color: '#f472b6' },
];

export function WidgetPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* Toggle button — rendered at bottom-right of sidebar area */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'fixed z-40 size-8 rounded-lg border border-white/8 bg-white/5 backdrop-blur-xl text-white/50 hover:text-white hover:bg-white/10',
          'bottom-16 right-4 lg:right-40',
        )}
      >
        {expanded ? <PanelRightClose className="size-4" /> : <PanelRightOpen className="size-4" />}
      </Button>

      {/* Panel overlay */}
      <div
        className={cn(
          'fixed z-40 top-20 right-0 h-[calc(100vh-8rem)] w-80 transition-transform duration-300 ease-out',
          'border-l border-white/8 bg-background/90 backdrop-blur-2xl shadow-2xl shadow-black/30',
          'overflow-y-auto overflow-x-hidden',
          expanded ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/6 bg-background/80 backdrop-blur-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <GripVertical className="size-4 text-white/20" />
            <span className="text-sm font-semibold text-white/80">Widgets</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-white/40 hover:text-white"
            onClick={() => setExpanded(false)}
          >
            <PanelRightClose className="size-3.5" />
          </Button>
        </div>

        {/* Widget stack */}
        <div className="flex flex-col gap-3 p-3">
          {/* Clock */}
          <ClockWidget variant="digital" showDate />

          {/* Calendar */}
          <CalendarMiniWidget events={SCHOOL_EVENTS} />

          {/* Countdown to next event */}
          <CountdownWidget
            targetDate="2026-03-15T00:00:00"
            label="Spring Break"
          />

          {/* Quick Notes */}
          <QuickNoteWidget storageKey="sidebar" />

          {/* System Status */}
          <SystemStatusWidget />
        </div>
      </div>
    </>
  );
}
