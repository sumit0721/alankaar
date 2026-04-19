import BrandStory from "../components/home/BrandStory.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import Hero from "../components/home/Hero.jsx";

function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <BrandStory />

      <section className="section-block">
        <div className="container ritual-layout">
          <div className="section-heading ritual-heading">
            <span className="eyebrow">Routine Design</span>
            <h2>A storefront that tells customers what to use, when, and why.</h2>
          </div>

          <div className="ritual-grid">
            <article className="ritual-card">
              <span>Prep</span>
              <h3>Clean textures</h3>
              <p>Introduce light hydration and barrier-friendly care before makeup.</p>
            </article>

            <article className="ritual-card">
              <span>Enhance</span>
              <h3>Soft color payoff</h3>
              <p>Build coverage in sheer layers so the products feel approachable.</p>
            </article>

            <article className="ritual-card">
              <span>Finish</span>
              <h3>Lasting glow</h3>
              <p>Close with products that look polished in natural light and on camera.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-block testimonial-band">
        <div className="container testimonial-layout">
          <div>
            <span className="eyebrow">Why It Works</span>
            <h2>The current UI direction is built to feel editorial, not generic.</h2>
          </div>

          <p>
            We are using warm neutrals, rounded surfaces, product-forward cards, and more
            intentional hierarchy so the website feels like a real cosmetic brand rather
            than a plain starter template.
          </p>
        </div>
      </section>
    </>
  );
}

export default HomePage;
