import axios, { AxiosError } from 'axios';
import type { FieldIssue } from '../types';

// Base URL dibaca dari .env (VITE_API_BASE_URL) agar alamat backend mudah diganti.
export const BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ??
  'http://localhost:3000';

const TOKEN_KEY = 'kantin_token';

export const tokenStore = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* abaikan */
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* abaikan */
    }
  },
};

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Setiap request membawa JWT (jika ada) lewat header Authorization: Bearer <token>.
http.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 di luar form login berarti token hilang/kedaluwarsa -> sesi diakhiri.
// AuthContext mendaftarkan handler-nya lewat onUnauthorized.
let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const url = error.config?.url ?? '';
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthForm) {
      tokenStore.clear();
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

export interface ApiError {
  /** HTTP status; 0 = gagal terhubung (jaringan/CORS/timeout) */
  status: number;
  message: string;
  fields: Record<string, string>;
}

/** Ubah error apa pun (Axios/biasa) menjadi bentuk seragam yang mudah ditampilkan. */
export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const res = err.response;
    if (!res) {
      return {
        status: 0,
        message:
          err.code === 'ECONNABORTED'
            ? 'Server terlalu lama merespons. Coba lagi.'
            : 'Tidak dapat terhubung ke server. Pastikan backend sudah berjalan.',
        fields: {},
      };
    }
    const body = res.data as { message?: string; errors?: FieldIssue[] } | undefined;
    const fields: Record<string, string> = {};
    if (Array.isArray(body?.errors)) {
      for (const issue of body.errors) {
        if (issue?.field && !fields[issue.field]) fields[issue.field] = issue.message;
      }
    }
    return {
      status: res.status,
      message: body?.message ?? `Permintaan gagal (HTTP ${res.status})`,
      fields,
    };
  }
  return { status: -1, message: err instanceof Error ? err.message : 'Terjadi kesalahan', fields: {} };
}
