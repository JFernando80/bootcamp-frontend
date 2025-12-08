import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  sessionId: number | null;
  publicKey: string | null;
  sessionExpiry: number | null;
  login: (
    token: string | null,
    sessionId: number,
    publicKey: string,
    ttlMinutes?: number
  ) => void;
  logout: () => void;
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isAuthenticated: false,
      token: null,
      sessionId: null,
      publicKey: null,
      sessionExpiry: null,

      login: (token, sessionId, publicKey, ttlMinutes = 30) =>
        set({
          isAuthenticated: true,
          token,
          sessionId,
          publicKey,
          sessionExpiry: Date.now() + ttlMinutes * 60_000,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          sessionId: null,
          publicKey: null,
          sessionExpiry: null,
        }),
    }),

    {
      name: "auth",
      // Persist only the fields required across sessions
      partialize: (state) =>
        ({
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          sessionId: state.sessionId,
          publicKey: state.publicKey,
          sessionExpiry: state.sessionExpiry,
        }) as any,
    }
  )
);
