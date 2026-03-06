/* ─── AITutorPage ─── Full-page AI tutor chat ──────────────────────── */
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Lightbulb, MessageSquare, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStaggerAnimate } from '@/hooks/use-animate';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

interface ChatMsg {
  id: string;
  role: 'ai' | 'user';
  text: string;
  ts: number;
}

const SUGGESTED = [
  'Explain the quadratic formula',
  'Help me write an essay outline',
  'What is photosynthesis?',
  'Solve: 2x² + 5x - 3 = 0',
  'Summarize chapter 12 of my history textbook',
];

const INITIAL: ChatMsg[] = [
  { id: '1', role: 'ai', text: "Hi! I'm your AI tutor. I can help with any subject — math, science, history, writing, and more. What would you like to study today?", ts: Date.now() },
];

export default function AITutorPage() {
  const containerRef = useStaggerAnimate([]);
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: 'user', text: text.trim(), ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    // Simulated AI response (replace with real API)
    setTimeout(() => {
      const aiMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: `Great question! Let me help you with "${text.trim()}". This is where the real AI response would appear, providing detailed explanations, step-by-step solutions, and helpful examples tailored to your learning level.`,
        ts: Date.now(),
      };
      setMessages((m) => [...m, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-10rem)]">
      <PageHeader title="AI Tutor" description="Your personal AI study companion — ask anything" />

      {/* Suggested topics */}
      <div data-animate className="flex gap-2 flex-wrap mb-4">
        {SUGGESTED.map((s) => (
          <Badge key={s} variant="outline" className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors text-xs" onClick={() => sendMessage(s)}>
            <Lightbulb className="size-3 mr-1" />{s}
          </Badge>
        ))}
      </div>

      {/* Chat area */}
      <Card data-animate className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <div className={cn(
                'size-8 rounded-full flex items-center justify-center shrink-0',
                msg.role === 'ai' ? 'bg-primary/10' : 'bg-violet-500/10',
              )}>
                {msg.role === 'ai' ? <Sparkles className="size-4 text-primary" /> : <MessageSquare className="size-4 text-violet-500" />}
              </div>
              <div className={cn(
                'rounded-xl px-4 py-3 max-w-[75%] text-sm',
                msg.role === 'ai'
                  ? 'bg-muted text-foreground'
                  : 'bg-primary text-primary-foreground',
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full flex items-center justify-center bg-primary/10 shrink-0">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="rounded-xl bg-muted px-4 py-3">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {/* Input */}
      <form
        data-animate
        className="flex gap-2 mt-3"
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
      >
        <Input
          placeholder="Ask your tutor anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 h-11"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !input.trim()} className="h-11 px-5">
          <Send className="size-4 mr-1" /> Ask
        </Button>
      </form>
    </div>
  );
}
