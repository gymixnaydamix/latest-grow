/* ─── CreatePlanDialog — Add / Edit Platform Plan ─── */
import { useState, useEffect } from 'react';
import { CreditCard, Plus, Loader2, X } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCreatePlatformPlan, useUpdatePlatformPlan } from '@/hooks/api';
import type { PlatformPlan } from '@root/types';

interface CreatePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPlan?: PlatformPlan | null;
}

export function CreatePlanDialog({ open, onOpenChange, editPlan }: CreatePlanDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [maxUsers, setMaxUsers] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const createPlan = useCreatePlatformPlan();
  const updatePlan = useUpdatePlatformPlan();
  const isEdit = !!editPlan;

  useEffect(() => {
    if (editPlan) {
      setName(editPlan.name);
      setPrice(String(editPlan.price));
      setMaxUsers(editPlan.maxUsers ? String(editPlan.maxUsers) : '');
      setFeatures(editPlan.features ?? []);
      setIsActive(editPlan.isActive ?? true);
    } else {
      reset();
    }
  }, [editPlan, open]);

  const reset = () => {
    setName(''); setPrice(''); setMaxUsers(''); setFeatures([]); setFeatureInput(''); setIsActive(true);
  };

  const addFeature = () => {
    const f = featureInput.trim();
    if (f && !features.includes(f)) {
      setFeatures([...features, f]);
      setFeatureInput('');
    }
  };

  const removeFeature = (f: string) => setFeatures(features.filter(x => x !== f));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      price: parseFloat(price),
      maxUsers: maxUsers ? parseInt(maxUsers) : undefined,
      features: features.length > 0 ? features : undefined,
      isActive,
    };
    if (isEdit && editPlan) {
      updatePlan.mutate({ id: editPlan.id, ...data }, {
        onSuccess: () => { reset(); onOpenChange(false); },
      });
    } else {
      createPlan.mutate(data, {
        onSuccess: () => { reset(); onOpenChange(false); },
      });
    }
  };

  const loading = createPlan.isPending || updatePlan.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm">
              <CreditCard className="size-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm">{isEdit ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
              <DialogDescription className="text-xs">{isEdit ? 'Update plan details' : 'Add a new subscription plan for tenants'}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Plan Name *</Label>
              <Input placeholder="e.g. Starter, Pro…" value={name} onChange={e => setName(e.target.value)} className="h-8 text-xs" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Price ($/mo) *</Label>
              <Input type="number" step="0.01" min="0" placeholder="49.00" value={price} onChange={e => setPrice(e.target.value)} className="h-8 text-xs" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Max Users</Label>
              <Input type="number" min="0" placeholder="100" value={maxUsers} onChange={e => setMaxUsers(e.target.value)} className="h-8 text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Active</Label>
              <div className="flex items-center gap-2 h-8">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-[10px] text-muted-foreground">{isActive ? 'Visible to tenants' : 'Hidden'}</span>
              </div>
            </div>
          </div>
          {/* Features */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Features</Label>
            <div className="flex gap-1.5">
              <Input placeholder="Add a feature…" value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                className="h-8 text-xs flex-1" />
              <Button type="button" variant="outline" size="sm" className="h-8 px-2" onClick={addFeature}><Plus className="size-3" /></Button>
            </div>
            {features.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {features.map(f => (
                  <span key={f} className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
                    {f}
                    <button type="button" onClick={() => removeFeature(f)} className="hover:text-red-500 transition-colors"><X className="size-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
            <Button type="submit" size="sm" disabled={!name || !price || loading}
              className="gap-1.5 text-xs bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
              {loading ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              {isEdit ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
