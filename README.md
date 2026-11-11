# Review Kantin — Tugas 4 (Frontend React & Integrasi Backend)

Frontend React + TypeScript untuk Sistem Review Kantin, terhubung ke backend Express + SQL Server dari Tugas 2 (CRUD & database) dan Tugas 3 (autentikasi JWT & role).

**Metode komunikasi HTTP: Axios** (dipakai konsisten untuk semua request, lihat `frontend/src/api/`).

## Struktur

```
backend/    API Express + TypeScript + Drizzle (Tugas 2 & 3, plus CORS untuk Tugas 4)
frontend/   React 19 + TypeScript + Vite + React Router + Axios
```

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Axios |
| Backend | Express 5, TypeScript (tsx), Drizzle ORM, mssql, Zod, JWT, bcryptjs, cors |
| Database | Microsoft SQL Server |

## Fitur

- Daftar warung dari `GET /stalls` dengan pencarian nama, filter kategori, dan pagination (state tersimpan di URL).
- Detail warung dari `GET /stalls/:id`.
- Tambah (`POST`), ubah (`PUT`), hapus (`DELETE`) warung sesuai role; hapus lewat dialog konfirmasi.
- Registrasi, login, halaman akun (`GET /auth/me`), logout (token dibuang di browser karena JWT stateless).
- Tampilan mengikuti role; keputusan akhir tetap di backend. 401 mengakhiri sesi dan mengarahkan ke login, 403 ditampilkan sebagai pesan jelas, 400 ditampilkan di bawah kolom terkait.
- Loading state, empty state, dan error state (dengan tombol "Coba lagi").

## Hak akses

| Aksi | Tamu | Customer | Owner | Admin |
|---|:-:|:-:|:-:|:-:|
| Lihat daftar & detail | ya | ya | ya | ya |
| Registrasi / login | ya | | | |
| Tambah warung | | | ya | ya |
| Ubah warung | | | milik sendiri | semua |
| Hapus warung | | | | ya |

## Menjalankan

Prasyarat: Node.js 22+, SQL Server aktif di `localhost:1433` (TCP/IP & SQL Authentication aktif).

### 1. Database
Buat database kosong `review_kantin`, lalu jalankan berurutan di SSMS/DBeaver:

1. `backend/db/01-create-login-tugas2.sql` (ganti `GANTI_DENGAN_PASSWORD_KAMU` dulu, hanya di komputermu)
2. `backend/db/02-schema.sql`
3. `backend/db/03-seed-full.sql`

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# isi DB_USER, DB_PASSWORD, JWT_SECRET di .env
npm run seed:demo           # memberi password asli ke akun demo (sekali saja)
npm run dev
```
Cek `http://localhost:3000/health`. Swagger: `http://localhost:3000/docs`.

| Variabel `.env` | Keterangan |
|---|---|
| `PORT` | Port API (default 3000) |
| `CORS_ORIGIN` | Alamat frontend yang diizinkan (default `http://localhost:5173`) |
| `DB_SERVER`, `DB_PORT`, `DB_NAME` | Biasanya `localhost`, `1433`, `review_kantin` |
| `DB_USER`, `DB_PASSWORD` | Login SQL Server dari langkah 1 |
| `JWT_SECRET` | String acak panjang: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Masa berlaku token (default `2h`) |

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
`VITE_API_BASE_URL` berisi alamat backend (default `http://localhost:3000`). Buka `http://localhost:5173`.

## Akun demo (setelah `npm run seed:demo`)

Password semua akun: `Kantin12345`

| Role | Email | Catatan |
|---|---|---|
| Admin | `admin@kantin.test` | akses penuh |
| Owner | `tini@kantin.test` | pemilik warung id 1 |
| Owner | `slamet@kantin.test` | pemilik warung id 3 |
| Customer | `bagas@student.test` | hanya melihat |

> Akun demo hanya untuk lingkungan belajar. Jangan commit `.env`; gunakan `.env.example`.
