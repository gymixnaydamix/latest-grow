/* â”€â”€â”€ AppLayout â”€â”€â”€ 2049 Spatial OS Main Shell â”€â”€â”€ */
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

// Procedural SVG Noise for physical tactile texture
const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const { activeSection, activeHeader, navigate: navigateNav } = useNavigationStore();
  const isParentPortalV2 = user?.role === 'PARENT' && isParentPortalV2EnabledByDefault();
  const isProviderConsole = user?.role === 'PROVIDER';
  const { pathname } = useLocation();

  // Get nav config for current user role
  const navConfig = useMemo(
    () => getNavForRole(user?.role ?? 'STUDENT'),
    [user?.role],
  );

  // Current section object
  const currentSection = useMemo(
    () => navConfig.sections.find((s) => s.id === activeSection) ?? navConfig.sections[0],
    [navConfig, activeSection],
  );

  // Current header item object
  const currentHeaderItem = useMemo(
    () => currentSection?.headerItems.find((h) => h.id === activeHeader) ?? currentSection?.headerItems[0],
    [currentSection, activeHeader],
  );

  // Sub-nav items from the active header item
  const subNavItems = currentHeaderItem?.subNav ?? [];

  // Key to trigger framer-motion content transitions
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

  /*
   * Layout math (no page scroll):
   *   Header: h-16 (4rem) + top-2 (0.5rem) margin = 4.5rem consumed
   *   Footer dock trigger: ~3rem reserved at bottom
   *   Body fills the remaining space exactly
   */
  const topOffset = '5rem';   /* header height + top margin + breathing room */
  const bottomReserve = '3.5rem'; /* footer dock space */

  return (
    <TooltipProvider delayDuration={200} disableHoverableContent>
      <div className="relative h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
        
        {/* â”€â”€â”€ AMBIENT OS BACKGROUND ENGINE â”€â”€â”€ */}
        <div className="pointer-events-none fixed inset-0 z-0">
          {/* Base Noise Texture */}
          <div 
            className="absolute inset-0 mix-blend-overlay opacity-40 dark:opacity-100" 
            style={{ backgroundImage: NOISE_TEXTURE }} 
          />
          {/* Animated Ambient Mesh Gradients */}
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-[20%] -left-[10%] h-200 w-200 rounded-full bg-primary/10 blur-[120px]" 
          />
          <motion.div 
            animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
            transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-[20%] -right-[10%] h-200 w-200 rounded-full bg-violet-500/10 blur-[120px]" 
          />
        </div>

        {/* â”€â”€â”€ GLOBAL HEADER â”€â”€â”€ */}
        <div className="relative z-50">
          <HeaderNav headerItems={currentSection?.headerItems ?? []} />
        </div>

        {/* â”€â”€â”€ MAIN LAYOUT ROW â”€â”€â”€ */}
        <div
          className="relative z-10 flex w-full overflow-hidden"
          style={{ height: `calc(100vh - ${topOffset} - ${bottomReserve})` }}
        >
          {/* Main Content Area (Responsive margin for RightSidebar: w-16 mobile, w-36 desktop) */}
          <div
            className={`flex flex-1 flex-col transition-all duration-500 ease-out ${isParentPortalV2 || isProviderConsole ? 'mr-2 lg:mr-38' : 'mr-18 lg:mr-38'}`}
          >
            <div className="flex flex-1 min-h-0 px-4 pt-2 gap-4">
              
              {/* â”€â”€â”€ LEFT SUB-NAVIGATION (HUD Style) â”€â”€â”€ */}
              {subNavItems.length > 0 && (
                <LeftSubNav
                  items={subNavItems}
                  parentLabel={currentHeaderItem?.label ?? ''}
                />
              )}

              {/* â”€â”€â”€ MAIN SPATIAL CONTENT CONTAINER â”€â”€â”€ */}
              <div className="relative flex-1 min-h-0 w-full rounded-[24px] overflow-hidden">
                
                {/* Glass Container Base */}
                <div className="absolute inset-0 bg-background/40 backdrop-blur-3xl border border-border/40 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(255,255,255,0.02)] rounded-[24px] pointer-events-none" />
                
                {/* Subtle HUD Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[32px_32px] pointer-events-none mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,black_40%,transparent_100%)]" />

                {/* Cinematic Route Transitions (`AnimatePresence`) */}
                <AnimatePresence mode="wait">
                  <motion.main
                    key={contentKey}
                    initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)', y: 10 }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)', y: -10 }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.16, 1, 0.3, 1] // Custom snappy ease curve (Apple-style)
                    }}
                    className="relative z-10 h-full w-full overflow-y-auto overflow-x-hidden p-4 scroll-smooth"
                    style={{ scrollbarWidth: 'thin' }} // Modern sleek scrollbar
                  >
                    <Outlet />
                  </motion.main>
                </AnimatePresence>

              </div>
            </div>
          </div>

          {/* â”€â”€â”€ RIGHT SIDEBAR (Fixed System Tools) â”€â”€â”€ */}
          <RightSidebar sections={navConfig.sections} />
        </div>

        {/* â”€â”€â”€ FOOTER DOCK (Bottom Launcher) â”€â”€â”€ */}
        <div className="relative z-50">
          <FooterDock />
        </div>

        {/* â”€â”€â”€ GLOBAL SEARCH COMMAND PALETTE (Cmd+K) â”€â”€â”€ */}
        <SearchCommand />

        {/* â”€â”€â”€ WIDGET PANEL (collapsible from right edge) â”€â”€â”€ */}
        <WidgetPanel />

        {/* â”€â”€â”€ OVERLAY APP SHELL (feature-flagged in store) â”€â”€â”€ */}
        <OverlayShell />
        
      </div>
    </TooltipProvider>
  );
}




