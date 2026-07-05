'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, LayoutDashboard, List, PlusCircle, Users, Tag,
  LogOut, ShieldCheck, UserCircle, ShieldAlert, ChevronRight,
  BarChart3, MapPin, CreditCard
} from 'lucide-react'
import { logout } from '@/lib/actions/auth.actions'
import type { Pemilik } from '@/types/database.types'

interface NavbarProps {
  pemilik: Pemilik
}

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Beranda',
  '/ternak': 'Daftar Ternak',
  '/ternak/tambah': 'Tambah Ternak',
  '/admin/dashboard': 'Dashboard',
  '/admin/peternak': 'Data Peternak',
  '/admin/jenis-ternak': 'Jenis Ternak',
  '/admin/ternak': 'Kelola Ternak',
  '/profil': 'Profil Saya',
  '/admin/kelola-admin': 'Kelola Admin',
  '/admin/statistik': 'Statistik',
  '/admin/lokasi': 'Kelola Lokasi',
}

const NAV_CONFIGS = {
  peternak: [
    {
      group: 'Menu Utama',
      items: [
        { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
        { href: '/ternak', label: 'Ternak Saya', icon: List },
        { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
        { href: '/kartu-ternak', label: 'Kartu Ternak', icon: CreditCard },
      ]
    }
  ],
  admin: [
    {
      group: 'Panel Admin',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/peternak', label: 'Data Peternak', icon: Users },
        { href: '/admin/ternak', label: 'Kelola Ternak', icon: List },
        { href: '/admin/jenis-ternak', label: 'Jenis Ternak', icon: Tag },
        { href: '/admin/lokasi', label: 'Kelola Lokasi', icon: MapPin },
        { href: '/admin/statistik', label: 'Statistik', icon: BarChart3 },
      ]
    },
    {
      group: 'Menu Peternak',
      items: [
        { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
        { href: '/ternak', label: 'Ternak Saya', icon: List },
        { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
        { href: '/kartu-ternak', label: 'Cetak Kartu', icon: CreditCard },
      ]
    }
  ],
  superadmin: [
    {
      group: 'Panel Super Admin',
      items: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/peternak', label: 'Data Peternak', icon: Users },
        { href: '/admin/ternak', label: 'Kelola Ternak', icon: List },
        { href: '/admin/jenis-ternak', label: 'Jenis Ternak', icon: Tag },
        { href: '/admin/lokasi', label: 'Kelola Lokasi', icon: MapPin },
        { href: '/admin/statistik', label: 'Statistik', icon: BarChart3 },
        { href: '/admin/kelola-admin', label: 'Kelola Admin', icon: ShieldAlert },
      ]
    },
    {
      group: 'Menu Peternak',
      items: [
        { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
        { href: '/ternak', label: 'Ternak Saya', icon: List },
        { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
        { href: '/kartu-ternak', label: 'Cetak Kartu', icon: CreditCard },
      ]
    }
  ],
}

const ROLE_LABEL: Record<string, string> = {
  peternak: 'Peternak',
  admin: 'Petugas Puskeswan',
  superadmin: 'Super Admin',
}

export default function Navbar({ pemilik }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const pageTitle =
    Object.entries(PAGE_TITLES).find(
      ([key]) => pathname === key || (key !== '/dashboard' && key !== '/admin/dashboard' && pathname.startsWith(key))
    )?.[1] ?? ''

  const isAdminRole = pemilik.role === 'admin' || pemilik.role === 'superadmin'
  const navGroups = NAV_CONFIGS[pemilik.role as keyof typeof NAV_CONFIGS] || NAV_CONFIGS.peternak

  return (
    <>
      <header
        className="md:hidden h-14 flex items-center justify-between px-4 shrink-0"
        style={{ background: 'white', borderBottom: '1px solid #e2e8f0' }}
      >
        {/* Mobile brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 relative shrink-0">
            <Image src="/logo/6311a9ed51648_300x300.webp" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-sm text-gray-900">Pencatatan Ternak</span>
        </div>

        {/* Right side: Mobile toggle */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Buka menu"
        >
          {open ? <X size={20} className="text-gray-600" /> : <Menu size={20} className="text-gray-600" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <nav
            className="absolute top-0 right-0 bottom-0 w-72 flex flex-col bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f5f9' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: '#166534', color: 'white' }}
                >
                  {pemilik.nama_lengkap.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">
                    {pemilik.nama_lengkap}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ROLE_LABEL[pemilik.role] || pemilik.role}
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
              {navGroups.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
                    {group.group}
                  </p>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-link ${active ? 'active' : ''}`}
                        onClick={() => setOpen(false)}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              ))}
              
              <div className="space-y-1 pt-1 border-t border-gray-100">
                <p className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5 mt-4">
                  Akun
                </p>
                <Link
                  href="/profil"
                  className={`sidebar-link ${pathname === '/profil' ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <UserCircle size={18} />
                  Profil Saya
                </Link>
              </div>
            </div>

            {/* Logout */}
            <div className="p-3" style={{ borderTop: '1px solid #f1f5f9' }}>
              <form action={logout}>
                <button type="submit" className="sidebar-link w-full text-left" style={{ color: '#dc2626' }}>
                  <LogOut size={18} />
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
