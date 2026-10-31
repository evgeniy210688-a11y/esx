import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { safeAccountNext } from '@/lib/account-path';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next');
  const recovery = next === '/account/reset-password';
  const destination = recovery ? '/account/reset-password?verified=1' : safeAccountNext(next);
  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set('Cache-Control', 'no-store');
  if (code) {
    const db = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
      cookies: { getAll: () => request.cookies.getAll(), setAll: values => values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) },
    });
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }
  const failure = NextResponse.redirect(new URL(recovery ? '/account/reset-password?auth_error=1' : '/account?auth_error=1', request.url));
  failure.headers.set('Cache-Control', 'no-store');
  return failure;
}
