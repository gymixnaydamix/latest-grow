/* ─── DebateSimulatorPage ─── AI-powered debate practice ───────────── */
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  MessageSquare, Mic, ThumbsUp, ThumbsDown, Trophy,
  Lightbulb, ArrowRight, RotateCcw, Sparkles,
  Clock, Target, BookOpen, Users, Star, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { notifySuccess, notifyError } from '@/lib/notify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/features/StatCard';

const FALLBACK_TOPICS = [
  { id: '1', title: 'Should AI replace teachers?', category: 'Technology', difficulty: 'Intermediate', doneCount: 1432 },
  { id: '2', title: 'Universal Basic Income', category: 'Economics', difficulty: 'Advanced', doneCount: 987 },
  { id: '3', title: 'Space colonization priority', category: 'Science', difficulty: 'Beginner', doneCount: 2145 },
  { id: '4', title: 'Social media age restriction', category: 'Society', difficulty: 'Intermediate', doneCount: 1876 },
  { id: '5', title: 'Nuclear energy expansion', category: 'Environment', difficulty: 'Advanced', doneCount: 754 },
];

const FALLBACK_PAST_DEBATES = [
  { topic: 'Climate action responsibility', side: 'For', result: 'Won', score: 87, date: '2 d ago' },
  { topic: 'Social media bans in schools', side: 'Against', result: 'Lost', score: 72, date: '4 d ago' },
  { topic: 'Mandatory coding education', side: 'For', result: 'Won', score: 91, date: '1 w ago' },
];

const difficultyColor: Record<string, string> = {
  Beginner: 'bg-emerald-500/20 text-emerald-400',
  Intermediate: 'bg-amber-500/20 text-amber-400',
  Advanced: 'bg-rose-500/20 text-rose-400',
};

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export default function DebateSimulatorPage() {
  const containerRef = useStaggerAnimate([]);
  const [activeTopic, setActiveTopic] = useState<typeof FALLBACK_TOPICS[number] | null>(null);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [round, setRound] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const TOPICS = FALLBACK_TOPICS;
  const PAST_DEBATES = FALLBACK_PAST_DEBATES;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startDebate = useCallback((topic: typeof FALLBACK_TOPICS[number]) => {
    setActiveTopic(topic);
    setRound(1);
    setUserScore(0);
    setAiScore(0);
    setMessages([
      { role: 'ai', text: `I'll argue FOR the topic "${topic.title}". Let me start: This position has strong merit when you consider the evidence available today. What's your opening counterargument?`, timestamp: 'Just now' },
    ]);
  }, []);

  const sendArgument = useCallback(() => {
    if (!userInput.trim()) {
      notifyError('Input', 'Please type your argument');
      return;
    }
    const userMsg: ChatMessage = { role: 'user', text: userInput.trim(), timestamp: 'Just now' };
    const points = Math.floor(Math.random() * 8) + 5;
    const aiPoints = Math.floor(Math.random() * 8) + 4;
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'ai', text: `Interesting point. However, I'd counter that the broader implications actually support my position. Consider the economic and social factors at play. What's your rebuttal?`, timestamp: 'Just now' },
    ]);
    setUserScore((s) => s + points);
    setAiScore((s) => s + aiPoints);
    setRound((r) => r + 1);
    setUserInput('');
  }, [userInput]);

  const endDebate = useCallback(() => {
    const won = userScore > aiScore;
    notifySuccess('Debate Ended', `You ${won ? 'won' : 'lost'} with ${userScore} points vs AI's ${aiScore} points`);
    setActiveTopic(null);
    setMessages([]);
    setRound(1);
    setUserScore(0);
    setAiScore(0);
  }, [userScore, aiScore]);

  return (
    <div ref={containerRef} className="flex flex-col gap-6">
      <PageHeader title="Debate Simulator" description="Sharpen critical thinking with AI-powered debate practice" />

      {/* Stats — demo data */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-animate>
        <StatCard label="Debates Completed" value={PAST_DEBATES.length} icon={<MessageSquare className="h-5 w-5" />} />
        <StatCard label="Win Rate" value={Math.round((PAST_DEBATES.filter(d => d.result === 'Won').length / PAST_DEBATES.length) * 100)} suffix="%" icon={<Trophy className="h-5 w-5" />} accentColor="#a78bfa" />
        <StatCard label="Avg Score" value={Math.round(PAST_DEBATES.reduce((a, d) => a + d.score, 0) / PAST_DEBATES.length)} icon={<Target className="h-5 w-5" />} trend="up" trendLabel="demo" />
        <StatCard label="Topics Explored" value={PAST_DEBATES.length} icon={<BookOpen className="h-5 w-5" />} />
      </div>

      {!activeTopic ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Topic selection */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white/90 text-sm">Choose a Topic</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {TOPICS.map((t) => (
                <div key={t.id} className="flex items-center gap-3 rounded-lg border border-white/6 bg-white/2 p-3 hover:border-white/12 transition-all cursor-pointer group" onClick={() => startDebate(t)}>
                  <div className="size-9 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                    <Lightbulb className="size-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white/80">{t.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[8px] border-white/8 text-white/30">{t.category}</Badge>
                      <Badge className={cn('text-[8px]', difficultyColor[t.difficulty])}>{t.difficulty}</Badge>
                      <span className="text-[9px] text-white/25"><Users className="size-2.5 inline mr-0.5" />{t.doneCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); startDebate(t); }} className="opacity-0 group-hover:opacity-100 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1">
                    Start <ArrowRight className="size-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Past debates */}
          <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white/90 text-sm">Recent Debates</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {PAST_DEBATES.map((d, i) => (
                <div key={i} className="rounded-lg border border-white/6 bg-white/2 p-2.5">
                  <p className="text-xs text-white/70 truncate">{d.topic}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[8px] border-white/8 text-white/30">{d.side}</Badge>
                    <Badge className={cn('text-[8px]', d.result === 'Won' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400')}>
                      {d.result === 'Won' ? <ThumbsUp className="size-2 mr-0.5" /> : <ThumbsDown className="size-2 mr-0.5" />}{d.result}
                    </Badge>
                    <span className="text-[9px] text-white/30 ml-auto">{d.score}/100</span>
                  </div>
                  <Progress value={d.score} className="h-1 mt-2 bg-white/5" />
                  <p className="text-[9px] text-white/20 mt-1">{d.date}</p>
                </div>
              ))}
              <div className="text-center mt-2">
                <span className="text-[10px] text-white/25">Skills improved: Argumentation, Evidence, Rebuttal</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Live debate view */
        <Card data-animate className="border-white/6 bg-white/3 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white/90 text-sm">{activeTopic.title}</CardTitle>
                <p className="text-[10px] text-white/30 mt-0.5">You: Against · AI: For · Round {round} of 5</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] border-white/8 text-white/30 gap-1"><Clock className="size-2.5" />4:32</Badge>
                <Button size="sm" variant="outline" className="h-7 text-[10px] border-white/10 text-white/40" onClick={endDebate}>
                  <RotateCcw className="size-3 mr-1" />End
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {/* Score bar */}
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-indigo-400">You: {userScore}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500/60 rounded-full transition-all" style={{ width: `${userScore + aiScore > 0 ? Math.round((userScore / (userScore + aiScore)) * 100) : 50}%` }} />
              </div>
              <span className="text-violet-400">AI: {aiScore}</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {messages.map((m, i) => (
                <div key={i} className={cn('flex gap-2', m.role === 'user' && 'flex-row-reverse')}>
                  <div className={cn(
                    'size-7 rounded-full flex items-center justify-center shrink-0',
                    m.role === 'ai' ? 'bg-violet-500/20' : 'bg-indigo-500/20',
                  )}>
                    {m.role === 'ai' ? <Sparkles className="size-3 text-violet-400" /> : <Shield className="size-3 text-indigo-400" />}
                  </div>
                  <div className={cn(
                    'max-w-[70%] rounded-xl p-2.5 text-xs text-white/70',
                    m.role === 'ai' ? 'bg-violet-500/8 border border-violet-500/15' : 'bg-indigo-500/8 border border-indigo-500/15',
                  )}>
                    {m.text}
                    <p className="text-[8px] text-white/20 mt-1">{m.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Hints */}
            <div className="flex gap-2 flex-wrap">
              <Badge className="text-[8px] bg-amber-500/10 text-amber-400 cursor-pointer hover:bg-amber-500/20"><Lightbulb className="size-2 mr-0.5" />Counter: Mention emotional intelligence</Badge>
              <Badge className="text-[8px] bg-amber-500/10 text-amber-400 cursor-pointer hover:bg-amber-500/20"><Star className="size-2 mr-0.5" />Use a real-world example</Badge>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type your argument…"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1 h-9 text-xs bg-white/3 border-white/8 text-white/70 placeholder:text-white/25"
              />
              <Button size="sm" className="h-9 text-xs bg-white/5 hover:bg-white/10 text-white/40 border border-white/10 gap-1" onClick={() => notifyError('Voice', 'Voice input not yet available')}><Mic className="size-3" /></Button>
              <Button size="sm" className="h-9 text-xs bg-indigo-600 hover:bg-indigo-500 text-white gap-1" disabled={!userInput.trim()} onClick={sendArgument}>Send <ArrowRight className="size-3" /></Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
