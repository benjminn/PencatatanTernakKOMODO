-- ============================================================
-- MIGRATION V3 — Superadmin Role
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────
-- 1. UPDATE CONSTRAINT ROLE
-- ────────────────────────────────────────────────
-- Hapus constraint yang lama terlebih dahulu
ALTER TABLE pemilik DROP CONSTRAINT IF EXISTS pemilik_role_check;

-- Tambahkan constraint baru yang mengizinkan 'superadmin'
ALTER TABLE pemilik ADD CONSTRAINT pemilik_role_check 
  CHECK (role IN ('peternak', 'admin', 'superadmin'));

-- ────────────────────────────────────────────────
-- 2. FUNGSI is_admin() dan is_superadmin()
-- ────────────────────────────────────────────────
-- Superadmin juga dihitung sebagai admin (untuk RLS yang sudah ada)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM pemilik
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'superadmin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Fungsi khusus untuk RLS superadmin (manajemen role)
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM pemilik
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ────────────────────────────────────────────────
-- 3. UPDATE RLS MANAJEMEN ROLE
-- ────────────────────────────────────────────────
-- Kita perlu memastikan hanya superadmin yang bisa mengubah role orang lain
-- Drop policy lama "pemilik_admin_update"
DROP POLICY IF EXISTS "pemilik_admin_update" ON pemilik;

-- Buat policy baru: Admin bisa mengupdate profil tapi tidak rolenya (kecuali superadmin)
-- Karena Supabase RLS agak sulit membatasi update spesifik kolom di table yang sama, 
-- kita biarkan fungsi server action (superadmin.actions.ts) yang mengunci logika ini 
-- di sisi aplikasi, dan mengamankan RLS:
CREATE POLICY "pemilik_admin_update" ON pemilik
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- (Optional) Kita bisa membuat role admin di database menjadi superadmin secara manual:
-- UPDATE pemilik SET role = 'superadmin' WHERE nik = '1234567890123456';

SELECT 'Migration V3 Superadmin OK' as result;
