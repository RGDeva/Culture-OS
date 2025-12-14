'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Clock } from 'lucide-react'
import { EarningsSummary } from '@/lib/types/payments'

interface EarningsCardProps {
  userId: string
}

export function EarningsCard({ userId }: EarningsCardProps) {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        // Try order-based earnings first
        const orderRes = await fetch(`/api/orders/earnings?userId=${userId}`)
        if (orderRes.ok) {
          const orderData = await orderRes.json()
          setEarnings({
            totalEarned: orderData.totalEarned,
            thisMonth: orderData.thisMonth,
            lastMonth: 0, // TODO: Calculate from orders
            pendingPayouts: 0,
            breakdown: {
              marketplace: orderData.breakdown.products,
              bounties: 0,
              tips: orderData.breakdown.tips,
              projects: 0,
            }
          })
        } else {
          // Fallback to payment-based earnings
          const res = await fetch(`/api/payments/earnings?userId=${userId}`)
          if (res.ok) {
            const data = await res.json()
            setEarnings(data.earnings)
          }
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-green-400/20 w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-green-400/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!earnings) return null

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">EARNINGS_SUMMARY</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total Earned */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <span className="text-xs text-green-400/60 font-mono">TOTAL_EARNED</span>
          </div>
          <div className="text-3xl font-bold text-green-400 font-mono">
            ${earnings.totalEarned.toFixed(2)}
          </div>
        </div>

        {/* This Month */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <span className="text-xs text-green-400/60 font-mono">THIS_MONTH</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400 font-mono">
            ${earnings.thisMonth.toFixed(2)}
          </div>
          {earnings.lastMonth > 0 && (
            <div className="text-xs text-green-400/60 font-mono mt-1">
              Last month: ${earnings.lastMonth.toFixed(2)}
            </div>
          )}
        </div>

        {/* Pending Payouts */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-400" />
            <span className="text-xs text-green-400/60 font-mono">PENDING</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400 font-mono">
            ${earnings.pendingPayouts.toFixed(2)}
          </div>
          <div className="text-xs text-green-400/60 font-mono mt-1">
            In escrow
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-black/30 border border-green-400/20 rounded-lg p-4">
          <div className="text-xs text-green-400/60 font-mono mb-2">BREAKDOWN</div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-green-400/80">Marketplace:</span>
              <span className="text-green-400">${earnings.breakdown.marketplace.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-green-400/80">Bounties:</span>
              <span className="text-green-400">${earnings.breakdown.bounties.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-green-400/80">Tips:</span>
              <span className="text-green-400">${earnings.breakdown.tips.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-green-400/80">Projects:</span>
              <span className="text-green-400">${earnings.breakdown.projects.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
