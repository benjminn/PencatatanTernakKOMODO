# PROJECT CONTEXT — Website Pencatatan Ternak
## Desa Golo Mori & Warloka, Kecamatan Komodo, Manggarai Barat

> File ini adalah konteks permanen proyek. Selalu baca file ini di awal setiap sesi kerja.

---

## 🎯 Tujuan Proyek

Platform digital untuk **merekapitulasi dan memantau populasi hewan ternak** warga Desa Golo Mori dan Desa Warloka. Dikembangkan dalam rangka KKN UGM di Kecamatan Komodo, Kabupaten Manggarai Barat, NTT.

---

## 👥 Aktor Sistem

| Aktor | Deskripsi | Akses |
|-------|-----------|-------|
| **Peternak (User)** | Warga desa pemilik hewan ternak | Lihat & kelola ternak milik sendiri |
| **Puskeswan (Admin)** | Petugas kesehatan hewan / perangkat desa | Full access ke seluruh data sistem |

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Form | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Security | Row Level Security (RLS) |

---

## 📁 Struktur Project

```
PENCATAATAN TERNAK/
├── PROJECT_CONTEXT.md        ← File ini (konteks permanen)
├── DATABASE_SCHEMA.sql       ← SQL migration script lengkap
├── app/                      ← Next.js project root
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── ternak/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── tambah/page.tsx
│   │   │   │   │   └── [eartag]/edit/page.tsx
│   │   │   │   └── admin/
│   │   │   │       ├── dashboard/page.tsx
│   │   │   │       ├── peternak/page.tsx
│   │   │   │       └── jenis-ternak/page.tsx
│   │   │   ├── middleware.ts
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/           ← shadcn components
│   │   │   ├── auth/         ← LoginForm, RegisterForm
│   │   │   ├── ternak/       ← TernakTable, TernakForm, StatusBadge
│   │   │   ├── dashboard/    ← StatsCard, Charts
│   │   │   └── layout/       ← Sidebar, Navbar
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts
│   │   │   │   └── server.ts
│   │   │   ├── actions/      ← Server Actions
│   │   │   └── validations/  ← Zod schemas
│   │   └── types/
│   │       └── database.types.ts
│   ├── .env.local            ← Supabase keys (JANGAN di-commit!)
│   └── package.json
```

---

## 🗄️ Database Schema (Supabase PostgreSQL)

### Tabel: `master_jenis_ternak`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | SERIAL, PK | Auto increment |
| nama_jenis | VARCHAR | Nama hewan (Kerbau, Sapi, dll) |
| opsi_kelamin | TEXT[] | Array opsi: ['Jantan','Betina'] atau ['Campuran'] |
| kategori | VARCHAR | 'Mamalia' atau 'Unggas' |
| is_active | BOOLEAN | Default TRUE |

**Default data:** Kerbau, Sapi, Kuda, Kambing, Babi (Mamalia - Jantan/Betina), Ayam Kampung, Ayam Petelur, Ayam Broiler, Bebek, Itik (Unggas - Campuran)

### Tabel: `pemilik`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID, PK | = auth.users.id |
| nik | VARCHAR(16), UNIQUE | 16 digit, wajib |
| nama_lengkap | VARCHAR | Wajib |
| alamat_kec | VARCHAR | Kecamatan |
| alamat_desa | VARCHAR | Golo Mori / Warloka |
| alamat_detail | TEXT | RT/RW/Kampung |
| role | VARCHAR | 'peternak' / 'admin', default 'peternak' |
| created_at | TIMESTAMP | Auto |

### Tabel: `ternak`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| no_eartag | VARCHAR, PK | Unik di seluruh sistem |
| id_pemilik | UUID, FK | → pemilik.id ON DELETE CASCADE |
| id_jenis | INT, FK | → master_jenis_ternak.id |
| jenis_kelamin | VARCHAR | Wajib |
| umur | VARCHAR | Nullable/Opsional |
| berat_badan | DECIMAL | Nullable/Opsional, satuan kg |
| status_hidup | BOOLEAN | Default TRUE (Hidup) |
| updated_at | TIMESTAMP | Auto update |
| created_at | TIMESTAMP | Auto |

**Relasi:** Composition (CASCADE DELETE) — hapus pemilik = hapus semua ternaknya

---

## 🔐 Keamanan & RLS

- **Auth:** Supabase Auth (email-based, email = `{NIK}@pencatatan-ternak.local`)
- **Password:** Di-hash oleh Supabase Auth (bcrypt)
- **RLS pemilik:** User hanya bisa akses row miliknya (`id = auth.uid()`)
- **RLS ternak:** User hanya bisa akses ternak miliknya (`id_pemilik = auth.uid()`)
- **Admin bypass:** Role 'admin' bisa akses semua data

---

## 🎨 Design System

### Color Palette
```css
--color-primary: #1a5e38       /* Hijau tua — alam NTT */
--color-primary-light: #2d8a54
--color-secondary: #e07b39     /* Oranye — warna Komodo */
--color-accent: #f5e6c8        /* Krem/Sand */
--color-bg: #0f1a14            /* Dark background */
--color-surface: #1a2d20       /* Dark surface */
--color-surface-2: #243b2a     /* Elevated surface */
--color-text: #e8f0ea          /* Main text */
--color-text-muted: #8aaa91    /* Muted text */
```

### Status Badge Colors
- **Hidup:** Green badge (`bg-green-500/20 text-green-400`)
- **Mati:** Red badge (`bg-red-500/20 text-red-400`)

### Typography
- Font: **Inter** (Google Fonts)
- Headings: Bold, tracking-tight
- Body: Regular, leading-relaxed

---

## 🌏 Master Data Wilayah

### Kecamatan yang Tersedia
- Komodo

### Desa yang Tersedia
- **Kecamatan Komodo:**
  - Golo Mori
  - Warloka

*(Bisa diperluas sesuai kebutuhan)*

---

## ✅ Functional Requirements Checklist

### Auth (FR-01 s/d FR-05)
- [x] FR-01: Self-registration peternak (NIK, Nama, Password, Alamat)
- [x] FR-02: Validasi NIK 16 digit & unik
- [x] FR-03: Login user dengan NIK + password
- [x] FR-04: Login admin dengan kredensial khusus
- [x] FR-05: Admin bisa daftarkan peternak secara manual

### Master Data (FR-06 s/d FR-08)
- [x] FR-06: Admin CRUD jenis ternak
- [x] FR-07: Admin atur opsi jenis kelamin per jenis ternak
- [x] FR-08: Master data wilayah nested dropdown

### Manajemen Ternak (FR-09 s/d FR-15)
- [x] FR-09: Form input ternak (Eartag, Jenis, Kelamin, Status)
- [x] FR-10: Field opsional Umur & Berat Badan
- [x] FR-11: Eartag unik di seluruh sistem
- [x] FR-12: Update data tunggal (berat, umur, status)
- [x] FR-13: User hanya akses ternak miliknya
- [x] FR-14: Admin bisa cari/filter semua data
- [x] FR-15: Visual badge untuk status Mati

### Dashboard (FR-16 s/d FR-17)
- [x] FR-16: Dashboard admin dengan statistik agregasi
- [x] FR-17: Dashboard user dengan profil & list ternak

---

## 📝 Catatan Pengembangan

- **NIK sebagai email Supabase:** Format `{NIK}@ternak.local` agar kompatibel dengan Supabase Auth email-based
- **No Eartag format:** Bebas (validasi hanya unik)
- **Bahasa UI:** Sepenuhnya Bahasa Indonesia
- **Mobile-First:** Semua layout prioritas mobile, tabel scroll horizontal di mobile
- **Nullability:** Kolom umur & berat_badan = NULLABLE (tidak boleh crash jika kosong)

---

## 🚀 Setup & Deployment

### Development
```bash
cd app
npm run dev
# Buka http://localhost:3000
```

### Environment Variables (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxx  # Hanya untuk server-side admin operations
```

### Database Setup
1. Buka Supabase Dashboard → SQL Editor
2. Jalankan `DATABASE_SCHEMA.sql`
3. Selesai!
