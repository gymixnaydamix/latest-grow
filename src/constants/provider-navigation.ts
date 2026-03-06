import {
  Activity,
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  Bell,
  BookTemplate,
  Bot,
  Brush,
  Building2,
  ClipboardList,
  Cloud,
  Code2,
  CreditCard,
  Database,
  FileClock,
  Flag,
  Globe,
  Handshake,
  Key,
  LifeBuoy,
  Lock,
  Mail,
  Megaphone,
  MessageSquare,
  Monitor,
  Paintbrush,
  Percent,
  ScrollText,
  Shield,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  Webhook,
} from 'lucide-react';

export const providerConsoleNav = {
  role: 'PROVIDER',
  sections: [
    {
      id: 'provider_home',
      label: 'Provider Home',
      icon: Sparkles,
      description: 'Operations command center',
      path: '/provider/home',
      headerItems: [
        {
          id: 'home_command',
          label: 'Command Center',
          icon: Activity,
          path: '/provider/home',
          subNav: [
            {
              id: 'home_inbox',
              label: 'Action Inbox',
              description: 'Alerts, escalations, and payment blockers',
              icon: Bell,
              path: '/provider/home/action-inbox',
            },
            {
              id: 'home_health',
              label: 'Health Watchlist',
              description: 'Tenants needing monitoring by health and usage',
              icon: Activity,
              path: '/provider/home/tenant-health',
            },
            {
              id: 'home_onboarding',
              label: 'Onboarding Pipeline',
              description: 'Provisioning stages from trial to go-live',
              icon: Handshake,
              path: '/provider/home/onboarding-pipeline',
            },
            {
              id: 'home_billing',
              label: 'Billing Exceptions',
              description: 'Failed charges, overdue invoices, and approvals',
              icon: BadgeDollarSign,
              path: '/provider/home/billing-exceptions',
            },
            {
              id: 'home_system',
              label: 'System Health',
              description: 'Platform uptime and active provider incidents',
              icon: Shield,
              path: '/provider/home/system-health',
            },
          ],
        },
      ],
    },
    {
      id: 'provider_tenants',
      label: 'Tenants (Schools)',
      icon: Building2,
      description: 'Lifecycle and tenant control',
      path: '/provider/tenants',
      headerItems: [
        {
          id: 'tenants_directory',
          label: 'Directory',
          icon: Building2,
          path: '/provider/tenants',
          subNav: [
            {
              id: 'tenants_list',
              label: 'All Tenants',
              description: 'Complete tenant directory across all schools',
              icon: Building2,
              path: '/provider/tenants/list',
            },
            {
              id: 'tenants_status',
              label: 'Lifecycle States',
              description: 'Trials, active accounts, payment due, and suspended',
              icon: Activity,
              path: '/provider/tenants/lifecycle',
            },
            {
              id: 'tenants_profiles',
              label: 'Tenant Profiles',
              description: 'School profiles, domains, admins, and modules',
              icon: Users,
              path: '/provider/tenants/profiles',
            },
            {
              id: 'tenants_maintenance',
              label: 'Maintenance',
              description: 'Tenants requiring intervention or service actions',
              icon: AlertTriangle,
              path: '/provider/tenants/maintenance',
            },
          ],
        },
        {
          id: 'tenants_bulk',
          label: 'Bulk Actions',
          icon: ClipboardList,
          path: '/provider/tenants/bulk',
        },
        { id: 'tenants_users', label: 'User Mgmt', icon: Users, path: '/provider/tenants/users' },
        { id: 'tenants_flags', label: 'Feature Flags', icon: Flag, path: '/provider/tenants/flags' },
        { id: 'tenants_usage', label: 'Tenant Usage', icon: Activity, path: '/provider/tenants/usage' },
      ],
    },
    {
      id: 'provider_onboarding',
      label: 'Onboarding & Provisioning',
      icon: Handshake,
      description: 'Wizard, blockers, and go-live',
      path: '/provider/onboarding',
      headerItems: [
        { id: 'onboarding_wizard', label: 'Wizard', icon: Sparkles, path: '/provider/onboarding/wizard' },
        { id: 'onboarding_pipeline', label: 'Pipeline', icon: Activity, path: '/provider/onboarding/pipeline' },
        { id: 'onboarding_blockers', label: 'Blockers', icon: AlertTriangle, path: '/provider/onboarding/blockers' },
      ],
    },
    {
      id: 'provider_billing',
      label: 'Plans & Billing',
      icon: BadgeDollarSign,
      description: 'Plans, invoices, dunning, collections',
      path: '/provider/billing',
      headerItems: [
        { id: 'billing_plans', label: 'Plans', icon: SlidersHorizontal, path: '/provider/billing/plans' },
        { id: 'billing_subscriptions', label: 'Subscriptions', icon: FileClock, path: '/provider/billing/subscriptions' },
        { id: 'billing_invoices', label: 'Invoices', icon: ClipboardList, path: '/provider/billing/invoices' },
        { id: 'billing_dunning', label: 'Dunning', icon: AlertTriangle, path: '/provider/billing/dunning' },
        { id: 'billing_approvals', label: 'Approvals', icon: Bell, path: '/provider/billing/approvals' },
        { id: 'billing_revenue', label: 'Revenue Analytics', icon: TrendingUp, path: '/provider/billing/revenue' },
        { id: 'billing_payments', label: 'Payments', icon: CreditCard, path: '/provider/billing/payments' },
        { id: 'billing_coupons', label: 'Coupons', icon: Percent, path: '/provider/billing/coupons' },
      ],
    },
    {
      id: 'provider_usage',
      label: 'Usage & Limits',
      icon: Activity,
      description: 'Metering, thresholds, and policy actions',
      path: '/provider/usage',
      headerItems: [
        { id: 'usage_overview', label: 'Usage Explorer', icon: Activity, path: '/provider/usage' },
        { id: 'usage_limits', label: 'Limit Policies', icon: SlidersHorizontal, path: '/provider/usage/limits' },
        { id: 'usage_exports', label: 'Usage Exports', icon: FileClock, path: '/provider/usage/reports' },
      ],
    },
    {
      id: 'provider_support',
      label: 'Support Desk',
      icon: LifeBuoy,
      description: 'SLA ticket operations and escalation',
      path: '/provider/support',
      headerItems: [
        { id: 'support_inbox', label: 'Inbox', icon: LifeBuoy, path: '/provider/support/inbox' },
        { id: 'support_sla', label: 'SLA Monitor', icon: FileClock, path: '/provider/support/sla' },
        { id: 'support_macros', label: 'Macros', icon: Bot, path: '/provider/support/macros' },
        { id: 'support_timeline', label: 'Tenant Timeline', icon: Activity, path: '/provider/support/timeline' },
        { id: 'support_kb', label: 'Knowledge Base', icon: ScrollText, path: '/provider/support/kb' },
        { id: 'support_csat', label: 'CSAT Surveys', icon: TrendingUp, path: '/provider/support/csat' },
      ],
    },
    {
      id: 'provider_incidents',
      label: 'Incidents & Status',
      icon: AlertTriangle,
      description: 'Incident response and status comms',
      path: '/provider/incidents',
      headerItems: [
        { id: 'incidents_queue', label: 'Incident Queue', icon: AlertTriangle, path: '/provider/incidents' },
        { id: 'incidents_status_page', label: 'Status Page', icon: Activity, path: '/provider/incidents/status-page' },
        { id: 'incidents_maintenance', label: 'Maintenance', icon: FileClock, path: '/provider/incidents/maintenance' },
      ],
    },
    {
      id: 'provider_releases',
      label: 'Releases & Feature Flags',
      icon: Flag,
      description: 'Safe rollout controls',
      path: '/provider/releases',
      headerItems: [
        { id: 'releases_manager', label: 'Releases', icon: Flag, path: '/provider/releases' },
        { id: 'releases_flags', label: 'Flags', icon: SlidersHorizontal, path: '/provider/releases/flags' },
        { id: 'releases_rollout', label: 'Rollouts', icon: Activity, path: '/provider/releases/rollouts' },
        { id: 'releases_notes', label: 'Release Notes', icon: ClipboardList, path: '/provider/releases/notes' },
      ],
    },
    {
      id: 'provider_templates',
      label: 'Templates & Marketplace',
      icon: BookTemplate,
      description: 'Template library and add-ons',
      path: '/provider/templates',
      headerItems: [
        { id: 'templates_library', label: 'Template Library', icon: BookTemplate, path: '/provider/templates' },
        { id: 'templates_addons', label: 'Add-on Catalog', icon: BadgeDollarSign, path: '/provider/templates/addons' },
        { id: 'templates_purchases', label: 'Tenant Purchases', icon: ClipboardList, path: '/provider/templates/purchases' },
      ],
    },
    {
      id: 'provider_integrations',
      label: 'Integrations',
      icon: Bot,
      description: 'Connector health and logs',
      path: '/provider/integrations',
      headerItems: [
        { id: 'integrations_connectors', label: 'Connectors', icon: Bot, path: '/provider/integrations' },
        { id: 'integrations_logs', label: 'Delivery Logs', icon: Activity, path: '/provider/integrations/logs' },
        { id: 'integrations_retries', label: 'Retries', icon: AlertTriangle, path: '/provider/integrations/retries' },
        { id: 'integrations_webhooks', label: 'Webhooks', icon: Webhook, path: '/provider/integrations/webhooks' },
        { id: 'integrations_oauth', label: 'OAuth Apps', icon: Key, path: '/provider/integrations/oauth' },
      ],
    },
    {
      id: 'provider_security',
      label: 'Security & Compliance',
      icon: Shield,
      description: 'Provider governance controls',
      path: '/provider/security',
      headerItems: [
        { id: 'security_access', label: 'Access Controls', icon: Shield, path: '/provider/security/access' },
        { id: 'security_posture', label: 'Security Posture', icon: Activity, path: '/provider/security/posture' },
        { id: 'security_compliance', label: 'Compliance Requests', icon: FileClock, path: '/provider/security/compliance' },
        { id: 'security_api_keys', label: 'API Keys', icon: Key, path: '/provider/security/api-keys' },
        { id: 'security_ip_allowlist', label: 'IP Allowlist', icon: Globe, path: '/provider/security/ip-allowlist' },
        { id: 'security_sessions', label: 'Sessions', icon: Monitor, path: '/provider/security/sessions' },
      ],
    },
    {
      id: 'provider_data_ops',
      label: 'Data Operations',
      icon: Database,
      description: 'Data export/import/repair workflows',
      path: '/provider/data-ops',
      headerItems: [
        { id: 'data_ops_exports', label: 'Exports', icon: Database, path: '/provider/data-ops/exports' },
        { id: 'data_ops_imports', label: 'Imports', icon: ClipboardList, path: '/provider/data-ops/imports' },
        { id: 'data_ops_repair', label: 'Repair Tasks', icon: AlertTriangle, path: '/provider/data-ops/repair' },
        { id: 'data_ops_compatibility', label: 'Compatibility', icon: SlidersHorizontal, path: '/provider/data-ops/compatibility' },
        { id: 'data_ops_backups', label: 'Backups', icon: Cloud, path: '/provider/data-ops/backups' },
      ],
    },
    {
      id: 'provider_team',
      label: 'Admin Team & Roles',
      icon: Users,
      description: 'Staff, roles, permissions',
      path: '/provider/team',
      headerItems: [
        { id: 'team_staff', label: 'Staff Accounts', icon: Users, path: '/provider/team/staff' },
        { id: 'team_roles', label: 'Roles', icon: Shield, path: '/provider/team/roles' },
        { id: 'team_permissions', label: 'Permission Matrix', icon: SlidersHorizontal, path: '/provider/team/permissions' },
        { id: 'team_shifts', label: 'Shift Planner', icon: FileClock, path: '/provider/team/shifts' },
      ],
    },
    {
      id: 'provider_settings',
      label: 'System Settings',
      icon: SlidersHorizontal,
      description: 'Global defaults and policy rules',
      path: '/provider/settings',
      headerItems: [
        { id: 'settings_defaults', label: 'Defaults', icon: SlidersHorizontal, path: '/provider/settings/defaults' },
        { id: 'settings_notifications', label: 'Notifications', icon: Bell, path: '/provider/settings/notifications' },
        { id: 'settings_sla', label: 'SLA Policies', icon: FileClock, path: '/provider/settings/sla' },
        { id: 'settings_legal', label: 'Legal Templates', icon: ClipboardList, path: '/provider/settings/legal' },
        { id: 'settings_email_templates', label: 'Email Templates', icon: Mail, path: '/provider/settings/email-templates' },
        { id: 'settings_appearance', label: 'Appearance', icon: Paintbrush, path: '/provider/settings/appearance' },
      ],
    },
    {
      id: 'provider_audit',
      label: 'Audit Logs',
      icon: FileClock,
      description: 'Immutable provider event stream',
      path: '/provider/audit',
      headerItems: [
        { id: 'audit_stream', label: 'Event Stream', icon: FileClock, path: '/provider/audit' },
        { id: 'audit_exports', label: 'Export Jobs', icon: Database, path: '/provider/audit/exports' },
        { id: 'audit_access', label: 'Access Reviews', icon: Shield, path: '/provider/audit/access-review' },
      ],
    },
    {
      id: 'provider_analytics',
      label: 'Analytics & Reporting',
      icon: BarChart3,
      description: 'Revenue, engagement, and churn analytics',
      path: '/provider/analytics',
      headerItems: [
        { id: 'analytics_revenue', label: 'Revenue', icon: TrendingUp, path: '/provider/analytics/revenue' },
        { id: 'analytics_engagement', label: 'Engagement', icon: Activity, path: '/provider/analytics/engagement' },
        { id: 'analytics_churn', label: 'Churn', icon: AlertTriangle, path: '/provider/analytics/churn' },
        { id: 'analytics_reports', label: 'Reports', icon: ClipboardList, path: '/provider/analytics/reports' },
      ],
    },
    {
      id: 'provider_comms',
      label: 'Communication',
      icon: Megaphone,
      description: 'Announcements, messaging, and broadcast templates',
      path: '/provider/comms',
      headerItems: [
        { id: 'comms_announcements', label: 'Announcements', icon: Megaphone, path: '/provider/comms/announcements' },
        { id: 'comms_messaging', label: 'Messaging', icon: MessageSquare, path: '/provider/comms/messaging' },
        { id: 'comms_templates', label: 'Templates', icon: Mail, path: '/provider/comms/templates' },
      ],
    },
    {
      id: 'provider_notifications',
      label: 'Notification Center',
      icon: Bell,
      description: 'Notification inbox, rules, and delivery history',
      path: '/provider/notifications',
      headerItems: [
        { id: 'notifications_inbox', label: 'Inbox', icon: Bell, path: '/provider/notifications/inbox' },
        { id: 'notifications_rules', label: 'Rules', icon: SlidersHorizontal, path: '/provider/notifications/rules' },
        { id: 'notifications_history', label: 'History', icon: FileClock, path: '/provider/notifications/history' },
      ],
    },
    {
      id: 'provider_branding',
      label: 'Branding & Whitelabel',
      icon: Paintbrush,
      description: 'Themes, custom domains, and login pages',
      path: '/provider/branding',
      headerItems: [
        { id: 'branding_themes', label: 'Themes', icon: Brush, path: '/provider/branding/themes' },
        { id: 'branding_domains', label: 'Domains', icon: Globe, path: '/provider/branding/domains' },
        { id: 'branding_login', label: 'Login Pages', icon: Lock, path: '/provider/branding/login' },
      ],
    },
    {
      id: 'provider_api_mgmt',
      label: 'API Management',
      icon: Code2,
      description: 'API keys, webhooks, rate limits, and usage',
      path: '/provider/api',
      headerItems: [
        { id: 'api_keys', label: 'API Keys', icon: Key, path: '/provider/api/keys' },
        { id: 'api_webhooks', label: 'Webhooks', icon: Webhook, path: '/provider/api/webhooks' },
        { id: 'api_rate_limits', label: 'Rate Limits', icon: SlidersHorizontal, path: '/provider/api/rate-limits' },
        { id: 'api_usage', label: 'API Usage', icon: BarChart3, path: '/provider/api/usage' },
      ],
    },
    {
      id: 'provider_backup',
      label: 'Backup & Recovery',
      icon: Cloud,
      description: 'Scheduled backups, disaster recovery, and runbooks',
      path: '/provider/backup',
      headerItems: [
        { id: 'backup_schedules', label: 'Schedules', icon: FileClock, path: '/provider/backup/schedules' },
        { id: 'backup_recovery', label: 'Recovery', icon: Database, path: '/provider/backup/recovery' },
        { id: 'backup_runbooks', label: 'Runbooks', icon: ClipboardList, path: '/provider/backup/runbooks' },
      ],
    },
  ],
} as const;

export type ProviderNavState = {
  sectionId: string;
  headerId: string;
  subNavId: string;
};

export function resolveProviderNavState(pathname: string): ProviderNavState {
  const defaultSection = providerConsoleNav.sections[0];
  const defaultHeader = defaultSection.headerItems[0];
  let bestMatch: { sectionId: string; headerId: string; subNavId: string; len: number } | null = null;

  for (const section of providerConsoleNav.sections) {
    if (section.path && pathname.startsWith(section.path)) {
      const entry = {
        sectionId: section.id,
        headerId: section.headerItems[0]?.id ?? '',
        subNavId: '',
        len: section.path.length,
      };
      if (!bestMatch || entry.len > bestMatch.len) bestMatch = entry;
    }

    for (const header of section.headerItems) {
      if (header.path && pathname.startsWith(header.path)) {
        const entry = {
          sectionId: section.id,
          headerId: header.id,
          subNavId: '',
          len: header.path.length,
        };
        if (!bestMatch || entry.len > bestMatch.len) bestMatch = entry;
      }

      const subNavItems = 'subNav' in header ? header.subNav : undefined;
      for (const subItem of subNavItems ?? []) {
        if (subItem.path && pathname.startsWith(subItem.path)) {
          const entry = {
            sectionId: section.id,
            headerId: header.id,
            subNavId: subItem.id,
            len: subItem.path.length,
          };
          if (!bestMatch || entry.len > bestMatch.len) bestMatch = entry;
        }
      }
    }
  }

  if (bestMatch) {
    return {
      sectionId: bestMatch.sectionId,
      headerId: bestMatch.headerId,
      subNavId: bestMatch.subNavId,
    };
  }

  return {
    sectionId: defaultSection.id,
    headerId: defaultHeader?.id ?? '',
    subNavId: '',
  };
}
