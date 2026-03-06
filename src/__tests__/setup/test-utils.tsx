/* Frontend test helpers — React Query + Router wrappers */
import React from 'react';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  initialEntries?: MemoryRouterProps['initialEntries'];
}

/**
 * Render a React component wrapped with QueryClientProvider and MemoryRouter.
 * Use for component tests that need routing or React Query context.
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptions & WrapperOptions = {},
): RenderResult & { queryClient: QueryClient } {
  const { initialEntries = ['/'], ...renderOptions } = options;
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(MemoryRouter, { initialEntries }, children),
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
}

export { createTestQueryClient };
