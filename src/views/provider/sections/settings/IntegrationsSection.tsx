/* ─── IntegrationsSection ─── Connections, Webhooks, API Keys ── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Globe, Webhook, Key, Plus, Trash2, CheckCircle,
  AlertCircle, XCircle, Network, Copy,
  Settings, Zap, CreditCard, Search, BarChart3, Cloud,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useIntegrations, useCreateIntegration, useUpdateIntegration, useDeleteIntegration,
  useWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook,
  useApiKeys, useCreateApiKey, useRevokeApiKey,
  type Integration, type WebhookEndpoint, type ApiKeyRecord,
} from '@/hooks/api/use-settings';

/* ── 3D Icons ────────────────────────────────────────────────── */
function Icon3D_Plug() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,.35))' }}>
      <defs>
        <linearGradient id="plug3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id="plugShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#plug3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#plugShine)" />
      <g transform="translate(11,11)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 0v5M14 0v5M2 5h14v4a6 6 0 01-6 6h-2a6 6 0 01-6-6V5z" /><path d="M9 15v3" />
      </g>
    </svg>
  );
}

function Icon3D_Hook() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(14,165,233,.35))' }}>
      <defs>
        <linearGradient id="hook3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <radialGradient id="hookShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#hook3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#hookShine)" />
      <g transform="translate(12,10)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
        <path d="M0 4h6l2 3-2 3h-6" /><path d="M16 4h-6l-2 3 2 3h6" /><circle cx="8" cy="14" r="2" />
      </g>
    </svg>
  );
}

function Icon3D_Key() {
  return (
    <svg viewBox="0 0 40 40" className="h-8 w-8 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(245,158,11,.35))' }}>
      <defs>
        <linearGradient id="key3d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <radialGradient id="keyShine" cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.5" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="4" y="4" width="32" height="32" rx="10" fill="url(#key3d)" /><rect x="4" y="4" width="32" height="32" rx="10" fill="url(#keyShine)" />
      <g transform="translate(10,12)" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="4" /><path d="M10 6h8" /><path d="M15 3v6" /><path d="M18 3v6" />
      </g>
    </svg>
  );
}

/* ── Main Export ───────────────────────────────────────────────── */
export function IntegrationsSection() {
  const { activeSubNav } = useNavigationStore();
  const ref = useStaggerAnimate<HTMLDivElement>([activeSubNav]);

  const view = (() => {
    switch (activeSubNav) {
      case 'webhooks': return <WebhooksView />;
      case 'api_keys': return <APIKeysView />;
      default: return <ConnectionsView />;
    }
  })();

  return <div ref={ref} className="space-y-3 h-full overflow-y-auto pr-1">{view}</div>;
}

/* ════════════════════════════════════════════════════════════════
 * CONNECTIONS VIEW
 * ════════════════════════════════════════════════════════════════ */

const categoryIcons: Record<string, typeof Globe> = {
  smtp: Globe, cdn: Cloud, storage: BarChart3, monitoring: BarChart3, payment: CreditCard, search: Search,
};

function ConnectionsView() {
  const { data: integrations, loading, refetch } = useIntegrations();
  const { mutate: createIntegration, loading: creating } = useCreateIntegration();
  const { mutate: updateIntegration } = useUpdateIntegration();
  const { mutate: deleteIntegration } = useDeleteIntegration();

  const [showCreate, setShowCreate] = useState(false);
  const [newInt, setNewInt] = useState({ name: '', provider: '', category: 'smtp' as string, description: '' });

  const handleCreate = async () => {
    if (!newInt.name || !newInt.provider) return;
    await createIntegration(newInt);
    setNewInt({ name: '', provider: '', category: 'smtp', description: '' });
    setShowCreate(false);
    refetch();
  };

  const handleToggle = async (id: string, current: string) => {
    const status = current === 'active' ? 'inactive' : 'active';
    await updateIntegration({ status }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteIntegration(undefined, `/${id}`);
    refetch();
  };

  const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; bg: string }> = {
    active: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    inactive: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500' },
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-blue-500/20 bg-linear-to-br from-blue-500/8 to-indigo-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-blue-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Plug />
          <div>
            <h2 className="text-base font-bold tracking-tight">Connected Services</h2>
            <p className="text-xs text-muted-foreground">System-level connections and third-party services</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {integrations.filter((i: Integration) => i.status === 'active').length} active
            </Badge>
            <Button size="sm" className="gap-1.5" onClick={() => setShowCreate(true)}>
              <Plus className="size-3" /> Add Service
            </Button>
          </div>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card data-animate className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Zap className="size-3 text-blue-500" /> Connect New Service</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="Service name" className="h-7 text-xs" value={newInt.name} onChange={(e) => setNewInt({ ...newInt, name: e.target.value })} />
              <Input placeholder="Provider (e.g. SendGrid)" className="h-7 text-xs" value={newInt.provider} onChange={(e) => setNewInt({ ...newInt, provider: e.target.value })} />
              <select
                className="h-7 rounded-md border border-border/60 bg-muted/30 px-2 text-xs"
                value={newInt.category}
                onChange={(e) => setNewInt({ ...newInt, category: e.target.value })}
              >
                <option value="smtp">SMTP</option>
                <option value="cdn">CDN</option>
                <option value="storage">Storage</option>
                <option value="monitoring">Monitoring</option>
                <option value="payment">Payment</option>
                <option value="search">Search</option>
              </select>
              <Input placeholder="Description" className="h-7 text-xs" value={newInt.description} onChange={(e) => setNewInt({ ...newInt, description: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Connecting...' : 'Connect'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations Grid */}
      <div className="grid gap-2 sm:grid-cols-2" data-animate>
        {integrations.map((int: Integration) => {
          const Icon = categoryIcons[int.category] ?? Settings;
          const st = statusConfig[int.status] ?? statusConfig.active;
          const StatusIcon = st.icon;
          return (
            <Card
              key={int.id}
              className="group relative overflow-hidden border-border/60 transition-all duration-300 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="pointer-events-none absolute -top-6 -right-6 h-14 w-14 rounded-full bg-blue-400/5 blur-xl transition-transform duration-500 group-hover:scale-150" />
              <CardContent className="flex items-center gap-3 py-3 px-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">{int.name}</p>
                  <p className="text-[10px] text-muted-foreground">{int.provider} — {int.description || int.category}</p>
                </div>
                <button onClick={() => handleToggle(int.id, int.status)} className="shrink-0">
                  <Badge className={`text-[9px] ${st.bg} gap-0.5 cursor-pointer hover:opacity-80`}>
                    <StatusIcon className="size-2.5" /> {int.status}
                  </Badge>
                </button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(int.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * WEBHOOKS VIEW
 * ════════════════════════════════════════════════════════════════ */

function WebhooksView() {
  const { data: hooks, loading, refetch } = useWebhooks();
  const { mutate: createHook, loading: creating } = useCreateWebhook();
  const { mutate: updateHook } = useUpdateWebhook();
  const { mutate: deleteHook } = useDeleteWebhook();

  const [showCreate, setShowCreate] = useState(false);
  const [newHook, setNewHook] = useState({ url: '', events: '*' });

  const handleCreate = async () => {
    if (!newHook.url) return;
    await createHook(newHook);
    setNewHook({ url: '', events: '*' });
    setShowCreate(false);
    refetch();
  };

  const handleToggle = async (id: string, current: string) => {
    const status = current === 'active' ? 'inactive' : 'active';
    await updateHook({ status }, `/${id}`);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteHook(undefined, `/${id}`);
    refetch();
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-sky-500/20 bg-linear-to-br from-sky-500/8 to-cyan-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Hook />
          <div>
            <h2 className="text-base font-bold tracking-tight">Webhooks</h2>
            <p className="text-xs text-muted-foreground">Outbound event notifications</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{hooks.length} endpoints</Badge>
            <Button size="sm" className="gap-1.5 bg-sky-500 hover:bg-sky-600" onClick={() => setShowCreate(true)}>
              <Webhook className="size-3" /> Add Webhook
            </Button>
          </div>
        </div>
      </div>

      {/* Create */}
      {showCreate && (
        <Card data-animate className="border-sky-500/30 bg-sky-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Network className="size-3 text-sky-500" /> New Webhook Endpoint</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <Input placeholder="https://example.com/webhook" className="h-7 text-xs font-mono sm:col-span-2" value={newHook.url} onChange={(e) => setNewHook({ ...newHook, url: e.target.value })} />
              <Input placeholder="Events (e.g. payment.*, tenant.created)" className="h-7 text-xs sm:col-span-2" value={newHook.events} onChange={(e) => setNewHook({ ...newHook, events: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-sky-500 hover:bg-sky-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhooks list */}
      <div className="space-y-1.5" data-animate>
        {hooks.map((h: WebhookEndpoint) => {
          const statusColor = h.status === 'active' ? 'bg-emerald-500' : h.status === 'failed' ? 'bg-red-500' : 'bg-amber-500';
          return (
            <Card key={h.id} className="group border-border/60 transition-all duration-300 hover:border-sky-500/30 hover:shadow-sm">
              <CardContent className="flex items-center gap-3 py-2.5 px-3">
                <Network className="size-4 text-sky-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold font-mono truncate max-w-70">{h.url}</p>
                  <p className="text-[9px] text-muted-foreground">
                    Events: {h.events}
                    {h.lastCallAt && ` · Last call: ${new Date(h.lastCallAt).toLocaleString()}`}
                  </p>
                </div>
                <button onClick={() => handleToggle(h.id, h.status)}>
                  <Badge className={`text-[9px] ${statusColor} cursor-pointer hover:opacity-80`}>{h.status}</Badge>
                </button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(h.id)}>
                  <Trash2 className="size-3 text-red-500" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        </div>
      )}

      {!loading && hooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Webhook className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No webhooks configured</p>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
 * API KEYS VIEW
 * ════════════════════════════════════════════════════════════════ */

function APIKeysView() {
  const { data: keys, loading, refetch } = useApiKeys();
  const { mutate: createKey, loading: creating } = useCreateApiKey();
  const { mutate: revokeKey } = useRevokeApiKey();

  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', scopes: ['read', 'write'] });
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newKey.name) return;
    const res = await createKey(newKey) as { data?: { rawKey?: string } } | undefined;
    if (res?.data?.rawKey) {
      setRevealedKey(res.data.rawKey);
    }
    setNewKey({ name: '', scopes: ['read', 'write'] });
    setShowCreate(false);
    refetch();
  };

  const handleRevoke = async (id: string) => {
    await revokeKey(undefined, `/${id}/revoke`);
    refetch();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      {/* Header */}
      <div data-animate className="relative overflow-hidden rounded-xl border border-amber-500/20 bg-linear-to-br from-amber-500/8 to-orange-500/5 p-3">
        <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
        <div className="flex items-center gap-3">
          <Icon3D_Key />
          <div>
            <h2 className="text-base font-bold tracking-tight">API Keys</h2>
            <p className="text-xs text-muted-foreground">Manage platform API access keys</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{keys.length} active</Badge>
            <Button size="sm" className="gap-1.5 bg-amber-500 hover:bg-amber-600" onClick={() => setShowCreate(true)}>
              <Key className="size-3" /> Generate Key
            </Button>
          </div>
        </div>
      </div>

      {/* Revealed key alert */}
      {revealedKey && (
        <Card data-animate className="border-emerald-500/40 bg-emerald-500/5">
          <CardContent className="py-3 px-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="size-4 text-emerald-500" />
              <p className="text-xs font-semibold text-emerald-600">API Key Created — Copy it now. It will not be shown again.</p>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-muted/50 px-2 py-1 text-xs font-mono truncate">{revealedKey}</code>
              <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => copyToClipboard(revealedKey)}>
                <Copy className="size-3" /> Copy
              </Button>
              <Button size="sm" variant="ghost" className="h-7" onClick={() => setRevealedKey(null)}>Dismiss</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {showCreate && (
        <Card data-animate className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-3 px-3 space-y-2">
            <p className="text-xs font-semibold flex items-center gap-1.5"><Key className="size-3 text-amber-500" /> Generate New API Key</p>
            <Input placeholder="Key name (e.g. Production Key)" className="h-7 text-xs" value={newKey.name} onChange={(e) => setNewKey({ ...newKey, name: e.target.value })} />
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 h-7 text-xs" onClick={handleCreate} disabled={creating}>{creating ? 'Generating...' : 'Generate'}</Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      <div className="space-y-1.5" data-animate>
        {keys.map((k: ApiKeyRecord) => (
          <Card key={k.id} className="group border-border/60 transition-all duration-300 hover:border-amber-500/30 hover:shadow-sm">
            <CardContent className="flex items-center gap-3 py-2.5 px-3">
              <Key className="size-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold">{k.name}</p>
                <p className="text-[9px] font-mono text-muted-foreground">
                  {k.prefix}**** · Created {new Date(k.createdAt).toLocaleDateString()}
                </p>
              </div>
              {k.lastUsedAt && (
                <span className="text-[9px] text-muted-foreground hidden sm:block">
                  Last used: {new Date(k.lastUsedAt).toLocaleDateString()}
                </span>
              )}
              <div className="flex items-center gap-1">
                {k.scopes.map((s) => (
                  <Badge key={s} variant="outline" className="text-[8px]">{s}</Badge>
                ))}
              </div>
              <Button size="sm" variant="ghost" className="text-red-500 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRevoke(k.id)}>
                Revoke
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
        </div>
      )}

      {!loading && keys.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Key className="size-8 mb-2 opacity-30" />
          <p className="text-xs">No API keys</p>
          <p className="text-[10px]">Generate one to enable API access</p>
        </div>
      )}
    </>
  );
}
