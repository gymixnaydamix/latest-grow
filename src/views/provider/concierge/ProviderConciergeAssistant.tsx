/* Provider Concierge › Assistant — Chat, Quick Actions, Today, Search, History */
import { useNavigationStore } from '@/store/navigation.store';
import { useConciergeStore } from '@/store/concierge.store';
import { useAIChat } from '@/hooks/api/use-ai';
// Wire provider home data for dynamic todayChips
import { useProviderHome } from '@/hooks/api';
import {
  ConciergeLayout, ConciergeChatView, ConciergeSearchResultsPanel,
  ConciergeHistoryTimeline, ConciergeQuickLaunchBoard, ConciergeTodayTimeline,
} from '@/components/concierge/shared';
import {
  Building2, CreditCard, ShieldAlert, Siren, Rocket, ToggleRight,
  Database, Code2, Megaphone, Server, Search, Users, FileText,
  Settings, Lock,
} from 'lucide-react';
import { notifySuccess } from '@/lib/notify';
import type { ConciergeMessage, ConciergeContextField } from '@/store/concierge.store';
import type { TodayChip } from '@/components/concierge/shared/ConciergeTodayStrip';

/* ── Context fields ── */
const contextFields: ConciergeContextField[] = [
  { key: 'tenant', label: 'Tenant', value: 'All Tenants', options: ['All Tenants', 'Greenfield Academy', 'Sunrise Montessori', 'Bright Minds K-12'] },
  { key: 'environment', label: 'Environment', value: 'Production', options: ['Local', 'Dev', 'QA', 'Staging', 'Production'] },
  { key: 'module', label: 'Module', value: '' },
  { key: 'role', label: 'Role', value: 'Provider Admin' },
  { key: 'release', label: 'Release', value: 'v2.14.0' },
  { key: 'incident', label: 'Incident', value: '' },
];

/* ── Today chips ── */
const FALLBACK_TODAY_CHIPS: TodayChip[] = [
  { id: 't1', count: 6, label: 'Tenants need attention' },
  { id: 't2', count: 3, label: 'Failed billing' },
  { id: 't3', count: 4, label: 'Urgent escalations' },
  { id: 't4', count: 1, label: 'Active incident' },
  { id: 't5', count: 2, label: 'Staged releases' },
  { id: 't6', count: 5, label: 'Pending flags' },
  { id: 't7', count: 3, label: 'Data requests' },
  { id: 't8', count: 7, label: 'Blocked dev tasks' },
];

/* ── Slash commands ── */
const FALLBACK_SLASH_CMDS = [
  '/tenant', '/billing', '/support', '/incident', '/release', '/deploy',
  '/rollback', '/flag', '/module', '/permission', '/export', '/delete',
  '/search', '/roadmap', '/task', '/qa', '/env',
];

/* ── Starter messages ── */
const starterMessages: ConciergeMessage[] = [
  {
    id: 's1', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Welcome! I\'m your Provider AI Assistant powered by a local LLM. Ask me anything about tenant management, billing, incidents, deployments, or platform operations.',
  },
];

/* ── Quick actions ── */
const nav = () => useNavigationStore.getState();
const quickActions = [
  { id: 'qa1', label: 'Open Tenant Control', icon: Building2, onClick: () => { nav().setSection('provider_tenants'); nav().setHeader('tenants_directory'); } },
  { id: 'qa2', label: 'Create/Provision School', icon: Users, onClick: () => { nav().setSection('provider_onboarding'); nav().setHeader('onboarding_wizard'); } },
  { id: 'qa3', label: 'Change Plan/Billing', icon: CreditCard, onClick: () => { nav().setSection('provider_billing'); nav().setHeader('billing_plans'); } },
  { id: 'qa4', label: 'Resolve Support Escalation', icon: ShieldAlert, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_requests_escalations'); } },
  { id: 'qa5', label: 'Declare Incident', icon: Siren, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_incidents'); } },
  { id: 'qa6', label: 'Launch Release', icon: Rocket, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_releases'); } },
  { id: 'qa7', label: 'Change Feature Flag', icon: ToggleRight, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_feature_flags'); } },
  { id: 'qa8', label: 'Run Data Export', icon: Database, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_data_ops'); } },
  { id: 'qa9', label: 'Assign Dev Task', icon: Code2, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_dev_tasks'); } },
  { id: 'qa10', label: 'Broadcast Tenant Notice', icon: Megaphone, onClick: () => { nav().setHeader('c_comms'); } },
];

/* ── Quick launch sections ── */
const launchSections = [
  { title: 'Tenant Control', actions: [
    { id: 'l1', label: 'Open tenant dashboard', icon: Building2, onClick: () => { nav().setSection('provider_tenants'); nav().setHeader('tenants_directory'); } },
    { id: 'l2', label: 'Provision new school', icon: Users, onClick: () => { nav().setSection('provider_onboarding'); nav().setHeader('onboarding_wizard'); } },
    { id: 'l3', label: 'Suspend tenant', icon: Lock, onClick: () => { nav().setHeader('c_tenants'); nav().setSubNav('c_tenant_actions'); } },
    { id: 'l4', label: 'Configure modules', icon: Settings, onClick: () => { nav().setSection('provider_tenants'); nav().setHeader('tenants_directory'); nav().setSubNav('tenants_profiles'); } },
  ]},
  { title: 'Platform Operations', actions: [
    { id: 'l5', label: 'View support queue', icon: ShieldAlert, onClick: () => { nav().setHeader('c_operations'); } },
    { id: 'l6', label: 'Declare incident', icon: Siren, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_incidents'); } },
    { id: 'l7', label: 'Review data requests', icon: Database, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_data_ops'); } },
    { id: 'l8', label: 'Run compliance audit', icon: FileText, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_security_compliance'); } },
  ]},
  { title: 'Billing & Commercial', actions: [
    { id: 'l9', label: 'Change tenant plan', icon: CreditCard, onClick: () => { nav().setSection('provider_billing'); nav().setHeader('billing_plans'); } },
    { id: 'l10', label: 'Review failed payments', icon: CreditCard, onClick: () => { nav().setSection('provider_billing'); nav().setHeader('billing_dunning'); } },
    { id: 'l11', label: 'Generate invoice batch', icon: FileText, onClick: () => { nav().setSection('provider_billing'); nav().setHeader('billing_invoices'); } },
    { id: 'l12', label: 'Send billing notice', icon: Megaphone, onClick: () => { nav().setHeader('c_comms'); nav().setSubNav('c_tenant_notices'); } },
  ]},
  { title: 'Development & Release', actions: [
    { id: 'l13', label: 'Launch release', icon: Rocket, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_releases'); } },
    { id: 'l14', label: 'Toggle feature flag', icon: ToggleRight, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_feature_flags'); } },
    { id: 'l15', label: 'Check environment health', icon: Server, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_environments'); } },
    { id: 'l16', label: 'Assign dev task', icon: Code2, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_dev_tasks'); } },
  ]},
  { title: 'Governance', actions: [
    { id: 'l17', label: 'Run data export', icon: Database, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_data_ops'); } },
    { id: 'l18', label: 'Process deletion request', icon: FileText, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_data_ops'); } },
    { id: 'l19', label: 'Review audit trail', icon: Search, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_audit_center'); } },
    { id: 'l20', label: 'Manage permissions', icon: Lock, onClick: () => { nav().setHeader('c_settings'); } },
  ]},
];

/* ── Today timeline items ── */
const todayTimelineItems = [
  { id: 'tt1', time: '07:00', title: 'Billing retry batch — 3 tenants with failed charges', entity: 'Billing Engine', priority: 'urgent' as const, actions: ['Retry', 'Pause'] },
  { id: 'tt2', time: '08:30', title: 'Sunrise Montessori support escalation — enrollment data', entity: 'Support Queue', priority: 'high' as const, actions: ['Assign', 'Respond'] },
  { id: 'tt3', time: '09:00', title: 'Release v2.14.1 staged for production promotion', entity: 'Release Pipeline', priority: 'high' as const, actions: ['Promote', 'Rollback'] },
  { id: 'tt4', time: '10:30', title: '5 feature flag changes awaiting review', entity: 'Feature Flags', priority: 'medium' as const, actions: ['Review', 'Approve'] },
  { id: 'tt5', time: '13:00', title: 'Data export request from Greenfield Academy', entity: 'Data Ops', priority: 'medium' as const, actions: ['Process', 'Defer'] },
  { id: 'tt6', time: '14:00', title: 'QA regression suite scheduled for staging', entity: 'QA Pipeline', priority: 'low' as const, actions: ['Run', 'Skip'] },
  { id: 'tt7', time: '15:30', title: 'Incident post-mortem review — API rate-limit breach', entity: 'Incident Mgmt', priority: 'high' as const, actions: ['Review', 'Reschedule'] },
  { id: 'tt8', time: '17:00', title: '7 dev tasks blocked on dependency resolution', entity: 'Dev Board', priority: 'medium' as const, actions: ['Triage', 'Reassign'] },
];

export function ProviderConciergeAssistant() {
  const { activeSubNav } = useNavigationStore();
  const { messages, addMessage, history } = useConciergeStore();
  const aiChat = useAIChat();

  const homeQuery = useProviderHome();
  const homeData = homeQuery.data;

  /* System prompt giving the AI context about the provider role */
  const systemPrompt: { role: 'system'; content: string } = {
    role: 'system',
    content: [
      'You are an AI assistant for a SaaS education platform provider (GrowYourNeed).',
      'You help the Provider Admin manage tenants (schools), billing, incidents, releases, feature flags, support tickets, and platform operations.',
      'Be concise, professional, and action-oriented. When the user asks about an action, explain what steps are needed.',
      'If you don\'t know something specific, say so — don\'t fabricate data.',
    ].join(' '),
  };

  /* Build todayChips from live home data when available */
  const todayChips: TodayChip[] = homeData
    ? [
        { id: 't1', count: homeData.tenantHealthWatchlist?.length ?? 0, label: 'Tenants need attention' },
        { id: 't2', count: homeData.billingExceptions?.length ?? 0, label: 'Failed billing' },
        { id: 't3', count: homeData.actionInbox?.filter((a) => (a as any).priority === 'URGENT').length ?? 0, label: 'Urgent escalations' },
        { id: 't4', count: homeData.systemHealth?.activeIncidents ?? 0, label: 'Active incident' },
        { id: 't5', count: homeData.onboardingPipeline?.length ?? 0, label: 'Staged releases' },
        { id: 't6', count: homeData.actionInbox?.filter((a) => (a as any).type === 'FLAG').length ?? 0, label: 'Pending flags' },
        { id: 't7', count: homeData.actionInbox?.filter((a) => (a as any).type === 'DATA_REQUEST').length ?? 0, label: 'Data requests' },
        { id: 't8', count: homeData.systemHealth?.queueBacklog ?? 0, label: 'Blocked dev tasks' },
      ].filter((c) => c.count > 0)
    : FALLBACK_TODAY_CHIPS;
  const slashCommands = FALLBACK_SLASH_CMDS;

  const content = (() => {
    switch (activeSubNav) {
      case 'c_quick_actions':
        return <ConciergeQuickLaunchBoard sections={launchSections} />;
      case 'c_today':
        return <ConciergeTodayTimeline items={todayTimelineItems} onAction={(id, action) => {
          notifySuccess(`${action} triggered`, `Action "${action}" executed for item ${id}`);
        }} />;
      case 'c_search':
        return <ConciergeSearchResultsPanel />;
      case 'c_history':
        return <ConciergeHistoryTimeline items={history} />;
      default:
        return (
          <ConciergeChatView
            greeting="Good morning, Provider Admin"
            contextSummary="All Tenants · Production · 6 tenants need attention"
            suggestions={[
              { label: 'Open tenant control', icon: Building2, onClick: () => { nav().setHeader('c_tenants'); } },
              { label: 'Launch release', icon: Rocket, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_releases'); } },
              { label: 'Declare incident', icon: Siren, onClick: () => { nav().setHeader('c_operations'); nav().setSubNav('c_incidents'); } },
              { label: 'Toggle feature flag', icon: ToggleRight, onClick: () => { nav().setHeader('c_development'); nav().setSubNav('c_feature_flags'); } },
            ]}
            quickActions={quickActions}
            todayChips={todayChips}
            starterMessages={starterMessages}
            slashCommands={slashCommands}
            isLoading={aiChat.isPending}
            onSend={(t: string) => {
              const userMsg: ConciergeMessage = { id: `u-${Date.now()}`, role: 'user', content: t, timestamp: new Date().toISOString() };
              addMessage(userMsg);
              const chatHistory = [
                systemPrompt,
                ...[...messages, userMsg].map((m) => ({
                  role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                  content: m.content,
                })),
              ];
              aiChat.mutate({ messages: chatHistory }, {
                onSuccess: (res) => {
                  addMessage({ id: `a-${Date.now()}`, role: 'assistant', content: res.text || 'No response from AI.', timestamp: new Date().toISOString() });
                },
                onError: (err) => {
                  addMessage({ id: `e-${Date.now()}`, role: 'assistant', content: `Error: ${err.message ?? 'Failed to get AI response. Check if Ollama is running.'}`, timestamp: new Date().toISOString() });
                },
              });
            }}
          />
        );
    }
  })();

  return (
    <ConciergeLayout
      contextFields={contextFields}
      todayChips={todayChips}
    >
      {content}
    </ConciergeLayout>
  );
}
