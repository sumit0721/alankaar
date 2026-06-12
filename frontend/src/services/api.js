import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  // 15-second timeout: gives the backend enough time to respond from
  // a cold start while still showing a proper error instead of hanging.
  timeout: 15000,
});

// ── Request interceptor: attach JWT ────────────────────────────────────
// Read token from localStorage once per request. This is necessary
// because the token is set asynchronously after login.
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("authUser");

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch {
      // Corrupted localStorage entry — clear it
      localStorage.removeItem("authUser");
    }
  }

  return config;
});

// ── Response interceptor: handle expired tokens ────────────────────────
// If any request returns 401, the JWT has expired or is invalid.
// Clear the stored user and redirect to login so the user isn't
// stuck in a broken authenticated state with silent failures.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only auto-logout if we actually had a stored user (not for
      // unauthenticated requests like login/register that correctly return 401)
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        localStorage.removeItem("authUser");
        // Redirect to login — a full reload is the safest way to
        // reset all context state (Auth, Cart, Wishlist, Notification)
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

