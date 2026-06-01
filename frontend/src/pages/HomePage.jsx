import BrandStory from "../components/home/BrandStory.jsx";
import FeaturedProducts from "../components/home/FeaturedProducts.jsx";
import Hero from "../components/home/Hero.jsx";
import BestSellers from "../components/home/BestSellers.jsx";
import WhyAlankaar from "../components/home/WhyAlankaar.jsx";
import NewsletterSignup from "../components/home/NewsletterSignup.jsx";

function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <BestSellers />
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

      <WhyAlankaar />

      <section className="section-block testimonial-band">
        <div className="container testimonial-layout">
          <div>
            <span className="eyebrow">Our Heritage</span>
            <h2>Crafted with pure luxury, made for mindful rituals.</h2>
          </div>

          <p>
            At ALANKAAR, we marry premium botanical extracts with cutting-edge skincare science. 
            Every formulation is rich, ultra-concentrated, and free of harsh fillers, designed to offer an 
            exquisite weightless feel and an editorial finish. Indulge in an elevated sensory journey 
            that celebrates your natural luminance.
          </p>
        </div>
      </section>

      <NewsletterSignup />
    </>
  );
}

export default HomePage;
