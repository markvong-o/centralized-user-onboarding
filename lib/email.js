const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a branded activation email to a new employee.
 * Contains a link to Okta's password reset page so they can set their own password.
 */
async function sendActivationEmail({ to, firstName, resetUrl }) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: 'Welcome to Crestwood — Set Up Your Account',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:2rem 1.25rem;">
        <div style="background:linear-gradient(135deg,#eae4f7 0%,#d1ecf9 100%);border-radius:20px;padding:2.25rem 2rem;text-align:center;">
          <p style="font-size:0.75rem;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#5e6472;margin-bottom:1rem;">Crestwood</p>
          <h1 style="font-size:1.5rem;font-weight:700;color:#2b2d42;letter-spacing:-0.02em;margin-bottom:0.5rem;">Welcome, ${firstName}!</h1>
          <p style="font-size:0.95rem;color:#5e6472;line-height:1.55;margin-bottom:1.75rem;">
            Your Crestwood account has been created. Click the button below to set your password and get started.
          </p>
          <a href="${resetUrl}" style="display:inline-block;padding:0.75rem 1.6rem;font-size:0.95rem;font-weight:600;color:#fff;background:linear-gradient(135deg,#7ea6f4 0%,#a78bfa 50%,#d4a5c9 100%);border-radius:20px;text-decoration:none;box-shadow:0 4px 14px rgba(126,166,244,0.35);">
            Set Up Your Password
          </a>
          <p style="font-size:0.78rem;color:#5e6472;margin-top:1.75rem;line-height:1.5;">
            If you didn&rsquo;t expect this email, you can safely ignore it.
          </p>
        </div>
        <p style="text-align:center;font-size:0.72rem;color:#5e6472;margin-top:1.25rem;">
          Crestwood is a fictional company. This is a sample application for demonstration purposes only.
        </p>
      </div>
    `,
  });
}

module.exports = { sendActivationEmail };
