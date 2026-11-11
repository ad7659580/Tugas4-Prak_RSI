import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteStall, getStall } from '../api/stalls';
import { toApiError } from '../api/client';
import { useAsync } from '../hooks';
import { useAuth } from '../auth/AuthContext';
import { canDeleteStall, canEditStall } from '../permissions';
import { ErrorState, Loading } from '../components/States';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function StallDetailPage() {
  const { id } = useParams();
  const stallId = Number(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { data: stall, loading, error, reload } = useAsync(
    (signal) => getStall(stallId, signal),
    [stallId],
  );

  const onDelete = async () => {
    setDeleting(true);
    try {
      await deleteStall(stallId);
      toast('success', 'Warung berhasil dihapus.');
      navigate('/');
    } catch (err) {
      const e = toApiError(err);
      toast('error', e.status === 403 ? `Ditolak (403): ${e.message}` : e.message);
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!Number.isInteger(stallId) || stallId <= 0) {
    return <div className="container"><ErrorState error={{ status: 404, message: 'ID warung tidak valid.', fields: {} }} /></div>;
  }

  return (
    <div className="container narrow">
      <Link to="/" className="back">← Kembali ke daftar</Link>
      {loading && <Loading label="Memuat detail warung..." />}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && stall && (
        <article className="panel">
          <div className="card-top">
            <h1>{stall.name}</h1>
            {stall.isPopular && <span className="badge badge-popular">Populer</span>}
          </div>
          <p className="rating big">
            ★ {stall.avgRating.toFixed(1)} <span className="muted">({stall.reviewCount} ulasan)</span>
          </p>
          <dl className="details">
            <dt>Kategori</dt><dd>{stall.category ?? '—'}</dd>
            <dt>Lokasi</dt><dd>{stall.location ?? '—'}</dd>
            <dt>Deskripsi</dt><dd>{stall.description ?? '—'}</dd>
            <dt>ID pemilik</dt><dd>{stall.ownerId}</dd>
          </dl>

          {(canEditStall(user, stall) || canDeleteStall(user)) && (
            <div className="row">
              {canEditStall(user, stall) && (
                <Link className="btn btn-primary" to={`/stalls/${stall.id}/edit`}>Ubah</Link>
              )}
              {canDeleteStall(user) && (
                <button className="btn btn-danger" onClick={() => setConfirming(true)}>Hapus</button>
              )}
            </div>
          )}
        </article>
      )}
      {confirming && stall && (
        <ConfirmDialog
          title="Hapus warung?"
          message={`"${stall.name}" akan dihapus permanen dari database.`}
          confirmLabel="Ya, hapus"
          busy={deleting}
          onConfirm={onDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}
