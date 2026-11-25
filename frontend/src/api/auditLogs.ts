import { http } from './client';
import type { AuditFilters, AuditLog, AuditLogList } from '../types';

export async function getAuditLogs(
  filters: AuditFilters,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<AuditLogList> {
  // Hanya kirim parameter yang terisi (backend menolak nilai kosong untuk angka/tanggal)
  const params: Record<string, string | number> = { page, pageSize };
  (Object.keys(filters) as (keyof AuditFilters)[]).forEach((key) => {
    const value = filters[key].trim();
    if (value) params[key] = value;
  });
  const res = await http.get<{ data: AuditLogList }>('/api/audit-logs', { params, signal });
  return res.data.data;
}

export async function getAuditLog(id: number, signal?: AbortSignal): Promise<AuditLog> {
  const res = await http.get<{ data: AuditLog }>(`/api/audit-logs/${id}`, { signal });
  return res.data.data;
}
