import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../setup/test-utils';
import { AnnouncementsPage } from '../../../views/shared/AnnouncementsPage';
import { useAuthStore } from '../../../store/auth.store';

jest.mock('../../../api/client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    del: jest.fn(),
    clearCsrf: jest.fn(),
    setUnauthorizedHandler: jest.fn(),
  },
}));

const { api } = jest.requireMock('../../../api/client') as {
  api: {
    get: jest.Mock;
    post: jest.Mock;
    patch: jest.Mock;
    del: jest.Mock;
    clearCsrf: jest.Mock;
    setUnauthorizedHandler: jest.Mock;
  };
};
const mockGet = api.get;

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    schoolId: 's1',
    schoolMemberships: [],
    isLoading: false,
    error: null,
  });
  mockGet.mockResolvedValue({
    data: {
      items: [
        {
          id: 'an1',
          title: 'PTA Meeting',
          body: 'Join the PTA in the auditorium.',
          audience: ['STAFF'],
          publishedAt: '2026-03-05T00:00:00.000Z',
          author: { firstName: 'Alex', lastName: 'Stone' },
        },
        {
          id: 'an2',
          title: 'Exam Schedule',
          body: 'Midterm exam schedule is now available.',
          audience: ['STUDENTS'],
          publishedAt: '2026-03-06T00:00:00.000Z',
          author: { firstName: 'Sam', lastName: 'Lee' },
        },
      ],
      total: 2,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    },
  });
});

afterEach(() => {
  useAuthStore.setState({
    user: null,
    schoolId: null,
    schoolMemberships: [],
    isLoading: false,
    error: null,
  });
});

describe('AnnouncementsPage', () => {
  it('filters the normalized announcements list by search text', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AnnouncementsPage />);

    expect(await screen.findByText('PTA Meeting')).toBeInTheDocument();
    expect(screen.getByText('Exam Schedule')).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('/academic/schools/s1/announcements?page=1&pageSize=20');

    await user.type(screen.getByPlaceholderText(/search announcements/i), 'PTA');

    expect(screen.getByText('PTA Meeting')).toBeInTheDocument();
    expect(screen.queryByText('Exam Schedule')).not.toBeInTheDocument();
  });
});
