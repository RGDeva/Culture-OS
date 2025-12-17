'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FolderOpen, 
  Network, 
  Plug, 
  Settings, 
  ChevronLeft,
  Home,
  Briefcase,
  Users,
  DollarSign,
  Zap
} from 'lucide-react'
import { Button } from '@heroui/button'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Vault', href: '/vault', icon: FolderOpen },
  { name: 'Projects', href: '/vault/projects', icon: Briefcase },
  { name: 'Network', href: '/network', icon: Users },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Earnings', href: '/earnings', icon: DollarSign },
  { name: 'Tools', href: '/tools', icon: Zap },
  { name: 'Settings', href: '/profile/setup', icon: Settings },
]

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-zinc-950 border-r border-zinc-800
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          {isOpen && (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CO</span>
              </div>
              <span className="font-semibold text-white">Culture OS</span>
            </Link>
          )}
          
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${!isOpen && 'rotate-180'}`} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-blue-500/10 text-blue-400 font-medium' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }
                  ${!isOpen && 'justify-center'}
                `}
                title={!isOpen ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isOpen && <span className="text-sm">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          {isOpen ? (
            <div className="text-xs text-zinc-500">
              <p className="font-medium text-zinc-400 mb-1">Culture OS</p>
              <p>v1.0.0 Beta</p>
            </div>
          ) : (
            <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto" />
          )}
        </div>
      </aside>
    </>
  )
}
