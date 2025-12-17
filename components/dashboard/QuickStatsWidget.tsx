'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react'

interface QuickStatsWidgetProps {
  userId: string
}

interface StatItem {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  prefix?: string
  suffix?: string
}

export function QuickStatsWidget({ userId }: QuickStatsWidgetProps) {
  const [stats, setStats] = useState<StatItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    try {
      setLoading(true)
      const statsData: StatItem[] = []

      // Load earnings stats
      const earningsRes = await fetch(`/api/earnings/summary?userId=${userId}`).catch(() => null)
      if (earningsRes?.ok) {
        const data = await earningsRes.json()
        statsData.push({
          label: 'MONTHLY_EARNINGS',
          value: (data.thisMonth || 0) / 100,
          change: data.percentChange || 0,
          trend: data.percentChange > 0 ? 'up' : data.percentChange < 0 ? 'down' : 'neutral',
          prefix: '$'
        })
      }

      // Load vault stats
      const vaultRes = await fetch(`/api/vault/stats?userId=${userId}`).catch(() => null)
      if (vaultRes?.ok) {
        const data = await vaultRes.json()
        statsData.push({
          label: 'TOTAL_ASSETS',
          value: data.totalAssets || 0,
          change: data.newThisWeek || 0,
          trend: data.newThisWeek > 0 ? 'up' : 'neutral',
          suffix: ' assets'
        })
      }

      // Load marketplace stats
      const marketplaceRes = await fetch(`/api/marketplace/stats?userId=${userId}`).catch(() => null)
      if (marketplaceRes?.ok) {
        const data = await marketplaceRes.json()
        statsData.push({
          label: 'TOTAL_SALES',
          value: data.totalSales || 0,
          change: data.salesThisWeek || 0,
          trend: data.salesThisWeek > 0 ? 'up' : 'neutral',
          suffix: ' sales'
        })
      }

      // Load bounty stats
      const bountiesRes = await fetch(`/api/bounties/me?userId=${userId}`).catch(() => null)
      if (bountiesRes?.ok) {
        const data = await bountiesRes.json()
        statsData.push({
          label: 'BOUNTY_EARNINGS',
          value: (data.summary?.earnings?.availableCents || 0) / 100,
          change: (data.summary?.earnings?.pendingCents || 0) / 100,
          trend: data.summary?.earnings?.pendingCents > 0 ? 'up' : 'neutral',
          prefix: '$'
        })
      }

      setStats(statsData)
    } catch (error) {
      console.error('[QUICK_STATS] Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-400" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-400" />
      default:
        return <Minus className="h-3 w-3 dark:text-green-400/50 text-green-700/50" />
    }
  }

  if (loading) {
    return (
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <div className="animate-pulse space-y-3">
          <div className="h-6 dark:bg-green-400/20 bg-green-600/20 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 dark:bg-green-400/10 bg-green-600/10 rounded"></div>
            ))}
          </div>
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
          <BarChart3 className="h-5 w-5 dark:text-green-400 text-green-700" />
          <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
            &gt; QUICK_STATS
          </h2>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 dark:text-green-400 text-green-700" />
          ) : (
            <ChevronUp className="h-4 w-4 dark:text-green-400 text-green-700" />
          )}
        </button>
      </div>

      {/* Stats Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 border dark:border-green-400/20 border-green-600/30 dark:bg-green-400/5 bg-green-600/5"
            >
              <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
                {stat.label}
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-xl font-mono font-bold dark:text-green-400 text-green-700">
                  {stat.prefix}{stat.value.toFixed(stat.prefix === '$' ? 2 : 0)}{stat.suffix}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono">
                {getTrendIcon(stat.trend)}
                <span className={
                  stat.trend === 'up' 
                    ? 'text-green-400' 
                    : stat.trend === 'down' 
                    ? 'text-red-400' 
                    : 'dark:text-green-400/50 text-green-700/50'
                }>
                  {stat.change > 0 ? '+' : ''}{stat.change.toFixed(stat.prefix === '$' ? 2 : 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
