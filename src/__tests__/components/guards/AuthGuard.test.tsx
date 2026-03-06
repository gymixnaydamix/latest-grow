import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthGuard } from '../../../components/guards/AuthGuard';
import { useAuthStore } from '../../../store/auth.store';

// Mock Skeleton so we can detect loading state
jest.mock('../../../components/ui/skeleton', () => ({
  Skeleton: (props: React.HTMLAttributes<HTMLDivElement>) =>
    React.createElement('div', { 'data-testid': 'skeleton', ...props }),
}));

/** Helper: render AuthGuard within a router that has a /login route for Navigate to land on */
function renderGuard(ui: React.ReactElement, initialEntries = ['/protected']) {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, { path: '/protected', element: ui }),
        React.createElement(Route, { path: '/login', element: React.createElement('div', null, 'Login Page') }),
      ),
    ),
  );
}

function resetStore(overrides: Record<string, unknown> = {}) {
  useAuthStore.setState({
    user: null,
    schoolId: null,
    schoolMemberships: [],
    isLoading: false,
    error: null,
    ...overrides,
  });
}

beforeEach(() => {
  resetStore();
});

describe('AuthGuard', () => {
  it('shows skeleton while loading', () => {
    resetStore({ isLoading: true });

    renderGuard(
      React.createElement(AuthGuard, null, React.createElement('div', null, 'Protected')),
    );

    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('redirects to /login when no user', () => {
    resetStore({ isLoading: false, user: null });

    renderGuard(
      React.createElement(AuthGuard, null, React.createElement('div', null, 'Protected')),
    );

    // Navigate redirects to /login route which renders "Login Page"
    expect(screen.queryByText('Protected')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user is present', () => {
    resetStore({
      isLoading: false,
      user: { id: '1', email: 'a@b.com', firstName: 'A', lastName: 'B', role: 'OWNER' },
    });

    renderGuard(
      React.createElement(AuthGuard, null, React.createElement('div', null, 'Protected')),
    );

    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('calls fetchMe on mount when no user and not loading', () => {
    const fetchMe = jest.fn().mockImplementation(async () => {
      // Simulate fetchMe setting isLoading + user so the guard stops at skeleton
      useAuthStore.setState({ isLoading: true });
    });
    useAuthStore.setState({ fetchMe, isLoading: false, user: null } as any);

    renderGuard(
      React.createElement(AuthGuard, null, React.createElement('div', null, 'Content')),
    );

    expect(fetchMe).toHaveBeenCalledTimes(1);
  });
});
