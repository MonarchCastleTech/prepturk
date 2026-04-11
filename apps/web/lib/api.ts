const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiOptions extends RequestInit {
  token?: string;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers: extraHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Sunucu hatasi' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as unknown as T;

  return res.json();
}

export function apiGet<T>(path: string, token?: string) {
  return api<T>(path, { method: 'GET', token });
}

export function apiPost<T>(path: string, body: unknown, token?: string) {
  return api<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export function apiPut<T>(path: string, body: unknown, token?: string) {
  return api<T>(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    token,
  });
}

export function apiDelete<T>(path: string, token?: string) {
  return api<T>(path, { method: 'DELETE', token });
}

export { API_URL };
