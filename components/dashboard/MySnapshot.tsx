'use client'

import { useEffect, useState } from 'react'
import { Folder, Users, DollarSign, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getTierColor, getTierBgColor } from '@/lib/xp'

interface MySnapshotProps {
  userId: string
}

interface Metrics {
  openProjects: number
  activeCollabs: number
  earningsThisMonth: number
  xp: number
  tier: string
  nextTierXp: number | null
}

export function MySnapshot({ userId }: MySnapshotProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch(`/api/dashboard/metrics?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setMetrics(data.metrics)
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-green-400/20 w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-green-400/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">MY_SNAPSHOT</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Open Projects */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="h-5 w-5 text-green-400" />
            <span className="text-xs text-green-400/60 font-mono">OPEN_PROJECTS</span>
          </div>
          <div className="text-3xl font-bold text-green-400 font-mono">{metrics.openProjects}</div>
          <div className="mt-2 flex gap-2">
            <Link href="/vault">
              <Button variant="ghost" size="sm" className="text-xs text-green-400 hover:bg-green-400/10 font-mono">
                &gt; VIEW_PROJECTS
              </Button>
            </Link>
            <Link href="/vault/new">
              <Button variant="ghost" size="sm" className="text-xs text-green-400 hover:bg-green-400/10 font-mono">
                &gt; CREATE_PROJECT
              </Button>
            </Link>
          </div>
        </div>

        {/* Active Collabs */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-cyan-400" />
            <span className="text-xs text-green-400/60 font-mono">ACTIVE_COLLABS</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400 font-mono">{metrics.activeCollabs}</div>
          <div className="mt-2">
            <Link href="/bounties">
              <Button variant="ghost" size="sm" className="text-xs text-green-400 hover:bg-green-400/10 font-mono">
                &gt; VIEW_BOUNTIES
              </Button>
            </Link>
          </div>
        </div>

        {/* Earnings This Month */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-yellow-400" />
            <span className="text-xs text-green-400/60 font-mono">EARNINGS_THIS_MONTH</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400 font-mono">
            ${metrics.earningsThisMonth.toFixed(2)}
          </div>
          <div className="text-xs text-green-400/40 font-mono mt-1">
            {metrics.earningsThisMonth === 0 ? 'No earnings yet' : 'From marketplace sales'}
          </div>
        </div>

        {/* XP / Tier */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-green-400" />
            <span className="text-xs text-green-400/60 font-mono">XP / TIER</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-green-400 font-mono">{metrics.xp}</span>
            <span className={`text-sm font-mono px-2 py-0.5 border rounded ${getTierBgColor(metrics.tier as any)}`}>
              {metrics.tier}
            </span>
          </div>
          {metrics.nextTierXp !== null && (
            <div className="text-xs text-green-400/60 font-mono">
              Next tier in +{metrics.nextTierXp} XP
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
