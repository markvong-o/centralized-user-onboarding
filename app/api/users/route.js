import { cookies } from 'next/headers';
import { getSession } from '../../../lib/session';
import { listAppUsers } from '../../../lib/okta-admin';

export async function GET() {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const appUsers = await listAppUsers();

    const users = appUsers.map((appUser) => ({
      id: appUser.id,
      firstName: appUser.profile?.firstName || '',
      lastName: appUser.profile?.lastName || '',
      email: appUser.profile?.email || appUser.credentials?.userName || '',
      status: appUser.status || '',
      created: appUser.created || '',
    }));

    return Response.json(users);
  } catch (err) {
    console.error('Error listing users:', err);
    return Response.json({ error: 'Failed to list users' }, { status: 500 });
  }
}
