import type { Metadata } from 'next'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Masuk — Pencatatan Ternak',
  description: 'Masuk ke sistem pencatatan ternak Desa Golo Mori & Warloka, Kecamatan Komodo.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#fafbfc' }}>
      {/* Subtle gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.08] blur-3xl"
          style={{ background: '#22c55e' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.05] blur-3xl"
          style={{ background: '#eab308' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 relative mb-3">
            <Image
              src="/logo/6311a9ed51648_300x300.webp"
              alt="Logo Dinas Peternakan"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Pencatatan Ternak
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Desa Golo Mori & Warloka · Kec. Komodo
          </p>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          KKN PPM UGM Menyapa Komodo · Kec. Komodo, Manggarai Barat
        </p>
      </div>
    </div>
  )
}
