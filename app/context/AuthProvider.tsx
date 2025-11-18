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
  login: (token: string) => void;
  logout: () => void;
  ready: boolean; // hydration pronta
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function preReadPersistedAuth() {
  if (typeof window === "undefined")
    return { token: null, isAuthenticated: false };
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return { token: null, isAuthenticated: false };
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.token ?? null;
    return { token, isAuthenticated: !!token };
  } catch {
    return { token: null, isAuthenticated: false };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Pré-leitura evita flash inicial
  const initial = preReadPersistedAuth();
  const { isAuthenticated, token, login, logout } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Marca como pronto após primeiro tick (store já terá sincronizado se necessário)
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Valor memo combinando pre-read e store (store prevalece depois de pronto)
  const value: AuthContextValue = useMemo(() => {
    if (!ready) {
      // Antes de ready usamos preRead
      return {
        isAuthenticated: initial.isAuthenticated,
        token: initial.token,
        login,
        logout,
        ready: false,
      };
    }
    return { isAuthenticated, token, login, logout, ready: true };
  }, [
    ready,
    isAuthenticated,
    token,
    login,
    logout,
    initial.isAuthenticated,
    initial.token,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
