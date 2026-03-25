'use client';

import { useState, useRef, useEffect } from 'react';

function getInitials(name, email) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return '?';
}

export default function AvatarMenu({ name, email, role }) {
  const isAdmin = role === 'admin';
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="avatar-wrapper" ref={wrapperRef}>
      <button
        className="avatar-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {getInitials(name, email)}
      </button>

      {open && (
        <div className="avatar-menu" role="menu">
          <div className="avatar-menu-header">
            <div className="avatar-menu-name">{name}</div>
            <div className="avatar-menu-email">{email}</div>
          </div>
          <div className="avatar-menu-divider" />
          <a href="/dashboard" className="avatar-menu-item" role="menuitem">
            Dashboard
          </a>
          <a href="/profile" className="avatar-menu-item" role="menuitem">
            Profile
          </a>
          {isAdmin && (
            <a href="/users" className="avatar-menu-item" role="menuitem">
              Employees
            </a>
          )}
          <div className="avatar-menu-divider" />
          <a href="/api/auth/logout" className="avatar-menu-item" role="menuitem">
            Logout
          </a>
        </div>
      )}
    </div>
  );
}
