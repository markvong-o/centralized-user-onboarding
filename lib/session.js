const crypto = require('crypto');

const COOKIE_NAME = '__session';
const SESSION_TTL = 8 * 60 * 60; // 8 hours in seconds

function getKey() {
  const hex = process.env.SESSION_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error('SESSION_SECRET must be a 64-character hex string (32 bytes)');
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypt a plain object into a base64 token.
 * Format: base64( iv(12) + ciphertext + authTag(16) )
 */
function encrypt(payload) {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(payload);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, ciphertext, authTag]).toString('base64');
}

/**
 * Decrypt a base64 token back into a plain object.
 * Returns null if decryption fails or the session has expired.
 */
function decrypt(token) {
  try {
    const key = getKey();
    const raw = Buffer.from(token, 'base64');
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(raw.length - 16);
    const ciphertext = raw.subarray(12, raw.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
    const payload = JSON.parse(plaintext);
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch (err) {
    console.error('[decrypt] failed:', err.message);
    return null;
  }
}

/**
 * Read the session from the cookies store.
 * `cookies` is the Next.js cookies() object.
 */
function getSession(cookies) {
  const cookie = cookies.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return decrypt(cookie.value);
}

/**
 * Set the session cookie on a NextResponse.
 */
function setSession(response, data) {
  const payload = { ...data, exp: Math.floor(Date.now() / 1000) + SESSION_TTL };
  const token = encrypt(payload);
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });
}

/**
 * Clear the session cookie on a NextResponse.
 */
function clearSession(response) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Set the session cookie from a server action using the cookies() store.
 */
function setSessionFromCookies(cookieStore, data) {
  const payload = { ...data, exp: Math.floor(Date.now() / 1000) + SESSION_TTL };
  const token = encrypt(payload);
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });
}

module.exports = { COOKIE_NAME, encrypt, decrypt, getSession, setSession, setSessionFromCookies, clearSession };
