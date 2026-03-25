'use client';

import { useState } from 'react';
import { registerUser } from './actions';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.target);
    const result = await registerUser(formData);

    if (result.success) {
      window.location.href = '/success';
    } else {
      setError(result.message);
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass">
          <h1>Onboard New Employee</h1>
          <p className="subtitle">
            Add a new team member to Crestwood. They will receive an activation
            email to complete their account setup.
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
              <label htmlFor="email">Work Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@crestwood.com"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                name="department"
                type="text"
                placeholder="e.g. Engineering, Marketing"
              />
            </div>

            <div className="field">
              <label htmlFor="title">Job Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Software Engineer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? 'Onboarding...' : 'Onboard Employee'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
