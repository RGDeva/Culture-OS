'use client'

import { useEffect, useState } from 'react'
import { Activity, TrendingUp, DollarSign, Users, Target, Music, ShoppingCart, ChevronDown, ChevronUp } from 'lucide-react'

interface ActivityFeedProps {
  userId: string
}

interface ActivityItem {
  id: string
  type: 'EARNING' | 'SALE' | 'BOUNTY' | 'COLLAB' | 'UPLOAD'
  title: string
  description: string
  amount?: number
  timestamp: Date
  icon: any
}

export function ActivityFeed({ userId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    loadActivities()
  }, [userId])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const recentActivities: ActivityItem[] = []

      // Load recent earnings
      const earningsRes = await fetch(`/api/earnings/recent?userId=${userId}&limit=5`).catch(() => null)
      if (earningsRes?.ok) {
        const data = await earningsRes.json()
        data.earnings?.forEach((earning: any) => {
          recentActivities.push({
            id: earning.id,
            type: 'EARNING',
            title: 'Earned from streaming',
            description: earning.platform || 'Platform',
            amount: earning.amountCents / 100,
            timestamp: new Date(earning.createdAt),
            icon: DollarSign
          })
        })
      }

      // Load recent bounty participations
      const bountiesRes = await fetch(`/api/bounties/me?userId=${userId}`).catch(() => null)
      if (bountiesRes?.ok) {
        const data = await bountiesRes.json()
        data.participations?.slice(0, 3).forEach((participation: any) => {
          recentActivities.push({
            id: participation.id,
            type: 'BOUNTY',
            title: 'Joined bounty campaign',
            description: participation.campaign?.title || 'Campaign',
            timestamp: new Date(participation.joinedAt),
            icon: Target
          })
        })
      }

      // Load recent vault uploads
      const vaultRes = await fetch(`/api/vault/assets?ownerId=${userId}&limit=3`).catch(() => null)
      if (vaultRes?.ok) {
        const data = await vaultRes.json()
        data.assets?.forEach((asset: any) => {
          recentActivities.push({
            id: asset.id,
            type: 'UPLOAD',
            title: 'Uploaded to vault',
            description: asset.title,
            timestamp: new Date(asset.createdAt),
            icon: Music
          })
        })
      }

      // Sort by timestamp
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setActivities(recentActivities.slice(0, 10))
    } catch (error) {
      console.error('[ACTIVITY_FEED] Error loading activities:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <div className="animate-pulse space-y-3">
          <div className="h-6 dark:bg-green-400/20 bg-green-600/20 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 dark:bg-green-400/10 bg-green-600/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <Activity className="h-5 w-5 dark:text-green-400 text-green-700" />
          <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
            &gt; RECENT_ACTIVITY
          </h2>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 dark:text-green-400 text-green-700" />
          ) : (
            <ChevronUp className="h-4 w-4 dark:text-green-400 text-green-700" />
          )}
        </button>
      </div>

      {/* Activity List */}
      {!isCollapsed && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border dark:border-green-400/20 border-green-600/30 hover:dark:border-green-400/40 hover:border-green-600/50 transition-all"
                >
                  <div className="p-2 dark:bg-green-400/10 bg-green-600/10 rounded">
                    <Icon className="h-4 w-4 dark:text-green-400 text-green-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono dark:text-green-400 text-green-700 font-bold">
                      {activity.title}
                    </div>
                    <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 truncate">
                      {activity.description}
                    </div>
                    <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60 mt-1">
                      {getTimeAgo(activity.timestamp)}
                    </div>
                  </div>
                  {activity.amount && (
                    <div className="text-sm font-mono font-bold dark:text-yellow-400 text-yellow-600">
                      +${activity.amount.toFixed(2)}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 dark:text-green-400/30 text-green-700/40 mx-auto mb-3" />
              <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                No recent activity yet. Start creating!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
