/* ══════════════════════════════════════════════════════════════════════
 * FormDialog — schema-driven create/edit dialog for all admin entities
 * Usage:
 *   <FormDialog
 *     open={open} onOpenChange={setOpen}
 *     title="Add Student" mode="create"
 *     fields={[{ name:'name', label:'Full Name', type:'text', required:true }, ...]}
 *     onSubmit={(data) => { store.students.add({...data, id:genId('stu')}); }}
 *   />
 * ══════════════════════════════════════════════════════════════════════ */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─────────── Field Schema ─────────── */

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'textarea' | 'select' | 'switch' | 'password' | 'time';
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  defaultValue?: string | number | boolean;
  disabled?: boolean;
  /** Half-width — render two fields side-by-side */
  half?: boolean;
  /** Help text below the field */
  description?: string;
  /** Custom validation, return error string or undefined */
  validate?: (value: any) => string | undefined;
  /** Hide this field in create or edit mode */
  hideIn?: 'create' | 'edit';
}

/* ─────────── Component Props ─────────── */

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  mode: 'create' | 'edit';
  fields: FormField[];
  /** Pre-fill form (edit mode) — keys match field.name */
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  /** Override submit button label */
  submitLabel?: string;
  /** Max dialog width class — defaults to 'sm:max-w-lg' */
  maxWidth?: string;
  loading?: boolean;
}

/* ─────────── Component ─────────── */

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  mode,
  fields,
  initialData,
  onSubmit,
  submitLabel,
  maxWidth = 'sm:max-w-lg',
  loading = false,
}: FormDialogProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Build initial form state from fields + initialData
  const resetForm = useCallback(() => {
    const init: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.hideIn === mode) return;
      if (mode === 'edit' && initialData && initialData[f.name] !== undefined) {
        init[f.name] = initialData[f.name];
      } else if (f.defaultValue !== undefined) {
        init[f.name] = f.defaultValue;
      } else {
        init[f.name] = f.type === 'switch' ? false : f.type === 'number' ? '' : '';
      }
    });
    setFormData(init);
    setErrors({});
  }, [fields, initialData, mode]);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  const visibleFields = fields.filter((f) => f.hideIn !== mode);

  const setValue = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    visibleFields.forEach((f) => {
      const val = formData[f.name];
      if (f.required && (val === '' || val === undefined || val === null)) {
        errs[f.name] = `${f.label} is required`;
      }
      if (f.validate) {
        const msg = f.validate(val);
        if (msg) errs[f.name] = msg;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  /* ─── Field Renderer ─── */
  const renderField = (field: FormField) => {
    const id = `form-${field.name}`;
    const value = formData[field.name] ?? '';
    const error = errors[field.name];

    const wrapper = (child: React.ReactNode) => (
      <div key={field.name} className={cn('space-y-2', field.half ? 'flex-1 min-w-[calc(50%-0.5rem)]' : 'w-full')}>
        {field.type !== 'switch' && (
          <Label htmlFor={id} className="text-sm font-medium text-foreground">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        {child}
        {field.description && !error && (
          <p className="text-xs text-muted-foreground">{field.description}</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'password':
      case 'number':
      case 'date':
      case 'time':
        return wrapper(
          <Input
            id={id}
            type={field.type}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setValue(field.name, field.type === 'number' ? e.target.value : e.target.value)}
            disabled={field.disabled || isLoading}
            className={cn(error && 'border-destructive')}
          />,
        );
      case 'textarea':
        return wrapper(
          <Textarea
            id={id}
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => setValue(field.name, e.target.value)}
            disabled={field.disabled || isLoading}
            rows={3}
            className={cn(error && 'border-destructive')}
          />,
        );
      case 'select':
        return wrapper(
          <Select
            value={String(value)}
            onValueChange={(v) => setValue(field.name, v)}
            disabled={field.disabled || isLoading}
          >
            <SelectTrigger id={id} className={cn(error && 'border-destructive')}>
              <SelectValue placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>,
        );
      case 'switch':
        return (
          <div key={field.name} className={cn('flex items-center justify-between rounded-lg border border-border px-3 py-2', field.half ? 'flex-1 min-w-[calc(50%-0.5rem)]' : 'w-full')}>
            <div className="space-y-0.5">
              <Label htmlFor={id} className="text-sm font-medium text-foreground">{field.label}</Label>
              {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}
            </div>
            <Switch
              id={id}
              checked={!!value}
              onCheckedChange={(v) => setValue(field.name, v)}
              disabled={field.disabled || isLoading}
            />
          </div>
        );
      default:
        return null;
    }
  };

  /* ─── Half-width grouping ─── */
  const renderFields = () => {
    const rows: React.ReactNode[] = [];
    let i = 0;
    while (i < visibleFields.length) {
      const f = visibleFields[i];
      if (f.half && i + 1 < visibleFields.length && visibleFields[i + 1].half) {
        rows.push(
          <div key={`row-${i}`} className="flex gap-3">
            {renderField(f)}
            {renderField(visibleFields[i + 1])}
          </div>,
        );
        i += 2;
      } else {
        rows.push(renderField(f));
        i += 1;
      }
    }
    return rows;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidth, 'max-h-[90vh] flex flex-col')}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4 py-1">
              {renderFields()}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-4 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel ?? (mode === 'create' ? 'Create' : 'Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
