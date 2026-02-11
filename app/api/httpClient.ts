import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../stores/authStore";

const BASE_URL = "https://shiny-barbee-ferracio-72802286.koyeb.app";

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, sessionId } = useAuthStore.getState();

    // Log do estado de autenticação
    console.log("🔐 Auth State:", {
      hasToken: !!token,
      tokenLength: token?.length,
      hasSessionId: !!sessionId,
      sessionId: sessionId,
    });

    // Garantir que headers existe
    if (!config.headers) {
      config.headers = {} as any;
    }

    // Adicionar sessionId no header 'token'
    if (sessionId) {
      config.headers.set("token", String(sessionId));
    }

    // Adicionar JWT no header 'Authorization'
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    // Log para debug
    console.log("📤 Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: {
        token: config.headers.get("token"),
        Authorization: config.headers.get("Authorization"),
        "Content-Type": config.headers.get("Content-Type"),
      },
      data: config.data,
    });

    return config;
  },
  (error) => Promise.reject(error as AxiosError),
);

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

    if (error.response && error.response.status === 401) {
      const { isAuthenticated, logout } = useAuthStore.getState();
      if (isAuthenticated) {
        logout();
      }
      if (typeof window !== "undefined") {
        window.location.replace("/login");
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

export async function apiPost<T = any, B = any>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig,
) {
  const res = await httpClient.post<T>(url, body, config);
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

export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig,
) {
  const res = await httpClient.delete<T>(url, config);
  return res.data;
}

export default httpClient;
