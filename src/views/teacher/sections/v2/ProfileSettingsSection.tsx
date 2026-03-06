/* ─── Profile & Settings Section ──────────────────────────────────
 * Routes: my_profile (default) | preferences | notification_settings
 * ──────────────────────────────────────────────────────────────────── */
import { useState } from 'react';
import {
  Bell, BellRing, Camera, Check, Globe, GraduationCap,
  Mail, Moon, Monitor, Palette, Save, Settings,
  Shield, Smartphone, User, Volume2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useUpdateTeacherProfile, useUpdateTeacherAvatar, useSaveTeacherPreferences } from '@/hooks/api/use-teacher';
import { notifySuccess } from '@/lib/notify';
import {
  TeacherSectionShell, GlassCard, StatusBadge,
} from './shared';
import type { TeacherSectionProps } from './shared';

/* ── Default profile data (fallback) ── */
const defaultProfile = {
  firstName: 'Sarah',
  lastName: 'Chen',
  email: 'sarah.chen@lincolnacademy.edu',
  role: 'TEACHER',
  bio: 'Mathematics and Physics teacher with 8 years of experience. Passionate about making abstract concepts tangible through hands-on activities and technology integration.',
  phone: '(555) 324-7891',
  subjectAreas: ['Mathematics', 'Physics', 'AP Calculus'],
  classroom: 'Room 204',
  department: 'Mathematics',
  yearsExperience: 8,
  certifications: ['State Teaching License — Mathematics', 'AP Calculus Certified', 'Physics Endorsement'],
};

/* ── Notification matrix types ── */
interface NotifSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

const defaultNotifications: NotifSetting[] = [
  { id: 'new_message', label: 'New Message', description: 'When you receive a new message from parents, students, or staff', email: true, push: true, inApp: true },
  { id: 'assignment_submitted', label: 'Assignment Submitted', description: 'When a student submits an assignment for grading', email: false, push: true, inApp: true },
  { id: 'attendance_alert', label: 'Attendance Alert', description: 'When students are marked absent or have attendance concerns', email: true, push: true, inApp: true },
  { id: 'announcement', label: 'Announcement', description: 'School-wide or department announcements', email: true, push: false, inApp: true },
  { id: 'meeting_reminder', label: 'Meeting Reminder', description: 'Reminders for upcoming meetings and conferences', email: true, push: true, inApp: true },
  { id: 'grade_alert', label: 'Grade Alert', description: 'When a student\'s grade drops significantly', email: true, push: true, inApp: true },
  { id: 'behavior_note', label: 'Behavior Follow-up', description: 'Updates on behavior notes requiring follow-up', email: false, push: true, inApp: true },
];

export function ProfileSettingsSection(_props: TeacherSectionProps) {
  const { activeHeader } = useNavigationStore();
  const header = activeHeader || 'my_profile';
  const { user } = useAuthStore();
  const updateProfileMut = useUpdateTeacherProfile();
  const updateAvatarMut = useUpdateTeacherAvatar();
  const savePreferencesMut = useSaveTeacherPreferences();

  /* ── Profile form state ── */
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(defaultProfile.bio);
  const [phone, setPhone] = useState(defaultProfile.phone);
  const [subjectAreas, setSubjectAreas] = useState(defaultProfile.subjectAreas.join(', '));

  /* ── Preferences state ── */
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [language, setLanguage] = useState('en');

  /* ── Notification state ── */
  const [notifications, setNotifications] = useState<NotifSetting[]>(defaultNotifications);

  const firstName = user?.firstName ?? defaultProfile.firstName;
  const lastName = user?.lastName ?? defaultProfile.lastName;
  const email = user?.email ?? defaultProfile.email;
  const initials = `${firstName[0]}${lastName[0]}`;

  const toggleNotif = (id: string, channel: 'email' | 'push' | 'inApp') => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, [channel]: !n[channel] } : n),
    );
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    updateProfileMut.mutate({ bio, phone, subjectAreas: subjectAreas.split(',').map(s => s.trim()).filter(Boolean) }, { onSuccess: () => notifySuccess('Profile updated', 'Your profile has been saved') });
  };

  return (
    <TeacherSectionShell
      title="Profile & Settings"
      description={`${firstName} ${lastName} · ${defaultProfile.department} Department`}
    >
      {/* ── MY PROFILE VIEW ── */}
      {header === 'my_profile' && (
        <div className="space-y-4" data-animate>
          {/* Profile Header Card */}
          <GlassCard>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="size-20 border-2 border-indigo-500/30">
                  <AvatarFallback className="text-2xl font-bold bg-indigo-500/15 text-indigo-300">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => { updateAvatarMut.mutate(new FormData(), { onSuccess: () => notifySuccess('Avatar updated', 'Profile picture updated') }); }}
                >
                  <Camera className="size-5 text-white/70" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white/90">{firstName} {lastName}</h3>
                  <StatusBadge status={defaultProfile.role} tone="info" />
                </div>
                <p className="text-sm text-white/40 mb-1">{email}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {defaultProfile.subjectAreas.map(s => (
                    <Badge key={s} variant="outline" className="text-[10px] border-indigo-500/25 text-indigo-300/70">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Edit Button */}
              <Button
                size="sm"
                className={`gap-1.5 ${isEditing
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30'
                }`}
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              >
                {isEditing ? <><Check className="size-3.5" /> Save</> : <><Settings className="size-3.5" /> Edit Profile</>}
              </Button>
            </div>
          </GlassCard>

          {/* Profile Details */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left: Details */}
            <GlassCard>
              <h4 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <User className="size-4 text-indigo-400" /> Personal Information
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">First Name</p>
                    <p className="text-sm text-white/70">{firstName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Last Name</p>
                    <p className="text-sm text-white/70">{lastName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm text-white/70">{email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Phone</p>
                  {isEditing ? (
                    <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-white/3 border-white/8 text-white/80" />
                  ) : (
                    <p className="text-sm text-white/70">{phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Department</p>
                  <p className="text-sm text-white/70">{defaultProfile.department}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">Classroom</p>
                  <p className="text-sm text-white/70">{defaultProfile.classroom}</p>
                </div>
              </div>
            </GlassCard>

            {/* Right: Bio + Certs */}
            <div className="space-y-4">
              <GlassCard>
                <h4 className="text-sm font-semibold text-white/70 mb-3">Bio</h4>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    className="bg-white/3 border-white/8 text-white/80 resize-none"
                  />
                ) : (
                  <p className="text-sm text-white/55 leading-relaxed">{bio}</p>
                )}
              </GlassCard>

              <GlassCard>
                <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                  <Shield className="size-4 text-emerald-400" /> Subject Areas
                </h4>
                {isEditing ? (
                  <Input
                    value={subjectAreas}
                    onChange={e => setSubjectAreas(e.target.value)}
                    placeholder="Comma-separated subjects"
                    className="bg-white/3 border-white/8 text-white/80 placeholder:text-white/25"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {defaultProfile.subjectAreas.map(s => (
                      <Badge key={s} variant="outline" className="text-[10px] border-indigo-500/25 text-indigo-300/70">{s}</Badge>
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard>
                <h4 className="text-sm font-semibold text-white/70 mb-3 flex items-center gap-2">
                  <GraduationCap className="size-4 text-amber-400" /> Certifications
                </h4>
                <div className="space-y-2">
                  {defaultProfile.certifications.map(cert => (
                    <div key={cert} className="flex items-center gap-2 text-xs text-white/50">
                      <Check className="size-3.5 text-emerald-400/70 shrink-0" />
                      {cert}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* ── PREFERENCES VIEW ── */}
      {header === 'preferences' && (
        <div className="space-y-4" data-animate>
          {/* Appearance */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Palette className="size-4 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white/70">Appearance</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Moon className="size-4 text-indigo-400" />
                  <div>
                    <p className="text-sm text-white/70">Dark Mode</p>
                    <p className="text-[11px] text-white/30">Use dark theme across the portal</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Monitor className="size-4 text-sky-400" />
                  <div>
                    <p className="text-sm text-white/70">Compact View</p>
                    <p className="text-[11px] text-white/30">Reduce spacing and show more content</p>
                  </div>
                </div>
                <Switch checked={compactView} onCheckedChange={setCompactView} />
              </div>
            </div>
          </GlassCard>

          {/* Accessibility */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-4 text-emerald-400" />
              <h4 className="text-sm font-semibold text-white/70">Accessibility</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="size-4 text-amber-400" />
                  <div>
                    <p className="text-sm text-white/70">High Contrast</p>
                    <p className="text-[11px] text-white/30">Increase contrast for better visibility</p>
                  </div>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Settings className="size-4 text-pink-400" />
                  <div>
                    <p className="text-sm text-white/70">Reduced Motion</p>
                    <p className="text-[11px] text-white/30">Minimize animations and transitions</p>
                  </div>
                </div>
                <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
              </div>
            </div>
          </GlassCard>

          {/* Language */}
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="size-4 text-cyan-400" />
              <h4 className="text-sm font-semibold text-white/70">Language</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { code: 'en', label: 'English' },
                { code: 'es', label: 'Español' },
                { code: 'fr', label: 'Français' },
                { code: 'zh', label: '中文' },
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                    language === lang.code
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-white/2 text-white/40 border-white/6 hover:bg-white/4'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── NOTIFICATION SETTINGS VIEW ── */}
      {header === 'notification_settings' && (
        <div className="space-y-4" data-animate>
          <GlassCard className="py-3! flex items-center gap-3">
            <BellRing className="size-5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold text-white/70">Notification Preferences</h4>
              <p className="text-[11px] text-white/30">Control how you receive notifications for each event type</p>
            </div>
          </GlassCard>

          {/* Matrix Header */}
          <GlassCard className="p-0! overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/6">
              <div className="col-span-6">
                <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wide">Event Type</span>
              </div>
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Mail className="size-3.5 text-white/30" />
                  <span className="text-[9px] text-white/25">Email</span>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Smartphone className="size-3.5 text-white/30" />
                  <span className="text-[9px] text-white/25">Push</span>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Bell className="size-3.5 text-white/30" />
                  <span className="text-[9px] text-white/25">In-App</span>
                </div>
              </div>
            </div>

            {/* Rows */}
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-white/4 items-center hover:bg-white/2 transition-colors"
              >
                <div className="col-span-6">
                  <p className="text-sm text-white/65">{notif.label}</p>
                  <p className="text-[10px] text-white/25">{notif.description}</p>
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={notif.email}
                    onCheckedChange={() => toggleNotif(notif.id, 'email')}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={notif.push}
                    onCheckedChange={() => toggleNotif(notif.id, 'push')}
                  />
                </div>
                <div className="col-span-2 flex justify-center">
                  <Switch
                    checked={notif.inApp}
                    onCheckedChange={() => toggleNotif(notif.id, 'inApp')}
                  />
                </div>
              </div>
            ))}
          </GlassCard>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              size="sm"
              className="gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30"
              onClick={() => { savePreferencesMut.mutate({ darkMode, compactView, highContrast, reducedMotion, language, notifications }, { onSuccess: () => notifySuccess('Preferences saved', 'Your preferences have been updated') }); }}
            >
              <Save className="size-3.5" /> Save Preferences
            </Button>
          </div>
        </div>
      )}
    </TeacherSectionShell>
  );
}
