const { OktaAuth } = require('@okta/okta-auth-js');

/**
 * Creates a new OktaAuth instance configured for server-side use.
 * Each call returns a fresh instance with its own in-memory storage,
 * so concurrent requests don't share IDX transaction state.
 */
function getAuthClient() {
  const issuer = process.env.OKTA_ISSUER;
  const clientId = process.env.OKTA_CLIENT_ID;
  const clientSecret = process.env.OKTA_CLIENT_SECRET;
  const redirectUri = process.env.OKTA_REDIRECT_URI;
  const scopes = (process.env.OKTA_SCOPES || 'openid profile email').split(' ');

  // In-memory storage provider for server-side use (no browser sessionStorage)
  const store = new Map();
  const storageProvider = {
    getItem(key) {
      return store.get(key) || null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };

  const authClient = new OktaAuth({
    issuer,
    clientId,
    clientSecret,
    redirectUri,
    scopes,
    storageManager: {
      token: { storageProvider },
      transaction: { storageProvider },
      shared: { storageProvider },
    },
    idx: {
      enableLegacyMode: true,
    },
  });

  return authClient;
}

module.exports = { getAuthClient };
