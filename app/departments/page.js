import Link from 'next/link';

export default function DepartmentsPage() {
  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div className="placeholder-icon">&#9632;</div>
          <h1>Departments</h1>
          <p className="subtitle">
            Department management is coming soon. You will be able to create
            teams, assign employees, and view org-chart structure here.
          </p>
          <Link href="/dashboard" className="btn btn-secondary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
