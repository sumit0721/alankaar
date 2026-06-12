import { createContext, useContext, useEffect, useState } from "react";

import { getCurrentUser } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const syncCurrentUser = async () => {
      const storedUser = localStorage.getItem("authUser");

      if (!storedUser) {
        setAuthLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(storedUser);

        if (!parsedUser?.token) {
          localStorage.removeItem("authUser");
          setAuthLoading(false);
          return;
        }

        // ── Grace period check ───────────────────────────────────────────
        // Only call /api/auth/me if the stored session is older than 10 minutes.
        // On every page load/refresh, this eliminates the auth API call for
        // active users, reducing the burst of simultaneous requests on startup
        // (auth + cart + wishlist + SSE all fire at once after auth resolves).
        const TEN_MINUTES = 10 * 60 * 1000;
        const lastVerified = parsedUser._lastVerified || 0;
        const isStale = Date.now() - lastVerified > TEN_MINUTES;

        if (!isStale) {
          // Session is fresh — use stored data directly, no API call
          setUser(parsedUser);
          setAuthLoading(false);
          return;
        }

        // Session is stale or never verified — verify with backend
        const response = await getCurrentUser();
        const refreshedUser = {
          ...response.data.data,
          token: parsedUser.token,
          _lastVerified: Date.now(),
        };

        setUser(refreshedUser);
        localStorage.setItem("authUser", JSON.stringify(refreshedUser));
      } catch (error) {
        setUser(null);
        localStorage.removeItem("authUser");
      } finally {
        setAuthLoading(false);
      }
    };

    syncCurrentUser();
  }, []);

  const saveAuthUser = (userData) => {
    const withTimestamp = { ...userData, _lastVerified: Date.now() };
    setUser(withTimestamp);
    localStorage.setItem("authUser", JSON.stringify(withTimestamp));
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem("authUser", JSON.stringify(merged));
      return merged;
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login: saveAuthUser,
        register: saveAuthUser,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
