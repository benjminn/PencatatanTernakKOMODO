-- ============================================================
-- DATABASE SCHEMA — Website Pencatatan Ternak
-- Desa Golo Mori & Warloka, Kec. Komodo, Manggarai Barat
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor
-- Urutan: 1) Extensions, 2) Tables, 3) RLS, 4) Functions, 5) Seed
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Master data jenis ternak
CREATE TABLE IF NOT EXISTS master_jenis_ternak (
  id          SERIAL PRIMARY KEY,
  nama_jenis  VARCHAR(100) NOT NULL,
  opsi_kelamin TEXT[] NOT NULL DEFAULT '{"Jantan","Betina"}',
  kategori    VARCHAR(50) NOT NULL CHECK (kategori IN ('Mamalia', 'Unggas')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data pemilik/peternak (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS pemilik (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nik             VARCHAR(16) UNIQUE NOT NULL,
  nama_lengkap    VARCHAR(255) NOT NULL,
  alamat_kec      VARCHAR(100) NOT NULL,
  alamat_desa     VARCHAR(100) NOT NULL,
  alamat_detail   TEXT NOT NULL,
  role            VARCHAR(20) NOT NULL DEFAULT 'peternak' CHECK (role IN ('peternak', 'admin')),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data ternak
CREATE TABLE IF NOT EXISTS ternak (
  no_eartag     VARCHAR(50) PRIMARY KEY,
  id_pemilik    UUID NOT NULL REFERENCES pemilik(id) ON DELETE CASCADE,
  id_jenis      INTEGER NOT NULL REFERENCES master_jenis_ternak(id),
  jenis_kelamin VARCHAR(50) NOT NULL,
  umur          VARCHAR(100),       -- Nullable/Opsional
  berat_badan   DECIMAL(10, 2),     -- Nullable/Opsional, satuan kg
  status_hidup  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at on ternak
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ternak_updated_at
  BEFORE UPDATE ON ternak
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create pemilik record on auth user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if metadata has the required fields (from registration form)
  IF NEW.raw_user_meta_data->>'nik' IS NOT NULL THEN
    INSERT INTO pemilik (id, nik, nama_lengkap, alamat_kec, alamat_desa, alamat_detail, role)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nik',
      NEW.raw_user_meta_data->>'nama_lengkap',
      NEW.raw_user_meta_data->>'alamat_kec',
      NEW.raw_user_meta_data->>'alamat_desa',
      NEW.raw_user_meta_data->>'alamat_detail',
      COALESCE(NEW.raw_user_meta_data->>'role', 'peternak')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE master_jenis_ternak ENABLE ROW LEVEL SECURITY;
ALTER TABLE pemilik ENABLE ROW LEVEL SECURITY;
ALTER TABLE ternak ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM pemilik
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ──────────────────────────────────────────────
-- RLS: master_jenis_ternak
-- ──────────────────────────────────────────────

-- Anyone authenticated can read (for dropdown)
CREATE POLICY "jenis_ternak_read_all" ON master_jenis_ternak
  FOR SELECT TO authenticated
  USING (is_active = TRUE);

-- Only admin can insert/update/delete
CREATE POLICY "jenis_ternak_admin_all" ON master_jenis_ternak
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ──────────────────────────────────────────────
-- RLS: pemilik
-- ──────────────────────────────────────────────

-- User can read own profile
CREATE POLICY "pemilik_read_own" ON pemilik
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR is_admin());

-- User can update own profile (except role)
CREATE POLICY "pemilik_update_own" ON pemilik
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any profile (including role)
CREATE POLICY "pemilik_admin_update" ON pemilik
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admin can insert new pemilik manually
CREATE POLICY "pemilik_admin_insert" ON pemilik
  FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- Admin can delete pemilik (cascade deletes ternak)
CREATE POLICY "pemilik_admin_delete" ON pemilik
  FOR DELETE TO authenticated
  USING (is_admin());

-- ──────────────────────────────────────────────
-- RLS: ternak
-- ──────────────────────────────────────────────

-- User can read own ternak; Admin reads all
CREATE POLICY "ternak_read" ON ternak
  FOR SELECT TO authenticated
  USING (id_pemilik = auth.uid() OR is_admin());

-- User can add ternak for themselves only
CREATE POLICY "ternak_insert_own" ON ternak
  FOR INSERT TO authenticated
  WITH CHECK (id_pemilik = auth.uid() OR is_admin());

-- User can update their own ternak; Admin can update all
CREATE POLICY "ternak_update" ON ternak
  FOR UPDATE TO authenticated
  USING (id_pemilik = auth.uid() OR is_admin())
  WITH CHECK (id_pemilik = auth.uid() OR is_admin());

-- Admin can delete any ternak
CREATE POLICY "ternak_delete" ON ternak
  FOR DELETE TO authenticated
  USING (is_admin());

-- ============================================================
-- 5. SEED DATA — Master Jenis Ternak
-- ============================================================

INSERT INTO master_jenis_ternak (nama_jenis, opsi_kelamin, kategori) VALUES
  ('Kerbau',        '{"Jantan","Betina"}',  'Mamalia'),
  ('Sapi',          '{"Jantan","Betina"}',  'Mamalia'),
  ('Kuda',          '{"Jantan","Betina"}',  'Mamalia'),
  ('Kambing',       '{"Jantan","Betina"}',  'Mamalia'),
  ('Babi',          '{"Jantan","Betina"}',  'Mamalia'),
  ('Ayam Kampung',  '{"Campuran"}',         'Unggas'),
  ('Ayam Petelur',  '{"Campuran"}',         'Unggas'),
  ('Ayam Broiler',  '{"Campuran"}',         'Unggas'),
  ('Bebek',         '{"Jantan","Betina"}',  'Unggas'),
  ('Itik',          '{"Jantan","Betina"}',  'Unggas')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. VIEWS (Opsional — untuk kemudahan query admin)
-- ============================================================

-- View: ternak dengan info pemilik dan jenis
CREATE OR REPLACE VIEW v_ternak_lengkap AS
SELECT
  t.no_eartag,
  t.jenis_kelamin,
  t.umur,
  t.berat_badan,
  t.status_hidup,
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

-- View: statistik per desa
CREATE OR REPLACE VIEW v_statistik_desa AS
SELECT
  p.alamat_desa,
  j.nama_jenis,
  j.kategori,
  COUNT(*) FILTER (WHERE t.status_hidup = TRUE) AS jumlah_hidup,
  COUNT(*) FILTER (WHERE t.status_hidup = FALSE) AS jumlah_mati,
  COUNT(*) FILTER (WHERE t.jenis_kelamin = 'Jantan') AS jumlah_jantan,
  COUNT(*) FILTER (WHERE t.jenis_kelamin = 'Betina') AS jumlah_betina,
  COUNT(*) FILTER (WHERE t.jenis_kelamin = 'Campuran') AS jumlah_campuran,
  COUNT(*) AS total
FROM ternak t
JOIN master_jenis_ternak j ON t.id_jenis = j.id
JOIN pemilik p ON t.id_pemilik = p.id
GROUP BY p.alamat_desa, j.nama_jenis, j.kategori;

-- ============================================================
-- SELESAI! Database siap digunakan.
-- ============================================================
