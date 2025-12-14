'use client'

import { useEffect, useState } from 'react'
import { Music, DollarSign, TrendingUp, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface CatalogEarningsPanelProps {
  userId: string
}

export function CatalogEarningsPanel({ userId }: CatalogEarningsPanelProps) {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch works and balances in parallel with error handling
      const [worksRes, balancesRes] = await Promise.all([
        fetch(`/api/works?userId=${userId}`).catch(() => null),
        fetch(`/api/balances/me?userId=${userId}`).catch(() => null),
      ])

      let worksData = { works: [] }
      let balancesData = { balances: {} }

      // Only parse if requests succeeded
      if (worksRes && worksRes.ok) {
        worksData = await worksRes.json().catch(() => ({ works: [] }))
      }
      
      if (balancesRes && balancesRes.ok) {
        balancesData = await balancesRes.json().catch(() => ({ balances: {} }))
      }

      // Calculate earnings from works
      let masterEarnings = 0
      let publishingEarnings = 0

      if (worksData.works) {
        for (const work of worksData.works) {
          if (work.earnings) {
            for (const earning of work.earnings) {
              if (earning.type === 'MASTER') {
                masterEarnings += earning.amountCents || 0
              } else if (earning.type === 'PUBLISHING') {
                publishingEarnings += earning.amountCents || 0
              }
            }
          }
        }
      }

      setData({
        worksCount: worksData.works?.length || 0,
        masterEarnings,
        publishingEarnings,
        totalEarnings: masterEarnings + publishingEarnings,
        balances: balancesData.balances || {},
      })
    } catch (error) {
      // Silently handle errors - set default empty state
      setData({
        worksCount: 0,
        masterEarnings: 0,
        publishingEarnings: 0,
        totalEarnings: 0,
        balances: {},
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="border-2 dark:border-green-400/50 border-green-600/50 p-6 dark:bg-black bg-white">
        <div className="animate-pulse">
          <div className="h-6 dark:bg-green-400/20 bg-green-600/20 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 dark:bg-green-400/10 bg-green-600/10 rounded"></div>
            <div className="h-4 dark:bg-green-400/10 bg-green-600/10 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  const usdBalance = data?.balances?.USD || { availableCents: 0, pendingCents: 0, totalCents: 0 }

  return (
    <div className="border-2 dark:border-green-400/50 border-green-600/50 p-6 dark:bg-black bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Music className="h-5 w-5 dark:text-green-400 text-green-700" />
        <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
          &gt; MY_CATALOG_&_EARNINGS
        </h2>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Works Count */}
        <div className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
          <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
            WORKS
          </div>
          <div className="text-2xl font-mono font-bold dark:text-green-400 text-green-700">
            {data?.worksCount || 0}
          </div>
        </div>

        {/* Master Earnings */}
        <div className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
          <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
            MASTER
          </div>
          <div className="text-2xl font-mono font-bold dark:text-green-400 text-green-700">
            ${((data?.masterEarnings || 0) / 100).toFixed(0)}
          </div>
        </div>

        {/* Publishing Earnings */}
        <div className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
          <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80 mb-1">
            PUBLISHING
          </div>
          <div className="text-2xl font-mono font-bold dark:text-green-400 text-green-700">
            ${((data?.publishingEarnings || 0) / 100).toFixed(0)}
          </div>
        </div>

        {/* Total Balance */}
        <div className="p-4 border dark:border-cyan-400/50 border-cyan-600/50 dark:bg-cyan-400/10 bg-cyan-600/10">
          <div className="text-xs font-mono dark:text-cyan-400/70 text-cyan-700/80 mb-1">
            BALANCE
          </div>
          <div className="text-2xl font-mono font-bold dark:text-cyan-400 text-cyan-700">
            ${(usdBalance.totalCents / 100).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Balance Breakdown */}
      {usdBalance.totalCents > 0 && (
        <div className="mb-6 p-3 border dark:border-cyan-400/30 border-cyan-600/30 dark:bg-cyan-400/5 bg-cyan-600/5">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 dark:text-cyan-400 text-cyan-700" />
            <span className="text-xs font-mono font-bold dark:text-cyan-400 text-cyan-700">
              BALANCE_BREAKDOWN
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <span className="dark:text-cyan-400/70 text-cyan-700/80">Available:</span>
              <span className="ml-2 dark:text-cyan-400 text-cyan-700 font-bold">
                ${(usdBalance.availableCents / 100).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="dark:text-cyan-400/70 text-cyan-700/80">Pending:</span>
              <span className="ml-2 dark:text-cyan-400 text-cyan-700 font-bold">
                ${(usdBalance.pendingCents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => router.push('/works')}
          variant="outline"
          className="font-mono text-xs dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
        >
          <Music className="h-3 w-3 mr-1" />
          VIEW_WORKS
        </Button>
        <Button
          onClick={() => router.push('/vault')}
          variant="outline"
          className="font-mono text-xs dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10"
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          VIEW_VAULT
        </Button>
      </div>

      {/* Empty State */}
      {data?.worksCount === 0 && (
        <div className="mt-6 p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5 text-center">
          <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80 mb-3">
            No works in your catalog yet.
          </p>
          <Button
            onClick={() => router.push('/vault')}
            size="sm"
            className="font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white"
          >
            LINK_VAULT_ASSETS
          </Button>
        </div>
      )}
    </div>
  )
}
