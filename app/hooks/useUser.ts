import { useAuthStore } from "~/stores/authStore";

/**
 * Hook para acessar informações do usuário autenticado
 *
 * @returns Objeto com informações do usuário e ID
 */
export function useUser() {
  const { isAuthenticated, token, sessionId } = useAuthStore();

  // TODO: Implementar busca do usuário completo pela API
  // Por enquanto, retorna apenas informações básicas do store

  return {
    isAuthenticated,
    userId: null, // TODO: Extrair do token ou buscar na API
    token,
    sessionId,
  };
}
