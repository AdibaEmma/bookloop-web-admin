import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  apiBaseUrl,
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  setAuthCookies,
  clearAuthCookies,
} from '@/lib/auth-cookies';

/**
 * BFF proxy. The admin client calls `/api/proxy/<path>` (same-origin), and this
 * handler forwards it to the BookLoop API with the access token pulled from the
 * httpOnly cookie — so the token is never exposed to browser JS. On a 401 it
 * transparently refreshes once with the refresh cookie, rotates the cookies, and
 * retries. If that fails, it clears the session so the client redirects to login.
 */
async function handle(
  request: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  const target = `${apiBaseUrl()}/${path.join('/')}${request.nextUrl.search}`;

  const cookieStore = await cookies();
  let accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  const method = request.method;
  const rawBody =
    method === 'GET' || method === 'HEAD' ? undefined : await request.text();

  const forward = (token?: string) =>
    fetch(target, {
      method,
      headers: {
        'Content-Type':
          request.headers.get('content-type') || 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: rawBody && rawBody.length ? rawBody : undefined,
    });

  let apiRes = await forward(accessToken);
  let rotated: { access_token: string; refresh_token?: string } | null = null;

  if (apiRes.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${apiBaseUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => null);

    if (refreshRes?.ok) {
      const refreshData = await refreshRes.json().catch(() => ({}));
      const tokens = (refreshData?.result ?? refreshData)?.tokens;
      if (tokens?.access_token) {
        rotated = tokens;
        accessToken = tokens.access_token;
        apiRes = await forward(accessToken);
      }
    }
  }

  const text = await apiRes.text();
  const response = new NextResponse(text, {
    status: apiRes.status,
    headers: {
      'Content-Type': apiRes.headers.get('content-type') || 'application/json',
    },
  });

  if (rotated) setAuthCookies(response, rotated);
  // Still unauthorized after the refresh attempt → the session is dead.
  if (apiRes.status === 401) clearAuthCookies(response);

  return response;
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
};
