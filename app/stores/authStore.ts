import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  sessionId: number | null;
  publicKey: string | null;
  sessionExpiry: number | null;
  userName: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  login: (
    token: string | null,
    sessionId: number,
    publicKey: string,
    userName?: string,
    userEmail?: string,
    isAdmin?: boolean,
    ttlMinutes?: number,
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
      userName: null,
      userEmail: null,
      isAdmin: false,

      login: (
        token,
        sessionId,
        publicKey,
        userName = null,
        userEmail = null,
        isAdmin = false,
        ttlMinutes = 30,
      ) => {
        console.log("🏪 authStore.login() chamado com:", {
          token,
          sessionId,
          publicKey,
          userName,
          userEmail,
          isAdmin,
          ttlMinutes,
        });

        set({
          isAuthenticated: true,
          token,
          sessionId,
          publicKey,
          userName,
          userEmail,
          isAdmin,
          sessionExpiry: Date.now() + ttlMinutes * 60_000,
        });

        console.log("🏪 Estado após set():");
        console.log(useAuthStore.getState());
      },

      logout: () =>
        set({
          isAuthenticated: false,
          token: null,
          sessionId: null,
          publicKey: null,
          sessionExpiry: null,
          userName: null,
          userEmail: null,
          isAdmin: false,
        }),
    }),

    {
      name: "auth",
      // Persist only the fields required across sessions
      partialize: (state) =>
        ({
          isAuthenticated: state.isAuthenticated,
          token: state.token,
          isAdmin: state.isAdmin,
          sessionId: state.sessionId,
          publicKey: state.publicKey,
          sessionExpiry: state.sessionExpiry,
          userName: state.userName,
          userEmail: state.userEmail,
        }) as any,
    },
  ),
);
