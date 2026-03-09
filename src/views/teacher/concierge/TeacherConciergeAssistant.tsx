/* Teacher Concierge › Assistant — Chat, Quick Actions, Today, Search, History */
import { useNavigationStore } from '@/store/navigation.store';
import { useConciergeStore } from '@/store/concierge.store';
import { useAIChat } from '@/hooks/api/use-ai';
import {
  ConciergeLayout, ConciergeChatView, ConciergeSearchResultsPanel,
  ConciergeHistoryTimeline, ConciergeQuickLaunchBoard, ConciergeTodayTimeline,
} from '@/components/concierge/shared';
import {
  ClipboardCheck, BookOpen, FileEdit, Send, UserMinus, AlertTriangle,
  FileBarChart, CalendarClock, BarChart3, MessageSquare,
  Calendar, Layers, Clipboard, PenTool, Users, FolderOpen,
} from 'lucide-react';
import type { ConciergeMessage, ConciergeContextField } from '@/store/concierge.store';
import type { TodayChip } from '@/components/concierge/shared/ConciergeTodayStrip';

/* ── Context fields ── */
const contextFields: ConciergeContextField[] = [
  { key: 'campus', label: 'Campus', value: 'Main Campus' },
  { key: 'class', label: 'Class / Section', value: 'Grade 5A' },
  { key: 'subject', label: 'Subject', value: 'Mathematics' },
  { key: 'term', label: 'Term', value: 'Term 3 · 2025–2026' },
  { key: 'student', label: 'Student', value: '' },
  { key: 'week', label: 'Week', value: 'Week 24 (Jun 9–13)' },
];

/* ── Today chips ── */
const todayChips: TodayChip[] = [
  { id: 't1', count: 6, label: 'classes today' },
  { id: 't2', count: 12, label: 'assignments due' },
  { id: 't3', count: 3, label: 'parent messages' },
  { id: 't4', count: 2, label: 'behaviour flags' },
  { id: 't5', count: 1, label: 'meeting' },
  { id: 't6', count: 4, label: 'pending grades' },
  { id: 't7', count: 2, label: 'substitution requests' },
];

/* ── Slash commands ── */
const slashCommands = [
  '/attendance', '/grade', '/assign', '/report', '/parent',
  '/behaviour', '/substitute', '/timetable', '/exam', '/resource',
  '/meeting', '/search',
];

/* ── Starter messages ── */
const starterMessages: ConciergeMessage[] = [
  {
    id: 's1', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Welcome! I\'m your Teacher AI Assistant. Ask me about attendance, grading, assignments, lesson planning, parent communication, or classroom management.',
  },
];

/* ── Quick actions ── */
const quickActions = [
  { id: 'qa1', label: 'Mark Attendance', icon: ClipboardCheck },
  { id: 'qa2', label: 'Enter Grades', icon: PenTool },
  { id: 'qa3', label: 'Create Assignment', icon: FileEdit },
  { id: 'qa4', label: 'Send Parent Note', icon: Send },
  { id: 'qa5', label: 'Request Substitute', icon: UserMinus },
  { id: 'qa6', label: 'Log Behaviour Incident', icon: AlertTriangle },
  { id: 'qa7', label: 'Generate Report Card', icon: FileBarChart },
  { id: 'qa8', label: 'Schedule Parent Meeting', icon: CalendarClock },
];

/* ── Quick launch sections ── */
const launchSections = [
  { title: 'Classroom', actions: [
    { id: 'l1', label: 'Mark today\u2019s attendance', icon: ClipboardCheck },
    { id: 'l2', label: 'View my timetable', icon: Calendar },
    { id: 'l3', label: 'Open lesson plan', icon: BookOpen },
    { id: 'l4', label: 'Log behaviour incident', icon: AlertTriangle },
  ]},
  { title: 'Assessment', actions: [
    { id: 'l5', label: 'Enter quiz grades', icon: PenTool },
    { id: 'l6', label: 'Create new assignment', icon: FileEdit },
    { id: 'l7', label: 'Generate report card', icon: FileBarChart },
    { id: 'l8', label: 'View grade analytics', icon: BarChart3 },
  ]},
  { title: 'Communication', actions: [
    { id: 'l9', label: 'Message a parent', icon: Send },
    { id: 'l10', label: 'Post class announcement', icon: MessageSquare },
    { id: 'l11', label: 'Schedule parent meeting', icon: CalendarClock },
    { id: 'l12', label: 'Use message template', icon: Layers },
  ]},
  { title: 'Administration', actions: [
    { id: 'l13', label: 'Request substitute cover', icon: UserMinus },
    { id: 'l14', label: 'Submit resource request', icon: FolderOpen },
    { id: 'l15', label: 'View student roster', icon: Users },
    { id: 'l16', label: 'Download class report', icon: Clipboard },
  ]},
];

/* ── Today timeline items ── */
const todayTimelineItems = [
  { id: 'tt1', time: '07:45', title: 'Homeroom — Grade 5A', entity: 'Room 204', priority: 'medium' as const, actions: ['Mark Attendance', 'View Roster'] },
  { id: 'tt2', time: '08:00', title: 'Mathematics — Grade 5A', entity: 'Room 204', priority: 'medium' as const, actions: ['Open Lesson', 'Assign Work'] },
  { id: 'tt3', time: '09:00', title: 'Mathematics — Grade 5B', entity: 'Room 206', priority: 'medium' as const, actions: ['Open Lesson', 'Assign Work'] },
  { id: 'tt4', time: '10:00', title: 'Break', entity: 'Staffroom', priority: 'low' as const, actions: [] },
  { id: 'tt5', time: '10:30', title: 'Science — Grade 4C', entity: 'Lab 2', priority: 'medium' as const, actions: ['Open Lesson', 'Lab Safety Check'] },
  { id: 'tt6', time: '11:30', title: 'Grade 5A assignment deadline: Fractions Set 2', entity: 'Submissions', priority: 'high' as const, actions: ['Review', 'Extend Deadline'] },
  { id: 'tt7', time: '12:00', title: 'Lunch break', entity: 'Staffroom', priority: 'low' as const, actions: [] },
  { id: 'tt8', time: '13:00', title: 'Mathematics — Grade 6A', entity: 'Room 301', priority: 'medium' as const, actions: ['Open Lesson', 'Assign Work'] },
  { id: 'tt9', time: '14:00', title: 'Parent meeting — Mrs. Al-Farsi', entity: 'Meeting Room B', priority: 'high' as const, actions: ['Join', 'Reschedule'] },
  { id: 'tt10', time: '15:00', title: 'Grade entry deadline: Unit 5 Quiz', entity: 'Grade Book', priority: 'urgent' as const, actions: ['Enter Grades', 'Request Extension'] },
  { id: 'tt11', time: '15:30', title: 'Department meeting — Mathematics', entity: 'Conference Room', priority: 'medium' as const, actions: ['Join', 'View Agenda'] },
];

export function TeacherConciergeAssistant() {
  const { activeSubNav } = useNavigationStore();
  const { messages, addMessage, history } = useConciergeStore();
  const aiChat = useAIChat();

  const systemPrompt = {
    role: 'system' as const,
    content: 'You are an AI assistant for a teacher in a school management platform (GrowYourNeed). Help with attendance, grading, creating assignments, lesson plans, parent communication, and classroom management. Be professional and supportive. If you don\'t know something specific, say so.',
  };

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
            greeting="Good morning, Teacher"
            contextSummary="Grade 5A · Mathematics · Term 3 · 6 classes today"
            suggestions={[
              { label: 'Mark attendance', icon: ClipboardCheck },
              { label: 'Enter grades', icon: PenTool },
              { label: 'Create assignment', icon: FileEdit },
              { label: 'Message parent', icon: Send },
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
