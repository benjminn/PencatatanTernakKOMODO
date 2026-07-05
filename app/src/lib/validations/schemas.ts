import { z } from 'zod'

// ──────────────────────────────────────────────
// Helper: ambil pesan error pertama dari Zod v4
// ──────────────────────────────────────────────
export function getFirstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Data tidak valid. Periksa kembali form.'
}

// ──────────────────────────────────────────────
// Auth Schemas
// ──────────────────────────────────────────────

export const loginSchema = z.object({
  nik: z
    .string()
    .length(16, 'NIK harus tepat 16 digit')
    .regex(/^\d+$/, 'NIK hanya boleh berisi angka'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const registerSchema = z
  .object({
    nik: z
      .string()
      .length(16, 'NIK harus tepat 16 digit')
      .regex(/^\d+$/, 'NIK hanya boleh berisi angka'),
    nama_lengkap: z.string().min(2, 'Nama minimal 2 karakter').max(255),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirm_password: z.string(),
    alamat_kec: z.string().min(1, 'Pilih kecamatan'),
    alamat_desa: z.string().min(1, 'Pilih desa'),
    alamat_detail: z.string().min(5, 'Isi detail alamat (RT/RW/Kampung)'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password tidak cocok',
    path: ['confirm_password'],
  })

// ──────────────────────────────────────────────
// Ternak Schemas
// ──────────────────────────────────────────────

export const ternakSchema = z.object({
  jenis_penanda: z.string().min(1, 'Pilih jenis penanda'),
  identitas_penanda: z.string().max(100, 'Identitas penanda maksimal 100 karakter').optional().nullable(),
  id_jenis: z.coerce.number({ error: 'Pilih jenis hewan' }).int().positive('Pilih jenis hewan'),
  fase: z.enum(['Indukan', 'Pejantan', 'Anakan']).optional().nullable(),
  jenis_kelamin: z.string().optional().nullable(),
  umur_tahun: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      return parseInt(String(val)) || 0
    },
    z.number().min(0).max(30)
  ),
  umur_bulan: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      return parseInt(String(val)) || 0
    },
    z.number().min(0).max(11)
  ),
  berat_badan: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      const num = parseFloat(String(val))
      return isNaN(num) ? null : num
    },
    z.number().positive('Berat badan harus lebih dari 0').nullable().optional()
  ),
  status: z.enum(['hidup', 'mati', 'dijual']).default('hidup'),
})

export const updateTernakSchema = z.object({
  jenis_penanda: z.string().min(1, 'Pilih jenis penanda'),
  identitas_penanda: z.string().max(100, 'Identitas penanda maksimal 100 karakter').optional().nullable(),
  fase: z.enum(['Indukan', 'Pejantan', 'Anakan']).optional().nullable(),
  jenis_kelamin: z.string().optional().nullable(),
  umur_tahun: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      return parseInt(String(val)) || 0
    },
    z.number().min(0).max(30)
  ),
  umur_bulan: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return 0
      return parseInt(String(val)) || 0
    },
    z.number().min(0).max(11)
  ),
  berat_badan: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      const num = parseFloat(String(val))
      return isNaN(num) ? null : num
    },
    z.number().positive('Berat badan harus lebih dari 0').nullable().optional()
  ),
  status: z.enum(['hidup', 'mati', 'dijual']),
})

// ──────────────────────────────────────────────
// Profile Schema
// ──────────────────────────────────────────────

export const profileSchema = z.object({
  nama_lengkap: z.string().min(2, 'Nama minimal 2 karakter').max(255),
  alamat_kec: z.string().min(1, 'Pilih kecamatan'),
  alamat_desa: z.string().min(1, 'Pilih desa'),
  alamat_detail: z.string().min(5, 'Isi detail alamat (RT/RW/Kampung)'),
})

// ──────────────────────────────────────────────
// Master Data Schemas
// ──────────────────────────────────────────────

export const jenisTernakSchema = z.object({
  nama_jenis: z.string().min(1, 'Nama jenis wajib diisi').max(100),
  opsi_kelamin: z.array(z.string()).min(1, 'Pilih minimal 1 opsi kelamin'),
  kategori: z.enum(['Mamalia']),
})

// ──────────────────────────────────────────────
// Helper: gabung umur tahun + bulan jadi string
// ──────────────────────────────────────────────
export function formatUmur(tahun: number, bulan: number): string | null {
  if (tahun === 0 && bulan === 0) return null
  const parts: string[] = []
  if (tahun > 0) parts.push(`${tahun} tahun`)
  if (bulan > 0) parts.push(`${bulan} bulan`)
  return parts.join(' ')
}

export function parseUmur(umur: string | null): { tahun: number; bulan: number } {
  if (!umur) return { tahun: 0, bulan: 0 }
  const tahunMatch = umur.match(/(\d+)\s*tahun/)
  const bulanMatch = umur.match(/(\d+)\s*bulan/)
  return {
    tahun: tahunMatch ? parseInt(tahunMatch[1]) : 0,
    bulan: bulanMatch ? parseInt(bulanMatch[1]) : 0,
  }
}

export function parseTanggalLahirToUmur(tanggal_lahir: string | null): { tahun: number; bulan: number } {
  if (!tanggal_lahir) return { tahun: 0, bulan: 0 }
  
  const birthDate = new Date(tanggal_lahir)
  const today = new Date()
  
  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()
  
  if (months < 0) {
    years--
    months += 12
  }
  
  return {
    tahun: Math.max(0, years),
    bulan: Math.max(0, months)
  }
}

// ──────────────────────────────────────────────
// Type Exports
// ──────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TernakInput = z.infer<typeof ternakSchema>
export type UpdateTernakInput = z.infer<typeof updateTernakSchema>
export type JenisTernakInput = z.infer<typeof jenisTernakSchema>
export type ProfileInput = z.infer<typeof profileSchema>
