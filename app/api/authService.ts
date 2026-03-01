import CryptoJS from "crypto-js";
import httpClient, { apiPublicGet, apiPublicPost } from "./httpClient";
import { useAuthStore } from "~/stores/authStore";
import { userService } from "./services";
import { enumService } from "./services";
import type {
  JsonResponse,
  SecurityDTO,
  LoginDTO,
  TokenDTO,
  UserDTO,
} from "./types";

interface RegisterBody {
  name: string;
  email: string;
  sobrenome: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

interface SecurityResponse {
  statusCode: number;
  message: string;
  body: {
    id: number;
    publicKey: string;
    screen: string;
    userId: number | null;
  };
}

// Função handshake: obtém id/publicKey do endpoint de segurança
export async function handshake(screen: string = "cadastro") {
  const resp = await enumService.getSecurity(screen);
  // resp.body deve conter { id, publicKey, screen, userId }
  if (resp && resp.body) {
    const body = resp.body;
    return { id: body.id, publicKey: body.publicKey };
  }
  throw new Error("Handshake falhou: resposta inválida do servidor");
}

export async function registerUser(
  form: RegisterBody,
  isAdmin: boolean = false,
): Promise<JsonResponse> {
  // Passo 1: Handshake — obter id e publicKey de /security/cadastro
  const { id: securityId, publicKey } = await handshake("cadastro");

  // Passo 2: Criptografar a senha com CryptoJS AES usando a publicKey
  const passwordHash = CryptoJS.AES.encrypt(
    form.password,
    publicKey,
  ).toString();

  // Passo 3: Enviar cadastro com header 'token' contendo o securityId
  const resp = await httpClient.post<JsonResponse>(
    "/bootcamp/user/new",
    {
      name: form.name,
      sobrenome: form.sobrenome,
      email: form.email,
      passwordHash,
      administrador: isAdmin,
    },
    { headers: { token: securityId } },
  );

  // Se o backend retornou um statusCode de erro no body, lançar mensagem
  if (
    resp.data.statusCode &&
    resp.data.statusCode !== 200 &&
    resp.data.statusCode !== 201
  ) {
    throw new Error(resp.data.message || "Erro ao cadastrar usuário");
  }

  return resp.data;
}

export async function loginUser(form: LoginBody): Promise<JsonResponse> {
  // Passo 1: Handshake — obter id e publicKey de /security/cadastro
  const { id: securityId, publicKey } = await handshake("cadastro");

  // Passo 2: Criptografar credenciais com CryptoJS AES usando a publicKey
  const credentials = `${form.email}}*{${form.password}`;
  const encryptedLogin = CryptoJS.AES.encrypt(
    credentials,
    publicKey,
  ).toString();

  const loginDTO: LoginDTO = { login: encryptedLogin };

  // Passo 3: Enviar login com header 'token' contendo o securityId
  const resp = await httpClient.post<JsonResponse>(
    "/bootcamp/user/login",
    loginDTO,
    { headers: { token: securityId } },
  );

  if (resp.data.statusCode === 200 && resp.data.message) {
    // O JWT vem no campo MESSAGE, não no body!
    const jwtToken = resp.data.message;

    try {
      // Decodificar JWT para extrair dados
      const jwtData = parseJwt(jwtToken);

      // A estrutura do JWT é diferente - dados estão no nível raiz
      const token = jwtData.token?.token; // token.token
      const refreshToken = jwtData.token?.refreshToken;
      const userName = jwtData.sub; // sub é o nome do usuário
      const userEmail = form.email; // Email vem do formulário
      const isAdmin = jwtData.administrador === true; // Verificar se é admin

      // Tentar extrair userId de diferentes campos possíveis
      const userId =
        jwtData.id ||
        jwtData.userId ||
        jwtData.user_id ||
        jwtData.jti ||
        jwtData.token?.userId ||
        jwtData.user?.id;

      // Calcular ttlMinutes com base no claim `exp` do JWT (se disponível)
      let ttlMinutes: number | undefined = undefined;
      try {
        const expClaim = jwtData.exp || jwtData.token?.exp || jwtData.expires;
        if (expClaim) {
          const expMs = Number(expClaim) * 1000;
          const diffMin = Math.max(1, Math.floor((expMs - Date.now()) / 60000));
          ttlMinutes = diffMin;
        }
      } catch (err) {
        // ignore, usaremos o ttl padrão
      }

      // Salvar no store temporariamente (usando ttl calculado se houver)
      useAuthStore
        .getState()
        .login(
          token,
          null,
          null,
          userName,
          userEmail,
          isAdmin,
          refreshToken,
          ttlMinutes,
          userId,
        );

      // Se o userId não foi encontrado no JWT, buscar via API.
      // Também, se o JWT não trouxe o campo `administrador`, usar o valor do usuário retornado.
      if (!userId) {
        try {
          const user = await userService.getByEmail(userEmail);
          if (user && user.id) {
            // Determinar isAdmin final: priorizar o JWT, mas aceitar o valor do usuário se necessário
            const isAdminFromUser = !!user.administrador;
            const finalIsAdmin = isAdmin || isAdminFromUser;

            // Atualizar store com o userId correto e isAdmin possivelmente corrigido
            useAuthStore
              .getState()
              .login(
                token,
                null,
                null,
                userName,
                userEmail,
                finalIsAdmin,
                refreshToken,
                undefined,
                user.id,
              );
          } else {
            console.warn("⚠️ Não foi possível obter userId via API");
          }
        } catch (error) {
          console.error("❌ Erro ao buscar userId via API:", error);
        }
      } else {
        // Caso tenhamos userId mas o JWT não trouxe administrador, tentar obter o flag via API
        if (!isAdmin) {
          try {
            const user = await userService.getByEmail(userEmail);
            if (user && user.administrador) {
              useAuthStore
                .getState()
                .login(
                  token,
                  null,
                  null,
                  userName,
                  userEmail,
                  true,
                  refreshToken,
                  undefined,
                  userId,
                );
            }
          } catch (err) {
            // silencioso — não é crítico
          }
        }
      }

      // Verificar se foi salvo
      const state = useAuthStore.getState();
    } catch (error) {
      console.error("❌ Erro ao processar JWT:", error);
      console.error("❌ JWT que causou erro:", jwtToken);
      throw error;
    }
  } else {
    console.error("❌ Login falhou - statusCode:", resp.data.statusCode);
  }

  return resp.data;
}

// Função para decodificar JWT
function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
  return JSON.parse(jsonPayload);
}

// Criptografia RSA usando Web Crypto API (PEM public key -> RSA-OAEP SHA-256)
async function encryptWithPublicKey(
  plainText: string,
  publicKeyPem: string,
): Promise<string> {
  const trimmed = publicKeyPem.trim();
  try {
    // Se for JWK JSON, importar diretamente
    if (trimmed.startsWith("{")) {
      const jwk = JSON.parse(trimmed);
      const key = await crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSA-OAEP", hash: "SHA-256" },
        false,
        ["encrypt"],
      );

      const encoder = new TextEncoder();
      const data = encoder.encode(plainText);
      const encrypted = await crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        key,
        data,
      );
      const bytes = new Uint8Array(encrypted);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++)
        binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }

    // Remover cabeçalhos PEM possíveis e espaços
    let pem = publicKeyPem
      .replace(/-----BEGIN PUBLIC KEY-----/g, "")
      .replace(/-----END PUBLIC KEY-----/g, "")
      .replace(/-----BEGIN RSA PUBLIC KEY-----/g, "")
      .replace(/-----END RSA PUBLIC KEY-----/g, "")
      .replace(/\s+/g, "");

    // Converter base64url para base64 (se necessário) e adicionar padding
    pem = pem.replace(/-/g, "+").replace(/_/g, "/");
    while (pem.length % 4 !== 0) pem += "=";

    // Converter base64 para ArrayBuffer
    const binaryDer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

    // Importar chave pública (SPKI)
    const key = await crypto.subtle.importKey(
      "spki",
      binaryDer.buffer,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      key,
      data,
    );
    const bytes = new Uint8Array(encrypted);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++)
      binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  } catch (err: any) {
    console.error("❌ encryptWithPublicKey failed:", err);
    throw new Error(`encryptWithPublicKey failed: ${err?.message || err}`);
  }
}

/**
 * Validar token atual
 */
export async function validateToken(
  token: string,
  refreshToken: string,
): Promise<any> {
  const tokenDTO: TokenDTO = { token, refreshToken };

  const resp = await httpClient.post<any>("/bootcamp/user/token", tokenDTO);

  return resp.data;
}

/**
 * Handshake sem enviar Authorization (para uso no refresh, quando o token pode estar expirado).
 */
async function handshakePublic(screen: string = "cadastro") {
  const resp = await apiPublicGet<
    JsonResponse<{ id: number; publicKey: string }>
  >(`/bootcamp/security/${screen}`);
  if (resp?.body) {
    return { id: resp.body.id, publicKey: resp.body.publicKey };
  }
  throw new Error("Handshake falhou: resposta inválida do servidor");
}

/**
 * Atualizar token expirado.
 * Usa cliente público (sem Authorization) para evitar 401 ao enviar token expirado.
 */
export async function refreshToken(refreshToken: string): Promise<any> {
  const { id, publicKey } = await handshakePublic();

  const data = await apiPublicPost<any, { refreshToken: string }>(
    "/bootcamp/user/refresh_token",
    { refreshToken },
    { headers: { token: String(id) } as Record<string, string> },
  );

  if (data?.statusCode === 200 && data?.body) {
    const { userName, userEmail, isAdmin, userId } = useAuthStore.getState();

    const newToken = data.body.tokenDTO?.token ?? data.body.token;
    const newRefreshToken = data.body.tokenDTO?.refreshToken ?? refreshToken;

    let ttlMinutes: number | undefined = undefined;
    try {
      if (newToken) {
        const newJwt = parseJwt(newToken);
        const expClaim = newJwt.exp || newJwt.token?.exp || newJwt.expires;
        if (expClaim) {
          const expMs = Number(expClaim) * 1000;
          ttlMinutes = Math.max(1, Math.floor((expMs - Date.now()) / 60000));
        }
      }
    } catch {
      // ignore
    }

    useAuthStore
      .getState()
      .login(
        newToken,
        id,
        publicKey,
        userName ?? undefined,
        userEmail ?? undefined,
        isAdmin,
        newRefreshToken,
        ttlMinutes,
        userId ?? undefined,
      );

    try {
      const current = useAuthStore.getState();
      if (!current.isAdmin && current.userEmail) {
        const user = await userService.getByEmail(current.userEmail);
        if (user?.administrador) {
          useAuthStore
            .getState()
            .login(
              newToken,
              id,
              publicKey,
              current.userName ?? undefined,
              current.userEmail ?? undefined,
              true,
              newRefreshToken,
              undefined,
              current.userId ?? undefined,
            );
        }
      }
    } catch (err) {
      console.error("❌ Erro ao sincronizar isAdmin após refreshToken:", err);
    }
  }

  return data;
}

/**
 * Verificar se a sessão expirou
 */
export function isSessionExpired(): boolean {
  const { sessionExpiry } = useAuthStore.getState();
  return !!sessionExpiry && Date.now() > sessionExpiry;
}

/**
 * Garantir que a sessão seja válida
 */
export function ensureSessionValid(): void {
  if (isSessionExpired()) {
    useAuthStore.getState().logout();
  }
}
