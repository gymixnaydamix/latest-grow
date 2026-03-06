import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PanelLeft, X } from 'lucide-react';
import { useChildStagger } from '@/hooks/use-animate';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useParentPortalStore } from '@/store/parent-portal.store';
import { isParentPortalV2EnabledByDefault } from '@/config/parentPortalFlags';
import type { SubNavItem } from '@/constants/navigation';
import { ProviderSubNav } from './ProviderSubNav';
import { withParentRouteContext } from '@/views/parent/parent-navigation';

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

interface LeftSubNavProps {
  items: SubNavItem[];
  parentLabel: string;
}

interface SubNavContentProps {
  items: SubNavItem[];
  parentLabel: string;
  onItemClick?: () => void;
}

function SubNavContent({ items, parentLabel, onItemClick }: SubNavContentProps) {
  const { activeSubNav, setSubNav } = useNavigationStore();
  const navTo = useNavigate();
  const { pathname, search } = useLocation();
  const role = useAuthStore((s) => s.user?.role);
  const basePath = ROLE_BASE[role ?? ''] ?? '/student';
  const listRef = useChildStagger<HTMLDivElement>([items], 'animate-fade-right', 20);
  const isParentV2 = role === 'PARENT' && isParentPortalV2EnabledByDefault();

  useEffect(() => {
    if (items.length > 0 && !items.find((item) => item.id === activeSubNav)) {
      setSubNav(items[0].id);
    }
  }, [items, activeSubNav, setSubNav]);

  return (
    <aside
      className={cn(
        'relative flex shrink-0 flex-col rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-sm',
        'w-28',
      )}
      style={{ height: 'calc(100vh - 5.5rem)' }}
    >
      <div className="border-b border-border/60 px-2 py-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Subnav</p>
        <p className="mt-1 truncate text-[9px] uppercase tracking-[0.12em] text-foreground">{parentLabel}</p>
      </div>

      <ScrollArea className="flex-1">
        <div ref={listRef} className="space-y-1 p-2">
          {items.map((item) => {
            const isActive = activeSubNav === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSubNav(item.id);
                  const targetPath = item.path ?? basePath;
                  if (targetPath && pathname !== targetPath) {
                    navTo(isParentV2 ? withParentRouteContext(targetPath, search) : targetPath);
                  }
                  onItemClick?.();
                }}
                className={cn(
                  'w-full rounded-lg border px-2 py-2 text-center transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {Icon && <Icon className="mx-auto mb-1 size-3.5" />}
                <span className="block truncate text-[9px] font-semibold uppercase tracking-[0.12em]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}

export function LeftSubNav({ items, parentLabel }: LeftSubNavProps) {
  const role = useAuthStore((s) => s.user?.role);
  const isParentV2 = role === 'PARENT' && isParentPortalV2EnabledByDefault();
  const { mobileSubNavOpen, setMobileSubNavOpen } = useParentPortalStore();

  useEffect(() => {
    if (!items.length) return undefined;
    if (!isParentV2 || !mobileSubNavOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileSubNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isParentV2, items.length, mobileSubNavOpen, setMobileSubNavOpen]);

  if (!items.length) return null;

  if (role === 'PROVIDER') {
    return <ProviderSubNav items={items} parentLabel={parentLabel} />;
  }

  if (isParentV2) {
    return (
      <>
        <div className="hidden lg:block">
          <SubNavContent items={items} parentLabel={parentLabel} />
        </div>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="fixed bottom-20 left-4 z-40 lg:hidden"
          onClick={() => setMobileSubNavOpen(true)}
          aria-label="Open parent sub navigation"
        >
          <PanelLeft className="size-4" />
        </Button>

        {mobileSubNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileSubNavOpen(false)}
              aria-label="Close parent sub navigation"
            />
            <div className="absolute bottom-16 left-4 top-20 w-64">
              <div className="mb-2 flex items-center justify-between rounded-t-2xl border border-border/60 bg-background/95 px-3 py-2 backdrop-blur-xl">
                <p className="text-sm font-semibold">Section Navigation</p>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => setMobileSubNavOpen(false)}
                  aria-label="Close section navigation"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <SubNavContent
                items={items}
                parentLabel={parentLabel}
                onItemClick={() => setMobileSubNavOpen(false)}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return <SubNavContent items={items} parentLabel={parentLabel} />;
}
