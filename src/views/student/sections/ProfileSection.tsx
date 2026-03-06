/* ─── ProfileSection ─── Student profile & settings ──────────────────
 * Personal info, avatar, contact, account settings, notification prefs
 * ─────────────────────────────────────────────────────────────────────── */
import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Shield, Bell,
  Palette, Globe, Lock, Camera, School, BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useStudentStore } from '@/store/student-data.store';
import { notifySuccess } from '@/lib/notify';

type ProfileTab = 'profile' | 'account' | 'notifications' | 'appearance';

export function ProfileSection() {
  const authStore = useAuthStore();
  const [tab, setTab] = useState<ProfileTab>('profile');

  const user = authStore.user;
  const studentName = user ? `${user.firstName} ${user.lastName}` : 'Alex Johnson';

  const tabs: { id: ProfileTab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white/90">Profile & Settings</h2>
        <p className="text-sm text-white/40">Manage your profile and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 space-y-1">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm transition-all text-left',
                  tab === t.id ? 'bg-white/8 text-white/85' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]',
                )}>
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          {tab === 'profile' && <ProfileView name={studentName} />}
          {tab === 'account' && <AccountView />}
          {tab === 'notifications' && <NotificationsView />}
          {tab === 'appearance' && <AppearanceView />}
        </div>
      </div>
    </div>
  );
}

/* ── Profile ── */
function ProfileView({ name }: { name: string }) {
  return (
    <div className="space-y-5">
      {/* Avatar & name */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardContent className="flex items-center gap-5 py-5">
          <div className="relative">
            <div className="size-20 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-2xl font-bold text-white/50">
              {name.split(' ').map(n => n[0]).join('')}
            </div>
            <button className="absolute bottom-0 right-0 size-7 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() => { useStudentStore.getState().updateAvatar('new-avatar.jpg'); notifySuccess('Avatar', 'Profile picture updated'); }}>
              <Camera className="size-3 text-white/60" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white/90">{name}</h3>
            <p className="text-sm text-white/40">Student · Grade 10 · Section A</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[9px] text-indigo-400 border-indigo-500/20 bg-indigo-500/10">Active</Badge>
              <Badge variant="outline" className="text-[9px] text-white/35 border-white/10">ID: STU-2024-0847</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-white/70">Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FieldRow icon={User} label="Full Name" value={name} />
          <FieldRow icon={Calendar} label="Date of Birth" value="March 15, 2009" />
          <FieldRow icon={Mail} label="Email" value="alex.johnson@school.edu" />
          <FieldRow icon={Phone} label="Phone" value="+1 (555) 123-4567" />
          <FieldRow icon={MapPin} label="Address" value="123 Maple Street, Springfield, IL 62704" />
          <FieldRow icon={Globe} label="Nationality" value="United States" />
        </CardContent>
      </Card>

      {/* Academic Info */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-white/70">Academic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FieldRow icon={School} label="School" value="Springfield International Academy" />
          <FieldRow icon={BookOpen} label="Grade / Year" value="Grade 10 · Academic Year 2024–2025" />
          <FieldRow icon={User} label="Class Teacher" value="Mrs. Patricia Wells" />
          <FieldRow icon={User} label="Section" value="10-A" />
          <FieldRow icon={Calendar} label="Enrollment Date" value="September 1, 2020" />
        </CardContent>
      </Card>

      {/* Guardian Info */}
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-white/70">Guardian Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <FieldRow icon={User} label="Guardian" value="Robert & Linda Johnson" />
          <FieldRow icon={Phone} label="Guardian Phone" value="+1 (555) 987-6543" />
          <FieldRow icon={Mail} label="Guardian Email" value="r.johnson@email.com" />
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Account ── */
function AccountView() {
  return (
    <div className="space-y-5">
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/70">Security</CardTitle>
          <CardDescription className="text-[11px] text-white/35">Manage your password and login settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3"><Lock className="size-4 text-white/30" /><span className="text-sm text-white/60">Password</span></div>
            <Button size="sm" variant="outline" className="text-xs border-white/10 text-white/50"
              onClick={() => { useStudentStore.getState().changePassword('old', 'new'); notifySuccess('Password', 'Password changed successfully'); }}>Change Password</Button>
          </div>
          <Separator className="bg-white/5" />
          <div className="flex items-center justify-between py-2">
            <div><span className="text-sm text-white/60">Two-Factor Authentication</span><p className="text-[10px] text-white/30">Add an extra layer of security</p></div>
            <Badge variant="outline" className="text-[9px] text-amber-400 border-amber-500/20">Not enabled</Badge>
          </div>
          <Separator className="bg-white/5" />
          <div className="flex items-center justify-between py-2">
            <div><span className="text-sm text-white/60">Login History</span><p className="text-[10px] text-white/30">Last login: Today at 8:15 AM</p></div>
            <Button size="sm" variant="ghost" className="text-xs text-white/40"
              onClick={() => notifySuccess('Login History', 'Showing recent sessions')}>View History</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-white/70">Language & Region</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3"><Globe className="size-4 text-white/30" /><span className="text-sm text-white/60">Language</span></div>
            <span className="text-sm text-white/50">English (US)</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3"><Calendar className="size-4 text-white/30" /><span className="text-sm text-white/60">Timezone</span></div>
            <span className="text-sm text-white/50">America/Chicago (CST)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Notifications ── */
function NotificationsView() {
  const [prefs, setPrefs] = useState({
    email_assignments: true,
    email_grades: true,
    email_announcements: false,
    push_messages: true,
    push_exams: true,
    push_fees: true,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const items: { key: keyof typeof prefs; label: string; desc: string; group: string }[] = [
    { key: 'email_assignments', label: 'Assignment Reminders', desc: 'Email when new assignments are posted or due soon', group: 'Email Notifications' },
    { key: 'email_grades', label: 'Grade Updates', desc: 'Email when a grade or feedback is posted', group: 'Email Notifications' },
    { key: 'email_announcements', label: 'Announcements', desc: 'Receive school announcements via email', group: 'Email Notifications' },
    { key: 'push_messages', label: 'New Messages', desc: 'Push notification for new messages', group: 'Push Notifications' },
    { key: 'push_exams', label: 'Exam Reminders', desc: 'Push notification before upcoming exams', group: 'Push Notifications' },
    { key: 'push_fees', label: 'Fee Reminders', desc: 'Notify when fees are due or overdue', group: 'Push Notifications' },
  ];

  const groups = ['Email Notifications', 'Push Notifications'];

  return (
    <div className="space-y-5">
      {groups.map(g => (
        <Card key={g} className="border-white/8 bg-white/[0.02]">
          <CardHeader className="pb-3"><CardTitle className="text-sm text-white/70">{g}</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {items.filter(i => i.group === g).map(item => (
              <div key={item.key} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm text-white/60">{item.label}</p>
                  <p className="text-[10px] text-white/30">{item.desc}</p>
                </div>
                <button onClick={() => toggle(item.key)}
                  className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                    prefs[item.key] ? 'bg-indigo-500' : 'bg-white/10',
                  )}>
                  <span className={cn('inline-block size-3.5 rounded-full bg-white transition-transform',
                    prefs[item.key] ? 'translate-x-[18px]' : 'translate-x-[3px]',
                  )} />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ── Appearance ── */
function AppearanceView() {
  const [theme, setTheme] = useState('dark');
  const [fontSize, setFontSize] = useState('default');

  return (
    <div className="space-y-5">
      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-white/70">Theme</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {[
              { id: 'dark', label: 'Dark', color: 'bg-zinc-900 border-white/20' },
              { id: 'light', label: 'Light', color: 'bg-white border-gray-300' },
              { id: 'system', label: 'System', color: 'bg-gradient-to-r from-zinc-900 to-white border-white/20' },
            ].map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)}
                className={cn('flex flex-col items-center gap-2 rounded-xl border p-3 transition-all w-24',
                  theme === t.id ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/8 hover:border-white/15',
                )}>
                <div className={cn('size-10 rounded-lg border', t.color)} />
                <span className={cn('text-xs', theme === t.id ? 'text-indigo-400' : 'text-white/40')}>{t.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/8 bg-white/[0.02]">
        <CardHeader className="pb-3"><CardTitle className="text-sm text-white/70">Font Size</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {['small', 'default', 'large'].map(s => (
              <Button key={s} size="sm" variant={fontSize === s ? 'default' : 'outline'}
                onClick={() => setFontSize(s)}
                className={cn('text-xs capitalize', fontSize !== s && 'border-white/10 text-white/40')}>
                {s}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Helper ── */
function FieldRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Icon className="size-4 text-white/25 mt-0.5" />
      <div className="flex-1">
        <p className="text-[10px] text-white/35">{label}</p>
        <p className="text-sm text-white/65">{value}</p>
      </div>
    </div>
  );
}
