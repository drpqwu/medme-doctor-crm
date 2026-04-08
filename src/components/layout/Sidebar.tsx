'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, ClipboardList, Settings, Stethoscope, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import clsx from 'clsx'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: '醫師管理', icon: Stethoscope },
  { href: '/visits', label: '拜訪紀錄', icon: ClipboardList },
]

const adminItems = [
  { href: '/admin', label: '系統管理', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={clsx(
        'flex flex-col bg-white border-r border-gray-200 transition-all duration-200 shrink-0',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center shrink-0">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-sm truncate">醫Me CRM</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center mx-auto">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            'text-gray-400 hover:text-gray-600 p-1 rounded',
            collapsed && 'ml-auto'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={clsx('nav-link', isActive(href) && 'active')}
            title={collapsed ? label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </Link>
        ))}

        {user?.role === 'admin' && (
          <>
            <div className={clsx('pt-3 pb-1', !collapsed && 'px-3')}>
              <div className={clsx('border-t border-gray-100', collapsed && 'mx-2')} />
              {!collapsed && (
                <p className="text-xs text-gray-400 mt-3 font-medium uppercase tracking-wider">管理</p>
              )}
            </div>
            {adminItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx('nav-link', isActive(href) && 'active')}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 p-3">
        <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0 text-primary-800 font-semibold text-sm">
            {user?.display_name?.[0] || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.display_name}</p>
              <p className="text-xs text-gray-400 truncate">
                {user?.role === 'admin' ? '管理員' : '一般同仁'}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
              title="登出"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={logout}
            className="mt-2 w-full flex justify-center text-gray-400 hover:text-gray-600 p-1 rounded"
            title="登出"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
