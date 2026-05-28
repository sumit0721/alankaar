import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { forgotPassword } from "../services/authService.js";
import { isValidEmail } from "../utils/validators.js";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      await forgotPassword({ email });
      setSent(true);
      toast.success("Check your email for the reset link!");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-block">
      <div className="container auth-layout">
        <div className="auth-panel auth-panel-dark">
          <span className="eyebrow">Password Recovery</span>
          <h1>Forgot your password? No worries.</h1>
          <p>
            Enter your email address and we'll send you a secure link to
            reset your password. The link expires in 30 minutes.
          </p>
        </div>

        <div className="auth-panel form-shell">
          <h2>Reset Password</h2>

          {sent ? (
            <div className="forgot-success">
              <p className="status-message success-message">
                A secure password reset link has been successfully sent to your email inbox. Please check your inbox.
              </p>
              <Link to="/login" className="primary-button" style={{ marginTop: "1rem" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <p>Enter the email address associated with your account.</p>
              <form className="auth-form" onSubmit={handleSubmit}>
                <label className="form-field">
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </label>

                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="form-helper-text">
                Remember your password? <Link to="/login">Login here</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
