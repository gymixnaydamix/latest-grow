/* Admin Concierge › Assistant — Chat, Quick Actions, Today, Search, History */
import { useNavigationStore } from '@/store/navigation.store';
import { useConciergeStore } from '@/store/concierge.store';
import { useAIChat } from '@/hooks/api/use-ai';
import {
  ConciergeLayout, ConciergeChatView, ConciergeSearchResultsPanel,
  ConciergeHistoryTimeline, ConciergeQuickLaunchBoard, ConciergeTodayTimeline,
} from '@/components/concierge/shared';
import {
  Megaphone, FileText, CheckSquare, Calendar, ClipboardList,
  CreditCard, AlertTriangle, ListTodo, Send, MessageSquare, FilePlus,
} from 'lucide-react';
import type { ConciergeMessage, ConciergeContextField } from '@/store/concierge.store';
import type { TodayChip } from '@/components/concierge/shared/ConciergeTodayStrip';

/* ── Context fields ── */
const contextFields: ConciergeContextField[] = [
  { key: 'campus', label: 'Campus', value: 'Main Campus' },
  { key: 'year', label: 'Year', value: '2025–2026' },
  { key: 'grade', label: 'Grade', value: '' },
  { key: 'student', label: 'Student', value: '' },
  { key: 'staff', label: 'Staff', value: '' },
];

/* ── Today chips ── */
const FALLBACK_TODAY_CHIPS: TodayChip[] = [
  { id: 't1', count: 6, label: 'Approvals waiting' },
  { id: 't2', count: 4, label: 'Urgent requests' },
  { id: 't3', count: 3, label: 'Meetings today' },
  { id: 't4', count: 8, label: 'Overdue invoices to follow up' },
  { id: 't5', count: 2, label: 'Timetable conflicts' },
  { id: 't6', count: 5, label: 'Document requests pending' },
];

/* ── Slash commands ── */
const FALLBACK_SLASH_CMDS = ['/announce', '/doc', '/approve', '/meeting', '/request', '/task', '/search', '/student', '/invoice'];

/* ── Starter messages ── */
const starterMessages: ConciergeMessage[] = [
  {
    id: 's1', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Welcome! I\'m your Admin AI Assistant. Ask me about approvals, announcements, certificates, meetings, fee followups, or any school administration task.',
  },
];

/* ── Quick actions ── */
const quickActions = [
  { id: 'qa1', label: 'Create Announcement', icon: Megaphone },
  { id: 'qa2', label: 'Generate Certificate', icon: FileText },
  { id: 'qa3', label: 'Review Approvals', icon: CheckSquare },
  { id: 'qa4', label: 'Schedule Meeting', icon: Calendar },
  { id: 'qa5', label: 'Create Request', icon: ClipboardList },
  { id: 'qa6', label: 'Follow Up Fees', icon: CreditCard },
  { id: 'qa7', label: 'Resolve Exception', icon: AlertTriangle },
  { id: 'qa8', label: 'Assign Task', icon: ListTodo },
];

/* ── Quick launch sections ── */
const launchSections = [
  { title: 'Communication', actions: [
    { id: 'l1', label: 'Create announcement', icon: Megaphone },
    { id: 'l2', label: 'Broadcast reminder', icon: Send },
    { id: 'l3', label: 'Send targeted message', icon: MessageSquare },
    { id: 'l4', label: 'Use template', icon: FileText },
  ]},
  { title: 'Documents', actions: [
    { id: 'l5', label: 'Generate certificate', icon: FileText },
    { id: 'l6', label: 'Generate fee statement', icon: CreditCard },
    { id: 'l7', label: 'Reissue receipt', icon: FilePlus },
    { id: 'l8', label: 'Open template library', icon: FileText },
  ]},
  { title: 'Approvals', actions: [
    { id: 'l9', label: 'Review admissions', icon: CheckSquare },
    { id: 'l10', label: 'Review discounts', icon: CheckSquare },
    { id: 'l11', label: 'Review refunds', icon: CheckSquare },
    { id: 'l12', label: 'Review attendance corrections', icon: CheckSquare },
  ]},
  { title: 'Operations', actions: [
    { id: 'l13', label: 'Create internal request', icon: ClipboardList },
    { id: 'l14', label: 'Assign task', icon: ListTodo },
    { id: 'l15', label: 'Schedule meeting', icon: Calendar },
    { id: 'l16', label: 'Resolve exception', icon: AlertTriangle },
  ]},
];

/* ── Today timeline items ── */
const todayTimelineItems = [
  { id: 'tt1', time: '08:30', title: 'Review 3 admission applications', entity: 'Admissions Queue', priority: 'high' as const, actions: ['Review', 'Approve'] },
  { id: 'tt2', time: '09:00', title: 'Parent-teacher meeting – Grade 5A', entity: 'Room 201', priority: 'medium' as const, actions: ['Join', 'Reschedule'] },
  { id: 'tt3', time: '10:00', title: '4 request tickets needing action', entity: 'Support Queue', priority: 'high' as const, actions: ['Open', 'Assign'] },
  { id: 'tt4', time: '11:00', title: 'Announcement to Grade 8 parents scheduled', entity: 'Comms Queue', priority: 'medium' as const, actions: ['Preview', 'Cancel'] },
  { id: 'tt5', time: '14:00', title: '2 document requests pending generation', entity: 'Document Queue', priority: 'low' as const, actions: ['Generate', 'Delegate'] },
  { id: 'tt6', time: '15:30', title: 'Discount approval escalation from finance', entity: 'Finance', priority: 'urgent' as const, actions: ['Review', 'Escalate'] },
];

export function AdminConciergeAssistant() {
  const { activeSubNav } = useNavigationStore();
  const { messages, addMessage, history } = useConciergeStore();
  const aiChat = useAIChat();

  const systemPrompt = {
    role: 'system' as const,
    content: 'You are an AI assistant for a school administrator in a school management platform (GrowYourNeed). Help with approvals, announcements, certificates, scheduling, fee management, student records, and operational tasks. Be professional and efficient. If you don\'t know something specific, say so.',
  };

  const todayChips = FALLBACK_TODAY_CHIPS;
  const slashCommands = FALLBACK_SLASH_CMDS;

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
            greeting="Good morning, Admin"
            contextSummary="Main Campus · 2025–2026 · 6 items need attention"
            suggestions={[
              { label: 'Create announcement', icon: Megaphone },
              { label: 'Generate document', icon: FileText },
              { label: 'Review approvals', icon: CheckSquare },
              { label: 'Schedule meeting', icon: Calendar },
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
                ...[...messages, userMsg].map((m) => ({ role: m.role === 'user' ? 'user' as const : 'assistant' as const, content: m.content })),
              ];
              aiChat.mutate({ messages: chatHistory }, {
                onSuccess: (res) => {
                  addMessage({ id: `a-${Date.now()}`, role: 'assistant', content: res.text || 'No response from AI.', timestamp: new Date().toISOString() });
                },
                onError: (err) => {
                  addMessage({ id: `e-${Date.now()}`, role: 'assistant', content: `Error: ${err.message ?? 'Failed to get AI response.'}`, timestamp: new Date().toISOString() });
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
