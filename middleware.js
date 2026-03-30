import { NextResponse } from 'next/server';

const COOKIE_NAME = '__session';

// Edge-compatible decrypt using Web Crypto API
async function decryptEdge(token) {
  try {
    const hex = process.env.SESSION_SECRET;
    if (!hex || hex.length !== 64) return null;
    const keyBytes = new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
    const raw = Uint8Array.from(atob(token), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const ciphertextWithTag = raw.slice(12);
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertextWithTag);
    const payload = JSON.parse(new TextDecoder().decode(plaintext));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

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

export async function middleware(request) {
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
    const session = await decryptEdge(cookie.value);
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
