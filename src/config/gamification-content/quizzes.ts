import type { GamificationPrimaryConfig } from './types';

export const gamificationQuizzesChallengesConfig: GamificationPrimaryConfig = {
  primaryNav: {
    id: 'quizzes_challenges',
    label: 'Quizzes & Challenges',
  },
  pages: [
    {
      id: 'quiz_builder',
      label: 'Quiz Builder',
      route: '/gamification/quizzes/quiz-builder',
      pagePurpose:
        'Create, edit, validate, preview, schedule, and publish quizzes with real scoring and segmentation logic.',
      heroCards: [
        {
          id: 'quiz_ops_overview',
          type: 'metric-strip',
          title: 'Quiz Operations Overview',
          description:
            'Top operational strip showing total quizzes, drafts, published, archived, active participants, completion rate, and average score.',
          content: [
            'Total quizzes',
            'Draft quizzes',
            'Published quizzes',
            'Archived quizzes',
            'Active participants',
            'Completion rate',
            'Average score',
          ],
          actions: ['Create Quiz', 'Import Quiz', 'Duplicate Existing'],
        },
      ],
      cards: [
        {
          id: 'quiz_structure_canvas',
          type: 'builder-card',
          title: 'Quiz Structure Canvas',
          description:
            'Main builder surface to define title, category, tags, difficulty, cover image, intro screen, section flow, timed blocks, and branching logic.',
          modules: [
            'Quiz metadata form',
            'Drag-and-drop section ordering',
            'Question sequence builder',
            'Section timer controls',
            'Branching rules',
            'Draft autosave',
          ],
          actions: ['Add Section', 'Add Question', 'Reorder', 'Save Draft', 'Preview'],
        },
        {
          id: 'question_composer',
          type: 'workspace-card',
          title: 'Question Composer',
          description:
            'Composer for MCQ, multi-select, true/false, free text, image-based, audio-based, poll-style, and scenario questions.',
          modules: [
            'Question type switcher',
            'Answer option editor',
            'Media upload',
            'Rich text prompt editor',
            'Scoring configuration',
            'Answer explanation',
            'Hint toggle',
          ],
          actions: ['Add Option', 'Set Correct Answer', 'Attach Media', 'Validate Question'],
        },
        {
          id: 'scoring_rules_card',
          type: 'logic-card',
          title: 'Scoring & Attempt Rules',
          description:
            'Configure base points, penalties, streak multipliers, retry policy, cooldown, pass threshold, and tie-break logic.',
          modules: [
            'Point rules',
            'Negative marking',
            'Partial credit',
            'Retry attempts',
            'Time bonus',
            'Pass/fail threshold',
          ],
          actions: ['Apply Rules', 'Save as Preset'],
        },
        {
          id: 'audience_targeting_card',
          type: 'control-card',
          title: 'Audience & Availability',
          description:
            'Assign quiz to cohorts, roles, teams, regions, classrooms, or campaign audiences with scheduling windows and visibility rules.',
          modules: [
            'Cohort selector',
            'Access window',
            'Visibility settings',
            'Eligibility conditions',
            'Audience preview',
          ],
          actions: ['Assign Audience', 'Schedule Launch', 'Restrict Access'],
        },
        {
          id: 'preview_publish_card',
          type: 'action-card',
          title: 'Preview, QA & Publish',
          description:
            'Final validation card with live preview, question integrity checks, missing answer detection, scoring simulation, and publish workflow.',
          modules: [
            'Live preview',
            'Validation panel',
            'Broken logic warnings',
            'Scoring simulator',
            'Publish checklist',
          ],
          actions: ['Run QA', 'Preview as User', 'Publish Quiz'],
        },
        {
          id: 'quiz_version_history',
          type: 'history-card',
          title: 'Version History & Rollback',
          description:
            'Track revisions, authors, timestamps, change summaries, and restore previous versions.',
          modules: ['Version timeline', 'Change summary', 'Editor attribution', 'Rollback control'],
          actions: ['Compare Versions', 'Restore Version'],
        },
      ],
    },
    {
      id: 'challenge_creator',
      label: 'Challenge Creator',
      route: '/gamification/quizzes/challenge-creator',
      pagePurpose:
        'Build time-based, milestone-based, streak-based, and team challenges with real completion logic.',
      heroCards: [
        {
          id: 'challenge_pipeline_overview',
          type: 'metric-strip',
          title: 'Challenge Pipeline',
          description:
            'Show active, scheduled, completed, cancelled, underperforming, and high-engagement challenges.',
          content: [
            'Scheduled challenges',
            'Active challenges',
            'Completed challenges',
            'Avg challenge participation',
            'Avg completion time',
            'Drop-off rate',
          ],
          actions: ['New Challenge', 'Clone Challenge'],
        },
      ],
      cards: [
        {
          id: 'challenge_definition',
          type: 'builder-card',
          title: 'Challenge Definition',
          description:
            'Define challenge name, goal type, participation mode, duration, recurrence, and success conditions.',
          modules: [
            'Challenge metadata',
            'Single-player or team mode',
            'Duration rules',
            'Recurrence rules',
            'Goal selector',
          ],
          actions: ['Save Draft', 'Set Objective'],
        },
        {
          id: 'challenge_milestones',
          type: 'progress-card',
          title: 'Milestones & Objectives',
          description:
            'Create milestone ladders, hidden bonus goals, side missions, and completion checkpoints.',
          modules: ['Milestone builder', 'Checkpoint conditions', 'Bonus tasks', 'Dependency mapping'],
          actions: ['Add Milestone', 'Add Dependency'],
        },
        {
          id: 'challenge_rewards_binding',
          type: 'reward-card',
          title: 'Reward Binding',
          description:
            'Attach points, badges, unlockables, coupons, levels, or leaderboard boosts to challenge outcomes.',
          modules: ['Reward package selector', 'Reward threshold mapping', 'Conditional reward logic'],
          actions: ['Attach Reward', 'Preview Outcome'],
        },
        {
          id: 'challenge_enrollment',
          type: 'control-card',
          title: 'Enrollment & Teams',
          description:
            'Assign participants manually, by rule, by group, or by self-enrollment. Build team pools and balancing rules.',
          modules: [
            'Self-enrollment toggle',
            'Team builder',
            'Capacity limits',
            'Role eligibility',
            'Auto-matching',
          ],
          actions: ['Assign Users', 'Generate Teams'],
        },
        {
          id: 'challenge_lifecycle',
          type: 'workflow-card',
          title: 'Lifecycle Automation',
          description:
            'Manage challenge launch, reminders, inactivity nudges, ending rules, and reward distribution events.',
          modules: [
            'Launch trigger',
            'Reminder cadence',
            'Inactivity detection',
            'Auto-close rules',
            'Completion actions',
          ],
          actions: ['Configure Automation', 'Test Workflow'],
        },
        {
          id: 'challenge_health_panel',
          type: 'analytics-card',
          title: 'Live Challenge Health',
          description:
            'Monitor participation, abandonment, milestone reach, average time to completion, and top blockers.',
          modules: ['Participation trend', 'Drop-off funnel', 'Milestone completion chart', 'Risk alerts'],
          actions: ['Open Analytics', 'Export Snapshot'],
        },
      ],
    },
    {
      id: 'question_bank',
      label: 'Question Bank',
      route: '/gamification/quizzes/question-bank',
      pagePurpose:
        'Central repository for reusable questions, media assets, taxonomy, review, and bulk management.',
      heroCards: [
        {
          id: 'question_bank_summary',
          type: 'metric-strip',
          title: 'Question Bank Summary',
          description:
            'Surface total questions, approved, pending review, flagged, duplicated, and low-quality items.',
          content: ['Total questions', 'Approved', 'Pending review', 'Flagged', 'Duplicates', 'Unused questions'],
          actions: ['Add Question', 'Bulk Import'],
        },
      ],
      cards: [
        {
          id: 'question_library_grid',
          type: 'table-card',
          title: 'Question Library',
          description:
            'Main searchable library with column controls, saved views, tag filters, and bulk actions.',
          modules: [
            'Advanced search',
            'Difficulty filter',
            'Type filter',
            'Tag filter',
            'Status filter',
            'Bulk select',
          ],
          actions: ['Edit', 'Duplicate', 'Archive', 'Move to Collection'],
        },
        {
          id: 'taxonomy_manager',
          type: 'taxonomy-card',
          title: 'Categories, Tags & Skills',
          description:
            'Manage the classification system for subject, topic, skill, difficulty, curriculum, or campaign taxonomy.',
          modules: ['Nested categories', 'Tag dictionary', 'Skill mapping', 'Color and label standards'],
          actions: ['Add Taxonomy', 'Merge Tags', 'Retire Tag'],
        },
        {
          id: 'quality_review_queue',
          type: 'moderation-card',
          title: 'Quality Review Queue',
          description:
            'Review broken, outdated, duplicated, or poorly performing questions before approval.',
          modules: ['Review queue', 'Reviewer assignment', 'Issue labels', 'Approval state'],
          actions: ['Approve', 'Reject', 'Request Fix'],
        },
        {
          id: 'import_export_card',
          type: 'integration-card',
          title: 'Import & Export Manager',
          description:
            'Import CSV, XLSX, JSON, or API-fed question sets and export filtered collections.',
          modules: ['Mapping wizard', 'Validation report', 'Import logs', 'Export templates'],
          actions: ['Import File', 'Download Template', 'Export Selection'],
        },
        {
          id: 'usage_impact_card',
          type: 'analytics-card',
          title: 'Usage & Impact',
          description:
            'See where each question is used, how often, average correctness, abandonment impact, and quality score.',
          modules: ['Usage map', 'Correctness trend', 'Difficulty calibration', 'Quality score'],
          actions: ['Open Details', 'Retire Question'],
        },
      ],
    },
    {
      id: 'templates',
      label: 'Templates',
      route: '/gamification/quizzes/templates',
      pagePurpose:
        'Template center for reusable quiz and challenge blueprints with branding and operational presets.',
      heroCards: [
        {
          id: 'template_center_overview',
          type: 'metric-strip',
          title: 'Template Center',
          description:
            'Show total templates, most used, recently updated, deprecated, brand-approved, and draft templates.',
          content: [
            'Total templates',
            'Most used',
            'Recently updated',
            'Deprecated',
            'Brand-approved',
            'Draft templates',
          ],
          actions: ['Create Template', 'Import Template'],
        },
      ],
      cards: [
        {
          id: 'template_gallery',
          type: 'gallery-card',
          title: 'Template Gallery',
          description:
            'Visual gallery for quiz, survey, challenge, onboarding, campaign, and event templates.',
          modules: ['Category tabs', 'Card previews', 'Usage counter', 'Template owner', 'Template status'],
          actions: ['Use Template', 'Clone', 'Archive'],
        },
        {
          id: 'template_editor',
          type: 'builder-card',
          title: 'Template Editor',
          description:
            'Edit default structure, scoring rules, target audience presets, automation presets, and content defaults.',
          modules: [
            'Default sections',
            'Preset rules',
            'Theme settings',
            'Audience presets',
            'Default reward mappings',
          ],
          actions: ['Save Draft', 'Publish Template'],
        },
        {
          id: 'brand_theme_presets',
          type: 'design-card',
          title: 'Brand & Theme Presets',
          description:
            'Store approved brand colors, typography, icon styles, badge treatment, and campaign skins.',
          modules: ['Color preset manager', 'Typography tokens', 'Badge style pack', 'Campaign skin preview'],
          actions: ['Apply Theme', 'Create Preset'],
        },
        {
          id: 'template_governance',
          type: 'governance-card',
          title: 'Governance & Approval',
          description:
            'Manage approval workflow, ownership, versioning, and deprecation rules for templates.',
          modules: ['Approver matrix', 'Version control', 'Lifecycle state', 'Publish permissions'],
          actions: ['Submit for Approval', 'Deprecate', 'Reassign Owner'],
        },
      ],
    },
  ],
};
