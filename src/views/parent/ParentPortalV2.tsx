import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParentPortalStore } from '@/store/parent-portal.store';
import { useParentV2Children, useParentV2PinnedItems } from '@/hooks/api/use-parent-v2';
import { FamilyHomeSection } from './sections/v2/FamilyHomeSection';
import { MyChildrenSection } from './sections/v2/MyChildrenSection';
import { TimetableSection } from './sections/v2/TimetableSection';
import { AssignmentsSection } from './sections/v2/AssignmentsSection';
import { ExamsSection } from './sections/v2/ExamsSection';
import { GradesReportCardsSection } from './sections/v2/GradesReportCardsSection';
import { AttendanceSection } from './sections/v2/AttendanceSection';
import { MessagesSection } from './sections/v2/MessagesSection';
import { AnnouncementsSection } from './sections/v2/AnnouncementsSection';
import { FeesPaymentsSection } from './sections/v2/FeesPaymentsSection';
import { ApprovalsFormsSection } from './sections/v2/ApprovalsFormsSection';
import { TransportSection } from './sections/v2/TransportSection';
import { DocumentsSection } from './sections/v2/DocumentsSection';
import { EventsMeetingsSection } from './sections/v2/EventsMeetingsSection';
import { ProfileSettingsSection } from './sections/v2/ProfileSettingsSection';
import { SupportSection } from './sections/v2/SupportSection';
import {
  buildParentRouteContextSearch,
  DEFAULT_PARENT_PATH,
  parseParentRouteContext,
  withParentRouteContext,
} from './parent-navigation';

export function ParentPortalV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    selectedScope,
    selectedChildId,
    setScope,
    setSelectedChild,
  } = useParentPortalStore();

  const { data: childRows = [] } = useParentV2Children({ scope: selectedScope, childId: selectedChildId });
  const pinnedItemsQuery = useParentV2PinnedItems(true);

  useEffect(() => {
    const context = parseParentRouteContext(searchParams);
    if (context.scope !== selectedScope || context.childId !== selectedChildId) {
      if (context.scope === 'child') {
        setScope('child', context.childId);
      } else {
        setScope('family', context.childId);
      }
    }
  }, [searchParams, selectedScope, selectedChildId, setScope]);

  useEffect(() => {
    const nextSearch = buildParentRouteContextSearch({
      scope: selectedScope,
      childId: selectedChildId,
    });

    if (`?${searchParams.toString()}` !== nextSearch) {
      setSearchParams(new URLSearchParams(nextSearch), { replace: true });
    }
  }, [searchParams, selectedScope, selectedChildId, setSearchParams]);

  useEffect(() => {
    if (selectedScope !== 'child') return;
    if (selectedChildId) return;
    if (!childRows[0]?.id) return;
    setSelectedChild(childRows[0].id);
  }, [childRows, selectedChildId, selectedScope, setSelectedChild]);

  const scopeChildId = selectedScope === 'child' ? selectedChildId : null;
  const sectionProps = { scope: selectedScope, childId: scopeChildId };
  const pinnedItems = pinnedItemsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/70 p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant={selectedScope === 'family' ? 'default' : 'outline'}
              onClick={() => setScope('family', null)}
            >
              Family view
            </Button>
            <Button
              size="sm"
              variant={selectedScope === 'child' ? 'default' : 'outline'}
              onClick={() => setScope('child', selectedChildId ?? childRows[0]?.id ?? null)}
            >
              Child view
            </Button>
          </div>

          <div className="flex min-w-56 items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            <Select
              value={selectedChildId ?? childRows[0]?.id ?? ''}
              onValueChange={(value) => setSelectedChild(value)}
              disabled={childRows.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {childRows.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.firstName} {child.lastName} • {child.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {pinnedItems.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {pinnedItems.slice(0, 6).map((item) => (
              <button
                key={item.id}
                type="button"
                className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
                onClick={() => {
                  const path = item.moduleId.startsWith('/') ? item.moduleId : DEFAULT_PARENT_PATH;
                  navigate(withParentRouteContext(path, location.search, {
                    scope: selectedScope,
                    childId: selectedChildId,
                  }));
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Routes>
        <Route
          index
          element={
            <Navigate
              replace
              to={`${DEFAULT_PARENT_PATH.replace('/parent/', '')}${buildParentRouteContextSearch({
                scope: selectedScope,
                childId: selectedChildId,
              })}`}
            />
          }
        />

        <Route path="home/overview" element={<FamilyHomeSection {...sectionProps} />} />
        <Route path="home/action-required" element={<FamilyHomeSection {...sectionProps} />} />
        <Route path="home/today" element={<FamilyHomeSection {...sectionProps} />} />

        <Route path="children/profile/:subview" element={<MyChildrenSection {...sectionProps} />} />
        <Route path="children/services/:subview" element={<MyChildrenSection {...sectionProps} />} />

        <Route path="timetable/weekly" element={<TimetableSection {...sectionProps} />} />
        <Route path="assignments/tracker/:subview" element={<AssignmentsSection {...sectionProps} />} />
        <Route path="exams/planner" element={<ExamsSection {...sectionProps} />} />
        <Route path="grades/gradebook" element={<GradesReportCardsSection {...sectionProps} />} />
        <Route path="attendance/records" element={<AttendanceSection {...sectionProps} />} />

        <Route path="messages/inbox" element={<MessagesSection {...sectionProps} />} />
        <Route path="messages/compose" element={<MessagesSection {...sectionProps} />} />
        <Route path="messages/thread/:threadId" element={<MessagesSection {...sectionProps} />} />

        <Route path="announcements/feed" element={<AnnouncementsSection {...sectionProps} />} />

        <Route path="fees/billing/:subview" element={<FeesPaymentsSection {...sectionProps} />} />
        <Route path="fees/billing/invoices/:invoiceId" element={<FeesPaymentsSection {...sectionProps} />} />

        <Route path="approvals/pending" element={<ApprovalsFormsSection {...sectionProps} />} />
        <Route path="transport/tracking" element={<TransportSection {...sectionProps} />} />
        <Route path="documents/center" element={<DocumentsSection {...sectionProps} />} />
        <Route path="documents/:documentId" element={<DocumentsSection {...sectionProps} />} />

        <Route path="events/:subview" element={<EventsMeetingsSection {...sectionProps} />} />
        <Route path="settings/preferences/:subview" element={<ProfileSettingsSection {...sectionProps} />} />

        <Route path="support/:subview" element={<SupportSection {...sectionProps} />} />
        <Route path="support/tickets/:ticketId" element={<SupportSection {...sectionProps} />} />

        <Route
          path="*"
          element={
            <Navigate
              replace
              to={`${DEFAULT_PARENT_PATH.replace('/parent/', '')}${buildParentRouteContextSearch({
                scope: selectedScope,
                childId: selectedChildId,
              })}`}
            />
          }
        />
      </Routes>
    </div>
  );
}
