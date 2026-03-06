import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { LeftSubNav } from '@/components/layout/LeftSubNav';
import { TooltipProvider } from '@/components/ui/tooltip';
import { providerConsoleNav } from '@/constants/provider-navigation';
import { useAuthStore } from '@/store/auth.store';
import { useNavigationStore } from '@/store/navigation.store';
import { useParentPortalStore } from '@/store/parent-portal.store';
import { useProviderHome, useProviderTenants } from '@/hooks/api/use-provider-console';

jest.mock('@/hooks/api/use-provider-console', () => ({
  useProviderHome: jest.fn(),
  useProviderTenants: jest.fn(),
}));

const mockedUseProviderHome = useProviderHome as jest.Mock;
const mockedUseProviderTenants = useProviderTenants as jest.Mock;

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderSubNav(items: Array<{ id: string; label: string; path?: string }>, parentLabel: string, initialPath = '/provider/home') {
  return render(
    <TooltipProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <LeftSubNav items={items as any} parentLabel={parentLabel} />
        <LocationDisplay />
      </MemoryRouter>
    </TooltipProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();

  useAuthStore.setState({
    user: {
      id: 'provider-1',
      email: 'provider@test.dev',
      firstName: 'Provider',
      lastName: 'User',
      role: 'PROVIDER',
    } as any,
    schoolId: null,
    schoolMemberships: [],
    isLoading: false,
    error: null,
  });

  useNavigationStore.setState({
    activeSection: 'provider_home',
    activeHeader: 'home_command',
    activeSubNav: 'home_inbox',
  });

  useParentPortalStore.setState({
    selectedScope: 'family',
    selectedChildId: null,
    pinnedItems: [],
    recentItems: [],
    savedViews: [],
    mobileRightNavOpen: false,
    mobileSubNavOpen: false,
  });

  mockedUseProviderHome.mockReturnValue({
    data: {
      actionInbox: [{ id: 'inbox-1' }, { id: 'inbox-2' }, { id: 'inbox-3' }],
      tenantHealthWatchlist: [{ tenantId: 'tenant-1' }],
      onboardingPipeline: [
        { stage: 'lead', label: 'Lead', count: 2 },
        { stage: 'provisioning', label: 'Provisioning', count: 3 },
      ],
      billingExceptions: [{ id: 'invoice-1' }, { id: 'invoice-2' }],
      systemHealth: {
        uptimePct: 99.9,
        queueBacklog: 0,
        activeIncidents: 0,
        emailDelivery: 'HEALTHY',
        smsDelivery: 'HEALTHY',
      },
    },
    isLoading: false,
    isError: false,
  });

  mockedUseProviderTenants.mockReturnValue({
    data: [
      { id: 'tenant-1', status: 'ACTIVE', health: 'HEALTHY', incidentsOpen: 0, billingStatus: 'GOOD' },
      { id: 'tenant-2', status: 'TRIAL', health: 'WARNING', incidentsOpen: 0, billingStatus: 'GOOD' },
      { id: 'tenant-3', status: 'SUSPENDED', health: 'HEALTHY', incidentsOpen: 2, billingStatus: 'FAILED' },
    ],
    isLoading: false,
    isError: false,
  });
});

describe('LeftSubNav provider refresh', () => {
  it('renders provider home descriptions, counts, and active state', () => {
    const items = [...(providerConsoleNav.sections[0].headerItems[0].subNav ?? [])];

    renderSubNav(items as any, providerConsoleNav.sections[0].headerItems[0].label);

    expect(screen.getByText('Action Inbox')).toBeInTheDocument();
    expect(screen.getByText('Alerts, escalations, and payment blockers')).toBeInTheDocument();
    expect(screen.getByTestId('provider-subnav-metric-home_inbox')).toHaveTextContent('3');
    expect(screen.getByTestId('provider-subnav-metric-home_system')).toHaveTextContent('Healthy');
    expect(screen.getByRole('button', { name: 'Action Inbox' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders tenant counts and supports collapsed navigation without breaking routing', async () => {
    const user = userEvent.setup();
    const items = [...(providerConsoleNav.sections[1].headerItems[0].subNav ?? [])];

    useNavigationStore.setState({
      activeSection: 'provider_tenants',
      activeHeader: 'tenants_directory',
      activeSubNav: 'tenants_list',
    });

    renderSubNav(items as any, providerConsoleNav.sections[1].headerItems[0].label, '/provider/tenants/list');

    expect(screen.getByTestId('provider-subnav-metric-tenants_list')).toHaveTextContent('3');
    expect(screen.getByTestId('provider-subnav-metric-tenants_status')).toHaveTextContent('2');
    expect(screen.getByTestId('provider-subnav-metric-tenants_maintenance')).toHaveTextContent('2');

    await user.click(screen.getByLabelText('Collapse provider sub navigation'));
    expect(screen.getByLabelText('Expand provider sub navigation')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Lifecycle States' }));

    expect(useNavigationStore.getState().activeSubNav).toBe('tenants_status');
    expect(screen.getByTestId('location')).toHaveTextContent('/provider/tenants/lifecycle');
  });

  it('supports provider mobile drawer open, backdrop close, Escape close, and close-on-selection', async () => {
    const user = userEvent.setup();
    const items = [...(providerConsoleNav.sections[0].headerItems[0].subNav ?? [])];

    renderSubNav(items as any, providerConsoleNav.sections[0].headerItems[0].label);

    await user.click(screen.getByLabelText('Open provider sub navigation'));
    const mobilePanel = screen.getByLabelText('Provider section navigation');
    expect(mobilePanel).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close provider sub navigation'));
    expect(screen.queryByLabelText('Provider section navigation')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Open provider sub navigation'));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByLabelText('Provider section navigation')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Open provider sub navigation'));
    const reopenedPanel = screen.getByLabelText('Provider section navigation');
    await user.click(within(reopenedPanel).getByRole('button', { name: 'Health Watchlist' }));
    expect(screen.queryByLabelText('Provider section navigation')).not.toBeInTheDocument();
    expect(useNavigationStore.getState().activeSubNav).toBe('home_health');
  });

  it('keeps provider items navigable while loading and hides metrics on provider data errors', async () => {
    const user = userEvent.setup();
    const items = [...(providerConsoleNav.sections[0].headerItems[0].subNav ?? [])];

    mockedUseProviderHome.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });
    mockedUseProviderTenants.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const { rerender } = render(
      <TooltipProvider>
        <MemoryRouter initialEntries={['/provider/home']}>
          <LeftSubNav items={items as any} parentLabel={providerConsoleNav.sections[0].headerItems[0].label} />
          <LocationDisplay />
        </MemoryRouter>
      </TooltipProvider>,
    );

    expect(screen.getByTestId('provider-subnav-metric-home_inbox')).toBeInTheDocument();

    mockedUseProviderHome.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });
    mockedUseProviderTenants.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    rerender(
      <TooltipProvider>
        <MemoryRouter initialEntries={['/provider/home']}>
          <LeftSubNav items={items as any} parentLabel={providerConsoleNav.sections[0].headerItems[0].label} />
          <LocationDisplay />
        </MemoryRouter>
      </TooltipProvider>,
    );

    expect(screen.queryByTestId('provider-subnav-metric-home_inbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Billing Exceptions' }));
    expect(useNavigationStore.getState().activeSubNav).toBe('home_billing');
    expect(screen.getByTestId('location')).toHaveTextContent('/provider/home/billing-exceptions');
  });

  it('falls back to the generic non-provider sub navigation path', () => {
    useAuthStore.setState({
      user: {
        id: 'admin-1',
        email: 'admin@test.dev',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      } as any,
    });

    const items = [
      { id: 'overview', label: 'Overview', path: '/admin' },
      { id: 'reports', label: 'Reports', path: '/admin/reports' },
    ];

    renderSubNav(items as any, 'Admin', '/admin');

    expect(screen.getByText('Subnav')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Collapse provider sub navigation')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Open provider sub navigation')).not.toBeInTheDocument();
  });
});
