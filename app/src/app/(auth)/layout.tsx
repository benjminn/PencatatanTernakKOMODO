import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Masuk ke sistem pencatatan ternak Desa Golo Mori & Warloka.',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--color-bg-base)' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-primary-600), transparent)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--color-secondary-500), transparent)' }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-primary-600) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-primary-600) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))',
              boxShadow: '0 8px 32px rgba(26, 94, 56, 0.4)',
            }}
          >
            <span className="text-3xl">🐄</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Pencatatan Ternak
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Desa Golo Mori & Warloka · Kec. Komodo
          </p>
        </div>

        {/* Form card */}
        <div
          className="rounded-2xl p-6 border"
          style={{
            background: 'var(--color-bg-surface)',
            borderColor: 'var(--color-bg-border)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--color-text-disabled)' }}>
          KKN UGM · Kecamatan Komodo, Manggarai Barat
        </p>
      </div>
    </div>
  )
}
