/* --- AppLayout --- Enterprise Control Center Main Shell --- */
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';

import { RightSidebar } from './RightSidebar';
import { HeaderNav } from './HeaderNav';
import { LeftSubNav } from './LeftSubNav';
import { FooterDock } from './FooterDock';
import { SearchCommand } from '@/components/features/SearchCommand';
import { WidgetPanel } from './WidgetPanel';
import { OverlayShell } from '@/components/overlay/OverlayShell';

import { useAuthStore } from '@/store/auth.store';
import { useNavigationStore } from '@/store/navigation.store';
import { getNavForRole } from '@/constants/navigation';
import { resolveProviderNavState } from '@/constants/provider-navigation';
import { useAnimationKey } from '@/hooks/use-animate';
import { isParentPortalV2EnabledByDefault } from '@/config/parentPortalFlags';
import { resolveParentNavState } from '@/views/parent/parent-navigation';

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const { activeSection, activeHeader, navigate: navigateNav } = useNavigationStore();
  const isParentPortalV2 = user?.role === 'PARENT' && isParentPortalV2EnabledByDefault();
  const isProviderConsole = user?.role === 'PROVIDER';
  const { pathname } = useLocation();

  const navConfig = useMemo(
    () => getNavForRole(user?.role ?? 'STUDENT'),
    [user?.role],
  );

  const currentSection = useMemo(
    () => navConfig.sections.find((s) => s.id === activeSection) ?? navConfig.sections[0],
    [navConfig, activeSection],
  );

  const currentHeaderItem = useMemo(
    () => currentSection?.headerItems.find((h) => h.id === activeHeader) ?? currentSection?.headerItems[0],
    [currentSection, activeHeader],
  );

  const subNavItems = currentHeaderItem?.subNav ?? [];
  const contentKey = useAnimationKey(activeSection, activeHeader);

  useEffect(() => {
    if (!isProviderConsole) return;
    const resolved = resolveProviderNavState(pathname);
    navigateNav(resolved.sectionId, resolved.headerId, resolved.subNavId);
  }, [isProviderConsole, pathname, navigateNav]);

  useEffect(() => {
    if (!isParentPortalV2) return;
    const resolved = resolveParentNavState(pathname);
    navigateNav(resolved.sectionId, resolved.headerId, resolved.subNavId);
  }, [isParentPortalV2, pathname, navigateNav]);

  const topOffset = '5rem';
  const bottomReserve = '3.5rem';

  return (
    <TooltipProvider delayDuration={200} disableHoverableContent>
      <div className="relative h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">

        {/* --- GLOBAL HEADER --- */}
        <div className="relative z-50">
          <HeaderNav headerItems={currentSection?.headerItems ?? []} />
        </div>

        {/* --- MAIN LAYOUT ROW --- */}
        <div
          className="relative z-10 flex w-full overflow-hidden"
          style={{ height: `calc(100vh - ${topOffset} - ${bottomReserve})` }}
        >
          <div
            className={`flex flex-1 flex-col transition-all duration-300 ease-out ${isParentPortalV2 || isProviderConsole ? 'mr-2 lg:mr-38' : 'mr-18 lg:mr-38'}`}
          >
            <div className="flex flex-1 min-h-0 px-3 pt-2 gap-3">

              {/* --- LEFT SUB-NAVIGATION --- */}
              {subNavItems.length > 0 && (
                <LeftSubNav
                  items={subNavItems}
                  parentLabel={currentHeaderItem?.label ?? ''}
                />
              )}

              {/* --- MAIN CONTENT CONTAINER --- */}
              <div className="relative flex-1 min-h-0 w-full rounded-xl overflow-hidden border border-border/60 bg-card/80 shadow-[var(--shadow-sm)]">
                <AnimatePresence mode="wait">
                  <motion.main
                    key={contentKey}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden p-4 scroll-smooth"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    <Outlet />
                  </motion.main>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDEBAR (Main Navigation Rail) --- */}
          <RightSidebar sections={navConfig.sections} />
        </div>

        {/* --- FOOTER DOCK --- */}
        <div className="relative z-50">
          <FooterDock />
        </div>

        {/* --- GLOBAL SEARCH COMMAND PALETTE --- */}
        <SearchCommand />

        {/* --- WIDGET PANEL --- */}
        <WidgetPanel />

        {/* --- OVERLAY APP SHELL --- */}
        <OverlayShell />

      </div>
    </TooltipProvider>
  );
}
