import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Modern Indian Luxury</span>
          <h1>Make every routine feel like an <em>exquisite ritual</em>.</h1>
          <p className="hero-description">
            ALANKAAR pairs botanical heritage with high-performance editorial color. 
            Experience weightless textures and luminous finishes designed for the modern aesthetic.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="primary-button">
              Explore Collection
            </Link>
            <Link to="/register" className="secondary-button">
              Join the Brand
            </Link>
          </div>

          <div className="hero-mobile-editorial">
            <div className="hero-editorial-chip">
              <span className="hero-editorial-dot" style={{ background: '#c17b5a' }}></span>
              The Festive Edit
            </div>
            <div className="hero-editorial-chip">
              <span className="hero-editorial-dot" style={{ background: '#d4956a' }}></span>
              Liquid Gold
            </div>
            <div className="hero-editorial-chip">
              <span className="hero-editorial-dot" style={{ background: '#e8b4a0' }}></span>
              Silk Blush
            </div>
            <div className="hero-editorial-chip">
              <span className="hero-editorial-dot" style={{ background: '#b8841f' }}></span>
              Dimensional Glow
            </div>
          </div>

          <div className="hero-metrics">
            <div>
               <strong>100%</strong>
               <span>Ethically Sourced</span>
            </div>
            <div>
               <strong>24h</strong>
               <span>Weightless Wear</span>
            </div>
            <div>
               <strong>Multi</strong>
               <span>Dimensional Glow</span>
            </div>
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-visual-stack">
            <div className="hero-floating-note">
              <span className="hero-note-label">Editorial Favorite</span>
              <strong>Midnight Kohl</strong>
              <p>Intensely pigmented. Silky glide.</p>
            </div>

            <div className="hero-showcase-card hero-showcase-large">
              <span>The Festive Edit</span>
            </div>

            <div className="hero-showcase-row">
               <div className="hero-showcase-card hero-showcase-small">Liquid Gold</div>
               <div className="hero-showcase-card hero-showcase-small alt">Silk Blush</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
