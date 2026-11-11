import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Loading } from '../components/States';
import type { Role } from '../types';

/** Melindungi halaman: belum login -> /login (ingat tujuan); role tidak cocok -> /403. */
export function RequireRole({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Loading label="Memeriksa sesi..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/403" replace />;
  return <>{children}</>;
}
