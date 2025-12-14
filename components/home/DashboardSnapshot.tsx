'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Folder, Target, CheckCircle, DollarSign, TrendingUp, Plus, Upload, List, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { calculateXpTier, getProgressToNextTier, getTierInfo, getXpForNextTier } from '@/lib/xp-system'
import type { Profile } from '@/types/profile'

interface DashboardSnapshotProps {
  userId: string
  profile: Profile | null
}

interface SnapshotData {
  openProjects: number
  bountiesPosted: number
  bountiesClaimed: number
  earningsThisMonth: number
  totalEarnings: number
}

export function DashboardSnapshot({ userId, profile }: DashboardSnapshotProps) {
  const [data, setData] = useState<SnapshotData>({
    openProjects: 0,
    bountiesPosted: 0,
    bountiesClaimed: 0,
    earningsThisMonth: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSnapshot = async () => {
      setLoading(true)
      try {
        // Fetch snapshot data with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)
        
        const response = await fetch(`/api/dashboard/snapshot?userId=${userId}`, {
          signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const snapshotData = await response.json()
          setData(snapshotData)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('[DASHBOARD_SNAPSHOT] Error:', err)
        }
        // Use mock data on error
        setData({
          openProjects: 0,
          bountiesPosted: 0,
          bountiesClaimed: 0,
          earningsThisMonth: 0,
          totalEarnings: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSnapshot()
  }, [userId])

  const xp = profile?.xp || 0
  const tier = calculateXpTier(xp)
  const tierInfo = getTierInfo(tier)
  const progress = getProgressToNextTier(xp)
  const xpNeeded = getXpForNextTier(xp)

  if (loading) {
    return (
      <div className="border-2 border-green-400/30 bg-black/60 p-6 font-mono">
        <div className="text-green-400 text-sm">LOADING_DASHBOARD...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* My Snapshot */}
      <div className="border-2 border-green-400 bg-black/80 p-6 font-mono">
        <h2 className="text-xl text-green-400 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          &gt; MY_SNAPSHOT
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Open Projects */}
          <div className="border border-green-400/30 p-4 hover:border-green-400 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Folder className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400/70">OPEN_PROJECTS</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{data.openProjects}</div>
          </div>

          {/* Bounties Posted */}
          <div className="border border-pink-400/30 p-4 hover:border-pink-400 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-pink-400/70">BOUNTIES_POSTED</span>
            </div>
            <div className="text-2xl font-bold text-pink-400">{data.bountiesPosted}</div>
          </div>

          {/* Bounties Claimed */}
          <div className="border border-pink-400/30 p-4 hover:border-pink-400 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-pink-400" />
              <span className="text-xs text-pink-400/70">BOUNTIES_CLAIMED</span>
            </div>
            <div className="text-2xl font-bold text-pink-400">{data.bountiesClaimed}</div>
          </div>

          {/* Earnings This Month */}
          <div className="border border-green-400/30 p-4 hover:border-green-400 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-xs text-green-400/70">THIS_MONTH</span>
            </div>
            <div className="text-2xl font-bold text-green-400">${data.earningsThisMonth}</div>
          </div>
        </div>

        {/* XP and Tier */}
        <div className="mt-6 pt-6 border-t border-green-400/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-green-400/70">XP:</span>
              <span className="text-lg font-bold text-green-400">{xp}</span>
              <span className={`px-3 py-1 text-xs font-bold ${tierInfo.bgColor} ${tierInfo.borderColor} border`}>
                {tierInfo.label}
              </span>
            </div>
            {tier !== 'POWER_USER' && (
              <span className="text-xs text-green-400/60">
                {xpNeeded} XP to {tier === 'ROOKIE' ? 'CORE' : 'POWER_USER'}
              </span>
            )}
          </div>
          {tier !== 'POWER_USER' && (
            <div className="w-full h-2 bg-green-400/20 rounded-full overflow-hidden">
              <div 
                className={`h-full ${tierInfo.bgColor.replace('/20', '')} transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-2 border-green-400/30 bg-black/60 p-6 font-mono">
        <h2 className="text-lg text-green-400 mb-4">&gt; QUICK_ACTIONS</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/vault/new">
            <Button className="w-full bg-green-400 text-black hover:bg-green-300 font-mono text-xs h-auto py-3">
              <Plus className="w-4 h-4 mr-1" />
              CREATE_PROJECT
            </Button>
          </Link>
          
          <Link href="/network?tab=bounties&action=create">
            <Button className="w-full bg-pink-400 text-black hover:bg-pink-300 font-mono text-xs h-auto py-3">
              <Target className="w-4 h-4 mr-1" />
              POST_BOUNTY
            </Button>
          </Link>
          
          <Link href="/marketplace/upload">
            <Button className="w-full bg-green-400/80 text-black hover:bg-green-300 font-mono text-xs h-auto py-3">
              <Upload className="w-4 h-4 mr-1" />
              LIST_SERVICE
            </Button>
          </Link>
          
          <Link href="/profile/setup">
            <Button className="w-full bg-green-400/60 text-black hover:bg-green-300 font-mono text-xs h-auto py-3">
              <UserIcon className="w-4 h-4 mr-1" />
              UPDATE_PROFILE
            </Button>
          </Link>
        </div>
      </div>

      {/* Connected Profiles */}
      {profile && (
        <div className="border-2 border-green-400/30 bg-black/60 p-6 font-mono">
          <h2 className="text-lg text-green-400 mb-4">&gt; CONNECTED_PROFILES</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {profile.spotifyUrl && (
              <a 
                href={profile.spotifyUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-green-400/30 p-3 hover:border-green-400 hover:bg-green-400/5 transition-all text-center"
              >
                <div className="text-xs text-green-400 font-bold mb-1">SPOTIFY</div>
                <div className="text-[10px] text-green-400/60">Connected</div>
              </a>
            )}
            
            {profile.appleMusicUrl && (
              <a 
                href={profile.appleMusicUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-green-400/30 p-3 hover:border-green-400 hover:bg-green-400/5 transition-all text-center"
              >
                <div className="text-xs text-green-400 font-bold mb-1">APPLE_MUSIC</div>
                <div className="text-[10px] text-green-400/60">Connected</div>
              </a>
            )}
            
            {profile.instagramUrl && (
              <a 
                href={profile.instagramUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-green-400/30 p-3 hover:border-green-400 hover:bg-green-400/5 transition-all text-center"
              >
                <div className="text-xs text-green-400 font-bold mb-1">INSTAGRAM</div>
                <div className="text-[10px] text-green-400/60">Connected</div>
              </a>
            )}
            
            {profile.youtubeUrl && (
              <a 
                href={profile.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="border border-green-400/30 p-3 hover:border-green-400 hover:bg-green-400/5 transition-all text-center"
              >
                <div className="text-xs text-green-400 font-bold mb-1">YOUTUBE</div>
                <div className="text-[10px] text-green-400/60">Connected</div>
              </a>
            )}
          </div>
          
          {!profile.spotifyUrl && !profile.appleMusicUrl && !profile.instagramUrl && !profile.youtubeUrl && (
            <div className="text-center py-6 text-green-400/60 text-sm">
              No platforms connected yet. <Link href="/profile/setup" className="text-green-400 hover:text-green-300 underline">Connect now</Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
