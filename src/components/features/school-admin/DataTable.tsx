/* --- DataTable --- Advanced sortable, filterable table for school admin --- */
import { useEffect, useMemo, useState, type ReactNode, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T, index: number) => ReactNode;
  className?: string;
}

export interface DataTableAction<T> {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  actions?: DataTableAction<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
  pageSize?: number;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCta?: { label: string; onClick: () => void };
  toolbar?: ReactNode;
  onExport?: () => void;
  rowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

type SortDir = 'asc' | 'desc' | null;
interface KeyedRow<T> {
  row: T;
  key: string;
  globalIndex: number;
}

function maybeNumeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      return Number.isFinite(num) ? num : null;
    }
  }
  return null;
}

function maybeTimestamp(value: unknown): number | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const isoLike = /^\d{4}-\d{1,2}-\d{1,2}(?:[ T].*)?$/;
  const slashLike = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/;
  if (!isoLike.test(trimmed) && !slashLike.test(trimmed)) return null;
  const ts = Date.parse(trimmed);
  return Number.isNaN(ts) ? null : ts;
}

function compareSortValues(a: unknown, b: unknown): number {
  const an = maybeNumeric(a);
  const bn = maybeNumeric(b);
  if (an !== null && bn !== null) return an - bn;

  const at = maybeTimestamp(a);
  const bt = maybeTimestamp(b);
  if (at !== null && bt !== null) return at - bt;

  const as = String(a ?? '');
  const bs = String(b ?? '');
  return as.localeCompare(bs, undefined, { numeric: true, sensitivity: 'base' });
}

function computeRowKey<T extends Record<string, unknown>>(row: T, index: number, rowKey?: (row: T) => string): string {
  if (rowKey) return rowKey(row);
  const intrinsic = row.id;
  if (typeof intrinsic === 'string' || typeof intrinsic === 'number') return String(intrinsic);
  return `row-${index}`;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  searchable = true,
  searchPlaceholder = 'Search...',
  selectable,
  onSelectionChange,
  pageSize = 15,
  emptyIcon,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters.',
  emptyCta,
  toolbar,
  onExport,
  rowKey,
  onRowClick,
  loading,
}: Props<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => String((row as Record<string, unknown>)[col.key] ?? '').toLowerCase().includes(q)),
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const cmp = compareSortValues((a as Record<string, unknown>)[sortKey], (b as Record<string, unknown>)[sortKey]);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const keyedSorted = useMemo<KeyedRow<T>[]>(
    () =>
      sorted.map((row, globalIndex) => ({
        row,
        key: computeRowKey(row, globalIndex, rowKey),
        globalIndex,
      })),
    [sorted, rowKey],
  );

  const totalPages = Math.ceil(keyedSorted.length / pageSize);
  const paged = keyedSorted.slice(page * pageSize, (page + 1) * pageSize);

  const pageKeys = paged.map((item) => item.key);
  const selectedOnPage = pageKeys.filter((key) => selected.has(key)).length;
  const minTableWidth = Math.max(640, columns.length * 132 + (selectable ? 48 : 0) + (actions ? 64 : 0));

  useEffect(() => {
    const keysInData = new Set(keyedSorted.map((item) => item.key));
    setSelected((prev) => new Set(Array.from(prev).filter((key) => keysInData.has(key))));
  }, [keyedSorted]);

  useEffect(() => {
    if (totalPages === 0 && page !== 0) {
      setPage(0);
      return;
    }
    if (totalPages > 0 && page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  useEffect(() => {
    if (!onSelectionChange) return;
    if (selected.size === 0) {
      onSelectionChange([]);
      return;
    }
    const selectedRows = keyedSorted.filter((item) => selected.has(item.key)).map((item) => item.row);
    onSelectionChange(selectedRows);
  }, [selected, keyedSorted, onSelectionChange]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : dir === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey(null);
      return;
    }
    setSortKey(key);
    setSortDir('asc');
  };

  const toggleRow = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleAll = () => {
    if (pageKeys.length === 0) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (selectedOnPage === pageKeys.length) {
        pageKeys.forEach((key) => next.delete(key));
      } else {
        pageKeys.forEach((key) => next.add(key));
      }
      return next;
    });
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortKey !== col) return <ChevronsUpDown className="size-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        {searchable && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="h-8 border-border bg-accent pl-9 text-sm"
            />
          </div>
        )}
        <div className="flex-1" />
        {toolbar}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="h-8 border-border text-muted-foreground">
            <Download className="mr-1.5 size-3.5" /> Export
          </Button>
        )}
        {selected.size > 0 && (
          <Badge variant="outline" className="border-primary/30 text-xs text-primary">
            {selected.size} selected
          </Badge>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: `${minTableWidth}px` }}>
          <thead>
            <tr className="border-b border-border bg-card">
              {selectable && (
                <th className="w-10 px-3 py-2.5">
                  <Checkbox checked={selectedOnPage === pageKeys.length && pageKeys.length > 0} onCheckedChange={toggleAll} />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground/60 ${
                    col.sortable !== false ? 'cursor-pointer select-none hover:text-muted-foreground' : ''
                  } ${col.className ?? ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && <SortIcon col={col.key} />}
                  </span>
                </th>
              ))}
              {actions && <th className="w-12 px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {selectable && (
                    <td className="px-3 py-3">
                      <div className="h-4 w-4 animate-pulse rounded bg-accent" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-3">
                      <div className="h-4 animate-pulse rounded bg-accent" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                  {actions && <td className="px-3 py-3" />}
                </tr>
              ))
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    {emptyIcon && <div className="text-muted-foreground/30">{emptyIcon}</div>}
                    <p className="text-sm font-medium text-muted-foreground/70">{emptyTitle}</p>
                    <p className="max-w-xs text-xs text-muted-foreground/40">{emptyDescription}</p>
                    {emptyCta && (
                      <Button size="sm" className="mt-2" onClick={emptyCta.onClick}>
                        {emptyCta.label}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {paged.map(({ row, key, globalIndex }) => (
                  <motion.tr
                    key={key}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`border-b border-border transition-colors ${
                      selected.has(key) ? 'bg-primary/10' : 'hover:bg-muted'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-3 py-2.5" onClick={(event) => event.stopPropagation()}>
                        <Checkbox checked={selected.has(key)} onCheckedChange={() => toggleRow(key)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-3 py-2.5 text-muted-foreground ${col.className ?? ''}`}>
                        {col.render
                          ? col.render((row as Record<string, unknown>)[col.key], row, globalIndex)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-3 py-2.5" onClick={(event) => event.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="size-7 p-0">
                              <MoreHorizontal className="size-4 text-muted-foreground/60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-border bg-popover text-popover-foreground">
                            {actions.map((action) => (
                              <DropdownMenuItem
                                key={action.label}
                                onClick={() => action.onClick(row)}
                                className={action.variant === 'destructive' ? 'text-red-400 focus:text-red-400' : ''}
                              >
                                {action.icon && (
                                  <span className="mr-2">
                                    <action.icon className="size-3.5" />
                                  </span>
                                )}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-xs text-muted-foreground/60">
          <span>
            {keyedSorted.length} record{keyedSorted.length !== 1 ? 's' : ''} | Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((prev) => prev - 1)}
              className="h-7 w-7 p-0"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((prev) => prev + 1)}
              className="h-7 w-7 p-0"
              aria-label="Next page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
