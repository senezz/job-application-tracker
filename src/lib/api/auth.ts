import { apiFetch, setToken } from './client';

interface AuthResponse {
  token: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  createdAt: string;
}

export async function login(email: string, password: string): Promise<void> {
  const { token } = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
}

export async function register(email: string, password: string): Promise<void> {
  const { token } = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(token);
}

export function getCurrentUser(): Promise<CurrentUser> {
  return apiFetch<CurrentUser>('/auth/me');
}
