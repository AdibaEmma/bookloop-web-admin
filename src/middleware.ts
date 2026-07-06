import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';

/**
 * Server-side route gate. The dashboard is only reachable with a session cookie,
 * enforced BEFORE the page renders — the old gate was a client-side localStorage
 * check that shipped the admin shell and was trivially bypassable. Because the
 * login route only issues the cookie to admins, its presence implies an admin.
 */
export function middleware(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(ACCESS_COOKIE)?.value);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (pathname === '/login' && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
