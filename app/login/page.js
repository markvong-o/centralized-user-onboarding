'use client';

import { useState } from 'react';
import { loginAdmin } from './actions';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const result = await loginAdmin(formData);

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
          <h1>Admin Login</h1>
          <p className="subtitle">
            Sign in to the Crestwood People portal to manage employee onboarding.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@crestwood.com"
                required
              />
            </div>

            <div className="field" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
