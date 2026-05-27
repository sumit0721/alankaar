function WhyAlankaar() {
  const features = [
    {
      icon: "💜",
      title: "For Everyone",
      description:
        "Inclusive, unisex formulations that work across all skin tones and types.",
    },
    {
      icon: "🌿",
      title: "Clean Formulas",
      description:
        "Carefully selected ingredients — no harsh chemicals, no compromise on quality.",
    },
    {
      icon: "⚡",
      title: "Fast Delivery",
      description:
        "Quick, reliable shipping across India — because glowing up shouldn't take long.",
    },
  ];

  return (
    <section className="section-block why-section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Why Choose Us</span>
          <h2>What makes ALANKAAR different</h2>
        </div>

        <div className="why-grid">
          {features.map((feature) => (
            <article key={feature.title} className="why-card">
              <span className="why-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyAlankaar;
