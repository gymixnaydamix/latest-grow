/* ─── SettingsPage ─── Profile, notifications, appearance, billing ─ */
import { useEffect, useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  User, Bell, Palette, CreditCard, Shield, Save,
  Camera, Mail, Phone, Globe, Moon, Sun, Monitor,
} from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useMe, useUpdateProfile } from '@/hooks/api';
import { useAuthStore } from '@/store/auth.store';

/* ── Component ─────────────────────────────────────────────────── */
export function SettingsPage() {
  const [tab, setTab] = useState('profile');
  const { user } = useAuthStore();
  const { data: meData, isLoading } = useMe();
  const updateProfile = useUpdateProfile();
  const containerRef = useStaggerAnimate<HTMLDivElement>([tab]);

  const profile = meData?.user ?? user;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate({ firstName, lastName });
  };

  const ini = profile ? `${(profile.firstName ?? '')[0] ?? ''}${(profile.lastName ?? '')[0] ?? ''}`.toUpperCase() : 'U';

  return (
    <div ref={containerRef} className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile"><User className="size-3 mr-1" /> Profile</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="size-3 mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="size-3 mr-1" /> Appearance</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="size-3 mr-1" /> Billing</TabsTrigger>
          <TabsTrigger value="security"><Shield className="size-3 mr-1" /> Security</TabsTrigger>
        </TabsList>

        {/* ── Profile ──────────────────────────────────────────── */}
        <TabsContent value="profile" className="space-y-4 pt-4">
          {isLoading ? (
            <Card><CardContent className="pt-5 space-y-3"><Skeleton className="h-16 w-16 rounded-full" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ) : (
            <>
              <Card data-animate>
                <CardHeader>
                  <CardTitle className="text-sm">Profile Photo</CardTitle>
                  <CardDescription className="text-xs">Update your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Avatar className="size-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">{ini}</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm"><Camera className="size-3 mr-1" /> Change Photo</Button>
                </CardContent>
              </Card>

              <Card data-animate>
                <CardHeader>
                  <CardTitle className="text-sm">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">First Name</Label>
                      <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Last Name</Label>
                      <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input value={profile?.email ?? ''} disabled className="pl-9" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input defaultValue="" placeholder="+1 (555) 000-0000" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Timezone</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                        <Input defaultValue="America / New York (EST)" className="pl-9" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Bio</Label>
                    <Textarea defaultValue="" placeholder="Tell us about yourself" rows={3} />
                  </div>
                  <Button size="sm" onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                    <Save className="size-3 mr-1" /> {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Notifications ────────────────────────────────────── */}
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Email Notifications</CardTitle>
              <CardDescription className="text-xs">Choose what emails you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'New announcements', desc: 'Receive email when a new announcement is posted', on: true },
                { label: 'Assignment updates', desc: 'Notifications when assignments are graded or modified', on: true },
                { label: 'Direct messages', desc: 'Email for each new direct message', on: false },
                { label: 'Weekly digest', desc: 'Summary of activities each Monday', on: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.on} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Push Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Upcoming class reminders', desc: '15 min before each class begins', on: true },
                { label: 'Attendance alerts', desc: 'When a student is marked absent', on: false },
                { label: 'System maintenance', desc: 'Scheduled downtime notifications', on: true },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.on} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Appearance ───────────────────────────────────────── */}
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Theme</CardTitle>
              <CardDescription className="text-xs">Choose your preferred appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { value: 'light', label: 'Light', icon: Sun },
                  { value: 'dark', label: 'Dark', icon: Moon },
                  { value: 'system', label: 'System', icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.value}
                    className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:border-primary/40 transition-colors text-center"
                  >
                    <t.icon className="size-5 text-muted-foreground" />
                    <span className="text-sm font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Display</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Compact mode', desc: 'Reduce spacing and element sizes', on: false },
                { label: 'Show animations', desc: 'Enable page and card animations', on: true },
                { label: 'High contrast', desc: 'Increase contrast for accessibility', on: false },
              ].map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{d.label}</p>
                    <p className="text-xs text-muted-foreground">{d.desc}</p>
                  </div>
                  <Switch defaultChecked={d.on} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Billing ──────────────────────────────────────────── */}
        <TabsContent value="billing" className="space-y-4 pt-4">
          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Current Plan</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Professional Plan</p>
                <p className="text-xs text-muted-foreground">$49 / month · Renews Jun 1, 2025</p>
              </div>
              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px]">Active</Badge>
            </CardContent>
          </Card>

          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CreditCard className="size-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Visa ending in 4242</p>
                  <p className="text-xs text-muted-foreground">Expires 08/2027</p>
                </div>
                <Badge variant="outline" className="text-[10px]">Default</Badge>
              </div>
              <Button variant="outline" size="sm">Add Payment Method</Button>
            </CardContent>
          </Card>

          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { date: 'May 1, 2025', amount: '$49.00', status: 'Paid' },
                  { date: 'Apr 1, 2025', amount: '$49.00', status: 'Paid' },
                  { date: 'Mar 1, 2025', amount: '$49.00', status: 'Paid' },
                ].map((b) => (
                  <div key={b.date} className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm">{b.date}</span>
                    <span className="text-sm font-mono">{b.amount}</span>
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px]">{b.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security ─────────────────────────────────────────── */}
        <TabsContent value="security" className="space-y-4 pt-4">
          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confirm New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button size="sm">Update Password</Button>
            </CardContent>
          </Card>

          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-xs">Add an extra layer of security</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm">Authenticator App</p>
                <p className="text-xs text-muted-foreground">Use an authenticator app to generate codes</p>
              </div>
              <Switch />
            </CardContent>
          </Card>

          <Card data-animate>
            <CardHeader>
              <CardTitle className="text-sm">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { device: 'Chrome on Windows', location: 'New York, US', current: true },
                { device: 'Safari on iPhone', location: 'New York, US', current: false },
              ].map((s) => (
                <div key={s.device} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{s.device}</p>
                    <p className="text-xs text-muted-foreground">{s.location}</p>
                  </div>
                  {s.current ? (
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px]">Current</Badge>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-xs text-destructive">Revoke</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
