import { cookies } from 'next/headers';
import { getSession } from '../../../lib/session';

export async function GET() {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const accessToken = session.accessToken;
  if (!accessToken) {
    return Response.json({ error: 'No access token available' }, { status: 401 });
  }

  const issuer = process.env.OKTA_ISSUER; // e.g. https://thecrownlands.okta.com/oauth2/default
  // Derive the org base URL from the issuer
  const orgUrl = issuer.replace(/\/oauth2\/.*$/, '');

  try {
    const res = await fetch(`${orgUrl}/idp/myaccount/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Okta MyAccount API error:', res.status, text);
      // Fall back to session data
      return Response.json({
        profile: {
          firstName: session.name?.split(' ')[0] || '',
          lastName: session.name?.split(' ').slice(1).join(' ') || '',
          email: session.email || '',
          login: session.email || '',
        },
        source: 'session',
      });
    }

    const data = await res.json();
    return Response.json({
      profile: {
        firstName: data.profile?.firstName || session.name?.split(' ')[0] || '',
        lastName: data.profile?.lastName || session.name?.split(' ').slice(1).join(' ') || '',
        email: data.profile?.email || session.email || '',
        login: data.profile?.login || session.email || '',
        displayName: data.profile?.displayName || session.name || '',
        locale: data.profile?.locale || '',
        timeZone: data.profile?.timeZone || '',
      },
      source: 'okta',
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    // Fall back to session data
    return Response.json({
      profile: {
        firstName: session.name?.split(' ')[0] || '',
        lastName: session.name?.split(' ').slice(1).join(' ') || '',
        email: session.email || '',
        login: session.email || '',
      },
      source: 'session',
    });
  }
}
