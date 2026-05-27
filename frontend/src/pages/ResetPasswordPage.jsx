import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { resetPassword } from "../services/authService.js";

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      await resetPassword(token, { password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-block">
      <div className="container auth-layout">
        <div className="auth-panel auth-panel-dark">
          <span className="eyebrow">Password Recovery</span>
          <h1>Create a new password for your account.</h1>
          <p>
            Choose a strong password that's at least 6 characters. Once
            reset, you can log in with your new password immediately.
          </p>
        </div>

        <div className="auth-panel form-shell">
          <h2>New Password</h2>

          {success ? (
            <div className="forgot-success">
              <p className="status-message success-message">
                Your password has been reset successfully.
              </p>
              <Link to="/login" className="primary-button" style={{ marginTop: "1rem" }}>
                Login with New Password
              </Link>
            </div>
          ) : (
            <>
              {error ? <p className="status-message error-message">{error}</p> : null}

              <form className="auth-form" onSubmit={handleSubmit}>
                <label className="form-field">
                  <span>New Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </label>

                <label className="form-field">
                  <span>Confirm Password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                  />
                </label>

                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="form-helper-text">
                Link expired? <Link to="/forgot-password">Request a new one</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default ResetPasswordPage;
