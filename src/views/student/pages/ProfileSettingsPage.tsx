/* ─── ProfileSettingsPage ─── Full-page student profile settings ──── */
import { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Camera, Key, Shield,
  Smartphone, Globe, Palette, Eye, ChevronRight,
  MapPin, Calendar, GraduationCap, Save,
  Link2, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';
import { notifySuccess } from '@/lib/notify';
import { useMe, useUpdateProfile } from '@/hooks/api';
import { useStudentProfile } from '@/hooks/api/use-student';
import { Skeleton } from '@/components/ui/skeleton';

const FALLBACK_SECURITY_ITEMS = [
  { title: 'Change Password', desc: 'Last changed 30 days ago', icon: Key, color: 'bg-amber-500/10 text-amber-400', status: 'warning' },
  { title: 'Two-Factor Auth', desc: 'Enabled via authenticator app', icon: Shield, color: 'bg-emerald-500/10 text-emerald-400', status: 'ok' },
  { title: 'Active Sessions', desc: '2 devices logged in', icon: Smartphone, color: 'bg-blue-500/10 text-blue-400', status: 'info' },
  { title: 'Login History', desc: 'Last login 2 hours ago', icon: Eye, color: 'bg-violet-500/10 text-violet-400', status: 'ok' },
];

const FALLBACK_PREFERENCES = [
  { title: 'Language', value: 'English (US)', icon: Globe, color: 'bg-indigo-500/10 text-indigo-400' },
  { title: 'Theme', value: 'System Default', icon: Palette, color: 'bg-violet-500/10 text-violet-400' },
  { title: 'Accessibility', value: 'Standard', icon: Eye, color: 'bg-cyan-500/10 text-cyan-400' },
];

const FALLBACK_LINKED_ACCOUNTS = [
  { name: 'Google', connected: true, email: 'student@gmail.com' },
  { name: 'Microsoft', connected: false, email: null },
  { name: 'Apple', connected: false, email: null },
];

const FALLBACK_PROFILE_COMPLETION = [
  { field: 'Profile Photo', done: false },
  { field: 'Phone Number', done: false },
  { field: 'Address', done: false },
  { field: 'Emergency Contact', done: true },
  { field: 'Email Verified', done: true },
  { field: 'Two-Factor Auth', done: true },
];

export default function ProfileSettingsPage() {
  const containerRef = useStaggerAnimate<HTMLDivElement>([]);
  const { data: meData, isLoading } = useMe();
  const user = meData?.user;
  const updateProfile = useUpdateProfile();
  const { data: apiStudentProfile } = useStudentProfile();
  const studentProfile = (apiStudentProfile as any)?.data ?? (apiStudentProfile as any) ?? {};
  const gradeLevel = studentProfile?.gradeLevel ?? '';
  const section = studentProfile?.section ?? '';
  const SECURITY_ITEMS = FALLBACK_SECURITY_ITEMS;
  const PREFERENCES = FALLBACK_PREFERENCES;
  const LINKED_ACCOUNTS = FALLBACK_LINKED_ACCOUNTS;
  const PROFILE_COMPLETION = FALLBACK_PROFILE_COMPLETION;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user]);

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : '??';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  const email = user?.email ?? '';
  const role = user?.role ?? '';
  const completedFields = PROFILE_COMPLETION.filter((f) => f.done).length;
  const completionPct = Math.round((completedFields / PROFILE_COMPLETION.length) * 100);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Profile Settings" description="Manage your personal information, security, and preferences" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Profile Completion" value={completionPct} suffix="%" icon={<User className="h-5 w-5" />} accentColor="#6366f1" />
        <StatCard label="Security Score" value={85} suffix="/100" icon={<Shield className="h-5 w-5" />} accentColor="#10b981" />
        <StatCard label="Active Sessions" value={2} icon={<Smartphone className="h-5 w-5" />} />
        <StatCard label="Linked Accounts" value={1} suffix="/3" icon={<Link2 className="h-5 w-5" />} />
      </div>

      {/* Profile card */}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="size-24 border-2 border-indigo-500/20">
                <AvatarFallback className="text-2xl bg-indigo-500/10 text-indigo-400">{initials}</AvatarFallback>
              </Avatar>
              <Button size="icon" className="absolute -bottom-1 -right-1 size-8 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10" onClick={() => notifySuccess('Avatar', 'Photo upload dialog opened')}>
                <Camera className="size-3.5" />
              </Button>
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold text-white/90">{fullName}</p>
              <p className="text-sm text-white/40">{email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="outline" className="text-[10px] capitalize border-indigo-500/30 text-indigo-400">{role}</Badge>
                {gradeLevel && <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-400">{gradeLevel}</Badge>}
                {section && <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">{section}</Badge>}
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">Active</Badge>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-[10px] text-white/30">Member since</p>
              <p className="text-xs text-white/50">Sep 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main – Personal info + Security */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Personal information */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <User className="size-4 text-indigo-400" />Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50">First Name</label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="h-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50">Last Name</label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="h-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1"><Mail className="size-3" />Email</label>
                  <Input defaultValue={email} className="h-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1"><Phone className="size-3" />Phone</label>
                  <Input defaultValue="" placeholder="Add phone number" className="h-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1"><MapPin className="size-3" />Address</label>
                  <Input defaultValue="" placeholder="Add address" className="h-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-white/50 flex items-center gap-1"><Calendar className="size-3" />Date of Birth</label>
                  <Input type="date" defaultValue="" className="h-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50 flex items-center gap-1"><GraduationCap className="size-3" />Student ID</label>
                <Input defaultValue="STU-2024-00142" disabled className="h-9 border-white/10 bg-white/3 text-white/40" />
              </div>
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1"
                disabled={updateProfile.isPending}
                onClick={() => updateProfile.mutate({ firstName, lastName })}
              >
                <Save className="size-3" />{updateProfile.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Security */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Shield className="size-4 text-emerald-400" />Security
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {SECURITY_ITEMS.map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-3 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors" onClick={() => notifySuccess('Security', 'Security setting updated')}>
                  <div className="flex items-center gap-3">
                    <div className={cn('flex size-8 items-center justify-center rounded-lg', item.color)}>
                      <item.icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-white/75">{item.title}</p>
                      <p className="text-[9px] text-white/30">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'ok' && <CheckCircle2 className="size-3.5 text-emerald-400" />}
                    {item.status === 'warning' && <AlertTriangle className="size-3.5 text-amber-400" />}
                    <ChevronRight className="size-3.5 text-white/15" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Profile completion */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-indigo-400" />Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative size-16">
                  <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeDasharray={`${completionPct} ${100 - completionPct}`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-400">{completionPct}%</span>
                </div>
                <div>
                  <p className="text-xs text-white/50">{completedFields}/{PROFILE_COMPLETION.length} fields</p>
                  <p className="text-[9px] text-white/25">Complete your profile for better experience</p>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                {PROFILE_COMPLETION.map((f) => (
                  <div key={f.field} className="flex items-center gap-2 text-[10px]">
                    {f.done
                      ? <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
                      : <div className="size-3 rounded-full border border-white/15 shrink-0" />
                    }
                    <span className={cn('text-white/40', f.done && 'line-through text-white/20')}>{f.field}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Palette className="size-4 text-violet-400" />Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {PREFERENCES.map((pref) => (
                <div key={pref.title} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-2.5 cursor-pointer hover:bg-white/4 transition-colors" onClick={() => notifySuccess('Preference', 'Preference updated')}>
                  <div className="flex items-center gap-2.5">
                    <div className={cn('flex size-6 items-center justify-center rounded-md', pref.color)}>
                      <pref.icon className="size-3" />
                    </div>
                    <span className="text-[10px] text-white/55">{pref.title}</span>
                  </div>
                  <Badge variant="outline" className="text-[8px] border-white/8 text-white/30">{pref.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Linked accounts */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 text-sm flex items-center gap-1.5">
                <Link2 className="size-4 text-cyan-400" />Linked Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {LINKED_ACCOUNTS.map((acct) => (
                <div key={acct.name} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/2 p-2.5">
                  <div>
                    <p className="text-[10px] font-medium text-white/60">{acct.name}</p>
                    {acct.email && <p className="text-[8px] text-white/25">{acct.email}</p>}
                  </div>
                  <Button size="sm" variant="outline" className={cn(
                    'h-6 text-[9px] px-2',
                    acct.connected ? 'border-emerald-500/20 text-emerald-400' : 'border-white/10 text-white/35',
                  )} onClick={() => notifySuccess('Accounts', 'Account connection toggled')}>
                    {acct.connected ? 'Connected' : 'Connect'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
