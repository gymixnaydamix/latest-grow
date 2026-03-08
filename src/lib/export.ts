/* ─── Export / Download Utilities ─── */
import { api as apiClient } from '@/api/client';

/**
 * Trigger a file download by creating a temporary anchor element.
 * Works for both blob URLs and API endpoints that return files.
 */
export function downloadFromUrl(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => document.body.removeChild(a), 100);
}

/**
 * Export data as CSV. Converts an array of objects to a CSV file and triggers download.
 */
export function exportToCsv(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const v = row[h];
      const str = v == null ? '' : String(v);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadFromUrl(URL.createObjectURL(blob), filename);
}

/**
 * Export data as JSON file download.
 */
export function exportToJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadFromUrl(URL.createObjectURL(blob), filename);
}

/**
 * Fetch a file from an API endpoint and trigger download.
 * Handles PDF, CSV, and other binary responses.
 */
export async function downloadFromApi(path: string, filename: string) {
  const res = await fetch(`/api${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Download failed: ${res.statusText}`);
  const blob = await res.blob();
  downloadFromUrl(URL.createObjectURL(blob), filename);
}

/**
 * Copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

/** Report data response from the backend */
export interface ReportResponse {
  type: string;
  url?: string;
  csv?: string;
  [key: string]: unknown;
}

/**
 * Generate a report by calling the backend GET endpoint and downloading the result.
 * The backend route is GET /admin/schools/:schoolId/reports/:type
 */
export async function generateReport(schoolId: string, type: string, format: 'pdf' | 'csv' = 'pdf'): Promise<ReportResponse> {
  const res = await apiClient.get<{ success: boolean; data: ReportResponse }>(
    `/admin/schools/${schoolId}/reports/${encodeURIComponent(type)}?format=${format}`
  );

  const result = (res as any)?.data ?? res;

  if (result?.url) {
    downloadFromUrl(result.url, `${type}-report.${format}`);
  } else if (result?.csv) {
    const blob = new Blob([result.csv], { type: 'text/csv' });
    downloadFromUrl(URL.createObjectURL(blob), `${type}-report.csv`);
  } else if (format === 'csv') {
    // Auto-convert the response data into CSV
    const exportable = extractExportableArray(result);
    if (exportable.length > 0) {
      exportToCsv(exportable, `${type}-report.csv`);
    }
  }

  return result as ReportResponse;
}

/**
 * Extract the first array property from a report result for CSV export.
 */
function extractExportableArray(data: Record<string, unknown>): Record<string, unknown>[] {
  if (!data || typeof data !== 'object') return [];
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      return value as Record<string, unknown>[];
    }
  }
  // If no nested array, wrap the data itself (minus type field)
  const { type: _type, ...rest } = data;
  return Object.keys(rest).length > 0 ? [rest] : [];
}

/**
 * Send a notification/email via the backend.
 */
export async function sendNotification(schoolId: string, payload: {
  type: 'email' | 'sms' | 'push';
  recipientId?: string;
  recipientEmail?: string;
  subject: string;
  body: string;
}): Promise<{ id: string; channel: string; status: string }> {
  const res = await apiClient.post<{ success: boolean; data: { id: string; channel: string; status: string } }>(
    `/admin/schools/${schoolId}/notifications/send`,
    payload,
  );
  return (res as any)?.data ?? res;
}
