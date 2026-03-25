import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div className="success-icon">&#10003;</div>
          <h1>Employee Onboarded</h1>
          <p className="subtitle">
            The new Crestwood team member has been created successfully. An
            activation email has been sent to their work address. They will need to
            click the activation link to complete their setup.
          </p>
          <div className="btn-group">
            <Link href="/register" className="btn btn-primary">
              Onboard Another Employee
            </Link>
            <Link href="/users" className="btn btn-secondary">
              View All Employees
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
