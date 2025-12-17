'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useEffect, useState } from 'react'
import { ArrowLeft, DollarSign, TrendingUp, Wallet, Target } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EarningsCard } from '@/components/payments/EarningsCard'
import { PaymentHistory } from '@/components/payments/PaymentHistory'
import dynamic from 'next/dynamic'

const FundWalletModal = dynamic(() => import('@/components/payments/FundWalletModal').then(mod => ({ default: mod.FundWalletModal })), {
  ssr: false
})

export default function EarningsPage() {
  const privyHook = usePrivy()
  const { authenticated, login, user } = privyHook || {}
  const [syncing, setSyncing] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [bountyEarnings, setBountyEarnings] = useState<any>(null)
  const [loadingBounties, setLoadingBounties] = useState(true)

  useEffect(() => {
    if (user?.id) {
      loadBountyEarnings()
    }
  }, [user?.id])

  const loadBountyEarnings = async () => {
    if (!user?.id) return
    try {
      setLoadingBounties(true)
      const response = await fetch(`/api/bounties/me?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setBountyEarnings(data.summary?.earnings || null)
      }
    } catch (error) {
      console.error('[EARNINGS] Error loading bounty earnings:', error)
    } finally {
      setLoadingBounties(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <DollarSign className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl mb-4">&gt; EARNINGS_CENTER</h1>
          <p className="text-green-400/60 mb-6">Login to view your earnings, payouts, and Recoupable data</p>
          <Button
            onClick={() => login && login()}
            className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
          >
            LOGIN
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">&gt; EARNINGS / VAULTS</h1>
            <p className="text-green-400/60">Payouts, Recoupable data, and future fan-capital tools</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-green-400 text-green-400 font-mono">
              <ArrowLeft className="mr-2 h-4 w-4" /> HOME
            </Button>
          </Link>
        </div>

        {/* Earnings Card */}
        {user?.id && (
          <div className="mb-8">
            <EarningsCard userId={user.id} />
          </div>
        )}

        {/* Payment History */}
        {user?.id && (
          <div className="mb-8">
            <PaymentHistory userId={user.id} limit={20} />
          </div>
        )}

        {/* Bounties Earnings Section */}
        <div className="border-2 border-green-400 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-green-400" />
              <h2 className="text-xl">&gt; BOUNTY_EARNINGS</h2>
            </div>
            <Link href="/bounties">
              <Button 
                variant="outline"
                className="border-green-400 text-green-400 font-mono"
              >
                VIEW_BOUNTIES
              </Button>
            </Link>
          </div>
          
          {loadingBounties ? (
            <div className="text-green-400/60 text-sm">Loading bounty earnings...</div>
          ) : bountyEarnings ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border border-green-400/30 p-4 bg-green-400/5">
                <div className="text-xs text-green-400/60 mb-1">TOTAL_EARNED</div>
                <div className="text-2xl font-bold text-green-400">
                  ${((bountyEarnings.totalCents || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div className="border border-yellow-400/30 p-4 bg-yellow-400/5">
                <div className="text-xs text-yellow-400/60 mb-1">PENDING</div>
                <div className="text-2xl font-bold text-yellow-400">
                  ${((bountyEarnings.pendingCents || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div className="border border-cyan-400/30 p-4 bg-cyan-400/5">
                <div className="text-xs text-cyan-400/60 mb-1">AVAILABLE</div>
                <div className="text-2xl font-bold text-cyan-400">
                  ${((bountyEarnings.availableCents || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div className="border border-green-400/30 p-4 bg-green-400/5">
                <div className="text-xs text-green-400/60 mb-1">PAID_OUT</div>
                <div className="text-2xl font-bold text-green-400">
                  ${((bountyEarnings.paidCents || 0) / 100).toFixed(2)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border border-green-400/30 bg-green-400/5">
              <Target className="h-12 w-12 text-green-400/30 mx-auto mb-3" />
              <p className="text-green-400/60 mb-4">No bounty earnings yet</p>
              <Link href="/bounties">
                <Button className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold">
                  EXPLORE_BOUNTIES
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Wallet Actions */}
        <div className="border-2 border-green-400 p-6 mb-8">
          <h2 className="text-xl mb-4">&gt; WALLET_ACTIONS</h2>
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowFundModal(true)}
              className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
            >
              <Wallet className="mr-2 h-4 w-4" />
              FUND_WALLET
            </Button>
            <Link href="/profile">
              <Button 
                variant="outline"
                className="border-green-400 text-green-400 font-mono"
              >
                CONNECT_RECOUPABLE
              </Button>
            </Link>
          </div>
        </div>

        {/* Fund Wallet Modal */}
        {showFundModal && (
          <FundWalletModal
            isOpen={showFundModal}
            onClose={() => setShowFundModal(false)}
          />
        )}

        {/* Future Features Notice */}
        <div className="mt-8 border-2 border-cyan-400/30 p-6 bg-cyan-400/5">
          <h3 className="text-lg mb-2 text-cyan-400">&gt; COMING_SOON</h3>
          <ul className="space-y-2 text-green-400/60 text-sm">
            <li>• Advanced royalty tracking & splits</li>
            <li>• Fan capital tools & crowdfunding</li>
            <li>• Automated payout scheduling</li>
            <li>• Multi-wallet support</li>
            <li>• Tax reporting & analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
