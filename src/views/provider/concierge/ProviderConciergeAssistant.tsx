/* Provider Concierge › Assistant — Chat, Quick Actions, Today, Search, History */
import { useNavigationStore } from '@/store/navigation.store';
import { useConciergeStore } from '@/store/concierge.store';
import { useAIChat } from '@/hooks/api/use-ai';
import {
  ConciergeLayout, ConciergeChatView, ConciergeSearchResultsPanel,
  ConciergeHistoryTimeline, ConciergeQuickLaunchBoard, ConciergeTodayTimeline,
} from '@/components/concierge/shared';
import {
  Building2, CreditCard, ShieldAlert, Siren, Rocket, ToggleRight,
  Database, Code2, Megaphone, Server, Search, Users, FileText,
  Settings, Lock,
} from 'lucide-react';
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
const todayChips: TodayChip[] = [
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
const slashCommands = [
  '/tenant', '/billing', '/support', '/incident', '/release', '/deploy',
  '/rollback', '/flag', '/module', '/permission', '/export', '/delete',
  '/search', '/roadmap', '/task', '/qa', '/env',
];

/* ── Starter messages ── */
const starterMessages: ConciergeMessage[] = [
  {
    id: 's1', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Tenant suspension draft for Bright Minds K-12 is ready for review. Module access will be frozen and billing paused.',
    actionCard: {
      id: 'ac1', type: 'TenantSuspensionCard', title: 'Suspend Tenant — Bright Minds K-12',
      status: 'draft', linkedEntities: [{ type: 'Tenant', label: 'Bright Minds K-12', id: 'tenant-bm' }],
      fields: [
        { key: 'reason', label: 'Reason', value: 'Non-payment — 90 days overdue' },
        { key: 'impact', label: 'Affected users', value: '342 users across 12 modules' },
      ],
      permissionChip: 'Tenant Admin',
      auditWarning: 'This action suspends all portal access for the tenant',
    },
  },
  {
    id: 's2', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Production release v2.14.1 promotion draft is staged. 3 environments passed QA with zero critical issues.',
  },
  {
    id: 's3', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Urgent support escalation from Sunrise Montessori routed to Tier 3 — enrollment module data inconsistency.',
  },
  {
    id: 's4', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Billing follow-up campaign targeting 3 tenants with overdue invoices has been drafted and awaits approval.',
  },
];

/* ── Quick actions ── */
const quickActions = [
  { id: 'qa1', label: 'Open Tenant Control', icon: Building2 },
  { id: 'qa2', label: 'Create/Provision School', icon: Users },
  { id: 'qa3', label: 'Change Plan/Billing', icon: CreditCard },
  { id: 'qa4', label: 'Resolve Support Escalation', icon: ShieldAlert },
  { id: 'qa5', label: 'Declare Incident', icon: Siren },
  { id: 'qa6', label: 'Launch Release', icon: Rocket },
  { id: 'qa7', label: 'Change Feature Flag', icon: ToggleRight },
  { id: 'qa8', label: 'Run Data Export', icon: Database },
  { id: 'qa9', label: 'Assign Dev Task', icon: Code2 },
  { id: 'qa10', label: 'Broadcast Tenant Notice', icon: Megaphone },
];

/* ── Quick launch sections ── */
const launchSections = [
  { title: 'Tenant Control', actions: [
    { id: 'l1', label: 'Open tenant dashboard', icon: Building2 },
    { id: 'l2', label: 'Provision new school', icon: Users },
    { id: 'l3', label: 'Suspend tenant', icon: Lock },
    { id: 'l4', label: 'Configure modules', icon: Settings },
  ]},
  { title: 'Platform Operations', actions: [
    { id: 'l5', label: 'View support queue', icon: ShieldAlert },
    { id: 'l6', label: 'Declare incident', icon: Siren },
    { id: 'l7', label: 'Review data requests', icon: Database },
    { id: 'l8', label: 'Run compliance audit', icon: FileText },
  ]},
  { title: 'Billing & Commercial', actions: [
    { id: 'l9', label: 'Change tenant plan', icon: CreditCard },
    { id: 'l10', label: 'Review failed payments', icon: CreditCard },
    { id: 'l11', label: 'Generate invoice batch', icon: FileText },
    { id: 'l12', label: 'Send billing notice', icon: Megaphone },
  ]},
  { title: 'Development & Release', actions: [
    { id: 'l13', label: 'Launch release', icon: Rocket },
    { id: 'l14', label: 'Toggle feature flag', icon: ToggleRight },
    { id: 'l15', label: 'Check environment health', icon: Server },
    { id: 'l16', label: 'Assign dev task', icon: Code2 },
  ]},
  { title: 'Governance', actions: [
    { id: 'l17', label: 'Run data export', icon: Database },
    { id: 'l18', label: 'Process deletion request', icon: FileText },
    { id: 'l19', label: 'Review audit trail', icon: Search },
    { id: 'l20', label: 'Manage permissions', icon: Lock },
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

  const content = (() => {
    switch (activeSubNav) {
      case 'c_quick_actions':
        return <ConciergeQuickLaunchBoard sections={launchSections} />;
      case 'c_today':
        return <ConciergeTodayTimeline items={todayTimelineItems} />;
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
              { label: 'Open tenant control', icon: Building2 },
              { label: 'Launch release', icon: Rocket },
              { label: 'Declare incident', icon: Siren },
              { label: 'Toggle feature flag', icon: ToggleRight },
            ]}
            quickActions={quickActions}
            todayChips={todayChips}
            starterMessages={starterMessages}
            slashCommands={slashCommands}
            onSend={(t: string) => {
              const userMsg = { id: `u-${Date.now()}`, role: 'user' as const, content: t, timestamp: new Date().toISOString() };
              addMessage(userMsg);
              const history = [...messages, userMsg].map((m) => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content }));
              aiChat.mutate({ messages: history }, {
                onSuccess: (res) => {
                  addMessage({ id: `a-${Date.now()}`, role: 'assistant', content: res.text, timestamp: new Date().toISOString() });
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
