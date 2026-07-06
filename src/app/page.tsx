import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE } from '@/lib/auth-cookies';

/**
 * Entry point. Decided server-side from the session cookie so the browser never
 * flashes the wrong screen: signed in → dashboard, otherwise → login.
 */
export default async function Home() {
  const hasSession = Boolean((await cookies()).get(ACCESS_COOKIE)?.value);
  redirect(hasSession ? '/dashboard' : '/login');
}
