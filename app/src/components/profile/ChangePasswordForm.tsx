'use client'

import { useState, useTransition } from 'react'
import { changePassword } from '@/lib/actions/profile.actions'
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await changePassword(formData)
      if (result?.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        setSuccess(true)
        toast.success('Password berhasil diubah!')
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#dc2626' }}
        >
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-lg text-sm flex items-center gap-2 bg-green-50 border border-green-200 text-green-700">
          <CheckCircle size={16} />
          Password berhasil diubah!
        </div>
      )}

      {/* Password Lama */}
      <div>
        <label className="form-label">Password Lama</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="current_password"
            type={showCurrent ? 'text' : 'password'}
            placeholder="Masukkan password lama"
            className="form-input pl-9 pr-10"
            required
            disabled={isPending}
          />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Password Baru */}
      <div>
        <label className="form-label">Password Baru</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="new_password"
            type={showNew ? 'text' : 'password'}
            placeholder="Minimal 6 karakter"
            className="form-input pl-9 pr-10"
            required
            disabled={isPending}
          />
          <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {/* Konfirmasi Password */}
      <div>
        <label className="form-label">Konfirmasi Password Baru</label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Ulangi password baru"
            className="form-input pl-9 pr-10"
            required
            disabled={isPending}
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={isPending}>
        {isPending ? (
          <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
        ) : (
          <><Lock size={16} /> Ubah Password</>
        )}
      </button>
    </form>
  )
}
