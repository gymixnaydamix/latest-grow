import { useParentPortalStore } from '@/store/parent-portal.store';

beforeEach(() => {
  localStorage.clear();
  useParentPortalStore.setState({
    selectedScope: 'family',
    selectedChildId: null,
    pinnedItems: [],
    recentItems: [],
    savedViews: [],
    mobileRightNavOpen: false,
    mobileSubNavOpen: false,
  });
});

describe('useParentPortalStore', () => {
  it('switches scope and selected child deterministically', () => {
    useParentPortalStore.getState().setScope('child', 'student-001');
    expect(useParentPortalStore.getState().selectedScope).toBe('child');
    expect(useParentPortalStore.getState().selectedChildId).toBe('student-001');

    useParentPortalStore.getState().setSelectedChild('student-002');
    expect(useParentPortalStore.getState().selectedScope).toBe('child');
    expect(useParentPortalStore.getState().selectedChildId).toBe('student-002');

    useParentPortalStore.getState().setScope('family', null);
    expect(useParentPortalStore.getState().selectedScope).toBe('family');
  });

  it('pins, unpins, and tracks recents with latest-first behavior', () => {
    useParentPortalStore.getState().pinItem({ id: 'a', label: 'Invoice A', moduleId: 'fees_payments' });
    useParentPortalStore.getState().pinItem({ id: 'b', label: 'Approval B', moduleId: 'approvals_forms' });
    useParentPortalStore.getState().pinItem({ id: 'a', label: 'Invoice A', moduleId: 'fees_payments' });
    expect(useParentPortalStore.getState().pinnedItems.map((item) => item.id)).toEqual(['a', 'b']);

    useParentPortalStore.getState().addRecentItem({ id: 'r1', label: 'Announcements', moduleId: 'announcements' });
    useParentPortalStore.getState().addRecentItem({ id: 'r2', label: 'Messages', moduleId: 'messages' });
    useParentPortalStore.getState().addRecentItem({ id: 'r1', label: 'Announcements', moduleId: 'announcements' });
    expect(useParentPortalStore.getState().recentItems.map((item) => item.id)).toEqual(['r1', 'r2']);

    useParentPortalStore.getState().unpinItem('a');
    expect(useParentPortalStore.getState().pinnedItems.map((item) => item.id)).toEqual(['b']);
  });
});
