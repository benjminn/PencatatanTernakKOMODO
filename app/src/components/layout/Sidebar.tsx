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
  CreditCard,
  BarChart3,
  MapPin,
} from 'lucide-react'
import { logout } from '@/lib/actions/auth.actions'

interface SidebarProps {
  role: 'peternak' | 'admin' | 'superadmin'
  namaPemilik: string
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
        { href: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
        { href: '/admin/peternak', label: 'Kelola Peternak', icon: Users },
        { href: '/admin/ternak', label: 'Kelola Semua Ternak', icon: List },
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
        { href: '/admin/dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
        { href: '/admin/peternak', label: 'Kelola Peternak', icon: Users },
        { href: '/admin/ternak', label: 'Kelola Semua Ternak', icon: List },
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

export default function Sidebar({ role, namaPemilik }: SidebarProps) {
  const pathname = usePathname()
  const navGroups = NAV_CONFIGS[role] || NAV_CONFIGS.peternak

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
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="text-[0.6875rem] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5">
              {group.group}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link key={item.href} href={item.href} className={`sidebar-link ${active ? 'active' : ''}`}>
                  <Icon size={17} />
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
          <Link href="/profil" className={`sidebar-link ${pathname === '/profil' ? 'active' : ''}`}>
            <UserCircle size={17} />
            Profil Saya
          </Link>
        </div>
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
