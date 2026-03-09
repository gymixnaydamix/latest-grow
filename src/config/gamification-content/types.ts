export type GamificationCardType =
  | 'metric-strip'
  | 'builder-card'
  | 'workspace-card'
  | 'logic-card'
  | 'control-card'
  | 'action-card'
  | 'history-card'
  | 'progress-card'
  | 'reward-card'
  | 'workflow-card'
  | 'analytics-card'
  | 'table-card'
  | 'taxonomy-card'
  | 'moderation-card'
  | 'integration-card'
  | 'gallery-card'
  | 'design-card'
  | 'governance-card'
  | 'catalog-card'
  | 'queue-card'
  | 'finance-card'
  | 'schedule-card'
  | 'distribution-card'
  | 'comparison-card'
  | 'ops-card'
  | 'funnel-card'
  | 'heatmap-card'
  | 'retention-card'
  | 'alert-card'
  | 'journey-card'
  | 'calendar-card'
  | 'library-card'
  | 'executive-card'
  | 'audit-card'
  | 'ledger-card'
  | (string & {});

export interface GamificationContentCard {
  id: string;
  type: GamificationCardType;
  title: string;
  description: string;
  modules?: string[];
  actions?: string[];
  content?: string[];
}

export interface GamificationPageConfig {
  id: string;
  label: string;
  route: string;
  pagePurpose: string;
  heroCards: GamificationContentCard[];
  cards: GamificationContentCard[];
}

export interface GamificationPrimaryConfig {
  primaryNav: {
    id: string;
    label: string;
  };
  pages: GamificationPageConfig[];
}

export interface GamificationOverlayContent {
  app: {
    id: 'gamification';
    label: string;
    category: string;
    theme: string;
    description: string;
    source: string;
    defaultEntry: {
      primary: string;
      secondary: string;
    };
  };
  buildMode: Record<string, string>;
  globalUiRules: {
    objective: string;
    layout: string;
    fitRules: string[];
    cardLanguage: Record<string, string>;
    visualStyle: Record<string, string>;
    engineeringRules: string[];
  };
  contentCards: GamificationPrimaryConfig[];
  sharedCardComponents: {
    reusableCards: string[];
    sharedControls: string[];
  };
  dataContracts: {
    requiredEntities: string[];
    nonNegotiables: string[];
  };
  deliveryInstructionForAiBuilder: string;
}

export interface ResolvedGamificationPage {
  primaryId: string;
  primaryLabel: string;
  page: GamificationPageConfig;
}
