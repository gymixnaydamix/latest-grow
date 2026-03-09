/* ─── ProviderBrandingSection ─── Themes · Domains · Login Pages ─── */
import { useState } from 'react';
import { Globe, Loader2, Lock, Palette, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderBranding, useCreateProviderBrandTheme, useUpdateProviderBrandTheme, useAddProviderDomain, useVerifyProviderDomain, useCreateProviderLoginPage, useUpdateProviderLoginPage } from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderBrandingSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'branding_themes':  return <ThemesView />;
    case 'branding_domains': return <DomainsView />;
    case 'branding_login':   return <LoginPagesView />;
    default:                 return <ThemesView />;
  }
}

/* ── Themes ── */
function ThemesView() {
  const accent = getAccent('provider_branding');
  const { data: bundle, isLoading } = useProviderBranding();
  const themes = bundle?.themes ?? [];
  const activeThemes = themes.filter((t) => t.active);
  const createTheme = useCreateProviderBrandTheme();
  const updateTheme = useUpdateProviderBrandTheme();
  const [showNew, setShowNew] = useState(false);
  const [tName, setTName] = useState('');
  const [tPrimary, setTPrimary] = useState('#6366f1');
  const [tSecondary, setTSecondary] = useState('#8b5cf6');
  const [editId, setEditId] = useState<string | null>(null);
  const [editPrimary, setEditPrimary] = useState('');
  const [editSecondary, setEditSecondary] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const handleCreate = () => {
    const reason = reasonPrompt('Create theme');
    if (!reason) return;
    createTheme.mutate({ name: tName, primary: tPrimary, secondary: tSecondary, reason }, { onSuccess: () => { setShowNew(false); setTName(''); } });
  };

  const handleUpdate = (id: string) => {
    const reason = reasonPrompt('Update theme');
    if (!reason) return;
    updateTheme.mutate({ themeId: id, primary: editPrimary, secondary: editSecondary, reason }, { onSuccess: () => setEditId(null) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Palette} title="Theme Manager" description="Create and manage whitelabel color schemes" accent={accent} actions={
        <Button size="sm" className="h-7 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Theme</Button>
      } />

      {showNew && (
        <Panel title="Create Theme" accentBorder="border-fuchsia-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Theme name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <div className="flex items-center gap-2">
              <input type="color" value={tPrimary} onChange={(e) => setTPrimary(e.target.value)} className="size-8 rounded cursor-pointer" />
              <span className="text-xs text-slate-400">Primary: {tPrimary}</span>
            </div>
            <div className="flex items-center gap-2">
              <input type="color" value={tSecondary} onChange={(e) => setTSecondary(e.target.value)} className="size-8 rounded cursor-pointer" />
              <span className="text-xs text-slate-400">Secondary: {tSecondary}</span>
            </div>
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30" onClick={handleCreate} disabled={!tName.trim() || createTheme.isPending}>
              {createTheme.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Themes" value={String(themes.length)} sub="Total configured" gradient="from-fuchsia-500/10 to-fuchsia-500/5" />
        <StatCard label="Active" value={String(activeThemes.length)} sub="In use" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Tenants" value={String(themes.reduce((s, t) => s + t.tenants, 0))} sub="Using custom themes" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Default" value={themes.find((t) => t.active)?.name ?? '—'} sub="Platform default" gradient="from-sky-500/10 to-sky-500/5" />
      </div>

      <Panel title="Theme Gallery" subtitle={isLoading ? 'Loading…' : `${themes.length} themes`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-fuchsia-400" /></div>
        ) : themes.length === 0 ? (
          <EmptyState icon={Palette} title="No Themes" description="Create your first whitelabel theme." />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {themes.map((theme) => (
              <div key={theme.id} className="rounded-xl border border-slate-500/20 bg-slate-800/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-100">{theme.name}</p>
                  <StatusBadge status={theme.active ? 'ACTIVE' : 'SUSPENDED'} />
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex gap-2">
                    <div className="size-8 rounded-lg border border-slate-500/30" style={{ backgroundColor: theme.primary }} title="Primary" />
                    <div className="size-8 rounded-lg border border-slate-500/30" style={{ backgroundColor: theme.secondary }} title="Secondary" />
                  </div>
                  <div className="text-[10px] text-slate-400">
                    <p>Primary: {theme.primary}</p>
                    <p>Secondary: {theme.secondary}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{theme.tenants} tenant{theme.tenants !== 1 ? 's' : ''}</span>
                  {editId === theme.id ? (
                    <div className="flex items-center gap-2">
                      <input type="color" value={editPrimary} onChange={(e) => setEditPrimary(e.target.value)} className="size-6 rounded cursor-pointer" />
                      <input type="color" value={editSecondary} onChange={(e) => setEditSecondary(e.target.value)} className="size-6 rounded cursor-pointer" />
                      <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditId(null)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-[10px] bg-fuchsia-500/20 text-fuchsia-100" onClick={() => handleUpdate(theme.id)} disabled={updateTheme.isPending}>Save</Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-fuchsia-500/30" onClick={() => { setEditId(theme.id); setEditPrimary(theme.primary); setEditSecondary(theme.secondary); }}>Edit</Button>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-fuchsia-500/30" onClick={() => setPreviewId(previewId === theme.id ? null : theme.id)}>
                        {previewId === theme.id ? 'Close' : 'Preview'}
                      </Button>
                    </div>
                  )}
                </div>
                {previewId === theme.id && (
                  <div className="mt-3 rounded-lg border border-fuchsia-500/20 p-4 space-y-2" style={{ background: `linear-gradient(135deg, ${theme.primary}22, ${theme.secondary}22)` }}>
                    <p className="text-[10px] font-semibold text-slate-300">Theme Preview</p>
                    <div className="flex items-center gap-3">
                      <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: theme.primary }} />
                      <div className="h-8 flex-1 rounded-lg" style={{ backgroundColor: theme.secondary }} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" className="h-7 rounded-lg px-3 text-[10px] font-semibold text-white" style={{ backgroundColor: theme.primary }}>Primary Button</button>
                      <button type="button" className="h-7 rounded-lg px-3 text-[10px] font-semibold text-white" style={{ backgroundColor: theme.secondary }}>Secondary Button</button>
                    </div>
                    <div className="rounded-lg border border-slate-500/30 bg-slate-900/60 p-2">
                      <div className="h-2 w-3/4 rounded" style={{ backgroundColor: theme.primary, opacity: 0.3 }} />
                      <div className="mt-1 h-2 w-1/2 rounded" style={{ backgroundColor: theme.secondary, opacity: 0.3 }} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Domains ── */
function DomainsView() {
  const accent = getAccent('provider_branding');
  const { data: bundle, isLoading } = useProviderBranding();
  const domains = bundle?.domains ?? [];
  const customDomains = domains.filter((d) => d.type === 'Custom');
  const verified = domains.filter((d) => d.verified);
  const addDomain = useAddProviderDomain();
  const verifyDomain = useVerifyProviderDomain();
  const [showNew, setShowNew] = useState(false);
  const [dName, setDName] = useState('');

  const handleAdd = () => {
    const reason = reasonPrompt('Add domain');
    if (!reason) return;
    addDomain.mutate({ domain: dName, type: 'Custom', reason }, { onSuccess: () => { setShowNew(false); setDName(''); } });
  };

  const handleVerify = (id: string) => {
    const reason = reasonPrompt('Verify domain DNS');
    if (!reason) return;
    verifyDomain.mutate({ domainId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Globe} title="Domain Management" description="Custom domains and SSL certificate management" accent={accent} actions={
        <Button size="sm" className="h-7 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />Add Domain</Button>
      } />

      {showNew && (
        <Panel title="Add Domain" accentBorder="border-fuchsia-500/20">
          <div className="flex gap-2">
            <Input value={dName} onChange={(e) => setDName(e.target.value)} placeholder="Domain (e.g. learn.school.edu)" className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Button size="sm" className="h-8 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-8 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30" onClick={handleAdd} disabled={!dName.trim() || addDomain.isPending}>
              {addDomain.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Add
            </Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Domains" value={String(domains.length)} sub="Total configured" gradient="from-fuchsia-500/10 to-fuchsia-500/5" />
        <StatCard label="Custom" value={String(customDomains.length)} sub="Tenant domains" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Verified" value={String(verified.length)} sub="DNS confirmed" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="SSL Active" value={String(domains.filter((d) => d.ssl === 'ACTIVE').length)} sub="Certificates valid" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>

      <Panel title="Domain Registry" subtitle={isLoading ? 'Loading…' : `${domains.length} domains`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-fuchsia-400" /></div>
        ) : domains.length === 0 ? (
          <EmptyState icon={Globe} title="No Domains" description="Add your first custom domain." />
        ) : (
          <div className="space-y-2">
            {domains.map((d) => (
              <Row key={d.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100 font-mono">{d.domain}</p>
                    <p className="text-slate-400">{d.type}{d.tenant ? ` · ${d.tenant}` : ' · Platform root'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {d.verified ? (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">DNS Verified ✓</span>
                    ) : (
                      <Button size="sm" className="h-6 text-[10px] bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => handleVerify(d.id)} disabled={verifyDomain.isPending}>
                        {verifyDomain.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Verify DNS
                      </Button>
                    )}
                    <StatusBadge status={d.ssl === 'ACTIVE' ? 'ACTIVE' : 'PENDING'} />
                  </div>
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Login Pages ── */
function LoginPagesView() {
  const accent = getAccent('provider_branding');
  const { data: bundle, isLoading } = useProviderBranding();
  const loginPages = bundle?.loginPages ?? [];
  const createLP = useCreateProviderLoginPage();
  const updateLP = useUpdateProviderLoginPage();
  const [showNew, setShowNew] = useState(false);
  const [lpName, setLpName] = useState('');
  const [lpTenant, setLpTenant] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [previewLoginId, setPreviewLoginId] = useState<string | null>(null);

  const handleCreate = () => {
    const reason = reasonPrompt('Create login page');
    if (!reason) return;
    createLP.mutate({ name: lpName, tenant: lpTenant, logo: false, customCss: false, sso: false, mfa: false, reason }, { onSuccess: () => { setShowNew(false); setLpName(''); setLpTenant(''); } });
  };

  const handleToggle = (id: string, field: string, current: boolean) => {
    const reason = reasonPrompt(`Toggle ${field}`);
    if (!reason) return;
    updateLP.mutate({ pageId: id, [field]: !current, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Lock} title="Login Page Customization" description="Branded login experiences per tenant" accent={accent} actions={
        <Button size="sm" className="h-7 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Login Page</Button>
      } />

      {showNew && (
        <Panel title="Create Login Page" accentBorder="border-fuchsia-500/20">
          <div className="flex gap-2">
            <Input value={lpName} onChange={(e) => setLpName(e.target.value)} placeholder="Page name" className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={lpTenant} onChange={(e) => setLpTenant(e.target.value)} placeholder="Tenant name" className="h-8 flex-1 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Button size="sm" className="h-8 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-8 bg-fuchsia-500/20 text-fuchsia-100 hover:bg-fuchsia-500/30" onClick={handleCreate} disabled={!lpName.trim() || createLP.isPending}>
              {createLP.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-fuchsia-400" /></div>
      ) : loginPages.length === 0 ? (
        <EmptyState icon={Lock} title="No Login Pages" description="Create your first branded login experience." />
      ) : (
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {loginPages.map((lp) => (
            <Panel key={lp.id} title={lp.name} subtitle={`Tenant: ${lp.tenant}`} accentBorder="border-fuchsia-500/15">
              <div className="space-y-3">
                <div className="rounded-lg border border-dashed border-fuchsia-500/30 bg-fuchsia-500/5 p-6 text-center">
                  <Lock className="mx-auto size-8 text-fuchsia-400/40" />
                  <p className="mt-2 text-xs text-slate-400">Login page preview</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                    <span className="text-slate-400">Custom Logo</span>
                    <span className={lp.logo ? 'text-emerald-300' : 'text-red-300'}>{lp.logo ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                    <span className="text-slate-400">Custom CSS</span>
                    <span className={lp.customCss ? 'text-emerald-300' : 'text-red-300'}>{lp.customCss ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                    <span className="text-slate-400">SSO</span>
                    <span className={lp.sso ? 'text-emerald-300' : 'text-red-300'}>{lp.sso ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2">
                    <span className="text-slate-400">MFA</span>
                    <span className={lp.mfa ? 'text-emerald-300' : 'text-red-300'}>{lp.mfa ? '✓' : '✗'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-6 text-[10px] border-fuchsia-500/30 flex-1" onClick={() => setEditId(editId === lp.id ? null : lp.id)}>
                    {editId === lp.id ? 'Close' : 'Edit'}
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 text-[10px] border-fuchsia-500/30 flex-1" onClick={() => setPreviewLoginId(previewLoginId === lp.id ? null : lp.id)}>
                    {previewLoginId === lp.id ? 'Close Preview' : 'Preview'}
                  </Button>
                </div>

                {previewLoginId === lp.id && (
                  <div className="mt-2 rounded-lg border border-fuchsia-500/20 bg-slate-900 p-4">
                    <div className="mx-auto max-w-50 space-y-3 text-center">
                      <div className="flex items-center justify-center">
                        {lp.logo ? (
                          <div className="size-10 rounded-lg bg-fuchsia-500/20 flex items-center justify-center"><Lock className="size-5 text-fuchsia-300" /></div>
                        ) : (
                          <Lock className="size-8 text-slate-500" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-200">{lp.name}</p>
                      <div className="space-y-2">
                        <div className="h-7 rounded-md border border-slate-600 bg-slate-800" />
                        <div className="h-7 rounded-md border border-slate-600 bg-slate-800" />
                        <div className="h-7 rounded-md bg-fuchsia-500/30 text-[10px] leading-7 font-semibold text-fuchsia-100">Sign In</div>
                      </div>
                      <div className="flex justify-center gap-2 text-[10px]">
                        {lp.sso && <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">SSO</span>}
                        {lp.mfa && <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-blue-300">MFA</span>}
                        {lp.customCss && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-amber-300">CSS</span>}
                      </div>
                    </div>
                  </div>
                )}

                {editId === lp.id && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <Button size="sm" className={`h-7 text-[10px] ${lp.sso ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`} onClick={() => handleToggle(lp.id, 'sso', lp.sso)} disabled={updateLP.isPending}>
                      SSO: {lp.sso ? 'ON' : 'OFF'}
                    </Button>
                    <Button size="sm" className={`h-7 text-[10px] ${lp.mfa ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`} onClick={() => handleToggle(lp.id, 'mfa', lp.mfa)} disabled={updateLP.isPending}>
                      MFA: {lp.mfa ? 'ON' : 'OFF'}
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
