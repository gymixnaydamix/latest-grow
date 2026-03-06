import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { OverlayAppId } from '@/overlay/overlay-registry';
import type { OverlayPlaceholderPaneProps } from './OverlayPlaceholderPane';

export type OverlayViewComponent = LazyExoticComponent<ComponentType<OverlayPlaceholderPaneProps>>;

const OverlayPlaceholderView: OverlayViewComponent = lazy(() => import('./OverlayPlaceholderPane'));

const overlayViewRegistry: Partial<Record<OverlayAppId, Partial<Record<string, OverlayViewComponent>>>> = {};

function key(primaryId: string, secondaryId: string): string {
  return `${primaryId}:${secondaryId}`;
}

export function resolveOverlayView(appId: OverlayAppId, primaryId: string, secondaryId: string): OverlayViewComponent {
  return overlayViewRegistry[appId]?.[key(primaryId, secondaryId)] ?? OverlayPlaceholderView;
}
