/* Parent Concierge › Settings — Preferences, Notification Rules, Child Profiles, Payment Methods, Privacy, Language */
import { useNavigationStore } from '@/store/navigation.store';
import { User, CreditCard, Shield, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Child profiles ── */
const childProfiles = [
  {
    id: 'cp1', name: 'Aarav Sharma', grade: 'Grade 5', section: 'Section A', rollNo: 'GIS-2025-0514',
    classTeacher: 'Mrs. Priya Gupta', house: 'Blue House', dob: 'Aug 15, 2015',
    bloodGroup: 'B+', allergies: 'None', medicalNotes: 'Wears glasses — front-row seating recommended',
    photo: null, activities: ['Cricket', 'Swimming', 'Robotics Club'],
  },
  {
    id: 'cp2', name: 'Meera Sharma', grade: 'Grade 2', section: 'Section B', rollNo: 'GIS-2025-0221',
    classTeacher: 'Ms. Anita Desai', house: 'Green House', dob: 'Mar 22, 2018',
    bloodGroup: 'A+', allergies: 'Peanut allergy', medicalNotes: 'EpiPen kept in school medical room. Carries inhaler for mild asthma.',
    photo: null, activities: ['Art Club', 'Choir', 'Gymnastics'],
  },
];

/* ── Payment methods ── */
const paymentMethods = [
  { id: 'pm1', type: 'UPI', detail: 'sharma.rajesh@sbi', isPrimary: true, added: 'Jan 5, 2025' },
  { id: 'pm2', type: 'Net Banking', detail: 'HDFC Bank — ****6789', isPrimary: false, added: 'Apr 1, 2025' },
  { id: 'pm3', type: 'Credit Card', detail: 'ICICI Visa — ****4321', isPrimary: false, added: 'Sep 15, 2025' },
  { id: 'pm4', type: 'Debit Card', detail: 'Axis Bank — ****8765', isPrimary: false, added: 'Jun 20, 2025' },
];

/* ── Languages ── */
const languages = [
  { code: 'en', name: 'English', active: true },
  { code: 'hi', name: 'हिन्दी (Hindi)', active: false },
  { code: 'mr', name: 'मराठी (Marathi)', active: false },
  { code: 'ta', name: 'தமிழ் (Tamil)', active: false },
  { code: 'te', name: 'తెలుగు (Telugu)', active: false },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)', active: false },
];

export function ParentConciergeSettings() {
  const { activeSubNav } = useNavigationStore();

  /* ── Preferences (default) ── */
  if (!activeSubNav || activeSubNav === 'c_preferences') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Preferences</h3>
        <p className="text-xs text-muted-foreground">Customize your parent portal experience</p>
        <div className="space-y-2">
          {[
            { label: 'Show today strip on launch', enabled: true },
            { label: 'Enable quick action suggestions', enabled: true },
            { label: 'Auto-download payment receipts', enabled: false },
            { label: 'Group messages by child', enabled: true },
            { label: 'Show fee reminders on dashboard', enabled: true },
            { label: 'Compact task card view', enabled: false },
            { label: 'Sound notifications for urgent alerts', enabled: true },
            { label: 'Dark mode', enabled: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <span className="text-xs font-medium text-foreground">{s.label}</span>
              <div className={cn('h-5 w-9 rounded-full relative transition', s.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', s.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Notification Rules ── */
  if (activeSubNav === 'c_notification_rules') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Notification Rules</h3>
        <p className="text-xs text-muted-foreground">Choose what you want to be alerted about</p>
        <div className="space-y-2">
          {[
            { label: 'Attendance marked (absent/late)', channel: 'Push + In-App', enabled: true },
            { label: 'New grade or report card available', channel: 'Push + Email', enabled: true },
            { label: 'Fee payment due reminder', channel: 'Push + Email + SMS', enabled: true },
            { label: 'School bus tracking updates', channel: 'Push', enabled: true },
            { label: 'Teacher message received', channel: 'Push + In-App', enabled: true },
            { label: 'School notice published', channel: 'In-App', enabled: true },
            { label: 'Emergency alerts', channel: 'Push + SMS + Email', enabled: true },
            { label: 'Assignment due reminder', channel: 'In-App', enabled: false },
            { label: 'Event updates', channel: 'In-App + Email', enabled: false },
            { label: 'Form submission deadlines', channel: 'Push', enabled: true },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <span className="text-xs font-medium text-foreground">{n.label}</span>
                <p className="text-[10px] text-muted-foreground">{n.channel}</p>
              </div>
              <div className={cn('h-5 w-9 rounded-full relative transition', n.enabled ? 'bg-primary/80' : 'bg-muted')}>
                <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', n.enabled ? 'right-0.5' : 'left-0.5')} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Child Profiles ── */
  if (activeSubNav === 'c_child_profiles') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Child Profiles</h3>
        <div className="space-y-3">
          {childProfiles.map((c) => (
            <div key={c.id} className="rounded-xl border border-border/30 bg-background/70 p-4 dark:border-white/5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-foreground">{c.name}</h5>
                    <button className="text-[10px] font-medium text-primary hover:underline">Edit</button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{c.grade} · {c.section} · Roll: {c.rollNo}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] mb-3">
                <div className="text-muted-foreground">Class Teacher: <span className="text-foreground font-medium">{c.classTeacher}</span></div>
                <div className="text-muted-foreground">House: <span className="text-foreground font-medium">{c.house}</span></div>
                <div className="text-muted-foreground">DOB: <span className="text-foreground font-medium">{c.dob}</span></div>
                <div className="text-muted-foreground">Blood Group: <span className="text-foreground font-medium">{c.bloodGroup}</span></div>
                <div className="text-muted-foreground">Allergies: <span className={cn('font-medium', c.allergies === 'None' ? 'text-foreground' : 'text-red-600')}>{c.allergies}</span></div>
              </div>
              {c.medicalNotes && (
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-2 mb-3">
                  <p className="text-[10px] text-amber-700 dark:text-amber-400"><span className="font-medium">Medical Notes:</span> {c.medicalNotes}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] font-medium text-muted-foreground">Activities:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {c.activities.map((a) => (
                    <span key={a} className="rounded-lg border border-border/20 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Payment Methods ── */
  if (activeSubNav === 'c_payment_methods') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Payment Methods</h3>
          <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">
            <CreditCard className="h-3.5 w-3.5" /> Add Method
          </button>
        </div>
        <div className="space-y-2">
          {paymentMethods.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div>
                <span className="text-xs font-medium text-foreground">{m.type}</span>
                <p className="text-[10px] text-muted-foreground">{m.detail}</p>
                <p className="text-[10px] text-muted-foreground">Added: {m.added}</p>
              </div>
              <div className="flex items-center gap-2">
                {m.isPrimary ? (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Primary</span>
                ) : (
                  <button className="text-[10px] font-medium text-primary hover:underline">Set Primary</button>
                )}
                <button className="text-[10px] font-medium text-red-500 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Privacy ── */
  if (activeSubNav === 'c_privacy') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Privacy & Data Sharing</h3>
        <p className="text-xs text-muted-foreground">Control how your family's data is used</p>
        <div className="space-y-2">
          {[
            { label: 'Share child\'s photo in school publications', enabled: true, description: 'Allow photos in yearbook, website, and social media' },
            { label: 'Share academic data with third-party tutoring platforms', enabled: false, description: 'Share grades and progress with approved education partners' },
            { label: 'Enable location sharing for bus tracking', enabled: true, description: 'Track school bus location in real-time during pickup/drop' },
            { label: 'Allow teacher to share progress with other parents', enabled: false, description: 'For class ranking and comparative reports' },
            { label: 'Receive marketing communications from school partners', enabled: false, description: 'Summer camps, educational products, and enrichment programs' },
            { label: 'Share contact details with PTA members', enabled: true, description: 'Allow parent committee members to contact you' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{s.label}</span>
                <div className={cn('h-5 w-9 rounded-full relative transition', s.enabled ? 'bg-primary/80' : 'bg-muted')}>
                  <div className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', s.enabled ? 'right-0.5' : 'left-0.5')} />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{s.description}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold text-foreground">Data Protection</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Your data is protected under the Digital Personal Data Protection Act (DPDP), 2023.
            You may request a data export or account deletion at any time by contacting the school administration.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button className="rounded-lg bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary hover:bg-primary/20">Request Data Export</button>
            <button className="rounded-lg border border-red-500/30 px-3 py-1 text-[10px] font-medium text-red-600 hover:bg-red-500/10">Delete Account</button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Language ── */
  if (activeSubNav === 'c_language') {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Language Preferences</h3>
        <p className="text-xs text-muted-foreground">Choose your preferred interface language</p>
        <div className="space-y-2">
          {languages.map((l) => (
            <div key={l.code} className={cn(
              'flex items-center justify-between rounded-xl border p-3 dark:border-white/5',
              l.active ? 'border-primary/30 bg-primary/5' : 'border-border/30 bg-background/70',
            )}>
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{l.name}</span>
              </div>
              {l.active ? (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Active</span>
              ) : (
                <button className="text-[10px] font-medium text-primary hover:underline">Select</button>
              )}
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/30 bg-background/70 p-3 dark:border-white/5">
          <p className="text-[10px] text-muted-foreground">
            Communications from school (notices, alerts, messages) will be sent in the school's default language (English) regardless of your interface language setting. Teacher messages may be in any language.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
