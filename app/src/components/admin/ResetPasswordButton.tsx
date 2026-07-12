'use client'

import { useState, useTransition } from 'react'
import { resetUserPassword } from '@/lib/actions/profile.actions'
import { KeyRound, Loader2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface ResetPasswordButtonProps {
  userId: string
  userName: string
}

export default function ResetPasswordButton({ userId, userName }: ResetPasswordButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetUserPassword(userId)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Password ${userName} berhasil direset ke "123456"`)
        setShowConfirm(false)
      }
    })
  }

  if (showConfirm) {
    return (
      <div className="rounded-xl p-4 border border-amber-200 bg-amber-50 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            Reset password <span className="font-bold">{userName}</span> ke <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">123456</code>?
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowConfirm(false)}
            className="btn btn-ghost btn-sm"
            disabled={isPending}
          >
            Batal
          </button>
          <button
            onClick={handleReset}
            className="btn btn-sm px-4"
            style={{ background: '#f59e0b', color: 'white', border: 'none' }}
            disabled={isPending}
          >
            {isPending ? (
              <><Loader2 size={14} className="animate-spin" /> Mereset...</>
            ) : (
              'Ya, Reset'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn btn-ghost border border-amber-200 text-amber-700 hover:bg-amber-50"
    >
      <KeyRound size={16} />
      Reset Password
    </button>
  )
}
