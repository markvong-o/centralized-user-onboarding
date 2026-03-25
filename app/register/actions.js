'use server';

const crypto = require('crypto');
const { getAuthClient } = require('../../lib/okta');
const { getUserByEmail, resetPassword } = require('../../lib/okta-admin');
const { sendActivationEmail } = require('../../lib/email');

/**
 * Generate a random throwaway password that meets Okta's default policy.
 * The employee never sees this — they set their own password via the reset link.
 */
function generateTempPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const symbols = '!@#$%&*';
  const all = upper + lower + digits + symbols;

  // Guarantee at least one of each required character class
  const required = [
    upper[crypto.randomInt(upper.length)],
    lower[crypto.randomInt(lower.length)],
    digits[crypto.randomInt(digits.length)],
    symbols[crypto.randomInt(symbols.length)],
  ];

  // Fill remaining with random characters
  for (let i = required.length; i < 16; i++) {
    required.push(all[crypto.randomInt(all.length)]);
  }

  // Shuffle
  for (let i = required.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join('');
}

export async function registerUser(formData) {
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');

  if (!firstName || !lastName || !email) {
    return { success: false, message: 'All fields are required.' };
  }

  const password = generateTempPassword();

  try {
    const authClient = getAuthClient();

    // Step 1: Start registration with profile data via IDX (preserves app context)
    let transaction = await authClient.idx.register({
      firstName,
      lastName,
      email,
    });

    // Step 2: Handle the IDX response loop
    const MAX_STEPS = 10;
    let steps = 0;

    while (transaction.status === 'PENDING') {
      if (++steps > MAX_STEPS) {
        console.error('IDX loop exceeded max steps. Last transaction:', JSON.stringify({
          status: transaction.status,
          nextStep: transaction.nextStep ? {
            name: transaction.nextStep.name,
            type: transaction.nextStep.type,
            canSkip: transaction.nextStep.canSkip,
            inputs: transaction.nextStep.inputs?.map(i => ({ name: i.name, type: i.type })),
            options: transaction.nextStep.options?.map(o => ({ label: o.label, value: o.value })),
          } : null,
          messages: transaction.messages,
        }, null, 2));
        return { success: false, message: 'Registration could not be completed. Too many steps.' };
      }

      const nextStep = transaction.nextStep;
      if (!nextStep) break;

      console.log(`IDX step ${steps}:`, JSON.stringify({
        name: nextStep.name,
        type: nextStep.type,
        canSkip: nextStep.canSkip,
        inputs: nextStep.inputs?.map(i => ({
          name: i.name,
          type: i.type,
          options: i.options?.map(o => ({ label: o.label, value: o.value })),
        })),
        options: nextStep.options?.map(o => ({ label: o.label, value: o.value })),
      }, null, 2));

      const { inputs } = nextStep;

      const needsPassword = inputs?.some(
        (input) => input.name === 'password'
      );
      const needsAuthenticator = inputs?.some(
        (input) => input.name === 'authenticator'
      );

      if (needsPassword) {
        transaction = await authClient.idx.proceed({ password });
      } else if (needsAuthenticator) {
        const authenticatorInput = inputs.find(i => i.name === 'authenticator');
        const authenticatorOptions = authenticatorInput?.options || [];
        const hasPassword = authenticatorOptions.some(
          (opt) => opt.value === 'okta_password'
        );
        const hasEmail = authenticatorOptions.some(
          (opt) => opt.value === 'okta_email'
        );

        if (hasPassword) {
          transaction = await authClient.idx.proceed({
            authenticator: 'okta_password',
          });
        } else if (hasEmail) {
          transaction = await authClient.idx.proceed({
            authenticator: 'okta_email',
          });
        } else {
          transaction = await authClient.idx.proceed({});
        }
      } else if (nextStep.canSkip) {
        transaction = await authClient.idx.proceed({ skip: true });
      } else {
        transaction = await authClient.idx.proceed({});
      }
    }

    // Step 3: Handle final status
    if (transaction.status === 'SUCCESS') {
      // User is ACTIVE with app context. Now trigger a password reset
      // so the employee can set their own password via a branded email.
      try {
        const oktaUser = await getUserByEmail(email);
        const { resetPasswordUrl } = await resetPassword(oktaUser.id);
        // Extract recovery token from Okta's URL and build our own activate link
        const recoveryToken = resetPasswordUrl.split('/').pop();
        const appUrl = process.env.APP_URL || 'http://localhost:3000';
        const activateUrl = `${appUrl}/activate?token=${recoveryToken}`;
        await sendActivationEmail({ to: email, firstName, resetUrl: activateUrl });
      } catch (emailError) {
        console.error('Failed to send activation email:', emailError);
        // User was still created — don't fail the whole operation
      }

      return {
        success: true,
        message: 'Employee registered. An activation email has been sent.',
      };
    }

    if (transaction.status === 'TERMINAL') {
      const messages = transaction.messages?.map((m) => m.message).join(' ') || '';
      return {
        success: false,
        message: messages || 'Registration could not be completed.',
      };
    }

    if (transaction.status === 'FAILURE') {
      const errors = transaction.messages?.map((m) => m.message).join(' ') || 'Registration failed.';
      return { success: false, message: errors };
    }

    return {
      success: false,
      message: `Unexpected status: ${transaction.status}`,
    };
  } catch (error) {
    console.error('Registration error:', error);

    const errorMessage =
      error?.errorCauses?.map((c) => c.errorSummary).join(' ') ||
      error?.message ||
      'An unexpected error occurred during registration.';

    return { success: false, message: errorMessage };
  }
}
