'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { login } from '@/lib/actions/auth.actions'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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
          <label htmlFor="password" className="form-label">
            Password
          </label>
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
  )
}
