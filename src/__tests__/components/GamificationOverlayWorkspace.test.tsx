import { render, screen } from '@testing-library/react';
import type { GamificationPagePayload } from '@root/types';
import GamificationOverlayWorkspace from '@/components/overlay/gamification/GamificationOverlayWorkspace';

const mockedHooks = jest.fn();

jest.mock('recharts', () => ({
  ResponsiveContainer: () => <div />,
  AreaChart: () => <div />,
  Area: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

jest.mock('@/hooks/api/use-gamification', () => ({
  useGamificationBootstrap: () => ({
    data: {
      defaultPrimary: 'quizzes_challenges',
      defaultSecondary: 'quiz_builder',
      allowedRoles: ['PROVIDER', 'ADMIN', 'SCHOOL'],
      capabilities: {
        canEdit: true,
        canPublish: true,
        canRollback: true,
        canExport: true,
        canBulkManage: true,
      },
    },
  }),
  useGamificationPage: (...args: unknown[]) => mockedHooks(...args),
  usePublishGamificationPage: () => ({ isPending: false, mutateAsync: jest.fn().mockResolvedValue({ message: 'Published' }) }),
  useRollbackGamificationPage: () => ({ isPending: false, mutateAsync: jest.fn().mockResolvedValue({ message: 'Rolled back' }) }),
  useExportGamificationPage: () => ({ isPending: false, mutateAsync: jest.fn().mockResolvedValue({ message: 'Exported' }) }),
  useRunGamificationAction: () => ({ isPending: false, mutateAsync: jest.fn().mockResolvedValue({ message: 'Action complete' }) }),
  useSaveGamificationDraft: () => ({ mutateAsync: jest.fn().mockResolvedValue({}), isPending: false }),
}));

function buildPagePayload(pageId: string, title: string): GamificationPagePayload {
  return {
    pageId,
    route: `/gamification/${pageId}`,
    title,
    pagePurpose: `${title} purpose`,
    lastUpdatedAt: '2026-03-08T10:00:00.000Z',
    heroMetrics: [
      { id: `${pageId}_1`, label: 'Metric A', value: '12', trend: '+3.2%', detail: 'all • 30d' },
      { id: `${pageId}_2`, label: 'Metric B', value: '84%', trend: '+1.2%', detail: 'all • 30d' },
    ],
    draft: {
      title,
      summary: `${title} summary`,
      segment: 'all',
      status: 'Draft',
      scheduleStart: '2026-03-10T09:00',
      scheduleEnd: '2026-03-12T17:00',
      owner: 'Admin',
      notes: 'Operational notes',
      automationEnabled: true,
    },
    capabilities: {
      canEdit: true,
      canPublish: true,
      canRollback: true,
      canExport: true,
      canBulkManage: true,
    },
    cards: [
      { cardId: 'quiz_structure_canvas', notes: ['builder note'], stat: 'Configured' },
      { cardId: 'question_composer', tags: ['live', 'typed'], stat: '2' },
      { cardId: 'reward_catalog_manager', table: { columns: [{ id: 'name', label: 'Name' }], rows: [{ id: 'r1', name: 'Reward A' }] }, stat: '8' },
      { cardId: 'reward_performance_card', series: [{ label: 'Mon', value: 4 }], stat: '84%' },
      { cardId: 'engagement_trend_card', series: [{ label: 'Mon', value: 4 }], stat: '89%' },
      { cardId: 'anomaly_alerts_card', queue: [{ id: 'a1', title: 'Alert', subtitle: 'subtitle', status: 'Review', meta: '1h ago' }], stat: '1' },
    ],
    versions: [{ id: 'v1', label: 'Version 1', summary: 'summary', author: 'Admin', createdAt: '2026-03-07T12:00:00.000Z' }],
    auditTrail: [{ id: 'audit1', actor: 'Admin', action: 'Viewed', detail: `${title} opened`, timestamp: '2026-03-08T11:00:00.000Z' }],
  };
}

describe('GamificationOverlayWorkspace', () => {
  beforeEach(() => {
    mockedHooks.mockReset();
  });

  it('renders quiz builder workspace from config', () => {
    mockedHooks.mockReturnValue({ data: buildPagePayload('quiz_builder', 'Quiz Builder'), isLoading: false, error: null, refetch: jest.fn() });

    render(
      <GamificationOverlayWorkspace
        appId="gamification"
        appLabel="Gamification"
        primaryId="quizzes_challenges"
        primaryLabel="Quizzes & Challenges"
        secondaryId="quiz_builder"
        secondaryLabel="Quiz Builder"
      />,
    );

    expect(screen.getAllByText('Quiz Builder')[0]).toBeInTheDocument();
    expect(screen.getByText('Quiz Structure Canvas')).toBeInTheDocument();
  });

  it('renders reward system workspace from config', () => {
    mockedHooks.mockReturnValue({ data: buildPagePayload('reward_system', 'Reward System'), isLoading: false, error: null, refetch: jest.fn() });

    render(
      <GamificationOverlayWorkspace
        appId="gamification"
        appLabel="Gamification"
        primaryId="rewards_leaderboards"
        primaryLabel="Rewards & Leaderboards"
        secondaryId="reward_system"
        secondaryLabel="Reward System"
      />,
    );

    expect(screen.getAllByText('Reward System')[0]).toBeInTheDocument();
    expect(screen.getByText('Reward Catalog Manager')).toBeInTheDocument();
  });

  it('renders engagement analytics workspace from config', () => {
    mockedHooks.mockReturnValue({ data: buildPagePayload('engagement_metrics', 'Engagement Metrics'), isLoading: false, error: null, refetch: jest.fn() });

    render(
      <GamificationOverlayWorkspace
        appId="gamification"
        appLabel="Gamification"
        primaryId="analytics"
        primaryLabel="Analytics"
        secondaryId="engagement_metrics"
        secondaryLabel="Engagement Metrics"
      />,
    );

    expect(screen.getAllByText('Engagement Metrics')[0]).toBeInTheDocument();
    expect(screen.getByText('Engagement Trends')).toBeInTheDocument();
  });
});
