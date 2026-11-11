import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { toApiError, type ApiError } from '../api/client';
import { useToast } from '../components/Toast';

export default function LoginPage() {
  const { login, sessionExpired, clearExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    clearExpired();
    try {
      const user = await login(email.trim(), password);
      toast('success', `Selamat datang, ${user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(toApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container tiny">
      <h1>Masuk</h1>
      <div className="panel">
        {sessionExpired && (
          <div className="alert alert-warn">Sesi kamu berakhir (401). Silakan masuk lagi.</div>
        )}
        {location.state && (location.state as { from?: string }).from && !sessionExpired && (
          <div className="alert alert-warn">Halaman tersebut membutuhkan login.</div>
        )}
        <form className="form" onSubmit={onSubmit} noValidate>
          {error && !Object.keys(error.fields).length && (
            <div className="alert alert-error" role="alert">{error.message}</div>
          )}
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} autoComplete="username" />
            {error?.fields.email && <small className="field-error">{error.fields.email}</small>}
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} autoComplete="current-password" />
            {error?.fields.password && <small className="field-error">{error.fields.password}</small>}
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <p className="muted center">Belum punya akun? <Link to="/register">Daftar</Link></p>
      </div>
    </div>
  );
}
