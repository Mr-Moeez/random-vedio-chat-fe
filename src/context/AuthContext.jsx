import { createContext, useContext, useEffect, useState } from "react";

import { getMe, login as loginRequest, signup as signupRequest } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const saveTokens = (tokens) => {
    localStorage.setItem("accessToken", tokens.access);
    localStorage.setItem("refreshToken", tokens.refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const loadCurrentUser = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setUser(null);
        return;
      }

      const currentUser = await getMe();
      setUser(currentUser);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (payload) => {
    const data = await loginRequest(payload);

    saveTokens({
      access: data.access,
      refresh: data.refresh,
    });

    const currentUser = await getMe();
    setUser(currentUser);

    return currentUser;
  };

  const signup = async (payload) => {
    const data = await signupRequest(payload);

    saveTokens(data.tokens);
    setUser(data.user);

    return data.user;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        signup,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}