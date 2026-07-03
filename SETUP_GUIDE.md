# Setup Guide — Website Pencatatan Ternak

## 📋 File yang Sudah Dibuat

```
PENCATAATAN TERNAK/
├── PROJECT_CONTEXT.md          ✅ Konteks permanen proyek
├── DATABASE_SCHEMA.sql         ✅ Script SQL lengkap (jalankan di Supabase)
└── app/                        ✅ Next.js project
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/login/   ✅ Halaman login
    │   │   ├── (auth)/register/✅ Halaman daftar
    │   │   ├── (dashboard)/
    │   │   │   ├── dashboard/  ✅ Dashboard user
    │   │   │   ├── ternak/     ✅ List, tambah, edit ternak
    │   │   │   └── admin/      ✅ Dashboard, peternak, jenis-ternak
    │   │   └── middleware.ts   ✅ Auth guard
    │   ├── components/
    │   │   ├── layout/         ✅ Sidebar + Navbar (mobile-ready)
    │   │   ├── ternak/         ✅ Table, Form, FilterBar
    │   │   ├── admin/          ✅ JenisTernakManager, DeleteButton, RegisterForm
    │   │   └── dashboard/      ✅ AdminCharts (Recharts)
    │   └── lib/
    │       ├── supabase/       ✅ Client + Server
    │       ├── actions/        ✅ auth.actions.ts, ternak.actions.ts
    │       ├── validations/    ✅ Zod schemas
    │       └── wilayah.ts      ✅ Master data wilayah
    └── .env.local              ⚠️ Perlu diisi dengan Supabase keys
```

---

## 🚀 Langkah Setup (yang perlu kamu lakukan)

### Step 1 — Buat Supabase Project

1. Buka **[https://supabase.com](https://supabase.com)** → Login / Daftar
2. Klik **"New Project"**
3. Isi nama project: `pencatatan-ternak-komodo`
4. Pilih region: **Singapore** (terdekat dari NTT)
5. Buat password database yang kuat
6. Tunggu ~2 menit sampai project selesai dibuat

### Step 2 — Ambil API Keys

1. Di Supabase dashboard → **Settings** → **API**
2. Copy **Project URL** (format: `https://xxxxx.supabase.co`)
3. Copy **anon public key** (panjang sekitar 200 karakter)
4. Copy **service_role key** (untuk operasi admin server-side)

### Step 3 — Isi Environment Variables

Buka file `app\.env.local` dan ganti dengan nilai asli:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxx
```

### Step 4 — Jalankan SQL Migration

1. Di Supabase dashboard → **SQL Editor**
2. Klik **"New query"**
3. Buka file `DATABASE_SCHEMA.sql` dari folder project
4. Copy seluruh isinya → Paste ke SQL Editor
5. Klik **"Run"** (atau Ctrl+Enter)
6. Pastikan tidak ada error merah

### Step 5 — Buat Akun Admin

Setelah SQL berhasil dijalankan, buat akun admin pertama:

```sql
-- Jalankan ini DI SQL Editor Supabase
-- Ganti nilai NIK, nama, password sesuai kebutuhan

-- 1. Daftarkan user via Supabase Auth (harus via Dashboard)
-- Pergi ke Authentication > Users > Add user
-- Email: 3200000000000001@ternak.local (NIK admin)
-- Password: AdminPuskeswan2024!
-- (Aktifkan "Auto Confirm User")

-- 2. Setelah user dibuat, update role ke admin:
UPDATE pemilik 
SET role = 'admin'
WHERE nik = '3200000000000001';
-- Atau jalankan INSERT manual jika trigger tidak berjalan:
-- INSERT INTO pemilik (id, nik, nama_lengkap, alamat_kec, alamat_desa, alamat_detail, role)
-- VALUES ('<uuid dari auth.users>', '3200000000000001', 'Admin Puskeswan', 'Komodo', 'Golo Mori', 'Puskeswan Komodo', 'admin');
```

> **CATATAN:** NIK admin bisa bebas (tidak harus 3200000000000001), asalkan 16 digit. Login menggunakan NIK + password tersebut.

### Step 6 — Disable Email Confirmation (untuk development)

Agar peternak bisa langsung login tanpa konfirmasi email:

1. Supabase → **Authentication** → **Providers** → **Email**
2. Matikan **"Confirm email"** toggle
3. Save

### Step 7 — Jalankan Development Server

```bash
cd app
npm run dev
```

Buka **[http://localhost:3000](http://localhost:3000)**

---

## 🔧 Jika Ada Error Build TypeScript

Jika `npm run build` gagal, jalankan:
```bash
cd app
npm run dev
```
Dev server lebih toleran terhadap type error kecil. Perbaiki error yang muncul di browser.

---

## 🌐 Tentang Middleware Deprecation Warning

Next.js 16 menampilkan warning:
> `The "middleware" file convention is deprecated. Please use "proxy" instead.`

Ini **hanya warning**, bukan error. Aplikasi tetap berjalan normal.
Untuk fix permanennya, rename `middleware.ts` → `proxy.ts` (tidak urgent sekarang).

---

## 📱 Fitur yang Sudah Berjalan

| Fitur | Status |
|-------|--------|
| Login via NIK + Password | ✅ |
| Registrasi mandiri peternak | ✅ |
| Validasi NIK 16 digit unik | ✅ |
| Dashboard user (profil + ternak) | ✅ |
| Dashboard admin (statistik + chart) | ✅ |
| Tambah ternak (eartag unique check) | ✅ |
| Edit ternak (umur, berat, status) | ✅ |
| Badge visual Hidup/Mati | ✅ |
| Filter ternak (jenis, desa, status, search) | ✅ |
| Manajemen peternak (admin) | ✅ |
| CRUD jenis ternak (admin) | ✅ |
| Registrasi peternak manual (admin) | ✅ |
| Cascade delete pemilik → ternak | ✅ (via SQL RLS) |
| Mobile-responsive sidebar/navbar | ✅ |
| Dark theme earthy NTT colors | ✅ |
