/* ─── MarkdownPreview ─── Textarea with rendered markdown preview toggle ─── */
import { useState, useMemo } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface MarkdownPreviewProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  label?: string;
}

/** Simple regex-based Markdown → HTML (covers common patterns without deps) */
function renderMarkdown(md: string): string {
  let html = md
    // escape HTML
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // headings
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-white/85 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold text-white/85 mt-5 mb-1.5">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-white/90 mt-6 mb-2">$1</h1>')
    // bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white/80">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g, '<code class="rounded bg-white/8 px-1.5 py-0.5 text-[12px] font-mono text-indigo-300">$1</code>')
    // links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-400 underline">$1</a>')
    // unordered lists
    .replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc text-white/60">$1</li>')
    // hr
    .replace(/^---$/gm, '<hr class="my-4 border-white/8" />')
    // paragraphs (double newline)
    .replace(/\n\n/g, '</p><p class="text-sm text-white/60 leading-relaxed mb-2">')
    // single newlines → br
    .replace(/\n/g, '<br />');

  return `<p class="text-sm text-white/60 leading-relaxed mb-2">${html}</p>`;
}

export function MarkdownPreview({
  value,
  onChange,
  placeholder = 'Write your content using Markdown...',
  rows = 8,
  className = '',
  label,
}: MarkdownPreviewProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const rendered = useMemo(() => renderMarkdown(value), [value]);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with label + toggle */}
      <div className="flex items-center justify-between">
        {label && <label className="text-xs font-medium text-white/60">{label}</label>}
        <div className="flex gap-1">
          <Button
            type="button"
            variant={mode === 'edit' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('edit')}
            className="h-7 px-2.5 text-[11px]"
          >
            <Pencil className="size-3 mr-1" /> Edit
          </Button>
          <Button
            type="button"
            variant={mode === 'preview' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setMode('preview')}
            className="h-7 px-2.5 text-[11px]"
          >
            <Eye className="size-3 mr-1" /> Preview
          </Button>
        </div>
      </div>

      {/* Content area */}
      {mode === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-white/80 placeholder:text-white/25 focus:border-indigo-500/40 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 backdrop-blur-xl resize-y font-mono"
        />
      ) : (
        <div
          className="min-h-40 rounded-xl border border-white/8 bg-white/3 px-5 py-4 backdrop-blur-xl prose-invert"
          dangerouslySetInnerHTML={{ __html: rendered || '<p class="text-sm text-white/30 italic">Nothing to preview yet.</p>' }}
        />
      )}

      {/* Helper text */}
      {mode === 'edit' && (
        <p className="text-[10px] text-white/25">
          Supports **bold**, *italic*, `code`, # headings, - lists, [links](url), ---
        </p>
      )}
    </div>
  );
}
