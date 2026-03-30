'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { activateAccount } from './actions';

export default function ActivatePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="page-center">
        <div className="page-wrap">
          <div className="card glass" style={{ textAlign: 'center' }}>
            <h1>Invalid Link</h1>
            <p className="subtitle">
              This activation link is invalid or has expired. Please contact your
              administrator for a new one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="page-center">
        <div className="page-wrap">
          <div className="card glass" style={{ textAlign: 'center' }}>
            <div className="success-icon">&#10003;</div>
            <h1>You're All Set</h1>
            <p className="subtitle">
              Your password has been set. You can now sign in to Crestwood.
            </p>
            <a href="/api/auth/login" className="btn btn-primary">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    formData.set('token', token);
    const result = await activateAccount(formData);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass">
          <h1>Set Up Your Password</h1>
          <p className="subtitle">
            Welcome to Crestwood. Choose a password to activate your account.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
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

            <div className="field" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? 'Activating...' : 'Activate Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
