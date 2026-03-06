import { useState, useEffect, useCallback, useMemo, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Clock3,
  Command,
  Hash,
  Pin,
  Star,
} from 'lucide-react';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useParentPortalStore } from '@/store/parent-portal.store';
import { getNavForRole } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { api } from '@/api/client';
import {
  useParentV2PinnedItems,
  useParentV2RecentItems,
  useParentV2Search,
  useUpsertParentV2WorkspaceItem,
} from '@/hooks/api/use-parent-v2';
import type { ApiSuccessResponse } from '@root/types';
import {
  DEFAULT_PARENT_PATH,
  resolveParentNavState,
  withParentRouteContext,
} from '@/views/parent/parent-navigation';

interface SearchResult {
  id: string;
  label: string;
  category: string;
  section?: string;
  header?: string;
  path?: string;
  pinned?: boolean;
  recent?: boolean;
  tenantId?: string;
}

interface ProviderTenantSearchResult {
  id: string;
  externalId: string;
  name: string;
  domain: string;
  adminEmail: string;
}

const ROLE_BASE: Record<string, string> = {
  PROVIDER: '/provider/home',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: DEFAULT_PARENT_PATH,
  FINANCE: '/finance',
  MARKETING: '/marketing',
  SCHOOL: '/school-leader',
};

function dedupeResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [providerEntityResults, setProviderEntityResults] = useState<SearchResult[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { setSection, setHeader, navigate: navigateNavState } = useNavigationStore();
  const role = useAuthStore((state) => state.user?.role ?? 'STUDENT');
  const navConfig = useMemo(() => getNavForRole(role), [role]);
  const navTo = useNavigate();
  const location = useLocation();
  const { selectedScope, selectedChildId } = useParentPortalStore();
  const isParent = role === 'PARENT';

  const parentSearchQuery = useParentV2Search(
    query,
    selectedScope === 'child' ? selectedChildId : null,
    isParent && open,
  );
  const parentPinsQuery = useParentV2PinnedItems(isParent && open);
  const parentRecentQuery = useParentV2RecentItems(isParent && open);
  const upsertWorkspaceItem = useUpsertParentV2WorkspaceItem();

  const roleActions = useMemo<SearchResult[]>(() => {
    const rows: SearchResult[] = [];

    for (const section of navConfig.sections) {
      rows.push({
        id: `${section.id}__section`,
        label: section.label,
        category: 'Modules',
        section: section.id,
        path: section.path,
      });

      for (const header of section.headerItems) {
        rows.push({
          id: `${section.id}-${header.id}`,
          label: `${section.label} • ${header.label}`,
          category: section.label,
          section: section.id,
          header: header.id,
          path: header.path ?? section.path,
        });

        for (const subItem of header.subNav ?? []) {
          rows.push({
            id: `${section.id}-${header.id}-${subItem.id}`,
            label: `${section.label} • ${header.label} • ${subItem.label}`,
            category: `${section.label} Sections`,
            section: section.id,
            header: header.id,
            path: subItem.path ?? header.path ?? section.path,
          });
        }
      }
    }

    return rows;
  }, [navConfig]);

  const providerShortcuts = useMemo<SearchResult[]>(() => {
    if (role !== 'PROVIDER') return [];
    return [
      {
        id: 'provider_new_tenant',
        label: 'Create Tenant (Wizard)',
        category: 'Quick Action',
        section: 'provider_onboarding',
        header: 'onboarding_wizard',
        path: '/provider/onboarding/wizard',
      },
      {
        id: 'provider_suspend_risk',
        label: 'Review Payment-Due Tenants',
        category: 'Quick Action',
        section: 'provider_tenants',
        header: 'tenants_directory',
        path: '/provider/tenants/lifecycle',
      },
      {
        id: 'provider_sla_breach',
        label: 'Open SLA Breach Queue',
        category: 'Quick Action',
        section: 'provider_support',
        header: 'support_sla',
        path: '/provider/support/sla',
      },
      {
        id: 'provider_incident_declare',
        label: 'Declare Incident',
        category: 'Quick Action',
        section: 'provider_incidents',
        header: 'incidents_queue',
        path: '/provider/incidents',
      },
    ];
  }, [role]);

  const parentShortcuts = useMemo<SearchResult[]>(() => {
    if (!isParent) return [];
    return [
      { id: 'parent-action-required', label: 'Action Required Queue', category: 'Parent', path: '/parent/home/action-required' },
      { id: 'parent-overdue-fees', label: 'Overdue Invoices', category: 'Parent', path: '/parent/fees/billing/invoices' },
      { id: 'parent-pending-forms', label: 'Pending Approvals', category: 'Parent', path: '/parent/approvals/pending' },
      { id: 'parent-messages', label: 'Unread Messages', category: 'Parent', path: '/parent/messages/inbox' },
      { id: 'parent-attendance', label: 'Attendance Follow-up', category: 'Parent', path: '/parent/attendance/records' },
    ];
  }, [isParent]);

  const parentEntityResults = useMemo<SearchResult[]>(() => {
    if (!isParent) return [];
    return (parentSearchQuery.data ?? []).map((entry) => {
      const resolved = entry.path ? resolveParentNavState(entry.path) : null;
      return {
        id: `parent-search-${entry.type}-${entry.id}`,
        label: entry.label,
        category: `Parent • ${entry.type}`,
        section: resolved?.sectionId,
        header: resolved?.headerId,
        path: entry.path,
      };
    });
  }, [isParent, parentSearchQuery.data]);

  const pinnedResults = useMemo<SearchResult[]>(() => {
    if (!isParent) return [];
    return (parentPinsQuery.data ?? []).map((item) => {
      const path = item.moduleId.startsWith('/') ? item.moduleId : undefined;
      const resolved = path ? resolveParentNavState(path) : null;
      return {
        id: `pin-${item.id}`,
        label: item.label,
        category: 'Pinned',
        section: resolved?.sectionId,
        header: resolved?.headerId,
        path,
        pinned: true,
      };
    });
  }, [isParent, parentPinsQuery.data]);

  const recentResults = useMemo<SearchResult[]>(() => {
    if (!isParent) return [];
    return (parentRecentQuery.data ?? []).slice(0, 10).map((item) => {
      const path = item.moduleId.startsWith('/') ? item.moduleId : undefined;
      const resolved = path ? resolveParentNavState(path) : null;
      return {
        id: `recent-${item.id}`,
        label: item.label,
        category: 'Recent',
        section: resolved?.sectionId,
        header: resolved?.headerId,
        path,
        recent: true,
      };
    });
  }, [isParent, parentRecentQuery.data]);

  useEffect(() => {
    if (!open || role !== 'PROVIDER') {
      setProviderEntityResults([]);
      return;
    }

    const searchText = query.trim();
    if (searchText.length < 2) {
      setProviderEntityResults([]);
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const response = await api.get<ApiSuccessResponse<ProviderTenantSearchResult[]>>(
          `/provider/search?q=${encodeURIComponent(searchText)}`,
        );

        const mapped = response.data.map((entry) => ({
          id: `tenant-search-${entry.id}`,
          label: `${entry.name} (${entry.externalId})`,
          category: `Tenant • ${entry.domain}`,
          section: 'provider_tenants',
          header: 'tenants_directory',
          path: '/provider/tenants/profiles',
          tenantId: entry.id,
        } satisfies SearchResult));

        setProviderEntityResults(mapped);
      } catch {
        setProviderEntityResults([]);
      }
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [open, query, role]);

  const allActions = useMemo(
    () =>
      dedupeResults([
        ...providerEntityResults,
        ...parentEntityResults,
        ...providerShortcuts,
        ...parentShortcuts,
        ...pinnedResults,
        ...recentResults,
        ...roleActions,
      ]),
    [providerEntityResults, parentEntityResults, providerShortcuts, parentShortcuts, pinnedResults, recentResults, roleActions],
  );

  const results = query.trim()
    ? allActions.filter((entry) =>
        entry.label.toLowerCase().includes(query.toLowerCase()) ||
        entry.category.toLowerCase().includes(query.toLowerCase()),
      )
    : allActions.slice(0, 28);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (results.length === 0) {
      setSelectedIdx(0);
      return;
    }
    setSelectedIdx((idx) => Math.min(idx, results.length - 1));
  }, [results.length]);

  const navigate = useCallback(
    (entry: SearchResult) => {
      if (isParent) {
        const baseTarget = entry.path ?? DEFAULT_PARENT_PATH;
        const target = withParentRouteContext(baseTarget, location.search, {
          scope: selectedScope,
          childId: selectedChildId,
        });
        const resolved = resolveParentNavState(baseTarget);

        navigateNavState(resolved.sectionId, resolved.headerId, resolved.subNavId);
        navTo(target);

        if (baseTarget && !entry.recent) {
          upsertWorkspaceItem.mutate({
            itemId: entry.id,
            label: entry.label,
            moduleId: baseTarget,
            childId: selectedScope === 'child' ? selectedChildId : null,
            kind: 'RECENT',
          });
        }

        setOpen(false);
        return;
      }

      if (entry.section) setSection(entry.section);
      if (entry.header) setHeader(entry.header);
      navTo(entry.path ?? ROLE_BASE[role] ?? '/student');
      setOpen(false);
    },
    [
      isParent,
      location.search,
      navTo,
      navigateNavState,
      role,
      selectedChildId,
      selectedScope,
      setHeader,
      setSection,
      upsertWorkspaceItem,
    ],
  );

  const handleKey = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIdx((idx) => Math.min(idx + 1, results.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIdx((idx) => Math.max(idx - 1, 0));
      } else if (event.key === 'Enter' && results[selectedIdx]) {
        navigate(results[selectedIdx]);
      }
    },
    [navigate, results, selectedIdx],
  );

  useEffect(() => {
    listRef.current?.children[selectedIdx]?.scrollIntoView({ block: 'nearest' });
  }, [selectedIdx]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <div className="fixed inset-x-0 top-[16%] z-101 mx-auto w-full max-w-3xl">
        <div className="mx-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/6 px-4 py-3">
            <Command className="size-5 shrink-0 text-white/40" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelectedIdx(0);
              }}
              onKeyDown={handleKey}
              placeholder={
                role === 'PROVIDER'
                  ? 'Search tenants, actions, modules, audit...'
                  : isParent
                    ? 'Search parent routes, invoices, approvals, threads...'
                    : 'Search modules and shortcuts...'
              }
              className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/25 outline-none"
            />
            <kbd className="hidden rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/30 sm:inline-flex">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-96 overflow-y-auto p-2" style={{ scrollbarWidth: 'thin' }}>
            {results.length === 0 ? (
              <div className="py-8 text-center text-sm text-white/30">No results for "{query}"</div>
            ) : (
              results.map((entry, idx) => (
                <button
                  key={entry.id}
                  onClick={() => navigate(entry)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                    idx === selectedIdx ? 'bg-white/8 text-white/90' : 'text-white/50 hover:bg-white/4',
                  )}
                >
                  <div className="flex size-8 items-center justify-center rounded-md bg-white/5">
                    {entry.pinned ? (
                      <Pin className="size-4" />
                    ) : entry.recent ? (
                      <Clock3 className="size-4" />
                    ) : entry.tenantId ? (
                      <Building2 className="size-4" />
                    ) : entry.category.startsWith('Parent') ? (
                      <Star className="size-4" />
                    ) : (
                      <Hash className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{entry.label}</p>
                    <p className="text-[10px] text-white/30">{entry.category}</p>
                  </div>
                  {idx === selectedIdx && <ArrowRight className="size-3.5 shrink-0 text-white/30" />}
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-white/6 px-4 py-2 text-[10px] text-white/20">
            <span>↑↓ Navigate</span>
            <span>↵ Open</span>
            <span>esc Close</span>
          </div>
        </div>
      </div>
    </>
  );
}
