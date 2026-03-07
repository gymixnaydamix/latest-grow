import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Bus,
  Calendar,
  CreditCard,
  FileCheck2,
  GraduationCap,
  Mail,
  TrendingUp,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useParentV2ChildDetail, useParentV2Children } from '@/hooks/api/use-parent-v2';
import {
  childDisplayName as _childDisplayName,
  filterByChild as _filterByChild,
  filterChildren,
  formatCurrency,
  formatDateLabel,
  parentAssignmentsDemo as FALLBACK_ASSIGNMENTS,
  parentAttendanceDemo as FALLBACK_ATTENDANCE,
  parentChildrenDemo as FALLBACK_CHILDREN,
  parentExamsDemo as FALLBACK_EXAMS,
  parentGradesDemo as FALLBACK_GRADES,
  parentInvoicesDemo as FALLBACK_INVOICES,
  parentTransportDemo as FALLBACK_TRANSPORT,
} from './parent-v2-demo-data';
import type { ParentChildDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge } from './shared';
import type { ParentSectionProps } from './shared';

export function MyChildrenSection({ scope, childId }: ParentSectionProps) {
  const { data: childrenRaw } = useParentV2Children({ scope, childId });
  const children: ParentChildDemo[] = (childrenRaw as ParentChildDemo[] | undefined) ?? filterChildren(FALLBACK_CHILDREN, childId, scope);

  const [activeChildId, setActiveChildId] = useState<string>(childId ?? children[0]?.id ?? FALLBACK_CHILDREN[0].id);
  useParentV2ChildDetail(activeChildId);

  const activeChild = useMemo(
    () => children.find((entry) => entry.id === activeChildId) ?? FALLBACK_CHILDREN.find((entry) => entry.id === activeChildId),
    [children, activeChildId],
  );

  const invoiceSummary = FALLBACK_INVOICES.filter((entry) => entry.childId === activeChildId);
  const transportSummary = FALLBACK_TRANSPORT.find((entry) => entry.childId === activeChildId);
  const childExams = FALLBACK_EXAMS.filter((e) => e.childId === activeChildId && e.status === 'UPCOMING');
  const childAssignments = FALLBACK_ASSIGNMENTS.filter((a) => a.childId === activeChildId);
  const childGrades = FALLBACK_GRADES.filter((g) => g.childId === activeChildId);
  const childAttendance = FALLBACK_ATTENDANCE.filter((a) => a.childId === activeChildId);
  const missingAssignments = childAssignments.filter((a) => a.status === 'MISSING' || a.status === 'LATE');
  const recentAbsences = childAttendance.filter((a) => a.status === 'ABSENT');
  const totalOwed = invoiceSummary.reduce((s, i) => s + Math.max(i.totalAmount - i.amountPaid, 0), 0);

  return (
    <ParentSectionShell
      title="My Children"
      description="Switch between children and review class, attendance, academics, finance, and transport context."
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {/* Child Selector Sidebar */}
        <div className="space-y-3 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Linked Children</CardTitle>
              <CardDescription>Select a child profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setActiveChildId(child.id)}
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    activeChildId === child.id
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border/70 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                      <User className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{child.firstName} {child.lastName}</p>
                      <p className="text-xs text-muted-foreground">
                        {child.className} • Section {child.section}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge
                      status={child.attendanceFlag}
                      tone={child.attendanceFlag === 'RISK' ? 'bad' : child.attendanceFlag === 'WATCH' ? 'warn' : 'good'}
                    />
                    <span className="text-xs text-muted-foreground">{child.averageGrade}% avg</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Profile Area */}
        <div className="space-y-4 lg:col-span-3">
          {!activeChild ? (
            <EmptyActionState
              title="No child selected"
              message="Select a child from the sidebar to view their profile."
              ctaLabel="Select child"
            />
          ) : (
            <>
              {/* Header Card */}
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{activeChild.firstName} {activeChild.lastName}</CardTitle>
                      <CardDescription>
                        {activeChild.className} • Section {activeChild.section} • Grade Level {activeChild.gradeLevel}
                      </CardDescription>
                    </div>
                    <StatusBadge
                      status={`Attendance: ${activeChild.attendanceFlag}`}
                      tone={activeChild.attendanceFlag === 'RISK' ? 'bad' : activeChild.attendanceFlag === 'WATCH' ? 'warn' : 'good'}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
                      <TrendingUp className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-bold">{activeChild.attendanceRate}%</p>
                        <p className="text-xs text-muted-foreground">Attendance rate</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
                      <GraduationCap className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-bold">{activeChild.averageGrade}%</p>
                        <p className="text-xs text-muted-foreground">Average grade</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
                      <Mail className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-bold">{activeChild.unreadMessages}</p>
                        <p className="text-xs text-muted-foreground">Unread messages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border/60 p-3">
                      <FileCheck2 className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-bold">{activeChild.pendingApprovals}</p>
                        <p className="text-xs text-muted-foreground">Pending forms</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alert Row */}
              {(missingAssignments.length > 0 || recentAbsences.length > 0) && (
                <div className="space-y-2">
                  {missingAssignments.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-700 dark:text-rose-300">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{missingAssignments.length} assignment(s) missing or late — immediate attention needed</span>
                    </div>
                  )}
                  {recentAbsences.filter((a) => !a.explanationSubmitted).length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-300">
                      <AlertTriangle className="size-4 shrink-0" />
                      <span>{recentAbsences.filter((a) => !a.explanationSubmitted).length} unexplained absence(s)</span>
                    </div>
                  )}
                </div>
              )}

              {/* Two-column: Details + Finance/Transport */}
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Personal Details & Academics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Personal Details & Academics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/60 p-3">
                        <p className="text-xs text-muted-foreground">Homeroom Teacher</p>
                        <p className="text-sm font-medium">{activeChild.homeroomTeacher}</p>
                      </div>
                      <div className="rounded-lg border border-border/60 p-3">
                        <p className="text-xs text-muted-foreground">Emergency Contact</p>
                        <p className="text-sm font-medium">{activeChild.emergencyContact}</p>
                      </div>
                    </div>

                    {activeChild.nextExam && (
                      <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                        <BookOpen className="size-4 text-amber-600 dark:text-amber-400" />
                        <div>
                          <p className="text-xs text-muted-foreground">Next Exam</p>
                          <p className="text-sm font-medium">{activeChild.nextExam}</p>
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Upcoming Exams ({childExams.length})</p>
                      {childExams.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No upcoming exams</p>
                      ) : (
                        <div className="space-y-1.5">
                          {childExams.slice(0, 3).map((exam) => (
                            <div key={exam.id} className="flex items-center justify-between text-sm">
                              <span>{exam.subject} — {exam.title}</span>
                              <span className="text-xs text-muted-foreground">{formatDateLabel(exam.date)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Recent Grades ({childGrades.length})</p>
                      <div className="space-y-1.5">
                        {childGrades.slice(0, 4).map((grade) => (
                          <div key={grade.id} className="flex items-center justify-between text-sm">
                            <div className="min-w-0 flex-1">
                              <span className="font-medium">{grade.assessment}</span>
                              <span className="text-xs text-muted-foreground"> · {grade.subject}</span>
                            </div>
                            <Badge
                              className={`ml-2 ${
                                grade.percentage >= 85
                                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                  : grade.percentage >= 70
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                    : 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              {grade.letterGrade} ({grade.percentage}%)
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Finance & Transport */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CreditCard className="size-4" />
                        Finance Summary
                      </CardTitle>
                      <CardDescription>
                        {totalOwed > 0
                          ? `Outstanding: ${formatCurrency(totalOwed, invoiceSummary[0]?.currency ?? 'USD')}`
                          : 'All invoices settled'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {invoiceSummary.map((invoice) => {
                        const remaining = Math.max(invoice.totalAmount - invoice.amountPaid, 0);
                        return (
                          <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-sm">
                            <div className="min-w-0 flex-1">
                              <p className="font-medium">{invoice.title}</p>
                              <p className="text-xs text-muted-foreground">Due {formatDateLabel(invoice.dueDate)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {remaining > 0 && (
                                <span className="text-xs font-medium">{formatCurrency(remaining, invoice.currency)}</span>
                              )}
                              <StatusBadge
                                status={invoice.status}
                                tone={invoice.status === 'PAID' ? 'good' : invoice.status === 'OVERDUE' ? 'bad' : 'warn'}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bus className="size-4" />
                        Transport
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {transportSummary ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{transportSummary.routeName}</p>
                            <StatusBadge
                              status={transportSummary.status}
                              tone={transportSummary.status === 'ON_TIME' ? 'good' : transportSummary.status === 'DELAYED' ? 'warn' : 'bad'}
                            />
                          </div>
                          <div className="grid gap-1 text-xs text-muted-foreground">
                            <p>Pickup: {transportSummary.pickupStop} ({transportSummary.pickupWindow})</p>
                            <p>Drop: {transportSummary.dropStop} ({transportSummary.dropWindow})</p>
                            <p>Vehicle: {transportSummary.vehicle}</p>
                            <p>Driver: {transportSummary.driverName} • {transportSummary.driverPhone}</p>
                          </div>
                          {transportSummary.note && (
                            <p className="rounded border border-border/50 bg-muted/30 p-2 text-xs italic text-muted-foreground">{transportSummary.note}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No transport route assigned</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Navigation */}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" className="gap-1.5"><GraduationCap className="size-3.5" /> Academics</Button>
                <Button size="sm" variant="secondary" className="gap-1.5"><Calendar className="size-3.5" /> Attendance</Button>
                <Button size="sm" variant="secondary" className="gap-1.5"><BookOpen className="size-3.5" /> Assignments</Button>
                <Button size="sm" variant="secondary" className="gap-1.5"><CreditCard className="size-3.5" /> Finance</Button>
                <Button size="sm" variant="secondary" className="gap-1.5"><Mail className="size-3.5" /> Messages</Button>
              </div>
            </>
          )}
        </div>
      </div>
    </ParentSectionShell>
  );
}
