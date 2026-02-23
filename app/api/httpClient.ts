import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../stores/authStore";
import { refreshToken as refreshTokenRequest } from "./authService";

const BASE_URL = "https://shiny-barbee-ferracio-72802286.koyeb.app";

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 300000, // 5 minutes
});

// Cliente público (sem interceptor de autenticação) — usado para chamadas que
// não devem enviar o header Authorization mesmo quando o usuário está logado.
const publicClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 300000,
});

/**
 * INTERCEPTOR DE REQUEST (AUTENTICAÇÃO AUTOMÁTICA)
 *
 * Este interceptor adiciona AUTOMATICAMENTE o header de autenticação
 * em TODAS as requisições feitas através do httpClient.
 *
 * Header adicionado:
 * - 'Authorization': jwtToken (apenas o token, SEM prefixo "Bearer")
 *
 * IMPORTANTE: O header Authorization recebe apenas a string do token,
 * não use o formato "Bearer {token}"!
 *
 * NÃO é necessário adicionar esse header manualmente nas chamadas de API!
 *
 * Documentação completa: docs/AUTENTICACAO.md
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token } = useAuthStore.getState();

    // Garantir que headers existe
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Adicionar JWT no header 'Authorization' (apenas o token, sem Bearer)
    if (token) {
      (config.headers as any)["Authorization"] = token;
    }

    // Log para debug
    console.log("📤 Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers as any,
      data: config.data,
    });

    return config;
  },
  (error) => Promise.reject(error as AxiosError),
);

/**
 * INTERCEPTOR DE RESPONSE (LOGOUT AUTOMÁTICO EM 401)
 *
 * Este interceptor monitora as respostas da API e faz logout automático
 * quando recebe status 401 (Unauthorized).
 *
 * Comportamento:
 * - Se receber 401: limpa authStore e redireciona para /login
 * - Outros erros: apenas propaga o erro
 *
 * Documentação completa: docs/AUTENTICACAO.md
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("✅ Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error("❌ Error Response:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 with refresh token flow
    if (error.response && error.response.status === 401) {
      const { refreshToken, logout } = useAuthStore.getState();

      if (!refreshToken) {
        // No refresh token available -> logout
        if (logout) logout();
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "auth_redirect_reason",
            "Sua sessão expirou. Por favor, faça login novamente.",
          );
          window.location.replace("/login");
        }
        return Promise.reject(error);
      }

      // Avoid retrying the same request multiple times
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Call refresh endpoint which updates the store
          await refreshTokenRequest(refreshToken);

          // Get the new token from the store
          const { token: newToken } = useAuthStore.getState();

          if (newToken) {
            // Update the header and retry the original request
            (originalRequest.headers as any)["Authorization"] = newToken;
            return httpClient.request(originalRequest);
          }
        } catch (refreshErr) {
          console.error("❌ Refresh token failed:", refreshErr);
          // Refresh failed -> logout
          if (logout) logout();
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              "auth_redirect_reason",
              "Sua sessão expirou. Por favor, faça login novamente.",
            );
            window.location.replace("/login");
          }
          return Promise.reject(refreshErr);
        }
      }
    }

    return Promise.reject(error);
  },
);

export async function apiGet<T = any>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const res = await httpClient.get<T>(url, config);
  return res.data;
}

export async function apiPublicGet<T = any>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const res = await publicClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T = any, B = any>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await httpClient.post<T>(url, body, config);
  return res.data;
}

export async function apiPublicPost<T = any, B = any>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await publicClient.post<T>(url, body, config);
  return res.data;
}

export async function apiPut<T = any, B = any>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await httpClient.put<T>(url, body, config);
  return res.data;
}

export async function apiPublicPut<T = any, B = any>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await publicClient.put<T>(url, body, config);
  return res.data;
}

export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const res = await httpClient.delete<T>(url, config);
  return res.data;
}

export async function apiPublicDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const res = await publicClient.delete<T>(url, config);
  return res.data;
}

export default httpClient;
