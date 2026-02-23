import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import { useAuthStore } from "~/stores/authStore";
import { refreshToken as refreshTokenRequest } from "~/api/authService";
import { useNotification } from "~/components/NotificationProvider";
import { useNavigate } from "react-router";

interface AuthContextValue {
  isAuthenticated: boolean;
  token: string | null;
  sessionId: number | null;
  publicKey: string | null;
  expiresAt: number | null;
  isAdmin: boolean;
  login: (
    token: string | null,
    sessionId: number,
    publicKey: string,
    ttlMinutes?: number,
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
      isAdmin: false,
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
        isAdmin: false,
      };
    const parsed = JSON.parse(raw);
    const st = parsed?.state || {};
    return {
      token: st.token ?? null,
      isAuthenticated: st.isAuthenticated ?? false,
      sessionId: st.sessionId ?? null,
      publicKey: st.publicKey ?? null,
      sessionExpiry: st.sessionExpiry ?? null,
      isAdmin: st.isAdmin ?? false,
    };
  } catch {
    return {
      token: null,
      isAuthenticated: false,
      sessionId: null,
      publicKey: null,
      sessionExpiry: null,
      isAdmin: false,
    };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const initial = preReadPersistedAuth();
  const {
    isAuthenticated,
    isAdmin,
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
        isAdmin: initial.isAdmin,
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
      isAdmin,
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
    isAdmin,
    login,
    logout,
    initial.isAuthenticated,
    initial.token,
    initial.sessionId,
    initial.publicKey,
    initial.sessionExpiry,
    initial.isAdmin,
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

  // Refresh quando o token estiver perto de expirar
  const isRefreshing = useRef(false);
  const notifyCtx = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    if (!value.expiresAt) return;

    const remaining = value.expiresAt - Date.now();
    const refreshThreshold = 2 * 60_000; // 2 minutes

    async function attemptRefresh() {
      if (isRefreshing.current) return;
      isRefreshing.current = true;
      try {
        const store = useAuthStore.getState();
        if (!store.refreshToken) {
          isRefreshing.current = false;
          return;
        }
        const resp = await refreshTokenRequest(store.refreshToken);
        if (!resp || resp.statusCode !== 200) {
          notifyCtx.notify({ type: "error", message: "Sessão expirada" });
          useAuthStore.getState().logout();
          navigate("/login");
        }
      } catch (err) {
        notifyCtx.notify({ type: "error", message: "Sessão expirada" });
        useAuthStore.getState().logout();
        navigate("/login");
      } finally {
        isRefreshing.current = false;
      }
    }

    if (remaining <= 0) {
      notifyCtx.notify({ type: "error", message: "Sessão expirada" });
      logout();
      navigate("/login");
      return;
    }

    if (remaining <= refreshThreshold) {
      attemptRefresh();
      return;
    }

    const timeoutId = setTimeout(
      () => attemptRefresh(),
      remaining - refreshThreshold,
    );
    return () => clearTimeout(timeoutId);
  }, [value.expiresAt, logout, notifyCtx, navigate]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
