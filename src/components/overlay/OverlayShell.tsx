import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  overlayAppsById,
  getOverlayDefaultPrimaryId,
  getOverlayDefaultSecondaryId,
  getOverlayPrimaryNav,
} from '@/overlay/overlay-registry';
import { useOverlayStore } from '@/store/overlay.store';
import { OverlayContentHost } from './OverlayContentHost';

export function OverlayShell() {
  const overlayV2Enabled = useOverlayStore((s) => s.overlayV2Enabled);
  const activeAppId = useOverlayStore((s) => s.activeAppId);
  const activePrimaryByApp = useOverlayStore((s) => s.activePrimaryByApp);
  const activeSecondaryByApp = useOverlayStore((s) => s.activeSecondaryByApp);
  const setPrimaryNav = useOverlayStore((s) => s.setPrimaryNav);
  const setSecondaryNav = useOverlayStore((s) => s.setSecondaryNav);
  const minimizeApp = useOverlayStore((s) => s.minimizeApp);
  const closeApp = useOverlayStore((s) => s.closeApp);

  const [subNavCollapsed, setSubNavCollapsed] = useState(false);
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  );

  const activeApp = useMemo(() => (activeAppId ? overlayAppsById[activeAppId] : null), [activeAppId]);

  const primaryId = activeAppId
    ? activePrimaryByApp[activeAppId] || getOverlayDefaultPrimaryId(activeAppId)
    : '';

  const primaryItem = activeAppId ? getOverlayPrimaryNav(activeAppId, primaryId) : undefined;
  const secondaryItems = primaryItem?.secondaryNav ?? [];

  const secondaryId = activeAppId
    ? activeSecondaryByApp[activeAppId] || getOverlayDefaultSecondaryId(activeAppId, primaryId)
    : '';

  const secondaryLabel = secondaryItems.find((item) => item.id === secondaryId)?.label ?? 'Overview';

  useEffect(() => {
    if (!activeAppId) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeApp(activeAppId);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeAppId, closeApp]);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (isCompact) setSubNavCollapsed(true);
  }, [isCompact]);

  useEffect(() => {
    if (activeAppId) setSubNavCollapsed(isCompact);
  }, [activeAppId, isCompact]);

  if (!overlayV2Enabled) return null;

  return (
    <AnimatePresence>
      {activeApp && activeAppId && (
        <motion.div
          key={activeAppId}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[70] overflow-hidden bg-background/92 backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,transparent_45%,rgba(15,23,42,0.08)_100%)]" />
            <div className="absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative flex h-full w-full flex-col">
            <header className="relative flex h-14 shrink-0 items-center gap-3 overflow-hidden border-b border-border/60 bg-white/90 px-3 backdrop-blur-xl lg:px-4">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(59,130,246,0.08)_0%,transparent_35%,rgba(99,102,241,0.08)_100%)]" />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="relative z-10 flex min-w-0 items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br shadow-[0_8px_20px_-12px_rgba(15,23,42,0.6)]',
                    activeApp.color,
                  )}
                >
                  <activeApp.icon className="size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />
                </div>
                <p className="truncate text-sm font-semibold text-foreground">{activeApp.label}</p>
              </div>

              <div className="relative z-10 min-w-0 flex-1 overflow-x-auto">
                <div className="flex min-w-max items-center gap-1">
                  {activeApp.primaryNav.map((primary) => (
                    <Button
                      key={primary.id}
                      size="sm"
                      variant={primaryId === primary.id ? 'default' : 'ghost'}
                      className="h-8 text-xs"
                      onClick={() => setPrimaryNav(activeApp.id, primary.id)}
                    >
                      {primary.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex shrink-0 items-center gap-1">
                {secondaryItems.length > 0 && !isCompact && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => setSubNavCollapsed((prev) => !prev)}
                    aria-label={subNavCollapsed ? 'Expand sub-navigation' : 'Collapse sub-navigation'}
                  >
                    {subNavCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                  </Button>
                )}
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => minimizeApp(activeApp.id)}
                  aria-label="Minimize overlay app"
                >
                  <Minus className="size-4" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => closeApp(activeApp.id)}
                  aria-label="Close overlay app"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </header>

            <div className="flex min-h-0 flex-1">
              {secondaryItems.length > 0 && !isCompact && (
                <aside
                  className={cn(
                    'relative overflow-hidden border-r border-border/60 bg-white/85 backdrop-blur-xl shadow-[inset_-1px_0_0_rgba(255,255,255,0.55)] transition-[width] duration-200',
                    subNavCollapsed ? 'w-0 overflow-hidden' : 'w-52',
                  )}
                >
                  {!subNavCollapsed && (
                    <div className="relative h-full overflow-y-auto p-2">
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(148,163,184,0.12)_0%,transparent_45%)]" />
                        <div className="absolute inset-x-2 top-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                      </div>

                      <div className="relative space-y-1">
                      {secondaryItems.map((secondary) => (
                        <button
                          key={secondary.id}
                          className={cn(
                            'flex w-full items-center rounded-lg border px-2.5 py-2 text-left text-xs font-medium transition-all duration-200',
                            secondary.id === secondaryId
                              ? 'border-primary/35 bg-primary/12 text-primary shadow-[0_8px_20px_-14px_rgba(37,99,235,0.75)]'
                              : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/60 hover:text-foreground',
                          )}
                          onClick={() => setSecondaryNav(activeApp.id, secondary.id)}
                        >
                          {secondary.label}
                        </button>
                      ))}
                      </div>
                    </div>
                  )}
                </aside>
              )}

              <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {isCompact && secondaryItems.length > 0 && (
                  <div className="border-b border-border/60 bg-white/85 p-2 backdrop-blur-xl">
                    <div className="flex items-center gap-1 overflow-x-auto">
                      {secondaryItems.map((secondary) => (
                        <Button
                          key={secondary.id}
                          size="sm"
                          variant={secondary.id === secondaryId ? 'default' : 'outline'}
                          className="h-7 shrink-0 text-xs"
                          onClick={() => setSecondaryNav(activeApp.id, secondary.id)}
                        >
                          {secondary.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="min-h-0 flex-1 overflow-hidden">
                  <OverlayContentHost
                    appId={activeApp.id}
                    appLabel={activeApp.label}
                    primaryId={primaryId}
                    primaryLabel={primaryItem?.label ?? activeApp.primaryNav[0]?.label ?? 'Overview'}
                    secondaryId={secondaryId || 'overview'}
                    secondaryLabel={secondaryLabel}
                  />
                </div>
              </main>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
