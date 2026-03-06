/* EditTenantDialog – Edit School / Individual tenant */
import { useEffect, useState } from 'react';
import { Building2, User, Loader2, Search, MapPinned, ExternalLink, Save } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateTenant, useGeocodeSchoolAddress, usePlatformPlans } from '@/hooks/api';
import { buildOsmEmbedUrl, buildOsmMarkerUrl, buildFallbackBoundingBox } from '@/lib/maps';
import type { MapBoundingBox } from '@/lib/maps';
import type { Tenant, TenantStatus } from '@root/types';

interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant;
}

export function EditTenantDialog({ open, onOpenChange, tenant }: EditTenantDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState<TenantStatus>('TRIAL' as TenantStatus);
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [boundingBox, setBoundingBox] = useState<MapBoundingBox | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const updateTenant = useUpdateTenant();
  const geocodeSchool = useGeocodeSchoolAddress();
  const { data: plans } = usePlatformPlans();

  const isSchool = tenant.type === 'SCHOOL';
  const Icon = isSchool ? Building2 : User;
  const label = isSchool ? 'School' : 'Individual';

  // Populate fields when tenant changes or dialog opens
  useEffect(() => {
    if (!open) return;
    setName(tenant.name);
    setEmail(tenant.email);
    setPhone(tenant.phone ?? '');
    setPlan(tenant.plan ?? '');
    setStatus(tenant.status);
    setNotes(tenant.notes ?? '');
    setAddress(tenant.school?.address ?? '');
    setWebsite(tenant.school?.website ?? '');
    setLatitude(tenant.school?.latitude ?? null);
    setLongitude(tenant.school?.longitude ?? null);
    setDisplayName(tenant.school?.address ?? '');
    setBoundingBox(
      tenant.school?.latitude != null && tenant.school?.longitude != null
        ? buildFallbackBoundingBox(tenant.school.latitude, tenant.school.longitude)
        : null,
    );
    setLocationError(null);
  }, [tenant, open]);

  const canSubmit =
    !!name.trim() &&
    !!email.trim() &&
    (!isSchool || (!!address.trim() && latitude !== null && longitude !== null));

  const clearLocation = () => {
    setLatitude(null);
    setLongitude(null);
    setDisplayName('');
    setBoundingBox(null);
    setLocationError(null);
  };

  const handleFindLocation = () => {
    const query = address.trim();
    if (!query) return;

    setLocationError(null);
    geocodeSchool.mutate(query, {
      onSuccess: (result) => {
        setLatitude(result.latitude);
        setLongitude(result.longitude);
        setDisplayName(result.displayName);
        setBoundingBox(result.boundingBox);
      },
      onError: (error) => {
        clearLocation();
        setLocationError(error instanceof Error ? error.message : 'Could not locate the address.');
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateTenant.mutate(
      {
        id: tenant.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone || undefined,
        plan: plan || undefined,
        status,
        notes: notes || undefined,
        ...(isSchool
          ? {
              address: address.trim(),
              website: website.trim() || undefined,
              latitude: latitude ?? undefined,
              longitude: longitude ?? undefined,
            }
          : {}),
      } as Parameters<typeof updateTenant.mutate>[0],
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const mapEmbedUrl =
    latitude !== null && longitude !== null
      ? buildOsmEmbedUrl(latitude, longitude, boundingBox ?? buildFallbackBoundingBox(latitude, longitude))
      : null;

  const mapMarkerUrl =
    latitude !== null && longitude !== null ? buildOsmMarkerUrl(latitude, longitude) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm">
              <Icon className="size-3.5 text-white" />
            </div>
            Edit {label}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update details for <span className="font-medium">{tenant.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">{isSchool ? 'School Name' : 'Full Name'}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isSchool ? 'e.g. Springfield Academy' : 'e.g. Sarah Johnson'}
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@school.edu"
              className="h-8 text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Phone (optional)</Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="h-8 text-xs"
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TenantStatus)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="TRIAL">Trial</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="CHURNED">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isSchool && (
            <>
              <div className="grid gap-1.5">
                <Label className="text-xs">School Address</Label>
                <Input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearLocation();
                  }}
                  placeholder="Street, city, state, country"
                  className="h-8 text-xs"
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-xs">School Website (optional)</Label>
                <Input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.school.edu"
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-2.5 py-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-[11px] font-medium">
                    <MapPinned className="size-3.5 text-blue-600" />
                    Locate school area on map
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {displayName || 'Use geocoding to fetch real coordinates from OpenStreetMap.'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1 text-[10px]"
                  onClick={handleFindLocation}
                  disabled={!address.trim() || geocodeSchool.isPending}
                >
                  {geocodeSchool.isPending ? <Loader2 className="size-3 animate-spin" /> : <Search className="size-3" />}
                  Find location
                </Button>
              </div>

              {locationError && (
                <p className="text-[10px] font-medium text-red-600">{locationError}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="grid gap-1">
                  <Label className="text-[10px]">Latitude</Label>
                  <Input
                    value={latitude !== null ? latitude.toFixed(6) : ''}
                    placeholder="Not geocoded"
                    className="h-7 text-[10px]"
                    readOnly
                  />
                </div>
                <div className="grid gap-1">
                  <Label className="text-[10px]">Longitude</Label>
                  <Input
                    value={longitude !== null ? longitude.toFixed(6) : ''}
                    placeholder="Not geocoded"
                    className="h-7 text-[10px]"
                    readOnly
                  />
                </div>
              </div>

              {mapEmbedUrl && mapMarkerUrl && (
                <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/10">
                  <iframe
                    title="School area map preview"
                    src={mapEmbedUrl}
                    className="h-44 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="flex items-center justify-between border-t border-border/50 px-2.5 py-2">
                    <p className="text-[10px] text-muted-foreground">Map data from OpenStreetMap.</p>
                    <a
                      href={mapMarkerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 hover:underline"
                    >
                      Open in OSM
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="grid gap-1.5">
            <Label className="text-xs">Plan</Label>
            <Select value={plan} onValueChange={setPlan}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select a plan" /></SelectTrigger>
              <SelectContent>
                {(plans ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.name}>{p.name} - ${p.price}/mo</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="min-h-15 resize-none text-xs"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-8 gap-1 bg-linear-to-r from-blue-500 to-indigo-600 text-xs text-white hover:from-blue-600 hover:to-indigo-700"
              disabled={updateTenant.isPending || !canSubmit}
            >
              {updateTenant.isPending ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
