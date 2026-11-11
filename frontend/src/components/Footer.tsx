import { Link } from 'react-router-dom';

// Ganti dua nilai ini dengan identitasmu.
const AUTHOR = 'lilygoyeng';
const REPO_URL = 'https://github.com/ad7659580/Tugas4_Prak-RSI';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>Review Kantin</strong> — Tugas 4 Rekayasa Sistem Informasi
          <br />
          © {new Date().getFullYear()} {AUTHOR}
        </div>
        <div className="footer-links">
          <Link to="/">Beranda</Link>
          <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
