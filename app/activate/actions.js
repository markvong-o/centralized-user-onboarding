'use server';

const { completePasswordReset } = require('../../lib/okta-admin');

export async function activateAccount(formData) {
  const token = formData.get('token');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (!token) {
    return { success: false, message: 'Invalid activation link.' };
  }

  if (!password || !confirmPassword) {
    return { success: false, message: 'Please enter and confirm your password.' };
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  if (password.length < 8) {
    return { success: false, message: 'Password must be at least 8 characters.' };
  }

  try {
    await completePasswordReset(token, password);
    return { success: true };
  } catch (error) {
    console.error('Activation error:', error);

    const errorMessage =
      error?.errorCauses?.map((c) => c.errorSummary).join(' ') ||
      error?.message ||
      'Failed to set password. The link may have expired.';

    return { success: false, message: errorMessage };
  }
}
