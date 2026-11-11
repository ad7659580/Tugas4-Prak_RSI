import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getStalls } from '../api/stalls';
import { useAsync } from '../hooks';
import { useAuth } from '../auth/AuthContext';
import { canCreateStall } from '../permissions';
import { Empty, ErrorState, Loading } from '../components/States';
import { Pagination } from '../components/Pagination';

const LIMIT = 6;

export default function StallListPage() {
  const { user } = useAuth();
  // Pencarian, filter, dan halaman disimpan di URL (?search=&category=&page=)
  const [params, setParams] = useSearchParams();
  const search = params.get('search') ?? '';
  const category = params.get('category') ?? '';
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => setSearchInput(search), [search]);

  const { data, loading, error, reload } = useAsync(
    (signal) => getStalls({ search, category, page, limit: LIMIT }, signal),
    [search, category, page],
  );

  const update = (next: Record<string, string>) => {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    setParams(p);
  };

  const hasFilter = !!(search || category);

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Warung Kantin</h1>
          <p className="muted">Cari warung favoritmu dan lihat rating dari mahasiswa.</p>
        </div>
        {canCreateStall(user) && (
          <Link to="/stalls/new" className="btn btn-primary">+ Tambah warung</Link>
        )}
      </div>

      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          update({ search: searchInput.trim(), page: '' });
        }}
      >
        <input
          type="search"
          placeholder="Cari nama warung..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Cari nama warung"
        />
        <input
          placeholder="Kategori (mis. Minuman)"
          value={category}
          onChange={(e) => update({ category: e.target.value, page: '' })}
          aria-label="Filter kategori"
        />
        <button className="btn btn-primary" type="submit">Cari</button>
        {hasFilter && (
          <button className="btn" type="button" onClick={() => setParams(new URLSearchParams())}>
            Reset
          </button>
        )}
      </form>

      {loading && <Loading label="Memuat daftar warung..." />}
      {!loading && error && <ErrorState error={error} onRetry={reload} />}
      {!loading && !error && data && data.data.length === 0 && (
        <Empty title={hasFilter ? 'Tidak ada warung yang cocok' : 'Belum ada warung'}>
          {hasFilter ? 'Coba ubah kata kunci atau filter kategori.' : 'Data warung masih kosong.'}
        </Empty>
      )}
      {!loading && !error && data && data.data.length > 0 && (
        <>
          <div className="cards">
            {data.data.map((s) => (
              <Link to={`/stalls/${s.id}`} key={s.id} className="card">
                <div className="card-top">
                  <h3>{s.name}</h3>
                  {s.isPopular && <span className="badge badge-popular">Populer</span>}
                </div>
                <p className="muted">{[s.category, s.location].filter(Boolean).join(' • ') || '—'}</p>
                <p className="rating">
                  ★ {s.avgRating.toFixed(1)} <span className="muted">({s.reviewCount} ulasan)</span>
                </p>
              </Link>
            ))}
          </div>
          <Pagination
            page={data.meta.page}
            limit={data.meta.limit}
            total={data.meta.total}
            onChange={(p) => update({ page: p > 1 ? String(p) : '' })}
          />
        </>
      )}
    </div>
  );
}
