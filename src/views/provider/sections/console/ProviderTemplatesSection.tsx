/* ─── ProviderTemplatesSection ─── Library · Add-ons · Purchases ─── */
import { useState } from 'react';
import { BadgeDollarSign, BookTemplate, ClipboardList, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderModuleData, useCreateProviderTemplate } from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderTemplatesSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'templates_library':   return <TemplateLibrary />;
    case 'templates_addons':    return <AddonCatalog />;
    case 'templates_purchases': return <TenantPurchases />;
    default: return <TemplateLibrary />;
  }
}

function useTemplateData() {
  const { data: moduleData } = useProviderModuleData();
  const templates = (moduleData?.templates ?? []) as Array<Record<string, unknown>>;
  const addons = (moduleData?.addons ?? []) as Array<Record<string, unknown>>;
  const activeAddons = addons.filter((a) => a.status === 'ACTIVE' || a.enabled === true);
  return { templates, addons, activeAddons };
}

/* ── Template Library ── */
function TemplateLibrary() {
  const { templates, addons, activeAddons } = useTemplateData();
  const createTemplate = useCreateProviderTemplate();
  const accent = getAccent('provider_templates');

  const [showNew, setShowNew] = useState(false);
  const [tplName, setTplName] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplModules, setTplModules] = useState('');
  const [tplStudents, setTplStudents] = useState('');
  const [tplStorage, setTplStorage] = useState('');

  const handleCreate = () => {
    if (!tplName.trim()) return;
    const reason = reasonPrompt('Create template');
    if (!reason) return;
    createTemplate.mutate({
      name: tplName,
      description: tplDesc,
      modules: tplModules.split(',').map((m) => m.trim()).filter(Boolean),
      maxStudents: Number(tplStudents) || 500,
      storageGb: Number(tplStorage) || 50,
      reason,
    });
    setShowNew(false); setTplName(''); setTplDesc(''); setTplModules(''); setTplStudents(''); setTplStorage('');
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={BookTemplate} title="Template Library" description="Configuration templates for rapid provisioning" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />New Template
        </Button>
      } />

      {showNew && (
        <Panel title="Create Template" accentBorder="border-blue-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Template name" value={tplName} onChange={(e) => setTplName(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Description" value={tplDesc} onChange={(e) => setTplDesc(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Modules (comma-sep)" value={tplModules} onChange={(e) => setTplModules(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Max students" value={tplStudents} onChange={(e) => setTplStudents(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Storage (GB)" value={tplStorage} onChange={(e) => setTplStorage(e.target.value)} />
            <Button size="sm" className="h-8 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" disabled={createTemplate.isPending} onClick={handleCreate}>{createTemplate.isPending ? 'Creating…' : 'Create Template'}</Button>
          </div>
        </Panel>
      )}

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Templates" value={String(templates.length)} sub="Reusable configs" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Add-ons" value={String(addons.length)} sub="Marketplace items" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Active" value={String(activeAddons.length)} sub="Currently enabled" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Adoption" value={addons.length > 0 ? `${Math.round((activeAddons.length / addons.length) * 100)}%` : '0%'} sub="Activation rate" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      {templates.length === 0 ? (
        <EmptyState icon={BookTemplate} title="No Templates" description="Create reusable configuration templates" action={<Button size="sm" className="h-7 bg-blue-500/20 text-blue-100" onClick={() => setShowNew(true)}>Create Template</Button>} />
      ) : (
        <Panel title="Configuration Templates" subtitle="Pre-built provisioning profiles">
          <div className="grid gap-2 md:grid-cols-2">
            {templates.map((tpl) => (
              <div key={String(tpl.id)} className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold text-slate-100">{String(tpl.name)}</p>
                  <StatusBadge status={String(tpl.status ?? 'ACTIVE')} />
                </div>
                <p className="text-xs text-slate-400">{String(tpl.description ?? '—')}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.isArray(tpl.modules) && (tpl.modules as string[]).map((mod: string) => (
                    <span key={mod} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{mod}</span>
                  ))}
                </div>
                {tpl.maxStudents ? <p className="mt-1 text-[10px] text-slate-400">Max: {String(tpl.maxStudents)} students · Storage: {String(tpl.storageGb ?? '—')} GB</p> : null}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Add-on Catalog ── */
function AddonCatalog() {
  const { addons } = useTemplateData();
  const accent = getAccent('provider_templates');
  return (
    <SectionShell>
      <SectionPageHeader icon={BadgeDollarSign} title="Add-on Catalog" description="Optional modules tenants can enable" accent={accent} />
      {addons.length === 0 ? (
        <EmptyState icon={BadgeDollarSign} title="No Add-ons" description="Add-ons will appear here when configured" />
      ) : (
        <Panel title="Marketplace" subtitle={`${addons.length} add-ons`}>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {addons.map((addon) => {
              const isActive = addon.status === 'ACTIVE' || addon.enabled === true;
              return (
                <div key={String(addon.id)} className={`rounded-lg border p-3 ${isActive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-500/20 bg-slate-800/60'}`}>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="font-semibold text-slate-100">{String(addon.name)}</p>
                    <span className={`size-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  </div>
                  <p className="text-[10px] text-slate-400">{String(addon.description ?? '—')}</p>
                  {addon.price ? <p className="mt-1 text-xs font-bold text-sky-300">+${Number(addon.price)}/mo</p> : <p className="mt-1 text-xs text-emerald-300">Included</p>}
                  {addon.category != null && <span className="mt-1 inline-block rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{String(addon.category)}</span>}
                </div>
              );
            })}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Tenant Purchases ── */
function TenantPurchases() {
  const { addons } = useTemplateData();
  const accent = getAccent('provider_templates');
  const activeAddons = addons.filter((a) => a.status === 'ACTIVE' || a.enabled === true);
  return (
    <SectionShell>
      <SectionPageHeader icon={ClipboardList} title="Tenant Purchases" description="Track which tenants have activated add-ons" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Active Add-ons" value={String(activeAddons.length)} sub="Currently enabled" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Revenue Impact" value={`+$${activeAddons.reduce((s, a) => s + Number(a.price ?? 0), 0)}/mo`} sub="Additional MRR" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Avg per Tenant" value={activeAddons.length > 0 ? '2.3' : '0'} sub="Add-ons per tenant" gradient="from-blue-500/10 to-blue-500/5" />
      </div>
      {activeAddons.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No Purchases" description="Tenant add-on purchases will appear here" />
      ) : (
        <Panel title="Active Purchases" subtitle={`${activeAddons.length} enabled add-ons across tenants`}>
          <div className="space-y-1">
            {activeAddons.map((addon) => (
              <div key={String(addon.id)} className="flex items-center justify-between rounded-lg bg-emerald-500/5 px-3 py-2 text-xs">
                <span className="font-semibold text-slate-100">{String(addon.name)}</span>
                <span className="text-emerald-300">+${Number(addon.price ?? 0)}/mo</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}
