-- ============================================================
-- FIX: Insert baris pemilik untuk user yang sudah register
-- tapi belum punya baris di tabel pemilik
-- ============================================================

-- Lihat user mana yang tidak punya baris pemilik
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'nik' as nik,
  u.raw_user_meta_data->>'nama_lengkap' as nama_lengkap,
  u.raw_user_meta_data->>'alamat_kec' as alamat_kec,
  u.raw_user_meta_data->>'alamat_desa' as alamat_desa,
  u.raw_user_meta_data->>'alamat_detail' as alamat_detail,
  u.raw_user_meta_data->>'role' as role
FROM auth.users u
LEFT JOIN pemilik p ON u.id = p.id
WHERE p.id IS NULL
  AND u.raw_user_meta_data->>'nik' IS NOT NULL;

-- Insert baris pemilik untuk semua user yang belum punya
INSERT INTO pemilik (id, nik, nama_lengkap, alamat_kec, alamat_desa, alamat_detail, role)
SELECT 
  u.id,
  u.raw_user_meta_data->>'nik',
  COALESCE(u.raw_user_meta_data->>'nama_lengkap', 'Unknown'),
  COALESCE(u.raw_user_meta_data->>'alamat_kec', ''),
  COALESCE(u.raw_user_meta_data->>'alamat_desa', ''),
  COALESCE(u.raw_user_meta_data->>'alamat_detail', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'peternak')
FROM auth.users u
LEFT JOIN pemilik p ON u.id = p.id
WHERE p.id IS NULL
  AND u.raw_user_meta_data->>'nik' IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Verifikasi
SELECT id, nik, nama_lengkap, role FROM pemilik ORDER BY created_at DESC LIMIT 10;
