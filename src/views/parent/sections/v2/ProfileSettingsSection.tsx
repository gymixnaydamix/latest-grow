import { useState } from 'react';
import { Bell, Lock, Mail, Phone, Shield, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useParentV2Children, useParentV2Profile, useUpdateParentV2Profile } from '@/hooks/api/use-parent-v2';
import type { ParentChildDemo } from './parent-v2-demo-data';
import { ParentSectionShell } from './shared';
import type { ParentSectionProps } from './shared';

export function ProfileSettingsSection({ scope, childId }: ParentSectionProps) {
  const { data: childrenRaw } = useParentV2Children({ scope, childId });
  const { data: profileRaw } = useParentV2Profile();
  const updateProfile = useUpdateParentV2Profile();
  const profile = (profileRaw as Record<string, unknown> | undefined) ?? {};

  const [email, setEmail] = useState((profile.email as string | undefined) ?? 'parent@greenfield.edu');
  const [phone, setPhone] = useState((profile.phone as string | undefined) ?? '+1 555-1102');
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyInvoices, setNotifyInvoices] = useState(true);
  const [notifyApprovals, setNotifyApprovals] = useState(true);
  const [notifyAttendance, setNotifyAttendance] = useState(true);
  const [notifyGrades, setNotifyGrades] = useState(false);
  const [notifyTransport, setNotifyTransport] = useState(true);

  const children: ParentChildDemo[] = (childrenRaw as ParentChildDemo[] | undefined) ?? [];

  return (
    <ParentSectionShell
      title="Profile & Settings"
      description="Guardian profile, linked children, notification preferences, and security settings."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><User className="size-4" /> Guardian Profile</CardTitle>
            <CardDescription>Contact details and linked children</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="parent-email" className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="size-3" /> Email</label>
              <Input id="parent-email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-1">
              <label htmlFor="parent-phone" className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="size-3" /> Phone</label>
              <Input id="parent-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>

            {/* Linked children */}
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><Users className="size-3" /> Linked Children</p>
              {children.map((child) => (
                <div key={child.id} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {child.firstName[0]}{child.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{child.firstName} {child.lastName}</p>
                      <p className="text-xs text-muted-foreground">{child.className} • Section {child.section}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Bell className="size-4" /> Notifications</CardTitle>
              <CardDescription>Choose what triggers alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Messages', desc: 'Teacher/admin thread updates', state: notifyMessages, setter: setNotifyMessages },
                { label: 'Invoices & Payments', desc: 'Issued, overdue, confirmations', state: notifyInvoices, setter: setNotifyInvoices },
                { label: 'Approvals & Forms', desc: 'Form deadlines and decisions', state: notifyApprovals, setter: setNotifyApprovals },
                { label: 'Attendance Alerts', desc: 'Unexplained absences, late arrivals', state: notifyAttendance, setter: setNotifyAttendance },
                { label: 'Grades Published', desc: 'New assessment results available', state: notifyGrades, setter: setNotifyGrades },
                { label: 'Transport Updates', desc: 'Delays, cancellations, route changes', state: notifyTransport, setter: setNotifyTransport },
              ].map(({ label, desc, state, setter }) => (
                <div key={label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                  <Switch checked={state} onCheckedChange={setter} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Shield className="size-4" /> Security</CardTitle>
              <CardDescription>Account access and protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed 45 days ago</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1.5"><Lock className="size-3.5" /> Change</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Enabled via authenticator app</p>
                </div>
                <Badge className="border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300">Active</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                <div>
                  <p className="text-sm font-medium">Active Sessions</p>
                  <p className="text-xs text-muted-foreground">2 devices logged in</p>
                </div>
                <Button size="sm" variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={updateProfile.isPending}
          onClick={() =>
            updateProfile.mutate({
              email,
              phone,
              preferences: {
                notifyMessages,
                notifyInvoices,
                notifyApprovals,
                notifyAttendance,
                notifyGrades,
                notifyTransport,
              },
            })
          }
        >
          Save all preferences
        </Button>
      </div>
    </ParentSectionShell>
  );
}
