import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  overlayAppList,
  overlayDefaultEnabledApps,
  getOverlayDefaultPrimaryId,
  getOverlayDefaultSecondaryId,
  type OverlayAppId,
} from '@/overlay/overlay-registry';
import { useOverlayStore } from '@/store/overlay.store';
import { useNavigationStore } from '@/store/navigation.store';
import { OverlaySettingSection } from '@/views/provider/sections/OverlaySettingSection';

const mockMutate = jest.fn();

jest.mock('@/hooks/api', () => ({
  useUpdateOverlaySettings: () => ({
    mutate: mockMutate,
  }),
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
  mockMutate.mockReset();
  useNavigationStore.setState({
    activeSection: 'overlay_setting',
    activeHeader: 'overlay_management',
    activeSubNav: 'studio',
  });
  resetOverlayStore();
});

describe('OverlaySettingSection integration', () => {
  it('toggles a single app from centralized state and emits the expected mutation payload', async () => {
    const user = userEvent.setup();
    render(<OverlaySettingSection />);

    const toggleStudio = screen.getByLabelText('Toggle Studio');
    await user.click(toggleStudio);

    expect(useOverlayStore.getState().enabledApps.studio).toBe(false);
    expect(mockMutate).toHaveBeenCalledWith({ studio: { enabled: false } });
  });

  it('handles bulk disable/enable and emits full payload maps', async () => {
    const user = userEvent.setup();
    render(<OverlaySettingSection />);

    await user.click(screen.getByRole('button', { name: 'Disable All' }));
    const allDisabled = Object.values(useOverlayStore.getState().enabledApps).every((enabled) => !enabled);
    expect(allDisabled).toBe(true);

    const expectedDisabledPayload = overlayAppList.reduce<Record<string, { enabled: boolean }>>((acc, app) => {
      acc[app.id] = { enabled: false };
      return acc;
    }, {});
    expect(mockMutate).toHaveBeenCalledWith(expectedDisabledPayload);

    await user.click(screen.getByRole('button', { name: 'Enable All' }));
    const allEnabled = Object.values(useOverlayStore.getState().enabledApps).every((enabled) => enabled);
    expect(allEnabled).toBe(true);

    const expectedEnabledPayload = overlayAppList.reduce<Record<string, { enabled: boolean }>>((acc, app) => {
      acc[app.id] = { enabled: true };
      return acc;
    }, {});
    expect(mockMutate).toHaveBeenCalledWith(expectedEnabledPayload);
  });
});
