import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import { toApiError, type ApiError } from '../api/client';
import { useToast } from '../components/Toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [clientErr, setClientErr] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validasi klien mengikuti authSchema backend (name >= 3, email valid, password 8-72)
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 3) errs.name = 'Nama minimal 3 karakter';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Format email tidak valid';
    if (form.password.length < 8) errs.password = 'Password minimal 8 karakter';
    else if (form.password.length > 72) errs.password = 'Password maksimal 72 karakter';
    setClientErr(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    setError(null);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      toast('success', 'Registrasi berhasil. Silakan masuk.');
      navigate('/login');
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const fe = (k: string) => clientErr[k] ?? error?.fields[k];

  return (
    <div className="container tiny">
      <h1>Daftar</h1>
      <div className="panel">
        <form className="form" onSubmit={onSubmit} noValidate>
          {error && !Object.keys(error.fields).length && (
            <div className="alert alert-error" role="alert">{error.message}</div>
          )}
          <label>Nama lengkap
            <input value={form.name} onChange={set('name')} disabled={busy} />
            {fe('name') && <small className="field-error">{fe('name')}</small>}
          </label>
          <label>Email
            <input type="email" value={form.email} onChange={set('email')} disabled={busy} />
            {fe('email') && <small className="field-error">{fe('email')}</small>}
          </label>
          <label>Password
            <input type="password" value={form.password} onChange={set('password')} disabled={busy} autoComplete="new-password" />
            {fe('password') && <small className="field-error">{fe('password')}</small>}
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Memproses...' : 'Daftar'}
          </button>
        </form>
        <p className="muted center">Sudah punya akun? <Link to="/login">Masuk</Link></p>
      </div>
    </div>
  );
}
