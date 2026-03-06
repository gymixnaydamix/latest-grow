/* ErrorBoundary component tests */
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// A helper component that throws on demand
function ThrowOnRender({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('Test render error');
  return React.createElement('div', null, 'All good');
}

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowOnRender, { shouldThrow: false }),
      ),
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders fallback UI on error', () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowOnRender, { shouldThrow: true }),
      ),
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
  });

  it('renders Try Again and Reload buttons', () => {
    render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowOnRender, { shouldThrow: true }),
      ),
    );
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText(/Reload Page/)).toBeInTheDocument();
  });

  it('recovers from error when Try Again is clicked', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowOnRender, { shouldThrow: true }),
      ),
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click "Try Again" — this calls handleReset clearing the error
    await user.click(screen.getByText('Try Again'));

    // After reset, re-render with a non-throwing child
    rerender(
      React.createElement(
        ErrorBoundary,
        null,
        React.createElement(ThrowOnRender, { shouldThrow: false }),
      ),
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = React.createElement('p', null, 'Custom oops');
    render(
      React.createElement(
        ErrorBoundary,
        { fallback: customFallback } as any,
        React.createElement(ThrowOnRender, { shouldThrow: true }),
      ),
    );
    expect(screen.getByText('Custom oops')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });
});
