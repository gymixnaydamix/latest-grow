/* ConciergeCommandComposer — Bottom composer with NL input, slash commands, attachments */
import { Send, Paperclip, Mic, ChevronUp, Slash } from 'lucide-react';
import { useConciergeStore } from '@/store/concierge.store';
import { cn } from '@/lib/utils';
import { useState, useRef, type KeyboardEvent } from 'react';

interface Props {
  slashCommands?: string[];
  onSend?: (text: string) => void;
  placeholder?: string;
  className?: string;
}

export function ConciergeCommandComposer({ slashCommands = [], onSend, placeholder = 'Ask the concierge...', className }: Props) {
  const { commandInput, setCommandInput, addRecentCommand, recentCommands } = useConciergeStore();
  const [showSlash, setShowSlash] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const v = commandInput.trim();
    if (!v) return;
    addRecentCommand(v);
    onSend?.(v);
    setCommandInput('');
    setShowSlash(false);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === '/' && !commandInput) setShowSlash(true);
  };

  const pickSlash = (cmd: string) => { setCommandInput(cmd + ' '); setShowSlash(false); inputRef.current?.focus(); };

  return (
    <div className={cn('relative', className)}>
      {/* Slash command palette */}
      {showSlash && slashCommands.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-60 rounded-xl border border-border/40 bg-background/95 p-2 shadow-lg backdrop-blur-xl dark:border-white/5">
          {slashCommands.map((cmd) => (
            <button
              key={cmd}
              onClick={() => pickSlash(cmd)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/60"
            >
              <Slash className="h-3 w-3 text-muted-foreground" />
              {cmd}
            </button>
          ))}
        </div>
      )}
      {/* Recent commands palette */}
      {showRecent && recentCommands.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-border/40 bg-background/95 p-2 shadow-lg backdrop-blur-xl dark:border-white/5">
          {recentCommands.slice(0, 6).map((cmd, i) => (
            <button
              key={i}
              onClick={() => { setCommandInput(cmd); setShowRecent(false); inputRef.current?.focus(); }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-foreground hover:bg-muted/60 truncate"
            >
              {cmd}
            </button>
          ))}
        </div>
      )}
      {/* Composer */}
      <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/80 px-3 py-2 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/80">
        <button className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted/60" title="Attach">
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowRecent((p) => !p)}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted/60"
          title="Recent commands"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          value={commandInput}
          onChange={(e) => { setCommandInput(e.target.value); if (e.target.value.startsWith('/')) setShowSlash(true); else setShowSlash(false); }}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted/60" title="Voice">
          <Mic className="h-4 w-4" />
        </button>
        <button
          onClick={handleSend}
          className="rounded-xl bg-primary p-2 text-primary-foreground transition hover:bg-primary/90"
          title="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
