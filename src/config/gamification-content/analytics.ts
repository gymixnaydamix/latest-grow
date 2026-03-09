import type { GamificationPrimaryConfig } from './types';

export const gamificationAnalyticsConfig: GamificationPrimaryConfig = {
  primaryNav: {
    id: 'analytics',
    label: 'Analytics',
  },
  pages: [
    {
      id: 'engagement_metrics',
      label: 'Engagement Metrics',
      route: '/gamification/analytics/engagement-metrics',
      pagePurpose:
        'Track player activity, participation depth, completion behavior, and engagement drivers.',
      heroCards: [
        {
          id: 'engagement_summary',
          type: 'metric-strip',
          title: 'Engagement Summary',
          description:
            'Show DAU, WAU, MAU, participation rate, completion rate, average session frequency, and active streak users.',
          content: [
            'DAU',
            'WAU',
            'MAU',
            'Participation rate',
            'Completion rate',
            'Session frequency',
            'Active streak users',
          ],
          actions: ['Filter Date Range', 'Export Metrics'],
        },
      ],
      cards: [
        {
          id: 'engagement_trend_card',
          type: 'analytics-card',
          title: 'Engagement Trends',
          description:
            'Trend card for active users, repeat visits, and return frequency across selected periods.',
          modules: ['Time-series trend', 'Period comparison', 'Segment selector'],
          actions: ['Compare Periods'],
        },
        {
          id: 'participation_funnel',
          type: 'funnel-card',
          title: 'Participation Funnel',
          description:
            'Measure invitation, start, attempt, completion, and reward-claim conversion.',
          modules: ['Funnel view', 'Drop-off detection', 'Segment comparison'],
          actions: ['Open Drop-off Detail'],
        },
        {
          id: 'engagement_heatmap',
          type: 'heatmap-card',
          title: 'Engagement Heatmap',
          description:
            'View activity intensity by hour, day, cohort, challenge type, or campaign.',
          modules: ['Hourly heatmap', 'Weekday heatmap', 'Segment filter'],
          actions: ['Open Cohort Heatmap'],
        },
        {
          id: 'cohort_retention_card',
          type: 'retention-card',
          title: 'Cohort Retention',
          description:
            'Track whether users return after quizzes, challenges, or rewards exposure.',
          modules: ['Retention curve', 'Cohort selector', 'Behavior split'],
          actions: ['Export Cohort Data'],
        },
        {
          id: 'anomaly_alerts_card',
          type: 'alert-card',
          title: 'Engagement Alerts',
          description:
            'Surface sudden participation drops, suspicious spikes, reward misuse, or leaderboard distortion.',
          modules: ['Alert feed', 'Severity levels', 'Source detection'],
          actions: ['View Alert', 'Dismiss', 'Escalate'],
        },
      ],
    },
    {
      id: 'performance_analytics',
      label: 'Performance Analytics',
      route: '/gamification/analytics/performance-analytics',
      pagePurpose:
        'Analyze quiz and challenge outcomes, question quality, user performance, and benchmark comparisons.',
      heroCards: [
        {
          id: 'performance_summary',
          type: 'metric-strip',
          title: 'Performance Summary',
          description:
            'Show average scores, pass rates, challenge success rates, median attempts, and top performers.',
          content: [
            'Average score',
            'Pass rate',
            'Challenge success rate',
            'Median attempts',
            'Top cohort',
            'Lowest-performing cohort',
          ],
          actions: ['Compare Segments', 'Open Benchmark'],
        },
      ],
      cards: [
        {
          id: 'score_distribution_card',
          type: 'distribution-card',
          title: 'Score Distribution',
          description:
            'Histogram/distribution view showing high, mid, and low score concentration.',
          modules: ['Distribution chart', 'Segment comparison', 'Difficulty overlay'],
          actions: ['Drill by Cohort'],
        },
        {
          id: 'question_difficulty_card',
          type: 'analytics-card',
          title: 'Question Difficulty & Discrimination',
          description:
            'Measure which questions are too easy, too hard, or poor differentiators.',
          modules: ['Difficulty index', 'Discrimination score', 'Question-by-question grid'],
          actions: ['Review Low Quality Questions'],
        },
        {
          id: 'challenge_outcome_card',
          type: 'analytics-card',
          title: 'Challenge Outcomes',
          description:
            'Track completion, abandonment, milestone reach, winner spread, and time-to-finish.',
          modules: ['Outcome summary', 'Time-to-finish chart', 'Milestone success view'],
          actions: ['Open Challenge Detail'],
        },
        {
          id: 'benchmark_card',
          type: 'comparison-card',
          title: 'Benchmarks & Comparisons',
          description:
            'Compare teams, cohorts, campaigns, or time periods against internal baselines.',
          modules: ['Benchmark selector', 'Variance view', 'Top/bottom comparison'],
          actions: ['Save Comparison View'],
        },
        {
          id: 'intervention_candidates',
          type: 'ops-card',
          title: 'Intervention Candidates',
          description:
            'Identify users or groups who need nudges, remediation, or challenge rebalancing.',
          modules: ['Risk scoring', 'Weak topic detection', 'Intervention suggestions'],
          actions: ['Assign Intervention', 'Export List'],
        },
      ],
    },
    {
      id: 'progress_tracking',
      label: 'Progress Tracking',
      route: '/gamification/analytics/progress-tracking',
      pagePurpose:
        'Follow user and cohort progress through milestones, levels, streaks, and completion states.',
      heroCards: [
        {
          id: 'progress_summary',
          type: 'metric-strip',
          title: 'Progress Summary',
          description:
            'Show in-progress users, completed journeys, active streaks, stalled users, level progression, and milestone completion.',
          content: [
            'In-progress users',
            'Completed journeys',
            'Active streaks',
            'Stalled users',
            'Avg level progression',
            'Milestone completion',
          ],
          actions: ['Filter Journey', 'Open Stalled Users'],
        },
      ],
      cards: [
        {
          id: 'user_progress_map',
          type: 'journey-card',
          title: 'User Progress Map',
          description:
            'Track progression by user across quizzes, challenges, badges, levels, and rewards.',
          modules: ['Journey timeline', 'Completion nodes', 'Current stage indicator'],
          actions: ['Open User Detail'],
        },
        {
          id: 'streak_calendar_card',
          type: 'calendar-card',
          title: 'Streak Calendar',
          description:
            'Display daily streak continuity, breaks, recoveries, and longest streak periods.',
          modules: ['Calendar heatmap', 'Streak summary', 'Break reason indicator'],
          actions: ['Drill by User', 'Compare Cohorts'],
        },
        {
          id: 'milestone_tracker_card',
          type: 'progress-card',
          title: 'Milestone Tracker',
          description:
            'Follow milestone reach across active challenges and progression systems.',
          modules: ['Milestone ladder view', 'Completion %', 'Pending milestone queue'],
          actions: ['Open Milestone Detail'],
        },
        {
          id: 'stalled_users_queue',
          type: 'queue-card',
          title: 'Stalled Users Queue',
          description:
            'Operational list of users who started but are no longer progressing.',
          modules: ['Stall detection', 'Days inactive', 'Last completed action', 'Suggested nudge'],
          actions: ['Send Reminder', 'Assign Support'],
        },
        {
          id: 'cohort_progress_comparison',
          type: 'comparison-card',
          title: 'Cohort Progress Comparison',
          description:
            'Compare classes, teams, departments, or campaign groups on progression speed and completion quality.',
          modules: ['Cohort ranking', 'Completion comparison', 'Progress velocity'],
          actions: ['Export Comparison'],
        },
      ],
    },
    {
      id: 'reports',
      label: 'Reports',
      route: '/gamification/analytics/reports',
      pagePurpose:
        'Central reporting workspace for operational, analytical, executive, and export-ready reporting.',
      heroCards: [
        {
          id: 'reports_center_summary',
          type: 'metric-strip',
          title: 'Reports Center',
          description:
            'Show total reports, scheduled reports, failed exports, favorite reports, and most viewed dashboards.',
          content: [
            'Saved reports',
            'Scheduled reports',
            'Failed exports',
            'Favorites',
            'Most viewed',
            'Last generated',
          ],
          actions: ['New Report', 'Run Scheduled Report'],
        },
      ],
      cards: [
        {
          id: 'report_builder',
          type: 'builder-card',
          title: 'Report Builder',
          description:
            'Build reports from metrics, dimensions, filters, cohorts, and visualizations.',
          modules: ['Metric picker', 'Dimension picker', 'Filter rules', 'Visualization selector', 'Preview canvas'],
          actions: ['Run Report', 'Save Report', 'Duplicate Report'],
        },
        {
          id: 'saved_reports_library',
          type: 'library-card',
          title: 'Saved Reports Library',
          description:
            'Search, manage, tag, and favorite saved reports with ownership and access state.',
          modules: ['Search bar', 'Tag filters', 'Ownership column', 'Access visibility'],
          actions: ['Open', 'Favorite', 'Archive', 'Share Config'],
        },
        {
          id: 'scheduled_exports',
          type: 'schedule-card',
          title: 'Scheduled Exports',
          description:
            'Set recurring export jobs to CSV, XLSX, PDF, email bundles, or API destination.',
          modules: ['Schedule frequency', 'Export format', 'Destination config', 'Failure logs'],
          actions: ['Schedule Export', 'Pause Job', 'Retry Failed Job'],
        },
        {
          id: 'executive_snapshot_card',
          type: 'executive-card',
          title: 'Executive Snapshot',
          description:
            'High-level board card summarizing engagement, performance, rewards, and risk indicators.',
          modules: ['KPI headline area', 'Trend summary', 'Top risks', 'Top wins'],
          actions: ['Generate Snapshot', 'Export PDF'],
        },
        {
          id: 'audit_compliance_card',
          type: 'audit-card',
          title: 'Audit & Compliance Report',
          description:
            'Track score changes, manual adjustments, reward approvals, moderation actions, and admin traces.',
          modules: ['Admin action timeline', 'Adjustment logs', 'Approval trails', 'Moderator history'],
          actions: ['Run Audit Report', 'Export Audit Pack'],
        },
      ],
    },
  ],
};
