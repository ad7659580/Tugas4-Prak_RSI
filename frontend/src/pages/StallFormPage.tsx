import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createStall, getStall, updateStall } from '../api/stalls';
import { toApiError, type ApiError } from '../api/client';
import { useAsync } from '../hooks';
import { useAuth } from '../auth/AuthContext';
import { canEditStall } from '../permissions';
import { ErrorState, Loading } from '../components/States';
import { StallForm } from '../components/StallForm';
import { useToast } from '../components/Toast';
import type { StallInput } from '../types';

/** Satu halaman untuk Tambah (/stalls/new) dan Ubah (/stalls/:id/edit). */
export default function StallFormPage() {
  const { id } = useParams();
  const editing = id !== undefined;
  const stallId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { data: stall, loading, error: loadError, reload } = useAsync(
    (signal) => (editing ? getStall(stallId, signal) : Promise.resolve(null)),
    [id],
  );

  const submit = async (input: StallInput) => {
    setSubmitting(true);
    setError(null);
    try {
      const saved = editing ? await updateStall(stallId, input) : await createStall(input);
      toast('success', editing ? 'Warung berhasil diubah.' : 'Warung berhasil ditambahkan.');
      navigate(`/stalls/${saved.id}`);
    } catch (err) {
      const e = toApiError(err);
      setError(e);
      // 400 ditampilkan di bawah kolom; 403 dan lainnya sebagai pesan jelas
      if (e.status === 403) toast('error', `Ditolak (403): ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const cancel = () => navigate(editing ? `/stalls/${stallId}` : '/');

  if (editing && (!Number.isInteger(stallId) || stallId <= 0)) {
    return <div className="container"><ErrorState error={{ status: 404, message: 'ID warung tidak valid.', fields: {} }} /></div>;
  }

  return (
    <div className="container narrow">
      <Link to={editing ? `/stalls/${stallId}` : '/'} className="back">← Kembali</Link>
      <h1>{editing ? 'Ubah warung' : 'Tambah warung'}</h1>

      {editing && loading && <Loading label="Memuat data warung..." />}
      {editing && !loading && loadError && <ErrorState error={loadError} onRetry={reload} />}

      {(!editing || (!loading && stall)) && !loadError && (
        <div className="panel">
          {editing && stall && !canEditStall(user, stall) && (
            <div className="alert alert-warn">
              Warung ini bukan milikmu. Backend akan menolak perubahan (403 Forbidden).
            </div>
          )}
          {error && error.status !== 400 && error.status !== 0 && (
            <div className="alert alert-error" role="alert">
              {error.status === 403 ? '403 Forbidden — ' : ''}{error.message}
            </div>
          )}
          {error && error.status === 0 && <div className="alert alert-error">{error.message}</div>}
          <StallForm
            initial={stall ?? undefined}
            submitting={submitting}
            // pesan umum sudah ditampilkan di atas; form hanya perlu error per kolom (400)
            error={error && error.status === 400 ? error : null}
            submitLabel={editing ? 'Simpan perubahan' : 'Simpan warung'}
            onSubmit={submit}
            onCancel={cancel}
          />
        </div>
      )}
    </div>
  );
}
