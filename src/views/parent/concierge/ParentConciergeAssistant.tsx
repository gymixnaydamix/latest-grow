/* Parent Concierge › Assistant — Chat, Quick Actions, Today, Search, History */
import { useNavigationStore } from '@/store/navigation.store';
import { useConciergeStore } from '@/store/concierge.store';
import { useAIChat } from '@/hooks/api/use-ai';
import {
  ConciergeLayout, ConciergeChatView, ConciergeSearchResultsPanel,
  ConciergeHistoryTimeline, ConciergeQuickLaunchBoard, ConciergeTodayTimeline,
} from '@/components/concierge/shared';
import {
  CreditCard, FileText, CalendarOff, Video, ClipboardList, Bus,
  Clock, MessageSquare, GraduationCap, Receipt, Wallet, Users,
  FileCheck, Send, Search, BookOpen, Bell, ShieldCheck,
} from 'lucide-react';
import type { ConciergeMessage, ConciergeContextField } from '@/store/concierge.store';
import type { TodayChip } from '@/components/concierge/shared/ConciergeTodayStrip';

/* ── Context fields ── */
const contextFields: ConciergeContextField[] = [
  { key: 'child', label: 'Child', value: 'Aarav Sharma — Grade 5', options: ['Aarav Sharma — Grade 5', 'Meera Sharma — Grade 2', 'All Children'] },
  { key: 'campus', label: 'Campus', value: 'Greenfield International School' },
  { key: 'grade', label: 'Grade', value: 'Grade 5' },
  { key: 'term', label: 'Term', value: 'Term 3 · 2025–2026' },
  { key: 'teacher', label: 'Teacher', value: 'Mrs. Priya Gupta' },
  { key: 'category', label: 'Category', value: 'All', options: ['All', 'Academic', 'Financial', 'Administrative', 'Medical'] },
];

/* ── Today chips ── */
const todayChips: TodayChip[] = [
  { id: 't1', count: 2, label: 'pending fees' },
  { id: 't2', count: 1, label: 'leave to approve' },
  { id: 't3', count: 3, label: 'messages from teacher' },
  { id: 't4', count: 1, label: 'bus arriving' },
  { id: 't5', count: 2, label: 'assignments due' },
  { id: 't6', count: 1, label: 'exam tomorrow' },
  { id: 't7', count: 1, label: 'meeting scheduled' },
];

/* ── Slash commands ── */
const slashCommands = [
  '/pay', '/leave', '/meeting', '/message', '/report',
  '/timetable', '/bus', '/fee', '/form', '/child', '/search',
];

/* ── Starter messages ── */
const starterMessages: ConciergeMessage[] = [
  {
    id: 's1', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Fee payment of ₹18,500 for Aarav\'s Term 3 tuition has been processed successfully. Receipt #GIS-2026-4421 is ready for download.',
    actionCard: {
      id: 'ac1', type: 'FeePaymentReceipt', title: 'Fee Payment — Aarav Sharma',
      status: 'confirmed', linkedEntities: [{ type: 'Student', label: 'Aarav Sharma', id: 'stu-201' }],
      fields: [
        { key: 'amount', label: 'Amount', value: '₹18,500' },
        { key: 'receipt', label: 'Receipt', value: '#GIS-2026-4421' },
        { key: 'method', label: 'Payment Method', value: 'UPI — SBI' },
      ],
      permissionChip: 'Fee Payer',
    },
  },
  {
    id: 's2', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Leave application for Meera Sharma has been drafted for March 10–12 (family function). It requires your confirmation before submission to the class teacher.',
  },
  {
    id: 's3', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Parent-teacher meeting with Mrs. Priya Gupta has been confirmed for March 8, 2:30 PM at Meeting Room A. Topic: Aarav\'s mid-term progress review.',
  },
  {
    id: 's4', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Aarav\'s Term 2 report card is now available. Class rank: 5th out of 32. Overall percentage: 87.4%. Click to view the detailed breakdown.',
  },
];

/* ── Quick actions ── */
const quickActions = [
  { id: 'qa1', label: 'Pay Fees', icon: CreditCard },
  { id: 'qa2', label: 'View Report Card', icon: FileText },
  { id: 'qa3', label: 'Request Leave', icon: CalendarOff },
  { id: 'qa4', label: 'Book Meeting', icon: Video },
  { id: 'qa5', label: 'Submit Form', icon: ClipboardList },
  { id: 'qa6', label: 'Track Bus', icon: Bus },
  { id: 'qa7', label: 'View Timetable', icon: Clock },
  { id: 'qa8', label: 'Message Teacher', icon: MessageSquare },
];

/* ── Quick launch sections ── */
const launchSections = [
  { title: 'Financial', actions: [
    { id: 'l1', label: 'Pay outstanding fees', icon: CreditCard },
    { id: 'l2', label: 'View fee breakdown', icon: Receipt },
    { id: 'l3', label: 'Download receipts', icon: FileText },
    { id: 'l4', label: 'Set up auto-pay', icon: Wallet },
  ]},
  { title: 'Academic', actions: [
    { id: 'l5', label: 'View report card', icon: GraduationCap },
    { id: 'l6', label: 'Check timetable', icon: Clock },
    { id: 'l7', label: 'View assignments', icon: BookOpen },
    { id: 'l8', label: 'Track exam schedule', icon: ClipboardList },
  ]},
  { title: 'Communication', actions: [
    { id: 'l9', label: 'Message class teacher', icon: Send },
    { id: 'l10', label: 'View school notices', icon: Bell },
    { id: 'l11', label: 'Book parent-teacher meeting', icon: Video },
    { id: 'l12', label: 'Search messages', icon: Search },
  ]},
  { title: 'Administrative', actions: [
    { id: 'l13', label: 'Apply for leave', icon: CalendarOff },
    { id: 'l14', label: 'Submit permission slip', icon: FileCheck },
    { id: 'l15', label: 'Update child profile', icon: Users },
    { id: 'l16', label: 'View privacy settings', icon: ShieldCheck },
  ]},
];

/* ── Today timeline items ── */
const todayTimelineItems = [
  { id: 'tt1', time: '06:45', title: 'School bus pickup — Aarav', entity: 'Stop #14, Sector 21', priority: 'medium' as const, actions: ['Track Bus', 'View Route'] },
  { id: 'tt2', time: '07:00', title: 'School bus pickup — Meera', entity: 'Stop #14, Sector 21', priority: 'medium' as const, actions: ['Track Bus', 'View Route'] },
  { id: 'tt3', time: '08:30', title: 'Fee payment deadline — Aarav Term 3 tuition', entity: '₹18,500 due', priority: 'urgent' as const, actions: ['Pay Now', 'View Details'] },
  { id: 'tt4', time: '09:00', title: 'Assignment due — Aarav Science Project', entity: 'Mrs. Priya Gupta', priority: 'high' as const, actions: ['View Details'] },
  { id: 'tt5', time: '10:00', title: 'School notice — Annual Day rehearsal schedule', entity: 'Greenfield International School', priority: 'low' as const, actions: ['Read Notice'] },
  { id: 'tt6', time: '11:30', title: 'Message from teacher — Meera\'s reading progress', entity: 'Ms. Anita Desai', priority: 'medium' as const, actions: ['View Message', 'Reply'] },
  { id: 'tt7', time: '12:00', title: 'Exam tomorrow — Aarav Mathematics Unit 5', entity: 'Chapters 8–10', priority: 'high' as const, actions: ['View Syllabus'] },
  { id: 'tt8', time: '14:30', title: 'Parent-teacher meeting — Aarav mid-term review', entity: 'Meeting Room A', priority: 'high' as const, actions: ['Join', 'Reschedule'] },
  { id: 'tt9', time: '15:00', title: 'Transport fee installment reminder', entity: '₹4,200 — due Mar 10', priority: 'medium' as const, actions: ['Pay Now', 'View Plan'] },
  { id: 'tt10', time: '15:30', title: 'School bus drop-off — Aarav & Meera', entity: 'Stop #14, Sector 21', priority: 'medium' as const, actions: ['Track Bus'] },
  { id: 'tt11', time: '18:00', title: 'Leave approval needed — Meera (Mar 10–12)', entity: 'Family function', priority: 'high' as const, actions: ['Approve', 'Edit'] },
];

export function ParentConciergeAssistant() {
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
            greeting="Good morning, Parent"
            contextSummary="Aarav (Grade 5) · Meera (Grade 2) · Greenfield International · Term 3"
            suggestions={[
              { label: 'Pay fees', icon: CreditCard },
              { label: 'View report card', icon: FileText },
              { label: 'Request leave', icon: CalendarOff },
              { label: 'Message teacher', icon: MessageSquare },
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
