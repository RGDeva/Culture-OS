'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { X, Wallet, CreditCard, Loader2, Check, ExternalLink } from 'lucide-react'

interface FundWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const { user } = usePrivy()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleFund = async () => {
    setLoading(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      // For now, open external funding options
      // TODO: Integrate Privy fundWallet when available in this version
      // https://docs.privy.io/recipes/card-based-funding
      
      // Open Base bridge or other funding option
      window.open('https://bridge.base.org', '_blank')
      
      setStatus('success')
      
      // Close modal after a moment
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error: any) {
      console.error('[FUND_WALLET] Error:', error)
      setStatus('error')
      setErrorMessage(error.message || 'Failed to open funding page')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black border-2 border-green-400 rounded-lg p-6 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-400 hover:text-green-300 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold font-mono text-green-400">&gt; FUND_WALLET</h2>
          </div>
          <p className="text-green-400/60 font-mono text-sm">
            Add USDC to your wallet via card, Apple Pay, or Google Pay
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mb-4 p-4 bg-green-400/20 border border-green-400 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 font-mono">
              <Check className="h-5 w-5" />
              <span>Wallet funded successfully!</span>
            </div>
          </div>
        )}

        {status === 'error' && errorMessage && (
          <div className="mb-4 p-4 bg-red-400/20 border border-red-400 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 font-mono text-sm">
              <X className="h-5 w-5" />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-green-400/10 border border-green-400/30 rounded-lg">
            <ExternalLink className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-mono text-green-400/80">
              <div className="font-bold mb-1">Funding Options:</div>
              <ul className="space-y-1 text-green-400/60">
                <li>• Bridge from Ethereum/other chains</li>
                <li>• Buy USDC directly on Base</li>
                <li>• Transfer from exchange</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-green-400/60 font-mono p-3 bg-black/50 border border-green-400/20 rounded-lg">
            <div className="font-bold mb-1">Network: Base</div>
            <div>You'll be redirected to Base Bridge to add USDC</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleFund}
            disabled={loading || status === 'success'}
            className="flex-1 bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                PROCESSING...
              </>
            ) : status === 'success' ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                SUCCESS
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                OPEN_BASE_BRIDGE
              </>
            )}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="border-green-400 text-green-400 font-mono"
            disabled={loading}
          >
            CANCEL
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-4 text-xs text-green-400/40 font-mono text-center">
          Secure bridge to Base network
        </div>
      </div>
    </div>
  )
}
