"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditCard, Wallet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useToast } from '@/components/ui/use-toast'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    id: string
    title: string
    priceUSDC: number
    type: string
  }
  onSuccess: (data: any) => void
}

type PaymentMethod = 'card' | 'wallet' | null
type PaymentStatus = 'idle' | 'processing' | 'success' | 'error' | 'insufficient_funds'

export function PaymentModal({ isOpen, onClose, product, onSuccess }: PaymentModalProps) {
  const privyHook = usePrivy()
  const { user, login } = privyHook || { user: null, login: () => {} }
  const walletsHook = useWallets()
  const { wallets } = walletsHook || { wallets: [] }
  const { toast } = useToast()
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [status, setStatus] = useState<PaymentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handlePayment = async (method: PaymentMethod) => {
    if (!user) {
      login()
      return
    }

    setPaymentMethod(method)
    setStatus('processing')
    setErrorMessage('')

    try {
      if (method === 'wallet') {
        // Use Privy wallet or connected wallet
        const wallet = wallets[0] // Get primary wallet
        const walletAddress = wallet?.address || user.wallet?.address || 'embedded'

        console.log('[PAYMENT] Processing wallet payment:', {
          wallet: walletAddress,
          product: product.id,
          price: product.priceUSDC
        })

        // Simulate wallet signature
        console.log('[PAYMENT] Simulating wallet signature...')
        await new Promise(resolve => setTimeout(resolve, 1500))
        console.log('[PAYMENT] Wallet signature complete, calling API...')

        // Process payment (using sponsored endpoint for now)
        const response = await fetch('/api/x402/checkout-sponsored', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            userId: user.id || user.email || 'anonymous',
            paymentMethod: 'wallet'
          }),
        })

        console.log('[PAYMENT] API response status:', response.status, response.statusText)
        const data = await response.json()
        console.log('[PAYMENT] API response data:', data)

        if (!response.ok) {
          console.error('[PAYMENT] API returned error:', data)
          throw new Error(data.message || data.error || 'Payment failed')
        }

        // Success!
        console.log('[PAYMENT] Payment successful! Setting success status...')
        setStatus('success')
        setTimeout(() => {
          console.log('[PAYMENT] Calling onSuccess callback...')
          onSuccess(data)
          onClose()
        }, 1500)

      } else if (method === 'card') {
        // Card payment flow (buy crypto with card, then pay)
        console.log('[PAYMENT] Processing card payment')
        
        toast({
          title: 'CARD_PAYMENT',
          description: 'Processing payment...',
          className: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
        })

        // Simulate card to crypto conversion
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Process payment
        const response = await fetch('/api/x402/checkout-sponsored', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            userId: user.id || user.email || 'anonymous',
            paymentMethod: 'card'
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || data.error || 'Card payment failed')
        }

        setStatus('success')
        setTimeout(() => {
          onSuccess(data)
          onClose()
        }, 1500)
      }
    } catch (error: any) {
      console.error('[PAYMENT] Error details:', {
        message: error?.message,
        stack: error?.stack,
        error: error,
        name: error?.name,
        response: error?.response
      })
      
      const errorMsg = error?.message || error?.toString() || 'Payment failed. Please try again.'
      setStatus('error')
      setErrorMessage(errorMsg)
      
      toast({
        title: 'PAYMENT_FAILED',
        description: errorMsg,
        variant: 'destructive',
        className: 'bg-red-500/20 border-red-500/50 text-red-400'
      })
    }
  }

  const handleFundWallet = () => {
    // Open on-ramp to add funds
    toast({
      title: 'ADD_FUNDS',
      description: 'Opening wallet funding options...',
      className: 'bg-blue-500/20 border-blue-500/50 text-blue-400'
    })
    // In production, open Thirdweb on-ramp or similar
  }

  const resetModal = () => {
    setPaymentMethod(null)
    setStatus('idle')
    setErrorMessage('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetModal()
        onClose()
      }
    }}>
      <DialogContent className="bg-black border-green-500/50 text-green-400 font-mono max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-green-400">
            PAY_TO_PLAY
          </DialogTitle>
          <DialogDescription className="text-green-300/70">
            {product.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Display */}
          <div className="text-center p-4 border border-green-500/30 bg-green-500/5 rounded">
            <div className="text-sm text-green-400/70 mb-1">PRICE</div>
            <div className="text-3xl font-bold text-green-400">
              ${product.priceUSDC.toFixed(2)}
            </div>
            <div className="text-xs text-green-400/50 mt-1">USDC on Base Sepolia</div>
          </div>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/50 rounded">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-400">PAYMENT_SUCCESSFUL</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-500/20 border border-red-500/50 rounded">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              <div>
                <div className="text-red-400 font-bold">PAYMENT_FAILED</div>
                <div className="text-red-400/70 text-sm mt-1">{errorMessage}</div>
              </div>
            </div>
          )}

          {status === 'insufficient_funds' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-yellow-400 font-bold">INSUFFICIENT_FUNDS</div>
                  <div className="text-yellow-400/70 text-sm mt-1">{errorMessage}</div>
                </div>
              </div>
              <Button
                onClick={handleFundWallet}
                className="w-full bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30"
              >
                ADD_FUNDS_TO_WALLET
              </Button>
            </div>
          )}

          {/* Payment Methods */}
          {status === 'idle' && (
            <div className="space-y-3">
              <div className="text-sm text-green-400/70 mb-3">
                SELECT_PAYMENT_METHOD
              </div>

              {/* Wallet Payment */}
              <Button
                onClick={() => handlePayment('wallet')}
                className="w-full bg-green-500/10 border-2 border-green-500/50 text-green-400 hover:bg-green-500/20 hover:border-green-500 h-auto py-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <Wallet className="w-6 h-6" />
                  <div className="text-left flex-1">
                    <div className="font-bold">PAY_WITH_WALLET</div>
                    <div className="text-xs text-green-400/70">
                      {user?.wallet?.address ? 
                        `Connected: ${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` :
                        'Privy or Coinbase Wallet'
                      }
                    </div>
                  </div>
                </div>
              </Button>

              {/* Card Payment */}
              <Button
                onClick={() => handlePayment('card')}
                className="w-full bg-blue-500/10 border-2 border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500 h-auto py-4"
              >
                <div className="flex items-center gap-3 w-full">
                  <CreditCard className="w-6 h-6" />
                  <div className="text-left flex-1">
                    <div className="font-bold">PAY_WITH_CARD</div>
                    <div className="text-xs text-blue-400/70">
                      Buy crypto & pay instantly
                    </div>
                  </div>
                </div>
              </Button>

              <div className="text-xs text-green-400/50 text-center pt-2">
                {!user ? 'Login required to proceed' : 'Secure payment powered by Thirdweb'}
              </div>
            </div>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 animate-spin text-green-400" />
              <div className="text-center">
                <div className="text-green-400 font-bold">PROCESSING_PAYMENT...</div>
                <div className="text-green-400/70 text-sm mt-1">
                  {paymentMethod === 'wallet' ? 'Check your wallet for signature request' : 'Please wait...'}
                </div>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {status !== 'processing' && status !== 'success' && (
            <Button
              onClick={() => {
                resetModal()
                onClose()
              }}
              variant="outline"
              className="w-full border-green-500/30 text-green-400/70 hover:bg-green-500/10"
            >
              CANCEL
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
