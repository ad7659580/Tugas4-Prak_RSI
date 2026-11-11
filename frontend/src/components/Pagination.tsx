interface Props {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, limit, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Halaman">
      <button className="btn" disabled={page <= 1} onClick={() => onChange(page - 1)}>← Sebelumnya</button>
      <span>Halaman {page} dari {pages} ({total} warung)</span>
      <button className="btn" disabled={page >= pages} onClick={() => onChange(page + 1)}>Berikutnya →</button>
    </nav>
  );
}
