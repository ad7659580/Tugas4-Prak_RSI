import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="container tiny">
      <div className="state">
        <div className="state-icon">🚫</div>
        <h1>403 — Akses ditolak</h1>
        <p>Role akunmu tidak memiliki izin untuk membuka halaman ini.</p>
        <Link className="btn btn-primary" to="/">Kembali ke daftar warung</Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="container tiny">
      <div className="state">
        <div className="state-icon">🔍</div>
        <h1>404 — Halaman tidak ada</h1>
        <Link className="btn btn-primary" to="/">Kembali ke beranda</Link>
      </div>
    </div>
  );
}
