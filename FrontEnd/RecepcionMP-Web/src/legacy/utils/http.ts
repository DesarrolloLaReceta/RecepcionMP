import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

// Interceptor de respuesta (errores estándar)
http.interceptors.response.use(
  response => response,
  error => {
    console.error('API error:', error);
    return Promise.reject(error);
  }
);
