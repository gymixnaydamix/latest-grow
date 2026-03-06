/* ─── FooterDock ─── Bottom launcher with expandable app tray ──────── */
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Clapperboard,
  Gamepad2,
  Palmtree,
  ShoppingBag,
  Heart,
  Puzzle,
  BookOpen,
  Dumbbell,
  Church,
  Wrench,
  Plane,
  CalendarCheck,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { overlayAppList } from '@/overlay/overlay-registry';
import type { OverlayAppDefinition, OverlayAppId } from '@/overlay/overlay-registry';
import { useOverlayStore } from '@/store/overlay.store';

interface LegacyDockApp {
  icon: React.ElementType;
  label: string;
  color: string;
}

const legacyLeftApps: LegacyDockApp[] = [
  { icon: Clapperboard, label: 'Studio', color: 'from-rose-500 to-pink-600' },
  { icon: Clapperboard, label: 'Media', color: 'from-red-500 to-rose-600' },
  { icon: Gamepad2, label: 'Gamification', color: 'from-green-500 to-emerald-600' },
  { icon: Palmtree, label: 'Leisure', color: 'from-amber-500 to-orange-600' },
  { icon: ShoppingBag, label: 'Market', color: 'from-violet-500 to-purple-600' },
  { icon: Heart, label: 'Lifestyle', color: 'from-pink-500 to-fuchsia-600' },
  { icon: Puzzle, label: 'Hobbies', color: 'from-cyan-500 to-blue-600' },
];

const legacyRightApps: LegacyDockApp[] = [
  { icon: BookOpen, label: 'Knowledge', color: 'from-blue-500 to-indigo-600' },
  { icon: Dumbbell, label: 'Sports', color: 'from-emerald-500 to-teal-600' },
  { icon: Church, label: 'Religion', color: 'from-yellow-500 to-amber-600' },
  { icon: Wrench, label: 'Services', color: 'from-slate-500 to-zinc-700' },
  { icon: Plane, label: 'Travel & Booking', color: 'from-sky-400 to-blue-500' },
  { icon: CalendarCheck, label: 'Event', color: 'from-indigo-500 to-violet-600' },
];

function LegacyAppButton({ app, delay }: { app: LegacyDockApp; delay: number }) {
  return (
    <button
      className="group flex flex-col items-center gap-0.5 transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: '350ms' }}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br shadow-md transition-all duration-200',
          'group-hover:shadow-xl group-hover:-translate-y-1',
          app.color,
        )}
      >
        <app.icon className="size-4 text-white drop-shadow-sm" />
      </div>
      <span className="max-w-12 truncate text-[9px] font-semibold leading-tight text-muted-foreground/80 transition-colors group-hover:text-foreground">
        {app.label}
      </span>
    </button>
  );
}

function LegacyFooterDock() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
        <div
          className={cn(
            'flex items-center rounded-2xl border transition-all duration-300',
            open
              ? 'gap-1.5 border-white/60 bg-white/85 px-4 py-2.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10'
              : 'gap-0 border-transparent bg-transparent px-0 py-0 shadow-none',
          )}
        >
          {open && (
            <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
              {legacyLeftApps.map((app, i) => (
                <LegacyAppButton key={app.label} app={app} delay={i * 35} />
              ))}
            </div>
          )}

          {open && <div className="mx-1.5 h-10 w-px shrink-0 bg-border/40" />}

          <button
            onClick={() => setOpen(!open)}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
              'shadow-lg hover:scale-105 hover:shadow-xl',
              open
                ? 'h-10 w-10 rotate-180 border-rose-400/60 bg-rose-500/90 text-white'
                : 'h-11 w-11 border-purple-400/60 bg-linear-to-br from-purple-500 to-indigo-600 text-white',
            )}
            aria-label="Toggle legacy app launcher"
          >
            {open ? <X className="size-4" /> : <LayoutGrid className="size-5" />}
          </button>

          {open && <div className="mx-1.5 h-10 w-px shrink-0 bg-border/40" />}

          {open && (
            <div className="flex items-center gap-2.5 animate-in fade-in duration-300">
              {legacyRightApps.map((app, i) => (
                <LegacyAppButton key={app.label} app={app} delay={(i + 7) * 35} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function OverlayAppButton({
  app,
  delay,
  onLaunch,
}: {
  app: OverlayAppDefinition;
  delay: number;
  onLaunch: (id: OverlayAppId) => void;
}) {
  return (
    <button
      onClick={() => onLaunch(app.id)}
      aria-label={`Launch ${app.label}`}
      className="group flex flex-col items-center gap-0.5 transition-all duration-300 hover:scale-110 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: '350ms' }}
    >
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br shadow-md transition-all duration-200',
          'group-hover:-translate-y-1 group-hover:shadow-xl',
          app.color,
        )}
      >
        <app.icon className="size-4 text-white drop-shadow-sm" />
      </div>
      <span className="max-w-14 truncate text-[9px] font-semibold leading-tight text-muted-foreground/85 transition-colors group-hover:text-foreground">
        {app.label}
      </span>
    </button>
  );
}

function OverlayV2FooterDock() {
  const launcherOpen = useOverlayStore((s) => s.launcherOpen);
  const activeAppId = useOverlayStore((s) => s.activeAppId);
  const minimizedApps = useOverlayStore((s) => s.minimizedApps);
  const enabledApps = useOverlayStore((s) => s.enabledApps);
  const toggleLauncher = useOverlayStore((s) => s.toggleLauncher);
  const launchApp = useOverlayStore((s) => s.launchApp);
  const restoreApp = useOverlayStore((s) => s.restoreApp);

  const enabledOverlayApps = useMemo(
    () => overlayAppList.filter((app) => enabledApps[app.id]),
    [enabledApps],
  );

  const splitPoint = Math.floor(enabledOverlayApps.length / 2);
  const leftApps = enabledOverlayApps.slice(0, splitPoint);
  const rightApps = enabledOverlayApps.slice(splitPoint);

  const minimizedEnabledApps = minimizedApps
    .map((id) => overlayAppList.find((app) => app.id === id))
    .filter((app): app is OverlayAppDefinition => Boolean(app && enabledApps[app.id]));

  useEffect(() => {
    if (!launcherOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') toggleLauncher(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [launcherOpen, toggleLauncher]);

  return (
    <>
      {launcherOpen && <div className="fixed inset-0 z-40" onClick={() => toggleLauncher(false)} />}

      <div className="fixed bottom-3 left-1/2 z-50 -translate-x-1/2">
        <div className="mb-2 flex max-w-[calc(100vw-1rem)] justify-center gap-1 overflow-x-auto px-1">
          {minimizedEnabledApps.map((app) => (
            <button
              key={app.id}
              onClick={() => restoreApp(app.id)}
              aria-label={`Restore ${app.label}`}
              className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card/90 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-md transition-colors hover:bg-accent hover:text-foreground"
            >
              <app.icon className="size-3.5" />
              <span className="max-w-20 truncate">{app.label}</span>
            </button>
          ))}
        </div>

        <div
          className={cn(
            'flex max-w-[calc(100vw-1rem)] items-center overflow-x-auto rounded-2xl border transition-all duration-300',
            launcherOpen
              ? 'gap-1.5 border-white/60 bg-white/85 px-3 py-2.5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10'
              : 'gap-0 border-transparent bg-transparent px-0 py-0 shadow-none',
          )}
        >
          {launcherOpen && (
            <div className="flex shrink-0 items-center gap-2.5 animate-in fade-in duration-300">
              {leftApps.map((app, i) => (
                <OverlayAppButton key={app.id} app={app} delay={i * 35} onLaunch={launchApp} />
              ))}
            </div>
          )}

          {launcherOpen && <div className="mx-1.5 h-10 w-px shrink-0 bg-border/40" />}

          <button
            onClick={() => toggleLauncher()}
            className={cn(
              'flex shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300',
              'shadow-lg hover:scale-105 hover:shadow-xl',
              launcherOpen
                ? 'h-10 w-10 border-rose-400/60 bg-rose-500/90 text-white'
                : 'h-11 w-11 border-purple-400/60 bg-linear-to-br from-purple-500 to-indigo-600 text-white',
            )}
            aria-label={launcherOpen ? 'Close app launcher' : 'Open app launcher'}
          >
            {launcherOpen ? <Minus className="size-4" /> : <Plus className="size-5" />}
          </button>

          {launcherOpen && <div className="mx-1.5 h-10 w-px shrink-0 bg-border/40" />}

          {launcherOpen && (
            <div className="flex shrink-0 items-center gap-2.5 animate-in fade-in duration-300">
              {rightApps.map((app, i) => (
                <OverlayAppButton key={app.id} app={app} delay={(i + leftApps.length) * 35} onLaunch={launchApp} />
              ))}
            </div>
          )}
        </div>

        {activeAppId && (
          <p className="mt-1 text-center text-[10px] text-muted-foreground/70">
            Active: {overlayAppList.find((app) => app.id === activeAppId)?.label}
          </p>
        )}
      </div>
    </>
  );
}

export function FooterDock() {
  const overlayV2Enabled = useOverlayStore((s) => s.overlayV2Enabled);
  if (!overlayV2Enabled) return <LegacyFooterDock />;
  return <OverlayV2FooterDock />;
}
