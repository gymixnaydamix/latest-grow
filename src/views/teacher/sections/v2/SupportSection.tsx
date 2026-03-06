/* ─── Support Module — Help center, tickets, FAQs ─────────────── */
import { useState } from 'react';
import {
  HelpCircle, Search, Send, ChevronDown, ChevronRight,
  BookOpen, MessageSquare, FileText, Zap, CheckCircle2,
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
  const { setHeader } = useNavigationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const quickLinks = [
    { icon: <BookOpen className="size-5" />, label: 'Getting Started Guide', desc: 'First steps as a teacher on the platform', color: '#818cf8' },
    { icon: <Zap className="size-5" />, label: 'Keyboard Shortcuts', desc: 'Speed up your workflow with shortcuts', color: '#fbbf24' },
    { icon: <FileText className="size-5" />, label: 'Gradebook Manual', desc: 'Complete guide to grading features', color: '#34d399' },
    { icon: <MessageSquare className="size-5" />, label: 'Communication Guide', desc: 'Best practices for parent & student messaging', color: '#f472b6' },
  ];

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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-white/20" />
        <input
          type="text"
          placeholder="Search help articles, FAQs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-white/8 bg-white/3 pl-12 pr-4 py-3.5 text-sm text-white/80 placeholder:text-white/20 focus:border-indigo-500/30 focus:outline-none"
        />
      </div>

      {/* Quick Links */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {quickLinks.map(link => (
          <GlassCard key={link.label} className="cursor-pointer hover:border-white/12 transition-all hover:scale-[1.01] group" onClick={() => notifySuccess(link.label, link.desc)}>
            <div className="size-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${link.color}15`, color: link.color }}>
              {link.icon}
            </div>
            <h4 className="text-sm font-semibold text-white/80 mb-1 group-hover:text-white">{link.label}</h4>
            <p className="text-[11px] text-white/30">{link.desc}</p>
          </GlassCard>
        ))}
      </div>

      {/* FAQs */}
      <div data-animate>
        <h3 className="text-sm font-semibold text-white/60 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-2">
          {filteredFaqs.map(faq => (
            <div key={faq.id} className="rounded-xl border border-white/6 bg-white/2 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              >
                <span className="text-sm font-medium text-white/70">{faq.question}</span>
                {expandedFaq === faq.id
                  ? <ChevronDown className="size-4 text-white/30 shrink-0" />
                  : <ChevronRight className="size-4 text-white/30 shrink-0" />
                }
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-4 text-sm text-white/40 border-t border-white/5 pt-3">
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
        <h4 className="text-sm font-semibold text-white/70 mb-1">Still need help?</h4>
        <p className="text-xs text-white/30 mb-4">Our support team typically responds within 24 hours.</p>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={() => setHeader('submit_ticket')}>
          <Send className="size-4 mr-2" /> Submit a Support Ticket
        </Button>
      </GlassCard>
    </TeacherSectionShell>
  );
}

/* ─── Submit Ticket ───────────────────────────────────────── */
function SubmitTicketView() {
  const submitTicketMut = useSubmitTeacherTicket();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ subject: '', category: 'technical', priority: 'medium', description: '' });

  if (submitted) {
    return (
      <TeacherSectionShell title="Ticket Submitted" description="We've received your support request">
        <GlassCard className="text-center py-12">
          <CheckCircle2 className="size-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white/80 mb-2">Support Ticket Created</h3>
          <p className="text-sm text-white/40 mb-1">Ticket #SUP-2026-0847</p>
          <p className="text-xs text-white/25">You'll receive a confirmation email shortly. Expected response time: 24 hours.</p>
        </GlassCard>
      </TeacherSectionShell>
    );
  }

  return (
    <TeacherSectionShell title="Submit Support Ticket" description="Describe your issue and we'll help you resolve it">
      <GlassCard data-animate>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              placeholder="Brief description of your issue..."
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:border-indigo-500/30 focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Category</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white/80 focus:border-indigo-500/30 focus:outline-none"
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
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-2.5 text-sm text-white/80 focus:border-indigo-500/30 focus:outline-none"
              >
                <option value="low">Low — General question</option>
                <option value="medium">Medium — Affecting workflow</option>
                <option value="high">High — Blocking my work</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={6}
              placeholder="Describe the issue in detail. Include steps to reproduce if applicable..."
              className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:border-indigo-500/30 focus:outline-none resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6"
              disabled={!form.subject.trim() || !form.description.trim()}
              onClick={() => submitTicketMut.mutate(
                { subject: form.subject, category: form.category, description: form.description, priority: form.priority },
                { onSuccess: () => { notifySuccess('Ticket submitted', 'Support team will respond shortly'); setSubmitted(true); } }
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
