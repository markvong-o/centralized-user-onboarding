'use client';

import { useState } from 'react';
import { registerAdmin } from './actions';

export default function AdminRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const result = await registerAdmin(formData);

    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass">
          <h1>Register as Admin</h1>
          <p className="subtitle">
            Create your Crestwood People admin account to start onboarding employees
            into Crestwood.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Jane"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@crestwood.com"
                required
              />
            </div>

            <div className="field" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
