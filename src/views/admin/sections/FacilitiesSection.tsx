/* ─── FacilitiesSection ─── API-backed rooms, maintenance, assets, bookings ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useRooms, useOpsMaintenanceRequests, useAssets,
  useOpsFacilityBookings, useOpsCreateMaintenanceRequest, useBookFacility,
  useCreateRoom, useUpdateRoom, useDeleteRoom,
  useOpsUpdateMaintenanceRequest, useOpsDeleteMaintenanceRequest,
  useCreateAsset, useUpdateAsset, useDeleteAsset,
  useUpdateBooking, useCancelBooking,
} from '@/hooks/api/use-school-ops';

/* ─── Local types matching API shape ─── */
type Room = Record<string, unknown> & {
  id: string; name: string; type: string; capacity: number;
  allocated: string; status: string; floor: string;
};
type MaintenanceRequest = Record<string, unknown> & {
  id: string; room: string; type: string; priority: string;
  description: string; status: string; reportedAt: string;
  assignedTo?: string; completedAt?: string;
};
type Asset = Record<string, unknown> & {
  id: string; name: string; type: string; location: string;
  purchaseDate: string; value: string; condition: string; assignedTo: string;
};
type FacilityBooking = Record<string, unknown> & {
  id: string; room: string; event: string; date: string;
  time: string; bookedBy: string; status: string;
};
import {
  Plus, Eye, Edit, Wrench, Calendar, Trash2,
  AlertTriangle, CheckCircle, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable, StatusBadge, OperationBlock,
  FormDialog, type FormField,
  DetailPanel, DetailFields, type DetailTab,
} from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { notifySuccess } from '@/lib/notify';

/* ═══════════════ Rooms & Spaces ═══════════════ */
function RoomsView() {
  const { schoolId } = useAuthStore();
  const { data: roomsRes } = useRooms(schoolId);
  const rooms: Room[] = Array.isArray(roomsRes) ? roomsRes : (roomsRes as any)?.items ?? [];
  const createRoom = useCreateRoom(schoolId);
  const updateRoom = useUpdateRoom(schoolId);
  const deleteRoom = useDeleteRoom(schoolId);
  const bookFacility = useBookFacility(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [detail, setDetail] = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Room | null>(null);

  const fields: FormField[] = [
    { name: 'name', label: 'Room Name', type: 'text', required: true },
    { name: 'type', label: 'Type', type: 'select', required: true, half: true, options: [
      { label: 'Classroom', value: 'Classroom' },
      { label: 'Lab', value: 'Lab' },
      { label: 'Science Lab', value: 'Science Lab' },
      { label: 'Exam Hall', value: 'Exam Hall' },
      { label: 'Library', value: 'Library' },
      { label: 'Outdoor', value: 'Outdoor' },
    ] },
    { name: 'floor', label: 'Floor', type: 'text', required: true, half: true },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true, half: true },
    { name: 'allocated', label: 'Allocation', type: 'text', half: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'In Use', value: 'In Use' },
      { label: 'Available', value: 'Available' },
      { label: 'Maintenance', value: 'Maintenance' },
    ] },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateRoom.mutate({ id: editing.id, ...data } as any, {
        onSuccess: () => notifySuccess('Updated', `Room "${data.name}" updated`),
      });
    } else {
      createRoom.mutate(data, {
        onSuccess: () => notifySuccess('Created', `Room "${data.name}" added`),
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Room Info', content: (
      <DetailFields fields={[
        { label: 'Name', value: detail.name },
        { label: 'Type', value: detail.type },
        { label: 'Floor', value: detail.floor },
        { label: 'Capacity', value: String(detail.capacity) },
        { label: 'Allocation', value: detail.allocated },
        { label: 'Status', value: detail.status },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Rooms & Spaces</h2>
          <p className="text-sm text-muted-foreground/60">{rooms.length} facilities managed</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> Add Room
        </Button>
      </div>

      <DataTable
        data={rooms as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Room/Space', sortable: true, render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'type', label: 'Type', render: v => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'floor', label: 'Floor' },
          { key: 'capacity', label: 'Capacity', sortable: true },
          { key: 'allocated', label: 'Allocation' },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as Room) },
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as Room); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: r => setDeleteTarget(r as unknown as Room), variant: 'destructive' },
        ]}
        searchPlaceholder="Search rooms..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Room' : 'Add Room'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={detail?.name ?? ''} subtitle={`${detail?.type ?? ''} · Floor ${detail?.floor ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Book', icon: <Calendar className="size-3.5" />, onClick: () => { bookFacility.mutate({ roomId: detail?.id, date: new Date().toISOString().slice(0, 10), startTime: '09:00', endTime: '10:00', purpose: 'General use' } as any, { onSuccess: () => notifySuccess('Booking', `Booking confirmed for ${detail?.name}`) }); } },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Remove Room?" description={`Remove "${deleteTarget?.name}" from facilities?`}
        confirmLabel="Remove" variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteRoom.mutate(deleteTarget.id, {
              onSuccess: () => notifySuccess('Removed', `Room "${deleteTarget.name}" removed`),
            });
            setDeleteTarget(null);
          }
        }} />
    </div>
  );
}

/* ═══════════════ Maintenance ═══════════════ */
function MaintenanceView() {
  const { schoolId } = useAuthStore();
  const { data: maintRes } = useOpsMaintenanceRequests(schoolId);
  const requests: MaintenanceRequest[] = Array.isArray(maintRes) ? maintRes : (maintRes as any)?.items ?? [];
  const createMaintenance = useOpsCreateMaintenanceRequest(schoolId);
  const updateMaintenance = useOpsUpdateMaintenanceRequest(schoolId);
  const deleteMaintenance = useOpsDeleteMaintenanceRequest(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MaintenanceRequest | null>(null);
  const [detail, setDetail] = useState<MaintenanceRequest | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaintenanceRequest | null>(null);

  const openCount = requests.filter(r => r.status === 'Reported').length;
  const inProgress = requests.filter(r => r.status === 'In Progress').length;
  const scheduled = requests.filter(r => r.status === 'Scheduled').length;
  const completed = requests.filter(r => r.status === 'Completed').length;

  const fields: FormField[] = [
    { name: 'room', label: 'Room/Location', type: 'text', required: true, half: true },
    { name: 'type', label: 'Type', type: 'select', required: true, half: true, options: [
      { label: 'Electrical', value: 'Electrical' },
      { label: 'Plumbing', value: 'Plumbing' },
      { label: 'IT', value: 'IT' },
      { label: 'Equipment', value: 'Equipment' },
      { label: 'General', value: 'General' },
    ] },
    { name: 'priority', label: 'Priority', type: 'select', required: true, half: true, options: [
      { label: 'Low', value: 'Low' },
      { label: 'Medium', value: 'Medium' },
      { label: 'High', value: 'High' },
    ] },
    { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: [
      { label: 'Reported', value: 'Reported' },
      { label: 'Scheduled', value: 'Scheduled' },
      { label: 'In Progress', value: 'In Progress' },
      { label: 'Completed', value: 'Completed' },
    ], defaultValue: 'Reported' },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'assignedTo', label: 'Assigned To', type: 'text' },
    { name: 'reportedAt', label: 'Reported Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateMaintenance.mutate({ id: editing.id, ...data } as any, {
        onSuccess: () => notifySuccess('Updated', `Ticket ${editing.id} updated`),
      });
    } else {
      createMaintenance.mutate(data, {
        onSuccess: () => notifySuccess('Reported', `Maintenance issue for ${data.room} logged`),
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Location', value: detail.room },
        { label: 'Type', value: detail.type },
        { label: 'Priority', value: detail.priority },
        { label: 'Description', value: detail.description },
        { label: 'Assigned To', value: detail.assignedTo || 'Unassigned' },
        { label: 'Reported', value: detail.reportedAt },
        { label: 'Completed', value: detail.completedAt || '—' },
        { label: 'Status', value: detail.status },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Maintenance Tickets</h2>
          <p className="text-sm text-muted-foreground/60">{requests.filter(r => r.status !== 'Completed').length} open tickets</p>
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Wrench className="size-3.5 mr-1.5" /> Report Issue
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <OperationBlock icon={AlertTriangle} label="Reported" value={openCount} sublabel="Awaiting assignment" color="text-red-400" />
        <OperationBlock icon={Clock} label="In Progress" value={inProgress} sublabel="Being worked on" color="text-amber-400" />
        <OperationBlock icon={Calendar} label="Scheduled" value={scheduled} sublabel="Upcoming" color="text-blue-400" />
        <OperationBlock icon={CheckCircle} label="Completed" value={completed} sublabel="This month" color="text-emerald-400" />
      </div>

      <DataTable
        data={requests as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'Ticket', render: v => <span className="font-mono text-xs text-amber-400">{String(v)}</span> },
          { key: 'room', label: 'Location', sortable: true },
          { key: 'type', label: 'Type' },
          { key: 'description', label: 'Issue', render: v => <span className="text-xs text-muted-foreground/60 truncate max-w-50 block">{String(v)}</span> },
          { key: 'priority', label: 'Priority', sortable: true, render: v => {
            const c = String(v) === 'High' ? 'border-red-500/30 text-red-400' : String(v) === 'Medium' ? 'border-amber-500/30 text-amber-400' : 'border-border text-muted-foreground/60';
            return <Badge variant="outline" className={`text-[10px] ${c}`}>{String(v)}</Badge>;
          } },
          { key: 'assignedTo', label: 'Assigned To', render: v => <span className="text-xs">{String(v || 'Unassigned')}</span> },
          { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as MaintenanceRequest) },
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as MaintenanceRequest); setFormOpen(true); } },
          { label: 'Complete', icon: CheckCircle, onClick: r => {
            updateMaintenance.mutate({ id: String(r.id), status: 'Completed', completedAt: new Date().toISOString().split('T')[0] } as any, {
              onSuccess: () => notifySuccess('Completed', `Ticket ${String(r.id)} marked complete`),
            });
          } },
        ]}
        searchPlaceholder="Search tickets..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Ticket' : 'Report Maintenance Issue'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={`Ticket ${detail?.id ?? ''}`} subtitle={`${detail?.room ?? ''} · ${detail?.type ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Mark Complete', icon: <CheckCircle className="size-3.5" />, onClick: () => {
            if (detail) {
              updateMaintenance.mutate({ id: detail.id, status: 'Completed', completedAt: new Date().toISOString().split('T')[0] } as any, {
                onSuccess: () => notifySuccess('Completed', `Ticket ${detail.id} marked complete`),
              });
              setDetail(null);
            }
          } },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Delete Ticket?" description={`Remove maintenance ticket ${deleteTarget?.id}?`}
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMaintenance.mutate(deleteTarget.id, {
              onSuccess: () => notifySuccess('Deleted', `Ticket ${deleteTarget.id} removed`),
            });
            setDeleteTarget(null);
          }
        }} />
    </div>
  );
}

/* ═══════════════ Assets ═══════════════ */
function AssetsView() {
  const { schoolId } = useAuthStore();
  const { data: assetsRes } = useAssets(schoolId);
  const assets: Asset[] = Array.isArray(assetsRes) ? assetsRes : (assetsRes as any)?.items ?? [];
  const createAsset = useCreateAsset(schoolId);
  const updateAsset = useUpdateAsset(schoolId);
  const deleteAsset = useDeleteAsset(schoolId);

  /* Maintenance log for an asset — filter requests by asset location */
  const { data: maintRes } = useOpsMaintenanceRequests(schoolId);
  const allMaint: MaintenanceRequest[] = Array.isArray(maintRes) ? maintRes : (maintRes as any)?.items ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [detail, setDetail] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [maintLogAsset, setMaintLogAsset] = useState<Asset | null>(null);
  const assetMaintHistory = allMaint.filter(m => maintLogAsset && m.room.toLowerCase().includes(maintLogAsset.location.toLowerCase()));

  const fields: FormField[] = [
    { name: 'name', label: 'Asset Name', type: 'text', required: true },
    { name: 'type', label: 'Category', type: 'select', required: true, half: true, options: [
      { label: 'Electronics', value: 'Electronics' },
      { label: 'Lab Equipment', value: 'Lab Equipment' },
      { label: 'Books', value: 'Books' },
      { label: 'Equipment', value: 'Equipment' },
    ] },
    { name: 'location', label: 'Location', type: 'text', required: true, half: true },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true, half: true },
    { name: 'value', label: 'Value', type: 'text', required: true, half: true },
    { name: 'condition', label: 'Condition', type: 'select', required: true, half: true, options: [
      { label: 'New', value: 'New' },
      { label: 'Excellent', value: 'Excellent' },
      { label: 'Good', value: 'Good' },
      { label: 'Fair', value: 'Fair' },
      { label: 'Poor', value: 'Poor' },
    ] },
    { name: 'assignedTo', label: 'Assigned To', type: 'text', half: true },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateAsset.mutate({ id: editing.id, ...data } as any, {
        onSuccess: () => notifySuccess('Updated', `Asset "${data.name}" updated`),
      });
    } else {
      createAsset.mutate(data, {
        onSuccess: () => notifySuccess('Registered', `Asset "${data.name}" added`),
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Asset Info', content: (
      <DetailFields fields={[
        { label: 'Name', value: detail.name },
        { label: 'Category', value: detail.type },
        { label: 'Location', value: detail.location },
        { label: 'Purchase Date', value: detail.purchaseDate },
        { label: 'Value', value: detail.value },
        { label: 'Condition', value: detail.condition },
        { label: 'Assigned To', value: detail.assignedTo || '—' },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Asset Register</h2>
          <p className="text-sm text-muted-foreground/60">{assets.length} assets tracked</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> Add Asset
        </Button>
      </div>

      <DataTable
        data={assets as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'Asset ID', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'name', label: 'Asset', sortable: true, render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'type', label: 'Category', sortable: true },
          { key: 'location', label: 'Location' },
          { key: 'value', label: 'Value', sortable: true, render: v => <span className="font-mono text-emerald-400/70">{String(v)}</span> },
          { key: 'condition', label: 'Condition', render: v => <StatusBadge status={String(v)} /> },
          { key: 'assignedTo', label: 'Assigned To' },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as Asset) },
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as Asset); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: r => setDeleteTarget(r as unknown as Asset), variant: 'destructive' },
        ]}
        searchPlaceholder="Search assets..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Asset' : 'Register Asset'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={detail?.name ?? ''} subtitle={`${detail?.type ?? ''} · ${detail?.location ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Maintenance Log', icon: <Wrench className="size-3.5" />, onClick: () => { setMaintLogAsset(detail); setDetail(null); } },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Remove Asset?" description={`Remove "${deleteTarget?.name}" from register?`}
        confirmLabel="Remove" variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            deleteAsset.mutate(deleteTarget.id, {
              onSuccess: () => notifySuccess('Removed', `Asset "${deleteTarget.name}" removed`),
            });
            setDeleteTarget(null);
          }
        }} />

      {/* Maintenance Log panel for this asset */}
      <DetailPanel open={!!maintLogAsset} onOpenChange={() => setMaintLogAsset(null)}
        title={`Maintenance Log — ${maintLogAsset?.name ?? ''}`}
        subtitle={`Location: ${maintLogAsset?.location ?? ''}`}
        tabs={[{
          id: 'log', label: 'History', content: assetMaintHistory.length === 0
            ? <p className="text-sm text-muted-foreground/60 py-4">No maintenance records found for this location.</p>
            : (
              <div className="space-y-3">
                {assetMaintHistory.map(m => (
                  <div key={m.id} className="border border-border rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-400">{m.id}</span>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-sm text-foreground/80">{m.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground/60">
                      <span>Type: {m.type}</span>
                      <span>Priority: {m.priority}</span>
                      <span>Reported: {m.reportedAt}</span>
                      {m.completedAt && <span>Completed: {m.completedAt}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ),
        }]}
        actions={[]} />
    </div>
  );
}

/* ═══════════════ Facility Bookings ═══════════════ */
function FacilityCalendarView() {
  const { schoolId } = useAuthStore();
  const { data: bookingsRes } = useOpsFacilityBookings(schoolId);
  const bookings: FacilityBooking[] = Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes as any)?.items ?? [];
  const bookFacility = useBookFacility(schoolId);
  const updateBooking = useUpdateBooking(schoolId);
  const cancelBooking = useCancelBooking(schoolId);
  const { data: roomsRes } = useRooms(schoolId);
  const rooms: Room[] = Array.isArray(roomsRes) ? roomsRes : (roomsRes as any)?.items ?? [];

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FacilityBooking | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FacilityBooking | null>(null);

  const fields: FormField[] = [
    { name: 'room', label: 'Facility', type: 'select', required: true, options: rooms.map(r => ({ label: r.name, value: r.name })) },
    { name: 'event', label: 'Event', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true, half: true },
    { name: 'time', label: 'Time Slot', type: 'text', required: true, half: true, placeholder: '09:00-11:00' },
    { name: 'bookedBy', label: 'Booked By', type: 'text', required: true },
    { name: 'status', label: 'Status', type: 'select', required: true, options: [
      { label: 'Pending', value: 'Pending' },
      { label: 'Confirmed', value: 'Confirmed' },
      { label: 'Cancelled', value: 'Cancelled' },
    ], defaultValue: 'Pending' },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateBooking.mutate({ id: editing.id, ...data } as any, {
        onSuccess: () => notifySuccess('Updated', `Booking for "${data.event}" updated`),
      });
    } else {
      bookFacility.mutate(data, {
        onSuccess: () => notifySuccess('Booked', `${data.room} booked for ${data.event}`),
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Facility Bookings</h2>
          <p className="text-sm text-muted-foreground/60">{bookings.length} bookings · {bookings.filter(b => b.status === 'Pending').length} pending</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> Book Facility
        </Button>
      </div>

      <DataTable
        data={bookings as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'Booking', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'room', label: 'Facility', sortable: true },
          { key: 'event', label: 'Event', render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'bookedBy', label: 'Booked By' },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'time', label: 'Time' },
          { key: 'status', label: 'Status', sortable: true, render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as FacilityBooking); setFormOpen(true); } },
          { label: 'Confirm', icon: CheckCircle, onClick: r => {
            updateBooking.mutate({ id: String(r.id), status: 'Confirmed' } as any, {
              onSuccess: () => notifySuccess('Confirmed', `Booking ${String(r.id)} confirmed`),
            });
          } },
          { label: 'Cancel', icon: AlertTriangle, onClick: r => setDeleteTarget(r as unknown as FacilityBooking), variant: 'destructive' },
        ]}
        searchPlaceholder="Search bookings..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Booking' : 'Book Facility'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Cancel Booking?" description={`Cancel booking for "${deleteTarget?.event}"?`}
        confirmLabel="Cancel Booking" variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            cancelBooking.mutate({ id: deleteTarget.id, status: 'Cancelled' } as any, {
              onSuccess: () => notifySuccess('Cancelled', `Booking for "${deleteTarget.event}" cancelled`),
            });
            setDeleteTarget(null);
          }
        }} />
    </div>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export function FacilitiesSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'fac_maintenance': return <MaintenanceView />;
      case 'fac_assets': return <AssetsView />;
      case 'fac_calendar': return <FacilityCalendarView />;
      default: return <RoomsView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
