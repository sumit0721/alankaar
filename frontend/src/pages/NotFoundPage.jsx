import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="section-block not-found-section">
      <div className="container not-found-layout">
        <span className="not-found-emoji">🌸</span>
        <h1 className="not-found-title">404</h1>
        <h2>Page Not Found</h2>
        <p>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to something beautiful.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="primary-button">
            Go Home
          </Link>
          <Link to="/products" className="secondary-button">
            Shop Products
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
