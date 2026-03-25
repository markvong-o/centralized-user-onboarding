import Link from 'next/link';
import { cookies } from 'next/headers';
import { getSession } from '../../lib/session';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);
  const isAdmin = session?.role === 'admin';

  return (
    <div className="page-wrap-wide">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--slate)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          {isAdmin
            ? 'Welcome back to Crestwood People. What would you like to do?'
            : 'Welcome to Crestwood People.'}
        </p>
      </div>

      <div className="dash-grid">
        {isAdmin && (
          <Link href="/register" className="dash-card glass">
            <span className="dash-card-icon">+</span>
            <h2>Onboard Employee</h2>
            <p>Register a new team member into Crestwood via Okta.</p>
          </Link>
        )}

        {isAdmin && (
          <Link href="/users" className="dash-card glass">
            <span className="dash-card-icon">&#9782;</span>
            <h2>Employees</h2>
            <p>View, edit, and manage all onboarded employees.</p>
          </Link>
        )}

        <Link href="/departments" className="dash-card glass">
          <span className="dash-card-icon">&#9632;</span>
          <h2>Departments</h2>
          <p>Browse teams and organizational structure.</p>
        </Link>

        {isAdmin && (
          <Link href="/reports" className="dash-card glass">
            <span className="dash-card-icon">&#9776;</span>
            <h2>Reports</h2>
            <p>Workforce analytics, onboarding metrics, and audit logs.</p>
          </Link>
        )}

        <Link href="/profile" className="dash-card glass">
          <span className="dash-card-icon">&#9787;</span>
          <h2>My Profile</h2>
          <p>View and manage your own account information.</p>
        </Link>

        {isAdmin && (
          <Link href="/settings" className="dash-card glass">
            <span className="dash-card-icon">&#9881;</span>
            <h2>Settings</h2>
            <p>App configuration, notifications, and integrations.</p>
          </Link>
        )}
      </div>
    </div>
  );
}
