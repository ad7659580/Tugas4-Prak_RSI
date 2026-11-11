import type { ReactNode } from 'react';
import type { ApiError } from '../api/client';

export function Loading({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="state" role="status">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="state">
      <div className="state-icon" aria-hidden="true">🍽️</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  const title =
    error.status === 0 ? 'Gagal terhubung'
    : error.status === 404 ? 'Data tidak ditemukan'
    : error.status === 403 ? 'Akses ditolak (403)'
    : error.status === 401 ? 'Perlu login (401)'
    : 'Gagal memuat data';
  return (
    <div className="state state-error" role="alert">
      <div className="state-icon" aria-hidden="true">⚠️</div>
      <h3>{title}</h3>
      <p>{error.message}</p>
      {onRetry && error.status !== 404 && (
        <button className="btn" onClick={onRetry}>Coba lagi</button>
      )}
    </div>
  );
}
