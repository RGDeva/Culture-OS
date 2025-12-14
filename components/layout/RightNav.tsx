'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Home, FolderOpen, ShoppingBag, Users, Map, Wrench, Brain, User, LogOut, X, Moon, Sun, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

const NAV_ITEMS = [
  { href: '/', label: 'HOME', icon: Home },
  { href: '/vault', label: 'VAULT', icon: FolderOpen },
  { href: '/marketplace', label: 'MARKETPLACE', icon: ShoppingBag },
  { href: '/network', label: 'NETWORK', icon: Users },
  { href: '/notifications', label: 'NOTIFICATIONS', icon: Bell },
  { href: '/tools', label: 'TOOLS', icon: Wrench },
  { href: '/intelligence', label: 'INTELLIGENCE', icon: Brain },
]

interface RightNavProps {
  isOpen: boolean
  onClose: () => void
}

export function RightNav({ isOpen, onClose }: RightNavProps) {
  const pathname = usePathname()
  const { user, authenticated, login, logout } = usePrivy()
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black dark:bg-black light:bg-white border-l-2 border-green-400 dark:border-green-400 light:border-gray-300 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="mb-8 mt-12">
            <h2 className="text-2xl font-bold font-mono text-green-400 dark:text-green-400 light:text-green-700">
              &gt; NOCULTURE_OS
            </h2>
            <p className="text-xs text-green-400/60 dark:text-green-400/60 light:text-gray-500 font-mono mt-1">
              v1.0.0_BETA
            </p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="mb-6 p-3 border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-700 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600 hover:bg-green-400/10 dark:hover:bg-green-400/10 light:hover:bg-green-50 transition-all font-mono text-sm flex items-center justify-between"
          >
            <span>&gt; THEME: {theme.toUpperCase()}</span>
            {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 p-3 border-2 font-mono text-sm transition-all ${
                    isActive
                      ? 'bg-green-400 dark:bg-green-400 light:bg-green-600 text-black border-green-400 dark:border-green-400 light:border-green-600'
                      : 'bg-transparent text-green-400 dark:text-green-400 light:text-green-700 border-green-400/30 dark:border-green-400/30 light:border-gray-300 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600 hover:bg-green-400/10 dark:hover:bg-green-400/10 light:hover:bg-green-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="mt-6 pt-6 border-t-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300">
            {authenticated && user ? (
              <div className="space-y-3">
                <Link
                  href="/profile/setup"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300 text-green-400 dark:text-green-400 light:text-green-700 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600 hover:bg-green-400/10 dark:hover:bg-green-400/10 light:hover:bg-green-50 transition-all font-mono text-sm"
                >
                  <User className="h-4 w-4" />
                  PROFILE
                </Link>
                <button
                  onClick={() => {
                    logout()
                    onClose()
                  }}
                  className="w-full flex items-center gap-3 p-3 border-2 border-red-400/30 dark:border-red-400/30 light:border-red-300 text-red-400 dark:text-red-400 light:text-red-600 hover:border-red-400 dark:hover:border-red-400 light:hover:border-red-600 hover:bg-red-400/10 dark:hover:bg-red-400/10 light:hover:bg-red-50 transition-all font-mono text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  LOGOUT
                </button>
              </div>
            ) : (
              <Button
                onClick={() => {
                  login()
                  onClose()
                }}
                className="w-full bg-green-400 dark:bg-green-400 light:bg-green-600 text-black hover:bg-green-300 dark:hover:bg-green-300 light:hover:bg-green-500 font-mono"
              >
                &gt; CONNECT_WALLET
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
