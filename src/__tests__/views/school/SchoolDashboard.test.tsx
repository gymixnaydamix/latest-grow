import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../setup/test-utils';
import { SchoolDashboard } from '../../../views/school/SchoolDashboard';
import { useAuthStore } from '../../../store/auth.store';
import { useNavigationStore } from '../../../store/navigation.store';

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

jest.mock('../../../components/features/StatCard', () => ({
  StatCard: ({ label, value }: { label: string; value: number }) => <div>{label}: {value}</div>,
}));

jest.mock('../../../components/features/charts/LineChart', () => ({
  GlowLineChart: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('../../../components/features/charts/PieChart', () => ({
  GlowPieChart: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock('../../../views/school/sections/LeaderSchoolSection', () => ({
  LeaderSchoolSection: () => <div>Leader School Section</div>,
}));

jest.mock('../../../views/shared/sections/ConciergeAISection', () => ({
  ConciergeAISection: () => <div>Concierge AI Section</div>,
}));

jest.mock('../../../views/shared/sections/AccountSection', () => ({
  AccountSection: () => <div>Account Section</div>,
}));

jest.mock('../../../views/school/SchoolAnalyticsView', () => ({
  __esModule: true,
  default: () => <div>School Analytics View</div>,
}));

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    user: null,
    schoolId: 's1',
    schoolMemberships: [],
    isLoading: false,
    error: null,
  });
  useNavigationStore.setState({
    activeSection: 'dashboard',
    activeHeader: 'overview',
    activeSubNav: '',
  });
  mockGet.mockImplementation((path: string) => {
    switch (path) {
      case '/schools/s1/dashboard':
        return Promise.resolve({
          data: [
            { label: 'Total Students', value: 550 },
            { label: 'Total Staff', value: 47 },
            { label: 'Active Courses', value: 34 },
            { label: 'Attendance Rate', value: 95.2 },
          ],
        });
      case '/operations/schools/s1/events':
        return Promise.resolve({ data: [] });
      case '/operations/schools/s1/goals':
        return Promise.resolve({ data: [] });
      case '/academic/schools/s1/announcements?page=1&pageSize=20':
        return Promise.resolve({
          data: {
            items: [
              {
                id: 'an1',
                title: 'Board Meeting Reminder',
                audience: ['STAFF'],
                publishedAt: '2026-03-01T00:00:00.000Z',
              },
            ],
            total: 1,
            page: 1,
            pageSize: 20,
            totalPages: 1,
          },
        });
      default:
        return Promise.reject(new Error(`Unexpected path: ${path}`));
    }
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
  useNavigationStore.setState({
    activeSection: 'dashboard',
    activeHeader: 'overview',
    activeSubNav: '',
  });
});

describe('SchoolDashboard', () => {
  it('renders announcements from the paginated API response without crashing', async () => {
    renderWithProviders(<SchoolDashboard />);

    expect(await screen.findByText('Board Meeting Reminder')).toBeInTheDocument();
    expect(mockGet).toHaveBeenCalledWith('/academic/schools/s1/announcements?page=1&pageSize=20');
    expect(screen.queryByText(/create your first announcement/i)).not.toBeInTheDocument();
  });
});
