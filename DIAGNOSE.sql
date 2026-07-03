-- ============================================================
-- DIAGNOSTIK & FIX — Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Cek tabel apa saja yang sudah ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Cek apakah trigger handle_new_user sudah ada
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
   OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 3. Cek isi auth.users (user yang sudah terdaftar)
SELECT id, email, created_at, raw_user_meta_data->>'nik' as nik
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Cek isi tabel pemilik
SELECT id, nik, nama_lengkap, role, created_at
FROM pemilik
ORDER BY created_at DESC
LIMIT 10;
