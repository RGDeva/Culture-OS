'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Wallet, ExternalLink, X } from 'lucide-react'
import { getZkp2pTopUpUrl, isZkp2pEnabled } from '@/lib/zkp2p'

export function Zkp2pTopUpButton() {
  const { user } = usePrivy()
  const [showModal, setShowModal] = useState(false)
  
  // Don't render if zkp2p is not enabled
  if (!isZkp2pEnabled()) {
    return null
  }

  const walletAddress = user?.wallet?.address
  const topUpUrl = getZkp2pTopUpUrl(walletAddress)

  const handleOpenModal = () => {
    setShowModal(true)
  }

  const handleOpenTopUp = () => {
    if (topUpUrl) {
      window.open(topUpUrl, '_blank', 'noopener,noreferrer')
      setShowModal(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="outline"
        className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
      >
        <Wallet className="mr-2 h-4 w-4" />
        ADD_BALANCE
      </Button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border-2 border-green-400 bg-black p-6 font-mono text-green-400">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-green-400 hover:text-green-300"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-bold">&gt; ADD_BALANCE</h2>

            {/* Wallet info */}
            <div className="mb-6 border border-green-400/30 p-4">
              <div className="mb-2 text-sm text-green-400/70">YOUR_WALLET</div>
              <div className="break-all text-xs text-green-400">
                {walletAddress || 'No wallet connected'}
              </div>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm text-green-400/80">
              Add balance to your account to unlock beats, kits, services, and more on the marketplace.
            </p>

            {/* Action button */}
            {topUpUrl ? (
              <Button
                onClick={handleOpenTopUp}
                className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                OPEN_TOP_UP_PORTAL
              </Button>
            ) : (
              <div className="w-full border-2 border-green-400/30 bg-green-400/10 p-4 text-center">
                <div className="text-lg font-bold text-green-400">COMING_SOON</div>
                <div className="mt-2 text-xs text-green-400/60">
                  Top-up functionality will be available soon
                </div>
              </div>
            )}

            {/* Info note */}
            <div className="mt-6 border-t border-green-400/20 pt-4 text-xs text-green-400/60">
              <p>
                Secure and instant. Your balance will be available immediately after confirmation.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
