const API_BASE_URL = import.meta.env.VITE_API_URL as string;

const TOKEN_KEY = 'jobtrace_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiFetchOptions extends RequestInit {
  /** Skip the global "clear token + redirect to /login" behavior on 401.
   * Use for endpoints where a 401 doesn't mean the app session expired
   * (e.g. /gmail/token, which returns 401 for a revoked Gmail connection). */
  skipAuthRedirect?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { skipAuthRedirect, ...init } = options;
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (res.status === 401 && !skipAuthRedirect) {
    clearToken();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Unauthorized');
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, body?.message ?? 'Request failed');
  }

  return body as T;
}
