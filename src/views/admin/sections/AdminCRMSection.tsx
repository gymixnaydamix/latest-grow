/* ─── AdminCRMSection ─── Admin: admissions, relations, alumni ──── */
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Search, Plus, Mail, Phone, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import { useApplicants, useCampaigns } from '@/hooks/api';

import type { Applicant, Campaign } from '@root/types';

/* ── Main Export ───────────────────────────────────────────────── */
export function AdminCRMSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const { schoolId } = useAuthStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);

  const { data: applicantsRes, isLoading: applicantsLoading } = useApplicants(schoolId);
  const { data: campaignsRes, isLoading: campaignsLoading } = useCampaigns(schoolId);

  const applicants = applicantsRes ?? [];
  const campaigns = campaignsRes ?? [];

  const view = (() => {
    switch (activeHeader) {
      case 'admissions': return <AdmissionsView subNav={activeSubNav} applicants={applicants} isLoading={applicantsLoading} />;
      case 'relations': return <RelationsView subNav={activeSubNav} />;
      case 'alumni_fundraising': return <AlumniFundraisingView />;
      case 'campaigns_outreach': return <CampaignsOutreachView campaigns={campaigns} isLoading={campaignsLoading} />;
      case 'crm_analytics': return <CRMAnalyticsView />;
      default: return <AdmissionsView subNav={activeSubNav} applicants={applicants} isLoading={applicantsLoading} />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── helpers ────────────────────────────────────────────────────── */
const stageBadgeVariant = (s: string) => {
  switch (s) {
    case 'ACCEPTED': case 'ENROLLED': return 'default' as const;
    case 'REJECTED': return 'destructive' as const;
    default: return 'outline' as const;
  }
};

const PIPELINE_ORDER = ['INQUIRY', 'APPLICATION', 'REVIEW', 'ACCEPTED', 'REJECTED', 'ENROLLED'] as const;

function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}><CardContent className="py-4"><Skeleton className="h-10 w-full" /></CardContent></Card>
      ))}
    </div>
  );
}

/* ── Admissions ────────────────────────────────────────────────── */
function AdmissionsView({ subNav, applicants, isLoading }: { subNav: string; applicants: Applicant[]; isLoading: boolean }) {
  if (subNav === 'applications') {
    return (
      <>
        <div className="flex items-center justify-between" data-animate>
          <div>
            <h2 className="text-lg font-semibold">Applications</h2>
            <p className="text-sm text-muted-foreground">Review and process admission applications</p>
          </div>
          <Button size="sm"><Plus className="mr-1 size-3" /> New Application</Button>
        </div>

        {isLoading ? (
          <CardSkeleton count={5} />
        ) : applicants.length === 0 ? (
          <Card data-animate><CardContent className="py-8 text-center text-sm text-muted-foreground">No applicants found.</CardContent></Card>
        ) : (
          <div className="space-y-2" data-animate>
            {applicants.map((a) => {
              const initials = `${a.firstName?.[0] ?? ''}${a.lastName?.[0] ?? ''}`;
              const appliedDate = new Date(a.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8"><AvatarFallback className="text-[10px]">{initials}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-sm font-medium">{a.firstName} {a.lastName}</p>
                        <p className="text-xs text-muted-foreground">Applied {appliedDate}</p>
                      </div>
                    </div>
                    <Badge variant={stageBadgeVariant(a.stage)} className="text-[10px]">{a.stage.toLowerCase()}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </>
    );
  }

  // Pipeline view (default) — derive counts from live data
  const statusCounts = applicants.reduce<Record<string, number>>((acc, a) => {
    acc[a.stage] = (acc[a.stage] ?? 0) + 1;
    return acc;
  }, {});

  const stages = PIPELINE_ORDER.map((s) => ({ stage: s, count: statusCounts[s] ?? 0 }));

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold">Admissions Pipeline</h2>
        <p className="text-sm text-muted-foreground">Track prospective students through the enrollment funnel</p>
      </div>

      {isLoading ? (
        <div className="flex gap-2" data-animate>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-30 rounded-lg" />)}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto" data-animate>
          {stages.map((s, i) => (
            <div key={s.stage} className="flex items-center gap-2">
              <div className="min-w-30 rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">{s.stage}</p>
                <p className="text-xl font-bold">{s.count}</p>
              </div>
              {i < stages.length - 1 && <ArrowRight className="size-4 text-muted-foreground shrink-0" />}
            </div>
          ))}
        </div>
      )}

      {/* Demo analytics — no API endpoint */}
      <div className="grid gap-4 sm:grid-cols-4" data-animate>
        {[
          { label: 'Acceptance Rate', value: '68%' },
          { label: 'Avg Time to Decision', value: '14 days' },
          { label: 'Yield Rate', value: '82%' },
          { label: 'Waitlist Conversion', value: '24%' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-lg font-bold mt-1">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── Student & Family Relations ────────────────────────────────── */
function RelationsView({ subNav }: { subNav: string }) {
  if (subNav === 'communication_log') {
    return (
      <>
        <div data-animate><h2 className="text-lg font-semibold">Communication Log</h2></div>
        <div className="space-y-2" data-animate>
          {[
            { family: 'The Johnsons', type: 'Phone Call', date: 'May 14', topic: 'Grade concern for Emily', staff: 'Ms. Thompson' },
            { family: 'The Chens', type: 'Email', date: 'May 13', topic: 'Tuition payment plan', staff: 'Mrs. Davis' },
            { family: 'The Garcias', type: 'In-Person', date: 'May 12', topic: 'Behavior meeting', staff: 'Mr. Wilson' },
            { family: 'The Patels', type: 'Email', date: 'May 11', topic: 'Bus route change request', staff: 'Ms. Lee' },
          ].map((log) => (
            <Card key={log.family + log.date}>
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{log.family}</p>
                  <p className="text-xs text-muted-foreground">{log.topic} · {log.staff}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{log.type}</Badge>
                  <span className="text-xs text-muted-foreground">{log.date}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">Family Directory</h2>
        <Button size="sm"><Search className="mr-1 size-3" /> Find Family</Button>
      </div>
      <div className="space-y-2" data-animate>
        {[
          { family: 'Johnson Family', students: 2, contact: 'Sarah Johnson', phone: '(555) 123-4567' },
          { family: 'Chen Family', students: 1, contact: 'David Chen', phone: '(555) 234-5678' },
          { family: 'Garcia Family', students: 3, contact: 'Maria Garcia', phone: '(555) 345-6789' },
          { family: 'Patel Family', students: 1, contact: 'Priya Patel', phone: '(555) 456-7890' },
        ].map((f) => (
          <Card key={f.family} className="cursor-pointer hover:border-primary/40 transition-colors">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-9"><AvatarFallback className="text-xs">{f.family.split(' ')[0].slice(0, 2)}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-semibold">{f.family}</p>
                  <p className="text-xs text-muted-foreground">{f.contact} · {f.students} student(s)</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="size-7"><Phone className="size-3" /></Button>
                <Button size="icon" variant="ghost" className="size-7"><Mail className="size-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ── Alumni & Fundraising ──────────────────────────────────────── */
function AlumniFundraisingView() {
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">Alumni &amp; Fundraising</h2></div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Alumni Network', value: '2,450', color: 'text-blue-500' },
          { label: 'Funds Raised (YTD)', value: '$128,000', color: 'text-emerald-500' },
          { label: 'Active Campaigns', value: '3', color: 'text-purple-500' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card data-animate>
        <CardHeader><CardTitle className="text-base">Recent Donations</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {[
            { donor: 'Class of 2015', amount: '$5,000', campaign: 'Library Fund', date: 'May 12' },
            { donor: 'Dr. Robert Kim (\'98)', amount: '$10,000', campaign: 'STEM Lab', date: 'May 10' },
            { donor: 'Anonymous', amount: '$2,500', campaign: 'Scholarship Fund', date: 'May 8' },
          ].map((d) => (
            <div key={d.donor + d.date} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{d.donor}</p>
                <p className="text-xs text-muted-foreground">{d.campaign} · {d.date}</p>
              </div>
              <span className="text-sm font-bold text-emerald-500">{d.amount}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

/* ── Campaigns & Outreach ──────────────────────────────────────── */
const campaignBadgeVariant = (s: string) => {
  switch (s) {
    case 'ACTIVE': return 'default' as const;
    case 'COMPLETED': return 'secondary' as const;
    default: return 'outline' as const;
  }
};

function CampaignsOutreachView({ campaigns, isLoading }: { campaigns: Campaign[]; isLoading: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <h2 className="text-lg font-semibold">Campaigns &amp; Outreach</h2>
        <Button size="sm"><Plus className="mr-1 size-3" /> Create Campaign</Button>
      </div>

      {isLoading ? (
        <CardSkeleton count={3} />
      ) : campaigns.length === 0 ? (
        <Card data-animate><CardContent className="py-8 text-center text-sm text-muted-foreground">No campaigns found.</CardContent></Card>
      ) : (
        <div className="space-y-2" data-animate>
          {campaigns.map((c) => {
            const metrics = (c.metrics ?? {}) as Record<string, number>;
            const sent = metrics.sent ?? 0;
            const opened = metrics.opened ?? 0;
            const leads = metrics.leads ?? 0;
            return (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.channel}</p>
                    </div>
                    <Badge variant={campaignBadgeVariant(c.status)} className="text-[10px]">{c.status.toLowerCase()}</Badge>
                  </div>
                  {sent > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-center">
                      <div><p className="font-bold">{sent}</p><p className="text-muted-foreground">Sent</p></div>
                      <div><p className="font-bold">{opened}</p><p className="text-muted-foreground">Opened</p></div>
                      <div><p className="font-bold">{leads}</p><p className="text-muted-foreground">Leads</p></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ── CRM Analytics ─────────────────────────────────────────────── */
function CRMAnalyticsView() {
  return (
    <>
      <div data-animate><h2 className="text-lg font-semibold">CRM Analytics &amp; Reporting</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {[
          { label: 'Total Inquiries', value: '485', trend: '+12%' },
          { label: 'Conversion Rate', value: '34%', trend: '+2%' },
          { label: 'Avg Response Time', value: '4.2h', trend: '-1.3h' },
          { label: 'NPS Score', value: '72', trend: '+5' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold mt-1">{m.value}</p>
              <p className="text-[10px] text-emerald-500">{m.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card data-animate>
        <CardHeader><CardTitle className="text-base">Monthly Enrollment Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((m, i) => {
              const value = [28, 35, 42, 38, 52][i];
              return (
                <div key={m} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-muted-foreground">{m}</span>
                  <Progress value={value} className="h-3 flex-1" />
                  <span className="w-8 text-xs font-medium">{value}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
