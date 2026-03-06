import { render, screen } from '@testing-library/react';
import { ParentDashboard } from '@/views/parent/ParentDashboard';

jest.mock('@/config/parentPortalFlags', () => ({
  isParentPortalV2EnabledByDefault: jest.fn(),
}));

jest.mock('@/views/parent/ParentPortalV2', () => ({
  ParentPortalV2: () => <div data-testid="parent-v2">Parent V2</div>,
}));

jest.mock('@/views/parent/ParentDashboardLegacy', () => ({
  ParentDashboardLegacy: () => <div data-testid="parent-legacy">Parent Legacy</div>,
}));

describe('ParentDashboard feature flag', () => {
  it('renders legacy dashboard when v2 flag is disabled', async () => {
    const { isParentPortalV2EnabledByDefault } = await import('@/config/parentPortalFlags');
    (isParentPortalV2EnabledByDefault as jest.Mock).mockReturnValue(false);

    render(<ParentDashboard />);
    expect(screen.getByTestId('parent-legacy')).toBeInTheDocument();
    expect(screen.queryByTestId('parent-v2')).not.toBeInTheDocument();
  });

  it('renders v2 dashboard when v2 flag is enabled', async () => {
    const { isParentPortalV2EnabledByDefault } = await import('@/config/parentPortalFlags');
    (isParentPortalV2EnabledByDefault as jest.Mock).mockReturnValue(true);

    render(<ParentDashboard />);
    expect(screen.getByTestId('parent-v2')).toBeInTheDocument();
    expect(screen.queryByTestId('parent-legacy')).not.toBeInTheDocument();
  });
});
