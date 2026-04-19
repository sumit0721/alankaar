import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="section-block">
      <div className="container">
        <h1>Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link to="/" className="secondary-button">
          Back to Home
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
