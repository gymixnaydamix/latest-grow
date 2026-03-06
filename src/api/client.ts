const API_BASE = '/api';

interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

class ApiClient {
  private csrfToken: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  /** Register a callback for 401 responses (e.g. auto-logout) */
  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  /** Fetch a CSRF token before mutating requests */
  private async ensureCsrf(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    const res = await fetch(`${API_BASE}/auth/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    this.csrfToken = data.data?.token ?? data.token ?? '';
    return this.csrfToken!;
  }

  /** Core request method */
  async request<T = unknown>(path: string, options: FetchOptions = {}, isFormData = false): Promise<T> {
    const { body, headers: extraHeaders, method = 'GET', ...rest } = options;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(extraHeaders as Record<string, string>),
    };

    // Attach CSRF for mutating requests
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
      const token = await this.ensureCsrf();
      headers['x-csrf-token'] = token;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: isFormData ? (body as BodyInit) : body ? JSON.stringify(body) : undefined,
      ...rest,
    });

    if (!res.ok) {
      if (res.status === 401 && this.onUnauthorized && !path.includes('/auth/')) {
        this.onUnauthorized();
      }
      const errBody = await res.json().catch(() => ({}));
      // Backend returns { error: "string" } or { error: { message: "string" } }
      const message =
        (typeof errBody?.error === 'string' ? errBody.error : errBody?.error?.message) ||
        errBody?.message ||
        `HTTP ${res.status}`;
      throw new ApiError(message, res.status, errBody);
    }

    return res.json();
  }

  // Convenience wrappers
  get<T = unknown>(path: string) {
    return this.request<T>(path);
  }
  post<T = unknown>(path: string, body?: unknown, isFormData = false) {
    return this.request<T>(path, { method: 'POST', body }, isFormData);
  }
  patch<T = unknown>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PATCH', body });
  }
  put<T = unknown>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body });
  }
  del<T = unknown>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }

  /** Invalidate CSRF token (e.g. after logout) */
  clearCsrf() {
    this.csrfToken = null;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = new ApiClient();
