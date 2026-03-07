/* ─── TransportSection ─── API-backed routes, vehicles, assignments, incidents ─── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useRoutes, useVehicles, useRouteAssignments, useTransportIncidents,
  useCreateRoute, useUpdateRoute, useDeleteRoute,
  useCreateVehicle, useUpdateVehicle, useDeleteVehicle,
  useReportIncident, useUpdateIncident, useResolveIncident, useDeleteIncident,
  useUpdateRouteAssignment,
} from '@/hooks/api/use-school-ops';
import {
  Bus, Plus, Eye, Edit, AlertTriangle, Wrench, Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DataTable, StatusBadge,
  FormDialog, type FormField,
  DetailPanel, DetailFields, type DetailTab,
} from '@/components/features/school-admin';
import { ConfirmDialog } from '@/components/features/ConfirmDialog';
import { notifySuccess } from '@/lib/notify';

/* ─── Local types ─── */
type TransportRoute = Record<string, unknown> & {
  id: string; name: string; driver: string; vehicle: string;
  capacity: number; students: number; stops: number;
  morningTime: string; afternoonTime: string; status: string;
};
type Vehicle = Record<string, unknown> & {
  id: string; regNumber: string; type: string; capacity: number;
  driver: string; insuranceExpiry: string; lastService: string;
  nextService: string; status: string;
};
type TransportIncident = Record<string, unknown> & {
  id: string; route: string; vehicle: string; date: string;
  type: string; description: string; severity: string;
  status: string; actionTaken?: string;
};

/* ═══════════════ Routes ═══════════════ */
function RoutesView() {
  const { schoolId } = useAuthStore();
  const { data: routesRes } = useRoutes(schoolId);
  const routes: TransportRoute[] = Array.isArray(routesRes) ? routesRes : (routesRes as any)?.items ?? [];
  const createRoute = useCreateRoute(schoolId);
  const updateRoute = useUpdateRoute(schoolId);
  const deleteRoute = useDeleteRoute(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransportRoute | null>(null);
  const [detail, setDetail] = useState<TransportRoute | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransportRoute | null>(null);

  const fields: FormField[] = [
    { name: 'name', label: 'Route Name', type: 'text', required: true },
    { name: 'driver', label: 'Driver', type: 'text', required: true, half: true },
    { name: 'vehicle', label: 'Vehicle', type: 'text', required: true, half: true },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true, half: true },
    { name: 'students', label: 'Students Assigned', type: 'number', required: true, half: true },
    { name: 'stops', label: 'Stops', type: 'number', required: true, half: true },
    { name: 'morningTime', label: 'Morning Time', type: 'time', required: true, half: true },
    { name: 'afternoonTime', label: 'Afternoon Time', type: 'time', required: true, half: true },
    { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: [
      { label: 'Active', value: 'Active' },
      { label: 'Issue', value: 'Issue' },
      { label: 'Suspended', value: 'Suspended' },
    ] },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateRoute.mutate({ id: editing.id, ...data }, { onSuccess: () => notifySuccess('Route Updated', `${data.name} updated`) });
    } else {
      createRoute.mutate(data, { onSuccess: () => notifySuccess('Route Added', `${data.name} created`) });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Route Info', content: (
      <DetailFields fields={[
        { label: 'Route', value: detail.name },
        { label: 'Driver', value: detail.driver },
        { label: 'Vehicle', value: detail.vehicle },
        { label: 'Capacity', value: String(detail.capacity) },
        { label: 'Students', value: String(detail.students) },
        { label: 'Stops', value: String(detail.stops) },
        { label: 'Morning', value: detail.morningTime },
        { label: 'Afternoon', value: detail.afternoonTime },
        { label: 'Status', value: detail.status },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Transport Routes</h2>
          <p className="text-sm text-muted-foreground/60">{routes.length} routes configured</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> Add Route
        </Button>
      </div>

      <div className="grid gap-3">
        {routes.map(route => {
          const utilPct = route.capacity > 0 ? Math.round((route.students / route.capacity) * 100) : 0;
          const barColor = utilPct > 90 ? 'bg-red-500' : utilPct > 75 ? 'bg-amber-500' : 'bg-emerald-500';
          return (
            <Card key={route.id} className="border-border bg-card backdrop-blur-xl hover:bg-accent transition-colors cursor-pointer"
              onClick={() => setDetail(route)}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-xl bg-muted flex items-center justify-center">
                      <Bus className="size-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground/80">{route.name}</p>
                        <StatusBadge status={route.status} />
                      </div>
                      <p className="text-xs text-muted-foreground/60">Driver: {route.driver} · Vehicle: {route.vehicle}</p>
                      <p className="text-[10px] text-muted-foreground/30">{route.stops} stops · {route.morningTime} / {route.afternoonTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${utilPct}%` }} />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground/60">{route.students}/{route.capacity}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground/30 mt-0.5">{utilPct}% utilization</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="border-border text-muted-foreground/70 h-7 text-xs"
                        onClick={e => { e.stopPropagation(); setEditing(route); setFormOpen(true); }}>
                        <Edit className="size-3 mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-red-400/70 h-7 text-xs"
                        onClick={e => { e.stopPropagation(); setDeleteTarget(route); }}>
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Route' : 'Add Route'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={detail?.name ?? ''} subtitle={`Driver: ${detail?.driver ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Delete', icon: <Trash2 className="size-3.5" />, variant: 'destructive', onClick: () => { setDeleteTarget(detail); setDetail(null); } },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Delete Route?" description={`Remove route "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => { deleteRoute.mutate(deleteTarget!.id, { onSuccess: () => notifySuccess('Route Deleted', `${deleteTarget?.name} removed`) }); setDeleteTarget(null); }} />
    </div>
  );
}

/* ═══════════════ Vehicles ═══════════════ */
function VehiclesView() {
  const { schoolId } = useAuthStore();
  const { data: vehiclesRes } = useVehicles(schoolId);
  const vehicles: Vehicle[] = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes as any)?.items ?? [];
  const createVehicle = useCreateVehicle(schoolId);
  const updateVehicle = useUpdateVehicle(schoolId);
  const deleteVehicle = useDeleteVehicle(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [detail, setDetail] = useState<Vehicle | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const fields: FormField[] = [
    { name: 'regNumber', label: 'Reg Number', type: 'text', required: true, half: true },
    { name: 'type', label: 'Type', type: 'select', required: true, half: true, options: [
      { label: 'Full-size Bus', value: 'Full-size Bus' },
      { label: 'Mini Van', value: 'Mini Van' },
      { label: 'Car', value: 'Car' },
    ] },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true, half: true },
    { name: 'driver', label: 'Driver', type: 'text', required: true, half: true },
    { name: 'insuranceExpiry', label: 'Insurance Expiry', type: 'date', required: true, half: true },
    { name: 'lastService', label: 'Last Service', type: 'date', required: true, half: true },
    { name: 'nextService', label: 'Next Service', type: 'date', required: true, half: true },
    { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: [
      { label: 'Active', value: 'Active' },
      { label: 'Issue', value: 'Issue' },
      { label: 'In Service', value: 'In Service' },
      { label: 'Retired', value: 'Retired' },
    ] },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateVehicle.mutate({ id: editing.id, ...data }, { onSuccess: () => notifySuccess('Vehicle Updated', `${data.regNumber} updated`) });
    } else {
      createVehicle.mutate(data, { onSuccess: () => notifySuccess('Vehicle Added', `${data.regNumber} added to fleet`) });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Vehicle Info', content: (
      <DetailFields fields={[
        { label: 'Reg #', value: detail.regNumber },
        { label: 'Type', value: detail.type },
        { label: 'Capacity', value: String(detail.capacity) },
        { label: 'Driver', value: detail.driver },
        { label: 'Insurance Expiry', value: detail.insuranceExpiry },
        { label: 'Last Service', value: detail.lastService },
        { label: 'Next Service', value: detail.nextService },
        { label: 'Status', value: detail.status },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Vehicle Fleet</h2>
          <p className="text-sm text-muted-foreground/60">{vehicles.length} vehicles in fleet</p>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <Plus className="size-3.5 mr-1.5" /> Add Vehicle
        </Button>
      </div>

      <DataTable
        data={vehicles as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'regNumber', label: 'Reg #', render: v => <span className="font-mono text-xs text-blue-400">{String(v)}</span> },
          { key: 'type', label: 'Type', sortable: true },
          { key: 'capacity', label: 'Capacity', sortable: true },
          { key: 'driver', label: 'Driver' },
          { key: 'lastService', label: 'Last Service' },
          { key: 'nextService', label: 'Next Service', render: v => {
            const due = new Date(String(v)) < new Date();
            return <span className={`text-xs ${due ? 'text-red-400 font-medium' : 'text-muted-foreground/70'}`}>{String(v)}</span>;
          } },
          { key: 'insuranceExpiry', label: 'Insurance', render: v => {
            const exp = new Date(String(v));
            const soon = exp.getTime() - Date.now() < 90 * 24 * 3600000;
            return <span className={`text-xs ${soon ? 'text-amber-400' : 'text-muted-foreground/70'}`}>{String(v)}</span>;
          } },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as Vehicle) },
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as Vehicle); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: r => setDeleteTarget(r as unknown as Vehicle), variant: 'destructive' },
        ]}
        searchPlaceholder="Search vehicles..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Vehicle' : 'Add Vehicle'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={detail?.regNumber ?? ''} subtitle={`${detail?.type ?? ''} \u00b7 ${detail?.driver ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Schedule Service', icon: <Wrench className="size-3.5" />, onClick: () => notifySuccess('Service Scheduled', `Maintenance scheduled for ${detail?.regNumber}`) },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Remove Vehicle?" description={`Remove ${deleteTarget?.regNumber} from fleet?`}
        confirmLabel="Remove" variant="destructive"
        onConfirm={() => { deleteVehicle.mutate(deleteTarget!.id, { onSuccess: () => notifySuccess('Vehicle Removed', `${deleteTarget?.regNumber} removed from fleet`) }); setDeleteTarget(null); }} />
    </div>
  );
}

/* ═══════════════ Assignments ═══════════════ */
function AssignmentsView() {
  const { schoolId } = useAuthStore();
  const { data: assignmentsRes } = useRouteAssignments(schoolId);
  const assignments: Record<string, unknown>[] = Array.isArray(assignmentsRes)
    ? assignmentsRes
    : (assignmentsRes as any)?.items ?? [];
  const updateAssignment = useUpdateRouteAssignment(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const fields: FormField[] = [
    { name: 'student', label: 'Student', type: 'text', required: true },
    { name: 'grade', label: 'Grade', type: 'text', required: true, half: true },
    { name: 'route', label: 'Route', type: 'text', required: true, half: true },
    { name: 'stop', label: 'Stop', type: 'text', required: true, half: true },
    { name: 'pickupTime', label: 'Pickup Time', type: 'time', required: true, half: true },
    { name: 'dropTime', label: 'Drop Time', type: 'time', required: true, half: true },
    { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: [
      { label: 'Active', value: 'Active' },
      { label: 'Inactive', value: 'Inactive' },
      { label: 'Pending', value: 'Pending' },
    ] },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateAssignment.mutate(
        { id: String(editing.id), ...data },
        { onSuccess: () => notifySuccess('Assignment Updated', `Assignment for ${data.student} updated`) },
      );
    }
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Student Transport Assignments</h2>
        <p className="text-sm text-muted-foreground/60">Map students to routes and stops · {assignments.length} assignments</p>
      </div>
      <DataTable
        data={assignments}
        columns={[
          { key: 'student', label: 'Student', sortable: true, render: v => <span className="font-medium text-foreground/80">{String(v)}</span> },
          { key: 'grade', label: 'Grade' },
          { key: 'route', label: 'Route', sortable: true },
          { key: 'stop', label: 'Stop' },
          { key: 'pickupTime', label: 'Pickup' },
          { key: 'dropTime', label: 'Drop' },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'Edit Assignment', icon: Edit, onClick: r => { setEditing(r); setFormOpen(true); } },
        ]}
        searchPlaceholder="Search assignments..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title="Edit Assignment"
        fields={fields} mode="edit" initialData={editing ?? undefined} onSubmit={handleSave} />
    </div>
  );
}

/* ═══════════════ Incidents ═══════════════ */
function IncidentsView() {
  const { schoolId } = useAuthStore();
  const { data: incidentsRes } = useTransportIncidents(schoolId);
  const incidents: TransportIncident[] = Array.isArray(incidentsRes) ? incidentsRes : (incidentsRes as any)?.items ?? [];
  const reportIncident = useReportIncident(schoolId);
  const updateIncident = useUpdateIncident(schoolId);
  const resolveIncident = useResolveIncident(schoolId);
  const deleteIncident = useDeleteIncident(schoolId);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<TransportIncident | null>(null);
  const [detail, setDetail] = useState<TransportIncident | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransportIncident | null>(null);

  const fields: FormField[] = [
    { name: 'route', label: 'Route', type: 'text', required: true, half: true },
    { name: 'vehicle', label: 'Vehicle', type: 'text', required: true, half: true },
    { name: 'date', label: 'Date', type: 'date', required: true, half: true },
    { name: 'type', label: 'Type', type: 'select', required: true, half: true, options: [
      { label: 'Delay', value: 'Delay' },
      { label: 'Driver Absence', value: 'Driver Absence' },
      { label: 'Minor Accident', value: 'Minor Accident' },
      { label: 'Vehicle Issue', value: 'Vehicle Issue' },
      { label: 'Student Behavior', value: 'Student Behavior' },
      { label: 'Safety', value: 'Safety' },
    ] },
    { name: 'description', label: 'Description', type: 'textarea', required: true },
    { name: 'severity', label: 'Severity', type: 'select', required: true, half: true, options: [
      { label: 'Low', value: 'Low' },
      { label: 'Medium', value: 'Medium' },
      { label: 'High', value: 'High' },
    ] },
    { name: 'status', label: 'Status', type: 'select', required: true, half: true, options: [
      { label: 'Open', value: 'Open' },
      { label: 'Resolved', value: 'Resolved' },
      { label: 'Under Investigation', value: 'Under Investigation' },
    ] },
    { name: 'actionTaken', label: 'Action Taken', type: 'textarea' },
  ];

  const handleSave = (data: Record<string, unknown>) => {
    if (editing) {
      updateIncident.mutate({ id: editing.id, ...data }, { onSuccess: () => notifySuccess('Incident Updated', `Incident on ${data.route} updated`) });
    } else {
      reportIncident.mutate(data, { onSuccess: () => notifySuccess('Incident Reported', `Incident on ${data.route} logged`) });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const tabs: DetailTab[] = detail ? [
    { id: 'info', label: 'Details', content: (
      <DetailFields fields={[
        { label: 'Route', value: detail.route },
        { label: 'Vehicle', value: detail.vehicle },
        { label: 'Date', value: detail.date },
        { label: 'Type', value: detail.type },
        { label: 'Description', value: detail.description },
        { label: 'Severity', value: detail.severity },
        { label: 'Status', value: detail.status },
        { label: 'Action Taken', value: detail.actionTaken || '—' },
      ]} />
    ) },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Transport Incidents</h2>
          <p className="text-sm text-muted-foreground/60">{incidents.filter(i => i.status === 'Open').length} open incidents</p>
        </div>
        <Button size="sm" className="bg-amber-600 hover:bg-amber-500 h-8"
          onClick={() => { setEditing(null); setFormOpen(true); }}>
          <AlertTriangle className="size-3.5 mr-1.5" /> Report Incident
        </Button>
      </div>

      <DataTable
        data={incidents as unknown as Record<string, unknown>[]}
        columns={[
          { key: 'id', label: 'ID', render: v => <span className="font-mono text-xs text-amber-400">{String(v)}</span> },
          { key: 'route', label: 'Route', sortable: true },
          { key: 'date', label: 'Date', sortable: true },
          { key: 'type', label: 'Type', render: v => <Badge variant="outline" className="border-border text-muted-foreground/70 text-[10px]">{String(v)}</Badge> },
          { key: 'description', label: 'Description', render: v => <span className="text-xs text-muted-foreground/60 truncate max-w-50 block">{String(v)}</span> },
          { key: 'severity', label: 'Severity', render: v => {
            const c = String(v) === 'High' ? 'border-red-500/30 text-red-400' : String(v) === 'Medium' ? 'border-amber-500/30 text-amber-400' : 'border-blue-500/30 text-blue-400';
            return <Badge variant="outline" className={`text-[10px] ${c}`}>{String(v)}</Badge>;
          } },
          { key: 'status', label: 'Status', render: v => <StatusBadge status={String(v)} /> },
        ]}
        actions={[
          { label: 'View', icon: Eye, onClick: r => setDetail(r as unknown as TransportIncident) },
          { label: 'Edit', icon: Edit, onClick: r => { setEditing(r as unknown as TransportIncident); setFormOpen(true); } },
          { label: 'Delete', icon: Trash2, onClick: r => setDeleteTarget(r as unknown as TransportIncident), variant: 'destructive' },
        ]}
        searchPlaceholder="Search incidents..."
      />

      <FormDialog open={formOpen} onOpenChange={setFormOpen}
        title={editing ? 'Edit Incident' : 'Report Incident'}
        fields={fields} mode={editing ? 'edit' : 'create'} initialData={editing ?? undefined} onSubmit={handleSave} />

      <DetailPanel open={!!detail} onOpenChange={() => setDetail(null)}
        title={`Incident \u2014 ${detail?.route ?? ''}`} subtitle={`${detail?.date ?? ''} \u00b7 ${detail?.type ?? ''}`}
        tabs={tabs}
        actions={[
          { label: 'Edit', icon: <Edit className="size-3.5" />, onClick: () => { setEditing(detail); setFormOpen(true); setDetail(null); } },
          { label: 'Resolve', icon: <AlertTriangle className="size-3.5" />, onClick: () => { resolveIncident.mutate({ id: detail!.id, status: 'Resolved' }, { onSuccess: () => notifySuccess('Incident Resolved', `Incident on ${detail?.route} resolved`) }); setDetail(null); } },
        ]} />

      <ConfirmDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}
        title="Delete Incident?" description={`Remove incident ${deleteTarget?.id}?`}
        confirmLabel="Delete" variant="destructive"
        onConfirm={() => { deleteIncident.mutate(deleteTarget!.id, { onSuccess: () => notifySuccess('Incident Deleted', `Incident ${deleteTarget?.id} removed`) }); setDeleteTarget(null); }} />
    </div>
  );
}

/* ═══════════════════ MAIN ═══════════════════ */
export function TransportSection() {
  const { activeHeader } = useNavigationStore();
  const containerRef = useStaggerAnimate([activeHeader]);

  const content = (() => {
    switch (activeHeader) {
      case 'trn_vehicles': return <VehiclesView />;
      case 'trn_assignments': return <AssignmentsView />;
      case 'trn_incidents': return <IncidentsView />;
      default: return <RoutesView />;
    }
  })();

  return (
    <div ref={containerRef}>
      <div data-animate>{content}</div>
    </div>
  );
}
