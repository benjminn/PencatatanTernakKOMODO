'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  List,
  PlusCircle,
  Users,
  Settings,
  Tag,
  LogOut,
} from 'lucide-react'
import { logout } from '@/lib/actions/auth.actions'

interface SidebarProps {
  role: 'peternak' | 'admin'
  namaPemilik: string
}

const userNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ternak', label: 'Ternak Saya', icon: List },
  { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
]

const adminNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ternak', label: 'Semua Ternak', icon: List },
  { href: '/ternak/tambah', label: 'Tambah Ternak', icon: PlusCircle },
  { href: '/admin/peternak', label: 'Data Peternak', icon: Users },
  { href: '/admin/jenis-ternak', label: 'Jenis Ternak', icon: Tag },
]

export default function Sidebar({ role, namaPemilik }: SidebarProps) {
  const pathname = usePathname()
  const navItems = role === 'admin' ? adminNavItems : userNavItems

  return (
    <aside
      className="hidden md:flex flex-col w-60 border-r shrink-0"
      style={{
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-bg-border)',
      }}
    >
      {/* Logo */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-bg-border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))',
            }}
          >
            🐄
          </div>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--color-text-primary)' }}>
              Pencatatan Ternak
            </p>
            <p className="text-xs leading-tight" style={{ color: 'var(--color-text-muted)' }}>
              Golo Mori & Warloka
            </p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      {role === 'admin' && (
        <div className="px-4 pt-3">
          <span className="badge badge-admin">
            <Settings size={10} />
            Admin Puskeswan
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-bg-border)' }}>
        <div className="flex items-center gap-2 px-2 py-1 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              background: 'var(--color-primary-600)',
              color: 'white',
            }}
          >
            {namaPemilik.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {namaPemilik}
          </span>
        </div>
        <form action={logout}>
          <button type="submit" className="sidebar-link w-full text-left" style={{ color: 'var(--color-mati)' }}>
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}
