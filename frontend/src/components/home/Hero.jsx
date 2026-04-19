import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Clean Beauty Essentials</span>
          <h1>Make every routine feel like a soft-focus ritual.</h1>
          <p className="hero-description">
            ALANKAAR pairs skincare-first formulas with modern color, helping your
            customers move from daily routine to elevated self-care in a single, elegant
            flow.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="primary-button">
              Shop Collection
            </Link>
            <Link to="/register" className="secondary-button">
              Join the Brand
            </Link>
          </div>

          <div className="hero-metrics">
            <div>
              <strong>96%</strong>
              <span>repeat-purchase inspired formulas</span>
            </div>
            <div>
              <strong>12</strong>
              <span>signature textures and finishes</span>
            </div>
            <div>
              <strong>4-step</strong>
              <span>ritual-friendly daily routine</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-visual-stack">
            <div className="hero-floating-note">
              <span className="hero-note-label">Now Trending</span>
              <strong>Rose Cloud Tint</strong>
              <p>Weightless color with skincare comfort.</p>
            </div>

            <div className="hero-showcase-card hero-showcase-large">
              <span>Morning Ritual</span>
            </div>

            <div className="hero-showcase-row">
              <div className="hero-showcase-card hero-showcase-small">Glow Serum</div>
              <div className="hero-showcase-card hero-showcase-small alt">Soft Cream</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
