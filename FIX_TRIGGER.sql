-- ============================================================
-- FIX TRIGGER — Jalankan setelah diagnosa jika ada masalah
-- ============================================================

-- Pastikan tabel pemilik ada dengan struktur yang benar
CREATE TABLE IF NOT EXISTS pemilik (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nik             VARCHAR(16) UNIQUE NOT NULL,
  nama_lengkap    VARCHAR(255) NOT NULL,
  alamat_kec      VARCHAR(100),
  alamat_desa     VARCHAR(100),
  alamat_detail   TEXT,
  role            VARCHAR(20) NOT NULL DEFAULT 'peternak'
                    CHECK (role IN ('peternak', 'admin')),
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop trigger lama jika ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function lama
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Buat ulang function dengan error handling yang lebih baik
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Hanya insert jika ada metadata NIK
  IF NEW.raw_user_meta_data IS NOT NULL 
     AND NEW.raw_user_meta_data->>'nik' IS NOT NULL 
     AND NEW.raw_user_meta_data->>'nik' != '' THEN
    
    -- Insert dengan ON CONFLICT untuk handle duplikat
    INSERT INTO pemilik (id, nik, nama_lengkap, alamat_kec, alamat_desa, alamat_detail, role)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'nik',
      COALESCE(NEW.raw_user_meta_data->>'nama_lengkap', 'Unknown'),
      COALESCE(NEW.raw_user_meta_data->>'alamat_kec', ''),
      COALESCE(NEW.raw_user_meta_data->>'alamat_desa', ''),
      COALESCE(NEW.raw_user_meta_data->>'alamat_detail', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'peternak')
    )
    ON CONFLICT (nik) DO NOTHING;  -- Jika NIK sudah ada, skip (jangan error)
    
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error tapi jangan gagalkan signup
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Pasang ulang trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Bersihkan user test yang dibuat oleh test script (jika ada)
-- Hapus dari auth.users dulu (akan cascade ke pemilik)
DELETE FROM auth.users WHERE email = 'test123@test.com';

-- Verifikasi:
SELECT 'Trigger OK' as status, count(*) as pemilik_count FROM pemilik;
