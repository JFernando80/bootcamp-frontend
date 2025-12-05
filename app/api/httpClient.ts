import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from "axios";
import { useAuthStore } from "../stores/authStore";

const BASE_URL = "http://localhost:8081";

const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { token, sessionId } = useAuthStore.getState();
    const headers: any = config.headers || {};
    if (sessionId && !headers["token"]) {
      headers["token"] = sessionId;
    }
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers = headers;
    return config;
  },
  (error) => Promise.reject(error as AxiosError)
);

httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
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
  }
);

export async function apiGet<T = any>(
  url: string,
  config?: AxiosRequestConfig
) {
  const res = await httpClient.get<T>(url, config);
  return res.data;
}

export async function apiPost<T = any, B = any>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
) {
  const res = await httpClient.post<T>(url, body, config);
  return res.data;
}

export async function apiPut<T = any, B = any>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
) {
  const res = await httpClient.put<T>(url, body, config);
  return res.data;
}

export async function apiDelete<T = any>(
  url: string,
  config?: AxiosRequestConfig
) {
  const res = await httpClient.delete<T>(url, config);
  return res.data;
}

export default httpClient;
