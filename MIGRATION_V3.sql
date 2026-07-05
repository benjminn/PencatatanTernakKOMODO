-- ============================================================
-- MIGRATION V3 — Sistem Penanda Ternak
-- Mengganti no_eartag menjadi UUID sebagai Primary Key, 
-- dan memisahkan penanda menjadi jenis_penanda & identitas_penanda.
-- ============================================================

-- 1. Hapus VIEW yang bergantung pada ternak.no_eartag
DROP VIEW IF EXISTS v_statistik_desa;
DROP VIEW IF EXISTS v_ternak_lengkap;

-- 2. Ubah Primary Key dari no_eartag menjadi id UUID
-- Karena no_eartag adalah PK, kita harus menghapus constraint-nya.
ALTER TABLE ternak DROP CONSTRAINT IF EXISTS ternak_pkey CASCADE;

-- Tambah UUID sebagai kolom baru dan jadikan Primary Key
ALTER TABLE ternak ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT uuid_generate_v4();

-- Rename kolom no_eartag ke identitas_penanda
ALTER TABLE ternak RENAME COLUMN no_eartag TO identitas_penanda;

-- Ubah identitas_penanda menjadi nullable karena beberapa penanda mungkin tidak punya kode unik
ALTER TABLE ternak ALTER COLUMN identitas_penanda DROP NOT NULL;

-- Tambah kolom jenis_penanda
ALTER TABLE ternak ADD COLUMN IF NOT EXISTS jenis_penanda VARCHAR(50) DEFAULT 'Eartag' NOT NULL;

-- 3. Bikin ulang View v_ternak_lengkap
CREATE OR REPLACE VIEW v_ternak_lengkap AS
SELECT
  t.id,
  t.jenis_penanda,
  t.identitas_penanda,
  t.jenis_kelamin,
  t.umur,
  t.berat_badan,
  t.status,
  t.updated_at,
  t.created_at,
  j.nama_jenis,
  j.kategori,
  p.id AS id_pemilik,
  p.nik,
  p.nama_lengkap,
  p.alamat_desa,
  p.alamat_kec,
  p.alamat_detail
FROM ternak t
JOIN master_jenis_ternak j ON t.id_jenis = j.id
JOIN pemilik p ON t.id_pemilik = p.id;

-- 4. Bikin ulang View v_statistik_desa
CREATE OR REPLACE VIEW v_statistik_desa AS
SELECT
  p.alamat_desa,
  j.nama_jenis,
  j.kategori,
  COUNT(*) FILTER (WHERE t.status = 'hidup') AS jumlah_hidup,
  COUNT(*) FILTER (WHERE t.status = 'mati') AS jumlah_mati,
  COUNT(*) FILTER (WHERE t.status = 'dijual') AS jumlah_dijual,
  COUNT(*) FILTER (WHERE t.jenis_kelamin = 'Jantan') AS jumlah_jantan,
  COUNT(*) FILTER (WHERE t.jenis_kelamin = 'Betina') AS jumlah_betina,
  COUNT(*) FILTER (WHERE t.jenis_kelamin = 'Campuran') AS jumlah_campuran,
  COUNT(*) AS total
FROM ternak t
JOIN master_jenis_ternak j ON t.id_jenis = j.id
JOIN pemilik p ON t.id_pemilik = p.id
GROUP BY p.alamat_desa, j.nama_jenis, j.kategori;

-- 5. Update Schema Types & Verifikasi
SELECT 'Migration V3 OK' as result;
