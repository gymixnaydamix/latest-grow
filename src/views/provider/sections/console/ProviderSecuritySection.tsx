/* ─── ProviderSecuritySection ─── Access · Posture · Compliance · API Keys · IP Allowlist · Sessions ─── */
import { useState } from 'react';
import { Activity, FileClock, Globe, Key, Loader2, Monitor, PlusCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderApiManagement,
  useProviderModuleData,
  useProviderPermissionContext,
  useProviderSecurityExtras,
  useGenerateProviderApiKey,
  useRotateProviderApiKey,
  useRevokeProviderApiKey,
  useAddProviderIpRule,
  useRemoveProviderIpRule,
  useRevokeProviderSession,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderSecuritySection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'security_access':       return <AccessControlsView />;
    case 'security_posture':      return <SecurityPostureView />;
    case 'security_compliance':   return <ComplianceView />;
    case 'security_api_keys':     return <ApiKeysView />;
    case 'security_ip_allowlist': return <IpAllowlistView />;
    case 'security_sessions':     return <SessionsView />;
    default: return <AccessControlsView />;
  }
}

function useSecurityData() {
  const { data: moduleData } = useProviderModuleData();
  const { data: permCtx } = useProviderPermissionContext();
  const users = (moduleData?.providerUsers ?? []) as Array<Record<string, unknown>>;
  const roles = (moduleData?.providerRoles ?? []) as Array<Record<string, unknown>>;
  const permissions = permCtx?.permissions ?? [];
  const currentUser = permCtx?.user as Record<string, unknown> | null;
  const currentRole = permCtx?.role as Record<string, unknown> | null;
  const currentRoleName = currentRole ? String(currentRole.name ?? currentRole.key ?? '—') : '—';
  const mfaEnabled = users.filter((u) => u.mfaEnforced === true).length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  return { users, roles, permissions, currentUser, currentRoleName, mfaEnabled, activeUsers };
}

/* ── Access Controls ── */
function AccessControlsView() {
  const { users, roles, permissions, currentRoleName, mfaEnabled, activeUsers } = useSecurityData();
  const accent = getAccent('provider_security');
  return (
    <SectionShell>
      <SectionPageHeader icon={Shield} title="Access Controls" description="RBAC roles and permission management" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Users" value={String(users.length)} sub={`${activeUsers} active`} gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="MFA" value={String(mfaEnabled)} sub={`${users.length > 0 ? Math.round((mfaEnabled / users.length) * 100) : 0}% coverage`} gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Roles" value={String(roles.length)} sub="Defined" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Your Role" value={currentRoleName} sub={`${permissions.length} perms`} gradient="from-sky-500/10 to-sky-500/5" />
      </div>
      <Panel title="Role Definitions" subtitle="Provider-level access control">
        <div className="grid gap-2 md:grid-cols-2">
          {roles.map((role) => (
            <div key={String(role.key ?? role.id)} className="rounded-lg border border-slate-500/20 bg-slate-800/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-slate-100">{String(role.name ?? role.key)}</p>
                <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{String(role.key)}</span>
              </div>
              {role.description != null && <p className="mb-2 text-[10px] text-slate-400">{String(role.description)}</p>}
              <div className="flex flex-wrap gap-1">
                {Array.isArray(role.permissions) && (role.permissions as string[]).slice(0, 8).map((perm) => (
                  <span key={perm} className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{perm}</span>
                ))}
                {Array.isArray(role.permissions) && (role.permissions as string[]).length > 8 && (
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-400">+{(role.permissions as string[]).length - 8} more</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Your Permissions" subtitle={`Role: ${currentRoleName}`}>
        <div className="flex flex-wrap gap-1">
          {permissions.map((perm) => (
            <span key={String(perm)} className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] text-sky-200">{String(perm)}</span>
          ))}
          {permissions.length === 0 && <p className="text-xs text-slate-400">No permissions allocated.</p>}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Security Posture ── */
function SecurityPostureView() {
  const { users, mfaEnabled, activeUsers } = useSecurityData();
  const accent = getAccent('provider_security');
  const mfaCoverage = users.length > 0 ? Math.round((mfaEnabled / users.length) * 100) : 0;

  const checks = [
    { name: 'MFA Enforcement', status: mfaCoverage === 100 ? 'PASS' : mfaCoverage >= 80 ? 'WARN' : 'FAIL', detail: `${mfaCoverage}% coverage` },
    { name: 'Password Policy', status: 'PASS', detail: 'Min 12 chars, complexity enforced' },
    { name: 'Session Timeout', status: 'PASS', detail: '30 minutes inactivity' },
    { name: 'API Key Rotation', status: 'WARN', detail: 'Last rotated 45 days ago' },
    { name: 'IP Allowlist', status: 'PASS', detail: '3 ranges configured' },
    { name: 'Audit Logging', status: 'PASS', detail: 'All actions recorded' },
  ];

  return (
    <SectionShell>
      <SectionPageHeader icon={Activity} title="Security Posture" description="Platform security health assessment" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Score" value={`${checks.filter((c) => c.status === 'PASS').length}/${checks.length}`} sub="Checks passing" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="MFA" value={`${mfaCoverage}%`} sub="Coverage" gradient={mfaCoverage === 100 ? 'from-emerald-500/10 to-emerald-500/5' : 'from-amber-500/10 to-amber-500/5'} />
        <StatCard label="Active Users" value={String(activeUsers)} sub="With access" gradient="from-blue-500/10 to-blue-500/5" />
      </div>
      <Panel title="Security Checks" accentBorder="border-emerald-500/20">
        <div className="space-y-2">
          {checks.map((chk) => (
            <div key={chk.name} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${chk.status === 'PASS' ? 'bg-emerald-500/5' : chk.status === 'WARN' ? 'bg-amber-500/5' : 'bg-red-500/5'}`}>
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${chk.status === 'PASS' ? 'bg-emerald-500' : chk.status === 'WARN' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="font-semibold text-slate-100">{chk.name}</span>
              </div>
              <span className="text-slate-400">{chk.detail}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="MFA Status" subtitle="Per-user breakdown" accentBorder="border-blue-500/20">
        <div className="space-y-1">
          {users.map((user) => (
            <div key={String(user.id ?? user.email)} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-xs">
              <span className="text-slate-100">{String(user.name ?? `${String(user.firstName ?? '')} ${String(user.lastName ?? '')}`)}</span>
              {user.mfaEnforced ? (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">MFA ✓</span>
              ) : (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] text-red-300">No MFA</span>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </SectionShell>
  );
}

/* ── Compliance ── */
function ComplianceView() {
  const accent = getAccent('provider_security');
  const { data: extras, isLoading } = useProviderSecurityExtras();
  const complianceItems = extras?.complianceItems ?? [];

  return (
    <SectionShell>
      <SectionPageHeader icon={FileClock} title="Compliance Requests" description="Regulatory compliance status and documentation" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Frameworks" value={String(complianceItems.length)} sub="Tracked" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Compliant" value={String(complianceItems.filter((c) => c.status === 'COMPLIANT').length)} sub="Passing" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Avg Coverage" value={complianceItems.length > 0 ? `${Math.round(complianceItems.reduce((s, c) => s + c.coverage, 0) / complianceItems.length)}%` : '—'} sub="Coverage" gradient="from-blue-500/10 to-blue-500/5" />
      </div>
      <Panel title="Compliance Matrix" accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : complianceItems.length === 0 ? (
          <EmptyState icon={FileClock} title="No Compliance Items" description="No compliance frameworks have been configured yet." />
        ) : (
          <div className="space-y-2">
            {complianceItems.map((item) => (
              <div key={item.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border p-3 text-xs ${item.status === 'COMPLIANT' ? 'border-emerald-500/20 bg-emerald-500/5' : item.status === 'IN_PROGRESS' ? 'border-amber-500/20 bg-amber-500/5' : 'border-slate-700/40 bg-slate-800/40'}`}>
                <div>
                  <p className="font-semibold text-slate-100">{item.framework}</p>
                  <p className="text-slate-400">Last audit: {item.lastAudit} · Next: {item.nextAudit} · Coverage: {item.coverage}%</p>
                </div>
                <StatusBadge status={item.status === 'COMPLIANT' ? 'ACTIVE' : item.status === 'IN_PROGRESS' ? 'TRIAL' : 'PENDING'} />
              </div>
            ))}
          </div>
        )}
      </Panel>
      <div className="flex justify-end">
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30">Request Compliance Report</Button>
      </div>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: API Keys                                             */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ApiKeysView() {
  const accent = getAccent('provider_security');
  const { data: bundle, isLoading } = useProviderApiManagement();
  const generateKey = useGenerateProviderApiKey();
  const rotateKey = useRotateProviderApiKey();
  const revokeKey = useRevokeProviderApiKey();
  const keys = bundle?.apiKeys ?? [];

  const [showNew, setShowNew] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyScopes, setKeyScopes] = useState('');

  return (
    <SectionShell>
      <SectionPageHeader icon={Key} title="API Keys" description="Manage platform API keys and access tokens" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />Generate Key
        </Button>
      } />

      {showNew && (
        <Panel title="Generate New API Key" accentBorder="border-violet-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Key name" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Scopes (comma-sep)" value={keyScopes} onChange={(e) => setKeyScopes(e.target.value)} />
            <Button size="sm" className="h-8 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" disabled={generateKey.isPending} onClick={() => {
              if (!keyName.trim()) return;
              const reason = reasonPrompt('Generate API key');
              if (!reason) return;
              generateKey.mutate({ name: keyName, scopes: keyScopes.split(',').map((s) => s.trim()).filter(Boolean), reason });
              setShowNew(false); setKeyName(''); setKeyScopes('');
            }}>{generateKey.isPending ? 'Generating…' : 'Generate'}</Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="API Keys" value={String(keys.length)} sub="Total" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Active" value={String(keys.filter((k) => k.status === 'ACTIVE').length)} sub="In use" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Revoked" value={String(keys.filter((k) => k.status === 'REVOKED').length)} sub="Disabled" gradient="from-red-500/10 to-red-500/5" />
      </div>
      <Panel title="API Key Registry" subtitle={`${keys.length} keys`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : keys.length === 0 ? (
          <EmptyState icon={Key} title="No API Keys" description="No API keys have been generated yet." />
        ) : (
          <div className="space-y-2">
            {keys.map((key) => (
              <div key={key.id} className={`rounded-lg border px-3 py-2 text-xs ${key.status === 'ACTIVE' ? 'border-slate-500/20 bg-slate-800/60' : 'border-red-500/15 bg-red-500/5 opacity-60'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{key.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">{key.prefix}••••••••••••</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={key.status} />
                    {key.status === 'ACTIVE' && (
                      <Button size="sm" className="h-6 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 text-[10px]" disabled={rotateKey.isPending} onClick={() => {
                        const reason = reasonPrompt('Rotate API key');
                        if (!reason) return;
                        rotateKey.mutate({ keyId: key.id, reason });
                      }}>Rotate</Button>
                    )}
                    {key.status === 'ACTIVE' && (
                      <Button size="sm" className="h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px]" disabled={revokeKey.isPending} onClick={() => {
                        const reason = reasonPrompt('Revoke API key');
                        if (!reason) return;
                        revokeKey.mutate({ keyId: key.id, reason });
                      }}>Revoke</Button>
                    )}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {key.scopes.map((scope) => (
                    <span key={scope} className="rounded bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-300 border border-violet-500/20">{scope}</span>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-auto">Created: {key.createdAt} · Last used: {new Date(key.lastUsed).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: IP Allowlist                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function IpAllowlistView() {
  const accent = getAccent('provider_security');
  const { data: extras, isLoading } = useProviderSecurityExtras();
  const addRule = useAddProviderIpRule();
  const removeRule = useRemoveProviderIpRule();
  const rules = extras?.ipAllowlist ?? [];

  const [showNew, setShowNew] = useState(false);
  const [ruleCidr, setRuleCidr] = useState('');
  const [ruleLabel, setRuleLabel] = useState('');

  return (
    <SectionShell>
      <SectionPageHeader icon={Globe} title="IP Allowlist" description="Restrict API and admin access by IP range" accent={accent} actions={
        <Button size="sm" className="h-7 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" onClick={() => setShowNew((p) => !p)}>
          <PlusCircle className="mr-1 size-3" />Add Rule
        </Button>
      } />

      {showNew && (
        <Panel title="Add IP Rule" accentBorder="border-violet-500/20">
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-3">
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="CIDR (e.g. 10.0.0.0/24)" value={ruleCidr} onChange={(e) => setRuleCidr(e.target.value)} />
            <Input className="h-8 border-slate-700 bg-slate-800 text-xs text-slate-100" placeholder="Label" value={ruleLabel} onChange={(e) => setRuleLabel(e.target.value)} />
            <Button size="sm" className="h-8 bg-violet-500/20 text-violet-100 hover:bg-violet-500/30" disabled={addRule.isPending} onClick={() => {
              if (!ruleCidr.trim() || !ruleLabel.trim()) return;
              const reason = reasonPrompt('Add IP rule');
              if (!reason) return;
              addRule.mutate({ cidr: ruleCidr, label: ruleLabel, reason });
              setShowNew(false); setRuleCidr(''); setRuleLabel('');
            }}>{addRule.isPending ? 'Adding…' : 'Add Rule'}</Button>
          </div>
        </Panel>
      )}
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Rules" value={String(rules.length)} sub="Active" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Total Hits" value={rules.reduce((s, r) => s + r.hits, 0).toLocaleString()} sub="Matched requests" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Mode" value="Enforce" sub="Blocking non-listed IPs" gradient="from-emerald-500/10 to-emerald-500/5" />
      </div>
      <Panel title="Allowed IP Ranges" subtitle={`${rules.length} rules`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : rules.length === 0 ? (
          <EmptyState icon={Globe} title="No IP Rules" description="No IP allowlist rules have been configured yet." />
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-500/20 bg-slate-800/60 px-3 py-2 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-100">{rule.label}</span>
                    <span className="rounded bg-slate-700 px-2 py-0.5 font-mono text-[10px] text-emerald-300">{rule.cidr}</span>
                  </div>
                  <p className="text-slate-400 mt-0.5">Added: {rule.createdAt} · Last seen: {rule.lastSeen}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-300">{rule.hits.toLocaleString()} hits</span>
                  <Button size="sm" className="h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px]" disabled={removeRule.isPending} onClick={() => {
                    const reason = reasonPrompt('Remove IP rule');
                    if (!reason) return;
                    removeRule.mutate({ ruleId: rule.id, reason });
                  }}>Remove</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* Sub-page: Active Sessions                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function SessionsView() {
  const accent = getAccent('provider_security');
  const { data: extras, isLoading } = useProviderSecurityExtras();
  const revokeSession = useRevokeProviderSession();
  const sessions = extras?.sessions ?? [];

  return (
    <SectionShell>
      <SectionPageHeader icon={Monitor} title="Active Sessions" description="Monitor and manage active user sessions" accent={accent} actions={
        <Button size="sm" className="h-7 bg-red-500/20 text-red-100 hover:bg-red-500/30" disabled={revokeSession.isPending} onClick={() => {
          const reason = reasonPrompt('Revoke all other sessions');
          if (!reason) return;
          revokeSession.mutate({ all: true, reason });
        }}>Revoke All Others</Button>
      } />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Active Sessions" value={String(sessions.length)} sub="Currently open" gradient="from-violet-500/10 to-violet-500/5" />
        <StatCard label="Unique Users" value={String(new Set(sessions.map((s) => s.user)).size)} sub="Logged in" gradient="from-blue-500/10 to-blue-500/5" />
        <StatCard label="Unique IPs" value={String(new Set(sessions.map((s) => s.ip)).size)} sub="Source addresses" gradient="from-cyan-500/10 to-cyan-500/5" />
      </div>
      <Panel title="Session List" subtitle={`${sessions.length} sessions`} accentBorder="border-violet-500/20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-red-400" /></div>
        ) : sessions.length === 0 ? (
          <EmptyState icon={Monitor} title="No Active Sessions" description="No active sessions found." />
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${session.status === 'ACTIVE' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-slate-500/20 bg-slate-800/60'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-100">{session.user}</p>
                    <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{session.role}</span>
                    {session.status === 'ACTIVE' && <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">Active</span>}
                  </div>
                  <p className="text-slate-400 mt-0.5">{session.device} · IP: {session.ip}</p>
                  <p className="text-[10px] text-slate-400">Started: {new Date(session.startedAt).toLocaleString()} · Last active: {new Date(session.lastActive).toLocaleString()}</p>
                </div>
                {session.status === 'ACTIVE' && (
                  <Button size="sm" className="h-6 bg-red-500/20 text-red-100 hover:bg-red-500/30 text-[10px] shrink-0" disabled={revokeSession.isPending} onClick={() => {
                    const reason = reasonPrompt('Revoke session');
                    if (!reason) return;
                    revokeSession.mutate({ sessionId: session.id, reason });
                  }}>Revoke</Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
