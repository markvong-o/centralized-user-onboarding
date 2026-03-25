export default function HomePage() {
  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass" style={{ textAlign: 'center' }}>
          <span className="hero-badge">Crestwood People</span>
          <h1>Welcome to Crestwood</h1>
          <p className="subtitle">
            Streamline your workforce. Onboard new employees, manage profiles, and
            keep your organization running smoothly — all from one place.
          </p>
          <a href="/api/auth/login" className="btn btn-primary">
            Sign In with Okta
          </a>
        </div>
      </div>
    </div>
  );
}
