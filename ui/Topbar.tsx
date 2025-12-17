'use client'

import { Menu, Search, Bell } from 'lucide-react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Badge } from '@heroui/badge'
import { usePrivy } from '@privy-io/react-auth'
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection } from '@heroui/dropdown'
import { Avatar } from '@heroui/avatar'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, authenticated, logout } = usePrivy()

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="hidden md:block w-64 lg:w-96">
          <Input
            placeholder="Search projects, assets..."
            startContent={<Search className="h-4 w-4 text-zinc-500" />}
            classNames={{
              base: "h-9",
              inputWrapper: "bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50",
            }}
            radius="md"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Search icon for mobile */}
        <Button
          isIconOnly
          variant="light"
          className="md:hidden"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <Badge content="3" color="primary" size="sm" placement="top-right">
          <Button
            isIconOnly
            variant="light"
            radius="md"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </Badge>

        {/* User menu */}
        {authenticated && user && (
          <Dropdown
            classNames={{
              base: "border border-zinc-800",
              content: "bg-zinc-950 border-zinc-800"
            }}
          >
            <DropdownTrigger>
              <Button
                variant="light"
                className="gap-2 px-2"
                radius="md"
              >
                <Avatar
                  size="sm"
                  name={typeof user.email === 'string' ? user.email : user.email?.address || 'User'}
                  classNames={{
                    base: "bg-blue-500/10",
                    name: "text-blue-400 font-medium"
                  }}
                />
                <span className="hidden lg:inline text-sm font-medium">
                  {(typeof user.email === 'string' ? user.email : user.email?.address)?.split('@')[0] || 'User'}
                </span>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="User actions"
              variant="flat"
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
                    {(typeof user.email === 'string' ? user.email : user.email?.address) || 'User'}
                  </div>
                </DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem key="profile" href="/profile/setup">
                  My Profile
                </DropdownItem>
                <DropdownItem key="settings" href="/profile/setup">
                  Settings
                </DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem
                  key="logout"
                  color="danger"
                  onPress={() => logout()}
                >
                  Sign Out
                </DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        )}
      </div>
    </header>
  )
}
