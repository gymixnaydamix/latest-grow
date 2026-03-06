import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AddTenantDialog } from '@/views/provider/dialogs/AddTenantDialog';

const mockCreateTenantMutate = jest.fn();
const mockGeocodeMutate = jest.fn();

const createTenantState = {
  mutate: mockCreateTenantMutate,
  isPending: false,
};

const geocodeState = {
  mutate: mockGeocodeMutate,
  isPending: false,
};

jest.mock('@/hooks/api', () => ({
  useCreateTenant: () => createTenantState,
  useGeocodeSchoolAddress: () => geocodeState,
  usePlatformPlans: () => ({
    data: [{ id: 'plan-starter', name: 'Starter', price: 0 }],
  }),
}));

describe('AddTenantDialog', () => {
  beforeEach(() => {
    mockCreateTenantMutate.mockReset();
    mockGeocodeMutate.mockReset();
  });

  it('requires geocoding for school submission and shows map preview on success', async () => {
    const onOpenChange = jest.fn();

    mockGeocodeMutate.mockImplementation((_query: string, options?: { onSuccess?: (data: unknown) => void }) => {
      options?.onSuccess?.({
        latitude: 35.200001,
        longitude: -7.900002,
        displayName: 'Springfield Academy, Main St, Springfield',
        boundingBox: { south: 35.19, north: 35.21, west: -7.92, east: -7.88 },
      });
    });

    render(<AddTenantDialog open onOpenChange={onOpenChange} defaultType="SCHOOL" />);

    fireEvent.change(screen.getByPlaceholderText('e.g. Springfield Academy'), { target: { value: 'Springfield Academy' } });
    fireEvent.change(screen.getByPlaceholderText('admin@school.edu'), { target: { value: 'admin@springfield.edu' } });
    fireEvent.change(screen.getByPlaceholderText('Street, city, state, country'), { target: { value: 'Main St, Springfield' } });

    const submitButton = screen.getByRole('button', { name: 'Add School' });
    expect(submitButton).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Find location' }));

    await waitFor(() => {
      expect(screen.getByTitle('School area map preview')).toBeInTheDocument();
    });

    expect(submitButton).not.toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText('https://www.school.edu'), { target: { value: 'https://springfield.edu' } });
    fireEvent.click(submitButton);

    expect(mockCreateTenantMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Springfield Academy',
        type: 'SCHOOL',
        email: 'admin@springfield.edu',
        address: 'Main St, Springfield',
        website: 'https://springfield.edu',
        latitude: 35.200001,
        longitude: -7.900002,
      }),
      expect.any(Object),
    );
  }, 15000);
});
