import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  overlayAppList,
  overlayDefaultEnabledApps,
  getOverlayDefaultPrimaryId,
  getOverlayDefaultSecondaryId,
  type OverlayAppId,
} from '@/overlay/overlay-registry';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/store/auth.store';
import { useNavigationStore } from '@/store/navigation.store';
import { useOverlayStore } from '@/store/overlay.store';

jest.mock('@/components/layout/RightSidebar', () => ({
  RightSidebar: () => <div data-testid="right-sidebar" />,
}));

jest.mock('@/components/layout/HeaderNav', () => ({
  HeaderNav: () => <div data-testid="header-nav" />,
}));

jest.mock('@/components/layout/LeftSubNav', () => ({
  LeftSubNav: () => <div data-testid="left-sub-nav" />,
}));

jest.mock('@/components/features/SearchCommand', () => ({
  SearchCommand: () => <div data-testid="search-command" />,
}));

jest.mock('@/components/layout/WidgetPanel', () => ({
  WidgetPanel: () => <div data-testid="widget-panel" />,
}));

function buildDefaultPrimaryByApp(): Record<OverlayAppId, string> {
  return overlayAppList.reduce((acc, app) => {
    acc[app.id] = getOverlayDefaultPrimaryId(app.id);
    return acc;
  }, {} as Record<OverlayAppId, string>);
}

function buildDefaultSecondaryByApp(primaryByApp: Record<OverlayAppId, string>): Record<OverlayAppId, string> {
  return overlayAppList.reduce((acc, app) => {
    acc[app.id] = getOverlayDefaultSecondaryId(app.id, primaryByApp[app.id]);
    return acc;
  }, {} as Record<OverlayAppId, string>);
}

function resetOverlayStore() {
  const primaryByApp = buildDefaultPrimaryByApp();
  useOverlayStore.setState({
    launcherOpen: false,
    activeAppId: null,
    activePrimaryByApp: primaryByApp,
    activeSecondaryByApp: buildDefaultSecondaryByApp(primaryByApp),
    minimizedApps: [],
    enabledApps: { ...overlayDefaultEnabledApps },
    overlayV2Enabled: true,
  });
}

beforeEach(() => {
  useAuthStore.setState({
    user: {
      id: 'u-admin-1',
      email: 'admin@test.dev',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    } as any,
    schoolId: 'school-1',
    schoolMemberships: [],
    isLoading: false,
    error: null,
  });

  useNavigationStore.setState({
    activeSection: 'control_center',
    activeHeader: 'action_inbox',
    activeSubNav: '',
  });

  resetOverlayStore();
});

describe('AppLayout overlay flag behavior', () => {
  it('renders legacy launcher path and suppresses v2 shell behavior when overlay v2 is disabled', () => {
    useOverlayStore.setState({
      overlayV2Enabled: false,
      activeAppId: 'studio',
    });

    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Toggle legacy app launcher')).toBeInTheDocument();
    expect(screen.queryByLabelText('Open app launcher')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Close overlay app')).not.toBeInTheDocument();
  });

  it('renders v2 launcher path when overlay v2 is enabled', () => {
    useOverlayStore.setState({
      overlayV2Enabled: true,
      activeAppId: null,
    });

    render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Open app launcher')).toBeInTheDocument();
    expect(screen.queryByLabelText('Toggle legacy app launcher')).not.toBeInTheDocument();
  });

  it('hydrates gamification overlay state from search params for operator roles', async () => {
    useAuthStore.setState((state) => ({
      ...state,
      user: {
        ...(state.user as any),
        role: 'ADMIN',
      },
    }));

    render(
      <MemoryRouter initialEntries={['/admin?overlayApp=gamification&overlayPath=/gamification/quizzes/quiz-builder']}>
        <AppLayout />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(useOverlayStore.getState().activeAppId).toBe('gamification');
      expect(useOverlayStore.getState().activePrimaryByApp.gamification).toBe('quizzes_challenges');
      expect(useOverlayStore.getState().activeSecondaryByApp.gamification).toBe('quiz_builder');
    });
  });
});
