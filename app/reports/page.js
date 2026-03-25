import Link from 'next/link';

export default function ReportsPage() {
  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div className="placeholder-icon">&#9776;</div>
          <h1>Reports</h1>
          <p className="subtitle">
            Workforce analytics are coming soon. You will be able to view
            onboarding metrics, headcount trends, and audit logs here.
          </p>
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
