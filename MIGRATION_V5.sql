-- ==========================================
-- MIGRATION V5: Fase Ternak & Gender Opsional
-- ==========================================

-- 1. Buat jenis kelamin menjadi opsional
ALTER TABLE public.ternak ALTER COLUMN jenis_kelamin DROP NOT NULL;

-- 2. Tambahkan kolom fase
ALTER TABLE public.ternak ADD COLUMN fase VARCHAR(20) CHECK (fase IN ('Indukan', 'Pejantan', 'Anakan'));

-- 3. Hapus dan buat ulang view v_ternak_lengkap agar kolom baru terbaca
DROP VIEW IF EXISTS public.v_ternak_lengkap;
DROP VIEW IF EXISTS public.v_statistik_desa;

CREATE OR REPLACE VIEW public.v_ternak_lengkap AS
SELECT 
    t.id,
    t.jenis_penanda,
    t.identitas_penanda,
    t.fase,
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
