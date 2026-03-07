/* ─── ConciergeAISection ─── Holographic AI assistant / analytics ──── */
import { useState, useRef, useEffect } from 'react';
import { useStaggerAnimate } from '@/hooks/use-animate';
import {
  Sparkles, Send, Bot, Settings, Code,
  Brain, Cpu, Database, FileCode, Zap, Activity, Clock,
  TrendingUp, Users, MessageSquare, Plus, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useNavigationStore } from '@/store/navigation.store';
import { useAuthStore } from '@/store/auth.store';
import {
  useAIChat, useAIGenerate, useAIFeedbackAnalysis,
  useAIPredictBudget, useSystemHealth,
} from '@/hooks/api';

/* ── Demo data ─────────────────────────────────────────────────── */

const FALLBACK_AI_METRICS = [
  { label: 'Queries Today', value: '142', change: '+18%', icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Avg Response Time', value: '1.2s', change: '-0.3s', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Resolution Rate', value: '94%', change: '+2%', icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Active Users', value: '38', change: '+5', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const FALLBACK_OPERATION_METRICS = [
  { label: 'CPU Usage', value: 34, status: 'healthy', color: 'from-emerald-500 to-emerald-600' },
  { label: 'Memory', value: 62, status: 'healthy', color: 'from-blue-500 to-blue-600' },
  { label: 'Queue Depth', value: 8, status: 'healthy', color: 'from-indigo-500 to-indigo-600' },
  { label: 'Error Rate', value: 1.2, status: 'healthy', color: 'from-emerald-500 to-emerald-600' },
];

const FALLBACK_DEV_TOOLS = [
  { id: 'code_gen', title: 'Code Generator', desc: 'Generate boilerplate and utility code', icon: FileCode, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'db_schema', title: 'DB Schema Helper', desc: 'Design and modify database schemas', icon: Database, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'log_analysis', title: 'Log Analysis', desc: 'AI-powered log pattern detection', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { id: 'add_component', title: 'Add Component', desc: 'Scaffold new UI/API components', icon: Plus, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 'modify_component', title: 'Modify Component', desc: 'Refactor existing components', icon: Code, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  { id: 'manage_deps', title: 'Manage Dependencies', desc: 'Audit and update packages', icon: Cpu, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { id: 'create_api', title: 'Create API', desc: 'Generate REST endpoint scaffolding', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 'project_enhancer', title: 'Project Enhancer', desc: 'AI-suggested improvements', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-500/10' },
];

/* ── Main Export ───────────────────────────────────────────────── */
export function ConciergeAISection() {
  const { activeHeader, activeSubNav } = useNavigationStore();
  const containerRef = useStaggerAnimate<HTMLDivElement>([activeHeader, activeSubNav]);

  const view = (() => {
    switch (activeHeader) {
      case 'assistant': return <AssistantView />;
      case 'ai_analytics': return <AIAnalyticsView />;
      case 'operations': return <OperationsView subNav={activeSubNav} />;
      case 'development': return <DevelopmentView subNav={activeSubNav} />;
      case 'ai_settings': return <AISettingsView subNav={activeSubNav} />;
      case 'budget_predictor': return <BudgetPredictorView />;
      case 'community_feedback': return <CommunityFeedbackView />;
      default: return <AssistantView />;
    }
  })();

  return <div ref={containerRef} className="space-y-6">{view}</div>;
}

/* ── Sub-views ─────────────────────────────────────────────────── */

function AssistantView() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const chatMut = useAIChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chatMut.isPending]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const updated = [...messages, { role: 'user' as const, content: text }];
    setMessages(updated);
    setInput('');
    chatMut.mutate(
      { messages: updated.map(m => ({ role: m.role, content: m.content })) },
      {
        onSuccess: (res) => {
          setMessages(prev => [...prev, { role: 'assistant', content: res.text ?? 'No response from AI.' }]);
        },
        onError: () => {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
        },
      },
    );
  };

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">AI Assistant</h2>
          <p className="text-sm text-white/40">Ask questions, generate reports, automate tasks</p>
        </div>
        <Badge variant="outline" className="gap-1 text-xs border-indigo-500/30 text-indigo-400"><Sparkles className="size-3" /> Powered by AI</Badge>
      </div>

      <Card data-animate className="flex flex-col border-white/6 bg-white/3 backdrop-blur-xl" style={{ minHeight: 480 }}>
        <CardContent className="flex flex-1 flex-col pt-4">
          {/* Chat messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-white/25">
                <Bot className="size-10" />
                <p className="text-sm">Start a conversation with the AI assistant.</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="bg-indigo-500/20 text-indigo-400"><Bot className="size-4" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'user' ? 'bg-indigo-600/80 text-white/90' : 'border border-white/6 bg-white/5 text-white/70'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
                {msg.role === 'user' && (
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-[10px] bg-white/10 text-white/60">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {chatMut.isPending && (
              <div className="flex gap-3">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-indigo-500/20 text-indigo-400"><Bot className="size-4" /></AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/5 px-4 py-3 text-sm text-white/40">
                  <Loader2 className="size-4 animate-spin" /> Thinking…
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <Separator className="mb-4 bg-white/6" />
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI assistant anything…"
              className="flex-1 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25"
              disabled={chatMut.isPending}
            />
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-500" disabled={chatMut.isPending || !input.trim()}>
              {chatMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

function AIAnalyticsView() {
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">AI Analytics</h2>
        <p className="text-sm text-white/40">Usage metrics and performance insights</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        {FALLBACK_AI_METRICS.map((m) => (
          <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="flex items-center gap-3 py-4">
              <div className={`flex size-9 items-center justify-center rounded-lg ${m.bg}`}>
                <m.icon className={`size-4 ${m.color}`} />
              </div>
              <div>
                <p className="text-xs text-white/40">{m.label}</p>
                <p className="text-lg font-bold text-white/85">{m.value}</p>
                <p className="text-[10px] text-emerald-400">{m.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Top Query Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { category: 'Student Data', pct: 35, color: 'from-indigo-500 to-indigo-600' },
            { category: 'Attendance Reports', pct: 25, color: 'from-blue-500 to-blue-600' },
            { category: 'Grade Analysis', pct: 20, color: 'from-emerald-500 to-emerald-600' },
            { category: 'Schedule Queries', pct: 12, color: 'from-amber-500 to-amber-600' },
            { category: 'Other', pct: 8, color: 'from-white/20 to-white/30' },
          ].map((c) => (
            <div key={c.category} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">{c.category}</span>
                <span className="font-medium text-white/80">{c.pct}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5">
                <div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${c.pct}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function OperationsView({ subNav }: { subNav: string }) {
  const { data: systemHealthData } = useSystemHealth();
  void systemHealthData;

  // Route to specific operations sub-views
  if (subNav === 'tenant_ai') return <TenantAIManagementView />;
  if (subNav === 'support') return <AISupportView />;
  // Default: system_health
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">System Health</h2>
        <p className="text-sm text-white/40">Monitor AI service health and performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        {FALLBACK_OPERATION_METRICS.map((m) => (
          <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/75">{m.label}</p>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">{m.status}</Badge>
              </div>
              <p className="mt-2 text-xl font-bold text-white/85">{typeof m.value === 'number' && m.value > 10 ? `${m.value}%` : m.value}</p>
              <div className="mt-3 h-2 w-full rounded-full bg-white/5">
                <div className={`h-full rounded-full bg-gradient-to-r ${m.color}`} style={{ width: `${typeof m.value === 'number' ? Math.min(m.value, 100) : 50}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function TenantAIManagementView() {
  const FALLBACK_TENANT_AI_DATA = [
    { name: 'Springfield Academy', queries: 1240, satisfaction: 94, model: 'GPT-4o', status: 'active' },
    { name: 'Oakwood Institute', queries: 890, satisfaction: 91, model: 'GPT-4o-mini', status: 'active' },
    { name: 'Cedar Valley School', queries: 456, satisfaction: 87, model: 'GPT-4o', status: 'limited' },
    { name: 'Riverside Prep', queries: 234, satisfaction: 96, model: 'GPT-4o', status: 'active' },
  ];
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Tenant AI Management</h2>
        <p className="text-sm text-white/40">Configure AI access and quotas per tenant</p>
      </div>
      <div className="space-y-2" data-animate>
        {FALLBACK_TENANT_AI_DATA.map(t => (
          <Card key={t.name} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all">
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Brain className="size-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{t.name}</p>
                  <p className="text-xs text-white/40">{t.queries.toLocaleString()} queries · {t.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-white/40">Satisfaction</p>
                  <p className="text-sm font-bold text-emerald-400">{t.satisfaction}%</p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${t.status === 'active' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400'}`}>
                  {t.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function AISupportView() {
  const FALLBACK_TICKETS = [
    { id: 'T-001', user: 'Admin @ Springfield', issue: 'AI responses slow during peak hours', priority: 'high', status: 'open', time: '2h ago' },
    { id: 'T-002', user: 'Teacher @ Oakwood', issue: 'Incorrect grading suggestions', priority: 'medium', status: 'investigating', time: '5h ago' },
    { id: 'T-003', user: 'Parent @ Cedar Valley', issue: 'Chat not loading on mobile', priority: 'low', status: 'resolved', time: '1d ago' },
  ];
  const statusColors: Record<string, string> = { open: 'border-red-500/30 text-red-400', investigating: 'border-amber-500/30 text-amber-400', resolved: 'border-emerald-500/30 text-emerald-400' };
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">AI Support Tickets</h2>
        <p className="text-sm text-white/40">Track and resolve AI-related support issues</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3" data-animate>
        {[
          { label: 'Open Tickets', value: '3', color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Avg Resolution', value: '4.2h', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Satisfaction', value: '92%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(m => (
          <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-2" data-animate>
        {FALLBACK_TICKETS.map(t => (
          <Card key={t.id} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all">
            <CardContent className="flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-white/50">{t.id}</span>
                  <Badge variant="outline" className={`text-[10px] ${statusColors[t.status] ?? 'border-white/10 text-white/40'}`}>{t.status}</Badge>
                </div>
                <p className="text-sm text-white/80 mt-0.5">{t.issue}</p>
                <p className="text-xs text-white/40">{t.user} · {t.time}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${t.priority === 'high' ? 'border-red-500/30 text-red-400' : t.priority === 'medium' ? 'border-amber-500/30 text-amber-400' : 'border-white/10 text-white/40'}`}>
                {t.priority}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function DevelopmentView({ subNav }: { subNav: string }) {
  const activeTool = FALLBACK_DEV_TOOLS.find((t) => t.id === subNav) ?? FALLBACK_DEV_TOOLS[0];
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const generateMut = useAIGenerate();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setResult(null);
    generateMut.mutate(
      { prompt: `[${activeTool.title}] ${prompt}` },
      {
        onSuccess: (res) => setResult(res.text ?? 'No output generated.'),
        onError: () => setResult('Error — AI generation failed. Try again.'),
      },
    );
  };

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">AI Development Tools</h2>
        <p className="text-sm text-white/40">AI-powered code generation and project management</p>
      </div>

      {subNav && subNav !== FALLBACK_DEV_TOOLS[0].id ? (
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`flex size-10 items-center justify-center rounded-lg ${activeTool.bg}`}>
                <activeTool.icon className={`size-5 ${activeTool.color}`} />
              </div>
              <div>
                <CardTitle className="text-base text-white/85">{activeTool.title}</CardTitle>
                <CardDescription className="text-xs text-white/35">{activeTool.desc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator className="bg-white/6" />
            <div className="space-y-2">
              <label className="text-xs font-medium text-white/50">Describe what you need</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Tell the AI what to ${activeTool.title.toLowerCase()}…`}
                className="border-white/10 bg-white/5 text-white/80 placeholder:text-white/25 min-h-[80px]"
              />
            </div>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500"
              onClick={handleGenerate}
              disabled={generateMut.isPending || !prompt.trim()}
            >
              {generateMut.isPending ? <><Loader2 className="mr-1 size-3 animate-spin" /> Generating…</> : <><Sparkles className="mr-1 size-3" /> Generate</>}
            </Button>
            {result && (
              <div className="rounded-xl border border-white/6 bg-white/2 p-4 mt-2">
                <p className="text-xs font-medium text-indigo-400 mb-2">AI Output</p>
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-mono">{result}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
          {FALLBACK_DEV_TOOLS.map((tool) => (
            <Card key={tool.id} className="border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer hover:border-white/12 hover:bg-white/4 transition-all">
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                <div className={`flex size-10 items-center justify-center rounded-lg ${tool.bg}`}>
                  <tool.icon className={`size-5 ${tool.color}`} />
                </div>
                <p className="text-sm font-semibold text-white/80">{tool.title}</p>
                <p className="text-[10px] text-white/35">{tool.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function AISettingsView({ subNav }: { subNav: string }) {
  // Route to specific settings sub-views
  if (subNav === 'data_sources') return <AIDataSourcesView />;
  if (subNav === 'usage') return <AIUsageView />;
  if (subNav === 'training') return <AITrainingView />;
  // Default: configuration
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">AI Configuration</h2>
        <p className="text-sm text-white/40">Model parameters, system prompts, and behavior settings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" data-animate>
        {[
          { title: 'Model Selection', desc: 'GPT-4o (primary), GPT-4o-mini (fallback)', icon: Cpu, color: 'text-indigo-400', bg: 'bg-indigo-500/10', detail: 'Temperature: 0.7 · Max tokens: 4096' },
          { title: 'System Prompts', desc: '12 custom prompts configured', icon: Settings, color: 'text-blue-400', bg: 'bg-blue-500/10', detail: 'Last updated: 2 days ago' },
          { title: 'Response Format', desc: 'Markdown enabled · Code blocks enabled', icon: FileCode, color: 'text-emerald-400', bg: 'bg-emerald-500/10', detail: 'Max context: 128K tokens' },
          { title: 'Safety Filters', desc: 'Content moderation active', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', detail: 'Threshold: Medium' },
        ].map((item) => (
          <Card key={item.title} className="border-white/6 bg-white/3 backdrop-blur-xl cursor-pointer hover:border-white/12 hover:bg-white/4 transition-all">
            <CardContent className="flex items-start gap-3 py-4">
              <div className={`flex size-9 items-center justify-center rounded-lg ${item.bg}`}>
                <item.icon className={`size-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">{item.title}</p>
                <p className="text-xs text-white/35">{item.desc}</p>
                <p className="text-[10px] text-white/25 mt-1">{item.detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function AIDataSourcesView() {
  const FALLBACK_SOURCES = [
    { name: 'Student Information System', type: 'SIS', status: 'connected', records: '12,450', lastSync: '5 min ago', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { name: 'Learning Management System', type: 'LMS', status: 'connected', records: '8,920', lastSync: '15 min ago', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { name: 'Financial System', type: 'Finance', status: 'connected', records: '3,200', lastSync: '1h ago', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { name: 'Calendar & Events', type: 'Calendar', status: 'connected', records: '456', lastSync: '30 min ago', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { name: 'Communication Logs', type: 'Comms', status: 'disconnected', records: '—', lastSync: 'Never', color: 'text-white/30', bg: 'bg-white/5' },
  ];
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Data Sources</h2>
        <p className="text-sm text-white/40">Connected data sources feeding the AI model</p>
      </div>
      <div className="space-y-2" data-animate>
        {FALLBACK_SOURCES.map(s => (
          <Card key={s.name} className="border-white/6 bg-white/3 backdrop-blur-xl hover:border-white/12 transition-all">
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`flex size-9 items-center justify-center rounded-lg ${s.bg}`}>
                  <Database className={`size-4 ${s.color}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80">{s.name}</p>
                  <p className="text-xs text-white/40">{s.records} records · Last sync: {s.lastSync}</p>
                </div>
              </div>
              <Badge variant="outline" className={`text-[10px] ${s.status === 'connected' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}`}>
                {s.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function AIUsageView() {
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Usage & Limits</h2>
        <p className="text-sm text-white/40">Monitor AI usage across the platform</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-4" data-animate>
        {[
          { label: 'Queries This Month', value: '3,420', max: '10,000', pct: 34, color: 'text-blue-400' },
          { label: 'Tokens Used', value: '2.1M', max: '5M', pct: 42, color: 'text-indigo-400' },
          { label: 'Active Users', value: '156', max: '500', pct: 31, color: 'text-emerald-400' },
          { label: 'Cost This Month', value: '$284', max: '$500', pct: 57, color: 'text-amber-400' },
        ].map(m => (
          <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-4 pb-3 space-y-2">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
              <div className="h-1.5 w-full rounded-full bg-white/5">
                <div className={`h-full rounded-full bg-current ${m.color}`} style={{ width: `${m.pct}%` }} />
              </div>
              <p className="text-[10px] text-white/30">{m.value} of {m.max} ({m.pct}%)</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function AITrainingView() {
  const FALLBACK_SESSIONS = [
    { date: 'Mar 1, 2026', type: 'Full Retrain', records: '25,000', duration: '4h 20m', status: 'completed' },
    { date: 'Feb 15, 2026', type: 'Incremental', records: '3,200', duration: '45m', status: 'completed' },
    { date: 'Feb 1, 2026', type: 'Full Retrain', records: '22,800', duration: '3h 50m', status: 'completed' },
  ];
  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">Training Data</h2>
        <p className="text-sm text-white/40">Manage AI model training sessions and data</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Training Records', value: '25,000', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Last Trained', value: 'Mar 1, 2026', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Model Accuracy', value: '96.8%', color: 'text-blue-400', bg: 'bg-blue-500/10' },
        ].map(m => (
          <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="py-4 text-center">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Training History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {FALLBACK_SESSIONS.map(s => (
            <div key={s.date} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3 hover:bg-white/4 transition-all">
              <div>
                <p className="text-sm text-white/70">{s.type}</p>
                <p className="text-xs text-white/35">{s.date} · {s.records} records · {s.duration}</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">{s.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function BudgetPredictorView() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const predictMut = useAIPredictBudget(schoolId);
  const [prediction, setPrediction] = useState<Record<string, unknown> | null>(null);

  const runForecast = () => {
    predictMut.mutate(undefined, {
      onSuccess: (res) => setPrediction(res as Record<string, unknown>),
      onError: () => setPrediction({ error: 'Failed to generate budget prediction.' }),
    });
  };

  return (
    <>
      <div data-animate>
        <h2 className="text-lg font-semibold text-white/90">AI Budget Predictor</h2>
        <p className="text-sm text-white/40">AI-powered financial forecasting</p>
      </div>
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardContent className="space-y-4 pt-6">
          <p className="text-sm text-white/50">
            The AI Budget Predictor analyzes historical spending patterns, enrollment trends, and seasonal factors to forecast future financial needs.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Next Quarter Forecast', value: '$312K', conf: '92% confidence', color: 'text-emerald-400' },
              { label: 'Projected Savings', value: '$18.5K', conf: 'vs. current trajectory', color: 'text-blue-400' },
              { label: 'Risk Alerts', value: '2', conf: 'items need attention', color: 'text-amber-400' },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-white/6 bg-white/2 p-4 text-center transition-all hover:bg-white/4 hover:border-white/12">
                <p className="text-xs text-white/40">{m.label}</p>
                <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                <p className="text-[10px] text-white/30">{m.conf}</p>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500"
            onClick={runForecast}
            disabled={predictMut.isPending || !schoolId}
          >
            {predictMut.isPending ? <><Loader2 className="mr-1 size-3 animate-spin" /> Running…</> : <><Sparkles className="mr-1 size-3" /> Run New Forecast</>}
          </Button>
          {prediction && (
            <div className="rounded-xl border border-white/6 bg-white/2 p-4 mt-2">
              <p className="text-xs font-medium text-indigo-400 mb-2">Forecast Result</p>
              <pre className="text-sm text-white/70 whitespace-pre-wrap">{JSON.stringify(prediction, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function CommunityFeedbackView() {
  const schoolId = useAuthStore((s) => s.schoolId);
  const feedbackMut = useAIFeedbackAnalysis();
  const [analysis, setAnalysis] = useState<string | null>(null);

  const runAnalysis = () => {
    feedbackMut.mutate(
      { schoolId: schoolId ?? undefined },
      {
        onSuccess: (res) => setAnalysis((res as { text?: string })?.text ?? 'No analysis generated.'),
        onError: () => setAnalysis('Failed to analyze feedback. Try again.'),
      },
    );
  };

  return (
    <>
      <div className="flex items-center justify-between" data-animate>
        <div>
          <h2 className="text-lg font-semibold text-white/90">Community Feedback AI</h2>
          <p className="text-sm text-white/40">AI analysis of parent, student, and staff sentiment</p>
        </div>
        <Button
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500"
          onClick={runAnalysis}
          disabled={feedbackMut.isPending}
        >
          {feedbackMut.isPending ? <><Loader2 className="mr-1 size-3 animate-spin" /> Analyzing…</> : <><Sparkles className="mr-1 size-3" /> Analyze Feedback</>}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3" data-animate>
        {[
          { label: 'Overall Sentiment', value: '82%', desc: 'Positive', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Responses Analyzed', value: '1,240', desc: 'This semester', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Top Concern', value: 'Parking', desc: '34 mentions', color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map((m) => (
          <Card key={m.label} className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardContent className="pt-6 text-center">
              <p className="text-xs text-white/40">{m.label}</p>
              <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
              <p className="text-xs text-white/35">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {analysis && (
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base text-white/85">AI Feedback Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-white/70 whitespace-pre-wrap">{analysis}</pre>
          </CardContent>
        </Card>
      )}
      <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-base text-white/85">Recent Feedback Themes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { theme: 'Improved cafeteria food quality', sentiment: 'positive', count: 89, badge: 'border-emerald-500/30 text-emerald-400' },
            { theme: 'Need more after-school programs', sentiment: 'neutral', count: 56, badge: 'border-white/10 text-white/40' },
            { theme: 'Parking congestion during pickup', sentiment: 'negative', count: 34, badge: 'border-rose-500/30 text-rose-400' },
            { theme: 'Library hours extension request', sentiment: 'neutral', count: 28, badge: 'border-white/10 text-white/40' },
          ].map((f) => (
            <div key={f.theme} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 p-3 transition-all hover:bg-white/4 hover:border-white/12">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`text-[10px] ${f.badge}`}>
                  {f.sentiment}
                </Badge>
                <span className="text-sm text-white/70">{f.theme}</span>
              </div>
              <span className="text-xs text-white/35">{f.count} mentions</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
