import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateTransportAssignment,
  useCreateTransportEvent,
  useDeleteTransportAssignment,
  useSchoolUsers,
  useTransportAssignments,
  useTransportRoutes,
  useTransportTracking,
  useUpdateTransportAssignment,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function StudentTrackingSection() {
  const { schoolId } = useAuthStore();
  const routesQuery = useTransportRoutes(schoolId);
  const studentsQuery = useSchoolUsers(schoolId, 'students', { pageSize: 200 });
  const assignmentsQuery = useTransportAssignments(schoolId);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const trackingQuery = useTransportTracking(schoolId, { assignmentId: selectedAssignmentId ?? undefined });

  const createAssignment = useCreateTransportAssignment(schoolId ?? '');
  const updateAssignment = useUpdateTransportAssignment(schoolId ?? '');
  const deleteAssignment = useDeleteTransportAssignment(schoolId ?? '');
  const createEvent = useCreateTransportEvent(schoolId ?? '');

  const [assignmentForm, setAssignmentForm] = useState({
    routeId: '',
    userId: '',
    stopId: '',
    status: 'ACTIVE',
    notes: '',
  });

  const [eventForm, setEventForm] = useState({ status: 'IN_TRANSIT', note: '' });

  const routes = routesQuery.data ?? [];
  const students = studentsQuery.data ?? [];
  const assignments = assignmentsQuery.data ?? [];
  const events = trackingQuery.data ?? [];

  const selectedRoute = useMemo(
    () => routes.find((route) => route.id === assignmentForm.routeId),
    [routes, assignmentForm.routeId],
  );

  const submitAssignment = async () => {
    await createAssignment.mutateAsync({
      routeId: assignmentForm.routeId,
      userId: assignmentForm.userId,
      stopId: assignmentForm.stopId || undefined,
      status: assignmentForm.status,
      notes: assignmentForm.notes,
    });
    setAssignmentForm({ routeId: '', userId: '', stopId: '', status: 'ACTIVE', notes: '' });
  };

  const submitEvent = async () => {
    if (!selectedAssignmentId) return;
    await createEvent.mutateAsync({ assignmentId: selectedAssignmentId, ...eventForm });
    setEventForm({ status: 'IN_TRANSIT', note: '' });
  };

  return (
    <SchoolSectionShell
      title="Student Tracking"
      description="Create transport assignments and record manual status events."
      actions={<Button size="sm" onClick={submitAssignment} disabled={!assignmentForm.routeId || !assignmentForm.userId || createAssignment.isPending}>Assign Student</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={assignmentForm.routeId} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, routeId: e.target.value, stopId: '' }))}>
            <option value="">Select route</option>
            {routes.map((route) => <option key={route.id} value={route.id}>{route.name}</option>)}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={assignmentForm.userId} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, userId: e.target.value }))}>
            <option value="">Select student</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.firstName} {student.lastName}</option>)}
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={assignmentForm.stopId} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, stopId: e.target.value }))}>
            <option value="">Select stop</option>
            {(selectedRoute?.stops ?? []).map((stop) => <option key={stop.id} value={stop.id}>{stop.sequence}. {stop.name}</option>)}
          </select>
          <Input placeholder="Status" value={assignmentForm.status} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, status: e.target.value }))} />
          <Input placeholder="Notes" value={assignmentForm.notes} onChange={(e) => setAssignmentForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={assignmentsQuery.isLoading}
        isError={assignmentsQuery.isError}
        isEmpty={!assignments.length}
        loadingLabel="Loading assignments"
        emptyLabel="No transport assignments"
        errorLabel="Failed to load transport assignments"
        onRetry={() => assignmentsQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Stop</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>{assignment.user ? `${assignment.user.firstName} ${assignment.user.lastName}` : assignment.userId}</TableCell>
                    <TableCell>{assignment.route?.name ?? assignment.routeId}</TableCell>
                    <TableCell>{assignment.stop?.name ?? '-'}</TableCell>
                    <TableCell>{assignment.status}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAssignment.mutate({ id: assignment.id, status: assignment.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' })}
                          disabled={updateAssignment.isPending}
                        >
                          Toggle Status
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedAssignmentId === assignment.id ? 'default' : 'secondary'}
                          onClick={() => setSelectedAssignmentId((prev) => (prev === assignment.id ? null : assignment.id))}
                        >
                          Events
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteAssignment.mutate(assignment.id)} disabled={deleteAssignment.isPending}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>

      {selectedAssignmentId ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              <Input className="max-w-[180px]" placeholder="Status" value={eventForm.status} onChange={(e) => setEventForm((prev) => ({ ...prev, status: e.target.value }))} />
              <Input className="flex-1" placeholder="Note" value={eventForm.note} onChange={(e) => setEventForm((prev) => ({ ...prev, note: e.target.value }))} />
              <Button size="sm" onClick={submitEvent} disabled={createEvent.isPending}>Add Event</Button>
            </div>

            <DataState
              isLoading={trackingQuery.isLoading}
              isError={trackingQuery.isError}
              isEmpty={!events.length}
              loadingLabel="Loading tracking events"
              emptyLabel="No events recorded"
              errorLabel="Failed to load tracking events"
              onRetry={() => trackingQuery.refetch()}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Recorded By</TableHead>
                    <TableHead>Recorded At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>{event.status}</TableCell>
                      <TableCell>{event.note}</TableCell>
                      <TableCell>{event.recorder ? `${event.recorder.firstName} ${event.recorder.lastName}` : event.recordedBy}</TableCell>
                      <TableCell>{new Date(event.recordedAt).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataState>
          </CardContent>
        </Card>
      ) : null}
    </SchoolSectionShell>
  );
}
