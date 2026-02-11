import CryptoJS from "crypto-js";
import httpClient from "./httpClient";
import { useAuthStore } from "~/stores/authStore";
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

interface LoginResponse {
  statusCode: number;
  message: string; // JWT vem aqui!
  body: null;
}

function encryptWithPublicKey(plain: string, publicKey: string): string {
  return CryptoJS.AES.encrypt(plain, publicKey).toString();
}

/**
 * Realizar handshake com o servidor para obter chave pública
 */
async function handshake(): Promise<{ id: number; publicKey: string }> {
  const res = await httpClient.get<SecurityResponse>(
    `/bootcamp/security/cadastro`,
  );
  if (res.data.statusCode !== 200) throw new Error("Falha no handshake");
  const { id, publicKey } = res.data.body;
  return { id, publicKey };
}

/**
 * Registrar novo usuário
 */
export async function registerUser(form: RegisterBody): Promise<void> {
  const { id, publicKey } = await handshake();

  // A publicKey é a CHAVE de criptografia, não concatenar com a senha
  const passwordHash = encryptWithPublicKey(form.password, publicKey);

  await httpClient.post(
    "/bootcamp/user/new",
    {
      name: form.name,
      email: form.email,
      sobrenome: form.sobrenome,
      passwordHash,
      administrador: false,
    },
    { headers: { token: id } },
  );

  useAuthStore.getState().login(null, id, publicKey);
}

/**
 * Realizar login do usuário
 */
export async function loginUser(form: LoginBody): Promise<LoginResponse> {
  const { id, publicKey } = await handshake();

  // Formato: email + "}*{" + password (SEM concatenar publicKey), depois criptografar
  const credentials = `${form.email}}*{${form.password}`;
  const encryptedCredentials = encryptWithPublicKey(credentials, publicKey);

  const loginDTO: LoginDTO = {
    login: encryptedCredentials,
  };

  const resp = await httpClient.post<LoginResponse>(
    "/bootcamp/user/login",
    loginDTO,
    { headers: { token: id } },
  );

  console.log("🔑 Login Response completa:", resp.data);
  console.log("🔑 Response statusCode:", resp.data.statusCode);
  console.log("🔑 Response body:", resp.data.body);
  console.log("🔑 Response message:", resp.data.message);

  if (resp.data.statusCode === 200 && resp.data.message) {
    // O JWT vem no campo MESSAGE, não no body!
    const jwtToken = resp.data.message;

    console.log("🔓 JWT Token:", jwtToken);

    try {
      // Decodificar JWT para extrair dados
      const jwtData = parseJwt(jwtToken);
      console.log("🔓 JWT Decoded:", jwtData);

      // A estrutura do JWT é diferente - dados estão no nível raiz
      const token = jwtData.token?.token; // token.token
      const refreshToken = jwtData.token?.refreshToken;
      const userName = jwtData.sub; // sub é o nome do usuário
      const userEmail = form.email; // Email vem do formulário
      const isAdmin = jwtData.administrador === true; // Verificar se é admin

      console.log("✅ Token:", token);
      console.log("✅ RefreshToken:", refreshToken);
      console.log("✅ UserName:", userName);
      console.log("✅ UserEmail:", userEmail);
      console.log("✅ IsAdmin:", isAdmin);

      console.log("💾 Salvando no store:", {
        token,
        sessionId: id,
        publicKey,
        userName,
        userEmail,
        isAdmin,
      });

      useAuthStore
        .getState()
        .login(token, id, publicKey, userName, userEmail, isAdmin);

      // Verificar se foi salvo
      const state = useAuthStore.getState();
      console.log("✅ Estado após login:", {
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        sessionId: state.sessionId,
        userName: state.userName,
        userEmail: state.userEmail,
      });
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
 * Atualizar token expirado
 */
export async function refreshToken(
  token: string,
  refreshToken: string,
): Promise<any> {
  const { id } = await handshake();

  const resp = await httpClient.post<any>(
    "/bootcamp/user/refresh_token",
    { refreshToken }, // Apenas refreshToken no body
    { headers: { token: id } }, // Security ID no header
  );

  if (resp.data.statusCode === 200 && resp.data.body) {
    const { sessionId, publicKey } = useAuthStore.getState();
    const newToken = resp.data.body.tokenDTO?.token || resp.data.body.token;
    useAuthStore.getState().login(newToken, sessionId!, publicKey!);
  }

  return resp.data;
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
