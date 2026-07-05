'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { nikToEmail } from '@/lib/utils'
import { registerSchema, loginSchema, getFirstZodError } from '@/lib/validations/schemas'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ──────────────────────────────────────────────
// Helper: Direct fetch ke Supabase Auth API
// (lebih reliable daripada supabase-js di server actions)
// ──────────────────────────────────────────────
async function supabaseSignUp(email: string, password: string, metadata: Record<string, string>) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email, password, data: metadata }),
  })
  const json = await res.json()
  if (!res.ok) {
    return { data: null, error: { message: json.msg || json.error_description || json.message || JSON.stringify(json) } }
  }
  return { data: json, error: null }
}

async function supabaseCheckNikExists(nik: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pemilik?nik=eq.${nik}&select=nik&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
  const json = await res.json()
  return Array.isArray(json) && json.length > 0
}

// ──────────────────────────────────────────────
// LOGIN
// ──────────────────────────────────────────────
export async function login(formData: FormData) {
  const rawData = {
    nik: formData.get('nik') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  const email = nikToEmail(parsed.data.nik)
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  })

  if (error) {
    console.error('Login error:', JSON.stringify(error))
    return { error: 'NIK atau password salah. Silakan coba lagi.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ──────────────────────────────────────────────
// REGISTER
// ──────────────────────────────────────────────
export async function register(formData: FormData) {
  const rawData = {
    nik: formData.get('nik') as string,
    nama_lengkap: formData.get('nama_lengkap') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
    alamat_kec: formData.get('alamat_kec') as string,
    alamat_desa: formData.get('alamat_desa') as string,
    alamat_detail: formData.get('alamat_detail') as string,
  }

  const parsed = registerSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  // Check NIK via direct fetch
  const nikExists = await supabaseCheckNikExists(parsed.data.nik)
  if (nikExists) {
    return { error: 'NIK sudah terdaftar. Silakan gunakan NIK yang berbeda atau hubungi admin.' }
  }

  const email = nikToEmail(parsed.data.nik)

  // SignUp via direct fetch (lebih reliable)
  const { data, error } = await supabaseSignUp(email, parsed.data.password, {
    nik: parsed.data.nik,
    nama_lengkap: parsed.data.nama_lengkap,
    alamat_kec: parsed.data.alamat_kec,
    alamat_desa: parsed.data.alamat_desa,
    alamat_detail: parsed.data.alamat_detail,
    role: 'peternak',
  })

  if (error) {
    console.error('Register error:', JSON.stringify(error))
    return { error: `Gagal mendaftar: ${error.message}` }
  }

  console.log('SignUp berhasil, user id:', data?.id)

  // Setelah signUp, login dengan SSR client agar session tersimpan di cookies
  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  })

  if (loginError) {
    console.error('Auto-login error:', JSON.stringify(loginError))
    return { error: 'Akun berhasil dibuat! Silakan login dengan NIK dan password Anda.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ──────────────────────────────────────────────
// LOGOUT
// ──────────────────────────────────────────────
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ──────────────────────────────────────────────
// ADMIN: Register peternak manually
// ──────────────────────────────────────────────
export async function adminRegisterPeternak(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Tidak terautentikasi' }

  const { data: currentPemilik } = await supabase
    .from('pemilik').select('role').eq('id', user.id).single()

  if (!currentPemilik || (currentPemilik.role !== 'admin' && currentPemilik.role !== 'superadmin')) {
    return { error: 'Akses ditolak' }
  }

  const rawData = {
    nik: formData.get('nik') as string,
    nama_lengkap: formData.get('nama_lengkap') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
    alamat_kec: formData.get('alamat_kec') as string,
    alamat_desa: formData.get('alamat_desa') as string,
    alamat_detail: formData.get('alamat_detail') as string,
  }

  const parsed = registerSchema.safeParse(rawData)
  if (!parsed.success) {
    return { error: getFirstZodError(parsed.error) }
  }

  const nikExists = await supabaseCheckNikExists(parsed.data.nik)
  if (nikExists) return { error: 'NIK sudah terdaftar.' }

  const email = nikToEmail(parsed.data.nik)
  const { error } = await supabaseSignUp(email, parsed.data.password, {
    nik: parsed.data.nik,
    nama_lengkap: parsed.data.nama_lengkap,
    alamat_kec: parsed.data.alamat_kec,
    alamat_desa: parsed.data.alamat_desa,
    alamat_detail: parsed.data.alamat_detail,
    role: 'peternak',
  })

  if (error) {
    return { error: `Gagal mendaftarkan peternak: ${error.message}` }
  }

  revalidatePath('/admin/peternak')
  return { success: true }
}
