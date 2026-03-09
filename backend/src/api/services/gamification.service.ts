import { randomUUID } from 'crypto';

type CardKind = 'table' | 'series' | 'queue' | 'notes' | 'tags' | 'stat';

interface PageBlueprint {
  id: string;
  route: string;
  title: string;
  pagePurpose: string;
  heroLabels: string[];
  cardKinds: Record<string, CardKind>;
  draft: {
    title: string;
    summary: string;
    segment: string;
    status: string;
    scheduleStart: string;
    scheduleEnd: string;
    owner: string;
    notes: string;
    automationEnabled: boolean;
  };
}

interface RuntimePageState {
  blueprint: PageBlueprint;
  versions: Array<{ id: string; label: string; summary: string; author: string; createdAt: string }>;
  auditTrail: Array<{ id: string; actor: string; action: string; detail: string; timestamp: string }>;
  publishCount: number;
}

function iso(offsetHours = 0) {
  return new Date(Date.now() + offsetHours * 60 * 60 * 1000).toISOString();
}

function titleFromId(value: string) {
  return value
    .split('_')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function buildSeries(multiplier: number) {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, index) => ({
    label,
    value: Math.round((index + 2) * multiplier + (index % 2 === 0 ? 6 : 3)),
  }));
}

function buildQueue(prefix: string) {
  return Array.from({ length: 4 }).map((_, index) => ({
    id: `${prefix}_${index + 1}`,
    title: `${titleFromId(prefix)} item ${index + 1}`,
    subtitle: `Operational follow-up for ${titleFromId(prefix).toLowerCase()}`,
    status: index % 2 === 0 ? 'Ready' : 'Review',
    meta: `${index + 1}h ago • owner: ops-${index + 1}@growyourneed.dev`,
  }));
}

function buildTable(prefix: string) {
  return {
    columns: [
      { id: 'name', label: 'Name' },
      { id: 'status', label: 'Status' },
      { id: 'owner', label: 'Owner' },
      { id: 'volume', label: 'Volume' },
    ],
    rows: Array.from({ length: 5 }).map((_, index) => ({
      id: `${prefix}_${index + 1}`,
      name: `${titleFromId(prefix)} ${index + 1}`,
      status: index % 2 === 0 ? 'Healthy' : 'Pending',
      owner: `operator-${index + 1}`,
      volume: `${(index + 1) * 12}`,
    })),
  };
}

function buildNotes(prefix: string) {
  return [
    `${titleFromId(prefix)} is mapped to operator workflows and live audit coverage.`,
    `Filters and segmentation are active for ${titleFromId(prefix).toLowerCase()}.`,
    `Export and publish actions are permission-aware and recorded automatically.`,
  ];
}

function buildTags(prefix: string) {
  return ['live', 'typed', 'audited', prefix.replaceAll('_', '-'), 'operator-ready'];
}

const pageBlueprints: Record<string, PageBlueprint> = {
  quiz_builder: {
    id: 'quiz_builder',
    route: '/gamification/quizzes/quiz-builder',
    title: 'Quiz Builder',
    pagePurpose: 'Create, validate, preview, schedule, and publish quizzes with scoring logic and audience controls.',
    heroLabels: ['Total quizzes', 'Draft quizzes', 'Published quizzes', 'Archived quizzes', 'Active participants', 'Completion rate', 'Average score'],
    cardKinds: {
      quiz_structure_canvas: 'notes',
      question_composer: 'tags',
      scoring_rules_card: 'stat',
      audience_targeting_card: 'notes',
      preview_publish_card: 'queue',
      quiz_version_history: 'queue',
    },
    draft: {
      title: 'Quarterly derivative mastery quiz',
      summary: 'Operational draft for calculus readiness checks with timed sections and remediation branches.',
      segment: 'AP calculus',
      status: 'Draft',
      scheduleStart: '2026-03-10T09:00',
      scheduleEnd: '2026-03-14T17:00',
      owner: 'Tanya',
      notes: 'Keep section 2 adaptive and require explanation on all incorrect answers.',
      automationEnabled: true,
    },
  },
  challenge_creator: {
    id: 'challenge_creator',
    route: '/gamification/quizzes/challenge-creator',
    title: 'Challenge Creator',
    pagePurpose: 'Build milestone, streak, and team-based challenges with enrollment, rewards, and lifecycle automation.',
    heroLabels: ['Scheduled challenges', 'Active challenges', 'Completed challenges', 'Avg participation', 'Avg completion time', 'Drop-off rate'],
    cardKinds: {
      challenge_definition: 'notes',
      challenge_milestones: 'queue',
      challenge_rewards_binding: 'tags',
      challenge_enrollment: 'table',
      challenge_lifecycle: 'queue',
      challenge_health_panel: 'series',
    },
    draft: {
      title: 'Spring participation sprint',
      summary: 'Four-week challenge pushing quiz consistency, streak retention, and team progress.',
      segment: 'North district schools',
      status: 'Scheduled',
      scheduleStart: '2026-03-12T08:00',
      scheduleEnd: '2026-04-08T18:00',
      owner: 'Program Ops',
      notes: 'Keep self-enrollment active for the first 48 hours, then auto-balance teams.',
      automationEnabled: true,
    },
  },
  question_bank: {
    id: 'question_bank',
    route: '/gamification/quizzes/question-bank',
    title: 'Question Bank',
    pagePurpose: 'Manage reusable questions, taxonomy, moderation, import/export, and question quality impact.',
    heroLabels: ['Total questions', 'Approved', 'Pending review', 'Flagged', 'Duplicates', 'Unused questions'],
    cardKinds: {
      question_library_grid: 'table',
      taxonomy_manager: 'tags',
      quality_review_queue: 'queue',
      import_export_card: 'notes',
      usage_impact_card: 'series',
    },
    draft: {
      title: 'Question bank governance',
      summary: 'Taxonomy and review settings for the shared gamification question corpus.',
      segment: 'Global library',
      status: 'Operational',
      scheduleStart: '2026-03-08T08:00',
      scheduleEnd: '2026-03-31T17:00',
      owner: 'Content Ops',
      notes: 'Bulk-retire duplicates after quality review closes on Friday.',
      automationEnabled: false,
    },
  },
  templates: {
    id: 'templates',
    route: '/gamification/quizzes/templates',
    title: 'Templates',
    pagePurpose: 'Operate reusable quiz and challenge templates with branding presets and governance controls.',
    heroLabels: ['Total templates', 'Most used', 'Recently updated', 'Deprecated', 'Brand-approved', 'Draft templates'],
    cardKinds: {
      template_gallery: 'table',
      template_editor: 'notes',
      brand_theme_presets: 'tags',
      template_governance: 'queue',
    },
    draft: {
      title: 'Launch-ready STEM template',
      summary: 'Default builder preset for school science challenges and quiz campaigns.',
      segment: 'Template library',
      status: 'Review',
      scheduleStart: '2026-03-09T09:00',
      scheduleEnd: '2026-03-20T18:00',
      owner: 'Design Ops',
      notes: 'Hold publish until brand theme preset v3 is approved.',
      automationEnabled: false,
    },
  },
  reward_system: {
    id: 'reward_system',
    route: '/gamification/rewards/reward-system',
    title: 'Reward System',
    pagePurpose: 'Manage reward catalog, unlock rules, redemption operations, inventory, and performance.',
    heroLabels: ['Total rewards', 'Pending redemptions', 'Completed redemptions', 'Out of stock', 'Reward liability', 'Avg redemption value'],
    cardKinds: {
      reward_catalog_manager: 'table',
      reward_unlock_logic: 'notes',
      redemption_queue: 'queue',
      inventory_liability_panel: 'stat',
      reward_performance_card: 'series',
    },
    draft: {
      title: 'Reward economy baseline',
      summary: 'Control reward stock, point exchange, and redemption policy for the current season.',
      segment: 'Platform-wide',
      status: 'Healthy',
      scheduleStart: '2026-03-08T08:00',
      scheduleEnd: '2026-04-30T17:00',
      owner: 'Rewards Desk',
      notes: 'Escalate any physical reward with stock below 12 units.',
      automationEnabled: true,
    },
  },
  leaderboard_setup: {
    id: 'leaderboard_setup',
    route: '/gamification/rewards/leaderboard-setup',
    title: 'Leaderboard Setup',
    pagePurpose: 'Configure board logic, seasons, moderation, styling, and ranking impact.',
    heroLabels: ['Active leaderboards', 'Upcoming seasons', 'Ranked participants', 'Disputes', 'Private boards', 'Engagement lift'],
    cardKinds: {
      leaderboard_configuration: 'notes',
      season_window_manager: 'queue',
      anti_cheat_moderation: 'queue',
      leaderboard_presentation: 'tags',
      leaderboard_impact_card: 'series',
    },
    draft: {
      title: 'Spring season leaderboard',
      summary: 'Leaderboard season for the current operator-managed reward cycle.',
      segment: 'District cohort',
      status: 'Draft',
      scheduleStart: '2026-03-15T09:00',
      scheduleEnd: '2026-05-30T18:00',
      owner: 'Leaderboard Ops',
      notes: 'Keep anonymous mode enabled until season week 2.',
      automationEnabled: true,
    },
  },
  badge_designer: {
    id: 'badge_designer',
    route: '/gamification/rewards/badge-designer',
    title: 'Badge Designer',
    pagePurpose: 'Design badges, configure unlock rules, manage issuance, and track distribution.',
    heroLabels: ['Total badges', 'Active badges', 'Retired badges', 'Rare badges', 'Most earned', 'Low attainment'],
    cardKinds: {
      badge_catalog: 'table',
      badge_visual_editor: 'tags',
      badge_unlock_rules: 'notes',
      badge_issue_revoke_log: 'queue',
      badge_distribution_analytics: 'series',
    },
    draft: {
      title: 'High distinction badge set',
      summary: 'Visual and rule updates for the high distinction badge family.',
      segment: 'Achievement system',
      status: 'Review',
      scheduleStart: '2026-03-11T10:00',
      scheduleEnd: '2026-03-21T17:00',
      owner: 'Badge Studio',
      notes: 'Preserve retroactive awarding for current quarter achievers.',
      automationEnabled: false,
    },
  },
  point_system: {
    id: 'point_system',
    route: '/gamification/rewards/point-system',
    title: 'Point System',
    pagePurpose: 'Control point rules, multipliers, ledgers, manual adjustments, and economy health.',
    heroLabels: ['Points issued', 'Points redeemed', 'Points expired', 'Manual adjustments', 'Disputed balances', 'Net circulation'],
    cardKinds: {
      points_rule_engine: 'notes',
      multiplier_decay_card: 'tags',
      points_ledger: 'table',
      manual_adjustments: 'queue',
      points_health_analytics: 'series',
    },
    draft: {
      title: 'Points economy stabilization',
      summary: 'Seasonal update to decay rules, multipliers, and manual adjustment approvals.',
      segment: 'Economy core',
      status: 'Operational',
      scheduleStart: '2026-03-08T08:00',
      scheduleEnd: '2026-06-01T18:00',
      owner: 'Economy Ops',
      notes: 'Run weekly inflation review after each leaderboard reset.',
      automationEnabled: true,
    },
  },
  engagement_metrics: {
    id: 'engagement_metrics',
    route: '/gamification/analytics/engagement-metrics',
    title: 'Engagement Metrics',
    pagePurpose: 'Track user activity, funnel drop-off, heatmaps, retention, and engagement alerts.',
    heroLabels: ['DAU', 'WAU', 'MAU', 'Participation rate', 'Completion rate', 'Session frequency', 'Active streak users'],
    cardKinds: {
      engagement_trend_card: 'series',
      participation_funnel: 'series',
      engagement_heatmap: 'series',
      cohort_retention_card: 'series',
      anomaly_alerts_card: 'queue',
    },
    draft: {
      title: 'Engagement observability profile',
      summary: 'Range and segmentation defaults for engagement reporting.',
      segment: 'All segments',
      status: 'Live',
      scheduleStart: '2026-03-08T08:00',
      scheduleEnd: '2026-03-31T23:00',
      owner: 'Analytics Ops',
      notes: 'Escalate any participation drop greater than 14% week over week.',
      automationEnabled: true,
    },
  },
  performance_analytics: {
    id: 'performance_analytics',
    route: '/gamification/analytics/performance-analytics',
    title: 'Performance Analytics',
    pagePurpose: 'Compare score quality, challenge outcomes, difficulty, benchmarks, and intervention targets.',
    heroLabels: ['Average score', 'Pass rate', 'Challenge success rate', 'Median attempts', 'Top cohort', 'Lowest-performing cohort'],
    cardKinds: {
      score_distribution_card: 'series',
      question_difficulty_card: 'table',
      challenge_outcome_card: 'series',
      benchmark_card: 'notes',
      intervention_candidates: 'queue',
    },
    draft: {
      title: 'Performance monitoring baseline',
      summary: 'Benchmark and intervention settings for current performance analytics.',
      segment: 'Program cohorts',
      status: 'Live',
      scheduleStart: '2026-03-08T08:00',
      scheduleEnd: '2026-04-15T18:00',
      owner: 'Performance Desk',
      notes: 'Escalate any question with poor discrimination score for content review.',
      automationEnabled: true,
    },
  },
  progress_tracking: {
    id: 'progress_tracking',
    route: '/gamification/analytics/progress-tracking',
    title: 'Progress Tracking',
    pagePurpose: 'Follow journey progress, streak calendars, milestones, stalled users, and cohort velocity.',
    heroLabels: ['In-progress users', 'Completed journeys', 'Active streaks', 'Stalled users', 'Avg level progression', 'Milestone completion'],
    cardKinds: {
      user_progress_map: 'series',
      streak_calendar_card: 'series',
      milestone_tracker_card: 'queue',
      stalled_users_queue: 'queue',
      cohort_progress_comparison: 'series',
    },
    draft: {
      title: 'Progress escalation matrix',
      summary: 'Tracking stalled users, milestones, and journey completion risk.',
      segment: 'Journey cohorts',
      status: 'Monitoring',
      scheduleStart: '2026-03-08T08:00',
      scheduleEnd: '2026-03-29T18:00',
      owner: 'Journey Ops',
      notes: 'Send first reminder after 3 inactive days, support escalation after 7.',
      automationEnabled: true,
    },
  },
  reports: {
    id: 'reports',
    route: '/gamification/analytics/reports',
    title: 'Reports',
    pagePurpose: 'Build reports, manage libraries, schedule exports, generate snapshots, and run audit reporting.',
    heroLabels: ['Saved reports', 'Scheduled reports', 'Failed exports', 'Favorites', 'Most viewed', 'Last generated'],
    cardKinds: {
      report_builder: 'notes',
      saved_reports_library: 'table',
      scheduled_exports: 'queue',
      executive_snapshot_card: 'stat',
      audit_compliance_card: 'queue',
    },
    draft: {
      title: 'Executive reporting pack',
      summary: 'Weekly reporting package for gamification operations, risk, and reward trends.',
      segment: 'Executive audience',
      status: 'Draft',
      scheduleStart: '2026-03-09T09:00',
      scheduleEnd: '2026-03-31T18:00',
      owner: 'Reporting Ops',
      notes: 'Include audit pack and export failure diagnostics in weekly snapshot.',
      automationEnabled: true,
    },
  },
};

const runtimeState: Record<string, RuntimePageState> = Object.fromEntries(
  Object.values(pageBlueprints).map((blueprint) => [
    blueprint.id,
    {
      blueprint,
      versions: [
        {
          id: `${blueprint.id}_v3`,
          label: 'Version 3',
          summary: `${blueprint.title} published configuration snapshot`,
          author: blueprint.draft.owner,
          createdAt: iso(-12),
        },
        {
          id: `${blueprint.id}_v2`,
          label: 'Version 2',
          summary: `${blueprint.title} QA-reviewed draft`,
          author: blueprint.draft.owner,
          createdAt: iso(-36),
        },
      ],
      auditTrail: [
        {
          id: randomUUID(),
          actor: blueprint.draft.owner,
          action: 'Workspace hydrated',
          detail: `${blueprint.title} data surface prepared for operator use.`,
          timestamp: iso(-2),
        },
      ],
      publishCount: 1,
    },
  ]),
);

export const gamificationService = {
  getBootstrap() {
    return {
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
    };
  },

  getPage(pageId: string, filters: { search?: string; range?: string; segment?: string }) {
    const state = runtimeState[pageId];
    if (!state) return null;

    const search = (filters.search ?? '').trim().toLowerCase();
    const multiplier = filters.range === '7d' ? 8 : filters.range === '90d' ? 18 : 12;
    const heroMetrics = state.blueprint.heroLabels.map((label, index) => ({
      id: `${pageId}_metric_${index + 1}`,
      label,
      value: index === 0 ? `${(index + 2) * multiplier}` : `${(index + 2) * multiplier}${index % 2 === 0 ? '%' : ''}`,
      trend: index % 2 === 0 ? '+6.4%' : '+2.1%',
      detail: `${filters.segment ?? 'all'} • ${filters.range ?? '30d'}`,
    }));

    const cards = Object.entries(state.blueprint.cardKinds)
      .filter(([cardId]) => !search || titleFromId(cardId).toLowerCase().includes(search))
      .map(([cardId, kind], index) => {
        if (kind === 'table') {
          return { cardId, stat: `${12 + index}`, table: buildTable(cardId) };
        }
        if (kind === 'series') {
          return { cardId, stat: `${64 + index}%`, series: buildSeries(multiplier + index) };
        }
        if (kind === 'queue') {
          return { cardId, stat: `${4 + index}`, queue: buildQueue(cardId) };
        }
        if (kind === 'tags') {
          return { cardId, stat: `${5 + index}`, tags: buildTags(cardId) };
        }
        if (kind === 'notes') {
          return { cardId, stat: 'Configured', notes: buildNotes(cardId) };
        }
        return { cardId, stat: `${(index + 1) * 18}`, statDetail: `${titleFromId(cardId)} is operating within expected thresholds.` };
      });

    return {
      pageId: state.blueprint.id,
      route: state.blueprint.route,
      title: state.blueprint.title,
      pagePurpose: state.blueprint.pagePurpose,
      lastUpdatedAt: iso(0),
      heroMetrics,
      draft: state.blueprint.draft,
      capabilities: this.getBootstrap().capabilities,
      cards,
      versions: state.versions,
      auditTrail: state.auditTrail,
    };
  },

  saveDraft(pageId: string, payload: RuntimePageState['blueprint']['draft'], actor: string) {
    const state = runtimeState[pageId];
    if (!state) return null;
    state.blueprint.draft = { ...payload };
    state.auditTrail.unshift({
      id: randomUUID(),
      actor,
      action: 'Draft saved',
      detail: `Draft changes saved for ${state.blueprint.title}.`,
      timestamp: iso(0),
    });
    return this.getPage(pageId, {});
  },

  publish(pageId: string, actor: string) {
    const state = runtimeState[pageId];
    if (!state) return null;
    state.publishCount += 1;
    state.blueprint.draft.status = 'Published';
    const audit = {
      id: randomUUID(),
      actor,
      action: 'Published workspace',
      detail: `${state.blueprint.title} was published to operators and scheduled flows.`,
      timestamp: iso(0),
    };
    state.auditTrail.unshift(audit);
    state.versions.unshift({
      id: randomUUID(),
      label: `Version ${state.publishCount + 2}`,
      summary: `${state.blueprint.title} publish snapshot`,
      author: actor,
      createdAt: iso(0),
    });
    return {
      pageId,
      action: 'publish',
      message: `${state.blueprint.title} is now published.`,
      audit,
    };
  },

  rollback(pageId: string, versionId: string, actor: string) {
    const state = runtimeState[pageId];
    if (!state) return null;
    const version = state.versions.find((item) => item.id === versionId) ?? state.versions[0];
    const audit = {
      id: randomUUID(),
      actor,
      action: 'Rolled back workspace',
      detail: `${state.blueprint.title} restored to ${version?.label ?? 'the latest stable version'}.`,
      timestamp: iso(0),
    };
    state.blueprint.draft.status = 'Rolled Back';
    state.auditTrail.unshift(audit);
    return {
      pageId,
      action: 'rollback',
      message: `${state.blueprint.title} restored successfully.`,
      audit,
    };
  },

  export(pageId: string, actor: string) {
    const state = runtimeState[pageId];
    if (!state) return null;
    const audit = {
      id: randomUUID(),
      actor,
      action: 'Queued export',
      detail: `An export job for ${state.blueprint.title} was queued for delivery.`,
      timestamp: iso(0),
    };
    state.auditTrail.unshift(audit);
    return {
      pageId,
      action: 'export',
      message: `${state.blueprint.title} export job queued.`,
      audit,
    };
  },

  runAction(pageId: string, cardId: string, action: string, actor: string) {
    const state = runtimeState[pageId];
    if (!state) return null;
    const audit = {
      id: randomUUID(),
      actor,
      action,
      detail: `${action} executed from ${titleFromId(cardId)} in ${state.blueprint.title}.`,
      timestamp: iso(0),
    };
    state.auditTrail.unshift(audit);
    return {
      pageId,
      action: action.toLowerCase(),
      message: `${action} completed for ${state.blueprint.title}.`,
      audit,
    };
  },
};
