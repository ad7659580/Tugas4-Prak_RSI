import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { canCreateStall, roleLabel } from '../permissions';
import { useToast } from './Toast';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const onLogout = async () => {
    await logout();
    toast('success', 'Kamu sudah keluar.');
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">Review Kantin</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Warung</NavLink>
          {canCreateStall(user) && <NavLink to="/stalls/new">+ Tambah</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin/audit">Audit</NavLink>}
          {user ? (
            <>
              <NavLink to="/account">
                {user.name} <span className={`badge badge-${user.role}`}>{roleLabel[user.role]}</span>
              </NavLink>
              <button className="btn btn-sm" onClick={onLogout}>Keluar</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Masuk</NavLink>
              <NavLink to="/register">Daftar</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
