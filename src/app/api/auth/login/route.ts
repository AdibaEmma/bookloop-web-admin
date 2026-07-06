import { NextResponse } from 'next/server';
import { apiBaseUrl, setAuthCookies } from '@/lib/auth-cookies';

/**
 * Admin login. Authenticates against the BookLoop API, enforces the admin role
 * SERVER-SIDE (the old client check was bypassable), and on success sets the
 * tokens as httpOnly cookies. Only non-sensitive user info is returned to the
 * client — the tokens never touch the browser's JS.
 */
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  const apiRes = await fetch(`${apiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  }).catch(() => null);

  if (!apiRes) {
    return NextResponse.json({ message: 'Could not reach the server' }, { status: 502 });
  }

  const data = await apiRes.json().catch(() => ({}));
  if (!apiRes.ok) {
    return NextResponse.json(
      { message: data?.message || 'Invalid credentials' },
      { status: apiRes.status },
    );
  }

  const result = data?.result ?? data;
  const { tokens, role, ...userData } = result || {};

  if (role !== 'admin') {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }
  if (!tokens?.access_token) {
    return NextResponse.json({ message: 'Login failed' }, { status: 502 });
  }

  const response = NextResponse.json({ user: { ...userData, role } });
  setAuthCookies(response, tokens);
  return response;
}
