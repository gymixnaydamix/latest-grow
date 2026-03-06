/* ─── QuickNoteWidget ─── Persistent note-taking widget ───────────── */
import { useState, useEffect, useCallback } from 'react';
import { StickyNote, Save, Trash2, Pin, PinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickNoteWidgetProps {
  storageKey?: string;
  className?: string;
}

interface NoteEntry {
  id: string;
  text: string;
  pinned: boolean;
  createdAt: string;
}

const STORAGE_PREFIX = 'gyn-quicknotes-';

export function QuickNoteWidget({ storageKey = 'default', className }: QuickNoteWidgetProps) {
  const key = `${STORAGE_PREFIX}${storageKey}`;

  const [notes, setNotes] = useState<NoteEntry[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]');
    } catch {
      return [];
    }
  });

  const [draft, setDraft] = useState('');

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(notes));
  }, [notes, key]);

  const addNote = useCallback(() => {
    if (!draft.trim()) return;
    setNotes((prev) => [
      { id: crypto.randomUUID(), text: draft.trim(), pinned: false, createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setDraft('');
  }, [draft]);

  const removeNote = (id: string) => setNotes((p) => p.filter((n) => n.id !== id));
  const togglePin = (id: string) =>
    setNotes((p) => p.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)));

  const sorted = [...notes].sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1));

  return (
    <div className={cn('flex flex-col gap-3 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl p-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <StickyNote className="size-4 text-amber-400" />
        <span className="text-sm font-semibold text-white/80">Quick Notes</span>
        <span className="ml-auto text-[10px] text-white/30">{notes.length} notes</span>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder="Jot something down…"
          className="flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white/80 placeholder:text-white/25 outline-none focus:border-amber-400/40"
        />
        <Button size="icon" variant="ghost" onClick={addNote} className="h-8 w-8 text-white/50 hover:text-amber-400">
          <Save className="size-3.5" />
        </Button>
      </div>

      {/* Notes list */}
      <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto scrollbar-thin">
        {sorted.length === 0 && (
          <span className="py-4 text-center text-xs text-white/25">No notes yet</span>
        )}
        {sorted.map((note) => (
          <div
            key={note.id}
            className={cn(
              'group flex items-start gap-2 rounded-lg border px-3 py-2 text-xs text-white/70 transition-colors',
              note.pinned ? 'border-amber-400/20 bg-amber-400/5' : 'border-white/5 bg-white/2 hover:bg-white/4',
            )}
          >
            <span className="flex-1 break-words leading-relaxed">{note.text}</span>
            <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => togglePin(note.id)} className="p-0.5 text-white/30 hover:text-amber-400">
                {note.pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
              </button>
              <button onClick={() => removeNote(note.id)} className="p-0.5 text-white/30 hover:text-red-400">
                <Trash2 className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
