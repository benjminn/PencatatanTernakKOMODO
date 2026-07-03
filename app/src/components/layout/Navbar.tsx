'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, List, PlusCircle, Users, Tag, LogOut, Settings } from 'lucide-react'
import { logout } from '@/lib/actions/auth.actions'
import type { Pemilik } from '@/types/database.types'

interface NavbarProps {
  pemilik: Pemilik
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ternak': 'Daftar Ternak',
  '/ternak/tambah': 'Tambah Ternak',
  '/admin/peternak': 'Data Peternak',
  '/admin/jenis-ternak': 'Master Jenis Ternak',
}

export default function Navbar({ pemilik }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const pageTitle = Object.entries(PAGE_TITLES).find(([key]) =>
    pathname === key || (key !== '/dashboard' && pathname.startsWith(key))
  )?.[1] ?? 'Menu'

  const isAdmin = pemilik.role === 'admin'
  const mobileNavItems = isAdmin
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/ternak', label: 'Semua Ternak', icon: List },
        { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
        { href: '/admin/peternak', label: 'Data Peternak', icon: Users },
        { href: '/admin/jenis-ternak', label: 'Jenis Ternak', icon: Tag },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/ternak', label: 'Ternak Saya', icon: List },
        { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
      ]

  return (
    <>
      <header
        className="h-14 flex items-center justify-between px-4 md:px-6 border-b shrink-0"
        style={{
          background: 'var(--color-bg-surface)',
          borderColor: 'var(--color-bg-border)',
        }}
      >
        {/* Mobile: Logo + Menu button */}
        <div className="flex items-center gap-3 md:hidden">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{ background: 'var(--color-primary-600)' }}
          >
            🐄
          </div>
          <span className="font-bold text-sm" style={{ color: 'var(--color-text-primary)' }}>
            Pencatatan Ternak
          </span>
        </div>

        {/* Desktop: Page title */}
        <h2 className="hidden md:block font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
          {pageTitle}
        </h2>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* User info (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {isAdmin && (
              <span className="badge badge-admin text-xs">
                <Settings size={9} /> Admin
              </span>
            )}
            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {pemilik.nama_lengkap}
            </span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--color-primary-600)', color: 'white' }}
            >
              {pemilik.nama_lengkap.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden btn btn-ghost btn-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <nav
            className="absolute top-0 left-0 bottom-0 w-72 flex flex-col"
            style={{ background: 'var(--color-bg-surface)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: 'var(--color-bg-border)' }}
            >
              <div>
                <p className="font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {pemilik.nama_lengkap}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  NIK: {pemilik.nik}
                </p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="btn btn-ghost btn-sm">
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
              {mobileNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Logout */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--color-bg-border)' }}>
              <form action={logout}>
                <button
                  type="submit"
                  className="sidebar-link w-full text-left"
                  style={{ color: 'var(--color-mati)' }}
                >
                  <LogOut size={16} />
                  Keluar
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
