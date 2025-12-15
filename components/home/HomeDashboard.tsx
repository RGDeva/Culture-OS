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
  ArrowRight,
  Sparkles,
  Check,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types/profile'
import { PlatformLinkingModal } from './PlatformLinkingModal'
import { EnhancedStorefront } from '@/components/dashboard/EnhancedStorefront'
import { VaultQuickView } from '@/components/dashboard/VaultQuickView'

interface HomeDashboardProps {
  userId: string
  profile?: Profile | null
}

interface SnapshotMetrics {
  assetsInVault: number
  activeListings: number
  openCollabs: number
  earningsLast30Days: number
}

interface ActivityItem {
  id: string
  type: 'upload' | 'listing' | 'collab' | 'payout'
  description: string
  timestamp: string
}

interface MusoCredits {
  totalCredits: number
  topCredits: Array<{
    title: string
    mainArtist: string
    role: string
  }>
}

export function HomeDashboard({ userId, profile }: HomeDashboardProps) {
  const router = useRouter()
  const [metrics, setMetrics] = useState<SnapshotMetrics>({
    assetsInVault: 0,
    activeListings: 0,
    openCollabs: 0,
    earningsLast30Days: 0,
  })
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [musoCredits, setMusoCredits] = useState<MusoCredits | null>(null)
  const [showPlatformModal, setShowPlatformModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [userId])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch real metrics from API
      const metricsRes = await fetch(`/api/dashboard/metrics?userId=${userId}`)
      if (metricsRes.ok) {
        const data = await metricsRes.json()
        setMetrics({
          assetsInVault: data.metrics.openProjects || 0,
          activeListings: data.metrics.activeCollabs || 0,
          openCollabs: data.metrics.activeCollabs || 0,
          earningsLast30Days: data.metrics.earningsThisMonth || 0,
        })
      } else {
        // Fallback to mock data if API fails
        setMetrics({
          assetsInVault: 0,
          activeListings: 0,
          openCollabs: 0,
          earningsLast30Days: 0,
        })
      }
      
      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'upload',
          description: 'Uploaded "Dark Trap Beat 140"',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: '2',
          type: 'listing',
          description: 'Listed "Summer Vibes Loop" for $49',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: '3',
          type: 'collab',
          description: 'Received collab request from @producer_mike',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        },
        {
          id: '4',
          type: 'payout',
          description: 'Received $125 from beat sale',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: '5',
          type: 'upload',
          description: 'Uploaded "Vocal Stems Pack"',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
      ])
      
      // Mock Muso credits
      // TODO: Replace with real Muso API call
      // const musoRes = await fetch(`/api/muso/credits?userId=${userId}`)
      // const musoData = await musoRes.json()
      setMusoCredits({
        totalCredits: 12,
        topCredits: [
          { title: 'Summer Nights', mainArtist: 'Artist Name', role: 'Producer' },
          { title: 'City Lights', mainArtist: 'Another Artist', role: 'Co-Writer' },
          { title: 'Midnight Drive', mainArtist: 'Third Artist', role: 'Engineer' },
        ],
      })
    } catch (error) {
      console.error('[HOME_DASHBOARD] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const profileCompletion = profile?.profileCompletion || 0
  const displayName = profile?.displayName || 'User'
  const primaryRole = profile?.primaryRole || 'PRODUCER'
  const xpTier = profile?.xp ? Math.floor(profile.xp / 1000) : 0

  return (
    <div className="w-full space-y-6">
      {/* Welcome Section */}
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-2 tracking-wider">
          &gt; SYSTEM_ONLINE
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-mono dark:text-green-400 text-green-700 mb-3">
          WELCOME_BACK, {displayName}
        </h1>
        <p className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-4">
          Your creative operating system is ready. Access your vault, explore the marketplace, or connect with the network.
        </p>
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
            &gt; XP: {profile?.xp || 0} · PROFILE: {profileCompletion}% COMPLETE
          </div>
          <Button
            onClick={() => router.push(`/profile/view?userId=${userId}`)}
            variant="outline"
            size="sm"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
          >
            <UserCircle className="h-3 w-3 mr-2" />
            PREVIEW_PROFILE
          </Button>
        </div>
      </div>

      {/* Main Content: Snapshot + Connected Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MY_SNAPSHOT */}
        <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
          <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-6">
            MY_SNAPSHOT
          </h3>
          
          {/* 2x2 Grid Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Top Left: Total Requests */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FolderPlus className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">OPEN_PROJECTS</span>
              </div>
              <div className="text-4xl font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                {metrics.assetsInVault}
              </div>
              <div className="flex items-center gap-2 text-xs font-mono dark:text-green-400/50 text-green-700/60">
                <button onClick={() => router.push('/vault')} className="hover:underline">
                  &gt; VIEW_PROJECTS
                </button>
                <span>•</span>
                <button className="hover:underline">
                  &gt; CREATE_PROJECT
                </button>
              </div>
            </div>

            {/* Top Right: Active Collabs */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">ACTIVE_COLLABS</span>
              </div>
              <div className="text-4xl font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                {metrics.activeListings}
              </div>
              <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                <button className="hover:underline">&gt; VIEW_BOUNTIES</button>
              </div>
            </div>

            {/* Bottom Left: Earnings */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">EARNINGS_THIS_MONTH</span>
              </div>
              <div className="text-4xl font-bold font-mono dark:text-yellow-400 text-yellow-600 mb-3">
                ${metrics.earningsLast30Days.toFixed(2)}
              </div>
              <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                Next Payout in ~$250 XP
              </div>
            </div>

            {/* Bottom Right: XP / Tier */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
                <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">XP / TIER</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-4xl font-bold font-mono dark:text-green-400 text-green-700">
                  {profile?.xp || 0}
                </div>
                <div className="px-3 py-1 text-sm font-mono dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 border dark:border-green-400/30 border-green-600/40">
                  ROOKIE
                </div>
              </div>
              <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                Next Tier in ~$250 XP
              </div>
            </div>
          </div>
        </div>

        {/* CONNECTED_PROFILES */}
        <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
          <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
            CONNECTED_PROFILES
          </h3>
          <div className="space-y-3">
            {/* Spotify */}
            <div className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/30">
              <div className="flex items-center gap-3">
                <Music2 className="h-5 w-5 dark:text-green-400 text-green-700" />
                <span className="text-sm font-mono dark:text-green-400 text-green-700">Spotify</span>
              </div>
              <button className="px-3 py-1 text-xs font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white">
                CONNECTED
              </button>
            </div>

            {/* Apple Music */}
            <div className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/30">
              <div className="flex items-center gap-3">
                <Music2 className="h-5 w-5 dark:text-green-400 text-green-700" />
                <span className="text-sm font-mono dark:text-green-400 text-green-700">Apple Music</span>
              </div>
              <button className="px-3 py-1 text-xs font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white">
                CONNECTED
              </button>
            </div>

            {/* SoundCloud */}
            <div className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/30">
              <div className="flex items-center gap-3">
                <Music2 className="h-5 w-5 dark:text-green-400/50 text-green-700/50" />
                <span className="text-sm font-mono dark:text-green-400/50 text-green-700/50">SoundCloud</span>
              </div>
              <button 
                onClick={() => setShowPlatformModal(true)}
                className="px-3 py-1 text-xs font-mono dark:bg-yellow-400/20 bg-yellow-600/20 dark:text-yellow-400 text-yellow-700 border dark:border-yellow-400/30 border-yellow-600/40"
              >
                ADD_LINK
              </button>
            </div>

            {/* Muso Social */}
            <div className="flex items-center justify-between p-3 border dark:border-green-400/20 border-green-600/30">
              <div className="flex items-center gap-3">
                <Music2 className="h-5 w-5 dark:text-green-400/50 text-green-700/50" />
                <span className="text-sm font-mono dark:text-green-400/50 text-green-700/50">Muso Social</span>
              </div>
              <button 
                onClick={() => setShowPlatformModal(true)}
                className="px-3 py-1 text-xs font-mono dark:bg-yellow-400/20 bg-yellow-600/20 dark:text-yellow-400 text-yellow-700 border dark:border-yellow-400/30 border-yellow-600/40"
              >
                ADD_LINK
              </button>
            </div>
          </div>

          <div className="mt-4 text-xs font-mono dark:text-green-400/60 text-green-700/70">
            Click any platform to connect or update
          </div>
        </div>
      </div>

      {/* Vault Quick Access */}
      <VaultQuickView userId={userId} />

      {/* Enhanced Storefront Panel */}
      <EnhancedStorefront userId={userId} />

      {/* Quick Actions */}
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
          &gt; QUICK_ACTIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Upload to Vault */}
          <button
            onClick={() => router.push('/vault')}
            className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Upload className="h-5 w-5 dark:text-green-400 text-green-700" />
              <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                UPLOAD_TO_VAULT
              </span>
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 text-left">
              Upload beats, stems, or projects
            </p>
          </button>

          {/* List Bounty */}
          <button
            onClick={() => router.push('/bounties/create')}
            className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageSquarePlus className="h-5 w-5 dark:text-green-400 text-green-700" />
              <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                LIST_BOUNTY
              </span>
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 text-left">
              Post a collab request or job
            </p>
          </button>

          {/* Browse Marketplace */}
          <button
            onClick={() => router.push('/marketplace')}
            className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-5 w-5 dark:text-green-400 text-green-700" />
              <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                BROWSE_MARKETPLACE
              </span>
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 text-left">
              Discover beats, packs & services
            </p>
          </button>

          {/* Find Collaborators */}
          <button
            onClick={() => router.push('/network')}
            className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 dark:text-green-400 text-green-700" />
              <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                FIND_COLLABORATORS
              </span>
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 text-left">
              Connect with artists & producers
            </p>
          </button>

          {/* Create Project */}
          <button
            onClick={() => router.push('/projects/create')}
            className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <FolderPlus className="h-5 w-5 dark:text-green-400 text-green-700" />
              <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                CREATE_PROJECT
              </span>
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 text-left">
              Start a new collaborative project
            </p>
          </button>

          {/* View Earnings */}
          <button
            onClick={() => router.push('/earnings')}
            className="p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 dark:text-green-400 text-green-700" />
              <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                VIEW_EARNINGS
              </span>
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 text-left">
              Check payouts & revenue
            </p>
          </button>
        </div>
      </div>

      {/* Profile Progress */}
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
          &gt; PROFILE_PROGRESS
        </h3>
        
        <div className="space-y-4">
          {/* Profile Completeness */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono dark:text-green-400/70 text-green-700/70">
                PROFILE_COMPLETENESS
              </span>
              <span className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                {profileCompletion}%
              </span>
            </div>
            <div className="h-2 dark:bg-green-400/20 bg-green-600/20 overflow-hidden">
              <div
                className="h-full dark:bg-green-400 bg-green-600 transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              />
            </div>
          </div>

          {/* Connected Platforms */}
          <div>
            <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-2">
              CONNECTED_PLATFORMS
            </div>
            <div className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
              2
            </div>
            <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
              Streaming & social
            </div>
          </div>

          {/* Network Connections */}
          <div>
            <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-2">
              NETWORK_CONNECTIONS
            </div>
            <div className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
              0
            </div>
            <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
              Collaborators
            </div>
          </div>

          <div className="pt-4 border-t dark:border-green-400/20 border-green-600/30">
            <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-2">
              NEXT_STEPS:
            </div>
            <div className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
              <Check className="h-3 w-3 inline mr-1 dark:text-green-400 text-green-700" />
              Connect a streaming or social profile
            </div>
          </div>
        </div>
      </div>


      {/* Platform Linking Modal */}
      <PlatformLinkingModal
        isOpen={showPlatformModal}
        onClose={() => setShowPlatformModal(false)}
        onSave={async (platform, url) => {
          // TODO: Save to profile API
          console.log('Saving platform:', platform, url)
          await fetch(`/api/profile/platforms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, platform, url }),
          })
        }}
      />
    </div>
  )
}

// Activity Item Component
function ActivityItemComponent({ activity }: { activity: ActivityItem }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'upload':
        return <Upload className="h-4 w-4" />
      case 'listing':
        return <ShoppingCart className="h-4 w-4" />
      case 'collab':
        return <Users className="h-4 w-4" />
      case 'payout':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Music2 className="h-4 w-4" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="p-4 flex items-start gap-3 hover:dark:bg-green-400/5 hover:bg-green-600/5 transition-colors">
      <div className="dark:text-green-400 text-green-700 mt-0.5">
        {getIcon()}
      </div>
      <div className="flex-1">
        <div className="text-sm font-mono dark:text-green-400 text-green-700">
          {activity.description}
        </div>
        <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60 mt-1">
          {getTimeAgo(activity.timestamp)}
        </div>
      </div>
    </div>
  )
}
