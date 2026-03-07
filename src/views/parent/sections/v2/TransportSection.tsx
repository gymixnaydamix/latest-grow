import { Bus, Clock, MapPin, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParentV2Transport } from '@/hooks/api/use-parent-v2';
import { childDisplayName, filterByChild, parentTransportDemo as FALLBACK_TRANSPORT } from './parent-v2-demo-data';
import type { ParentTransportDemo } from './parent-v2-demo-data';
import { EmptyActionState, ParentSectionShell, StatusBadge, UrgentInline } from './shared';
import type { ParentSectionProps } from './shared';

export function TransportSection({ scope, childId }: ParentSectionProps) {
  const { data: rawRows } = useParentV2Transport({ scope, childId });
  const rows: ParentTransportDemo[] = (rawRows as ParentTransportDemo[] | undefined) ?? filterByChild(FALLBACK_TRANSPORT, childId, scope);

  const delayed = rows.filter((r) => r.status === 'DELAYED');
  const alertRows = rows.filter((r) => r.status === 'ALERT');

  return (
    <ParentSectionShell
      title="Transport"
      description="Route assignments, pickup/drop windows, vehicle details, delay alerts, and driver contacts."
    >
      {/* Alerts */}
      {delayed.length > 0 && (
        <UrgentInline message={`${delayed.length} route(s) currently delayed — check below for updates.`} />
      )}
      {alertRows.length > 0 && (
        <UrgentInline message={`${alertRows.length} route(s) have alerts — check details below.`} />
      )}

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Bus className="size-5 text-sky-500" />
            <div>
              <p className="text-2xl font-bold">{rows.length}</p>
              <p className="text-xs text-muted-foreground">Active routes</p>
            </div>
          </CardContent>
        </Card>
        <Card className={delayed.length > 0 ? 'border-amber-500/20 bg-amber-500/5' : ''}>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="size-5 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{delayed.length}</p>
              <p className="text-xs text-muted-foreground">Delayed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="size-2 rounded-full bg-emerald-500" />
            <div>
              <p className="text-2xl font-bold">{rows.filter((r) => r.status === 'ON_TIME').length}</p>
              <p className="text-xs text-muted-foreground">On time</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route Cards */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Route Assignments</CardTitle>
          <CardDescription>{rows.length} child(ren)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 ? (
            <EmptyActionState title="No routes" message="No transport assignments found." ctaLabel="" />
          ) : (
            rows.map((row) => (
              <div
                key={row.id}
                className={`rounded-lg border p-4 transition-all ${
                  row.status === 'DELAYED' ? 'border-amber-500/40 bg-amber-500/5' :
                  row.status === 'ALERT' ? 'border-red-500/40 bg-red-500/5' :
                  'border-border/60'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{childDisplayName(row.childId)}</p>
                      <Badge variant="outline" className="text-xs">{row.routeName}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{row.vehicle}</p>
                  </div>
                  <StatusBadge status={row.status} tone={row.status === 'ON_TIME' ? 'good' : row.status === 'DELAYED' ? 'warn' : 'bad'} />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 rounded-lg border border-border/40 bg-muted/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Pickup</p>
                    <p className="flex items-center gap-1.5 text-sm"><MapPin className="size-3.5 text-emerald-500" /> {row.pickupStop}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3" /> {row.pickupWindow}</p>
                  </div>
                  <div className="space-y-1.5 rounded-lg border border-border/40 bg-muted/20 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Drop-off</p>
                    <p className="flex items-center gap-1.5 text-sm"><MapPin className="size-3.5 text-sky-500" /> {row.dropStop}</p>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="size-3" /> {row.dropWindow}</p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="size-3" /> {row.driverName}</span>
                  {'driverPhone' in row && row.driverPhone && (
                    <span className="flex items-center gap-1"><Phone className="size-3" /> {row.driverPhone}</span>
                  )}
                  {'lastUpdated' in row && row.lastUpdated && (
                    <span>Updated: {row.lastUpdated}</span>
                  )}
                </div>

                {row.note && (
                  <p className="mt-2 rounded bg-muted/30 px-2 py-1 text-xs italic text-muted-foreground">{row.note}</p>
                )}

                {row.status === 'DELAYED' && (
                  <Button size="sm" variant="outline" className="mt-2 gap-1.5">
                    <Phone className="size-3.5" /> Call driver
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </ParentSectionShell>
  );
}
