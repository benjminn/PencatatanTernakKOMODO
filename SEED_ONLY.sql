-- ============================================================
-- SEED ONLY — Jalankan ini jika schema sudah ada tapi data kosong
-- ============================================================

-- Seed: Master Jenis Ternak (aman dijalankan berkali-kali)
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

-- Verifikasi berhasil:
SELECT id, nama_jenis, kategori FROM master_jenis_ternak ORDER BY id;
