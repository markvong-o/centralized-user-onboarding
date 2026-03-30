import { cookies } from 'next/headers';
import { getSession } from '../lib/session';
import AvatarMenu from './components/AvatarMenu';
import './globals.css';

export const metadata = {
  title: 'Crestwood — Crestwood',
  description: 'Employee onboarding and workforce management for Crestwood',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const session = getSession(cookieStore);

  return (
    <html lang="en">
      <body>
        <header className="header">
          <a href="/">Crestwood</a>
          {session && (
            <AvatarMenu name={session.name} email={session.email} role={session.role} />
          )}
        </header>
        <main>{children}</main>
        <footer className="disclaimer-footer">
          Crestwood is a fictional company. This is a sample application for
          demonstration purposes only and is not affiliated with any real
          organization.
        </footer>
      </body>
    </html>
  );
}
