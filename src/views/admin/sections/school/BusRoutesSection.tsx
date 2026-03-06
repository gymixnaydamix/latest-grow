import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import {
  useCreateTransportRoute,
  useCreateTransportStop,
  useDeleteTransportRoute,
  useDeleteTransportStop,
  useTransportRoutes,
  useUpdateTransportRoute,
} from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function BusRoutesSection() {
  const { schoolId } = useAuthStore();
  const routesQuery = useTransportRoutes(schoolId);

  const createRoute = useCreateTransportRoute(schoolId ?? '');
  const updateRoute = useUpdateTransportRoute(schoolId ?? '');
  const deleteRoute = useDeleteTransportRoute(schoolId ?? '');
  const createStop = useCreateTransportStop(schoolId ?? '');
  const deleteStop = useDeleteTransportStop(schoolId ?? '');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);

  const [routeForm, setRouteForm] = useState({
    name: '',
    code: '',
    driverName: '',
    vehicleNumber: '',
    capacity: '',
  });

  const [editForm, setEditForm] = useState(routeForm);
  const [stopForm, setStopForm] = useState({ name: '', address: '', sequence: '', scheduledTime: '' });

  const routes = routesQuery.data ?? [];
  const selectedRoute = useMemo(() => routes.find((route) => route.id === selectedRouteId) ?? null, [routes, selectedRouteId]);

  const submitCreateRoute = async () => {
    await createRoute.mutateAsync({
      name: routeForm.name,
      code: routeForm.code,
      driverName: routeForm.driverName,
      vehicleNumber: routeForm.vehicleNumber,
      capacity: Number(routeForm.capacity || 0),
    });
    setRouteForm({ name: '', code: '', driverName: '', vehicleNumber: '', capacity: '' });
  };

  const submitUpdateRoute = async (id: string) => {
    await updateRoute.mutateAsync({
      id,
      name: editForm.name,
      code: editForm.code,
      driverName: editForm.driverName,
      vehicleNumber: editForm.vehicleNumber,
      capacity: Number(editForm.capacity || 0),
    });
    setEditingId(null);
  };

  const submitCreateStop = async () => {
    if (!selectedRouteId) return;
    await createStop.mutateAsync({
      routeId: selectedRouteId,
      name: stopForm.name,
      address: stopForm.address,
      sequence: Number(stopForm.sequence),
      scheduledTime: stopForm.scheduledTime,
    });
    setStopForm({ name: '', address: '', sequence: '', scheduledTime: '' });
  };

  return (
    <SchoolSectionShell
      title="Bus Routes"
      description="Manage transport routes and route stops."
      actions={<Button size="sm" onClick={submitCreateRoute} disabled={!routeForm.name || createRoute.isPending}>Add Route</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <Input placeholder="Route name" value={routeForm.name} onChange={(e) => setRouteForm((prev) => ({ ...prev, name: e.target.value }))} />
          <Input placeholder="Code" value={routeForm.code} onChange={(e) => setRouteForm((prev) => ({ ...prev, code: e.target.value }))} />
          <Input placeholder="Driver" value={routeForm.driverName} onChange={(e) => setRouteForm((prev) => ({ ...prev, driverName: e.target.value }))} />
          <Input placeholder="Vehicle" value={routeForm.vehicleNumber} onChange={(e) => setRouteForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))} />
          <Input type="number" placeholder="Capacity" value={routeForm.capacity} onChange={(e) => setRouteForm((prev) => ({ ...prev, capacity: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={routesQuery.isLoading}
        isError={routesQuery.isError}
        isEmpty={!routes.length}
        loadingLabel="Loading routes"
        emptyLabel="No routes found"
        errorLabel="Failed to load routes"
        onRetry={() => routesQuery.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={route.id}>
                    <TableCell>{editingId === route.id ? <Input value={editForm.name} onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))} /> : route.name}</TableCell>
                    <TableCell>{editingId === route.id ? <Input value={editForm.code} onChange={(e) => setEditForm((prev) => ({ ...prev, code: e.target.value }))} /> : route.code}</TableCell>
                    <TableCell>{editingId === route.id ? <Input value={editForm.driverName} onChange={(e) => setEditForm((prev) => ({ ...prev, driverName: e.target.value }))} /> : route.driverName}</TableCell>
                    <TableCell>{editingId === route.id ? <Input value={editForm.vehicleNumber} onChange={(e) => setEditForm((prev) => ({ ...prev, vehicleNumber: e.target.value }))} /> : route.vehicleNumber}</TableCell>
                    <TableCell>{route._count?.stops ?? route.stops?.length ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {editingId === route.id ? (
                          <>
                            <Button size="sm" onClick={() => submitUpdateRoute(route.id)} disabled={updateRoute.isPending}>Save</Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(route.id);
                              setEditForm({
                                name: route.name,
                                code: route.code,
                                driverName: route.driverName,
                                vehicleNumber: route.vehicleNumber,
                                capacity: String(route.capacity),
                              });
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSelectedRouteId((prev) => (prev === route.id ? null : route.id))}>
                          Stops
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteRoute.mutate(route.id)} disabled={deleteRoute.isPending}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </DataState>

      {selectedRoute ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <p className="text-sm font-medium">Stops for {selectedRoute.name}</p>
            <div className="grid gap-2 md:grid-cols-4">
              <Input placeholder="Stop name" value={stopForm.name} onChange={(e) => setStopForm((prev) => ({ ...prev, name: e.target.value }))} />
              <Input placeholder="Address" value={stopForm.address} onChange={(e) => setStopForm((prev) => ({ ...prev, address: e.target.value }))} />
              <Input type="number" placeholder="Sequence" value={stopForm.sequence} onChange={(e) => setStopForm((prev) => ({ ...prev, sequence: e.target.value }))} />
              <div className="flex gap-2">
                <Input placeholder="HH:MM" value={stopForm.scheduledTime} onChange={(e) => setStopForm((prev) => ({ ...prev, scheduledTime: e.target.value }))} />
                <Button size="sm" onClick={submitCreateStop} disabled={!stopForm.name || !stopForm.sequence || createStop.isPending}>Add</Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seq</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(selectedRoute.stops ?? []).map((stop) => (
                  <TableRow key={stop.id}>
                    <TableCell>{stop.sequence}</TableCell>
                    <TableCell>{stop.name}</TableCell>
                    <TableCell>{stop.address}</TableCell>
                    <TableCell>{stop.scheduledTime}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => deleteStop.mutate(stop.id)} disabled={deleteStop.isPending}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </SchoolSectionShell>
  );
}
