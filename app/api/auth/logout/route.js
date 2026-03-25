import { NextResponse } from 'next/server';
import { getSession, clearSession } from '../../../../lib/session';

export async function GET(request) {
  const session = getSession(request.cookies);
  const postLogoutRedirect = new URL('/', request.url).toString();

  // Build Okta logout URL to end the Okta session
  const issuer = process.env.OKTA_ISSUER;
  const clientId = process.env.OKTA_CLIENT_ID;
  const params = new URLSearchParams({
    client_id: clientId,
    post_logout_redirect_uri: postLogoutRedirect,
  });
  if (session?.idToken) {
    params.set('id_token_hint', session.idToken);
  }

  const response = NextResponse.redirect(`${issuer}/v1/logout?${params}`);
  clearSession(response);
  return response;
}
