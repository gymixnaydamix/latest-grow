import { useUIStore } from '../../store/ui.store';

// Spy on localStorage and document.documentElement
const localStorageMock: Record<string, string> = {};
beforeAll(() => {
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation((k) => localStorageMock[k] ?? null);
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { localStorageMock[k] = v; });
});

function resetStore() {
  useUIStore.setState({
    sidebarOpen: true,
    theme: 'light',
    overlayContent: null,
  });
  delete localStorageMock['theme'];
}

beforeEach(() => {
  resetStore();
  jest.clearAllMocks();
});

describe('useUIStore', () => {
  describe('sidebar', () => {
    it('toggleSidebar flips the boolean', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(true);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('setSidebarOpen sets explicit value', () => {
      useUIStore.getState().setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      useUIStore.getState().setSidebarOpen(true);
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });
  });

  describe('theme', () => {
    it('default is light', () => {
      expect(useUIStore.getState().theme).toBe('light');
    });

    it('toggleTheme switches to dark and persists', () => {
      const classList = document.documentElement.classList;
      jest.spyOn(classList, 'toggle');

      useUIStore.getState().toggleTheme();

      expect(useUIStore.getState().theme).toBe('dark');
      expect(classList.toggle).toHaveBeenCalledWith('dark', true);
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('toggleTheme dark -> light', () => {
      useUIStore.setState({ theme: 'dark' });
      useUIStore.getState().toggleTheme();
      expect(useUIStore.getState().theme).toBe('light');
      expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });
  });

  describe('overlay', () => {
    it('openOverlay sets content', () => {
      useUIStore.getState().openOverlay('hello');
      expect(useUIStore.getState().overlayContent).toBe('hello');
    });

    it('closeOverlay clears content', () => {
      useUIStore.setState({ overlayContent: 'x' });
      useUIStore.getState().closeOverlay();
      expect(useUIStore.getState().overlayContent).toBeNull();
    });
  });
});
