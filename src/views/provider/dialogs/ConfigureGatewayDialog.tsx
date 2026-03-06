/* ─── ConfigureGatewayDialog — Add / Edit Payment Gateway ─── */
import { useState, useEffect } from 'react';
import { Shield, Plus, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreatePaymentGateway, useUpdatePaymentGateway } from '@/hooks/api';
import type { PaymentGateway } from '@root/types';

const GATEWAY_PRESETS = [
  { name: 'Stripe', color: '#6366f1' },
  { name: 'PayPal', color: '#3b82f6' },
  { name: 'Bank Transfer', color: '#10b981' },
  { name: 'Square', color: '#f59e0b' },
  { name: 'Razorpay', color: '#8b5cf6' },
];

interface ConfigureGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editGateway?: PaymentGateway | null;
}

export function ConfigureGatewayDialog({ open, onOpenChange, editGateway }: ConfigureGatewayDialogProps) {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [color, setColor] = useState('#6366f1');

  const createGateway = useCreatePaymentGateway();
  const updateGateway = useUpdatePaymentGateway();
  const isEdit = !!editGateway;

  useEffect(() => {
    if (editGateway) {
      setName(editGateway.name);
      setApiKey(''); // never pre-fill keys
      setWebhookUrl(editGateway.webhookUrl ?? '');
      setColor(editGateway.color ?? '#6366f1');
    } else {
      reset();
    }
  }, [editGateway, open]);

  const reset = () => {
    setName(''); setApiKey(''); setWebhookUrl(''); setColor('#6366f1');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      apiKey: apiKey || undefined,
      webhookUrl: webhookUrl || undefined,
      color,
    };
    if (isEdit && editGateway) {
      updateGateway.mutate({ id: editGateway.id, ...data }, {
        onSuccess: () => { reset(); onOpenChange(false); },
      });
    } else {
      createGateway.mutate(data, {
        onSuccess: () => { reset(); onOpenChange(false); },
      });
    }
  };

  const loading = createGateway.isPending || updateGateway.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 shadow-sm">
              <Shield className="size-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm">{isEdit ? 'Edit Gateway' : 'Add Gateway'}</DialogTitle>
              <DialogDescription className="text-xs">{isEdit ? 'Update gateway configuration' : 'Configure a new payment processor'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
          {/* Quick presets */}
          {!isEdit && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Quick Presets</Label>
              <div className="flex flex-wrap gap-1.5">
                {GATEWAY_PRESETS.map(p => (
                  <button key={p.name} type="button"
                    onClick={() => { setName(p.name); setColor(p.color); }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-all hover:shadow-sm cursor-pointer ${name === p.name ? 'border-primary bg-primary/10 text-primary' : 'border-border/60 text-muted-foreground hover:border-border'}`}>
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Gateway Name *</Label>
              <Input placeholder="e.g. Stripe" value={name} onChange={e => setName(e.target.value)} className="h-8 text-xs" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Brand Color</Label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-8 w-8 cursor-pointer rounded border-0 p-0" />
                <Input value={color} onChange={e => setColor(e.target.value)} className="h-8 text-xs flex-1 font-mono" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">API Key</Label>
            <Input type="password" placeholder="sk_live_••••••••" value={apiKey} onChange={e => setApiKey(e.target.value)} className="h-8 text-xs font-mono" />
            <p className="text-[9px] text-muted-foreground">Encrypted at rest. Leave blank to keep existing key.</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Webhook URL</Label>
            <Input type="url" placeholder="https://api.example.com/webhooks/pay" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className="h-8 text-xs font-mono" />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
            <Button type="submit" size="sm" disabled={!name || loading}
              className="gap-1.5 text-xs bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white">
              {loading ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              {isEdit ? 'Update Gateway' : 'Add Gateway'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
