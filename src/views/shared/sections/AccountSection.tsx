/* ─── AccountSection ─── Shared profile / notification / billing ── */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Bell, CreditCard, Shield, Eye, Globe,
  Palette, Key, Mail, Phone, Camera,
  BellRing, BellOff, Smartphone,
  Receipt, Download, ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useMe, useUpdateProfile } from '@/hooks/api';
import { Skeleton } from '@/components/ui/skeleton';

/* ── SubNav → Route mapping per role (for split-page navigation) ── */
const STUDENT_SUB_NAV_ROUTES: Record<string, string> = {
  profile: '/student/profile-settings',
  notifications: '/student/notification-settings',
  billing: '/student/billing-settings',
};

/* ── Main Export ───────────────────────────────────────────────── */
export function AccountSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const { user } = useAuthStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);
  const navigate = useNavigate();

  // Navigate to split page when a mapped subnav is selected
  useEffect(() => {
    if (!activeSubNav) return;
    const routeMap = user?.role === 'STUDENT' ? STUDENT_SUB_NAV_ROUTES : null;
    if (routeMap && routeMap[activeSubNav]) {
      navigate(routeMap[activeSubNav]);
    }
  }, [activeSubNav, user?.role, navigate]);

  const view = (() => {
    switch (activeSubNav) {
      case 'profile': return <ProfileView />;
      case 'notifications': return <NotificationsView />;
      case 'billing': return <BillingView />;
      default: return <ProfileView />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Profile ───────────────────────────────────────────────────── */

function ProfileView() {
  const { data: meData, isLoading } = useMe();
  const user = meData?.user;
  const updateProfile = useUpdateProfile();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user]);

  if (isLoading) {
    return (
      <>
        <div data-animate>
          <h2 className="text-lg font-semibold text-white/90">My Profile</h2>
          <p className="text-sm text-white/40">Manage your personal information and account settings</p>
        </div>
        <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2" data-animate>
          <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        </div>
      </>
    );
  }

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` : '??';
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  const email = user?.email ?? '';
  const role = user?.role ?? '';

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">My Profile</h2>
        <p className="text-sm text-white/40">Manage your personal information and account settings</p>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="size-20 border-2 border-indigo-500/20">
              <AvatarFallback className="text-xl bg-indigo-500/10 text-indigo-400">{initials}</AvatarFallback>
            </Avatar>
            <Button size="icon" className="absolute -bottom-1 -right-1 size-7 rounded-full border border-white/10 bg-white/5 text-white/60 hover:bg-white/10">
              <Camera className="size-3" />
            </Button>
          </div>
          <div>
            <p className="text-lg font-semibold text-white/90">{fullName}</p>
            <p className="text-sm text-white/40">{email}</p>
            <Badge variant="outline" className="mt-1 text-[10px] capitalize border-indigo-500/30 text-indigo-400">{role}</Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-white/85 mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60">First Name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/60">Last Name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 flex items-center gap-1"><Mail className="size-3" /> Email</label>
              <Input defaultValue={email} className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/60 flex items-center gap-1"><Phone className="size-3" /> Phone</label>
              <Input defaultValue="" placeholder="Add phone number" className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25" />
            </div>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={updateProfile.isPending}
              onClick={() => updateProfile.mutate({ firstName, lastName })}
            >
              {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Security settings */}
        <div className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
          <h3 className="text-sm font-semibold text-white/85 mb-4">Security</h3>
          <div className="space-y-3">
            {[
              { title: 'Change Password', desc: 'Last changed 30 days ago', icon: Key, color: 'bg-amber-500/10 text-amber-400' },
              { title: 'Two-Factor Auth', desc: 'Enabled via authenticator app', icon: Shield, color: 'bg-emerald-500/10 text-emerald-400' },
              { title: 'Active Sessions', desc: '2 devices logged in', icon: Smartphone, color: 'bg-blue-500/10 text-blue-400' },
            ].map((item) => (
              <div key={item.title} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`flex size-7 items-center justify-center rounded-lg ${item.color}`}>
                    <item.icon className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80">{item.title}</p>
                    <p className="text-xs text-white/40">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-white/20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85 mb-3">Preferences</h3>
        <div className="space-y-3">
          {[
            { title: 'Language', value: 'English (US)', icon: Globe, color: 'bg-indigo-500/10 text-indigo-400' },
            { title: 'Theme', value: 'System Default', icon: Palette, color: 'bg-violet-500/10 text-violet-400' },
            { title: 'Accessibility', value: 'Standard', icon: Eye, color: 'bg-cyan-500/10 text-cyan-400' },
          ].map((pref) => (
            <div key={pref.title} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
              <div className="flex items-center gap-3">
                <div className={`flex size-7 items-center justify-center rounded-lg ${pref.color}`}>
                  <pref.icon className="size-3.5" />
                </div>
                <p className="text-sm text-white/70">{pref.title}</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-white/10 text-white/40">{pref.value}</Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Notifications ─────────────────────────────────────────────── */

function NotificationsView() {
  const channels = [
    { label: 'Email Notifications', desc: 'Course updates, announcements, reports', enabled: true, icon: Mail, color: 'bg-indigo-500/10 text-indigo-400' },
    { label: 'Push Notifications', desc: 'Instant alerts on your device', enabled: true, icon: BellRing, color: 'bg-amber-500/10 text-amber-400' },
    { label: 'SMS Notifications', desc: 'Critical alerts via text message', enabled: false, icon: Smartphone, color: 'bg-rose-500/10 text-rose-400' },
    { label: 'In-App Notifications', desc: 'Bell icon inside the platform', enabled: true, icon: Bell, color: 'bg-emerald-500/10 text-emerald-400' },
  ];

  const categories = [
    { label: 'System Updates', status: 'on' },
    { label: 'Course Announcements', status: 'on' },
    { label: 'Assignment Reminders', status: 'on' },
    { label: 'Marketing & Promotions', status: 'off' },
    { label: 'Billing Alerts', status: 'on' },
    { label: 'Community Activity', status: 'off' },
  ];

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Notification Settings</h2>
        <p className="text-sm text-white/40">Choose how and when you receive notifications</p>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85 mb-3">Notification Channels</h3>
        <div className="space-y-3">
          {channels.map((ch) => (
            <div key={ch.label} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
              <div className="flex items-center gap-3">
                <div className={`flex size-7 items-center justify-center rounded-lg ${ch.color}`}>
                  <ch.icon className="size-3.5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{ch.label}</p>
                  <p className="text-xs text-white/40">{ch.desc}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${ch.enabled ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10 text-white/30'}`}>
                {ch.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85">Notification Categories</h3>
        <p className="text-xs text-white/30 mb-3">Toggle individual categories on or off</p>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
              <div className="flex items-center gap-2">
                {cat.status === 'on' ? <BellRing className="size-3 text-indigo-400" /> : <BellOff className="size-3 text-white/20" />}
                <span className="text-sm text-white/70">{cat.label}</span>
              </div>
              <Badge variant="outline" className={`text-[10px] ${cat.status === 'on' ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10 text-white/30'}`}>
                {cat.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Billing ───────────────────────────────────────────────────── */

function BillingView() {
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Billing &amp; Subscription</h2>
        <p className="text-sm text-white/40">Manage your plan, payment methods, and invoices</p>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85 mb-4">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white/90">Pro Plan</p>
            <p className="text-xs text-white/40">$49/month · Renews June 1, 2025</p>
          </div>
          <Button size="sm" className="border border-white/10 bg-transparent text-white/60 hover:bg-white/5">Upgrade</Button>
        </div>
        <div className="my-4 border-t border-white/6" />
        <div className="grid gap-3 sm:grid-cols-3 text-center">
          {[
            { value: '25', label: 'Users included' },
            { value: '50 GB', label: 'Storage' },
            { value: 'Unlimited', label: 'AI queries' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/6 bg-white/2 p-3">
              <p className="text-lg font-bold text-white/90">{s.value}</p>
              <p className="text-xs text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85 mb-3">Payment Method</h3>
        <div className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-violet-500/10">
              <CreditCard className="size-4 text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white/80">Visa ending in 4242</p>
              <p className="text-xs text-white/40">Expires 12/2026</p>
            </div>
          </div>
          <Button size="sm" className="bg-transparent text-white/50 hover:text-white/70 hover:bg-white/5">Edit</Button>
        </div>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85 mb-3">Recent Invoices</h3>
        <div className="space-y-2">
          {[
            { id: 'INV-2025-05', date: 'May 1, 2025', amount: '$49.00', status: 'Paid' },
            { id: 'INV-2025-04', date: 'Apr 1, 2025', amount: '$49.00', status: 'Paid' },
            { id: 'INV-2025-03', date: 'Mar 1, 2025', amount: '$49.00', status: 'Paid' },
          ].map((inv) => (
            <div key={inv.id} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Receipt className="size-3.5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{inv.id}</p>
                  <p className="text-xs text-white/40">{inv.date} · {inv.amount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">{inv.status}</Badge>
                <Button size="icon" className="size-7 bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5"><Download className="size-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
