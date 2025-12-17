'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ChevronDown, 
  ChevronUp,
  Wallet,
  ArrowUpRight,
  Target,
  Music,
  ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EarningsSummaryProps {
  userId: string
}

interface EarningsData {
  totalEarnings: number
  availableBalance: number
  pendingBalance: number
  lastMonthEarnings: number
  thisMonthEarnings: number
  bountyEarnings: number
  salesEarnings: number
  streamingEarnings: number
}

export function EarningsSummary({ userId }: EarningsSummaryProps) {
  const router = useRouter()
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    lastMonthEarnings: 0,
    thisMonthEarnings: 0,
    bountyEarnings: 0,
    salesEarnings: 0,
    streamingEarnings: 0
  })
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    loadEarnings()
  }, [userId])

  const loadEarnings = async () => {
    try {
      setLoading(true)
      
      // Fetch earnings data
      const [earningsRes, bountyRes] = await Promise.all([
        fetch(`/api/earnings?userId=${userId}`),
        fetch(`/api/bounties/me?userId=${userId}`)
      ])

      let totalEarnings = 0
      let availableBalance = 0
      let pendingBalance = 0
      let salesEarnings = 0

      if (earningsRes.ok) {
        const data = await earningsRes.json()
        totalEarnings = data.totalEarnings || 0
        availableBalance = data.availableBalance || 0
        pendingBalance = data.pendingBalance || 0
        salesEarnings = data.salesEarnings || 0
      }

      let bountyEarnings = 0
      if (bountyRes.ok) {
        const data = await bountyRes.json()
        bountyEarnings = (data.summary?.earnings?.availableCents || 0) / 100
      }

      // Calculate month-over-month (simulated for now)
      const thisMonthEarnings = totalEarnings * 0.3 // Simulated
      const lastMonthEarnings = totalEarnings * 0.25 // Simulated

      setEarnings({
        totalEarnings,
        availableBalance,
        pendingBalance,
        lastMonthEarnings,
        thisMonthEarnings,
        bountyEarnings,
        salesEarnings,
        streamingEarnings: totalEarnings - salesEarnings - bountyEarnings
      })
    } catch (error) {
      console.error('[EARNINGS_SUMMARY] Error loading earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const monthlyChange = earnings.lastMonthEarnings > 0 
    ? ((earnings.thisMonthEarnings - earnings.lastMonthEarnings) / earnings.lastMonthEarnings * 100)
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 dark:bg-green-400/20 bg-green-600/20 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 dark:bg-green-400/10 bg-green-600/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <DollarSign className="h-5 w-5 dark:text-green-400 text-green-700" />
          <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
            &gt; EARNINGS_OVERVIEW
          </h2>
          {isCollapsed ? (
            <ChevronDown className="h-4 w-4 dark:text-green-400 text-green-700" />
          ) : (
            <ChevronUp className="h-4 w-4 dark:text-green-400 text-green-700" />
          )}
        </button>
        {!isCollapsed && (
          <Button
            onClick={() => router.push('/earnings')}
            variant="outline"
            size="sm"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
          >
            <ArrowUpRight className="h-3 w-3 mr-1" />
            VIEW_DETAILS
          </Button>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Earnings */}
            <div className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 dark:text-green-400 text-green-700" />
                <span className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                  TOTAL_EARNINGS
                </span>
              </div>
              <div className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                {formatCurrency(earnings.totalEarnings)}
              </div>
            </div>

            {/* Available Balance */}
            <div className="p-4 border dark:border-cyan-400/30 border-cyan-600/30 dark:bg-cyan-400/5 bg-cyan-600/5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 dark:text-cyan-400 text-cyan-700" />
                <span className="text-xs font-mono dark:text-cyan-400/60 text-cyan-700/70">
                  AVAILABLE
                </span>
              </div>
              <div className="text-2xl font-bold font-mono dark:text-cyan-400 text-cyan-700">
                {formatCurrency(earnings.availableBalance)}
              </div>
            </div>

            {/* Pending Balance */}
            <div className="p-4 border dark:border-yellow-400/30 border-yellow-600/30 dark:bg-yellow-400/5 bg-yellow-600/5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 dark:text-yellow-400 text-yellow-700" />
                <span className="text-xs font-mono dark:text-yellow-400/60 text-yellow-700/70">
                  PENDING
                </span>
              </div>
              <div className="text-2xl font-bold font-mono dark:text-yellow-400 text-yellow-700">
                {formatCurrency(earnings.pendingBalance)}
              </div>
            </div>

            {/* This Month */}
            <div className="p-4 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
              <div className="flex items-center gap-2 mb-2">
                {monthlyChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 dark:text-green-400 text-green-700" />
                ) : (
                  <TrendingDown className="h-4 w-4 dark:text-red-400 text-red-700" />
                )}
                <span className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                  THIS_MONTH
                </span>
              </div>
              <div className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                {formatCurrency(earnings.thisMonthEarnings)}
              </div>
              <div className={`text-xs font-mono mt-1 ${
                monthlyChange >= 0 
                  ? 'dark:text-green-400 text-green-700' 
                  : 'dark:text-red-400 text-red-700'
              }`}>
                {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}% vs last month
              </div>
            </div>
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bounty Earnings */}
            <div className="p-4 border dark:border-green-400/20 border-green-600/20 flex items-center gap-4">
              <div className="p-3 dark:bg-purple-400/10 bg-purple-600/10 rounded-full">
                <Target className="h-5 w-5 dark:text-purple-400 text-purple-700" />
              </div>
              <div>
                <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                  BOUNTY_EARNINGS
                </div>
                <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                  {formatCurrency(earnings.bountyEarnings)}
                </div>
              </div>
            </div>

            {/* Sales Earnings */}
            <div className="p-4 border dark:border-green-400/20 border-green-600/20 flex items-center gap-4">
              <div className="p-3 dark:bg-cyan-400/10 bg-cyan-600/10 rounded-full">
                <ShoppingBag className="h-5 w-5 dark:text-cyan-400 text-cyan-700" />
              </div>
              <div>
                <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                  SALES_EARNINGS
                </div>
                <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                  {formatCurrency(earnings.salesEarnings)}
                </div>
              </div>
            </div>

            {/* Streaming Earnings */}
            <div className="p-4 border dark:border-green-400/20 border-green-600/20 flex items-center gap-4">
              <div className="p-3 dark:bg-pink-400/10 bg-pink-600/10 rounded-full">
                <Music className="h-5 w-5 dark:text-pink-400 text-pink-700" />
              </div>
              <div>
                <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mb-1">
                  STREAMING_EARNINGS
                </div>
                <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                  {formatCurrency(earnings.streamingEarnings)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => router.push('/earnings')}
              className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono text-xs"
            >
              <Wallet className="h-3 w-3 mr-1" />
              WITHDRAW_FUNDS
            </Button>
            <Button
              onClick={() => router.push('/bounties')}
              variant="outline"
              className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
            >
              <Target className="h-3 w-3 mr-1" />
              EARN_MORE
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
