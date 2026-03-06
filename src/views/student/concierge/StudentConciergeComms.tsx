/* Student Concierge › Comms — Teacher Messages, Class Notices, Study Groups, Announcements, Feedback, Sent */
import { useNavigationStore } from '@/store/navigation.store';
import { cn } from '@/lib/utils';
import { Send, Pin, Users, Megaphone, Clock, BookOpen } from 'lucide-react';

/* ── Teacher messages ── */
const teacherMessages = [
  { id: 'tm1', teacher: 'Mr. Raghav Iyer', subject: 'Mathematics', lastMessage: 'Good work on the triangles assignment, Aarav. Try the bonus questions too.', date: 'Today', unread: true },
  { id: 'tm2', teacher: 'Mrs. Priya Sharma', subject: 'English', lastMessage: 'Your essay draft has been reviewed. Please check the feedback and revise.', date: 'Today', unread: true },
  { id: 'tm3', teacher: 'Dr. Anand Kumar', subject: 'Science', lastMessage: 'Reminder: Bring your lab manual for tomorrow\'s viva. Review ray diagrams.', date: 'Yesterday', unread: false },
  { id: 'tm4', teacher: 'Mrs. Sunita Verma', subject: 'Hindi', lastMessage: 'Unit test syllabus: Idgah, Namak ka Daroga, Grammar Units 3–4. Prepare well!', date: 'Yesterday', unread: false },
  { id: 'tm5', teacher: 'Mr. Vikram Singh', subject: 'Social Studies', lastMessage: 'The French Revolution essay deadline is extended to March 8. Use proper references.', date: 'Mar 4', unread: false },
  { id: 'tm6', teacher: 'Ms. Deepa Nair', subject: 'Computer Science', lastMessage: 'Submit your Python programs in .py format, not screenshots. Re-upload if needed.', date: 'Mar 3', unread: false },
];

/* ── Class notices ── */
const classNotices = [
  { id: 'cn1', title: 'Annual Day Rehearsal — March 15', from: 'Class Teacher — Mrs. Meena Gupta', date: 'Today', pinned: true, content: 'All students participating in the Annual Day programme must attend rehearsal on March 15 during 6th and 7th periods. Bring your costumes.' },
  { id: 'cn2', title: 'Library Book Return Reminder', from: 'School Library', date: 'Today', pinned: true, content: 'All overdue library books must be returned by March 10. Fine of ₹5/day applies after due date.' },
  { id: 'cn3', title: 'PTM Scheduled — March 20', from: 'Principal\'s Office', date: 'Yesterday', pinned: false, content: 'Parent-Teacher Meeting for Class 9 will be held on March 20, 10:00 AM – 1:00 PM. Inform your parents.' },
  { id: 'cn4', title: 'Science Lab Safety Drill', from: 'Dr. Anand Kumar', date: 'Mar 4', pinned: false, content: 'Fire safety drill in the Science Lab on March 7. All students must attend the briefing during Science period.' },
  { id: 'cn5', title: 'Sports Day Registration Open', from: 'PE Department', date: 'Mar 3', pinned: false, content: 'Register for Sports Day events (March 28) at the PE office. Last date: March 12. Events: 100m, 200m, long jump, shot put, relay.' },
];

/* ── Study groups ── */
const studyGroups = [
  { id: 'sg1', name: 'Maths Wizards — 9B', subject: 'Mathematics', members: 6, lastActive: 'Today', lastMessage: 'Anyone solved Q.15 from Ex 7.3? I\'m getting a different answer.', myRole: 'Member' },
  { id: 'sg2', name: 'Science Project Team', subject: 'Science', members: 4, lastActive: 'Today', lastMessage: 'Meeting at library after school for solar system model work.', myRole: 'Leader' },
  { id: 'sg3', name: 'English Essay Club', subject: 'English', members: 5, lastActive: 'Yesterday', lastMessage: 'Shared some sample essays for descriptive writing practice.', myRole: 'Member' },
  { id: 'sg4', name: 'Hindi Revision Group', subject: 'Hindi', members: 8, lastActive: 'Yesterday', lastMessage: 'Created flashcards for Premchand story characters. Check the shared folder.', myRole: 'Member' },
  { id: 'sg5', name: 'Code Club 9B', subject: 'Computer Science', members: 5, lastActive: 'Mar 4', lastMessage: 'Who wants to pair-program the quiz app this weekend?', myRole: 'Co-leader' },
];

/* ── Announcements ── */
const announcements = [
  { id: 'a1', title: 'Term 2 Exam Schedule Released', from: 'Examination Cell', date: 'Today', audience: 'All Class 9 Students', content: 'Term 2 exams begin March 25. Detailed timetable available in the Exams section.' },
  { id: 'a2', title: 'Inter-House Quiz Competition', from: 'Academic Council', date: 'Yesterday', audience: 'All Students', content: 'Inter-house quiz on March 18. Each house to nominate 3 students per grade. Contact your house captain.' },
  { id: 'a3', title: 'Summer Internship Programme', from: 'Career Guidance Cell', date: 'Mar 4', audience: 'Classes 9–12', content: 'Applications open for summer coding bootcamp with TechXcel. Limited seats. Apply by March 15.' },
  { id: 'a4', title: 'School Magazine Submissions', from: 'Editorial Board', date: 'Mar 3', audience: 'All Students', content: 'Submit articles, poems, artwork for the annual magazine "Udaan". Deadline: March 25. Drop at Room 105.' },
];

/* ── Sent messages ── */
const sentMessages = [
  { id: 'sm1', to: 'Mr. Raghav Iyer', subject: 'Doubt in Ex. 7.3 Q.12', date: 'Today', status: 'Delivered' },
  { id: 'sm2', to: 'Mrs. Priya Sharma', subject: 'Essay revision submitted', date: 'Yesterday', status: 'Read' },
  { id: 'sm3', to: 'Class Teacher — Mrs. Meena Gupta', subject: 'Leave application for March 14', date: 'Mar 4', status: 'Read' },
  { id: 'sm4', to: 'Dr. Anand Kumar', subject: 'Lab report query — diagram format', date: 'Mar 3', status: 'Replied' },
  { id: 'sm5', to: 'Ms. Deepa Nair', subject: 'Python program re-upload in .py format', date: 'Mar 3', status: 'Read' },
];

const subjectColors: Record<string, string> = {
  'Mathematics': 'bg-blue-500/10 text-blue-600',
  'Science': 'bg-emerald-500/10 text-emerald-600',
  'English': 'bg-purple-500/10 text-purple-600',
  'Hindi': 'bg-orange-500/10 text-orange-600',
  'Social Studies': 'bg-amber-500/10 text-amber-600',
  'Computer Science': 'bg-cyan-500/10 text-cyan-600',
};

export function StudentConciergeComms() {
  const { activeSubNav } = useNavigationStore();

  /* ── Teacher Messages (default) ── */
  if (!activeSubNav || activeSubNav === 'c_teacher_messages') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Teacher Messages</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Send className="h-3.5 w-3.5" /> New Message
          </button>
        </div>
        <div className="space-y-2">
          {teacherMessages.map((m) => (
            <div key={m.id} className={cn(
              'rounded-xl border p-3 shadow-lg backdrop-blur-xl dark:border-white/5',
              m.unread ? 'border-primary/20 bg-primary/5' : 'border-white/20 bg-white/60 dark:bg-white/5',
            )}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h5 className="text-xs font-medium text-foreground">
                    {m.teacher}
                    {m.unread && <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                  </h5>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', subjectColors[m.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>
                    {m.subject}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{m.date}</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2">{m.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Class Notices ── */
  if (activeSubNav === 'c_class_notices') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Class Notices</h3>
        <div className="space-y-2">
          {classNotices.map((n) => (
            <div key={n.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {n.pinned && <Pin className="h-3 w-3 text-amber-500" />}
                  <h5 className="text-xs font-medium text-foreground">{n.title}</h5>
                </div>
                <span className="text-[10px] text-muted-foreground">{n.date}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-1">From: {n.from}</div>
              <p className="text-[10px] text-foreground/80">{n.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Study Groups ── */
  if (activeSubNav === 'c_study_groups') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Study Groups</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <Users className="h-3.5 w-3.5" /> Create Group
          </button>
        </div>
        <div className="space-y-2">
          {studyGroups.map((g) => (
            <div key={g.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  <h5 className="text-xs font-medium text-foreground">{g.name}</h5>
                </div>
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', g.myRole === 'Leader' || g.myRole === 'Co-leader' ? 'bg-amber-500/10 text-amber-600' : 'bg-zinc-500/10 text-zinc-500')}>
                  {g.myRole}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1">
                <span className={cn('rounded-full px-2 py-0.5 font-medium', subjectColors[g.subject] ?? 'bg-zinc-500/10 text-zinc-500')}>{g.subject}</span>
                <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" /> {g.members} members</span>
                <span className="inline-flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {g.lastActive}</span>
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-1 italic">"{g.lastMessage}"</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="rounded-lg bg-primary px-3 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90">Open Chat</button>
                <button className="rounded-lg border border-border/50 px-3 py-1 text-[10px] font-medium text-foreground hover:bg-muted/60">View Files</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Announcements ── */
  if (activeSubNav === 'c_announcements') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">School Announcements</h3>
        <div className="space-y-2">
          {announcements.map((a) => (
            <div key={a.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{a.title}</h5>
                <span className="text-[10px] text-muted-foreground">{a.date}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1">
                <span className="inline-flex items-center gap-0.5"><Megaphone className="h-2.5 w-2.5" /> {a.from}</span>
                <span className="inline-flex items-center gap-0.5"><Users className="h-2.5 w-2.5" /> {a.audience}</span>
              </div>
              <p className="text-[10px] text-foreground/80">{a.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Feedback ── */
  if (activeSubNav === 'c_feedback') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Submit Feedback</h3>
        <p className="text-xs text-muted-foreground">Share your thoughts with your teachers — all feedback is constructive and respectful</p>

        <div className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5 space-y-3">
          <div>
            <label className="text-[10px] font-medium text-foreground">Select Teacher</label>
            <select className="mt-1 w-full rounded-lg border border-border/30 bg-background/70 px-3 py-2 text-xs text-foreground dark:border-white/10">
              <option>Mr. Raghav Iyer — Mathematics</option>
              <option>Mrs. Priya Sharma — English</option>
              <option>Dr. Anand Kumar — Science</option>
              <option>Mrs. Sunita Verma — Hindi</option>
              <option>Mr. Vikram Singh — Social Studies</option>
              <option>Ms. Deepa Nair — Computer Science</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-foreground">Category</label>
            <select className="mt-1 w-full rounded-lg border border-border/30 bg-background/70 px-3 py-2 text-xs text-foreground dark:border-white/10">
              <option>Teaching Pace</option>
              <option>Homework Load</option>
              <option>Classroom Experience</option>
              <option>Study Materials</option>
              <option>General Suggestion</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-medium text-foreground">Your Feedback</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-border/30 bg-background/70 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground dark:border-white/10"
              rows={4}
              placeholder="Write your feedback here... Be specific and constructive."
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="anon" className="rounded border-border/50" />
            <label htmlFor="anon" className="text-[10px] text-muted-foreground">Submit anonymously</label>
          </div>
          <button className="w-full rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            Submit Feedback
          </button>
        </div>
      </div>
    );
  }

  /* ── Sent ── */
  if (activeSubNav === 'c_sent') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Sent Messages</h3>
        <div className="space-y-2">
          {sentMessages.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/20 bg-white/60 p-3 shadow-lg backdrop-blur-xl dark:bg-white/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <h5 className="text-xs font-medium text-foreground">{m.subject}</h5>
                <span className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-medium',
                  m.status === 'Replied' ? 'bg-emerald-500/10 text-emerald-600'
                    : m.status === 'Read' ? 'bg-blue-500/10 text-blue-600'
                    : 'bg-zinc-500/10 text-zinc-500',
                )}>{m.status}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5"><Send className="h-2.5 w-2.5" /> To: {m.to}</span>
                <span>{m.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
