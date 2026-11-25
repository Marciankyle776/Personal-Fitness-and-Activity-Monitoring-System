import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the HTTP-only cookie on first load.
  useEffect(() => {
    let active = true;
    authService
      .me()
      .then((d) => active && setUser(d.user))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  // Any 401 from a protected endpoint means the session ended.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser((current) => {
        if (current) toast.info("Your session has ended. Please sign in again.");
        return null;
      });
    };
    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
  }, [toast]);

  const login = useCallback(async (values) => {
    const d = await authService.login(values);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (values) => {
    const d = await authService.register(values);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch { /* cookie is cleared server-side; continue locally */ }
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, setUser }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
