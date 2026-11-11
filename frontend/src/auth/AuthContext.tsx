import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { onUnauthorized, tokenStore } from '../api/client';
import type { User } from '../types';

interface AuthValue {
  user: User | null;
  /** true selama aplikasi memeriksa token tersimpan lewat GET /auth/me */
  checking: boolean;
  /** true bila sesi berakhir karena 401 (token tidak valid/kedaluwarsa) */
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  clearExpired: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState<boolean>(() => tokenStore.get() !== null);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Saat halaman dimuat: bila ada token, validasi ke backend (GET /auth/me).
  useEffect(() => {
    if (!tokenStore.get()) return;
    let cancelled = false;
    authApi
      .getMe()
      .then((u) => !cancelled && setUser(u))
      .catch(() => {
        // 401 sudah ditangani interceptor; gangguan jaringan -> anggap belum login
        if (!cancelled) setUser(null);
      })
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Interceptor Axios memanggil ini saat backend membalas 401.
  useEffect(() => {
    onUnauthorized(() => {
      setUser(null);
      setSessionExpired(true);
    });
    return () => onUnauthorized(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    tokenStore.set(result.token);
    setSessionExpired(false);
    // Ambil profil dari /auth/me sebagai sumber kebenaran info pengguna.
    const me = await authApi.getMe();
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    // Backend memakai JWT stateless (tanpa endpoint logout): cukup buang token di browser.
    tokenStore.clear();
    setUser(null);
    setSessionExpired(false);
  }, []);

  const clearExpired = useCallback(() => setSessionExpired(false), []);

  const value = useMemo(
    () => ({ user, checking, sessionExpired, login, logout, clearExpired }),
    [user, checking, sessionExpired, login, logout, clearExpired],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}
