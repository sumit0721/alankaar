import { useState } from "react";
import toast from "react-hot-toast";

import { subscribeNewsletter } from "../../services/newsletterService.js";

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await subscribeNewsletter({ email });
      toast.success(response.data.message);
      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Subscription failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-block newsletter-section">
      <div className="container newsletter-layout">
        <div className="newsletter-text">
          <span className="eyebrow">Stay Connected</span>
          <h2>Get beauty tips & exclusive deals</h2>
          <p>
            Join the ALANKAAR community. New launches, skin tips, and members-only
            discounts — straight to your inbox.
          </p>
        </div>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="newsletter-input"
          />
          <button type="submit" className="primary-button" disabled={submitting}>
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default NewsletterSignup;
