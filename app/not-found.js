export default function NotFound() {
  return (
    <div className="page-center">
      <div className="page-wrap">
        <div className="card glass" style={{ textAlign: 'center' }}>
          <div className="placeholder-icon">?</div>
          <h1>Page Not Found</h1>
          <p className="subtitle">
            The page you&#39;re looking for doesn&#39;t exist or has been moved.
          </p>
          <a href="/" className="btn btn-primary">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
