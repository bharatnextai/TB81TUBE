import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getStoredToken, saveStoredToken } from "../services/apiClient";
import { getMe, login as loginRequest, logout as logoutRequest, register as registerRequest } from "../services/authService";
import type { User } from "../types/auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  restoring: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function restoreAuth() {
      try {
        const storedToken = await getStoredToken();

        if (!storedToken) {
          return;
        }

        setToken(storedToken);
        const currentUser = await getMe();
        setUser(currentUser);
      } catch {
        await logoutRequest();
        setUser(null);
        setToken(null);
      } finally {
        setRestoring(false);
      }
    }

    void restoreAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const auth = await loginRequest(email, password);
      setUser(auth.user);
      setToken(auth.token);
      await saveStoredToken(auth.token);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const auth = await registerRequest(name, email, password);
      setUser(auth.user);
      setToken(auth.token);
      await saveStoredToken(auth.token);
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await logoutRequest();
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      restoring,
      error,
      login,
      register,
      logout,
      clearError: () => setError(null)
    }),
    [error, loading, login, logout, register, restoring, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
