/* ─── ProviderApiMgmtSection ─── API Keys · Webhooks · Rate Limits · Usage ─── */
import { BarChart3, Eye, EyeOff, Key, Loader2, PlusCircle, SlidersHorizontal, Webhook } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import { useProviderApiManagement, useGenerateProviderApiKey, useRotateProviderApiKey, useRevokeProviderApiKey, useCreateProviderWebhook, useUpdateProviderApiWebhook, useTestProviderApiWebhook, useUpdateProviderRateLimit } from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderApiMgmtSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'api_keys':        return <ApiKeysView />;
    case 'api_webhooks':    return <ApiWebhooksView />;
    case 'api_rate_limits': return <RateLimitsView />;
    case 'api_usage':       return <ApiUsageView />;
    default:                return <ApiKeysView />;
  }
}

/* ── API Keys ── */
function ApiKeysView() {
  const accent = getAccent('provider_api_mgmt');
  const { data: bundle, isLoading } = useProviderApiManagement();
  const [showKey, setShowKey] = useState<string | null>(null);
  const generateKey = useGenerateProviderApiKey();
  const rotateKey = useRotateProviderApiKey();
  const revokeKey = useRevokeProviderApiKey();
  const [showNew, setShowNew] = useState(false);
  const [kName, setKName] = useState('');
  const [kScopes, setKScopes] = useState('');

  const apiKeys = bundle?.apiKeys ?? [];
  const activeKeys = apiKeys.filter((k) => k.status === 'ACTIVE');

  const handleGenerate = () => {
    const reason = reasonPrompt('Generate API key');
    if (!reason) return;
    generateKey.mutate({ name: kName, scopes: kScopes.split(',').map((s) => s.trim()).filter(Boolean), reason }, { onSuccess: () => { setShowNew(false); setKName(''); setKScopes(''); } });
  };

  const handleRotate = (id: string) => {
    const reason = reasonPrompt('Rotate API key');
    if (!reason) return;
    rotateKey.mutate({ keyId: id, reason });
  };

  const handleRevoke = (id: string) => {
    const reason = reasonPrompt('Revoke API key');
    if (!reason) return;
    revokeKey.mutate({ keyId: id, reason });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Key} title="API Key Management" description="Create, rotate, and revoke API keys" accent={accent} actions={
        <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />Generate Key</Button>
      } />

      {showNew && (
        <Panel title="Generate New Key" accentBorder="border-cyan-500/20">
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={kName} onChange={(e) => setKName(e.target.value)} placeholder="Key name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={kScopes} onChange={(e) => setKScopes(e.target.value)} placeholder="Scopes (comma-sep: read, write)" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={handleGenerate} disabled={!kName.trim() || generateKey.isPending}>
              {generateKey.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Generate
            </Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Keys" value={String(apiKeys.length)} sub="All keys" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Active" value={String(activeKeys.length)} sub="In use" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Revoked" value={String(apiKeys.length - activeKeys.length)} sub="Disabled" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Scopes" value={String(new Set(apiKeys.flatMap((k) => k.scopes)).size)} sub="Unique permissions" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <Panel title="API Keys" subtitle={isLoading ? 'Loading…' : `${apiKeys.length} keys`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-cyan-400" /></div>
        ) : apiKeys.length === 0 ? (
          <EmptyState icon={Key} title="No API Keys" description="Generate your first API key." />
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <Row key={key.id} className={key.status !== 'ACTIVE' ? 'opacity-60' : ''}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{key.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-slate-300 bg-slate-700/60 rounded px-2 py-0.5 text-[10px]">
                        {showKey === key.id ? `gyn_${key.name.toLowerCase().replace(/\s/g, '_')}_full_key_here` : key.prefix}
                      </span>
                      <button className="text-slate-400 hover:text-slate-200" onClick={() => setShowKey(showKey === key.id ? null : key.id)}>
                        {showKey === key.id ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                      </button>
                    </div>
                    <p className="text-slate-400 mt-1">Created: {key.createdAt} · Last used: {new Date(key.lastUsed).toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {key.scopes.map((s) => (
                        <span key={s} className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] text-cyan-200 border border-cyan-500/30">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={key.status} />
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-cyan-500/30" onClick={() => handleRotate(key.id)} disabled={rotateKey.isPending}>
                      {rotateKey.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Rotate
                    </Button>
                    {key.status === 'ACTIVE' && (
                      <Button size="sm" className="h-6 text-[10px] bg-red-500/20 text-red-100 hover:bg-red-500/30" onClick={() => handleRevoke(key.id)} disabled={revokeKey.isPending}>
                        {revokeKey.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Revoke
                      </Button>
                    )}
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

/* ── Webhooks ── */
function ApiWebhooksView() {
  const accent = getAccent('provider_api_mgmt');
  const { data: bundle, isLoading } = useProviderApiManagement();
  const webhooks = bundle?.webhooks ?? [];
  const createWh = useCreateProviderWebhook();
  const updateWh = useUpdateProviderApiWebhook();
  const testWh = useTestProviderApiWebhook();
  const [showNew, setShowNew] = useState(false);
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Add webhook');
    if (!reason) return;
    createWh.mutate({ url: whUrl, events: whEvents.split(',').map((s) => s.trim()).filter(Boolean), reason }, { onSuccess: () => { setShowNew(false); setWhUrl(''); setWhEvents(''); } });
  };

  const handleUpdate = (id: string) => {
    const reason = reasonPrompt('Update webhook');
    if (!reason) return;
    updateWh.mutate({ webhookId: id, url: editUrl, reason }, { onSuccess: () => setEditId(null) });
  };

  const handleTest = (id: string) => {
    const reason = reasonPrompt('Test webhook');
    if (!reason) return;
    testWh.mutate({ webhookId: id });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={Webhook} title="Webhook Endpoints" description="Outgoing webhook configuration and monitoring" accent={accent} actions={
        <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />Add Webhook</Button>
      } />

      {showNew && (
        <Panel title="Add Webhook" accentBorder="border-cyan-500/20">
          <div className="grid gap-2 md:grid-cols-2">
            <Input value={whUrl} onChange={(e) => setWhUrl(e.target.value)} placeholder="https://api.example.com/webhook" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={whEvents} onChange={(e) => setWhEvents(e.target.value)} placeholder="Events (comma-sep)" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30" onClick={handleCreate} disabled={!whUrl.trim() || createWh.isPending}>
              {createWh.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Add
            </Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Endpoints" value={String(webhooks.length)} sub="Configured" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Active" value={String(webhooks.filter((w) => w.status === 'ACTIVE').length)} sub="Healthy" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Avg Success" value={webhooks.length > 0 ? `${Math.round(webhooks.reduce((s, w) => s + w.successRate, 0) / webhooks.length)}%` : '—'} sub="Delivery rate" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Events" value={String(webhooks.reduce((s, w) => s + w.events.length, 0))} sub="Subscribed" gradient="from-violet-500/10 to-violet-500/5" />
      </div>

      <Panel title="Webhook Endpoints" subtitle={isLoading ? 'Loading…' : `${webhooks.length} endpoints`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-cyan-400" /></div>
        ) : webhooks.length === 0 ? (
          <EmptyState icon={Webhook} title="No Webhooks" description="Configure your first webhook endpoint." />
        ) : (
          <div className="space-y-2">
            {webhooks.map((wh) => (
              <Row key={wh.id} className={wh.status === 'DEGRADED' ? 'border-amber-500/20' : ''}>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm text-slate-100">{wh.url}</p>
                      <p className="text-slate-400 mt-1">Last triggered: {new Date(wh.lastTriggered).toLocaleString()} · Success: {wh.successRate}%</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={wh.status} />
                      {editId === wh.id ? (
                        <>
                          <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="h-6 w-48 border-slate-500/40 bg-slate-700 text-[10px] text-slate-100" />
                          <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditId(null)}>Cancel</Button>
                          <Button size="sm" className="h-6 text-[10px] bg-cyan-500/20 text-cyan-100" onClick={() => handleUpdate(wh.id)} disabled={updateWh.isPending}>Save</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" className="h-6 text-[10px] border-cyan-500/30" onClick={() => { setEditId(wh.id); setEditUrl(wh.url); }}>Edit</Button>
                          <Button size="sm" variant="outline" className="h-6 text-[10px] border-cyan-500/30" onClick={() => handleTest(wh.id)} disabled={testWh.isPending}>
                            {testWh.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Test
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {wh.events.map((ev) => (
                      <span key={ev} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300 font-mono">{ev}</span>
                    ))}
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

/* ── Rate Limits ── */
function RateLimitsView() {
  const accent = getAccent('provider_api_mgmt');
  const { data: bundle, isLoading } = useProviderApiManagement();
  const limits = bundle?.rateLimits ?? [];
  const updateLimit = useUpdateProviderRateLimit();
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState('');

  const handleUpdate = (endpoint: string, method: string) => {
    const reason = reasonPrompt('Update rate limit');
    if (!reason) return;
    updateLimit.mutate({ endpoint, method, limit: editVal, burst: 0, reason }, { onSuccess: () => setEditIdx(null) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={SlidersHorizontal} title="Rate Limit Policies" description="API rate limiting configuration and current usage" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Endpoints" value={String(limits.length)} sub="Rate-limited" gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Warnings" value={String(limits.filter((l) => l.status === 'WARNING').length)} sub="Near limit" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Throttled" value={String(limits.filter((l) => l.status === 'THROTTLED').length)} sub="Currently blocked" gradient="from-red-500/10 to-red-500/5" />
      </div>

      <Panel title="Rate Limit Configuration" subtitle={isLoading ? 'Loading…' : `${limits.length} endpoint rules`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-cyan-400" /></div>
        ) : limits.length === 0 ? (
          <EmptyState icon={SlidersHorizontal} title="No Rate Limits" description="No rate limit policies configured." />
        ) : (
          <div className="space-y-1">
            <div className="hidden md:grid grid-cols-6 gap-3 rounded-lg bg-slate-800/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              <span className="col-span-2">Endpoint</span>
              <span>Method</span>
              <span>Limit</span>
              <span>Current</span>
              <span>Status</span>
            </div>
            {limits.map((lim, i) => (
              <div key={i} className={`grid grid-cols-1 md:grid-cols-6 gap-3 rounded-lg border px-3 py-2 text-xs ${lim.status === 'WARNING' ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-500/20 bg-slate-800/60'}`}>
                <span className="col-span-2 font-mono text-slate-100">{lim.endpoint}</span>
                <span className={`font-semibold ${lim.method === 'GET' ? 'text-emerald-300' : lim.method === 'POST' ? 'text-blue-300' : 'text-amber-300'}`}>{lim.method}</span>
                {editIdx === i ? (
                  <div className="flex items-center gap-1">
                    <Input value={editVal} onChange={(e) => setEditVal(e.target.value)} className="h-6 w-20 border-slate-500/40 bg-slate-700 text-[10px] text-slate-100" />
                    <Button size="sm" className="h-6 text-[10px] bg-cyan-500/20 text-cyan-100" onClick={() => handleUpdate(lim.endpoint, lim.method)} disabled={updateLimit.isPending}>✓</Button>
                    <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditIdx(null)}>✗</Button>
                  </div>
                ) : (
                  <span className="text-slate-300 cursor-pointer hover:text-cyan-300" onClick={() => { setEditIdx(i); setEditVal(lim.limit); }}>{lim.limit} ✎</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-slate-100">{lim.current}</span>
                  <div className="h-1.5 w-12 rounded-full bg-slate-700">
                    <div className={`h-full rounded-full ${lim.status === 'WARNING' ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${Math.min((lim.current / parseInt(lim.limit)) * 100, 100)}%` }} />
                  </div>
                </div>
                <StatusBadge status={lim.status === 'WARNING' ? 'WARNING' : 'ACTIVE'} />
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── API Usage ── */
function ApiUsageView() {
  const accent = getAccent('provider_api_mgmt');
  const { data: bundle, isLoading } = useProviderApiManagement();
  const dailyStats = bundle?.dailyStats ?? [];

  const totalRequests = dailyStats.reduce((s, d) => s + d.requests, 0);
  const totalErrors = dailyStats.reduce((s, d) => s + d.errors, 0);
  const avgLatency = dailyStats.length > 0 ? Math.round(dailyStats.reduce((s, d) => s + d.latencyP50, 0) / dailyStats.length) : 0;
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0';

  return (
    <SectionShell>
      <SectionPageHeader icon={BarChart3} title="API Usage Analytics" description="Request volume, error rates, and latency metrics" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total Requests" value={totalRequests.toLocaleString()} sub={`Last ${dailyStats.length} days`} gradient="from-cyan-500/10 to-cyan-500/5" />
        <StatCard label="Errors" value={totalErrors.toLocaleString()} sub={`${errorRate}% error rate`} gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Avg Latency" value={`${avgLatency}ms`} sub="P50 response time" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="P99 Latency" value={`${dailyStats[0]?.latencyP99 ?? 0}ms`} sub="Tail latency" gradient="from-amber-500/10 to-amber-500/5" />
      </div>

      <Panel title="Daily API Metrics" subtitle={isLoading ? 'Loading…' : `Last ${dailyStats.length} days`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-cyan-400" /></div>
        ) : dailyStats.length === 0 ? (
          <EmptyState icon={BarChart3} title="No Usage Data" description="No API usage data available yet." />
        ) : (
          <div className="space-y-1">
            <div className="hidden md:grid grid-cols-5 gap-3 rounded-lg bg-slate-800/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              <span>Date</span>
              <span>Requests</span>
              <span>Errors</span>
              <span>P50 Latency</span>
              <span>P99 Latency</span>
            </div>
            {dailyStats.map((day) => (
              <Row key={day.date}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <span className="font-semibold text-slate-100">{day.date}</span>
                  <span className="text-slate-300">{day.requests.toLocaleString()}</span>
                  <span className={day.errors > 60 ? 'text-amber-300' : 'text-slate-300'}>{day.errors}</span>
                  <span className="text-slate-300">{day.latencyP50}ms</span>
                  <span className={day.latencyP99 > 300 ? 'text-amber-300' : 'text-slate-300'}>{day.latencyP99}ms</span>
                </div>
              </Row>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
