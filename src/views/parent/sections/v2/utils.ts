export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDateLabel(value: string | Date | null | undefined): string {
  if (!value) return 'Not scheduled';
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeLabel(value: string | Date | null | undefined): string {
  if (!value) return 'Not available';
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatChildName(
  childId: string | null | undefined,
  children: Array<{ id: string; firstName: string; lastName: string }>,
  fallback = 'Family-wide',
): string {
  if (!childId) return fallback;
  const child = children.find((entry) => entry.id === childId);
  if (!child) return 'Linked child';
  return `${child.firstName} ${child.lastName}`;
}
