/**
 * Utilitários para manipulação de JWT
 */

/**
 * Decodifica um JWT e retorna o payload
 */
export function parseJwt(token: string): any {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.warn("Token JWT inválido: não possui 3 partes");
      return null;
    }

    const base64Url = parts[1];
    if (!base64Url) {
      console.warn("Token JWT inválido: payload vazio");
      return null;
    }

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Erro ao decodificar JWT:", error);
    return null;
  }
}

/**
 * Extrai o userId do JWT
 * Tenta diferentes campos possíveis onde o userId pode estar
 */
export function extractUserIdFromToken(token: string | null): string | null {
  if (!token) return null;

  const jwtData = parseJwt(token);
  if (!jwtData) return null;

  return (
    jwtData.id ||
    jwtData.userId ||
    jwtData.user_id ||
    jwtData.jti ||
    jwtData.token?.userId ||
    jwtData.user?.id ||
    null
  );
}

/**
 * Extrai o userName do JWT
 */
export function extractUserNameFromToken(token: string | null): string | null {
  if (!token) return null;

  const jwtData = parseJwt(token);
  if (!jwtData) return null;

  return jwtData.sub || jwtData.name || jwtData.username || null;
}
