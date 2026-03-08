/* ─── Profile & Settings Section ──────────────────────────────────
 * Routes: my_profile (default) | preferences | notification_settings
 * ──────────────────────────────────────────────────────────────────── */
import { useState, useRef } from 'react';
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
import { useUpdateTeacherProfile, useUpdateTeacherAvatar, useSaveTeacherPreferences, useTeacherProfile, useChangeTeacherPassword } from '@/hooks/api/use-teacher';
import { notifySuccess, notifyError } from '@/lib/notify';
import {
  TeacherSectionShell, GlassCard, StatusBadge,
} from './shared';
import type { TeacherSectionProps } from './shared';
import { Lock } from 'lucide-react';

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
  const changePasswordMut = useChangeTeacherPassword();
  const { data: apiProfileData } = useTeacherProfile();
  const apiProfile = (apiProfileData as any)?.data as typeof defaultProfile | undefined;
  const profile = apiProfile ?? defaultProfile;
  const avatarInputRef = useRef<HTMLInputElement>(null);

  /* ── Profile form state ── */
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio);
  const [phone, setPhone] = useState(profile.phone);
  const [subjectAreas, setSubjectAreas] = useState(profile.subjectAreas.join(', '));

  /* ── Password change state ── */
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  /* ── Preferences state ── */
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [language, setLanguage] = useState('en');

  /* ── Notification state ── */
  const [notifications, setNotifications] = useState<NotifSetting[]>(defaultNotifications);

  const firstName = user?.firstName ?? profile.firstName;
  const lastName = user?.lastName ?? profile.lastName;
  const email = user?.email ?? profile.email;
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

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    updateAvatarMut.mutate(formData, { onSuccess: () => notifySuccess('Avatar updated', 'Profile picture updated') });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      notifyError('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      notifyError('Error', 'Password must be at least 8 characters');
      return;
    }
    changePasswordMut.mutate({ currentPassword, newPassword }, {
      onSuccess: () => {
        notifySuccess('Password changed', 'Your password has been updated');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      },
    });
  };

  return (
    <TeacherSectionShell
      title="Profile & Settings"
      description={`${firstName} ${lastName} · ${profile.department} Department`}
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
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <button
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Camera className="size-5 text-foreground/70" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground">{firstName} {lastName}</h3>
                  <StatusBadge status={profile.role} tone="info" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">{email}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {profile.subjectAreas.map(s => (
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
              <h4 className="text-sm font-semibold text-foreground/70 mb-4 flex items-center gap-2">
                <User className="size-4 text-indigo-400" /> Personal Information
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1">First Name</p>
                    <p className="text-sm text-foreground/70">{firstName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1">Last Name</p>
                    <p className="text-sm text-foreground/70">{lastName}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm text-foreground/70">{email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1">Phone</p>
                  {isEditing ? (
                    <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-card/80 border-border/60 text-foreground/80" />
                  ) : (
                    <p className="text-sm text-foreground/70">{phone}</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1">Department</p>
                    <p className="text-sm text-foreground/70">{profile.department}</p>
                  </div>
                <div>
                    <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1">Classroom</p>
                    <p className="text-sm text-foreground/70">{profile.classroom}</p>
                </div>
              </div>
            </GlassCard>

            {/* Right: Bio + Certs */}
            <div className="space-y-4">
              <GlassCard>
                <h4 className="text-sm font-semibold text-foreground/70 mb-3">Bio</h4>
                {isEditing ? (
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={4}
                    className="bg-card/80 border-border/60 text-foreground/80 resize-none"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
                )}
              </GlassCard>

              <GlassCard>
                <h4 className="text-sm font-semibold text-foreground/70 mb-3 flex items-center gap-2">
                  <Shield className="size-4 text-emerald-400" /> Subject Areas
                </h4>
                {isEditing ? (
                  <Input
                    value={subjectAreas}
                    onChange={e => setSubjectAreas(e.target.value)}
                    placeholder="Comma-separated subjects"
                    className="bg-card/80 border-border/60 text-foreground/80 placeholder:text-muted-foreground/60"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.subjectAreas.map(s => (
                      <Badge key={s} variant="outline" className="text-[10px] border-indigo-500/25 text-indigo-300/70">{s}</Badge>
                    ))}
                  </div>
                )}
              </GlassCard>

              <GlassCard>
                <h4 className="text-sm font-semibold text-foreground/70 mb-3 flex items-center gap-2">
                  <GraduationCap className="size-4 text-amber-400" /> Certifications
                </h4>
                <div className="space-y-2">
                  {profile.certifications.map(cert => (
                    <div key={cert} className="flex items-center gap-2 text-xs text-muted-foreground">
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
              <h4 className="text-sm font-semibold text-foreground/70">Appearance</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Moon className="size-4 text-indigo-400" />
                  <div>
                    <p className="text-sm text-foreground/70">Dark Mode</p>
                    <p className="text-[11px] text-muted-foreground/70">Use dark theme across the portal</p>
                  </div>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Monitor className="size-4 text-sky-400" />
                  <div>
                    <p className="text-sm text-foreground/70">Compact View</p>
                    <p className="text-[11px] text-muted-foreground/70">Reduce spacing and show more content</p>
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
              <h4 className="text-sm font-semibold text-foreground/70">Accessibility</h4>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Volume2 className="size-4 text-amber-400" />
                  <div>
                    <p className="text-sm text-foreground/70">High Contrast</p>
                    <p className="text-[11px] text-muted-foreground/70">Increase contrast for better visibility</p>
                  </div>
                </div>
                <Switch checked={highContrast} onCheckedChange={setHighContrast} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Settings className="size-4 text-pink-400" />
                  <div>
                    <p className="text-sm text-foreground/70">Reduced Motion</p>
                    <p className="text-[11px] text-muted-foreground/70">Minimize animations and transitions</p>
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
              <h4 className="text-sm font-semibold text-foreground/70">Language</h4>
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
                      : 'bg-card/60 text-muted-foreground border-border/50 hover:bg-muted/60'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* ── PASSWORD / SECURITY VIEW ── */}
      {header === 'preferences' && (
        <div className="space-y-4 mt-6" data-animate>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="size-4 text-rose-400" />
              <h4 className="text-sm font-semibold text-foreground/70">Change Password</h4>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1 block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  placeholder="Enter new password (min 8 characters)"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground/70 uppercase tracking-wide mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-border/60 bg-card/80 px-3 py-2 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="gap-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                  onClick={handleChangePassword}
                  disabled={changePasswordMut.isPending || !currentPassword || !newPassword || !confirmPassword}
                >
                  <Lock className="size-3.5" /> {changePasswordMut.isPending ? 'Changing…' : 'Change Password'}
                </Button>
              </div>
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
              <h4 className="text-sm font-semibold text-foreground/70">Notification Preferences</h4>
              <p className="text-[11px] text-muted-foreground/70">Control how you receive notifications for each event type</p>
            </div>
          </GlassCard>

          {/* Matrix Header */}
          <GlassCard className="p-0! overflow-hidden">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/50">
              <div className="col-span-6">
                <span className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wide">Event Type</span>
              </div>
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Mail className="size-3.5 text-muted-foreground/70" />
                  <span className="text-[9px] text-muted-foreground/60">Email</span>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Smartphone className="size-3.5 text-muted-foreground/70" />
                  <span className="text-[9px] text-muted-foreground/60">Push</span>
                </div>
              </div>
              <div className="col-span-2 text-center">
                <div className="flex flex-col items-center gap-0.5">
                  <Bell className="size-3.5 text-muted-foreground/70" />
                  <span className="text-[9px] text-muted-foreground/60">In-App</span>
                </div>
              </div>
            </div>

            {/* Rows */}
            {notifications.map(notif => (
              <div
                key={notif.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-border/30 items-center hover:bg-card/60 transition-colors"
              >
                <div className="col-span-6">
                  <p className="text-sm text-muted-foreground">{notif.label}</p>
                  <p className="text-[10px] text-muted-foreground/60">{notif.description}</p>
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
