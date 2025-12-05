import CryptoJS from "crypto-js";
import httpClient from "./httpClient";
import { useAuthStore } from "~/stores/authStore";

interface HandshakeResponse {
  statusCode: number;
  message: string;
  body: {
    id: number;
    publicKey: string;
    screen: string;
    userId: number | null;
  };
}

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

function encryptWithPublicKey(plain: string, publicKey: string): string {
  return CryptoJS.AES.encrypt(plain, publicKey).toString();
}

async function handshake(
  screen: "cadastro" | "login" = "cadastro"
): Promise<{ id: number; publicKey: string }> {
  const res = await httpClient.get<HandshakeResponse>(
    `/bootcamp/security/cadastro`
  );
  if (res.data.statusCode !== 200) throw new Error("Falha no handshake");
  const { id, publicKey } = res.data.body;
  return { id, publicKey };
}

export async function registerUser(form: RegisterBody) {
  const { id, publicKey } = await handshake("cadastro");
  const passwordHash = encryptWithPublicKey(
    form.password + publicKey,
    publicKey
  );
  await httpClient.post(
    "/bootcamp/user/new",
    {
      name: form.name,
      email: form.email,
      sobrenome: form.sobrenome,
      passwordHash,
    },
    { headers: { token: id } }
  );
  useAuthStore.getState().login(null, id, publicKey);
}

export async function loginUser(form: LoginBody) {
  const { id, publicKey } = await handshake("cadastro");
  const loginField = encryptWithPublicKey(
    `${form.email}}*{${form.password}`,
    publicKey
  );
  const resp = await httpClient.post(
    "/bootcamp/user/login",
    { login: loginField },
    { headers: { token: id } }
  );
  useAuthStore.getState().login(null, id, publicKey);
  return resp.data;
}

export function isSessionExpired(): boolean {
  const { sessionExpiry } = useAuthStore.getState();
  return !!sessionExpiry && Date.now() > sessionExpiry;
}

export function ensureSessionValid() {
  if (isSessionExpired()) {
    useAuthStore.getState().logout();
  }
}
