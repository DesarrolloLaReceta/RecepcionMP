import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, silentRequest, loginRequest } from "../Auth/msalConfig";

// ─── INSTANCIA MSAL (solo si NO es dev sin Azure) ─────────────────────────
const isDev = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK === "false";

export const msalInstance = new PublicClientApplication(msalConfig);
if (!isDev) {
  await msalInstance.initialize();
}

// ─── CLIENTE AXIOS ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5013",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

// ─── INTERCEPTOR: inyectar token Bearer automáticamente ──────────────────────

// apiClient.interceptors.request.use(
//   async (config: InternalAxiosRequestConfig) => {
//     const account = msalInstance.getActiveAccount();

//     if (!account) {
//       // Sin cuenta activa → no inyectamos token (el backend devolverá 401)
//       return config;
//     }

//     try {
//       const result = await msalInstance.acquireTokenSilent({
//         ...silentRequest,
//         account,
//       });
//       config.headers["Authorization"] = `Bearer ${result.accessToken}`;
//     } catch (error) {
//       if (error instanceof InteractionRequiredAuthError) {
//         // Requiere interacción → redirigir a login
//         await msalInstance.acquireTokenRedirect(loginRequest);
//       }
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {

    // ── Modo desarrollo sin Azure: no inyectamos token ──────────────────
    if (import.meta.env.DEV) {
      return config; // El backend DevAuthHandler no necesita token
    }

    // ── Producción: flujo MSAL normal ────────────────────────────────────
    const account = msalInstance.getActiveAccount();
    if (!account) return config;

    try {
      const result = await msalInstance.acquireTokenSilent({
        ...silentRequest,
        account,
      });
      config.headers["Authorization"] = `Bearer ${result.accessToken}`;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await msalInstance.acquireTokenRedirect(loginRequest);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── INTERCEPTOR: manejo global de errores ────────────────────────────────────

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error: AxiosError) => {
//     if (error.response?.status === 401) {
//       // Token expirado o inválido → forzar login
//       msalInstance.loginRedirect(loginRequest);
//     }

//     if (error.response?.status === 403) {
//       console.warn("[API] Acceso denegado — rol insuficiente");
//     }

//     return Promise.reject(error);
//   }
// );
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !import.meta.env.DEV) {
      msalInstance.loginRedirect(loginRequest);
    }

    if (error.response?.status === 403) {
      console.warn("[API] Acceso denegado — rol insuficiente");
    }

    return Promise.reject(error);
  }
);

// ─── HELPER: manejo de errores de API ────────────────────────────────────────

export interface ApiError {
  title: string;
  detail?: string;
  status?: number;
}

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return {
      title: data?.title ?? "Error inesperado",
      detail: data?.detail,
      status: error.response?.status,
    };
  }
  return { title: "Error de red o servidor", status: 0 };
}