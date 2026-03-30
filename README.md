# Crestwood — Centralized User Onboarding

## Purpose

Crestwood is an employee onboarding and workforce management application built on top of **Okta Identity Engine (IDX)**. It allows administrators to register new employees through a centralized portal. Instead of sharing temporary passwords, the system creates the user in Okta, generates a password reset token, and sends a branded activation email so employees can set their own password — delivering a seamless, secure onboarding experience.

> Crestwood is a fictional company. This project is a demonstration/sample application.

---

## Architecture

The onboarding flow follows five steps:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   1. Onboarding  │     │  2. IDX Register  │     │  3. Reset Token  │     │ 4. Activation    │     │ 5. Password      │
│      Form        │────▶│                   │────▶│                  │────▶│    Email          │────▶│    Setup         │
│                  │     │  idx.register()   │     │ lifecycle/       │     │                  │     │                  │
│ Admin enters     │     │  creates user via │     │ reset_password   │     │ Resend delivers  │     │ Employee clicks  │
│ name & email.    │     │  Okta Identity    │     │ with sendEmail=  │     │ a branded email  │     │ link, sets their │
│ Temp password    │     │  Engine with app  │     │ false to get a   │     │ with "Set Up     │     │ own password on  │
│ auto-generated.  │     │  context. Handles │     │ reset URL.       │     │ Your Password"   │     │ Okta, now fully  │
│                  │     │  PENDING loop.    │     │                  │     │ link.            │     │ active.          │
│ register/page.js │     │ register/actions  │     │ lib/okta-admin   │     │ lib/email.js     │     │                  │
└──────────────────┘     │ lib/okta.js       │     └──────────────────┘     └──────────────────┘     └──────────────────┘
                         └──────────────────┘

Legend:
  Steps 1–2  →  Okta IDX Pipeline
  Step 3     →  Okta Management API
  Step 4     →  Resend Email
  Step 5     →  Okta Identity Engine
```

A full visual architecture diagram is also available in [`architecture.html`](architecture.html) — open it in a browser for a styled, interactive view.

---

## Built With

| Technology | Purpose |
|---|---|
| [Next.js 14](https://nextjs.org/) (App Router) | React framework — server components, API routes, middleware |
| [Okta Auth JS SDK](https://github.com/okta/okta-auth-js) (`@okta/okta-auth-js`) | IDX registration flow and OAuth 2.0 / OIDC authentication |
| [Okta Management API](https://developer.okta.com/docs/api/) | Admin operations — list users, reset passwords, deactivate/delete users |
| [Resend](https://resend.com/) | Transactional email delivery for branded activation emails |
| Node.js `crypto` | AES-256-GCM encrypted session cookies, secure random password generation |

---

## Environment Variables

Create a `.env.local` file in the project root (see [`.env.example`](.env.example) for reference):

| Variable | Description |
|---|---|
| `OKTA_ISSUER` | Your Okta authorization server URL (e.g. `https://your-org.okta.com/oauth2/default`) |
| `OKTA_CLIENT_ID` | OAuth 2.0 client ID from your Okta application |
| `OKTA_CLIENT_SECRET` | OAuth 2.0 client secret from your Okta application |
| `OKTA_REDIRECT_URI` | OAuth callback URL (e.g. `http://localhost:3000/api/auth/callback`) |
| `OKTA_SCOPES` | OAuth scopes (default: `openid profile email`) |
| `OKTA_API_TOKEN` | SSWS API token for Okta Management API admin operations |
| `OKTA_APP_ID` | Okta application ID — used to list users assigned to the app |
| `SESSION_SECRET` | 64-character hex string (32 bytes) for AES-256-GCM session encryption. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `RESEND_API_KEY` | API key from [Resend](https://resend.com/) for sending emails |
| `RESEND_FROM_EMAIL` | Verified sender email address in Resend (e.g. `onboarding@yourdomain.com`) |
| `ADMIN_EMAILS` | Comma-separated list of email addresses granted the admin role (e.g. `admin@example.com,hr@example.com`) |

---

## How to Run

### Prerequisites

- **Node.js** 18+
- An **Okta developer account** with an application configured for OAuth 2.0 + IDX registration
- A **Resend** account with a verified sending domain

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd centralized-user-onboarding

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# Edit .env.local and fill in all values (see table above)

# 4. Start the dev server
npm run dev
```

The app will be available at **http://localhost:3000**.

### Production

```bash
npm run build
npm run start
```
