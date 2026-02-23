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
    sessionId: number | null,
    publicKey: string | null,
    userName?: string,
    userEmail?: string,
    isAdmin?: boolean,
    refreshToken?: string,
    ttlMinutes?: number,
    userId?: string,
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
        expiresAt: initial.sessionExpiry,
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

  // Refresh quando o token estiver perto de expirar
  const isRefreshing = useRef(false);
  const notifyCtx = useNotification();
  const navigate = useNavigate();

  // Attempt a proactive token refresh.
  // Called on a timer AND whenever the tab regains focus.
  const attemptRefresh = useRef(async () => {
    if (isRefreshing.current) return;

    const store = useAuthStore.getState();
    if (!store.isAuthenticated || !store.refreshToken) return;

    // Only refresh if within 5 minutes of expiry (or already past it)
    const remaining = (store.sessionExpiry ?? 0) - Date.now();
    if (remaining > 5 * 60_000) return;

    isRefreshing.current = true;
    try {
      const resp = await refreshTokenRequest(store.refreshToken);
      if (!resp || resp.statusCode !== 200) throw new Error("Refresh failed");
      // store is updated inside refreshTokenRequest on success
    } catch {
      notifyCtx.notify({
        type: "error",
        message: "Sua sessão expirou. Faça login novamente.",
      });
      sessionStorage.setItem(
        "auth_redirect_reason",
        "Sua sessão expirou. Por favor, faça login novamente.",
      );
      useAuthStore.getState().logout();
      navigate("/login");
    } finally {
      isRefreshing.current = false;
    }
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check every 2 minutes; will only actually refresh when within 5 min of expiry
    const interval = setInterval(() => attemptRefresh.current(), 2 * 60_000);

    // Also check immediately when tab regains focus (covers browser sleep)
    const onVisible = () => {
      if (document.visibilityState === "visible") attemptRefresh.current();
    };
    document.addEventListener("visibilitychange", onVisible);

    // Run once on mount in case the token is already near expiry
    attemptRefresh.current();

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
