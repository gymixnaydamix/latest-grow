import { gamificationAnalyticsConfig } from './gamification-content/analytics';
import { gamificationQuizzesChallengesConfig } from './gamification-content/quizzes';
import { gamificationRewardsLeaderboardsConfig } from './gamification-content/rewards';
import type { GamificationOverlayContent, ResolvedGamificationPage } from './gamification-content/types';

export type {
  GamificationContentCard,
  GamificationOverlayContent,
  GamificationPageConfig,
  GamificationPrimaryConfig,
  ResolvedGamificationPage,
} from './gamification-content/types';

export const gamificationOverlayContent = {
  app: {
    id: 'gamification',
    label: 'Gamification',
    category: 'Engagement',
    theme: 'from-emerald-500 to-green-600',
    description: 'Quizzes, challenges, rewards, and analytics',
    source: 'src/overlay/overlay-registry.ts',
    defaultEntry: {
      primary: 'quizzes_challenges',
      secondary: 'quiz_builder',
    },
  },
  buildMode: {
    framework: 'vite-react-typescript',
    styling: 'tailwindcss',
    iconSystem: 'lucide-react',
    animation: 'framer-motion',
    charts: 'recharts',
    formEngine: 'react-hook-form + zod',
    dataFetching: '@tanstack/react-query',
    tables: '@tanstack/react-table',
    state: 'zustand',
  },
  globalUiRules: {
    objective:
      'Build a cutting-edge gamification overlay app for real production use. No fake cards, no placeholder charts, no empty metric blocks, no dead buttons, no decorative-only widgets.',
    layout:
      'Use a premium enterprise bento-grid layout. Desktop 12-column grid, tablet 8-column grid, mobile 4-column grid.',
    fitRules: [
      'No unnecessary horizontal scroll in main content.',
      'Cards must fit intelligently and wrap by breakpoint.',
      'No giant white empty areas.',
      'No card should exist without real function, state, or data mapping.',
      'Each page must feel operational, not presentational.',
    ],
    cardLanguage: {
      radius: 'rounded-2xl',
      shadow: 'soft layered shadow, not heavy black shadow',
      border: 'subtle white/10 in dark, zinc/10 in light',
      spacing: 'dense but breathable, 16-24px internal padding',
      surfaceStyle:
        'mix of elevated dark glass, tinted solid panels, metallic green/emerald gradients, neutral support panels',
      interaction:
        'hover lift, pressed state, focus ring, skeleton state, empty state, error state, success toast state',
    },
    visualStyle: {
      lightMode:
        'not plain white; use soft pearl, pale mint, cool graphite, silver-green, emerald tint, muted gold support accents',
      darkMode:
        'not flat black; use carbon, deep graphite, emerald smoke, dark teal tint, green metallic edge glow',
      contentCards:
        'cards should use varied realistic chroma by function, not all-white or all-black cards',
    },
    engineeringRules: [
      'Every card must map to a real route, real action, or real data module.',
      'Every metric card needs data source + loading + empty + error state.',
      'Every builder card needs form schema, validation, draft saving, and publish flow.',
      'Every management card needs filters, pagination or virtualization if needed, and bulk actions when relevant.',
      'Every analytics card needs date range, segmentation, and export action where appropriate.',
    ],
  },
  contentCards: [
    gamificationQuizzesChallengesConfig,
    gamificationRewardsLeaderboardsConfig,
    gamificationAnalyticsConfig,
  ],
  sharedCardComponents: {
    reusableCards: [
      'MetricStrip',
      'AnalyticsCard',
      'BuilderCard',
      'TableCard',
      'QueueCard',
      'LogicCard',
      'HistoryCard',
      'ComparisonCard',
      'AlertCard',
      'ScheduleCard',
      'DesignCard',
      'LedgerCard',
      'LibraryCard',
      'ExecutiveCard',
    ],
    sharedControls: [
      'DateRangePicker',
      'SegmentFilter',
      'StatusTabs',
      'SavedViewsDropdown',
      'ExportButton',
      'RefreshButton',
      'CreateButton',
      'BulkActionBar',
      'SearchInput',
      'KpiPill',
      'SkeletonState',
      'ErrorState',
      'EmptyState',
    ],
  },
  dataContracts: {
    requiredEntities: [
      'Quiz',
      'QuizSection',
      'Question',
      'QuestionOption',
      'Challenge',
      'ChallengeMilestone',
      'Reward',
      'RewardRedemption',
      'Badge',
      'PointRule',
      'PointTransaction',
      'Leaderboard',
      'LeaderboardSeason',
      'EngagementMetric',
      'PerformanceMetric',
      'ProgressRecord',
      'SavedReport',
      'ScheduledExportJob',
      'AuditLog',
    ],
    nonNegotiables: [
      'All cards must map to real entity models.',
      'All list cards need pagination or virtualization.',
      'All builder cards need form validation and autosave.',
      'All analytics cards need query params for date range and segment.',
      'All operational cards need audit trail and permission-aware actions.',
    ],
  },
  deliveryInstructionForAiBuilder: `
Create this Gamification Overlay App as a real Vite + React + TypeScript production module.
Do not generate generic dashboard placeholders.
Every page must have a hero metric strip plus operational content cards.
Every card must have real UI states: loading, success, empty, error, disabled.
Use premium cutting-edge enterprise styling with varied card chroma, not all-white cards.
Implement cards as reusable React components with clean props and strongly typed models.
Use route-based page rendering and config-driven card composition.
`,
} satisfies GamificationOverlayContent;

export const gamificationPrimarySections = gamificationOverlayContent.contentCards;

export const gamificationPages = gamificationPrimarySections.flatMap((section) =>
  section.pages.map((page) => ({
    primaryId: section.primaryNav.id,
    primaryLabel: section.primaryNav.label,
    page,
  })),
);

export const gamificationPagesById = gamificationPages.reduce<Record<string, ResolvedGamificationPage>>((acc, entry) => {
  acc[entry.page.id] = entry;
  return acc;
}, {});

export function getGamificationPageByIds(primaryId: string, secondaryId: string): ResolvedGamificationPage | null {
  const section = gamificationPrimarySections.find((item) => item.primaryNav.id === primaryId);
  if (!section) return null;
  const page = section.pages.find((item) => item.id === secondaryId);
  if (!page) return null;
  return {
    primaryId: section.primaryNav.id,
    primaryLabel: section.primaryNav.label,
    page,
  };
}

export function getGamificationPageByRoute(route: string): ResolvedGamificationPage | null {
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return gamificationPages.find((entry) => entry.page.route === normalizedRoute) ?? null;
}
