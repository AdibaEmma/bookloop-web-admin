import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { apiBaseUrl, ACCESS_COOKIE, clearAuthCookies } from '@/lib/auth-cookies';

/** Sign out: best-effort server-side logout, then clear the session cookies. */
export async function POST() {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (token) {
    await fetch(`${apiBaseUrl()}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {
      // Best-effort — clear the cookies regardless of the API's response.
    });
  }

  const response = NextResponse.json({ ok: true });
  clearAuthCookies(response);
  return response;
}
