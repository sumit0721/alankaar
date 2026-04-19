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

        const response = await getCurrentUser();
        const refreshedUser = {
          ...response.data.data,
          token: parsedUser.token,
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
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
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
