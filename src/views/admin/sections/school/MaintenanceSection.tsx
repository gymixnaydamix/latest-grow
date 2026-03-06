import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateMaintenanceRequest,
  useDeleteMaintenanceRequest,
  useFacilities,
  useMaintenanceRequests,
  useSchoolUsers,
  useUpdateMaintenanceRequest,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function MaintenanceSection() {
  const { schoolId } = useAuthStore();
  const maintenanceQuery = useMaintenanceRequests(schoolId);
  const facilitiesQuery = useFacilities(schoolId);
  const staffQuery = useSchoolUsers(schoolId, 'staff', { pageSize: 100 });

  const createMutation = useCreateMaintenanceRequest(schoolId ?? '');
  const updateMutation = useUpdateMaintenanceRequest(schoolId ?? '');
  const deleteMutation = useDeleteMaintenanceRequest(schoolId ?? '');

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    facilityId: '',
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    status: 'OPEN' as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED',
    assignedTo: '',
    notes: '',
  });

  const [editForm, setEditForm] = useState(form);

  const requests = maintenanceQuery.data ?? [];
  const facilities = facilitiesQuery.data ?? [];
  const staff = staffQuery.data ?? [];

  const submitCreate = async () => {
    await createMutation.mutateAsync({
      facilityId: form.facilityId || undefined,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      assignedTo: form.assignedTo || undefined,
      notes: form.notes,
    });
    setForm({
      facilityId: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: '',
      notes: '',
    });
  };

  const submitUpdate = async (id: string) => {
    await updateMutation.mutateAsync({
      id,
      facilityId: editForm.facilityId || undefined,
      title: editForm.title,
      description: editForm.description,
      priority: editForm.priority,
      status: editForm.status,
      assignedTo: editForm.assignedTo || undefined,
      notes: editForm.notes,
      ...(editForm.status === 'RESOLVED' ? { resolvedAt: new Date().toISOString() } : {}),
    });
    setEditingId(null);
  };

  return (
    <SchoolSectionShell
      title="Maintenance"
      description="Track maintenance requests and lifecycle status changes."
      actions={<Button size="sm" onClick={submitCreate} disabled={!form.title || !form.description || createMutation.isPending}>Create Request</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.facilityId} onChange={(e) => setForm((prev) => ({ ...prev, facilityId: e.target.value }))}>
            <option value="">No facility</option>
            {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
          </select>
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.priority} onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as typeof prev.priority }))}>
            <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as typeof prev.status }))}>
            <option value="OPEN">OPEN</option><option value="IN_PROGRESS">IN_PROGRESS</option><option value="RESOLVED">RESOLVED</option><option value="CLOSED">CLOSED</option>
          </select>
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.assignedTo} onChange={(e) => setForm((prev) => ({ ...prev, assignedTo: e.target.value }))}>
            <option value="">Unassigned</option>
            {staff.map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName}</option>)}
          </select>
          <Input placeholder="Notes" className="md:col-span-2" value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={maintenanceQuery.isLoading}
        isError={maintenanceQuery.isError}
        isEmpty={!requests.length}
        loadingLabel="Loading maintenance requests"
        emptyLabel="No maintenance requests"
        errorLabel="Failed to load maintenance requests"
        onRetry={() => maintenanceQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{editingId === request.id ? <Input value={editForm.title} onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))} /> : request.title}</TableCell>
                    <TableCell>
                      {editingId === request.id ? (
                        <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={editForm.facilityId} onChange={(e) => setEditForm((prev) => ({ ...prev, facilityId: e.target.value }))}>
                          <option value="">No facility</option>
                          {facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.name}</option>)}
                        </select>
                      ) : (
                        request.facility?.name ?? 'General'
                      )}
                    </TableCell>
                    <TableCell>{editingId === request.id ? <Input value={editForm.priority} onChange={(e) => setEditForm((prev) => ({ ...prev, priority: e.target.value as typeof prev.priority }))} /> : request.priority}</TableCell>
                    <TableCell>{editingId === request.id ? <Input value={editForm.status} onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value as typeof prev.status }))} /> : request.status}</TableCell>
                    <TableCell>{request.assignee ? `${request.assignee.firstName} ${request.assignee.lastName}` : 'Unassigned'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {editingId === request.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdate(request.id)} disabled={updateMutation.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(request.id);
                              setEditForm({
                                facilityId: request.facilityId ?? '',
                                title: request.title,
                                description: request.description,
                                priority: request.priority as typeof form.priority,
                                status: request.status as typeof form.status,
                                assignedTo: request.assignedTo ?? '',
                                notes: request.notes,
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(request.id)} disabled={deleteMutation.isPending}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>
    </SchoolSectionShell>
  );
}
