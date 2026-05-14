/**
 * apiFetch — base fetch wrapper for the auth backend.
 *
 * - Automatically attaches the Bearer access token from the in-memory store.
 * - On 401 TOKEN_EXPIRED, attempts one silent refresh then retries.
 * - Throws typed ApiError on non-ok responses.
 */

// ── In-memory access token store ────────────────────────────────────────────────
// Never persisted to localStorage / cookies (XSS safety).
// Survives React re-renders because it lives at module scope.

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

// ── ApiError ─────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status: number, code?: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// ── Core fetch ───────────────────────────────────────────────────────────────────

const BASE_URL = "";  // same origin — Vite proxy handles /auth → :4000

async function _rawFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`;
  }

  return fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include",   // send cookies (refresh_token)
    headers,
  });
}

async function _handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    // non-JSON response
  }

  if (!res.ok) {
    const message =
      (json as Record<string, string> | null)?.error ||
      (json as Record<string, string> | null)?.message ||
      `HTTP ${res.status}`;
    const code = (json as Record<string, string> | null)?.code;
    throw new ApiError(message, res.status, code, json);
  }

  return (json ?? text) as T;
}

let _isRefreshing = false;
let _refreshPromise: Promise<void> | null = null;

async function _silentRefresh(): Promise<void> {
  if (_isRefreshing && _refreshPromise) return _refreshPromise;

  _isRefreshing = true;
  _refreshPromise = (async () => {
    try {
      const res = await _rawFetch("/auth/refresh", { method: "POST" });
      const data = await _handleResponse<{ accessToken: string }>(res);
      setAccessToken(data.accessToken);
    } finally {
      _isRefreshing = false;
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

/**
 * apiFetch — smart fetch with auto-refresh on 401 TOKEN_EXPIRED.
 */
export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await _rawFetch(path, init);

  // Attempt silent token refresh on access-token expiry
  if (res.status === 401) {
    const text = await res.clone().text();
    let json: Record<string, string> | null = null;
    try {
      json = JSON.parse(text);
    } catch { /* ignore */ }

    if (json?.code === "TOKEN_EXPIRED") {
      await _silentRefresh();
      // Retry once with the new token
      const retried = await _rawFetch(path, init);
      return _handleResponse<T>(retried);
    }
  }

  return _handleResponse<T>(res);
}
