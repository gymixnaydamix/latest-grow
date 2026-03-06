/* ─── SectionRenderer ─── Maps nav state → sub-view component ────── */
import type { ReactNode } from 'react';
import { useNavigationStore } from '@/store/navigation.store';

/** Registry entry: section → header → subNav → component */
export type ViewMap = Record<string, Record<string, ReactNode | Record<string, ReactNode>>>;

interface Props {
  views: ViewMap;
  fallback: ReactNode;
}

/**
 * Resolves `activeSection / activeHeader / activeSubNav` from the
 * navigation store through a nested lookup map and renders the
 * matching component.  Falls back to `props.fallback` when no
 * match exists.
 */
export function SectionRenderer({ views, fallback }: Props) {
  const { activeSection, activeHeader, activeSubNav } = useNavigationStore();

  const sectionMap = views[activeSection];
  if (!sectionMap) return <>{fallback}</>;

  const headerEntry = sectionMap[activeHeader] ?? sectionMap[Object.keys(sectionMap)[0]];
  if (!headerEntry) return <>{fallback}</>;

  // If the entry is a record (sub-nav map) try to resolve the sub-nav
  if (typeof headerEntry === 'object' && headerEntry !== null && !('$$typeof' in headerEntry)) {
    const subMap = headerEntry as Record<string, ReactNode>;
    const resolved = subMap[activeSubNav] ?? subMap[Object.keys(subMap)[0]];
    return <>{resolved ?? fallback}</>;
  }

  return <>{headerEntry}</>;
}
