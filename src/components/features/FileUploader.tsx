/* ─── FileUploader ─── Holographic drag-and-drop file upload zone ── */
import { useState, useRef, useCallback, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, FileText, Image, File, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  onUpload?: (files: File[]) => void;
  className?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.includes('pdf') || type.includes('text')) return FileText;
  return File;
}

export function FileUploader({
  accept,
  multiple = true,
  maxSizeMB = 10,
  onUpload,
  className,
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).filter(f => f.size <= maxSizeMB * 1024 * 1024);
    const newEntries: UploadedFile[] = arr.map(f => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      type: f.type,
      progress: 0,
      status: 'uploading',
    }));
    setFiles(prev => [...prev, ...newEntries]);
    onUpload?.(arr);

    // Simulate upload progress
    newEntries.forEach(entry => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles(prev =>
            prev.map(f => (f.id === entry.id ? { ...f, progress: 100, status: 'complete' } : f)),
          );
        } else {
          setFiles(prev =>
            prev.map(f => (f.id === entry.id ? { ...f, progress: Math.min(progress, 99) } : f)),
          );
        }
      }, 300);
    });
  }, [maxSizeMB, onUpload]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    if (inputRef.current) inputRef.current.value = '';
  }, [processFiles]);

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  return (
    <div className={cn('space-y-3', className)}>
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer',
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
            : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5',
        )}
      >
        <Upload className={cn('size-8', isDragging ? 'text-indigo-400' : 'text-white/30')} />
        <p className="text-sm font-medium text-white/60">
          {isDragging ? 'Drop files here…' : 'Drag & drop files, or click to browse'}
        </p>
        <p className="text-xs text-white/30">
          Max {maxSizeMB}MB per file{accept ? ` · ${accept}` : ''}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map(f => {
            const Icon = getFileIcon(f.type);
            return (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl px-4 py-3"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="size-4 text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/70 truncate">{f.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-white/30">{formatBytes(f.size)}</span>
                    {f.status === 'complete' && (
                      <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                        <CheckCircle2 className="size-3" /> Done
                      </span>
                    )}
                  </div>
                  {f.status === 'uploading' && (
                    <Progress value={f.progress} className="mt-1.5 h-1" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-white/30 hover:text-white/60 shrink-0"
                  onClick={e => { e.stopPropagation(); removeFile(f.id); }}
                >
                  <X className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
