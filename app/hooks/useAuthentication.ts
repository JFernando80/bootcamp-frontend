import { useAuthStore } from "../stores/authStore";

export function useAuthentication() {
  const { token, isAuthenticated, login, logout } = useAuthStore();

  return {
    token,
    isAuthenticated,
    login,
    logout,
  };
}
