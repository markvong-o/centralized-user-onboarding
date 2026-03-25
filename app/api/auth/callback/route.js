import { NextResponse } from 'next/server';
import { setSession } from '../../../../lib/session';

const ADMIN_EMAILS = ['mark.vong@atko.email'];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    console.error('Okta authorize error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Validate state
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!state || state !== storedState) {
    console.error('OAuth state mismatch');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Exchange authorization code for tokens
  const issuer = process.env.OKTA_ISSUER;
  const clientId = process.env.OKTA_CLIENT_ID;
  const clientSecret = process.env.OKTA_CLIENT_SECRET;
  const redirectUri = process.env.OKTA_REDIRECT_URI;

  const tokenRes = await fetch(`${issuer}/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error('Token exchange failed:', tokenRes.status, text);
    return NextResponse.redirect(new URL('/', request.url));
  }

  const tokens = await tokenRes.json();

  // Decode ID token claims (trusted — received directly from Okta over TLS)
  const idPayload = JSON.parse(
    Buffer.from(tokens.id_token.split('.')[1], 'base64').toString()
  );

  const response = NextResponse.redirect(new URL('/dashboard', request.url));

  // Clear the oauth_state cookie
  response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' });

  // Create app session
  const email = idPayload.email || idPayload.sub;
  setSession(response, {
    name: idPayload.name || '',
    email,
    role: ADMIN_EMAILS.includes(email) ? 'admin' : 'employee',
    idToken: tokens.id_token || '',
    accessToken: tokens.access_token || '',
  });

  return response;
}
