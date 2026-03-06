/* ─── ProfilePage ─── User profile management ────────────────────── */
import { useState } from 'react';
import { User, Mail, Phone, MapPin, Shield, Camera, Save, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useAuthStore } from '@/store/auth.store';

export default function ProfilePage() {
  const containerRef = useStaggerAnimate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? 'John',
    lastName: user?.lastName ?? 'Doe',
    email: user?.email ?? 'john@example.com',
    phone: '+1 555-0123',
    address: '123 Education Lane',
    city: 'San Francisco',
    state: 'CA',
    zip: '94102',
    bio: 'Passionate educator and lifelong learner.',
  });

  const handleChange = (field: string, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-6 p-4">
      {/* Banner */}
      <div data-animate className="relative rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl overflow-hidden h-36">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500/20 via-violet-500/20 to-emerald-500/20" />
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div className="relative">
            <div className="size-20 rounded-full border-2 border-white/20 bg-indigo-500/30 flex items-center justify-center text-2xl font-bold text-white/90">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <button className="absolute bottom-0 right-0 size-6 rounded-full bg-indigo-500 flex items-center justify-center ring-2 ring-background">
              <Camera className="size-3 text-white" />
            </button>
          </div>
          <div className="pb-1">
            <h2 className="text-lg font-bold text-white/90">{profile.firstName} {profile.lastName}</h2>
            <div className="flex items-center gap-2">
              <Badge className="border-0 bg-indigo-500/20 text-indigo-300 text-[10px]">{user?.role ?? 'Teacher'}</Badge>
              <span className="text-xs text-white/40">{profile.email}</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList data-animate className="bg-white/5 border border-white/6">
          <TabsTrigger value="personal" className="text-xs data-[state=active]:bg-white/10">Personal Info</TabsTrigger>
          <TabsTrigger value="security" className="text-xs data-[state=active]:bg-white/10">Security</TabsTrigger>
          <TabsTrigger value="preferences" className="text-xs data-[state=active]:bg-white/10">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-base flex items-center gap-2"><User className="size-4 text-indigo-400" />Personal Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'firstName', label: 'First Name', icon: User },
                { key: 'lastName', label: 'Last Name', icon: User },
                { key: 'email', label: 'Email', icon: Mail },
                { key: 'phone', label: 'Phone', icon: Phone },
                { key: 'address', label: 'Address', icon: MapPin },
                { key: 'city', label: 'City', icon: MapPin },
                { key: 'state', label: 'State', icon: MapPin },
                { key: 'zip', label: 'ZIP Code', icon: MapPin },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-[11px] text-white/40 font-medium flex items-center gap-1">
                    <Icon className="size-3" />{label}
                  </label>
                  <Input
                    value={profile[key as keyof typeof profile]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="bg-white/4 border-white/8 text-white/80 text-xs h-9"
                  />
                </div>
              ))}
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[11px] text-white/40 font-medium">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={3}
                  className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white/80 placeholder:text-white/25 outline-none focus:border-indigo-400/40 resize-none"
                />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button className="gap-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/20">
                  <Save className="size-3.5" />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-base flex items-center gap-2"><Shield className="size-4 text-emerald-400" />Security Settings</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              {[
                { label: 'Current Password', placeholder: '••••••••' },
                { label: 'New Password', placeholder: 'Min 8 characters' },
                { label: 'Confirm Password', placeholder: 'Repeat new password' },
              ].map((f) => (
                <div key={f.label} className="flex flex-col gap-1 max-w-sm">
                  <label className="text-[11px] text-white/40 font-medium flex items-center gap-1"><Key className="size-3" />{f.label}</label>
                  <Input type="password" placeholder={f.placeholder} className="bg-white/4 border-white/8 text-white/80 text-xs h-9" />
                </div>
              ))}
              <div className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/3 p-3">
                <Shield className="size-5 text-emerald-400" />
                <div><p className="text-xs text-white/70 font-medium">Two-Factor Authentication</p><p className="text-[10px] text-white/30">Add extra security to your account</p></div>
                <Button variant="outline" size="sm" className="ml-auto text-xs border-white/10 text-white/60">Enable 2FA</Button>
              </div>
              <Button className="max-w-fit gap-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-400/20">
                <Save className="size-3.5" />Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader><CardTitle className="text-white/90 text-base">Preferences</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                { label: 'Email Notifications', desc: 'Receive email updates' },
                { label: 'Push Notifications', desc: 'Browser push alerts' },
                { label: 'Weekly Digest', desc: 'Summary email every Monday' },
                { label: 'Dark Mode', desc: 'Always-on dark interface' },
              ].map((pref) => (
                <div key={pref.label} className="flex items-center justify-between rounded-lg border border-white/6 bg-white/3 p-3">
                  <div><p className="text-xs text-white/70 font-medium">{pref.label}</p><p className="text-[10px] text-white/30">{pref.desc}</p></div>
                  <div className="h-5 w-9 rounded-full bg-indigo-500/30 p-0.5 cursor-pointer">
                    <div className="size-4 rounded-full bg-indigo-400 translate-x-4 transition-transform" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
