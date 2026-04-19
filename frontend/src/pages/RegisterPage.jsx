import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { registerUser } from "../services/authService.js";
import { isValidEmail } from "../utils/validators.js";

function RegisterPage() {
  const navigate = useNavigate();
  const { user, register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      register(response.data.data);
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section-block">
      <div className="container auth-layout">
        <div className="auth-panel auth-panel-dark">
          <span className="eyebrow">Join ALANKAAR</span>
          <h1>Create an account for a smoother cosmetic shopping flow.</h1>
          <p>
            This registration page teaches an important full-stack idea: the frontend sends
            form data to the backend, the backend creates the user, hashes the password, and
            returns a JWT token.
          </p>

          <div className="auth-feature-list">
            <div>
              <strong>Secure passwords</strong>
              <span>Your backend hashes passwords with `bcryptjs` before saving them.</span>
            </div>
            <div>
              <strong>Immediate login</strong>
              <span>After register, the app stores the returned token and signs the user in.</span>
            </div>
          </div>
        </div>

        <div className="auth-panel form-shell">
          <h2>Create Account</h2>
          <p>Register to save your account and continue toward checkout later.</p>

          {error ? <p className="status-message error-message">{error}</p> : null}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Full Name</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </label>

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
                placeholder="At least 6 characters"
              />
            </label>

            <label className="form-field">
              <span>Confirm Password</span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
              />
            </label>

            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Creating Account..." : "Register"}
            </button>
          </form>

          <p className="form-helper-text">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
