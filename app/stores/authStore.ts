import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  hasHydrated: boolean; // indica se o persist já reidratou
}

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      isAuthenticated: false,
      token: null,
      login: (token) => set({ isAuthenticated: true, token }),
      logout: () => set({ isAuthenticated: false, token: null }),
      hasHydrated: false,
    }),
    {
      name: "auth",
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          // Marca como hidratado após carregar do storage
          useAuthStore.setState({ hasHydrated: true });
        }
      },
    }
  )
);
