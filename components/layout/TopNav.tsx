'use client'

import { useState, useEffect } from 'react'
import { User, Menu, Moon, Sun, CheckCircle, LogOut } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { Profile } from '@/types/profile'
import { Button } from '@heroui/button'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from '@heroui/dropdown'
import { Avatar } from '@heroui/avatar'
import { Chip } from '@heroui/chip'

interface TopNavProps {
  onMenuClick: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { user, authenticated, logout } = usePrivy()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
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
        <Button
          as={Link}
          href="/profile/setup"
          color="warning"
          variant="flat"
          size="sm"
          startContent={<CheckCircle className="h-4 w-4" />}
          className="font-medium"
          radius="md"
        >
          <span className="hidden sm:inline">Complete Profile</span>
          <span className="font-semibold">{completion}%</span>
        </Button>
      )}

      {/* Theme Toggle Button */}
      <Button
        isIconOnly
        color="default"
        variant="flat"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        radius="md"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>

      {/* Profile Button - Only show when authenticated */}
      {authenticated && user && (
        <Dropdown
          backdrop="opaque"
          classNames={{
            base: "border border-zinc-800",
            content: "bg-zinc-950 border-zinc-800"
          }}
        >
          <DropdownTrigger>
            <Button
              isIconOnly
              color="default"
              variant="flat"
              aria-label="Profile menu"
              radius="md"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Profile actions"
            variant="flat"
            disallowEmptySelection
            selectionMode="none"
          >
            <DropdownSection showDivider>
              <DropdownItem
                key="user-info"
                isReadOnly
                className="h-14 gap-2 opacity-100"
                textValue="User info"
              >
                <div className="text-xs text-zinc-500 font-medium">Signed in as</div>
                <div className="text-sm font-semibold text-white truncate">
                  {(typeof user.email === 'string' ? user.email : user.email?.address) || (user.wallet?.address ? user.wallet.address.slice(0, 10) + '...' : 'User')}
                </div>
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem
                key="profile"
                href="/profile/setup"
                className="text-zinc-300"
              >
                My Profile
              </DropdownItem>
              <DropdownItem
                key="dashboard"
                href="/"
                className="text-zinc-300"
              >
                Dashboard
              </DropdownItem>
              <DropdownItem
                key="vault"
                href="/vault"
                className="text-zinc-300"
              >
                My Vault
              </DropdownItem>
            </DropdownSection>
            <DropdownSection>
              <DropdownItem
                key="logout"
                color="danger"
                className="text-red-400"
                startContent={<LogOut className="h-4 w-4" />}
                onPress={() => logout()}
              >
                Sign Out
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      )}

      {/* Menu Button */}
      <Button
        isIconOnly
        color="default"
        variant="flat"
        onClick={onMenuClick}
        aria-label="Toggle navigation"
        radius="md"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  )
}
