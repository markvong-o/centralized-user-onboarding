'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function StatusBadge({ status }) {
  const s = (status || '').toUpperCase();
  let cls = 'badge';
  if (s === 'ACTIVE') cls += ' badge-active';
  else if (s === 'STAGED') cls += ' badge-staged';
  else if (s === 'PROVISIONED') cls += ' badge-provisioned';
  else if (s === 'DEPROVISIONED') cls += ' badge-deprovisioned';
  return <span className={cls}>{s || 'Unknown'}</span>;
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to load employees');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(user) {
    setEditingId(user.id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ firstName: '', lastName: '', email: '' });
  }

  async function saveEdit(id) {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error('Failed to update employee');
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, firstName: updated.firstName, lastName: updated.lastName, email: updated.email }
            : u
        )
      );
      setEditingId(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user) {
    if (!confirm(`Remove ${user.firstName} ${user.lastName} (${user.email})? This will deactivate and delete the user from Okta.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove employee');
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="page-wrap-wide">
        <div className="card glass" style={{ textAlign: 'center' }}>
          <p className="subtitle">Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrap-wide">
        <div className="card glass">
          <h1>Employees</h1>
          <div className="error-banner">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap-wide">
      <div className="users-header">
        <h1>Employees</h1>
        <Link href="/register" className="btn btn-primary btn-sm">
          + Add Employee
        </Link>
      </div>

      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                  No employees found. <Link href="/register">Onboard your first employee</Link>.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id}>
                {editingId === user.id ? (
                  <>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <input
                          className="inline-edit-input"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                          placeholder="First"
                        />
                        <input
                          className="inline-edit-input"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                          placeholder="Last"
                        />
                      </div>
                    </td>
                    <td>
                      <input
                        className="inline-edit-input"
                        value={editForm.email}
                        onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="Email"
                      />
                    </td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveEdit(user.id)}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td><StatusBadge status={user.status} /></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => startEdit(user)}>
                          Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
