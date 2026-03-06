/* ─── DataTable ─── Holographic reusable table with sort, search, pagination ── */
import { useState, useMemo, useCallback, type ReactNode } from 'react';
import {
  ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  Search, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────────────────────────────── */
export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchKeys?: string[];
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

/* ── Component ─────────────────────────────────────────────────────── */
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchable = true,
  searchKeys,
  pageSize = 10,
  emptyMessage = 'No data available',
  className,
  onRowClick,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  /* Filter */
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    const keys = searchKeys ?? columns.map(c => c.key);
    return data.filter(row =>
      keys.some(k => String(row[k] ?? '').toLowerCase().includes(q)),
    );
  }, [data, search, searchKeys, columns]);

  /* Sort */
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number')
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortKey, sortDir]);

  /* Paginate */
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const clampedPage = Math.min(page, totalPages);
  const paged = sorted.slice((clampedPage - 1) * pageSize, clampedPage * pageSize);

  const toggleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  }, [sortKey]);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 size-3 opacity-30" />;
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 size-3 text-indigo-400" />
      : <ArrowDown className="ml-1 size-3 text-indigo-400" />;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search */}
      {searchable && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search…"
            className="pl-9 border-white/10 bg-white/5 text-white/80 placeholder:text-white/25"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-white/6 bg-white/3 backdrop-blur-xl">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-left font-medium text-white/50',
                    col.sortable && 'cursor-pointer select-none hover:text-white/70 transition-colors',
                    col.className,
                  )}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  <span className="inline-flex items-center">
                    {col.header}
                    {col.sortable && <SortIcon col={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-white/30">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, ri) => (
                <tr
                  key={ri}
                  className={cn(
                    'border-b border-white/4 transition-colors hover:bg-white/4',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td key={col.key} className={cn('px-4 py-3 text-white/70', col.className)}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-white/40">
        <span>
          Showing {((clampedPage - 1) * pageSize) + 1}–{Math.min(clampedPage * pageSize, sorted.length)} of{' '}
          <Badge variant="outline" className="mx-1 text-[10px] border-white/10 text-white/50">{sorted.length}</Badge> results
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-7" disabled={clampedPage <= 1} onClick={() => setPage(1)}>
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" disabled={clampedPage <= 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="min-w-[4rem] text-center text-white/60">
            {clampedPage} / {totalPages}
          </span>
          <Button variant="ghost" size="icon" className="size-7" disabled={clampedPage >= totalPages} onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="size-7" disabled={clampedPage >= totalPages} onClick={() => setPage(totalPages)}>
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
