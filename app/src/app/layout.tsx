import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Pencatatan Ternak — Golo Mori & Warloka',
    template: '%s | Pencatatan Ternak',
  },
  description:
    'Platform digital pencatatan dan pemantauan populasi hewan ternak warga Desa Golo Mori dan Warloka, Kecamatan Komodo, Manggarai Barat.',
  keywords: ['pencatatan ternak', 'golo mori', 'warloka', 'komodo', 'manggarai barat', 'puskeswan'],
  icons: {
    icon: '/logo/6311a9ed51648_300x300.webp',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
