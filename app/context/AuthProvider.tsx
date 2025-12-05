import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { useAuthStore } from "~/stores/authStore";

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  sessionId: number | null;
  publicKey: string | null;
  expiresAt: number | null;
  login: (
    token: string | null,
    sessionId: number,
    publicKey: string,
    ttlMinutes?: number
  ) => void;
  logout: () => void;
  ready: boolean;
  expired: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function preReadPersistedAuth() {
  if (typeof window === "undefined")
    return {
      token: null,
      isAuthenticated: false,
      sessionId: null,
      publicKey: null,
      sessionExpiry: null,
    };
  try {
    const raw = localStorage.getItem("auth");
    if (!raw)
      return {
        token: null,
        isAuthenticated: false,
        sessionId: null,
        publicKey: null,
        sessionExpiry: null,
      };
    const parsed = JSON.parse(raw);
    const st = parsed?.state || {};
    return {
      token: st.token ?? null,
      isAuthenticated: !!st.sessionId,
      sessionId: st.sessionId ?? null,
      publicKey: st.publicKey ?? null,
      sessionExpiry: st.sessionExpiry ?? null,
    };
  } catch {
    return {
      token: null,
      isAuthenticated: false,
      sessionId: null,
      publicKey: null,
      sessionExpiry: null,
    };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initial = preReadPersistedAuth();
  const {
    isAuthenticated,
    token,
    sessionId,
    publicKey,
    sessionExpiry,
    login,
    logout,
  } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const value: AuthContextValue = useMemo(() => {
    const now = Date.now();
    const exp = ready ? sessionExpiry : initial.sessionExpiry;
    const expired = !!exp && now > exp;
    if (!ready) {
      return {
        isAuthenticated: initial.isAuthenticated && !expired,
        token: initial.token,
        sessionId: initial.sessionId,
        publicKey: initial.publicKey,
        expiresAt: initial.sessionExpiry,
        login,
        logout,
        ready: false,
        expired,
      };
    }
    return {
      isAuthenticated: isAuthenticated && !expired,
      token,
      sessionId,
      publicKey,
      expiresAt: sessionExpiry,
      login,
      logout,
      ready: true,
      expired,
    };
  }, [
    ready,
    isAuthenticated,
    token,
    sessionId,
    publicKey,
    sessionExpiry,
    login,
    logout,
    initial.isAuthenticated,
    initial.token,
    initial.sessionId,
    initial.publicKey,
    initial.sessionExpiry,
  ]);

  useEffect(() => {
    if (!value.expiresAt) return;
    const remaining = value.expiresAt - Date.now();
    if (remaining <= 0) {
      logout();
      return;
    }
    const id = setTimeout(() => logout(), remaining);
    return () => clearTimeout(id);
  }, [value.expiresAt, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
