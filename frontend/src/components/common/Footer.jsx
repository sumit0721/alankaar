function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">ALANKAAR</p>
          <p className="footer-copy">
            Modern cosmetics for luminous routines, thoughtful formulas, and a gentle sense
            of luxury.
          </p>
        </div>

        <div className="footer-links">
          <span>Explore</span>
          <a href="/products">Products</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </div>

        <div className="footer-links">
          <span>Brand Notes</span>
          <p>Responsive MERN storefront</p>
          <p>Atlas-powered backend</p>
          <p>JWT-based authentication</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
