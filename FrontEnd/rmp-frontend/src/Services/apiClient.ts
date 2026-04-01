import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

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