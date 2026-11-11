import { getMe } from '../api/auth';
import { useAsync } from '../hooks';
import { ErrorState, Loading } from '../components/States';
import { roleLabel } from '../permissions';

const hakAkses: Record<string, string[]> = {
  admin: ['Melihat daftar & detail warung', 'Menambah warung', 'Mengubah semua warung', 'Menghapus warung'],
  owner: ['Melihat daftar & detail warung', 'Menambah warung', 'Mengubah warung milik sendiri'],
  customer: ['Melihat daftar & detail warung'],
};

/** Data ditarik langsung dari GET /auth/me (bukan dari cache lokal). */
export default function AccountPage() {
  const { data: me, loading, error, reload } = useAsync(() => getMe(), []);

  return (
    <div className="container tiny">
      <h1>Akun saya</h1>
      {loading && <Loading label="Memuat profil..." />}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && me && (
        <div className="panel">
          <dl className="details">
            <dt>ID</dt><dd>{me.id}</dd>
            <dt>Nama</dt><dd>{me.name}</dd>
            <dt>Email</dt><dd>{me.email}</dd>
            <dt>Role</dt><dd><span className={`badge badge-${me.role}`}>{roleLabel[me.role]}</span></dd>
          </dl>
          <h3>Hak akses</h3>
          <ul>{hakAkses[me.role].map((h) => <li key={h}>{h}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
