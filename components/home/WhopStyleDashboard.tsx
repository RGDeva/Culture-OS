'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Upload,
  Music2,
  ShoppingCart,
  Users,
  TrendingUp,
  FolderPlus,
  MessageSquarePlus,
  UserCircle,
  Home,
  Folder,
  ShoppingBag,
  Sparkles,
  Settings,
  Bell,
  Search,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types/profile'
import { VaultQuickView } from '@/components/dashboard/VaultQuickView'
import { EnhancedStorefront } from '@/components/dashboard/EnhancedStorefront'

interface WhopStyleDashboardProps {
  userId: string
  profile?: Profile | null
}

interface SnapshotMetrics {
  assetsInVault: number
  activeListings: number
  openCollabs: number
  earningsLast30Days: number
}

export function WhopStyleDashboard({ userId, profile }: WhopStyleDashboardProps) {
  const router = useRouter()
  const [metrics, setMetrics] = useState<SnapshotMetrics>({
    assetsInVault: 0,
    activeListings: 0,
    openCollabs: 0,
    earningsLast30Days: 0,
  })
  const [loading, setLoading] = useState(true)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const metricsRes = await fetch(`/api/dashboard/metrics?userId=${userId}`)
      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setMetrics({
          assetsInVault: data.metrics.openProjects || 0,
          activeListings: data.metrics.activeCollabs || 0,
          openCollabs: data.metrics.activeCollabs || 0,
          earningsLast30Days: data.metrics.earningsThisMonth || 0,
        })
      }
    } catch (error) {
      console.error('[WHOP_DASHBOARD] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const profileCompletion = profile?.profileCompletion || 0
  const displayName = profile?.displayName || 'User'

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: true },
    { icon: Folder, label: 'Vault', path: '/vault', active: false },
    { icon: ShoppingBag, label: 'Marketplace', path: '/marketplace', active: false },
    { icon: Users, label: 'Network', path: '/network', active: false },
    { icon: MessageSquarePlus, label: 'Bounties', path: '/bounties', active: false },
    { icon: TrendingUp, label: 'Earnings', path: '/earnings', active: false },
    { icon: UserCircle, label: 'Profile', path: `/profile/view?userId=${userId}`, active: false },
    { icon: Settings, label: 'Settings', path: '/profile/setup', active: false },
  ]

  return (
    <div className="flex h-screen dark:bg-black bg-white overflow-hidden">
      {/* LEFT SIDEBAR */}
      <div className={`${leftSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80 flex flex-col overflow-hidden`}>
        {/* Logo/Brand */}
        <div className="p-6 border-b dark:border-green-400/30 border-green-600/40">
          <h1 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
            NOCULTURE_OS
          </h1>
          <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
            v1.0.0
          </p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b dark:border-green-400/30 border-green-600/40">
          <div className="flex items-center gap-3">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt={displayName}
                className="w-10 h-10 rounded-full border-2 dark:border-green-400 border-green-600"
              />
            ) : (
              <div className="w-10 h-10 rounded-full dark:bg-green-400/20 bg-green-600/20 flex items-center justify-center">
                <UserCircle className="h-6 w-6 dark:text-green-400 text-green-700" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-mono font-bold dark:text-green-400 text-green-700 truncate">
                {displayName}
              </div>
              <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                {profile?.xp || 0} XP
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-sm transition-all ${
                  item.active
                    ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 border-l-2 dark:border-green-400 border-green-600'
                    : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/10 hover:bg-green-600/10'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Quick Upload Button */}
        <div className="p-4 border-t dark:border-green-400/30 border-green-600/40">
          <Button
            onClick={() => router.push('/vault/upload')}
            className="w-full dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
          >
            <Upload className="h-4 w-4 mr-2" />
            UPLOAD
          </Button>
        </div>
      </div>

      {/* MIDDLE CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="dark:text-green-400 text-green-700 hover:opacity-70"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                DASHBOARD
              </h2>
              <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                Welcome back, {displayName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative dark:text-green-400 text-green-700 hover:opacity-70">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 dark:bg-green-400 bg-green-600 rounded-full"></span>
            </button>
            <button className="dark:text-green-400 text-green-700 hover:opacity-70">
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Open Projects */}
              <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
                <div className="flex items-center gap-2 mb-2">
                  <FolderPlus className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">PROJECTS</span>
                </div>
                <div className="text-3xl font-bold font-mono dark:text-green-400 text-green-700">
                  {metrics.assetsInVault}
                </div>
              </div>

              {/* Active Collabs */}
              <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">COLLABS</span>
                </div>
                <div className="text-3xl font-bold font-mono dark:text-green-400 text-green-700">
                  {metrics.activeListings}
                </div>
              </div>

              {/* Earnings */}
              <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">EARNINGS</span>
                </div>
                <div className="text-3xl font-bold font-mono dark:text-yellow-400 text-yellow-600">
                  ${metrics.earningsLast30Days.toFixed(0)}
                </div>
              </div>

              {/* XP */}
              <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">XP</span>
                </div>
                <div className="text-3xl font-bold font-mono dark:text-green-400 text-green-700">
                  {profile?.xp || 0}
                </div>
              </div>
            </div>

            {/* Vault Quick Access */}
            <VaultQuickView userId={userId} />

            {/* Enhanced Storefront */}
            <EnhancedStorefront userId={userId} />

            {/* Quick Actions Grid */}
            <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
              <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
                &gt; QUICK_ACTIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/vault')}
                  className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all text-left"
                >
                  <Upload className="h-5 w-5 dark:text-green-400 text-green-700 mb-2" />
                  <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold mb-1">
                    UPLOAD_TO_VAULT
                  </div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                    Upload beats, stems, or projects
                  </div>
                </button>

                <button
                  onClick={() => router.push('/marketplace')}
                  className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all text-left"
                >
                  <ShoppingCart className="h-5 w-5 dark:text-green-400 text-green-700 mb-2" />
                  <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold mb-1">
                    BROWSE_MARKETPLACE
                  </div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                    Discover beats & services
                  </div>
                </button>

                <button
                  onClick={() => router.push('/network')}
                  className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all text-left"
                >
                  <Users className="h-5 w-5 dark:text-green-400 text-green-700 mb-2" />
                  <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold mb-1">
                    FIND_COLLABORATORS
                  </div>
                  <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                    Connect with artists
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
