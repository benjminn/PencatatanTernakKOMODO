'use client'

import { useState, useTransition } from 'react'
import { changeUserRole } from '@/lib/actions/superadmin.actions'
import { Loader2, ShieldAlert, User, ShieldCheck } from 'lucide-react'

interface RoleManagerClientProps {
  userId: string
  currentRole: string
  userName: string
}

export default function RoleManagerClient({ userId, currentRole, userName }: RoleManagerClientProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRoleChange = (newRole: 'peternak' | 'admin') => {
    if (newRole === 'admin' && !confirm(`Angkat ${userName} menjadi Petugas Puskeswan (Admin)?`)) return
    if (newRole === 'peternak' && !confirm(`Turunkan ${userName} menjadi Peternak biasa?`)) return
    
    setError(null)
    startTransition(async () => {
      const result = await changeUserRole(userId, newRole)
      if (result?.error) {
        setError(result.error)
        alert(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2">
        {currentRole === 'superadmin' ? (
          <span className="badge badge-superadmin">
            <ShieldAlert size={12} /> Super Admin
          </span>
        ) : currentRole === 'admin' ? (
          <span className="badge badge-admin">
            <ShieldCheck size={12} /> Petugas Puskeswan
          </span>
        ) : (
          <span className="badge badge-hidup">
            <User size={12} /> Peternak
          </span>
        )}
      </div>

      {currentRole !== 'superadmin' && (
        <div className="flex items-center gap-2">
          {currentRole === 'peternak' ? (
            <button
              onClick={() => handleRoleChange('admin')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 size={12} className="animate-spin inline mr-1" /> : 'Jadikan Admin'}
            </button>
          ) : (
            <button
              onClick={() => handleRoleChange('peternak')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 size={12} className="animate-spin inline mr-1" /> : 'Turunkan ke Peternak'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
