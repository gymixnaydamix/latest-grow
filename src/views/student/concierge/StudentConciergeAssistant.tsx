/* Student Concierge › Assistant — Chat, Quick Actions, Today, Search, History */
import { useNavigationStore } from '@/store/navigation.store';
import { useConciergeStore } from '@/store/concierge.store';
import { useAIChat } from '@/hooks/api/use-ai';
import { useStudentMyDay as _useStudentMyDay } from '@/hooks/api/use-student';
import {
  ConciergeLayout, ConciergeChatView, ConciergeSearchResultsPanel,
  ConciergeHistoryTimeline, ConciergeQuickLaunchBoard, ConciergeTodayTimeline,
} from '@/components/concierge/shared';
import {
  CalendarDays, BookOpen, FileText, Upload, CalendarOff, MessageSquare,
  Library, Clock, GraduationCap, FlaskConical, Pencil, Users,
  Calendar, BarChart3, Trophy, Notebook,
} from 'lucide-react';
import type { ConciergeMessage, ConciergeContextField } from '@/store/concierge.store';
import type { TodayChip } from '@/components/concierge/shared/ConciergeTodayStrip';

/* ── Context fields ── */
const contextFields: ConciergeContextField[] = [
  { key: 'campus', label: 'Campus', value: 'Greenwood Public School' },
  { key: 'grade', label: 'Grade / Section', value: 'Class 9-B' },
  { key: 'subject', label: 'Subject', value: 'All Subjects' },
  { key: 'term', label: 'Term', value: 'Term 2 · 2025–2026' },
  { key: 'teacher', label: 'Teacher', value: '' },
  { key: 'category', label: 'Category', value: 'Academic', options: ['Academic', 'Extracurricular', 'Administrative'] },
];

/* ── Today chips ── */
const FALLBACK_TODAY_CHIPS: TodayChip[] = [
  { id: 't1', count: 6, label: 'classes today' },
  { id: 't2', count: 3, label: 'homework due' },
  { id: 't3', count: 2, label: 'exams this week' },
  { id: 't4', count: 1, label: 'assignment to submit' },
  { id: 't5', count: 4, label: 'new grades posted' },
  { id: 't6', count: 1, label: 'library book due' },
  { id: 't7', count: 2, label: 'club activities' },
];

/* ── Slash commands ── */
const FALLBACK_SLASH_CMDS = [
  '/homework', '/grade', '/timetable', '/submit', '/leave',
  '/message', '/library', '/exam', '/study', '/club', '/search',
];

/* ── Starter messages ── */
const starterMessages: ConciergeMessage[] = [
  {
    id: 's1', role: 'assistant', timestamp: new Date().toISOString(),
    content: 'Welcome! I\'m your Student AI Assistant. Ask me about homework, timetable, grades, submissions, or anything related to your school day.',
  },
];

/* ── Quick actions ── */
const quickActions = [
  { id: 'qa1', label: 'View Timetable', icon: CalendarDays },
  { id: 'qa2', label: 'Check Homework', icon: BookOpen },
  { id: 'qa3', label: 'View Grades', icon: BarChart3 },
  { id: 'qa4', label: 'Submit Assignment', icon: Upload },
  { id: 'qa5', label: 'Request Leave', icon: CalendarOff },
  { id: 'qa6', label: 'Message Teacher', icon: MessageSquare },
  { id: 'qa7', label: 'View Library', icon: Library },
  { id: 'qa8', label: 'Study Planner', icon: Clock },
];

/* ── Quick launch sections ── */
const launchSections = [
  { title: 'Academic', actions: [
    { id: 'l1', label: 'View today\'s timetable', icon: CalendarDays },
    { id: 'l2', label: 'Check upcoming exams', icon: GraduationCap },
    { id: 'l3', label: 'Open study planner', icon: Clock },
    { id: 'l4', label: 'View grade report', icon: BarChart3 },
  ]},
  { title: 'Homework & Assignments', actions: [
    { id: 'l5', label: 'Check pending homework', icon: BookOpen },
    { id: 'l6', label: 'Submit assignment', icon: Upload },
    { id: 'l7', label: 'View submitted work', icon: FileText },
    { id: 'l8', label: 'Download worksheets', icon: Notebook },
  ]},
  { title: 'Communication', actions: [
    { id: 'l9', label: 'Message a teacher', icon: MessageSquare },
    { id: 'l10', label: 'View class notices', icon: Pencil },
    { id: 'l11', label: 'Join study group', icon: Users },
    { id: 'l12', label: 'Request leave application', icon: CalendarOff },
  ]},
  { title: 'Extracurricular', actions: [
    { id: 'l13', label: 'View club activities', icon: Trophy },
    { id: 'l14', label: 'Library catalogue', icon: Library },
    { id: 'l15', label: 'Lab schedule', icon: FlaskConical },
    { id: 'l16', label: 'Sports calendar', icon: Calendar },
  ]},
];

/* ── Today timeline items ── */
const todayTimelineItems = [
  { id: 'tt1', time: '07:30', title: 'School bus pickup — Stop #14 Nehru Nagar', entity: 'Transport', priority: 'medium' as const, actions: ['Track Bus'] },
  { id: 'tt2', time: '08:00', title: 'Assembly — Morning prayer & announcements', entity: 'Ground Floor Hall', priority: 'low' as const, actions: [] },
  { id: 'tt3', time: '08:30', title: 'Mathematics — Chapter 7: Triangles', entity: 'Room 9B · Mr. Raghav Iyer', priority: 'medium' as const, actions: ['Open Notes', 'View Homework'] },
  { id: 'tt4', time: '09:20', title: 'English — Essay Writing: Descriptive', entity: 'Room 9B · Mrs. Priya Sharma', priority: 'medium' as const, actions: ['Open Notes'] },
  { id: 'tt5', time: '10:10', title: 'Hindi — Premchand: Idgah', entity: 'Room 9B · Mrs. Sunita Verma', priority: 'medium' as const, actions: ['Open Notes'] },
  { id: 'tt6', time: '11:00', title: 'Short Break — Canteen / Playground', entity: 'Campus', priority: 'low' as const, actions: [] },
  { id: 'tt7', time: '11:20', title: 'Science — Lab: Reflection of Light', entity: 'Physics Lab · Dr. Anand Kumar', priority: 'high' as const, actions: ['View Lab Manual', 'Check Safety Rules'] },
  { id: 'tt8', time: '12:10', title: 'Lunch Break', entity: 'Canteen', priority: 'low' as const, actions: [] },
  { id: 'tt9', time: '12:50', title: 'Social Studies — French Revolution', entity: 'Room 9B · Mr. Vikram Singh', priority: 'medium' as const, actions: ['Open Notes'] },
  { id: 'tt10', time: '13:40', title: 'Computer Science — Python: Loops', entity: 'Computer Lab · Ms. Deepa Nair', priority: 'medium' as const, actions: ['Open IDE', 'View Assignment'] },
  { id: 'tt11', time: '14:30', title: 'Games / PT — Football practice', entity: 'Ground · Coach Suresh', priority: 'low' as const, actions: [] },
  { id: 'tt12', time: '15:15', title: 'Homework deadline: Maths Ex. 7.3', entity: 'Submit to Mr. Iyer', priority: 'urgent' as const, actions: ['Submit', 'Request Extension'] },
  { id: 'tt13', time: '15:30', title: 'School bus departure — Route 14', entity: 'Transport', priority: 'medium' as const, actions: ['Track Bus'] },
];

export function StudentConciergeAssistant() {
  const { activeSubNav } = useNavigationStore();
  const { messages, addMessage, history } = useConciergeStore();
  const aiChat = useAIChat();

  const systemPrompt = {
    role: 'system' as const,
    content: 'You are an AI assistant for a student in a school management platform (GrowYourNeed). Help with homework questions, timetable lookups, study tips, grades, and school activities. Be friendly, encouraging, and age-appropriate. If you don\'t know something specific, say so.',
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
            greeting="Good morning, Student"
            contextSummary="Class 9-B · All Subjects · Term 2 · 6 classes today"
            suggestions={[
              { label: 'Check homework', icon: BookOpen },
              { label: 'View grades', icon: BarChart3 },
              { label: 'Today\'s timetable', icon: CalendarDays },
              { label: 'Submit assignment', icon: Upload },
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
