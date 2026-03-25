import { NextResponse } from 'next/server';
const { decrypt } = require('./lib/session');

export const runtime = 'nodejs';

const COOKIE_NAME = '__session';

// Routes that redirect to /dashboard if the user IS logged in
const PUBLIC_ONLY = ['/'];

// Routes that require authentication (redirect to / if NOT logged in)
const PROTECTED = [
  '/dashboard',
  '/register',
  '/success',
  '/profile',
  '/users',
  '/departments',
  '/reports',
  '/settings',
];

// Routes that require admin role (redirect to /dashboard if not admin)
const ADMIN_ONLY = ['/register', '/users', '/reports', '/settings'];

export function middleware(request) {
  const cookie = request.cookies.get(COOKIE_NAME);
  const hasSession = !!cookie?.value;
  const { pathname } = request.nextUrl;

  if (hasSession && PUBLIC_ONLY.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!hasSession && PROTECTED.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Admin-only route protection
  if (hasSession && ADMIN_ONLY.includes(pathname)) {
    const session = decrypt(cookie.value);
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/register',
    '/success',
    '/profile',
    '/users',
    '/departments',
    '/reports',
    '/settings',
  ],
};
