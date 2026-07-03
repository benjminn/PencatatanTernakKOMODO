import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Pencatatan Ternak — Golo Mori & Warloka',
    template: '%s | Pencatatan Ternak',
  },
  description:
    'Platform digital pencatatan dan pemantauan populasi hewan ternak warga Desa Golo Mori dan Warloka, Kecamatan Komodo, Manggarai Barat.',
  keywords: ['pencatatan ternak', 'golo mori', 'warloka', 'komodo', 'manggarai barat', 'puskeswan'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
