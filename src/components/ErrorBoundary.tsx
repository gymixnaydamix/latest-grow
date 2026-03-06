/* ─── ErrorBoundary ─── Catch React rendering errors gracefully ───── */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    /* Lightweight fallback — no shadcn/radix/icons to keep off critical path */
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ width: '100%', maxWidth: '28rem', textAlign: 'center', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Something went wrong</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
            An unexpected error occurred. You can try recovering or reload the page.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <pre style={{ maxHeight: '8rem', overflow: 'auto', background: 'var(--muted)', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.75rem', textAlign: 'left', color: 'var(--destructive)', marginBottom: '1rem' }}>
              {this.state.error.message}
            </pre>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              onClick={this.handleReset}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '0.375rem', border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
            >
              Try Again
            </button>
            <button
              onClick={this.handleReload}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', borderRadius: '0.375rem', border: 'none', background: 'var(--primary)', color: 'var(--primary-foreground)', cursor: 'pointer' }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}
