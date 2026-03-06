/* ─── NotFoundPage ─── 404 with animated illustration ────────────── */
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center bg-background">
      {/* Large 404 */}
      <div data-four className="select-none animate-scale-up">
        <span className="text-[8rem] font-black leading-none tracking-tighter text-primary/15 sm:text-[12rem]">
          404
        </span>
      </div>

      {/* Message */}
      <div data-message className="-mt-8 max-w-sm space-y-2 animate-fade-up" style={{ '--delay': '200ms' } as React.CSSProperties}>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Actions */}
      <div data-actions className="flex gap-3 animate-fade-up" style={{ '--delay': '350ms' } as React.CSSProperties}>
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="mr-1 size-3" /> Go Back
          </Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/">
            <Home className="mr-1 size-3" /> Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
