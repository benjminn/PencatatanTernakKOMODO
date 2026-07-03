'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { register } from '@/lib/actions/auth.actions'
import { KECAMATAN_LIST, getDesaByKecamatan } from '@/lib/wilayah'
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [kecamatan, setKecamatan] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const desaList = getDesaByKecamatan(kecamatan)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await register(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Daftar Akun Baru
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Isi data diri Anda untuk mendaftar sebagai peternak
        </p>
      </div>

      {error && (
        <div
          className="mb-4 px-4 py-3 rounded-lg text-sm"
          style={{
            background: 'rgba(248, 113, 113, 0.1)',
            border: '1px solid rgba(248, 113, 113, 0.25)',
            color: 'var(--color-mati)',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* NIK */}
        <div>
          <label htmlFor="nik" className="form-label">
            NIK <span style={{ color: 'var(--color-mati)' }}>*</span>
          </label>
          <input
            id="nik"
            name="nik"
            type="text"
            inputMode="numeric"
            maxLength={16}
            placeholder="16 digit Nomor Induk Kependudukan"
            className="form-input"
            required
            disabled={isPending}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-disabled)' }}>
            Sesuai KTP — tepat 16 angka
          </p>
        </div>

        {/* Nama */}
        <div>
          <label htmlFor="nama_lengkap" className="form-label">
            Nama Lengkap <span style={{ color: 'var(--color-mati)' }}>*</span>
          </label>
          <input
            id="nama_lengkap"
            name="nama_lengkap"
            type="text"
            placeholder="Nama sesuai KTP"
            className="form-input"
            required
            disabled={isPending}
          />
        </div>

        {/* Kecamatan */}
        <div>
          <label htmlFor="alamat_kec" className="form-label">
            Kecamatan <span style={{ color: 'var(--color-mati)' }}>*</span>
          </label>
          <select
            id="alamat_kec"
            name="alamat_kec"
            className="form-input"
            required
            disabled={isPending}
            value={kecamatan}
            onChange={(e) => setKecamatan(e.target.value)}
          >
            <option value="">Pilih kecamatan...</option>
            {KECAMATAN_LIST.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>
        </div>

        {/* Desa */}
        <div>
          <label htmlFor="alamat_desa" className="form-label">
            Desa <span style={{ color: 'var(--color-mati)' }}>*</span>
          </label>
          <select
            id="alamat_desa"
            name="alamat_desa"
            className="form-input"
            required
            disabled={!kecamatan || isPending}
          >
            <option value="">
              {kecamatan ? 'Pilih desa...' : 'Pilih kecamatan dulu'}
            </option>
            {desaList.map((desa) => (
              <option key={desa} value={desa}>
                {desa}
              </option>
            ))}
          </select>
        </div>

        {/* Detail Alamat */}
        <div>
          <label htmlFor="alamat_detail" className="form-label">
            Detail Alamat <span style={{ color: 'var(--color-mati)' }}>*</span>
          </label>
          <input
            id="alamat_detail"
            name="alamat_detail"
            type="text"
            placeholder="RT/RW, Kampung, dll."
            className="form-input"
            required
            disabled={isPending}
          />
        </div>

        <hr className="divider" />

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="form-label">
            Password <span style={{ color: 'var(--color-mati)' }}>*</span>
          </label>
          <div className="relative">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimal 6 karakter"
              className="form-input pr-10"
              required
              minLength={6}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirm_password" className="form-label">
            Konfirmasi Password <span style={{ color: 'var(--color-mati)' }}>*</span>
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Ulangi password"
              className="form-input pr-10"
              required
              minLength={6}
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Mendaftarkan...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Buat Akun
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: 'var(--color-primary-400)' }}
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
