-- ============================================================
-- MIGRATION V2 — Status 3-State + Nonaktifkan Unggas
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. TAMBAH KOLOM STATUS (VARCHAR) ke tabel ternak
-- ────────────────────────────────────────────────
ALTER TABLE ternak ADD COLUMN IF NOT EXISTS status VARCHAR(20);

-- Migrasi data lama
UPDATE ternak SET status = 'hidup' WHERE status_hidup = TRUE AND status IS NULL;
UPDATE ternak SET status = 'mati' WHERE status_hidup = FALSE AND status IS NULL;
UPDATE ternak SET status = 'hidup' WHERE status IS NULL;

-- Set NOT NULL dan default
ALTER TABLE ternak ALTER COLUMN status SET NOT NULL;
ALTER TABLE ternak ALTER COLUMN status SET DEFAULT 'hidup';

-- Tambah constraint CHECK
ALTER TABLE ternak ADD CONSTRAINT ternak_status_check 
  CHECK (status IN ('hidup', 'mati', 'dijual'));

-- Hapus view yang bergantung pada kolom lama terlebih dahulu
DROP VIEW IF EXISTS v_statistik_desa;
DROP VIEW IF EXISTS v_ternak_lengkap;

-- Hapus kolom lama
ALTER TABLE ternak DROP COLUMN IF EXISTS status_hidup;

-- ────────────────────────────────────────────────
-- 2. NONAKTIFKAN UNGGAS
-- ────────────────────────────────────────────────
UPDATE master_jenis_ternak SET is_active = FALSE WHERE kategori = 'Unggas';

-- ────────────────────────────────────────────────
-- 3. UPDATE VIEW: v_ternak_lengkap
-- ────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_ternak_lengkap AS
SELECT
  t.no_eartag,
  t.jenis_kelamin,
  t.umur,
  t.berat_badan,
  t.status,
  t.updated_at,
  t.created_at,
  j.nama_jenis,
  j.kategori,
  p.nik,
  p.nama_lengkap,
  p.alamat_desa,
  p.alamat_kec,
  p.alamat_detail
FROM ternak t
JOIN master_jenis_ternak j ON t.id_jenis = j.id
JOIN pemilik p ON t.id_pemilik = p.id;

-- ────────────────────────────────────────────────
-- 4. UPDATE VIEW: v_statistik_desa
-- ────────────────────────────────────────────────
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

-- ────────────────────────────────────────────────
-- 5. VERIFIKASI
-- ────────────────────────────────────────────────
SELECT 'Migration OK' as result;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ternak' AND table_schema = 'public'
ORDER BY ordinal_position;
