import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  GraduationCap,
  Mail,
  MessageSquare,
  NotebookPen,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useParentV2Home, useCreateParentV2CheckoutSession, useDecideParentV2Approval, useMarkParentV2AnnouncementRead, useRsvpParentV2Event } from '@/hooks/api/use-parent-v2';
import { useNavigationStore } from '@/store/navigation.store';
import { notifySuccess, notifyError } from '@/lib/notify';
import {
  childDisplayName,
  filterByChild,
  filterChildren,
  formatCurrency,
  formatDateLabel,
  formatDateTimeLabel,
  parentActionItemsDemo,
  parentAnnouncementsDemo,
  parentApprovalsDemo,
  parentAssignmentsDemo,
  parentAttendanceDemo,
  parentCalendarDemo,
  parentChildrenDemo,
  parentEventsDemo,
  parentExamsDemo,
  parentInvoicesDemo,
  parentMessageThreadsDemo,
  parentTimetableDemo,
} from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, PriorityBadge, StatusBadge, UrgentInline } from './shared';
import type { ParentSectionProps } from './shared';
import type {
  ParentChildDemo,
  ParentActionItemDemo,
  ParentTimetableItemDemo,
  ParentAnnouncementDemo,
  ParentInvoiceDemo,
  ParentApprovalDemo,
  ParentMessageThreadDemo,
  ParentEventDemo,
  ParentAssignmentDemo,
  ParentAttendanceDemo,
  ParentExamDemo,
  ParentCalendarItemDemo,
} from './parent-v2-demo-data';

export function FamilyHomeSection({ scope, childId }: ParentSectionProps) {
  const { data: homeData } = useParentV2Home({ scope, childId });
  const { navigate } = useNavigationStore();
  const checkoutMut = useCreateParentV2CheckoutSession();
  const approvalMut = useDecideParentV2Approval();
  useMarkParentV2AnnouncementRead();
  const rsvpMut = useRsvpParentV2Event();

  const children: ParentChildDemo[] = (homeData?.children as ParentChildDemo[] | undefined) ?? filterChildren(parentChildrenDemo, childId, scope);
  const actionRequired: ParentActionItemDemo[] = (homeData?.actionRequired as ParentActionItemDemo[] | undefined) ?? filterByChild(parentActionItemsDemo, childId, scope);
  const timetable: ParentTimetableItemDemo[] = (homeData?.todayTimetable as ParentTimetableItemDemo[] | undefined) ?? filterByChild(parentTimetableDemo, childId, scope);
  const announcements: ParentAnnouncementDemo[] = (homeData?.announcements as ParentAnnouncementDemo[] | undefined) ?? filterByChild(parentAnnouncementsDemo, childId, scope);
  const invoices: ParentInvoiceDemo[] = (homeData?.invoices as ParentInvoiceDemo[] | undefined) ?? filterByChild(parentInvoicesDemo, childId, scope);
  const approvals: ParentApprovalDemo[] = (homeData?.approvals as ParentApprovalDemo[] | undefined) ?? filterByChild(parentApprovalsDemo, childId, scope);
  const messages: ParentMessageThreadDemo[] = (homeData?.messages as ParentMessageThreadDemo[] | undefined) ?? filterByChild(parentMessageThreadsDemo, childId, scope);
  const events: ParentEventDemo[] = (homeData?.events as ParentEventDemo[] | undefined) ?? filterByChild(parentEventsDemo, childId, scope);
  const assignments: ParentAssignmentDemo[] = filterByChild(parentAssignmentsDemo, childId, scope);
  const attendance: ParentAttendanceDemo[] = filterByChild(parentAttendanceDemo, childId, scope);
  const exams: ParentExamDemo[] = filterByChild(parentExamsDemo, childId, scope);
  const calendarItems: ParentCalendarItemDemo[] = filterByChild(parentCalendarDemo, childId, scope);

  // Derived operational signals
  const unreadAnnouncementCount = announcements.filter((a) => !a.read).length;
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE');
  const pendingInvoices = invoices.filter((i) => i.status === 'ISSUED' || i.status === 'PARTIALLY_PAID' || i.status === 'OVERDUE');
  const totalOutstanding = pendingInvoices.reduce((s, i) => s + Math.max(i.totalAmount - i.amountPaid, 0), 0);
  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const unreadMessages = messages.filter((m) => m.unreadCount > 0);
  const missingAssignments = assignments.filter((a) => a.status === 'MISSING' || a.status === 'LATE');
  const upcomingExams = exams.filter((e) => e.status === 'UPCOMING');
  const recentAbsences = attendance.filter((a) => a.status === 'ABSENT' && !a.explanationSubmitted);
  const todayTimetable = timetable.filter((t) => t.weekday === 'Thursday'); // context: March 5 2026 = Thursday

  const urgentAlerts = useMemo(() => {
    const alerts: string[] = [];
    if (overdueInvoices.length > 0) alerts.push(`${overdueInvoices.length} overdue invoice(s) need immediate payment.`);
    if (recentAbsences.length > 0) alerts.push(`${recentAbsences.length} absence(s) require parent explanation.`);
    if (missingAssignments.length > 0) alerts.push(`${missingAssignments.length} assignment(s) are missing or late.`);
    if (pendingApprovals.filter((a) => a.priority === 'HIGH').length > 0) alerts.push('High-priority approval forms are awaiting your decision.');
    return alerts;
  }, [overdueInvoices, recentAbsences, missingAssignments, pendingApprovals]);

  const quickActions = useMemo(
    () => [
      { id: 'pay-invoice', icon: CreditCard, label: 'Pay invoice', count: pendingInvoices.length },
      { id: 'approve-form', icon: FileCheck2, label: 'Approve form', count: pendingApprovals.length },
      { id: 'message-teacher', icon: MessageSquare, label: 'Message teacher', count: unreadMessages.length },
      { id: 'read-announcement', icon: Bell, label: 'Announcements', count: unreadAnnouncementCount },
      { id: 'absence', icon: NotebookPen, label: 'Explain absence', count: recentAbsences.length },
      { id: 'calendar', icon: Calendar, label: 'Calendar', count: calendarItems.filter((c) => new Date(c.date) <= new Date('2026-03-12')).length },
    ],
    [pendingInvoices, pendingApprovals, unreadMessages, unreadAnnouncementCount, recentAbsences, calendarItems],
  );

  const [expandedActions, setExpandedActions] = useState(false);
  const visibleActions = expandedActions ? actionRequired : actionRequired.slice(0, 4);

  return (
    <ParentSectionShell
      title="Family School Control Center"
      description="Operational oversight across attendance, academics, communication, finance, and approvals."
    >
      {/* ── Urgent Alerts ── */}
      {urgentAlerts.length > 0 && (
        <div className="space-y-2">
          {urgentAlerts.map((alert, i) => (
            <UrgentInline key={i} message={alert} />
          ))}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          const quickActionHandlers: Record<string, () => void> = {
            'pay-invoice': () => navigate('parent', 'finance'),
            'approve-form': () => navigate('parent', 'approvals'),
            'message-teacher': () => navigate('parent', 'messages'),
            'read-announcement': () => navigate('parent', 'announcements'),
            'absence': () => navigate('parent', 'attendance'),
            'calendar': () => navigate('parent', 'calendar'),
          };
          return (
            <button
              key={action.id}
              type="button"
              className="group relative flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card/70 p-3 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
              onClick={quickActionHandlers[action.id]}
            >
              <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
              <span className="text-xs font-medium">{action.label}</span>
              {action.count > 0 && (
                <Badge variant="secondary" className="absolute -right-1 -top-1 h-5 min-w-5 justify-center border border-primary/30 bg-primary/10 px-1 text-[10px] font-bold text-primary">
                  {action.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Family Overview KPIs — operational, not decorative ── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-rose-500/20 bg-rose-500/5 dark:border-rose-500/15 dark:bg-rose-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-rose-500/10">
              <CreditCard className="size-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(totalOutstanding, 'USD')}</p>
              <p className="text-xs text-muted-foreground">{pendingInvoices.length} invoice(s) pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/5 dark:border-amber-500/15 dark:bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10">
              <FileCheck2 className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingApprovals.length}</p>
              <p className="text-xs text-muted-foreground">Forms awaiting decision</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-sky-500/20 bg-sky-500/5 dark:border-sky-500/15 dark:bg-sky-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10">
              <Mail className="size-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{unreadMessages.length}</p>
              <p className="text-xs text-muted-foreground">Unread conversations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 bg-emerald-500/5 dark:border-emerald-500/15 dark:bg-emerald-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <GraduationCap className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{upcomingExams.length}</p>
              <p className="text-xs text-muted-foreground">Exams coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Action Required ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="size-4 text-amber-500" />
                Action Required
              </CardTitle>
              <CardDescription>Items needing immediate guardian attention — sorted by priority</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">{actionRequired.length} item(s)</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {actionRequired.length === 0 ? (
            <EmptyActionState
              title="All clear — no action due today"
              message="No payments, approvals, or urgent follow-ups are waiting. You're up to date."
              ctaLabel="Review all modules"
            />
          ) : (
            <>
              {visibleActions.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/70 bg-card/50 p-3 transition-colors hover:bg-muted/30">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={item.priority} />
                    <StatusBadge status={item.status.replace(/_/g, ' ')} tone={item.status.includes('OVERDUE') || item.status.includes('MISSING') ? 'bad' : 'warn'} />
                    <span className="text-xs text-muted-foreground">{childDisplayName(item.childId)}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{item.title}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Due {formatDateLabel(item.dueDate)}</span>
                    <Button size="sm" variant="secondary" className="gap-1">
                      {item.quickAction}
                      <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {actionRequired.length > 4 && (
                <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpandedActions(!expandedActions)}>
                  {expandedActions ? 'Show less' : `Show all ${actionRequired.length} action items`}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Children Overview Cards ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Children Linked to This Account
          </CardTitle>
          <CardDescription>Real-time child-level status with actionable context</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {children.map((child) => {
            const childExams = exams.filter((e) => e.childId === child.id && e.status === 'UPCOMING');
            const childMissing = assignments.filter((a) => a.childId === child.id && (a.status === 'MISSING' || a.status === 'LATE'));
            return (
              <div key={child.id} className="rounded-xl border border-border/60 bg-card/50 p-4 transition-colors hover:bg-muted/20">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{child.firstName} {child.lastName}</p>
                    <p className="text-xs text-muted-foreground">{child.className} • Section {child.section} • {child.homeroomTeacher}</p>
                  </div>
                  <StatusBadge
                    status={child.attendanceFlag}
                    tone={child.attendanceFlag === 'RISK' ? 'bad' : child.attendanceFlag === 'WATCH' ? 'warn' : 'good'}
                  />
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="size-3.5" />
                    <span>{child.attendanceRate}% attendance</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <GraduationCap className="size-3.5" />
                    <span>{child.averageGrade}% avg grade</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Mail className="size-3.5" />
                    <span>{child.unreadMessages} unread msg</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileCheck2 className="size-3.5" />
                    <span>{child.pendingApprovals} pending forms</span>
                  </div>
                </div>
                {(childExams.length > 0 || childMissing.length > 0) && (
                  <div className="mt-3 space-y-1">
                    {child.nextExam && (
                      <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                        <BookOpen className="size-3.5" />
                        Next: {child.nextExam}
                      </p>
                    )}
                    {childMissing.length > 0 && (
                      <p className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="size-3.5" />
                        {childMissing.length} missing/late assignment(s)
                      </p>
                    )}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('parent', 'children', child.id)}>View profile</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate('parent', 'messages')}>Message teacher</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* ── Two-column: Today's Schedule + Recent Messages ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>Thursday, March 5 — per-child class timeline</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTimetable.length === 0 ? (
              <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
            ) : (
              todayTimetable.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{entry.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      {childDisplayName(entry.childId)} • {entry.startTime}–{entry.endTime} • {entry.room}
                    </p>
                    {entry.note && <p className="mt-1 text-xs italic text-amber-600 dark:text-amber-400">{entry.note}</p>}
                  </div>
                  <StatusBadge
                    status={entry.status}
                    tone={entry.status === 'CANCELLED' ? 'bad' : entry.status === 'SUBSTITUTE' ? 'warn' : 'good'}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4" />
              Recent Messages
            </CardTitle>
            <CardDescription>{unreadMessages.length} unread thread(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {messages.slice(0, 4).map((thread) => (
              <div key={thread.id} className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{thread.subject}</p>
                    <p className="text-xs text-muted-foreground">{thread.counterpart} • {thread.counterpartRole}</p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <Badge className="shrink-0 border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300">{thread.unreadCount} new</Badge>
                  )}
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{thread.lastMessage}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/60">{formatDateTimeLabel(thread.lastMessageAt)}</p>
              </div>
            ))}
            {messages.length > 4 && (
              <Button variant="ghost" size="sm" className="w-full gap-1 text-xs">
                View all {messages.length} threads <ArrowRight className="size-3" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Two-column: Announcements + Upcoming Dates ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-4" />
              School Feed
            </CardTitle>
            <CardDescription>{unreadAnnouncementCount} unread notice(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {announcements.slice(0, 4).map((notice) => (
              <div key={notice.id} className={`rounded-lg border p-3 ${!notice.read ? 'border-sky-500/30 bg-sky-500/5' : 'border-border/60'}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{notice.title}</p>
                      {!notice.read && <span className="size-1.5 rounded-full bg-sky-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {notice.author} • {notice.childId ? childDisplayName(notice.childId) : 'All families'}
                    </p>
                  </div>
                  <StatusBadge status={notice.category} tone={notice.category === 'URGENT' ? 'bad' : 'info'} />
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{notice.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/60">{formatDateTimeLabel(notice.createdAt)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4" />
              Upcoming Dates
            </CardTitle>
            <CardDescription>Next 3 weeks — exams, fees, events, deadlines</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {calendarItems.slice(0, 10).map((item) => {
              const typeIcons: Record<string, typeof Calendar> = {
                EXAM: BookOpen,
                ASSIGNMENT_DUE: NotebookPen,
                EVENT: Calendar,
                FEE_DUE: CreditCard,
                MEETING: Users,
                HOLIDAY: CheckCircle2,
              };
              const Icon = typeIcons[item.type] ?? Calendar;
              const toneMap: Record<string, 'bad' | 'warn' | 'info' | 'good'> = {
                EXAM: 'warn',
                ASSIGNMENT_DUE: 'info',
                EVENT: 'info',
                FEE_DUE: 'bad',
                MEETING: 'warn',
                HOLIDAY: 'good',
              };
              return (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border/50 px-3 py-2.5">
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.childId ? childDisplayName(item.childId) : 'Family'} • {formatDateLabel(item.date)}
                    </p>
                  </div>
                  <StatusBadge status={item.type.replace(/_/g, ' ')} tone={toneMap[item.type] ?? 'neutral'} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Pending Invoices ── */}
      {pendingInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4" />
              Invoices Needing Attention
            </CardTitle>
            <CardDescription>Outstanding: {formatCurrency(totalOutstanding, 'USD')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingInvoices.map((invoice) => {
              const remaining = Math.max(invoice.totalAmount - invoice.amountPaid, 0);
              return (
                <div key={invoice.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{invoice.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.id} • Due {formatDateLabel(invoice.dueDate)} • {childDisplayName(invoice.childId)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(remaining, invoice.currency)}</p>
                      <p className="text-[11px] text-muted-foreground">of {formatCurrency(invoice.totalAmount, invoice.currency)}</p>
                    </div>
                    <StatusBadge status={invoice.status} tone={invoice.status === 'OVERDUE' ? 'bad' : 'warn'} />
                    <Button size="sm" variant="default" disabled={checkoutMut.isPending} onClick={() => {
                      checkoutMut.mutate(invoice.id, {
                        onSuccess: () => notifySuccess('Checkout session created', 'Redirecting to payment…'),
                        onError: () => notifyError('Payment failed', 'Could not initiate payment. Please try again.'),
                      });
                    }}>{checkoutMut.isPending ? 'Processing…' : 'Pay'}</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── Pending Approvals ── */}
      {pendingApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck2 className="size-4" />
              Approval Decisions Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingApprovals.map((form) => (
              <div key={form.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={form.priority} />
                    <p className="text-sm font-medium">{form.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {childDisplayName(form.childId)} • {form.type.replace(/_/g, ' ')} • Due {formatDateLabel(form.dueDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="default" disabled={approvalMut.isPending} onClick={() => {
                    approvalMut.mutate({ approvalRequestId: form.id, decision: 'APPROVED' }, {
                      onSuccess: () => notifySuccess('Approved', `${form.title} has been approved`),
                      onError: () => notifyError('Approval failed'),
                    });
                  }}>{approvalMut.isPending ? 'Approving…' : 'Approve'}</Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('parent', 'approvals')}>Review</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── Upcoming Events ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="size-4" />
            Upcoming Events & Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.slice(0, 4).map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-muted-foreground">
                  {event.childId ? childDisplayName(event.childId) : 'All families'} • {event.location} • {formatDateLabel(event.date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={event.rsvpStatus} tone={event.rsvpStatus === 'GOING' ? 'good' : 'warn'} />
                {event.rsvpStatus === 'PENDING' && <Button size="sm" variant="outline" disabled={rsvpMut.isPending} onClick={() => {
                  rsvpMut.mutate({ eventId: event.id, status: 'GOING' }, {
                    onSuccess: () => notifySuccess('RSVP confirmed', `You're attending ${event.title}`),
                    onError: () => notifyError('RSVP failed'),
                  });
                }}>{rsvpMut.isPending ? 'Sending…' : 'RSVP'}</Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
