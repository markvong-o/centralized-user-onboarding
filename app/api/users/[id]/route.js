import { cookies } from 'next/headers';
import { getSession } from '../../../../lib/session';
import { updateUser, deleteUser } from '../../../../lib/okta-admin';

export async function PUT(request, { params }) {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { firstName, lastName, email } = body;

  try {
    const updated = await updateUser(id, { firstName, lastName, email });
    return Response.json({
      id: updated.id,
      firstName: updated.profile?.firstName || '',
      lastName: updated.profile?.lastName || '',
      email: updated.profile?.email || '',
      status: updated.status || '',
    });
  } catch (err) {
    console.error('Error updating user:', err);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  if (!session) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteUser(id);
    return Response.json({ success: true });
  } catch (err) {
    console.error('Error deleting user:', err);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
