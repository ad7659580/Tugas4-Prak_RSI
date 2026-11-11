import { useState, type FormEvent } from 'react';
import type { ApiError } from '../api/client';
import type { Stall, StallInput } from '../types';

interface Props {
  initial?: Stall;
  submitting: boolean;
  error: ApiError | null;
  submitLabel: string;
  onSubmit: (input: StallInput) => void;
  onCancel: () => void;
}

// Validasi sisi klien mengikuti aturan backend (stallSchema.ts): name 3-100, category 50, location 100, description 1000.
function validate(v: Record<string, string>): Record<string, string> {
  const e: Record<string, string> = {};
  const name = v.name.trim();
  if (!name) e.name = 'Nama wajib diisi';
  else if (name.length < 3) e.name = 'Nama minimal 3 karakter';
  else if (name.length > 100) e.name = 'Nama maksimal 100 karakter';
  if (v.category.trim().length > 50) e.category = 'Kategori maksimal 50 karakter';
  if (v.location.trim().length > 100) e.location = 'Lokasi maksimal 100 karakter';
  if (v.description.trim().length > 1000) e.description = 'Deskripsi maksimal 1000 karakter';
  return e;
}

export function StallForm({ initial, submitting, error, submitLabel, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    category: initial?.category ?? '',
    location: initial?.location ?? '',
    description: initial?.description ?? '',
  });
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof values) => (e: { target: { value: string } }) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handle = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(values);
    setClientErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const orNull = (s: string) => (s.trim() === '' ? null : s.trim());
    onSubmit({
      name: values.name.trim(),
      category: orNull(values.category),
      location: orNull(values.location),
      description: orNull(values.description),
    });
  };

  // Pesan per kolom: validasi klien dulu, lalu validasi 400 dari backend.
  const fieldError = (k: string) => clientErrors[k] ?? error?.fields[k];
  const generalError = error && Object.keys(error.fields).length === 0 ? error : null;

  return (
    <form className="form" onSubmit={handle} noValidate>
      {generalError && <div className="alert alert-error" role="alert">{generalError.message}</div>}

      <label>
        Nama warung *
        <input value={values.name} onChange={set('name')} disabled={submitting} maxLength={120} />
        {fieldError('name') && <small className="field-error">{fieldError('name')}</small>}
      </label>
      <div className="grid-2">
        <label>
          Kategori
          <input value={values.category} onChange={set('category')} disabled={submitting} placeholder="Nasi, Bakso, Minuman..." />
          {fieldError('category') && <small className="field-error">{fieldError('category')}</small>}
        </label>
        <label>
          Lokasi
          <input value={values.location} onChange={set('location')} disabled={submitting} placeholder="Kantin FK" />
          {fieldError('location') && <small className="field-error">{fieldError('location')}</small>}
        </label>
      </div>
      <label>
        Deskripsi
        <textarea rows={4} value={values.description} onChange={set('description')} disabled={submitting} />
        {fieldError('description') && <small className="field-error">{fieldError('description')}</small>}
      </label>

      <div className="row end">
        <button type="button" className="btn" onClick={onCancel} disabled={submitting}>Batal</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
