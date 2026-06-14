import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { loginUser } from "../services/authService.js";
import { isValidEmail } from "../utils/validators.js";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, authLoading } = useAuth();
  const redirectPath = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await loginUser(formData);
      login(response.data.data);
      toast.success("Login successful!");
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <section className="section-block">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  if (user) {
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <section className="section-block">
      <div className="container auth-layout">
        <div className="auth-panel auth-panel-dark">
          <span className="eyebrow">Welcome Back</span>
          <h1>Sign in to continue<br />your glow routine.</h1>
          <p style={{ color: "rgba(254,249,242,0.65)", marginBottom: "2rem", lineHeight: 1.7 }}>
            Log in to retrieve your saved cart, manage your profile, and complete your purchase.
          </p>
          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-icon">✦</span>
              <div>
                <strong>Personalized Experience</strong>
                <p>Access your curated wishlist and tailored brand offers.</p>
              </div>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-icon">✦</span>
              <div>
                <strong>Seamless Checkout</strong>
                <p>Retrieve your saved addresses and payment options instantly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-panel form-shell">
          <h2>Login</h2>
          <p>Sign in to access checkout and manage your shopping journey.</p>

          {error ? <p className="status-message error-message">{error}</p> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Email Address</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
              />
            </label>

            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
              />
            </label>

            <div className="form-helper-text" style={{ textAlign: "right", marginBottom: "0.5rem" }}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Signing In..." : "Login"}
            </button>
          </form>

          <p className="form-helper-text">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
