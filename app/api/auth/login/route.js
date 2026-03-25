import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request) {
  const issuer = process.env.OKTA_ISSUER;
  const clientId = process.env.OKTA_CLIENT_ID;
  const redirectUri = process.env.OKTA_REDIRECT_URI;
  const scopes = process.env.OKTA_SCOPES || 'openid profile email';

  const state = crypto.randomBytes(16).toString('hex');

  const authorizeUrl = new URL(`${issuer}/v1/authorize`);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', scopes);
  authorizeUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authorizeUrl.toString());

  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  });

  return response;
}
