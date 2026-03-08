import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useChildStagger } from '@/hooks/use-animate';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { sidebarIconMap } from './SidebarIcons';
import { useParentPortalStore } from '@/store/parent-portal.store';
import { isParentPortalV2EnabledByDefault } from '@/config/parentPortalFlags';
import { withParentRouteContext } from '@/views/parent/parent-navigation';

import type { SidebarSection } from '@/constants/navigation';

const ROLE_BASE: Record<string, string> = {
  PROVIDER: '/provider/home',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
  FINANCE: '/finance',
  MARKETING: '/marketing',
  SCHOOL: '/school-leader',
};

interface RightSidebarProps {
  sections: SidebarSection[];
}

interface SidebarNavListProps {
  sections: SidebarSection[];
  compact: boolean;
  onSectionClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  SidebarNavList — renders all sections as compact nav items        */
/* ------------------------------------------------------------------ */
function SidebarNavList({ sections, compact, onSectionClick }: SidebarNavListProps) {
  const { activeSection, setSection } = useNavigationStore();
  const listRef = useChildStagger<HTMLDivElement>([], compact ? 'animate-slide-right' : 'animate-fade-right', 30);
  const navTo = useNavigate();
  const { pathname, search } = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  const basePath = ROLE_BASE[role ?? ''] ?? '/student';
  const isParentV2 = role === 'PARENT' && isParentPortalV2EnabledByDefault();

  return (
    <div
      ref={listRef}
      className={cn(
        'flex flex-1 min-h-0',
        compact ? 'flex-col justify-evenly py-1 items-center px-1.5 lg:items-stretch lg:px-2' : 'flex-col gap-0.5 p-2',
      )}
    >
      {sections.map((section) => {
        const CustomIcon = sidebarIconMap[section.id];
        const FallbackIcon = section.icon;
        const isActive = activeSection === section.id;

        const button = (
          <button
            onClick={() => {
              setSection(section.id);
              const targetPath = section.path ?? basePath;
              if (targetPath && pathname !== targetPath) {
                navTo(isParentV2 ? withParentRouteContext(targetPath, search) : targetPath);
              }
              onSectionClick?.();
            }}
            className={cn(
              'group relative flex w-full rounded-lg transition-all duration-200',
              compact
                ? 'flex-col items-center gap-0.5 px-1 py-1.5 lg:flex-row-reverse lg:items-center lg:gap-2 lg:px-2.5 lg:py-1.5'
                : 'items-center gap-2 px-3 py-2',
              isActive
                ? 'bg-[var(--sidebar-accent)] text-white'
                : 'text-[var(--text-soft)] hover:bg-white/5 hover:text-sidebar-foreground',
            )}
          >
            {/* Active indicator — thin left accent */}
            {isActive && compact && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full bg-sidebar-primary lg:left-0.5" />
            )}

            {CustomIcon ? (
              <CustomIcon
                className={cn(
                  'shrink-0 transition-all duration-200',
                  compact
                    ? isActive
                      ? 'size-4.5'
                      : 'size-4 opacity-60 group-hover:opacity-100'
                    : 'size-4.5',
                )}
              />
            ) : (
              <FallbackIcon
                className={cn(
                  'shrink-0 transition-all duration-200',
                  compact
                    ? isActive
                      ? 'size-4 text-sidebar-primary'
                      : 'size-3.5 text-[var(--text-soft)] group-hover:text-sidebar-foreground'
                    : 'size-4',
                )}
              />
            )}

            <span
              className={cn(
                'truncate font-semibold leading-none',
                compact
                  ? 'w-full text-center text-[7px] tracking-wide lg:text-[10px] lg:text-left lg:flex-1'
                  : 'text-xs',
                isActive ? 'text-white' : 'text-[var(--text-soft)] group-hover:text-sidebar-foreground',
              )}
            >
              {section.label}
            </span>
          </button>
        );

        if (!compact) return <div key={section.id}>{button}</div>;

        return (
          <Tooltip key={section.id} delayDuration={300}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="left" sideOffset={8} className="font-medium text-xs lg:hidden">
              {section.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RightSidebar — deep graphite/navy premium navigation rail         */
/* ------------------------------------------------------------------ */
export function RightSidebar({ sections }: RightSidebarProps) {
  const role = useAuthStore((s) => s.user?.role);
  const isParentV2 = role === 'PARENT' && isParentPortalV2EnabledByDefault();
  const isProvider = role === 'PROVIDER';

  const { mobileRightNavOpen, setMobileRightNavOpen } = useParentPortalStore();
  const [providerMobileOpen, setProviderMobileOpen] = useState(false);

  useEffect(() => {
    if (!isParentV2 || !mobileRightNavOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileRightNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isParentV2, mobileRightNavOpen, setMobileRightNavOpen]);

  useEffect(() => {
    if (!isProvider || !providerMobileOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setProviderMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isProvider, providerMobileOpen]);

  /* Shared sidebar surface classes — deep graphite/navy, minimal */
  const railClasses = cn(
    'fixed right-2 z-30 hidden lg:flex lg:flex-col lg:overflow-hidden lg:transition-all lg:duration-300',
    'rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[var(--shadow-md)]',
    'w-16 lg:w-36',
  );
  const railStyle = { top: 'calc(4rem + 1.25rem)', height: 'calc(100vh - 4rem - 1.75rem)' };

  /* Shared mobile drawer classes */
  const mobileDrawerClasses = cn(
    'flex w-72 flex-col rounded-xl border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground shadow-xl',
  );

  if (isParentV2) {
    return (
      <>
        <aside className={railClasses} style={railStyle} aria-label="Parent navigation">
          <SidebarNavList sections={sections} compact />
        </aside>

        <Button
          type="button"
          size="icon"
          className="fixed bottom-20 right-4 z-40 rounded-full bg-sidebar text-sidebar-foreground border border-sidebar-border hover:bg-sidebar/90 lg:hidden"
          onClick={() => setMobileRightNavOpen(true)}
          aria-label="Open parent navigation menu"
        >
          <Menu className="size-5" />
        </Button>

        {mobileRightNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileRightNavOpen(false)}
              aria-label="Close parent navigation menu"
            />
            <aside className={cn('absolute bottom-16 right-4 top-20', mobileDrawerClasses)} aria-label="Parent floating navigation">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-sm font-semibold text-sidebar-foreground">Parent Navigation</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileRightNavOpen(false)}
                  aria-label="Close floating parent navigation"
                  className="text-sidebar-foreground hover:bg-white/10"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <SidebarNavList
                sections={sections}
                compact={false}
                onSectionClick={() => setMobileRightNavOpen(false)}
              />
            </aside>
          </div>
        )}
      </>
    );
  }

  if (isProvider) {
    return (
      <>
        <aside className={railClasses} style={railStyle} aria-label="Provider navigation">
          <SidebarNavList sections={sections} compact />
        </aside>

        <Button
          type="button"
          size="icon"
          className="fixed bottom-20 right-4 z-40 rounded-full bg-sidebar text-sidebar-foreground border border-sidebar-border hover:bg-sidebar/90 lg:hidden"
          onClick={() => setProviderMobileOpen(true)}
          aria-label="Open provider navigation menu"
        >
          <Menu className="size-5" />
        </Button>

        {providerMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={() => setProviderMobileOpen(false)}
              aria-label="Close provider navigation menu"
            />
            <aside className={cn('absolute bottom-16 right-4 top-20', mobileDrawerClasses)} aria-label="Provider floating navigation">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-sm font-semibold text-sidebar-foreground">Provider Console</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setProviderMobileOpen(false)}
                  aria-label="Close provider floating navigation"
                  className="text-sidebar-foreground hover:bg-white/10"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <SidebarNavList
                sections={sections}
                compact={false}
                onSectionClick={() => setProviderMobileOpen(false)}
              />
            </aside>
          </div>
        )}
      </>
    );
  }

  /* Default (student/teacher/admin etc.) */
  return (
    <aside className={railClasses} style={railStyle}>
      <SidebarNavList sections={sections} compact />
    </aside>
  );
}
