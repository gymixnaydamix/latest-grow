import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RoleGuard } from '../../../components/guards/RoleGuard';
import { useAuthStore } from '../../../store/auth.store';

/** Helper: render RoleGuard within a router that has redirect targets */
function renderGuard(
  roles: Parameters<typeof RoleGuard>[0]['roles'],
  child: React.ReactElement,
  initialEntries = ['/guarded'],
) {
  return render(
    React.createElement(
      MemoryRouter,
      { initialEntries },
      React.createElement(
        Routes,
        null,
        React.createElement(Route, {
          path: '/guarded',
          element: React.createElement(RoleGuard, { roles, children: child }),
        }),
        React.createElement(Route, { path: '/login', element: React.createElement('div', null, 'Login Page') }),
        React.createElement(Route, { path: '/student', element: React.createElement('div', null, 'Student Dashboard') }),
        React.createElement(Route, { path: '/admin', element: React.createElement('div', null, 'Admin Dashboard') }),
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

describe('RoleGuard', () => {
  it('redirects to /login when no user', () => {
    renderGuard(['ADMIN'], React.createElement('div', null, 'Admin Panel'));

    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders children when user role is in allowed list', () => {
    resetStore({ user: { id: '1', role: 'ADMIN' } });

    renderGuard(
      ['ADMIN', 'PROVIDER'],
      React.createElement('div', null, 'Admin Panel'),
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects to role dashboard when role is not allowed', () => {
    resetStore({ user: { id: '1', role: 'STUDENT' } });

    renderGuard(['ADMIN'], React.createElement('div', null, 'Admin Only'));

    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
  });

  it('supports multiple roles', () => {
    resetStore({ user: { id: '1', role: 'TEACHER' } });

    renderGuard(
      ['ADMIN', 'TEACHER', 'PROVIDER'],
      React.createElement('div', null, 'Allowed'),
    );

    expect(screen.getByText('Allowed')).toBeInTheDocument();
  });
});
