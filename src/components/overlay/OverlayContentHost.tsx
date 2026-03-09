import { Suspense, useMemo } from 'react';
import type { OverlayAppId } from '@/overlay/overlay-registry';
import { resolveOverlayView } from './overlayViews';

interface OverlayContentHostProps {
  appId: OverlayAppId;
  appLabel: string;
  primaryId: string;
  primaryLabel: string;
  secondaryId: string;
  secondaryLabel: string;
}

export function OverlayContentHost({
  appId,
  appLabel,
  primaryId,
  primaryLabel,
  secondaryId,
  secondaryLabel,
}: OverlayContentHostProps) {
  const View = useMemo(() => resolveOverlayView(appId, primaryId, secondaryId), [appId, primaryId, secondaryId]);

  return (
    <Suspense
      fallback={
        <div className="h-full w-full p-6">
          <div className="h-full w-full rounded-xl border border-border bg-card/80 animate-pulse" />
        </div>
      }
    >
      <View
        appId={appId}
        appLabel={appLabel}
        primaryId={primaryId}
        primaryLabel={primaryLabel}
        secondaryId={secondaryId}
        secondaryLabel={secondaryLabel}
      />
    </Suspense>
  );
}
