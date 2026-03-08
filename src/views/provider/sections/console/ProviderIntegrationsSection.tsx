/* ─── ProviderIntegrationsSection ─── Connectors · Logs · Retries · Webhooks · OAuth ─── */
import { useState } from 'react';
import { AlertTriangle, Activity, Bot, Key, Loader2, PlusCircle, Webhook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderModuleData,
  useProviderApiManagement,
  useProviderOAuthApps,
  useCreateProviderConnector,
  useRetryProviderIntegration,
  useCreateProviderOAuthApp,
  useCreateProviderWebhook,
  useUpdateProviderIntegrationWebhook,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderIntegrationsSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'integrations_connectors': return <ConnectorsView />;
    case 'integrations_logs':       return <DeliveryLogsView />;
    case 'integrations_retries':    return <RetriesView />;
    case 'integrations_webhooks':   return <WebhooksView />;
    case 'integrations_oauth':      return <OAuthAppsView />;
    default: return <ConnectorsView />;
  }
}

function useIntegrationData() {
  const { data: moduleData } = useProviderModuleData();
  const integrations = (moduleData?.integrations ?? []) as Array<Record<string, unknown>>;
  const logs = (moduleData?.integrationLogs ?? []) as Array<Record<string, unknown>>;
  const connectedCount = integrations.filter((i) => i.status === 'CONNECTED').length;
  const failedLogs = logs.filter((l) => l.status === 'FAILED' || l.httpStatus === 500);
  const successRate = logs.length > 0 ? Math.round(((logs.length - failedLogs.length) / logs.length) * 100) : 100;
  return { integrations, logs, connectedCount, failedLogs, successRate };
}

/* ── Connectors ── */
function ConnectorsView() {
  const { integrations, logs, connectedCount, successRate } = useIntegrationData();
  const createConnector = useCreateProviderConnector();
  const accent = getAccent('provider_integrations');

  const [showNew, setShowNew] = useState(false);
  const [cName, setCName] = useState('');
  const [cType, setCType] = useState('WEBHOOK');
  const [cEndpoint, setCEndpoint] = useState('');

  return (
    <SectionShell>
      <SectionPageHeader icon={Bot} title="Connector Registry" description="Third-party integrations and webhooks" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />Add Connector
        </Button>
      } />

      {showNew && (
        <Panel title="Register New Connector" accentBorder="border-blue-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-4">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Connector name" value={cName} onChange={(e) => setCName(e.target.value)} />
            <select className="h-8 rounded-md border border-slate-700 bg-slate-800 px-2 text-xs text-slate-100" value={cType} onChange={(e) => setCType(e.target.value)}>
              <option value="WEBHOOK">Webhook</option>
              <option value="REST">REST API</option>
              <option value="GRAPHQL">GraphQL</option>
              <option value="SFTP">SFTP</option>
            </select>
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Endpoint URL" value={cEndpoint} onChange={(e) => setCEndpoint(e.target.value)} />
            <Button size="sm" className="h-8 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" disabled={createConnector.isPending} onClick={() => {
              if (!cName.trim() || !cEndpoint.trim()) return;
              const reason = reasonPrompt('Add connector');
              if (!reason) return;
              createConnector.mutate({ name: cName, type: cType, endpoint: cEndpoint, authType: 'API_KEY', reason });
              setShowNew(false); setCName(''); setCEndpoint('');
            }}>{createConnector.isPending ? 'Adding…' : 'Add'}</Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Integrations" value={String(integrations.length)} sub="Configured" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Connected" value={String(connectedCount)} sub="Healthy" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Delivery" value={String(logs.length)} sub="Recent events" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Success" value={`${successRate}%`} sub="Delivery rate" gradient={successRate >= 95 ? 'from-emerald-500/10 to-emerald-500/5' : 'from-amber-500/10 to-amber-500/5'} />
      </div>
      {integrations.length === 0 ? (
        <EmptyState icon={Bot} title="No Integrations" description="Configure connectors for third-party services" action={<Button size="sm" className="h-7 bg-blue-500/20 text-blue-100" onClick={() => setShowNew(true)}>Add Connector</Button>} />
      ) : (
        <Panel title="Connectors" subtitle={`${integrations.length} configured`}>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integ) => (
              <div key={String(integ.id)} className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`size-2.5 rounded-full ${integ.status === 'CONNECTED' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <p className="font-semibold text-slate-100">{String(integ.name ?? '')}</p>
                  </div>
                  <StatusBadge status={String(integ.status ?? '')} />
                </div>
                <p className="text-[10px] text-slate-400">{String(integ.type ?? integ.provider ?? '—')}</p>
                {integ.endpoint != null && <p className="mt-1 truncate rounded bg-slate-700/60 px-2 py-0.5 text-[10px] font-mono text-slate-300">{String(integ.endpoint)}</p>}
                {integ.lastSyncedAt != null && <p className="mt-1 text-[10px] text-slate-400">Last sync: {new Date(String(integ.lastSyncedAt)).toLocaleString()}</p>}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Delivery Logs ── */
function DeliveryLogsView() {
  const { logs } = useIntegrationData();
  const accent = getAccent('provider_integrations');
  return (
    <SectionShell>
      <SectionPageHeader icon={Activity} title="Delivery Logs" description="Recent webhook and sync events" accent={accent} />
      {logs.length === 0 ? (
        <EmptyState icon={Activity} title="No Delivery Logs" description="Webhook events will appear here" />
      ) : (
        <Panel title="Event Log" subtitle={`${logs.length} events`}>
          <div className="space-y-2">
            {logs.slice(0, 30).map((log) => (
              <Row key={String(log.id)}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-100">{String(log.integrationName ?? log.integrationId ?? '—')}</span>
                    <span className="ml-2 text-slate-400">{String(log.event ?? log.action ?? '—')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.httpStatus != null && (
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${Number(log.httpStatus) < 400 ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                        {String(log.httpStatus)}
                      </span>
                    )}
                    <StatusBadge status={String(log.status ?? '')} />
                    <span className="text-[10px] text-slate-400">{log.createdAt ? new Date(String(log.createdAt)).toLocaleString() : '—'}</span>
                  </div>
                </div>
              </Row>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ── Retries ── */
function RetriesView() {
  const { logs, failedLogs } = useIntegrationData();
  const retryIntegration = useRetryProviderIntegration();
  const accent = getAccent('provider_integrations');
  return (
    <SectionShell>
      <SectionPageHeader icon={AlertTriangle} title="Failed Deliveries & Retries" description="Manage failed webhook deliveries" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Failed" value={String(failedLogs.length)} sub="Delivery failures" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Total Events" value={String(logs.length)} sub="All deliveries" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Failure Rate" value={logs.length > 0 ? `${Math.round((failedLogs.length / logs.length) * 100)}%` : '0%'} sub="Of total" gradient="from-amber-500/10 to-amber-500/5" />
      </div>
      {failedLogs.length === 0 ? (
        <EmptyState icon={AlertTriangle} title="No Failed Deliveries" description="All webhook deliveries are succeeding" />
      ) : (
        <Panel title="Failed Events" subtitle={`${failedLogs.length} failures`} accentBorder="border-red-500/20">
          <div className="space-y-2">
            {failedLogs.map((log) => (
              <div key={String(log.id)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-red-500/15 bg-red-500/5 px-3 py-2 text-xs">
                <div>
                  <p className="font-semibold text-slate-100">{String(log.integrationName ?? log.integrationId ?? '—')}</p>
                  <p className="text-red-300">{String(log.event ?? log.action ?? '—')} · HTTP {String(log.httpStatus ?? '500')}</p>
                </div>
                <Button size="sm" className="h-6 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 text-[10px] shrink-0" disabled={retryIntegration.isPending} onClick={() => {
                  const reason = reasonPrompt('Retry delivery');
                  if (!reason) return;
                  retryIntegration.mutate({ logId: String(log.id), reason });
                }}>{retryIntegration.isPending ? 'Retrying…' : 'Retry'}</Button>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Webhooks Management                                  */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function WebhooksView() {
  const accent = getAccent('provider_integrations');
  const { data: bundle, isLoading } = useProviderApiManagement();
  const createWebhook = useCreateProviderWebhook();
  const updateWh = useUpdateProviderIntegrationWebhook();
  const webhooks = bundle?.webhooks ?? [];

  const [showNew, setShowNew] = useState(false);
  const [whUrl, setWhUrl] = useState('');
  const [whEvents, setWhEvents] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState('');

  return (
    <SectionShell>
      <SectionPageHeader icon={Webhook} title="Webhook Endpoints" description="Outgoing event subscriptions and delivery management" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew((p) => !p)}>+ Add Webhook</Button>
      } />

      {showNew && (
        <Panel title="Register Webhook" accentBorder="border-blue-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Webhook URL" value={whUrl} onChange={(e) => setWhUrl(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Events (comma-sep)" value={whEvents} onChange={(e) => setWhEvents(e.target.value)} />
            <Button size="sm" className="h-8 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" disabled={createWebhook.isPending} onClick={() => {
              if (!whUrl.trim()) return;
              const reason = reasonPrompt('Add webhook');
              if (!reason) return;
              createWebhook.mutate({ url: whUrl, events: whEvents.split(',').map((e) => e.trim()).filter(Boolean), reason });
              setShowNew(false); setWhUrl(''); setWhEvents('');
            }}>{createWebhook.isPending ? 'Adding…' : 'Add'}</Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Webhooks" value={String(webhooks.length)} sub="Configured" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(webhooks.filter((w) => w.status === 'ACTIVE').length)} sub="Receiving events" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Avg Success" value={`${(webhooks.reduce((s, w) => s + w.successRate, 0) / webhooks.length).toFixed(1)}%`} sub="Delivery rate" gradient="from-blue-500/10 to-blue-500/5" />
      </div>
      <Panel title="Webhook Endpoints" subtitle={`${webhooks.length} endpoints`} accentBorder="border-blue-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-pink-400" /></div>
        ) : webhooks.length === 0 ? (
          <EmptyState icon={Webhook} title="No Webhooks" description="Configure webhook endpoints to receive event notifications." />
        ) : (
        <div className="space-y-2">
          {webhooks.map((wh) => (
            <div key={wh.id} className={`rounded-lg border px-3 py-2 text-xs ${wh.status === 'ACTIVE' ? 'border-slate-500/20 bg-slate-800/60' : 'border-slate-700/40 bg-slate-800/30 opacity-60'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-slate-100">{wh.url}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {wh.events.map((evt) => (
                      <span key={evt} className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300">{evt}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`font-mono ${wh.successRate >= 95 ? 'text-emerald-300' : 'text-amber-300'}`}>{wh.successRate}%</span>
                  <StatusBadge status={wh.status} />
                  {editId === wh.id ? (
                    <>
                      <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="h-6 w-48 border-slate-500/40 bg-slate-700 text-[10px] text-slate-100" />
                      <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditId(null)}>Cancel</Button>
                      <Button size="sm" className="h-6 text-[10px] bg-blue-500/20 text-blue-100" onClick={() => {
                        const reason = reasonPrompt('Update webhook URL');
                        if (!reason) return;
                        updateWh.mutate({ webhookId: wh.id, url: editUrl, reason }, { onSuccess: () => setEditId(null) });
                      }} disabled={updateWh.isPending}>
                        {updateWh.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Save
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" className="h-6 text-[10px] border-blue-500/30" onClick={() => { setEditId(wh.id); setEditUrl(wh.url); }}>Edit</Button>
                  )}
                </div>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">Last triggered: {new Date(wh.lastTriggered).toLocaleString()}</p>
            </div>
          ))}
        </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: OAuth Apps                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function OAuthAppsView() {
  const accent = getAccent('provider_integrations');
  const { data: apps, isLoading } = useProviderOAuthApps();
  const createApp = useCreateProviderOAuthApp();
  const oauthApps = apps ?? [];

  const [showNew, setShowNew] = useState(false);
  const [appName, setAppName] = useState('');
  const [appRedirects, setAppRedirects] = useState('');
  const [appScopes, setAppScopes] = useState('');
  const [manageId, setManageId] = useState<string | null>(null);

  return (
    <SectionShell>
      <SectionPageHeader icon={Key} title="OAuth Applications" description="Registered OAuth2 clients and API credentials" accent={accent} actions={
        <Button size="sm" className="h-7 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" onClick={() => setShowNew((p) => !p)}>+ Register App</Button>
      } />

      {showNew && (
        <Panel title="Register OAuth Application" accentBorder="border-blue-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-4">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="App name" value={appName} onChange={(e) => setAppName(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Redirect URIs (comma-sep)" value={appRedirects} onChange={(e) => setAppRedirects(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Scopes (comma-sep)" value={appScopes} onChange={(e) => setAppScopes(e.target.value)} />
            <Button size="sm" className="h-8 bg-blue-500/20 text-blue-100 hover:bg-blue-500/30" disabled={createApp.isPending} onClick={() => {
              if (!appName.trim()) return;
              const reason = reasonPrompt('Register OAuth app');
              if (!reason) return;
              createApp.mutate({ name: appName, redirectUris: appRedirects.split(',').map((u) => u.trim()).filter(Boolean), scopes: appScopes.split(',').map((s) => s.trim()).filter(Boolean), reason });
              setShowNew(false); setAppName(''); setAppRedirects(''); setAppScopes('');
            }}>{createApp.isPending ? 'Registering…' : 'Register'}</Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Apps" value={String(oauthApps.length)} sub="Registered" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Active" value={String(oauthApps.filter((a) => a.status === 'ACTIVE').length)} sub="With valid creds" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Revoked" value={String(oauthApps.filter((a) => a.status === 'REVOKED').length)} sub="Disabled" gradient="from-red-500/10 to-red-500/5" />
      </div>
      <Panel title="Registered Applications" subtitle={`${oauthApps.length} apps`} accentBorder="border-blue-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-pink-400" /></div>
        ) : oauthApps.length === 0 ? (
          <EmptyState icon={Key} title="No OAuth Apps" description="Register OAuth applications to enable API access." />
        ) : (
        <div className="space-y-2">
          {oauthApps.map((app) => (
            <div key={app.id} className={`rounded-lg border px-3 py-3 text-xs ${app.status === 'ACTIVE' ? 'border-slate-500/20 bg-slate-800/60' : 'border-red-500/15 bg-red-500/5 opacity-60'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-100">{app.name}</p>
                  <p className="font-mono text-[10px] text-slate-400 mt-0.5">Client ID: {app.clientId}</p>
                  <p className="text-[10px] text-slate-400">Redirects: {app.redirectUris.join(', ')}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={app.status} />
                  <Button size="sm" variant="outline" className="h-6 text-[10px] border-blue-500/30" onClick={() => setManageId(manageId === app.id ? null : app.id)}>
                    {manageId === app.id ? 'Close' : 'Manage'}
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {app.scopes.map((scope) => (
                  <span key={scope} className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] text-blue-300 border border-blue-500/20">{scope}</span>
                ))}
                <span className="text-[10px] text-slate-400 ml-2">Created: {app.createdAt}</span>
                {app.requestCount != null && <span className="text-[10px] text-slate-400 ml-2">Requests: {app.requestCount}</span>}
              </div>
              {manageId === app.id && (
                <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
                  <div className="grid gap-2 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Client ID</span>
                      <span className="font-mono text-slate-100">{app.clientId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Redirect URIs</span>
                      <span className="text-slate-100">{app.redirectUris.join(', ') || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Scopes</span>
                      <span className="text-slate-100">{app.scopes.join(', ') || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status</span>
                      <StatusBadge status={app.status} />
                    </div>
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
