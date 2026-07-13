'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { login } from '@/lib/actions/auth.actions'
import { Eye, EyeOff, LogIn, Loader2, MessageCircle, X, PhoneCall } from 'lucide-react'

function LupaPasswordModal({ onClose }: { onClose: () => void }) {
  const waNumber = '08xxxxxxxxxx'
  const waMessage = encodeURIComponent('Halo, saya lupa password akun Pencatatan Ternak dan membutuhkan bantuan reset password.')
  const waUrl = `https://wa.me/${waNumber.replace(/^0/, '62')}?text=${waMessage}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <PhoneCall size={28} className="text-amber-500" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Lupa Password?</h3>
        <p className="text-sm text-gray-500 text-center mb-5">
          Reset password hanya bisa dilakukan oleh Admin. Silakan hubungi admin melalui WhatsApp di bawah ini untuk meminta reset password Anda.
        </p>

        {/* WA Number Box */}
        <div className="flex items-center gap-3 p-3 rounded-xl border border-green-100 bg-green-50 mb-5">
          <div className="w-9 h-9 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">Nomor WhatsApp Admin</p>
            <p className="text-base font-bold text-gray-900">{waNumber}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full justify-center"
            style={{ background: '#22c55e', borderColor: '#22c55e' }}
          >
            <MessageCircle size={17} />
            Chat WhatsApp Admin
          </a>
          <button onClick={onClose} className="btn btn-ghost w-full">
            Kembali ke Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [showLupaModal, setShowLupaModal] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <>
      {showLupaModal && <LupaPasswordModal onClose={() => setShowLupaModal(false)} />}

      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Selamat Datang
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Masuk menggunakan NIK dan password Anda
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
          <div>
            <label htmlFor="nik" className="form-label">
              NIK (16 digit)
            </label>
            <input
              id="nik"
              name="nik"
              type="text"
              inputMode="numeric"
              maxLength={16}
              placeholder="Masukkan 16 digit NIK"
              className="form-input"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="form-label" style={{ margin: 0 }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowLupaModal(true)}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--color-primary-400)' }}
              >
                Lupa password?
              </button>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password"
                className="form-input pr-10"
                required
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

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Memverifikasi...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Masuk
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-primary-400)' }}
            >
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
