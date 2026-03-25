import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div className="placeholder-icon">&#9881;</div>
          <h1>Settings</h1>
          <p className="subtitle">
            App configuration is coming soon. You will be able to manage
            notification preferences, Okta integration settings, and branding here.
          </p>
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
