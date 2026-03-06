/* ─── ProviderNotificationsSection ─── Inbox · Rules · History ─── */
import { Bell, Check, SlidersHorizontal, FileClock, Loader2, PlusCircle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigationStore } from '@/store/navigation.store';
import {
  useProviderNotifications,
  useMarkProviderNotificationRead,
  useCreateProviderNotificationRule,
  useUpdateProviderNotificationRule,
} from '@/hooks/api/use-provider-console';
import { EmptyState, Panel, SectionPageHeader, SectionShell, StatCard, StatusBadge, Row, getAccent, reasonPrompt } from './shared';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function ProviderNotificationsSection() {
  const { activeHeader } = useNavigationStore();
  switch (activeHeader) {
    case 'notifications_inbox':   return <NotifInboxView />;
    case 'notifications_rules':   return <NotifRulesView />;
    case 'notifications_history': return <NotifHistoryView />;
    default:                      return <NotifInboxView />;
  }
}

const priorityColors: Record<string, string> = {
  URGENT: 'border-red-500/20 bg-red-500/5',
  HIGH: 'border-amber-500/20 bg-amber-500/5',
  NORMAL: 'border-slate-500/20 bg-slate-800/60',
  LOW: 'border-slate-500/15 bg-slate-800/40',
};

/* ── Inbox ── */
function NotifInboxView() {
  const accent = getAccent('provider_notifications');
  const { data: bundle, isLoading } = useProviderNotifications();
  const markRead = useMarkProviderNotificationRead();
  const [filter, setFilter] = useState<string>('');

  const notifications = bundle?.notifications ?? [];
  const filtered = useMemo(
    () => (filter ? notifications.filter((n) => n.category === filter) : notifications),
    [notifications, filter],
  );
  const unread = notifications.filter((n) => !n.read);
  const categories = useMemo(() => [...new Set(notifications.map((n) => n.category))], [notifications]);

  const handleMarkRead = (id: string) => markRead.mutate({ notificationId: id });
  const handleMarkAllRead = () => markRead.mutate({ all: true });

  return (
    <SectionShell>
      <SectionPageHeader icon={Bell} title="Notification Inbox" description="Provider-level alerts and system notifications" accent={accent} actions={
        <div className="flex gap-2">
          <select className="h-7 rounded-md border border-amber-500/30 bg-slate-800 px-2 text-xs text-slate-100" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={handleMarkAllRead} disabled={markRead.isPending}>
            {markRead.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : <Check className="mr-1 size-3" />}Mark all read
          </Button>
        </div>
      } />

      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        <StatCard label="Total" value={String(notifications.length)} sub="All notifications" gradient="from-amber-500/10 to-amber-500/5" />
        <StatCard label="Unread" value={String(unread.length)} sub="Needs attention" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Urgent" value={String(notifications.filter((n) => n.priority === 'URGENT').length)} sub="Immediate action" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Categories" value={String(categories.length)} sub="Event types" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      <Panel title="Notifications" subtitle={isLoading ? 'Loading…' : `${filtered.length} items`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-amber-400" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((notif) => (
              <div key={notif.id} className={`rounded-lg border px-3 py-2 text-xs ${priorityColors[notif.priority] ?? priorityColors.NORMAL} ${!notif.read ? 'ring-1 ring-amber-500/20' : 'opacity-75'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      {!notif.read && <span className="size-2 rounded-full bg-amber-500 animate-pulse" />}
                      <p className="font-semibold text-slate-100">{notif.title}</p>
                    </div>
                    <p className="text-slate-400 mt-0.5">{notif.body}</p>
                    <p className="text-slate-500 mt-1">{notif.category} · {new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={notif.priority === 'URGENT' ? 'FAILED' : notif.priority === 'HIGH' ? 'WARNING' : 'ACTIVE'} />
                    {!notif.read && (
                      <Button size="sm" className="h-6 text-[10px] bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30" onClick={() => handleMarkRead(notif.id)} disabled={markRead.isPending}>
                        <Check className="mr-1 size-3" />Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <EmptyState icon={Bell} title="No Notifications" description="You're all caught up!" />}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── Rules ── */
function NotifRulesView() {
  const accent = getAccent('provider_notifications');
  const { data: bundle, isLoading } = useProviderNotifications();
  const rules = bundle?.rules ?? [];
  const createRule = useCreateProviderNotificationRule();
  const updateRule = useUpdateProviderNotificationRule();
  const [showNew, setShowNew] = useState(false);
  const [rName, setRName] = useState('');
  const [rEvent, setREvent] = useState('');
  const [rChannel, setRChannel] = useState('EMAIL');
  const [editId, setEditId] = useState<string | null>(null);
  const [editEnabled, setEditEnabled] = useState(true);
  const [editChannel, setEditChannel] = useState('');

  const handleCreate = () => {
    const reason = reasonPrompt('Create notification rule');
    if (!reason) return;
    createRule.mutate({ name: rName, event: rEvent, channel: rChannel, enabled: true, reason }, { onSuccess: () => { setShowNew(false); setRName(''); setREvent(''); } });
  };

  const handleUpdate = (id: string) => {
    const reason = reasonPrompt('Update notification rule');
    if (!reason) return;
    updateRule.mutate({ ruleId: id, enabled: editEnabled, channel: editChannel, reason }, { onSuccess: () => setEditId(null) });
  };

  return (
    <SectionShell>
      <SectionPageHeader icon={SlidersHorizontal} title="Notification Rules" description="Configure which events trigger notifications and delivery channels" accent={accent} actions={
        <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={() => setShowNew(true)}><PlusCircle className="mr-1 size-3" />New Rule</Button>
      } />

      {showNew && (
        <Panel title="Create Notification Rule" accentBorder="border-amber-500/20">
          <div className="grid gap-2 md:grid-cols-3">
            <Input value={rName} onChange={(e) => setRName(e.target.value)} placeholder="Rule name" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <Input value={rEvent} onChange={(e) => setREvent(e.target.value)} placeholder="Event (e.g. TENANT_CREATED)" className="h-8 border-slate-500/40 bg-slate-700 text-xs text-slate-100" />
            <select className="h-8 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={rChannel} onChange={(e) => setRChannel(e.target.value)}>
              <option value="EMAIL">Email</option><option value="SLACK">Slack</option><option value="IN_APP">In-App</option><option value="WEBHOOK">Webhook</option>
            </select>
          </div>
          <div className="mt-2 flex gap-2 justify-end">
            <Button size="sm" className="h-7 bg-slate-700 text-slate-200 hover:bg-slate-600" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button size="sm" className="h-7 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30" onClick={handleCreate} disabled={!rName.trim() || !rEvent.trim() || createRule.isPending}>
              {createRule.isPending ? <Loader2 className="mr-1 size-3 animate-spin" /> : null}Create
            </Button>
          </div>
        </Panel>
      )}

      <Panel title="Notification Rules" subtitle={isLoading ? 'Loading…' : `${rules.length} rules configured`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-amber-400" /></div>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <Row key={rule.id}>
                {editId === rule.id ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-300">{rule.name} — {rule.event}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select className="h-7 rounded-md border border-slate-500/40 bg-slate-700 px-2 text-xs text-slate-100" value={editChannel} onChange={(e) => setEditChannel(e.target.value)}>
                        <option value="EMAIL">Email</option><option value="SLACK">Slack</option><option value="IN_APP">In-App</option><option value="WEBHOOK">Webhook</option>
                      </select>
                      <label className="flex items-center gap-1 text-xs text-slate-300">
                        <input type="checkbox" checked={editEnabled} onChange={(e) => setEditEnabled(e.target.checked)} className="rounded" /> Enabled
                      </label>
                      <div className="ml-auto flex gap-2">
                        <Button size="sm" className="h-6 text-[10px] bg-slate-700 text-slate-200" onClick={() => setEditId(null)}>Cancel</Button>
                        <Button size="sm" className="h-6 text-[10px] bg-amber-500/20 text-amber-100" onClick={() => handleUpdate(rule.id)} disabled={updateRule.isPending}>Save</Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">{rule.name}</p>
                      <p className="text-slate-400">Event: <span className="font-mono text-slate-300">{rule.event}</span> → {rule.channel}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] ${rule.enabled ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <Button size="sm" variant="outline" className="h-6 text-[10px] border-amber-500/30" onClick={() => { setEditId(rule.id); setEditEnabled(rule.enabled); setEditChannel(rule.channel); }}>Edit</Button>
                    </div>
                  </div>
                )}
              </Row>
            ))}
            {rules.length === 0 && <EmptyState icon={SlidersHorizontal} title="No Rules" description="No notification rules configured yet." />}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}

/* ── History ── */
function NotifHistoryView() {
  const accent = getAccent('provider_notifications');
  const { data: bundle, isLoading } = useProviderNotifications();
  const history = bundle?.deliveries ?? [];

  const delivered = history.filter((h) => h.status === 'DELIVERED');
  const failed = history.filter((h) => h.status === 'FAILED');

  return (
    <SectionShell>
      <SectionPageHeader icon={FileClock} title="Delivery History" description="Notification delivery audit trail" accent={accent} />
      <div className="grid gap-2 grid-cols-2 md:grid-cols-3">
        <StatCard label="Delivered" value={String(delivered.length)} sub="Successful" gradient="from-emerald-500/10 to-emerald-500/5" />
        <StatCard label="Failed" value={String(failed.length)} sub="Delivery errors" gradient="from-red-500/10 to-red-500/5" />
        <StatCard label="Success Rate" value={history.length > 0 ? `${Math.round((delivered.length / history.length) * 100)}%` : '—'} sub="Delivery rate" gradient="from-blue-500/10 to-blue-500/5" />
      </div>

      <Panel title="Recent Deliveries" subtitle={isLoading ? 'Loading…' : `${history.length} events`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="size-6 animate-spin text-amber-400" /></div>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <Row key={h.id} className={h.status === 'FAILED' ? 'border-red-500/20' : ''}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-100">{h.rule}</p>
                    <p className="text-slate-400">{h.channel} → {h.recipient} · {new Date(h.sentAt).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={h.status === 'DELIVERED' ? 'COMPLETED' : 'FAILED'} />
                </div>
              </Row>
            ))}
            {history.length === 0 && <EmptyState icon={FileClock} title="No History" description="No notifications have been sent yet." />}
          </div>
        )}
      </Panel>
    </SectionShell>
  );
}
