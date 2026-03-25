/**
 * Okta Management API helper.
 * Uses OKTA_API_TOKEN (SSWS) for admin operations.
 */

function getOrgUrl() {
  const issuer = process.env.OKTA_ISSUER; // e.g. https://thecrownlands.okta.com/oauth2/default
  return issuer.replace(/\/oauth2\/.*$/, '');
}

function getHeaders() {
  return {
    Authorization: `SSWS ${process.env.OKTA_API_TOKEN}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
}

async function listAppUsers() {
  const orgUrl = getOrgUrl();
  const appId = process.env.OKTA_APP_ID;
  const res = await fetch(`${orgUrl}/api/v1/apps/${appId}/users`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list app users: ${res.status} ${text}`);
  }
  return res.json();
}

async function getUser(userId) {
  const orgUrl = getOrgUrl();
  const res = await fetch(`${orgUrl}/api/v1/users/${userId}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get user: ${res.status} ${text}`);
  }
  return res.json();
}

async function updateUser(userId, profile) {
  const orgUrl = getOrgUrl();
  const res = await fetch(`${orgUrl}/api/v1/users/${userId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ profile }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update user: ${res.status} ${text}`);
  }
  return res.json();
}

async function deactivateUser(userId) {
  const orgUrl = getOrgUrl();
  const res = await fetch(`${orgUrl}/api/v1/users/${userId}/lifecycle/deactivate`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to deactivate user: ${res.status} ${text}`);
  }
  return res.ok;
}

async function deleteUser(userId) {
  const orgUrl = getOrgUrl();
  // Deactivate first (required before deletion), then delete
  await deactivateUser(userId);
  const res = await fetch(`${orgUrl}/api/v1/users/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete user: ${res.status} ${text}`);
  }
  return true;
}

async function getUserByEmail(email) {
  const orgUrl = getOrgUrl();
  const res = await fetch(`${orgUrl}/api/v1/users/${encodeURIComponent(email)}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get user by email: ${res.status} ${text}`);
  }
  return res.json();
}

async function resetPassword(userId) {
  const orgUrl = getOrgUrl();
  const res = await fetch(`${orgUrl}/api/v1/users/${userId}/lifecycle/reset_password?sendEmail=false`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to reset password: ${res.status} ${text}`);
  }
  return res.json();
}

/**
 * Complete a password reset using a recovery token.
 * 1. Exchange recovery token for a state token via /authn/recovery/token
 * 2. Set the new password via /authn/credentials/reset_password
 */
async function completePasswordReset(recoveryToken, newPassword) {
  const orgUrl = getOrgUrl();

  // Step 1: Exchange recovery token for state token
  const tokenRes = await fetch(`${orgUrl}/api/v1/authn/recovery/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ recoveryToken }),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Failed to validate recovery token: ${tokenRes.status} ${text}`);
  }
  const tokenData = await tokenRes.json();
  const stateToken = tokenData.stateToken;

  // Step 2: Set the new password
  const resetRes = await fetch(`${orgUrl}/api/v1/authn/credentials/reset_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ stateToken, newPassword }),
  });
  if (!resetRes.ok) {
    const text = await resetRes.text();
    throw new Error(`Failed to set new password: ${resetRes.status} ${text}`);
  }
  return resetRes.json();
}

module.exports = { listAppUsers, getUser, getUserByEmail, resetPassword, completePasswordReset, updateUser, deactivateUser, deleteUser };
