/* ─── CreateInvoiceDialog — Create a new Platform Invoice ─── */
import { useState } from 'react';
import { FileText, Plus, Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useTenants, useCreatePlatformInvoice } from '@/hooks/api';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({ open, onOpenChange }: CreateInvoiceDialogProps) {
  const [tenantId, setTenantId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [method, setMethod] = useState('');

  const createInvoice = useCreatePlatformInvoice();
  const { data: tenantData } = useTenants();
  const tenants = tenantData?.data ?? [];

  const reset = () => {
    setTenantId(''); setAmount(''); setDueDate(''); setMethod('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice.mutate(
      {
        tenantId,
        amount: parseFloat(amount),
        dueDate,
        method: method || undefined,
      },
      { onSuccess: () => { reset(); onOpenChange(false); } },
    );
  };

  // Default due date to 30 days from now
  const defaultDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-indigo-600 shadow-sm">
              <FileText className="size-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-sm">Create Invoice</DialogTitle>
              <DialogDescription className="text-xs">Issue a new invoice to a school or individual tenant</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-2">
          {/* Tenant Select */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Client / Tenant *</Label>
            <Select value={tenantId} onValueChange={setTenantId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select a tenant…" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map(t => (
                  <SelectItem key={t.id} value={t.id} className="text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-block h-1.5 w-1.5 rounded-full ${t.type === 'SCHOOL' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                      {t.name}
                      <span className="text-muted-foreground ml-1">({t.type?.toLowerCase()})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Amount ($) *</Label>
              <Input type="number" step="0.01" min="0.01" placeholder="500.00" value={amount} onChange={e => setAmount(e.target.value)} className="h-8 text-xs" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Due Date *</Label>
              <Input type="date" value={dueDate || defaultDue} onChange={e => setDueDate(e.target.value)} className="h-8 text-xs" required />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Payment Method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Auto-detect from gateway" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stripe" className="text-xs">Stripe</SelectItem>
                <SelectItem value="PayPal" className="text-xs">PayPal</SelectItem>
                <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">Cancel</Button>
            <Button type="submit" size="sm" disabled={!tenantId || !amount || createInvoice.isPending}
              className="gap-1.5 text-xs bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
              {createInvoice.isPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              Create Invoice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
