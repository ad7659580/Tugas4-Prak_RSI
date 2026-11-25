import { useState, type FormEvent } from 'react';
import { getAuditLog, getAuditLogs } from '../api/auditLogs';
import { useAsync } from '../hooks';
import { Empty, ErrorState, Loading } from '../components/States';
import type { AuditFilters, AuditLog, AuditMetadata } from '../types';

const PAGE_SIZE = 10;

const emptyFilters: AuditFilters = { action: '', targetTable: '', targetId: '', userId: '', from: '', to: '' };

const ACTIONS = ['LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE'];
const TARGETS = ['USERS', 'STALLS', 'REVIEWS', 'MENU_ITEMS', 'FLAGS'];

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' });

function meta(log: AuditLog): AuditMetadata {
  return log.metadata && typeof log.metadata === 'object' ? log.metadata : {};
}

export default function AuditLogPage() {
  const [draft, setDraft] = useState<AuditFilters>(emptyFilters);
  const [filters, setFilters] = useState<AuditFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, loading, error, reload } = useAsync(
    (signal) => getAuditLogs(filters, page, PAGE_SIZE, signal),
    [filters, page],
  );

  const set = (key: keyof AuditFilters) => (e: { target: { value: string } }) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const apply = (e: FormEvent) => {
    e.preventDefault();
    setFilters({ ...draft });
    setPage(1);
  };
  const reset = () => {
    setDraft(emptyFilters);
    setFilters(emptyFilters);
    setPage(1);
  };

  const p = data?.pagination;

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Riwayat Audit</h1>
          <p className="muted">Catatan aktivitas pengguna. Khusus admin; catatan tidak dapat diubah atau dihapus.</p>
        </div>
        <button className="btn" onClick={reload} disabled={loading}>Muat ulang</button>
      </div>

      <form className="panel audit-filters" onSubmit={apply}>
        <label>Aksi
          <select value={draft.action} onChange={set('action')}>
            <option value="">Semua aksi</option>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label>Target
          <select value={draft.targetTable} onChange={set('targetTable')}>
            <option value="">Semua target</option>
            {TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>Target ID
          <input type="number" min={1} value={draft.targetId} onChange={set('targetId')} placeholder="mis. 1" />
        </label>
        <label>User ID
          <input type="number" min={1} value={draft.userId} onChange={set('userId')} placeholder="mis. 1" />
        </label>
        <label>Dari tanggal
          <input type="date" value={draft.from} onChange={set('from')} />
        </label>
        <label>Sampai tanggal
          <input type="date" value={draft.to} onChange={set('to')} />
        </label>
        <div className="row audit-actions">
          <button type="submit" className="btn btn-primary">Terapkan</button>
          <button type="button" className="btn" onClick={reset}>Reset</button>
        </div>
      </form>

      {loading && <Loading label="Memuat riwayat audit..." />}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && data && data.items.length === 0 && (
        <Empty title="Tidak ada catatan audit">Coba ubah atau reset filter.</Empty>
      )}
      {!loading && !error && data && data.items.length > 0 && p && (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th><th>Aksi</th><th>Target</th><th>Pengguna</th><th>Hasil</th><th></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id}>
                    <td className="nowrap">{formatTime(log.createdAt)}</td>
                    <td><span className="badge badge-owner">{log.action}</span></td>
                    <td>{log.targetTable} <span className="muted">#{log.targetId}</span></td>
                    <td>
                      {log.userName ?? '—'}
                      <div className="muted small">{log.userEmail} (id {log.userId})</div>
                    </td>
                    <td>{meta(log).result ?? '—'}</td>
                    <td><button className="btn btn-sm" onClick={() => setSelectedId(log.id)}>Detail</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="pagination" aria-label="Halaman">
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Sebelumnya</button>
            <span>Halaman {p.page} dari {p.totalPages} ({p.total} catatan)</span>
            <button className="btn" disabled={page >= p.totalPages} onClick={() => setPage(page + 1)}>Berikutnya →</button>
          </nav>
        </>
      )}

      {selectedId !== null && <AuditDetailModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

/** Modal memanggil GET /api/audit-logs/:id (bukan memakai data baris di tabel). */
function AuditDetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: log, loading, error, reload } = useAsync((signal) => getAuditLog(id, signal), [id]);
  const m = log ? meta(log) : {};

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Detail audit" onClick={onClose}>
      <div className="dialog dialog-wide" onClick={(e) => e.stopPropagation()}>
        <h3>Detail audit #{id}</h3>
        {loading && <Loading label="Memuat detail..." />}
        {!loading && error && <ErrorState error={error} onRetry={reload} />}
        {!loading && log && (
          <>
            <dl className="details">
              <dt>Waktu</dt><dd>{formatTime(log.createdAt)}</dd>
              <dt>Aksi</dt><dd>{log.action}</dd>
              <dt>Target</dt><dd>{log.targetTable} #{log.targetId}</dd>
              <dt>Pengguna</dt><dd>{log.userName} ({log.userEmail}), id {log.userId}</dd>
              <dt>Role</dt><dd>{m.role ?? '—'}</dd>
              <dt>Hasil</dt><dd>{m.result ?? '—'}</dd>
              <dt>IP address</dt><dd>{m.ip_address ?? '—'}</dd>
              <dt>User agent</dt><dd className="break">{m.user_agent ?? '—'}</dd>
            </dl>
            <p className="muted small">Metadata (JSON)</p>
            <pre className="json">{JSON.stringify(log.metadata, null, 2)}</pre>
          </>
        )}
        <div className="row end"><button className="btn" onClick={onClose}>Tutup</button></div>
      </div>
    </div>
  );
}
