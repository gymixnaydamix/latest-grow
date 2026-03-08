/* ─── Support Module — Help center, tickets, FAQs ─────────────── */
import { useState } from 'react';
import {
  HelpCircle, Search, Send, ChevronDown, ChevronRight,
  BookOpen, MessageSquare, FileText, Zap, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmitTeacherTicket } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import { useNavigationStore } from '@/store/navigation.store';
import { TeacherSectionShell, GlassCard } from './shared';
import type { TeacherSectionProps } from './shared';

export function SupportSection(_props: TeacherSectionProps) {
  const { activeHeader } = useNavigationStore();

  switch (activeHeader) {
    case 'submit_ticket':
      return <SubmitTicketView />;
    case 'help_center':
    default:
      return <HelpCenterView />;
  }
}

/* ─── Help Center ─────────────────────────────────────────── */
function HelpCenterView() {
  const { setHeader, setSection } = useNavigationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const quickLinks = [
    { id: 'getting-started', icon: <BookOpen className="size-5" />, label: 'Getting Started Guide', desc: 'First steps as a teacher on the platform', color: '#818cf8', action: 'guide' as const },
    { id: 'shortcuts', icon: <Zap className="size-5" />, label: 'Keyboard Shortcuts', desc: 'Speed up your workflow with shortcuts', color: '#fbbf24', action: 'guide' as const },
    { id: 'gradebook', icon: <FileText className="size-5" />, label: 'Gradebook Manual', desc: 'Complete guide to grading features', color: '#34d399', action: 'navigate' as const, section: 'gradebook', header: 'grade_entry' },
    { id: 'messaging', icon: <MessageSquare className="size-5" />, label: 'Communication Guide', desc: 'Best practices for parent & student messaging', color: '#f472b6', action: 'navigate' as const, section: 'messages', header: 'inbox' },
  ];

  const guideContent: Record<string, { title: string; sections: { heading: string; body: string }[] }> = {
    'getting-started': {
      title: 'Getting Started Guide',
      sections: [
        { heading: '1. Set Up Your Profile', body: 'Go to Profile & Settings to update your bio, subject areas, phone number, and upload a professional avatar. This info is visible to parents and administrators.' },
        { heading: '2. Review Your Schedule', body: 'Visit the Today section each morning for your daily timeline, action items, grading queue, and student alerts. Use the quick-link buttons at the bottom to jump to any module.' },
        { heading: '3. Take Attendance', body: 'Use the Attendance module\'s Take Attendance view. Select your class, click status buttons next to each student (Present, Late, Absent, Excused), then submit. Use the "All Present" button for quick bulk marking.' },
        { heading: '4. Manage Assignments', body: 'Create assignments in the Assignments module. Set the class, type, due date, and point value. Students will see assignments in their portal. Grade submissions from the Submissions view.' },
        { heading: '5. Communicate Effectively', body: 'Use the Messages module to send individual messages to parents, students, and staff. Use Announcements for class-wide communications. Schedule parent conferences through the Meetings module.' },
      ],
    },
    'shortcuts': {
      title: 'Keyboard Shortcuts',
      sections: [
        { heading: 'Attendance Shortcuts', body: 'P = Present, A = Absent, L = Late, E = Excused. Use Arrow keys (↑↓) to navigate between students. Tab to move between columns.' },
        { heading: 'Gradebook Shortcuts', body: 'Tab = Next cell, Shift+Tab = Previous cell, Enter = Save and move down, Escape = Cancel edit. Use number keys to quickly enter scores.' },
        { heading: 'Navigation Shortcuts', body: 'Use the sidebar to switch between modules. Within each module, use the sub-navigation tabs to switch between views (e.g., Lesson Calendar vs My Lessons).' },
        { heading: 'General Shortcuts', body: 'Ctrl+S = Save (in any form), Escape = Cancel/Close current overlay. Use the search bars in each module for quick filtering.' },
      ],
    },
  };

  const faqs = [
    { id: 'faq1', question: 'How do I take attendance for multiple classes quickly?', answer: 'Use the Attendance module\'s Take Attendance view. Select your class, then use keyboard shortcuts: P (Present), A (Absent), L (Late), E (Excused). Arrow keys navigate between students. Click "All Present" for quick bulk marking.' },
    { id: 'faq2', question: 'Can I import grades from an external spreadsheet?', answer: 'Currently, grades should be entered directly in the Gradebook module\'s Grade Entry view. Select your class, and you\'ll see a spreadsheet-style matrix. CSV import is planned for the next update.' },
    { id: 'faq3', question: 'How do I schedule a parent conference?', answer: 'Go to Meetings → Schedule Meeting. Select "Parent Conference" as the type, search for the parent, set the date/time and location, and add any agenda notes. The parent will receive an automatic notification.' },
    { id: 'faq4', question: 'What do the student alert colors mean?', answer: 'Red (high severity) = immediate attention needed (failing grades, chronic absence). Amber (medium) = monitoring required (grade decline, IEP updates). Blue (info) = positive updates (achievements, perfect attendance).' },
    { id: 'faq5', question: 'How do I create and assign homework?', answer: 'Go to Assignments → Create New. Fill in the title, select the class, set the type (homework/quiz/test/project), due date, and total points. After creation, the assignment is automatically visible to all enrolled students.' },
    { id: 'faq6', question: 'Where can I see my teaching schedule for the week?', answer: 'Go to My Classes → My Timetable for a full weekly view. The Today section also shows your daily timeline with all classes, meetings, and prep periods.' },
  ];

  const filteredFaqs = searchQuery
    ? faqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    : faqs;

  return (
    <TeacherSectionShell title="Help Center" description="Guides, FAQs, and support resources">
      {/* Search */}
      <div className="relative" data-animate>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/50" />
        <input
          type="text"
          placeholder="Search help articles, FAQs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-border/60 bg-card/80 pl-12 pr-4 py-3.5 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:border-indigo-500/30 focus:outline-none"
        />
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {quickLinks.map(link => (
          <GlassCard
            key={link.label}
            className="cursor-pointer hover:border-border/80 transition-all hover:scale-[1.01] group"
            onClick={() => {
              if (link.action === 'navigate' && 'section' in link) {
                setSection(link.section);
                if ('header' in link) setHeader(link.header);
                notifySuccess(`Opening ${link.label}`, link.desc);
              } else {
                setActiveGuide(activeGuide === link.id ? null : link.id);
              }
            }}
          >
            <div className="size-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
              {link.icon}
            </div>
            <h4 className="text-sm font-semibold text-foreground/80 mb-1 group-hover:text-foreground flex items-center gap-1.5">
              {link.label}
              {link.action === 'navigate' ? (
                <ExternalLink className="size-3 text-muted-foreground/50" />
              ) : (
                <ChevronRight className={`size-3 text-muted-foreground/50 transition-transform ${activeGuide === link.id ? 'rotate-90' : ''}`} />
              )}
            </h4>
            <p className="text-[11px] text-muted-foreground/70">{link.desc}</p>
          </GlassCard>
        ))}
      </div>

      {/* Inline Guide Content */}
      {activeGuide && guideContent[activeGuide] && (
        <GlassCard data-animate>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground/80">{guideContent[activeGuide].title}</h3>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveGuide(null)}>
              Close
            </Button>
          </div>
          <div className="space-y-4">
            {guideContent[activeGuide].sections.map((s, i) => (
              <div key={i} className="rounded-lg border border-border/40 bg-card/60 p-3.5">
                <h4 className="text-xs font-semibold text-foreground/70 mb-1.5">{s.heading}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* FAQs */}
      <div data-animate>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {filteredFaqs.map(faq => (
            <div key={faq.id} className="rounded-xl border border-border/50 bg-card/60 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <span className="text-sm font-medium text-foreground/70">{faq.question}</span>
                {expandedFaq === faq.id
                  ? <ChevronDown className="size-4 text-muted-foreground/70 shrink-0" />
                  : <ChevronRight className="size-4 text-muted-foreground/70 shrink-0" />
                }
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border/40 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact support */}
      <GlassCard className="text-center" data-animate>
        <HelpCircle className="size-8 text-indigo-400 mx-auto mb-3" />
        <h4 className="text-sm font-semibold text-foreground/70 mb-1">Still need help?</h4>
        <p className="text-xs text-muted-foreground/70 mb-4">Our support team typically responds within 24 hours.</p>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => setHeader('submit_ticket')}>
          <Send className="size-4 mr-2" /> Submit a Support Ticket
        </Button>
      </GlassCard>
    </TeacherSectionShell>
  );
}

/* ─── Submit Ticket ───────────────────────────────────────── */
function SubmitTicketView() {
  const { setHeader } = useNavigationStore();
  const submitTicketMut = useSubmitTeacherTicket();
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('SUP-2026-0000');
  const [form, setForm] = useState({ subject: '', category: 'technical', priority: 'medium', description: '' });

  if (submitted) {
    return (
      <TeacherSectionShell title="Ticket Submitted" description="We've received your support request">
        <GlassCard className="text-center py-12">
          <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground/80 mb-2">Support Ticket Created</h3>
          <p className="text-sm text-muted-foreground mb-1">Ticket #{ticketId}</p>
          <p className="text-xs text-muted-foreground/60 mb-4">You'll receive a confirmation email shortly. Expected response time: 24 hours.</p>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setHeader('help_center')}>
            ← Back to Help Center
          </Button>
        </GlassCard>
      </TeacherSectionShell>
    );
  }

  return (
    <TeacherSectionShell title="Submit Support Ticket" description="Describe your issue and we'll help you resolve it">
      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground w-fit" onClick={() => setHeader('help_center')}>
        ← Back to Help Center
      </Button>
      <GlassCard data-animate>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Brief description of your issue..."
              className="w-full rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:border-indigo-500/30 focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 text-sm text-foreground/80 focus:border-indigo-500/30 focus:outline-none"
              >
                <option value="technical">Technical Issue</option>
                <option value="gradebook">Gradebook</option>
                <option value="attendance">Attendance</option>
                <option value="account">Account & Profile</option>
                <option value="feature">Feature Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-xl border border-border/60 bg-card/80 px-4 py-2.5 text-sm text-foreground/80 focus:border-indigo-500/30 focus:outline-none"
              >
                <option value="low">Low — General question</option>
                <option value="medium">Medium — Affecting workflow</option>
                <option value="high">High — Blocking my work</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={6}
              placeholder="Describe the issue in detail. Include steps to reproduce if applicable..."
              className="w-full rounded-xl border border-border/60 bg-card/80 px-4 py-3 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:border-indigo-500/30 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6"
              disabled={!form.subject.trim() || !form.description.trim()}
              onClick={() => submitTicketMut.mutate(
                { subject: form.subject, category: form.category, description: form.description, priority: form.priority },
                { onSuccess: (res: any) => {
                  const id = res?.data?.ticketId ?? res?.ticketId ?? `SUP-${Date.now().toString(36).toUpperCase()}`;
                  setTicketId(id);
                  notifySuccess('Ticket submitted', 'Support team will respond shortly');
                  setSubmitted(true);
                } }
              )}
            >
              <Send className="size-4 mr-2" /> Submit Ticket
            </Button>
          </div>
        </div>
      </GlassCard>
    </TeacherSectionShell>
  );
}
