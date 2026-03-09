import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet, useLocation } from 'react-router-dom';
import App from '../App';
import { providerConsoleNav } from '../constants/provider-navigation';
import { useAuthStore } from '../store/auth.store';

jest.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../components/layout/LoadingScreen', () => ({
  LoadingScreen: ({ message }: { message?: string }) => <div>{message ?? 'Loading'}</div>,
}));

jest.mock('../components/layout/AppLayout', () => ({
  AppLayout: () => <Outlet />,
}));

jest.mock('../components/guards/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../components/guards/RoleGuard', () => ({
  RoleGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../views/provider/ProviderDashboard', () => ({
  ProviderDashboard: () => {
    const location = useLocation();
    return <div data-testid="provider-path">{location.pathname}</div>;
  },
}));

function renderApp(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => {
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
});

describe('provider console removals', () => {
  it.each([
    '/provider/templates',
    '/provider/templates/addons',
    '/provider/templates/purchases',
  ])('redirects legacy route %s to /provider/home', async (path) => {
    renderApp([path]);

    expect(await screen.findByTestId('provider-path')).toHaveTextContent('/provider/home');
  });

  it('removes the Templates & Marketplace section from provider navigation', () => {
    expect(providerConsoleNav.sections.map((section) => String(section.id))).not.toContain('provider_templates');
    expect(providerConsoleNav.sections.map((section) => String(section.label))).not.toContain('Templates & Marketplace');
  });

  it.each([
    '/provider/usage',
    '/provider/usage/limits',
    '/provider/usage/reports',
  ])('redirects legacy usage route %s to /provider/home', async (path) => {
    renderApp([path]);

    expect(await screen.findByTestId('provider-path')).toHaveTextContent('/provider/home');
  });

  it('removes the Usage & Limits section from provider navigation', () => {
    expect(providerConsoleNav.sections.map((section) => String(section.id))).not.toContain('provider_usage');
    expect(providerConsoleNav.sections.map((section) => String(section.label))).not.toContain('Usage & Limits');
  });
});
