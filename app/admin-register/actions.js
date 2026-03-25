'use server';

const { cookies } = require('next/headers');
const { getAuthClient } = require('../../lib/okta');
const { setSessionFromCookies } = require('../../lib/session');

export async function registerAdmin(formData) {
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const email = formData.get('email');
  const password = formData.get('password');

  if (!firstName || !lastName || !email || !password) {
    return { success: false, message: 'All fields are required.' };
  }

  try {
    const authClient = getAuthClient();

    // Start registration with profile data
    let transaction = await authClient.idx.register({
      firstName,
      lastName,
      email,
    });

    // Handle the IDX response loop
    while (transaction.status === 'PENDING') {
      const nextStep = transaction.nextStep;

      if (!nextStep) {
        break;
      }

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
        const authenticatorOptions = nextStep.options || [];
        const hasPassword = authenticatorOptions.some(
          (opt) =>
            opt.value === 'okta_password' ||
            opt.label?.toLowerCase().includes('password')
        );
        const hasEmail = authenticatorOptions.some(
          (opt) =>
            opt.value === 'okta_email' ||
            opt.label?.toLowerCase().includes('email')
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
      } else {
        if (transaction.nextStep?.canSkip) {
          transaction = await authClient.idx.proceed({ skip: true });
        } else {
          transaction = await authClient.idx.proceed({});
        }
      }
    }

    if (transaction.status === 'SUCCESS') {
      const idToken = transaction.tokens.idToken;
      const claims = idToken.claims;

      const accessToken = transaction.tokens.accessToken?.accessToken || '';

      const cookieStore = await cookies();
      setSessionFromCookies(cookieStore, {
        name: claims.name || '',
        email: claims.email || claims.sub,
        accessToken,
      });

      return { success: true };
    }

    if (transaction.status === 'TERMINAL') {
      const messages =
        transaction.messages?.map((m) => m.message).join(' ') || '';
      return {
        success: false,
        message:
          messages ||
          'Registration could not be completed. Please try again.',
      };
    }

    if (transaction.status === 'FAILURE') {
      const errors =
        transaction.messages?.map((m) => m.message).join(' ') ||
        'Registration failed.';
      return { success: false, message: errors };
    }

    return {
      success: false,
      message: `Unexpected status: ${transaction.status}`,
    };
  } catch (error) {
    console.error('Admin registration error:', error);

    const errorMessage =
      error?.errorCauses?.map((c) => c.errorSummary).join(' ') ||
      error?.message ||
      'An unexpected error occurred during registration.';

    return { success: false, message: errorMessage };
  }
}
