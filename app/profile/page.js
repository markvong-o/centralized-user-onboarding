'use client';

import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then((data) => setProfile(data.profile))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-center">
        <div className="page-wrap">
          <div className="card glass" style={{ textAlign: 'center' }}>
            <p className="subtitle">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-center">
        <div className="page-wrap">
          <div className="card glass">
            <h1>Profile</h1>
            <div className="error-banner">{error}</div>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <a href="/dashboard" className="btn btn-secondary">
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { label: 'First Name', value: profile.firstName },
    { label: 'Last Name', value: profile.lastName },
    { label: 'Email', value: profile.email },
    { label: 'Login', value: profile.login },
    { label: 'Display Name', value: profile.displayName },
    { label: 'Locale', value: profile.locale },
    { label: 'Time Zone', value: profile.timeZone },
  ].filter((f) => f.value);

  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass">
          <h1>My Profile</h1>
          <p className="subtitle">Your Crestwood employee profile.</p>

          <div className="profile-grid">
            {fields.map((f) => (
              <div key={f.label} className="profile-field">
                <span className="profile-label">{f.label}</span>
                <span className="profile-value">{f.value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <a href="/dashboard" className="btn btn-secondary">
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
