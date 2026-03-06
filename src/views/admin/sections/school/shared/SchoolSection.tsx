import type { ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SchoolSectionShellProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function SchoolSectionShell({ title, description, actions, children }: SchoolSectionShellProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3" data-animate>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

interface DataStateProps {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  loadingLabel?: string;
  emptyLabel?: string;
  errorLabel?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function DataState({
  isLoading,
  isError,
  isEmpty,
  loadingLabel = 'Loading...',
  emptyLabel = 'No records found',
  errorLabel = 'Failed to load records',
  onRetry,
  children,
}: DataStateProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          {loadingLabel}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-2 py-8">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="size-4" />
            {errorLabel}
          </div>
          {onRetry ? <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button> : null}
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">{emptyLabel}</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return <>{children}</>;
}
