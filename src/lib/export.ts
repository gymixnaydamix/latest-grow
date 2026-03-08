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

/**
 * Generate a report by calling the backend and downloading the result.
 */
export async function generateReport(schoolId: string, type: string, format: 'pdf' | 'csv' = 'pdf') {
  try {
    const res = await apiClient.get<{ data: { url?: string; csv?: string; report?: unknown } }>(
      `/admin/schools/${schoolId}/reports/${encodeURIComponent(type)}?format=${encodeURIComponent(format)}`
    );
    const result = (res as any)?.data ?? res;
    if (result?.url) {
      downloadFromUrl(result.url, `${type}-report.${format}`);
    } else if (result?.csv) {
      const blob = new Blob([result.csv], { type: 'text/csv' });
      downloadFromUrl(URL.createObjectURL(blob), `${type}-report.csv`);
    } else if (format === 'csv' && result?.report) {
      const items = Array.isArray(result.report) ? result.report : [result.report];
      exportToCsv(items, `${type}-report.csv`);
    }
    return result;
  } catch {
    // Fallback: export client-side data 
    return null;
  }
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
}) {
  return apiClient.request(`/admin/schools/${schoolId}/notifications/send`, {
    method: 'POST',
    body: payload,
  });
}
