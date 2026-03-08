/* AuthGuard — Ensures the user is authenticated before rendering children */
import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, fetchMe } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!user && !isLoading) {
      fetchMe().catch(() => {/* not logged in */});
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight">GROW</span>
            <span className="text-2xl font-black tracking-tight text-primary">YouR NEED</span>
          </div>
          <div className="flex flex-col gap-3 w-64">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
