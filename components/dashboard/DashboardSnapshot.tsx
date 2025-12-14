'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FolderOpen, Briefcase, DollarSign, Star, Plus, Upload, List } from 'lucide-react'
import { calculateXpTier, getTierInfo, getXpForNextTier, getProgressToNextTier } from '@/lib/xp-system'

interface SnapshotData {
  openProjectsCount: number
  bountiesPosted: number
  bountiesClaimed: number
  earningsThisMonth: number
  xp: number
  connectedPlatforms: {
    spotify?: boolean
    appleMusic?: boolean
    soundcloud?: boolean
    instagram?: boolean
    tiktok?: boolean
  }
}

interface DashboardSnapshotProps {
  userId: string
}

export function DashboardSnapshot({ userId }: DashboardSnapshotProps) {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState<SnapshotData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSnapshot() {
      try {
        const res = await fetch(`/api/dashboard/snapshot?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setSnapshot(data)
        }
      } catch (error) {
        console.error('Error fetching snapshot:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchSnapshot()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-2 dark:border-green-400/30 border-gray-300 p-6 animate-pulse">
          <div className="h-6 dark:bg-green-400/20 bg-gray-200 w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 dark:bg-green-400/10 bg-gray-100 w-full"></div>
            <div className="h-4 dark:bg-green-400/10 bg-gray-100 w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!snapshot) {
    return (
      <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
        <p className="dark:text-green-400/60 text-gray-600">Unable to load dashboard data</p>
      </div>
    )
  }

  const tier = calculateXpTier(snapshot.xp)
  const tierInfo = getTierInfo(tier)
  const xpForNext = getXpForNextTier(snapshot.xp)
  const progress = getProgressToNextTier(snapshot.xp)

  return (
    <div className="space-y-6">
      {/* My Snapshot Panel */}
      <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
        <h2 className="text-2xl font-bold mb-6 dark:text-green-400 text-gray-900 font-mono">
          &gt; MY_SNAPSHOT
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Open Projects */}
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-4 hover:border-green-400 transition-all cursor-pointer"
               onClick={() => router.push('/vault')}>
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="h-5 w-5 dark:text-green-400 text-gray-700" />
              <span className="text-sm dark:text-green-400/60 text-gray-600 font-mono">OPEN_PROJECTS</span>
            </div>
            <div className="text-3xl font-bold dark:text-green-400 text-gray-900 font-mono">
              {snapshot.openProjectsCount}
            </div>
          </div>

          {/* Bounties Posted */}
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-4 hover:border-green-400 transition-all cursor-pointer"
               onClick={() => router.push('/network?tab=bounties')}>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-5 w-5 dark:text-pink-400 text-pink-600" />
              <span className="text-sm dark:text-green-400/60 text-gray-600 font-mono">BOUNTIES_POSTED</span>
            </div>
            <div className="text-3xl font-bold dark:text-pink-400 text-pink-600 font-mono">
              {snapshot.bountiesPosted}
            </div>
          </div>

          {/* Bounties Claimed */}
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-4 hover:border-green-400 transition-all cursor-pointer"
               onClick={() => router.push('/network?tab=bounties')}>
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="h-5 w-5 dark:text-cyan-400 text-cyan-600" />
              <span className="text-sm dark:text-green-400/60 text-gray-600 font-mono">BOUNTIES_CLAIMED</span>
            </div>
            <div className="text-3xl font-bold dark:text-cyan-400 text-cyan-600 font-mono">
              {snapshot.bountiesClaimed}
            </div>
          </div>

          {/* Earnings This Month */}
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-4 hover:border-green-400 transition-all cursor-pointer"
               onClick={() => router.push('/earnings')}>
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 dark:text-green-400 text-gray-700" />
              <span className="text-sm dark:text-green-400/60 text-gray-600 font-mono">EARNINGS_THIS_MONTH</span>
            </div>
            <div className="text-3xl font-bold dark:text-green-400 text-gray-900 font-mono">
              ${snapshot.earningsThisMonth.toFixed(0)}
            </div>
          </div>
        </div>

        {/* XP / Level */}
        <div className="border-2 dark:border-green-400/30 border-gray-300 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5" style={{ color: tierInfo.color }} fill={tierInfo.color} />
              <span className="font-mono font-bold" style={{ color: tierInfo.color }}>
                {tierInfo.label}
              </span>
            </div>
            <div className="text-sm dark:text-green-400/60 text-gray-600 font-mono">
              {snapshot.xp} XP
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="h-2 dark:bg-black bg-gray-200 border-2 dark:border-green-400/30 border-gray-300 overflow-hidden">
              <div 
                className="h-full transition-all duration-500"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: tierInfo.color
                }}
              />
            </div>
          </div>

          {tier !== 'POWER_USER' && (
            <div className="text-xs dark:text-green-400/60 text-gray-600 font-mono">
              Next tier in +{xpForNext} XP
            </div>
          )}
        </div>
      </div>

      {/* Connected Profiles */}
      <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-green-400 text-gray-900 font-mono">
          &gt; CONNECTED_PROFILES
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {snapshot.connectedPlatforms.spotify && (
            <div className="border-2 dark:border-green-400/30 border-gray-300 p-3 text-center">
              <div className="text-sm font-mono dark:text-green-400 text-gray-700">Spotify</div>
              <div className="text-xs dark:text-green-400/60 text-gray-600 mt-1">✓ Connected</div>
            </div>
          )}
          {snapshot.connectedPlatforms.appleMusic && (
            <div className="border-2 dark:border-green-400/30 border-gray-300 p-3 text-center">
              <div className="text-sm font-mono dark:text-green-400 text-gray-700">Apple Music</div>
              <div className="text-xs dark:text-green-400/60 text-gray-600 mt-1">✓ Connected</div>
            </div>
          )}
          {snapshot.connectedPlatforms.soundcloud && (
            <div className="border-2 dark:border-green-400/30 border-gray-300 p-3 text-center">
              <div className="text-sm font-mono dark:text-green-400 text-gray-700">SoundCloud</div>
              <div className="text-xs dark:text-green-400/60 text-gray-600 mt-1">✓ Connected</div>
            </div>
          )}
          {snapshot.connectedPlatforms.instagram && (
            <div className="border-2 dark:border-green-400/30 border-gray-300 p-3 text-center">
              <div className="text-sm font-mono dark:text-green-400 text-gray-700">Instagram</div>
              <div className="text-xs dark:text-green-400/60 text-gray-600 mt-1">✓ Connected</div>
            </div>
          )}
          {snapshot.connectedPlatforms.tiktok && (
            <div className="border-2 dark:border-green-400/30 border-gray-300 p-3 text-center">
              <div className="text-sm font-mono dark:text-green-400 text-gray-700">TikTok</div>
              <div className="text-xs dark:text-green-400/60 text-gray-600 mt-1">✓ Connected</div>
            </div>
          )}
        </div>

        {!snapshot.connectedPlatforms.spotify && 
         !snapshot.connectedPlatforms.appleMusic && 
         !snapshot.connectedPlatforms.soundcloud && (
          <div className="text-center py-6 dark:text-green-400/60 text-gray-600 font-mono text-sm">
            No platforms connected yet
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
        <h2 className="text-xl font-bold mb-4 dark:text-green-400 text-gray-900 font-mono">
          &gt; QUICK_ACTIONS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => router.push('/vault/new')}
            className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold h-auto py-4"
          >
            <Plus className="mr-2 h-5 w-5" />
            CREATE_PROJECT
          </Button>

          <Button
            onClick={() => router.push('/network?tab=bounties&action=create')}
            className="dark:bg-pink-500 bg-pink-600 text-black hover:bg-pink-400 font-mono font-bold h-auto py-4"
          >
            <Briefcase className="mr-2 h-5 w-5" />
            POST_BOUNTY
          </Button>

          <Button
            onClick={() => router.push('/marketplace/upload')}
            variant="outline"
            className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono font-bold h-auto py-4"
          >
            <Upload className="mr-2 h-5 w-5" />
            LIST_SERVICE_OR_PACK
          </Button>

          <Button
            onClick={() => router.push('/profile/setup')}
            variant="outline"
            className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono font-bold h-auto py-4"
          >
            <List className="mr-2 h-5 w-5" />
            UPDATE_PROFILE
          </Button>
        </div>
      </div>
    </div>
  )
}
