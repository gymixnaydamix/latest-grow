import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

/* Lazy-load providers — defers @tanstack/react-query + next-themes from critical path */
const Providers = lazy(() =>
  import('./Providers').then(m => ({ default: m.Providers }))
);

/* Lazy-load Toaster — it's non-critical for initial render */
const LazyToaster = lazy(() =>
  import('./components/ui/sonner').then(m => ({ default: m.Toaster }))
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Providers>
          <App />
          <Suspense fallback={null}>
            <LazyToaster position="bottom-right" richColors closeButton />
          </Suspense>
        </Providers>
      </Suspense>
    </BrowserRouter>
  </React.StrictMode>,
);
