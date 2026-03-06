/* ─── CreateDealDialog — Add / Edit a CRM Deal ─── */
import { useState, useEffect } from 'react';
import { Target, Plus, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTenants, useCreateCrmDeal, useUpdateCrmDeal } from '@/hooks/api';
import type { CrmDeal, DealStage } from '@root/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editDeal?: CrmDeal | null;
}

const STAGES = [
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'CLOSED_WON', label: 'Closed Won' },
  { value: 'CLOSED_LOST', label: 'Closed Lost' },
];

export function CreateDealDialog({ open, onOpenChange, editDeal }: Props) {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('PROSPECT');
  const [probability, setProbability] = useState('10');
  const [tenantId, setTenantId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [notes, setNotes] = useState('');

  const createDeal = useCreateCrmDeal();
  const updateDeal = useUpdateCrmDeal();
  const { data: tenantData } = useTenants();
  const tenants = tenantData?.data ?? [];

  const isEdit = !!editDeal;

  useEffect(() => {
    if (editDeal) {
      setName(editDeal.name);
      setValue(String(editDeal.value));
      setStage(editDeal.stage);
      setProbability(String(editDeal.probability));
      setTenantId(editDeal.tenantId ?? '');
      setContactName(editDeal.contactName);
      setContactEmail(editDeal.contactEmail);
      setNotes(editDeal.notes);
    } else {
      reset();
    }
  }, [editDeal]);

  const reset = () => {
    setName(''); setValue(''); setStage('PROSPECT'); setProbability('10');
    setTenantId(''); setContactName(''); setContactEmail(''); setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      value: parseFloat(value) || 0,
      stage: stage as DealStage,
      probability: parseInt(probability) || 10,
      tenantId: tenantId || undefined,
      contactName,
      contactEmail,
      notes,
    };

    if (isEdit) {
      updateDeal.mutate({ id: editDeal!.id, ...payload }, {
        onSuccess: () => { reset(); onOpenChange(false); },
      });
    } else {
      createDeal.mutate(payload, {
        onSuccess: () => { reset(); onOpenChange(false); },
      });
    }
  };

  const isPending = createDeal.isPending || updateDeal.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-purple-600 shadow-sm">
              <Target className="size-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm">{isEdit ? 'Edit Deal' : 'New Deal'}</DialogTitle>
              <DialogDescription className="text-xs">
                {isEdit ? 'Update deal details and stage' : 'Add a new deal to your sales pipeline'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Deal Name *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Metro High School" className="h-8 text-xs" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Value ($)</Label>
              <Input type="number" step="0.01" min="0" value={value} onChange={e => setValue(e.target.value)} placeholder="5,000" className="h-8 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Probability (%)</Label>
              <Input type="number" min="0" max="100" value={probability} onChange={e => setProbability(e.target.value)} className="h-8 text-xs" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Link to Tenant (optional)</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No tenant linked" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="" className="text-xs">— None —</SelectItem>
                {tenants.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${t.type === 'SCHOOL' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      {t.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Contact Name</Label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="John Smith" className="h-8 text-xs" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Contact Email</Label>
              <Input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="john@school.edu" className="h-8 text-xs" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Deal context and follow-up notes…" className="text-xs min-h-14 resize-none" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
            <Button type="submit" size="sm" disabled={!name || isPending}
              className="gap-1.5 text-xs bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              {isEdit ? 'Save Changes' : 'Create Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
