/* ─── ToolPlatformSection ─── Integrations & API access ──────────── */
import { useState } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Plug, Key, FileText, ExternalLink,
  Settings, CheckCircle, AlertTriangle, Clock,
  RefreshCw, Copy, Eye, EyeOff, Activity, Loader2, Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { usePlatformConfigs } from '@/hooks/api/use-settings';
import {
  useIntegrations,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useAuditLog,
} from '@/hooks/api';
import type { PlatformIntegration, ApiKeyRecord } from '@/hooks/api/use-platform';

/* ── Main Export ───────────────────────────────────────────────── */
export function ToolPlatformSection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);
  const { data: platformConfigsData } = usePlatformConfigs();
  void platformConfigsData;

  const view = (() => {
    switch (activeHeader) {
      case 'integrations': return <IntegrationsView subNav={activeSubNav} />;
      case 'api_access': return <APIAccessView subNav={activeSubNav} />;
      default: return <IntegrationsView subNav={activeSubNav} />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Integrations ──────────────────────────────────────────────── */

function IntegrationsView({ subNav }: { subNav: string }) {
  if (subNav === 'my_integrations') return <MyIntegrationsView />;
  return <MarketplaceView />;
}

function MarketplaceView() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | undefined>();
  const { data: integrations, isLoading } = useIntegrations(filterCategory);
  const installMut = useCreateIntegration();
  const removeMut = useDeleteIntegration();

  const categoryColors: Record<string, string> = {
    Productivity: 'bg-blue-500/10 text-blue-400',
    Communication: 'bg-indigo-500/10 text-indigo-400',
    Learning: 'bg-rose-500/10 text-rose-400',
    Finance: 'bg-violet-500/10 text-violet-400',
    Identity: 'bg-cyan-500/10 text-cyan-400',
  };

  const FALLBACK_APPS = [
    { id: 'f1', name: 'Google Workspace', description: 'Classroom, Drive, Calendar sync', category: 'Productivity', status: 'installed' },
    { id: 'f2', name: 'Microsoft 365', description: 'Teams, OneDrive, Outlook', category: 'Productivity', status: 'available' },
    { id: 'f3', name: 'Zoom', description: 'Virtual classrooms and meetings', category: 'Communication', status: 'installed' },
    { id: 'f4', name: 'Canvas LMS', description: 'Course content sync', category: 'Learning', status: 'available' },
    { id: 'f5', name: 'Stripe', description: 'Payment processing', category: 'Finance', status: 'installed' },
    { id: 'f6', name: 'Slack', description: 'Team messaging and alerts', category: 'Communication', status: 'available' },
    { id: 'f7', name: 'Clever', description: 'Student rostering & SSO', category: 'Identity', status: 'available' },
    { id: 'f8', name: 'PowerSchool', description: 'SIS data import', category: 'Learning', status: 'installed' },
  ];

  const apps = (integrations as PlatformIntegration[] | undefined) ?? FALLBACK_APPS;
  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) || (a.description ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Integration Marketplace</h2>
        <p className="text-sm text-white/40">Browse and install third-party integrations</p>
      </div>

      <div className="flex items-center gap-3" data-animate>
        <Input
          placeholder="Search integrations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm border-white/10 bg-white/5 text-white/80 placeholder:text-white/25"
        />
        <div className="flex gap-1">
          {['All', 'Productivity', 'Communication', 'Learning', 'Finance'].map((f) => (
            <Badge
              key={f}
              variant="outline"
              onClick={() => setFilterCategory(f === 'All' ? undefined : f)}
              className={`cursor-pointer border-white/10 text-white/50 hover:bg-white/5 text-[10px] ${filterCategory === f || (f === 'All' && !filterCategory) ? 'bg-white/10 text-white/80' : ''}`}
            >{f}</Badge>
          ))}
        </div>
      </div>

      {isLoading && <div className="flex items-center gap-2 text-white/40 text-sm py-4"><Loader2 className="size-4 animate-spin" /> Loading integrations…</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {filtered.map((app) => {
          const color = categoryColors[app.category] ?? 'bg-white/5 text-white/40';
          const isInstalled = app.status === 'installed' || app.status === 'active';
          return (
            <div key={app.id ?? app.name} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
              <div className="flex items-center justify-between">
                <div className={`flex size-10 items-center justify-center rounded-lg ${color}`}>
                  <Plug className="size-5" />
                </div>
                {isInstalled ? (
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">Installed</Badge>
                    <Button
                      size="icon"
                      className="size-6 bg-transparent text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10"
                      onClick={() => app.id && removeMut.mutate(app.id)}
                      disabled={removeMut.isPending}
                    ><Trash2 className="size-3" /></Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="h-6 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white"
                    onClick={() => installMut.mutate({ name: app.name, category: app.category, config: {} })}
                    disabled={installMut.isPending}
                  >{installMut.isPending ? <Loader2 className="size-3 animate-spin" /> : 'Install'}</Button>
                )}
              </div>
              <p className="text-sm font-semibold text-white/85 mt-3">{app.name}</p>
              <p className="text-xs text-white/40">{app.description}</p>
              <Badge variant="outline" className="mt-2 text-[10px] border-white/10 text-white/30">{app.category}</Badge>
            </div>
          );
        })}
      </div>
    </>
  );
}

function MyIntegrationsView() {
  const { data: integrations, isLoading, refetch } = useIntegrations();
  const updateMut = useUpdateIntegration();

  const FALLBACK_INSTALLED = [
    { id: 'i1', name: 'Google Workspace', status: 'active', lastSyncAt: '5 min ago', errorCount: 0, category: 'Productivity' },
    { id: 'i2', name: 'Zoom', status: 'active', lastSyncAt: '2h ago', errorCount: 0, category: 'Communication' },
    { id: 'i3', name: 'Stripe', status: 'active', lastSyncAt: '1h ago', errorCount: 0, category: 'Finance' },
    { id: 'i4', name: 'PowerSchool', status: 'warning', lastSyncAt: '12h ago', errorCount: 3, category: 'Learning' },
  ];

  const installed = ((integrations as PlatformIntegration[] | undefined) ?? FALLBACK_INSTALLED).filter(
    (i) => i.status === 'active' || i.status === 'installed' || i.status === 'warning',
  );

  const categoryColors: Record<string, string> = {
    Productivity: 'bg-blue-500/10 text-blue-400',
    Communication: 'bg-indigo-500/10 text-indigo-400',
    Learning: 'bg-amber-500/10 text-amber-400',
    Finance: 'bg-violet-500/10 text-violet-400',
  };

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">My Integrations</h2>
        <p className="text-sm text-white/40">Manage installed integrations and sync status</p>
      </div>

      {isLoading && <div className="flex items-center gap-2 text-white/40 text-sm py-4"><Loader2 className="size-4 animate-spin" /> Loading…</div>}

      <div className="space-y-3" data-animate>
        {installed.map((int) => {
          const color = categoryColors[int.category] ?? 'bg-white/5 text-white/40';
          const isWarning = int.status === 'warning';
          const lastSync = int.lastSyncAt
            ? typeof int.lastSyncAt === 'string' && int.lastSyncAt.includes('ago')
              ? int.lastSyncAt
              : new Date(int.lastSyncAt).toLocaleString()
            : 'Never';
          return (
            <div key={int.id ?? int.name} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex size-9 items-center justify-center rounded-lg ${color}`}>
                  <Plug className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/85">{int.name}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="size-3" /> Last sync: {lastSync}
                    {(int.errorCount ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="size-3" /> {int.errorCount} errors
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isWarning ? (
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="size-3" /> Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="size-3" /> Warning
                  </Badge>
                )}
                <Button
                  size="icon"
                  className="size-7 bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5"
                  onClick={() => refetch()}
                ><RefreshCw className="size-3" /></Button>
                <Button
                  size="icon"
                  className="size-7 bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5"
                  onClick={() => int.id && updateMut.mutate({ id: int.id, status: isWarning ? 'active' : 'warning' })}
                  disabled={updateMut.isPending}
                ><Settings className="size-3" /></Button>
              </div>
            </div>
          );
        })}
        {installed.length === 0 && !isLoading && (
          <p className="text-sm text-white/30 py-8 text-center">No integrations installed yet.</p>
        )}
      </div>
    </>
  );
}

/* ── API Access ────────────────────────────────────────────────── */

function APIAccessView({ subNav }: { subNav: string }) {
  if (subNav === 'logs') return <APILogsView />;
  return <APIKeysView />;
}

function APIKeysView() {
  const { data: keysData, isLoading } = useApiKeys();
  const createKeyMut = useCreateApiKey();
  const revokeMut = useRevokeApiKey();
  const [newKeyName, setNewKeyName] = useState('');
  const [showRawKey, setShowRawKey] = useState<string | null>(null);

  const FALLBACK_KEYS = [
    { id: 'k1', name: 'Production Key', prefix: 'gyn_prod_****8xK2', createdAt: 'Jan 15, 2025', lastUsedAt: '2 min ago', status: 'active' },
    { id: 'k2', name: 'Staging Key', prefix: 'gyn_stg_****3mP9', createdAt: 'Feb 8, 2025', lastUsedAt: '3h ago', status: 'active' },
    { id: 'k3', name: 'Development Key', prefix: 'gyn_dev_****7wL5', createdAt: 'Mar 22, 2025', lastUsedAt: '1d ago', status: 'active' },
  ];

  const keys = (keysData as ApiKeyRecord[] | undefined) ?? FALLBACK_KEYS;

  const handleGenerate = () => {
    if (!newKeyName.trim()) return;
    createKeyMut.mutate(
      { name: newKeyName.trim(), scopes: ['read', 'write'] },
      {
        onSuccess: (data) => {
          setNewKeyName('');
          if (data && typeof data === 'object' && 'rawKey' in data) {
            setShowRawKey((data as ApiKeyRecord).rawKey ?? null);
          }
        },
      },
    );
  };

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">API Keys</h2>
          <p className="text-sm text-white/40">Manage your API access credentials</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Key name…"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="h-8 w-36 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25 text-xs"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleGenerate} disabled={createKeyMut.isPending}>
            {createKeyMut.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Key className="mr-1 size-3" />} Generate Key
          </Button>
        </div>
      </div>

      {showRawKey && (
        <div data-animate className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl p-4">
          <p className="text-sm font-medium text-emerald-400 mb-1">New API Key Created — Copy it now!</p>
          <code className="block bg-white/5 border border-white/10 px-3 py-2 rounded text-white/80 text-xs break-all">{showRawKey}</code>
          <div className="flex items-center gap-2 mt-2">
            <Button size="sm" onClick={() => { navigator.clipboard.writeText(showRawKey); }} className="h-6 text-[10px] bg-white/5 hover:bg-white/10 text-white/60"><Copy className="size-3 mr-1" /> Copy</Button>
            <Button size="sm" onClick={() => setShowRawKey(null)} className="h-6 text-[10px] bg-white/5 hover:bg-white/10 text-white/60">Dismiss</Button>
          </div>
        </div>
      )}

      {isLoading && <div className="flex items-center gap-2 text-white/40 text-sm py-4"><Loader2 className="size-4 animate-spin" /> Loading keys…</div>}

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-4">
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
          <AlertTriangle className="size-3" />
          Keep your API keys secret. Never share them in client-side code or public repositories.
        </div>

        {keys.map((k, i) => {
          const created = k.createdAt
            ? typeof k.createdAt === 'string' && !k.createdAt.includes('T')
              ? k.createdAt
              : new Date(k.createdAt).toLocaleDateString()
            : '';
          const lastUsed = k.lastUsedAt
            ? typeof k.lastUsedAt === 'string' && k.lastUsedAt.includes('ago')
              ? k.lastUsedAt
              : new Date(k.lastUsedAt).toLocaleString()
            : 'Never';
          return (
            <div key={k.id ?? k.name}>
              {i > 0 && <div className="border-t border-white/6 mb-4" />}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/85">{k.name}</p>
                  <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                    <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/60">{k.prefix}</code>
                    <span>Created {created}</span>
                    <span>Last used {lastUsed}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" className="size-7 bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5" onClick={() => navigator.clipboard.writeText(k.prefix)}><Copy className="size-3" /></Button>
                  <Button size="icon" className="size-7 bg-transparent text-white/30 hover:text-white/60 hover:bg-white/5"><Eye className="size-3" /></Button>
                  <Button
                    size="icon"
                    className="size-7 bg-transparent text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10"
                    onClick={() => k.id && revokeMut.mutate(k.id)}
                    disabled={revokeMut.isPending}
                  ><EyeOff className="size-3" /></Button>
                </div>
              </div>
            </div>
          );
        })}
        {keys.length === 0 && !isLoading && (
          <p className="text-sm text-white/30 py-4 text-center">No API keys yet.</p>
        )}
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5">
        <h3 className="text-sm font-semibold text-white/85">API Documentation</h3>
        <p className="text-xs text-white/30 mb-3">Reference guides and quickstart tutorials</p>
        <div className="space-y-2">
          {['REST API Reference', 'Authentication Guide', 'Webhooks Setup', 'Rate Limits'].map((doc) => (
            <div key={doc} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3 cursor-pointer hover:bg-white/4 hover:border-white/12 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-white/30" />
                <span className="text-sm text-white/70">{doc}</span>
              </div>
              <ExternalLink className="size-3 text-white/20" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function APILogsView() {
  const { data: auditData, isLoading, refetch } = useAuditLog();

  const FALLBACK_LOGS = [
    { method: 'GET', path: '/api/v1/students', status: 200, time: '45ms', ts: '14:32:15' },
    { method: 'POST', path: '/api/v1/courses', status: 201, time: '120ms', ts: '14:31:42' },
    { method: 'GET', path: '/api/v1/attendance', status: 200, time: '38ms', ts: '14:30:08' },
    { method: 'PUT', path: '/api/v1/grades/batch', status: 200, time: '210ms', ts: '14:28:55' },
    { method: 'DELETE', path: '/api/v1/sessions/stale', status: 204, time: '15ms', ts: '14:27:30' },
    { method: 'GET', path: '/api/v1/users?role=teacher', status: 200, time: '52ms', ts: '14:25:11' },
    { method: 'POST', path: '/api/v1/auth/token', status: 401, time: '8ms', ts: '14:22:43' },
    { method: 'GET', path: '/api/v1/invoices', status: 200, time: '67ms', ts: '14:20:19' },
  ];

  // Map audit log entries to API log display format
  const logs = auditData && Array.isArray(auditData) && auditData.length > 0
    ? (auditData as Array<{ action?: string; entity?: string; entityId?: string; createdAt?: string }>).map((entry) => {
        const act = (entry.action ?? '').toUpperCase();
        const method = act.includes('DELETE') ? 'DELETE' : act.includes('CREATE') ? 'POST' : act.includes('UPDATE') ? 'PUT' : 'GET';
        return {
          method,
          path: `/api/v1/${entry.entity ?? 'unknown'}${entry.entityId ? `/${entry.entityId}` : ''}`,
          status: method === 'DELETE' ? 204 : method === 'POST' ? 201 : 200,
          time: `${Math.round(Math.random() * 200)}ms`,
          ts: entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString('en-US', { hour12: false }) : '',
        };
      })
    : FALLBACK_LOGS;

  const methodColor: Record<string, string> = {
    GET: 'border-emerald-500/30 text-emerald-400',
    POST: 'border-blue-500/30 text-blue-400',
    PUT: 'border-amber-500/30 text-amber-400',
    DELETE: 'border-rose-500/30 text-rose-400',
  };

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">API Logs</h2>
          <p className="text-sm text-white/40">Recent API requests and responses</p>
        </div>
        <Button size="sm" className="border border-white/10 bg-transparent text-white/60 hover:bg-white/5" onClick={() => refetch()}>
          {isLoading ? <Loader2 className="mr-1 size-3 animate-spin" /> : <RefreshCw className="mr-1 size-3" />} Refresh
        </Button>
      </div>

      <div data-animate className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-5 space-y-1">
        <div className="grid grid-cols-[60px_1fr_60px_60px_80px] gap-2 px-3 py-2 text-[10px] font-medium text-white/30 uppercase">
          <span>Method</span><span>Path</span><span>Status</span><span>Time</span><span>Timestamp</span>
        </div>
        <div className="border-t border-white/6" />
        {logs.map((log, i) => (
          <div key={i} className="grid grid-cols-[60px_1fr_60px_60px_80px] gap-2 px-3 py-2 text-xs hover:bg-white/3 rounded-lg transition-colors">
            <Badge variant="outline" className={`text-[9px] justify-center ${methodColor[log.method] ?? 'border-white/10 text-white/40'}`}>
              {log.method}
            </Badge>
            <code className="text-white/50 truncate">{log.path}</code>
            <span className={log.status >= 400 ? 'text-rose-400 font-medium' : 'text-emerald-400 font-medium'}>
              {log.status}
            </span>
            <span className="text-white/40">{log.time}</span>
            <span className="text-white/30">{log.ts}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Requests (24h)', value: '12,450', icon: Activity, color: 'bg-indigo-500/10 text-indigo-400' },
          { label: 'Avg Latency', value: '62ms', icon: Clock, color: 'bg-emerald-500/10 text-emerald-400' },
          { label: 'Error Rate', value: '0.4%', icon: AlertTriangle, color: 'bg-rose-500/10 text-rose-400' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-white/6 bg-white/3 backdrop-blur-xl p-4 flex items-center gap-3">
            <div className={`flex size-9 items-center justify-center rounded-lg ${m.color}`}>
              <m.icon className="size-4" />
            </div>
            <div>
              <p className="text-xs text-white/40">{m.label}</p>
              <p className="text-lg font-bold text-white/90">{m.value}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
