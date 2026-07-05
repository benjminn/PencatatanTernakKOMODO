-- ==========================================
-- MIGRATION V4: Dinamisasi Umur Ternak
-- ==========================================

-- 1. Buat fungsi untuk mengkonversi tanggal lahir menjadi string umur
CREATE OR REPLACE FUNCTION hitung_umur_string(tgl_lahir DATE) 
RETURNS VARCHAR AS $$
DECLARE
  years INT;
  months INT;
BEGIN
  IF tgl_lahir IS NULL THEN RETURN NULL; END IF;
  years := EXTRACT(YEAR FROM age(CURRENT_DATE, tgl_lahir));
  months := EXTRACT(MONTH FROM age(CURRENT_DATE, tgl_lahir));
  
  IF years > 0 AND months > 0 THEN
    RETURN years || ' tahun ' || months || ' bulan';
  ELSIF years > 0 THEN
    RETURN years || ' tahun 0 bulan';
  ELSIF months > 0 THEN
    RETURN '0 tahun ' || months || ' bulan';
  ELSE
    RETURN '0 tahun 0 bulan';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Tambahkan kolom tanggal_lahir ke tabel ternak
ALTER TABLE public.ternak ADD COLUMN tanggal_lahir DATE;

-- 3. Update data yang sudah ada (mengubah string 'X tahun Y bulan' menjadi tanggal lahir)
-- Asumsi format lama: 'X tahun Y bulan'
-- Perhatian: Jika ada data kotor, update ini mungkin gagal. Jika ini database baru, tidak masalah.
DO $$ 
DECLARE
    r RECORD;
    t_tahun INT;
    t_bulan INT;
    str_val VARCHAR;
BEGIN
    FOR r IN SELECT id, umur FROM public.ternak WHERE umur IS NOT NULL LOOP
        str_val := r.umur;
        
        -- Ekstrak tahun (contoh: "2 tahun 3 bulan" -> 2)
        IF str_val LIKE '%tahun%' THEN
            t_tahun := (substring(str_val from '([0-9]+) tahun'))::INT;
        ELSE
            t_tahun := 0;
        END IF;

        -- Ekstrak bulan
        IF str_val LIKE '%bulan%' THEN
            t_bulan := (substring(str_val from '([0-9]+) bulan'))::INT;
        ELSE
            t_bulan := 0;
        END IF;

        -- Handle NULLs fallback
        IF t_tahun IS NULL THEN t_tahun := 0; END IF;
        IF t_bulan IS NULL THEN t_bulan := 0; END IF;

        -- Update ke tanggal_lahir
        UPDATE public.ternak 
        SET tanggal_lahir = CURRENT_DATE - (t_tahun || ' years')::INTERVAL - (t_bulan || ' months')::INTERVAL
        WHERE id = r.id;
    END LOOP;
END $$;

-- 4. Hapus view lama agar bisa dihapus kolom umur-nya
DROP VIEW IF EXISTS public.v_ternak_lengkap;
DROP VIEW IF EXISTS public.v_statistik_desa;

-- 5. Hapus kolom umur yang lama
ALTER TABLE public.ternak DROP COLUMN umur;

-- 6. Buat kembali view v_ternak_lengkap dengan umur yang dihitung otomatis
CREATE OR REPLACE VIEW public.v_ternak_lengkap AS
SELECT 
    t.id,
    t.jenis_penanda,
    t.identitas_penanda,
    t.jenis_kelamin,
    t.tanggal_lahir,
    hitung_umur_string(t.tanggal_lahir) AS umur,
    t.berat_badan,
    t.status,
    t.updated_at,
    t.created_at,
    m.nama_jenis,
    m.kategori,
    p.id AS id_pemilik,
    p.nik,
    p.nama_lengkap,
    p.alamat_desa,
    p.alamat_kec,
    p.alamat_detail
FROM public.ternak t
JOIN public.pemilik p ON t.id_pemilik = p.id
JOIN public.master_jenis_ternak m ON t.id_jenis = m.id;

-- 7. Buat kembali view v_statistik_desa (karena tadi ikut terhapus)
CREATE OR REPLACE VIEW public.v_statistik_desa AS
SELECT 
    p.alamat_desa,
    m.nama_jenis,
    m.kategori,
    COUNT(CASE WHEN t.status = 'hidup' THEN 1 END) AS jumlah_hidup,
    COUNT(CASE WHEN t.status = 'mati' THEN 1 END) AS jumlah_mati,
    COUNT(CASE WHEN t.status = 'dijual' THEN 1 END) AS jumlah_dijual,
    COUNT(CASE WHEN t.jenis_kelamin = 'Jantan' AND t.status = 'hidup' THEN 1 END) AS jumlah_jantan,
    COUNT(CASE WHEN t.jenis_kelamin = 'Betina' AND t.status = 'hidup' THEN 1 END) AS jumlah_betina,
    COUNT(CASE WHEN t.jenis_kelamin = 'Campuran' AND t.status = 'hidup' THEN 1 END) AS jumlah_campuran,
    COUNT(*) AS total
FROM public.ternak t
JOIN public.pemilik p ON t.id_pemilik = p.id
JOIN public.master_jenis_ternak m ON t.id_jenis = m.id
GROUP BY p.alamat_desa, m.nama_jenis, m.kategori;
