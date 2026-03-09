import type { GamificationPrimaryConfig } from './types';

export const gamificationRewardsLeaderboardsConfig: GamificationPrimaryConfig = {
  primaryNav: {
    id: 'rewards_leaderboards',
    label: 'Rewards & Leaderboards',
  },
  pages: [
    {
      id: 'reward_system',
      label: 'Reward System',
      route: '/gamification/rewards/reward-system',
      pagePurpose:
        'Manage the complete reward economy including catalog, inventory, redemption, and reward rules.',
      heroCards: [
        {
          id: 'reward_economy_overview',
          type: 'metric-strip',
          title: 'Reward Economy Overview',
          description:
            'Show catalog size, redemptions, pending approvals, out-of-stock rewards, liability, and average redemption value.',
          content: [
            'Total rewards',
            'Pending redemptions',
            'Completed redemptions',
            'Out of stock',
            'Reward liability',
            'Avg redemption value',
          ],
          actions: ['Add Reward', 'Review Queue'],
        },
      ],
      cards: [
        {
          id: 'reward_catalog_manager',
          type: 'catalog-card',
          title: 'Reward Catalog Manager',
          description:
            'Manage digital, physical, experiential, coupon, unlockable, and status-based rewards.',
          modules: [
            'Reward type selector',
            'Availability rules',
            'Inventory fields',
            'Cost in points',
            'Category and tags',
          ],
          actions: ['Create Reward', 'Duplicate', 'Disable'],
        },
        {
          id: 'reward_unlock_logic',
          type: 'logic-card',
          title: 'Unlock Logic & Eligibility',
          description:
            'Define who can see, unlock, and redeem rewards based on points, level, badge, cohort, or challenge outcome.',
          modules: [
            'Point threshold logic',
            'Badge-gated rewards',
            'Cohort restrictions',
            'Time-limited unlock windows',
          ],
          actions: ['Attach Rule', 'Simulate Eligibility'],
        },
        {
          id: 'redemption_queue',
          type: 'queue-card',
          title: 'Redemption Queue',
          description:
            'Operational queue for pending, approved, fulfilled, rejected, refunded, and escalated redemptions.',
          modules: [
            'Queue filter tabs',
            'Fulfillment state',
            'Approver assignment',
            'Delivery notes',
            'Refund handling',
          ],
          actions: ['Approve', 'Reject', 'Fulfill', 'Refund'],
        },
        {
          id: 'inventory_liability_panel',
          type: 'finance-card',
          title: 'Inventory & Liability',
          description:
            'Track stock, reward issuance cost, projected liability, and budget allocation for rewards.',
          modules: ['Stock levels', 'Cost tracking', 'Budget buckets', 'Liability trend'],
          actions: ['Adjust Stock', 'Export Ledger'],
        },
        {
          id: 'reward_performance_card',
          type: 'analytics-card',
          title: 'Reward Performance',
          description:
            'Analyze most redeemed rewards, underused rewards, conversion impact, and retention effect.',
          modules: ['Redemption heatmap', 'Popularity ranking', 'Retention correlation', 'Cohort split'],
          actions: ['Open Detail Report', 'Retire Reward'],
        },
      ],
    },
    {
      id: 'leaderboard_setup',
      label: 'Leaderboard Setup',
      route: '/gamification/rewards/leaderboard-setup',
      pagePurpose:
        'Configure ranking logic, audience visibility, seasons, anti-cheat rules, and leaderboard presentation.',
      heroCards: [
        {
          id: 'leaderboard_ops_overview',
          type: 'metric-strip',
          title: 'Leaderboard Operations',
          description:
            'Show active boards, upcoming seasons, participants ranked, disputes, hidden boards, and average engagement lift.',
          content: [
            'Active leaderboards',
            'Upcoming seasons',
            'Ranked participants',
            'Disputes',
            'Private boards',
            'Engagement lift',
          ],
          actions: ['New Leaderboard', 'Start Season'],
        },
      ],
      cards: [
        {
          id: 'leaderboard_configuration',
          type: 'builder-card',
          title: 'Leaderboard Configuration',
          description:
            'Define leaderboard name, audience, point source, ranking type, tie-break logic, and refresh cadence.',
          modules: [
            'Board metadata',
            'Ranking metric selector',
            'Tie-break logic',
            'Visibility mode',
            'Refresh schedule',
          ],
          actions: ['Create Board', 'Save Draft'],
        },
        {
          id: 'season_window_manager',
          type: 'schedule-card',
          title: 'Season & Time Windows',
          description:
            'Set rolling periods, weekly/monthly seasons, freeze windows, and reset strategies.',
          modules: ['Season scheduler', 'Reset policy', 'Freeze window', 'Carry-over rules'],
          actions: ['Launch Season', 'Reset Board'],
        },
        {
          id: 'anti_cheat_moderation',
          type: 'moderation-card',
          title: 'Anti-Cheat & Moderation',
          description:
            'Flag suspicious scoring spikes, duplicate attempts, exploit behavior, and manual score reviews.',
          modules: ['Anomaly flag queue', 'Dispute resolution', 'Manual score override', 'Audit log'],
          actions: ['Flag User', 'Adjust Score', 'Resolve Dispute'],
        },
        {
          id: 'leaderboard_presentation',
          type: 'design-card',
          title: 'Presentation & Visibility',
          description:
            'Control public/private visibility, top-N display, anonymous mode, team vs individual display, and board styling.',
          modules: ['Public visibility toggle', 'Anonymous ranking mode', 'Top-N settings', 'Board skin selector'],
          actions: ['Preview Leaderboard', 'Apply Style'],
        },
        {
          id: 'leaderboard_impact_card',
          type: 'analytics-card',
          title: 'Leaderboard Impact',
          description:
            'Measure participation lift, session frequency, challenge completion effect, and churn risk after ranking exposure.',
          modules: ['Engagement delta', 'Behavior comparison', 'Cohort impact view', 'Retention link'],
          actions: ['Open Insight Report'],
        },
      ],
    },
    {
      id: 'badge_designer',
      label: 'Badge Designer',
      route: '/gamification/rewards/badge-designer',
      pagePurpose:
        'Create and manage badge assets, rarity systems, unlock logic, and issuance history.',
      heroCards: [
        {
          id: 'badge_system_summary',
          type: 'metric-strip',
          title: 'Badge System Summary',
          description:
            'Show total badges, active, retired, rare, most earned, and most aspirational badges.',
          content: [
            'Total badges',
            'Active badges',
            'Retired badges',
            'Rare badges',
            'Most earned',
            'Low attainment badges',
          ],
          actions: ['Create Badge', 'View Issuance'],
        },
      ],
      cards: [
        {
          id: 'badge_catalog',
          type: 'gallery-card',
          title: 'Badge Catalog',
          description:
            'Gallery of all badges with rarity, category, earn rate, and active status.',
          modules: ['Rarity filters', 'Category view', 'Active/inactive status', 'Earn-rate overlay'],
          actions: ['Edit Badge', 'Retire Badge', 'Duplicate'],
        },
        {
          id: 'badge_visual_editor',
          type: 'design-card',
          title: 'Badge Visual Editor',
          description:
            'Design badge name, icon, border, rarity frame, glow treatment, and descriptive copy.',
          modules: [
            'Icon selector/upload',
            'Shape frame settings',
            'Color and gradient controls',
            'Rarity treatment',
            'Badge preview',
          ],
          actions: ['Save Design', 'Preview Variants'],
        },
        {
          id: 'badge_unlock_rules',
          type: 'logic-card',
          title: 'Badge Unlock Rules',
          description:
            'Assign rule-based conditions using score thresholds, streaks, challenge completion, or hidden criteria.',
          modules: ['Threshold rule builder', 'Multi-condition logic', 'Hidden badge toggle', 'Retroactive awarding'],
          actions: ['Attach Rule', 'Test Rule'],
        },
        {
          id: 'badge_issue_revoke_log',
          type: 'history-card',
          title: 'Issue & Revoke Log',
          description:
            'Operational history for every badge issuance, revocation, manual grant, and correction.',
          modules: ['Issuance history', 'Manual grants', 'Revocation reasons', 'Admin audit trail'],
          actions: ['Grant Badge', 'Revoke Badge', 'Export Log'],
        },
        {
          id: 'badge_distribution_analytics',
          type: 'analytics-card',
          title: 'Badge Distribution Analytics',
          description:
            'Monitor earn rates, rarity balance, cohort adoption, and badge motivation performance.',
          modules: ['Earn-rate chart', 'Cohort split', 'Badge rarity balance', 'Motivation performance'],
          actions: ['Open Analytics', 'Tune Thresholds'],
        },
      ],
    },
    {
      id: 'point_system',
      label: 'Point System',
      route: '/gamification/rewards/point-system',
      pagePurpose:
        'Control the complete point economy including rules, multipliers, balance tracking, and manual adjustments.',
      heroCards: [
        {
          id: 'points_economy_overview',
          type: 'metric-strip',
          title: 'Points Economy Overview',
          description:
            'Display points issued, redeemed, expired, adjusted, disputed, and net balance in circulation.',
          content: [
            'Points issued',
            'Points redeemed',
            'Points expired',
            'Manual adjustments',
            'Disputed balances',
            'Net circulation',
          ],
          actions: ['Create Rule', 'Adjust Balance'],
        },
      ],
      cards: [
        {
          id: 'points_rule_engine',
          type: 'logic-card',
          title: 'Point Rule Engine',
          description:
            'Define how actions create or remove points across quizzes, streaks, challenges, referrals, or milestones.',
          modules: [
            'Event trigger list',
            'Point award formula',
            'Deduction formula',
            'Conditional logic',
            'Priority conflict resolver',
          ],
          actions: ['Add Rule', 'Test Event'],
        },
        {
          id: 'multiplier_decay_card',
          type: 'control-card',
          title: 'Multipliers, Caps & Decay',
          description:
            'Manage temporary boosters, streak multipliers, max caps, point expiry, and inactivity decay.',
          modules: ['Multiplier rules', 'Cap rules', 'Expiry policies', 'Decay scheduler'],
          actions: ['Apply Booster', 'Set Expiry Policy'],
        },
        {
          id: 'points_ledger',
          type: 'ledger-card',
          title: 'Points Ledger',
          description:
            'Per-user and aggregate ledger for every issue, redemption, expiry, transfer, and adjustment event.',
          modules: ['Transaction table', 'User drilldown', 'Source event trace', 'Adjustment notes'],
          actions: ['Export Ledger', 'Investigate Entry'],
        },
        {
          id: 'manual_adjustments',
          type: 'ops-card',
          title: 'Manual Adjustments & Approvals',
          description:
            'Operational card for bonus grants, corrections, penalties, and approval-based balance changes.',
          modules: ['Adjustment form', 'Reason codes', 'Approval chain', 'Audit trail'],
          actions: ['Grant Points', 'Deduct Points', 'Submit for Approval'],
        },
        {
          id: 'points_health_analytics',
          type: 'analytics-card',
          title: 'Points Health Analytics',
          description:
            'See inflation risk, redemption conversion, dormant balances, and user earning velocity.',
          modules: ['Inflation trend', 'Dormant balance chart', 'Redemption conversion', 'Velocity breakdown'],
          actions: ['Open Insight Report'],
        },
      ],
    },
  ],
};
