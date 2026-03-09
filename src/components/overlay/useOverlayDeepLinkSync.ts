import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getGamificationPageByIds, getGamificationPageByRoute } from '@/config/gamification-overlay-content';
import { canAccessOverlayApp } from '@/overlay/overlay-access';
import { useOverlayStore } from '@/store/overlay.store';
import type { UserRole } from '@root/types';

export function useOverlayDeepLinkSync(role: UserRole | undefined | null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const overlayV2Enabled = useOverlayStore((s) => s.overlayV2Enabled);
  const activeAppId = useOverlayStore((s) => s.activeAppId);
  const activePrimaryByApp = useOverlayStore((s) => s.activePrimaryByApp);
  const activeSecondaryByApp = useOverlayStore((s) => s.activeSecondaryByApp);
  const launchApp = useOverlayStore((s) => s.launchApp);
  const setPrimaryNav = useOverlayStore((s) => s.setPrimaryNav);
  const setSecondaryNav = useOverlayStore((s) => s.setSecondaryNav);

  useEffect(() => {
    if (!overlayV2Enabled) return;
    const overlayApp = searchParams.get('overlayApp');
    const overlayPath = searchParams.get('overlayPath');

    if (overlayApp !== 'gamification') return;

    const nextParams = new URLSearchParams(searchParams);
    if (!canAccessOverlayApp('gamification', role)) {
      nextParams.delete('overlayApp');
      nextParams.delete('overlayPath');
      setSearchParams(nextParams, { replace: true });
      return;
    }

    const matched = overlayPath ? getGamificationPageByRoute(overlayPath) : null;
    if (!matched) {
      nextParams.delete('overlayApp');
      nextParams.delete('overlayPath');
      setSearchParams(nextParams, { replace: true });
      return;
    }

    if (activeAppId !== 'gamification') {
      launchApp('gamification');
    }
    if (activePrimaryByApp.gamification !== matched.primaryId) {
      setPrimaryNav('gamification', matched.primaryId);
    }
    if (activeSecondaryByApp.gamification !== matched.page.id) {
      setSecondaryNav('gamification', matched.page.id);
    }
  }, [
    activePrimaryByApp.gamification,
    activeSecondaryByApp.gamification,
    activeAppId,
    launchApp,
    overlayV2Enabled,
    role,
    searchParams,
    setPrimaryNav,
    setSearchParams,
    setSecondaryNav,
  ]);

  useEffect(() => {
    if (!overlayV2Enabled) return;
    if (!canAccessOverlayApp('gamification', role)) return;

    const currentOverlayApp = searchParams.get('overlayApp');
    const currentOverlayPath = searchParams.get('overlayPath');
    const nextParams = new URLSearchParams(searchParams);

    if (activeAppId === 'gamification') {
      const resolved = getGamificationPageByIds(activePrimaryByApp.gamification, activeSecondaryByApp.gamification);
      if (!resolved) return;
      if (currentOverlayApp === 'gamification' && currentOverlayPath === resolved.page.route) return;
      nextParams.set('overlayApp', 'gamification');
      nextParams.set('overlayPath', resolved.page.route);
      setSearchParams(nextParams, { replace: true });
      return;
    }

    if (currentOverlayApp === 'gamification') {
      nextParams.delete('overlayApp');
      nextParams.delete('overlayPath');
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    activeAppId,
    activePrimaryByApp.gamification,
    activeSecondaryByApp.gamification,
    overlayV2Enabled,
    role,
    searchParams,
    setSearchParams,
  ]);
}
