import type { NextResponse } from 'next/server';

/**
 * Admin session cookies. These are httpOnly — the browser JS never sees the
 * tokens (unlike the old localStorage scheme), so XSS can't exfiltrate them.
 * They are set/cleared only by the server-side route handlers in app/api/auth.
 */
export const ACCESS_COOKIE = 'admin_access';
export const REFRESH_COOKIE = 'admin_refresh';

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days — the proxy keeps the access token fresh

/** Base URL of the BookLoop API. Prefer a server-only var; fall back to the public one. */
export function apiBaseUrl(): string {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:8000/api/v1'
  );
}

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export function setAuthCookies(
  res: NextResponse,
  tokens: { access_token: string; refresh_token?: string },
): void {
  res.cookies.set(ACCESS_COOKIE, tokens.access_token, { ...baseCookie, maxAge: MAX_AGE });
  if (tokens.refresh_token) {
    res.cookies.set(REFRESH_COOKIE, tokens.refresh_token, { ...baseCookie, maxAge: MAX_AGE });
  }
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set(ACCESS_COOKIE, '', { ...baseCookie, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, '', { ...baseCookie, maxAge: 0 });
}
