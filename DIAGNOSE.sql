-- ============================================================
-- DIAGNOSE & FIX — Jalankan per bagian di Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────
-- LANGKAH 1: Cek user di auth.users vs pemilik
-- Jika ada user di auth.users tapi TIDAK ada di pemilik,
-- berarti trigger tidak jalan / gagal.
-- ────────────────────────────────────────────────
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data->>'nik' as nik_metadata,
  p.nik as nik_pemilik,
  p.nama_lengkap,
  p.role,
  CASE WHEN p.id IS NULL THEN '❌ TIDAK ADA DI PEMILIK' ELSE '✅ OK' END as status
FROM auth.users u
LEFT JOIN public.pemilik p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 20;

-- ────────────────────────────────────────────────
-- LANGKAH 2: Cek trigger ada atau tidak
-- ────────────────────────────────────────────────
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_schema,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
   OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- ────────────────────────────────────────────────
-- LANGKAH 3: Cek fungsi handle_new_user ada
-- ────────────────────────────────────────────────
SELECT 
  routine_name, 
  routine_schema,
  security_type
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- ────────────────────────────────────────────────
-- LANGKAH 4 (FIX): Jika ada user di auth.users tapi tidak di pemilik,
-- masukkan secara manual dari metadata mereka.
-- HANYA jalankan jika Langkah 1 menunjukkan "❌ TIDAK ADA DI PEMILIK"
-- ────────────────────────────────────────────────
INSERT INTO public.pemilik (id, nik, nama_lengkap, alamat_kec, alamat_desa, alamat_detail, role)
SELECT 
  u.id,
  u.raw_user_meta_data->>'nik',
  u.raw_user_meta_data->>'nama_lengkap',
  u.raw_user_meta_data->>'alamat_kec',
  u.raw_user_meta_data->>'alamat_desa',
  u.raw_user_meta_data->>'alamat_detail',
  COALESCE(u.raw_user_meta_data->>'role', 'peternak')
FROM auth.users u
LEFT JOIN public.pemilik p ON u.id = p.id
WHERE p.id IS NULL                               -- Hanya yang belum ada di pemilik
  AND u.raw_user_meta_data->>'nik' IS NOT NULL   -- Hanya yang punya metadata NIK
ON CONFLICT (id) DO NOTHING;

-- Cek hasilnya setelah Fix
SELECT id, nik, nama_lengkap, role FROM pemilik ORDER BY created_at DESC LIMIT 10;

-- ────────────────────────────────────────────────
-- LANGKAH 5: Perbaiki / Recreate Trigger jika tidak ada
-- Jalankan bagian ini jika Langkah 2 tidak menemukan trigger.
-- ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'nik' IS NOT NULL THEN
    INSERT INTO public.pemilik (id, nik, nama_lengkap, alamat_kec, alamat_desa, alamat_detail, role)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nik',
      NEW.raw_user_meta_data->>'nama_lengkap',
      NEW.raw_user_meta_data->>'alamat_kec',
      NEW.raw_user_meta_data->>'alamat_desa',
      NEW.raw_user_meta_data->>'alamat_detail',
      COALESCE(NEW.raw_user_meta_data->>'role', 'peternak')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

SELECT 'Trigger berhasil dipasang ulang!' as result;
