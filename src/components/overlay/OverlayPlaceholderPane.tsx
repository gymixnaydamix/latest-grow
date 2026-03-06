import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { OverlayAppId } from '@/overlay/overlay-registry';

export interface OverlayPlaceholderPaneProps {
  appId: OverlayAppId;
  appLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
}

export default function OverlayPlaceholderPane({
  appId,
  appLabel,
  primaryLabel,
  secondaryLabel,
}: OverlayPlaceholderPaneProps) {
  return (
    <div className="h-full w-full p-4 lg:p-6">
      <Card className="border-border bg-card/95">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {appId}
            </Badge>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {primaryLabel}
            </Badge>
            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
              {secondaryLabel}
            </Badge>
          </div>
          <CardTitle className="text-lg text-foreground">{appLabel} Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This overlay route is wired and stateful. Content for this specific tool can now be implemented
            without changing shell or navigation behavior.
          </p>
          <p>
            Current view: <span className="text-foreground/90">{primaryLabel}</span> /{' '}
            <span className="text-foreground/90">{secondaryLabel}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
