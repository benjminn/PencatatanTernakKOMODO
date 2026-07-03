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
  no_eartag: z
    .string()
    .min(1, 'No. Eartag wajib diisi')
    .max(50, 'No. Eartag maksimal 50 karakter')
    .regex(/^[a-zA-Z0-9\-_]+$/, 'No. Eartag hanya boleh huruf, angka, strip, dan underscore'),
  id_jenis: z.coerce.number({ error: 'Pilih jenis hewan' }).int().positive('Pilih jenis hewan'),
  jenis_kelamin: z.string().min(1, 'Pilih jenis kelamin'),
  umur: z.string().optional(),
  // berat_badan: string dari form → number atau null
  berat_badan: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      const num = parseFloat(String(val))
      return isNaN(num) ? null : num
    },
    z.number().positive('Berat badan harus lebih dari 0').nullable().optional()
  ),
  status_hidup: z.boolean().default(true),
})

export const updateTernakSchema = z.object({
  umur: z.string().optional(),
  berat_badan: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null
      const num = parseFloat(String(val))
      return isNaN(num) ? null : num
    },
    z.number().positive('Berat badan harus lebih dari 0').nullable().optional()
  ),
  status_hidup: z.boolean(),
})

// ──────────────────────────────────────────────
// Master Data Schemas
// ──────────────────────────────────────────────

export const jenisTernakSchema = z.object({
  nama_jenis: z.string().min(1, 'Nama jenis wajib diisi').max(100),
  opsi_kelamin: z.array(z.string()).min(1, 'Pilih minimal 1 opsi kelamin'),
  kategori: z.enum(['Mamalia', 'Unggas']),
})

// ──────────────────────────────────────────────
// Type Exports
// ──────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TernakInput = z.infer<typeof ternakSchema>
export type UpdateTernakInput = z.infer<typeof updateTernakSchema>
export type JenisTernakInput = z.infer<typeof jenisTernakSchema>
