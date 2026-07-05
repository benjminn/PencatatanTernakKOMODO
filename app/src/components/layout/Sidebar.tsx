'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  List,
  PlusCircle,
  Users,
  Tag,
  LogOut,
  ShieldCheck,
  UserCircle,
  ShieldAlert,
} from 'lucide-react'
import { logout } from '@/lib/actions/auth.actions'

interface SidebarProps {
  role: 'peternak' | 'admin' | 'superadmin'
  namaPemilik: string
}

const NAV_CONFIGS = {
  peternak: [
    { href: '/dashboard', label: 'Beranda', icon: LayoutDashboard },
    { href: '/ternak', label: 'Ternak Saya', icon: List },
    { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
  ],
  admin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ternak', label: 'Semua Ternak', icon: List },
    { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
    { href: '/admin/peternak', label: 'Data Peternak', icon: Users },
    { href: '/admin/jenis-ternak', label: 'Jenis Ternak', icon: Tag },
  ],
  superadmin: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/ternak', label: 'Semua Ternak', icon: List },
    { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
    { href: '/admin/peternak', label: 'Data Peternak', icon: Users },
    { href: '/admin/jenis-ternak', label: 'Jenis Ternak', icon: Tag },
    { href: '/admin/kelola-admin', label: 'Kelola Admin', icon: ShieldAlert },
  ],
}

const ROLE_LABEL: Record<string, string> = {
  peternak: 'Peternak',
  admin: 'Petugas Puskeswan',
  superadmin: 'Super Admin',
}

export default function Sidebar({ role, namaPemilik }: SidebarProps) {
  const pathname = usePathname()
  const navItems = NAV_CONFIGS[role] || NAV_CONFIGS.peternak

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/admin/dashboard') return pathname === href
    if (href === '/profil') return pathname === '/profil'
    return pathname.startsWith(href) && href !== '/profil'
  }

  return (
    <aside
      className="hidden md:flex flex-col w-60 shrink-0 h-screen"
      style={{ background: 'white', borderRight: '1px solid #e2e8f0' }}
    >
      {/* Brand */}
      <div className="px-4 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="w-10 h-10 relative shrink-0">
          <Image
            src="/logo/6311a9ed51648_300x300.webp"
            alt="Logo Dinas Peternakan"
            fill
            className="object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 leading-tight truncate">
            Pencatatan Ternak
          </p>
          <p className="text-xs text-gray-500 leading-tight">
            Kec. Komodo
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={17} />
              {item.label}
            </Link>
          )
        })}

        <div className="divider" />

        <p className="text-[0.6875rem] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Akun
        </p>
        <Link href="/profil" className={`sidebar-link ${pathname === '/profil' ? 'active' : ''}`}>
          <UserCircle size={17} />
          Profil Saya
        </Link>
      </nav>

      {/* User Footer */}
      <div className="px-3 py-3" style={{ borderTop: '1px solid #f1f5f9' }}>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-2" style={{ background: '#f8fafc' }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: '#166534', color: 'white' }}
          >
            {namaPemilik.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate leading-tight">
              {namaPemilik}
            </p>
            <p className="text-[0.6875rem] text-gray-500 leading-tight">
              {ROLE_LABEL[role] || role}
            </p>
          </div>
        </div>
        <form action={logout}>
          <button type="submit" className="sidebar-link w-full text-left" style={{ color: '#dc2626' }}>
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}
