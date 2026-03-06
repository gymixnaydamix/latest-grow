/* ─── SendInvitesDialog — Send onboarding invites to tenants ─── */
import { useState } from 'react';
import { Send, Loader2, CheckCircle, Users } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTenants, useSendInvites } from '@/hooks/api';

interface SendInvitesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendInvitesDialog({ open, onOpenChange }: SendInvitesDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  const { data: tenantData } = useTenants();
  const sendInvites = useSendInvites();

  const tenants = tenantData?.data ?? [];
  const allSelected = tenants.length > 0 && selected.size === tenants.length;

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(tenants.map((t) => t.id)));
  };

  const reset = () => { setSelected(new Set()); setMessage(''); };

  const handleSend = () => {
    sendInvites.mutate(
      { tenantIds: [...selected], message: message || undefined },
      {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-amber-500 to-orange-600 shadow-sm">
              <Send className="size-3.5 text-white" />
            </div>
            Send Invites
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select tenants to send onboarding invitation emails.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {/* Select all */}
          <div className="flex items-center justify-between rounded-lg bg-muted/20 p-2 border border-border/30">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              <span className="text-xs font-medium">Select All</span>
            </label>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="size-3" />
              {selected.size} / {tenants.length} selected
            </span>
          </div>

          {/* Tenant list */}
          <div className="max-h-48 overflow-auto rounded-lg border border-border/40 divide-y divide-border/20">
            {tenants.map((t) => (
              <label key={t.id} className="flex items-center gap-2 px-2.5 py-1.5 cursor-pointer hover:bg-muted/20 transition-colors">
                <Checkbox checked={selected.has(t.id)} onCheckedChange={() => toggle(t.id)} />
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted/40 text-[8px] font-bold">
                  {t.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold truncate">{t.name}</p>
                  <p className="text-[8px] text-muted-foreground truncate">{t.email}</p>
                </div>
                <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                  t.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' :
                  t.status === 'TRIAL' ? 'bg-blue-500/10 text-blue-600' :
                  'bg-red-500/10 text-red-600'
                }`}>{t.status?.toLowerCase()}</span>
              </label>
            ))}
            {tenants.length === 0 && (
              <div className="p-4 text-center text-xs text-muted-foreground">No tenants found</div>
            )}
          </div>

          {/* Custom message */}
          <div className="grid gap-1.5">
            <label className="text-xs font-medium">Custom Message (optional)</label>
            <Textarea
              value={message} onChange={(e) => setMessage(e.target.value)}
              placeholder="Welcome aboard! We're excited to have you on the platform…"
              className="text-xs min-h-15 resize-none"
            />
          </div>

          {/* Success feedback */}
          {sendInvites.data && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-2">
              <CheckCircle className="size-4 text-emerald-500" />
              <p className="text-xs">
                <strong>{sendInvites.data.sent}</strong> invite{sendInvites.data.sent !== 1 ? 's' : ''} queued successfully
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="text-xs h-8" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 gap-1 text-xs bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              disabled={selected.size === 0 || sendInvites.isPending}
              onClick={handleSend}
            >
              {sendInvites.isPending ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
              Send {selected.size} Invite{selected.size !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
