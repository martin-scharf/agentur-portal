'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/agents', label: 'Agenten', icon: '🤖' },
  { href: '/admin/api-keys', label: 'API-Keys', icon: '🔑' },
  { href: '/admin/settings', label: 'Einstellungen', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-[#12121a] border-r border-[#2a2a3a] min-h-screen flex flex-col">
      <div className="p-6 border-b border-[#2a2a3a]">
        <h1 className="text-xl font-bold text-white">🎯 Command Center</h1>
        <p className="text-sm text-gray-500 mt-1">Agentur-Portal</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-[#6366f1] text-white'
                      : 'text-gray-400 hover:bg-[#1a1a2a] hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-[#2a2a3a]">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Abmelden</span>
        </button>
      </div>
    </aside>
  )
}
