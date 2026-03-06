import { parentNav } from '@/constants/navigation';
import type { ParentScope } from '@/store/parent-portal.store';

export interface ParentNavState {
  sectionId: string;
  headerId: string;
  subNavId: string;
}

export interface ParentRouteContext {
  scope: ParentScope;
  childId: string | null;
}

export const DEFAULT_PARENT_PATH = '/parent/home/overview';

export function resolveParentNavState(pathname: string): ParentNavState {
  const defaultSection = parentNav.sections[0];
  const defaultHeader = defaultSection.headerItems[0];
  let bestMatch: { sectionId: string; headerId: string; subNavId: string; len: number } | null = null;

  for (const section of parentNav.sections) {
    if (section.path && pathname.startsWith(section.path)) {
      const match = {
        sectionId: section.id,
        headerId: section.headerItems[0]?.id ?? '',
        subNavId: '',
        len: section.path.length,
      };
      if (!bestMatch || match.len > bestMatch.len) bestMatch = match;
    }

    for (const header of section.headerItems) {
      if (header.path && pathname.startsWith(header.path)) {
        const match = {
          sectionId: section.id,
          headerId: header.id,
          subNavId: '',
          len: header.path.length,
        };
        if (!bestMatch || match.len > bestMatch.len) bestMatch = match;
      }

      for (const subItem of header.subNav ?? []) {
        if (subItem.path && pathname.startsWith(subItem.path)) {
          const match = {
            sectionId: section.id,
            headerId: header.id,
            subNavId: subItem.id,
            len: subItem.path.length,
          };
          if (!bestMatch || match.len > bestMatch.len) bestMatch = match;
        }
      }
    }
  }

  return {
    sectionId: bestMatch?.sectionId ?? defaultSection.id,
    headerId: bestMatch?.headerId ?? defaultHeader?.id ?? '',
    subNavId: bestMatch?.subNavId ?? '',
  };
}

export function parseParentRouteContext(search: string | URLSearchParams): ParentRouteContext {
  const params = typeof search === 'string' ? new URLSearchParams(search) : search;
  const rawScope = params.get('scope');
  const scope: ParentScope = rawScope === 'child' ? 'child' : 'family';
  const childId = params.get('childId');

  return {
    scope,
    childId: childId && childId.length > 0 ? childId : null,
  };
}

export function buildParentRouteContextSearch(context: Partial<ParentRouteContext>): string {
  const params = new URLSearchParams();
  params.set('scope', context.scope === 'child' ? 'child' : 'family');

  if (context.childId) {
    params.set('childId', context.childId);
  }

  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}

export function withParentRouteContext(
  path: string,
  search: string | URLSearchParams,
  overrides: Partial<ParentRouteContext> = {},
): string {
  if (!path.startsWith('/parent')) return path;

  const current = parseParentRouteContext(search);
  const nextContext: ParentRouteContext = {
    scope: overrides.scope ?? current.scope,
    childId: overrides.childId === undefined ? current.childId : overrides.childId,
  };

  return `${path}${buildParentRouteContextSearch(nextContext)}`;
}
