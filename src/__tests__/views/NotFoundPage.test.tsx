/* NotFoundPage component tests */
import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../setup/test-utils';
import { NotFoundPage } from '../../views/NotFoundPage';

describe('NotFoundPage', () => {
  it('renders the 404 heading', () => {
    renderWithProviders(React.createElement(NotFoundPage));
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('displays "Page not found" message', () => {
    renderWithProviders(React.createElement(NotFoundPage));
    expect(screen.getByText('Page not found')).toBeInTheDocument();
  });

  it('shows explanatory text', () => {
    renderWithProviders(React.createElement(NotFoundPage));
    expect(screen.getByText(/doesn't exist or has been moved/)).toBeInTheDocument();
  });

  it('has a Go Back link pointing to /', () => {
    renderWithProviders(React.createElement(NotFoundPage));
    const goBack = screen.getByText('Go Back').closest('a');
    expect(goBack).toHaveAttribute('href', '/');
  });

  it('has a Dashboard link pointing to /', () => {
    renderWithProviders(React.createElement(NotFoundPage));
    const dashboard = screen.getByText('Dashboard').closest('a');
    expect(dashboard).toHaveAttribute('href', '/');
  });
});
