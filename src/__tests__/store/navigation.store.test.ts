import { useNavigationStore } from '@/store/navigation.store';

describe('useNavigationStore', () => {
  beforeEach(() => {
    // Reset Zustand store to default state
    useNavigationStore.setState({
      activeSection: 'dashboard',
      activeHeader: 'overview',
      activeSubNav: '',
    });
  });

  it('has correct default state', () => {
    const state = useNavigationStore.getState();
    expect(state.activeSection).toBe('dashboard');
    expect(state.activeHeader).toBe('overview');
    expect(state.activeSubNav).toBe('');
  });

  it('setSection updates section and resets header/subNav', () => {
    useNavigationStore.getState().setSection('school');
    const state = useNavigationStore.getState();
    expect(state.activeSection).toBe('school');
    expect(state.activeHeader).toBe('');
    expect(state.activeSubNav).toBe('');
  });

  it('setHeader updates header and resets subNav', () => {
    useNavigationStore.getState().setHeader('users');
    const state = useNavigationStore.getState();
    expect(state.activeHeader).toBe('users');
    expect(state.activeSubNav).toBe('');
  });

  it('setSubNav updates only subNav', () => {
    useNavigationStore.getState().setSubNav('manage_staff');
    expect(useNavigationStore.getState().activeSubNav).toBe('manage_staff');
  });

  it('navigate sets all three values at once', () => {
    useNavigationStore.getState().navigate('finance', 'invoices', 'create');
    const state = useNavigationStore.getState();
    expect(state.activeSection).toBe('finance');
    expect(state.activeHeader).toBe('invoices');
    expect(state.activeSubNav).toBe('create');
  });

  it('navigate defaults header and subNav to empty', () => {
    useNavigationStore.getState().navigate('admin');
    const state = useNavigationStore.getState();
    expect(state.activeSection).toBe('admin');
    expect(state.activeHeader).toBe('');
    expect(state.activeSubNav).toBe('');
  });
});
