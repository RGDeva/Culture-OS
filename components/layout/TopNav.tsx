'use client'

import { useState, useEffect } from 'react'
import { User, Menu, Moon, Sun, CheckCircle } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { Profile } from '@/types/profile'

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user, authenticated } = usePrivy()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  // Load profile to get completion percentage
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || !authenticated) return
      
      setProfileLoading(true)
      try {
        const response = await fetch(`/api/profile?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
        }
      } catch (err) {
        console.error('[TopNav] Error loading profile:', err)
      } finally {
        setProfileLoading(false)
      }
    }

    loadProfile()
  }, [user?.id, authenticated])

  const completion = profile?.profileCompletion || 0
  const needsProfileSetup = authenticated && completion < 100

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
      {/* Profile Completion Button - Only show if profile incomplete */}
      {needsProfileSetup && profile && (
        <Link
          href="/profile/setup"
          className={`px-3 py-2 border-2 transition-all font-mono text-xs flex items-center gap-2 ${
            theme === 'dark'
              ? 'bg-black border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-black'
              : 'bg-white border-pink-600 text-pink-700 hover:bg-pink-100'
          }`}
          title="Complete your profile"
        >
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">PROFILE</span>
          <span className="font-bold">{completion}%</span>
        </Link>
      )}

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`p-3 border-2 transition-all font-mono ${
          theme === 'dark'
            ? 'bg-black border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
            : 'bg-white border-gray-400 text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Toggle theme"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Profile Button - Only show when authenticated */}
      {authenticated && user && (
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`p-3 border-2 transition-all font-mono ${
              theme === 'dark'
                ? 'bg-black border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                : 'bg-white border-gray-400 text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Profile menu"
          >
            <User className="h-5 w-5" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              
              {/* Menu */}
              <div className={`absolute right-0 mt-2 w-64 border-2 z-50 ${
                theme === 'dark'
                  ? 'bg-black border-green-400'
                  : 'bg-white border-gray-300'
              }`}>
                <div className={`p-4 border-b-2 ${
                  theme === 'dark' ? 'border-green-400/30' : 'border-gray-300'
                }`}>
                  <div className={`text-xs font-mono mb-1 ${
                    theme === 'dark' ? 'text-green-400/60' : 'text-gray-500'
                  }`}>
                    LOGGED_IN_AS:
                  </div>
                  <div className={`text-sm font-mono font-bold truncate ${
                    theme === 'dark' ? 'text-green-400' : 'text-gray-900'
                  }`}>
                    {(typeof user.email === 'string' ? user.email : user.email?.address) || (user.wallet?.address ? user.wallet.address.slice(0, 10) + '...' : 'User')}
                  </div>
                </div>

                <div className="p-2">
                  <Link
                    href="/profile/setup"
                    onClick={() => setShowProfileMenu(false)}
                    className={`block px-4 py-3 text-sm font-mono transition-all ${
                      theme === 'dark'
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    &gt; MY_PROFILE
                  </Link>
                  
                  <Link
                    href="/"
                    onClick={() => setShowProfileMenu(false)}
                    className={`block px-4 py-3 text-sm font-mono transition-all ${
                      theme === 'dark'
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    &gt; DASHBOARD
                  </Link>

                  <Link
                    href="/vault"
                    onClick={() => setShowProfileMenu(false)}
                    className={`block px-4 py-3 text-sm font-mono transition-all ${
                      theme === 'dark'
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    &gt; MY_VAULT
                  </Link>

                  <Link
                    href="/earnings"
                    onClick={() => setShowProfileMenu(false)}
                    className={`block px-4 py-3 text-sm font-mono transition-all ${
                      theme === 'dark'
                        ? 'text-green-400 hover:bg-green-400/10'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    &gt; EARNINGS
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Menu Button */}
      <button
        onClick={onMenuClick}
        className={`p-3 border-2 transition-all font-mono ${
          theme === 'dark'
            ? 'bg-black border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
            : 'bg-white border-gray-400 text-gray-700 hover:bg-gray-100'
        }`}
        aria-label="Toggle navigation"
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  )
}
