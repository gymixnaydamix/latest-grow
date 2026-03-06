import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuthStore } from '@/store/auth.store';
import { useCreateBooking, useFacilities, useSchoolBookings } from '@/hooks/api';
import { DataState, SchoolSectionShell } from './shared/SchoolSection';

export function RoomBookingSection() {
  const { schoolId } = useAuthStore();
  const facilitiesQuery = useFacilities(schoolId);
  const bookingsQuery = useSchoolBookings(schoolId);
  const createBooking = useCreateBooking();

  const facilities = facilitiesQuery.data ?? [];
  const bookings = bookingsQuery.data ?? [];

  const [form, setForm] = useState({
    facilityId: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });

  const submitCreate = async () => {
    await createBooking.mutateAsync({
      facilityId: form.facilityId,
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(form.endTime).toISOString(),
      purpose: form.purpose,
    });
    setForm({ facilityId: '', startTime: '', endTime: '', purpose: '' });
    void bookingsQuery.refetch();
  };

  return (
    <SchoolSectionShell
      title="Room Booking"
      description="Book facilities and review room schedule."
      actions={<Button size="sm" onClick={submitCreate} disabled={!form.facilityId || !form.startTime || !form.endTime || createBooking.isPending}>Book Room</Button>}
    >
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={form.facilityId}
            onChange={(e) => setForm((prev) => ({ ...prev, facilityId: e.target.value }))}
          >
            <option value="">Select facility</option>
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>{facility.name}</option>
            ))}
          </select>
          <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))} />
          <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))} />
          <Input placeholder="Purpose" value={form.purpose} onChange={(e) => setForm((prev) => ({ ...prev, purpose: e.target.value }))} />
        </CardContent>
      </Card>

      <DataState
        isLoading={bookingsQuery.isLoading || facilitiesQuery.isLoading}
        isError={bookingsQuery.isError || facilitiesQuery.isError}
        isEmpty={!bookings.length}
        loadingLabel="Loading bookings"
        emptyLabel="No bookings found"
        errorLabel="Failed to load bookings"
        onRetry={() => {
          void bookingsQuery.refetch();
          void facilitiesQuery.refetch();
        }}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Facility</TableHead>
                  <TableHead>Reserved By</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Purpose</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell>{booking.facility?.name ?? booking.facilityId}</TableCell>
                    <TableCell>{booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : booking.reservedBy}</TableCell>
                    <TableCell>{new Date(booking.startTime).toLocaleString()}</TableCell>
                    <TableCell>{new Date(booking.endTime).toLocaleString()}</TableCell>
                    <TableCell>{booking.purpose}</TableCell>
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
