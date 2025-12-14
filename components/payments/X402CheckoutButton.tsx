'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/button'
import { Loader2, Check, X } from 'lucide-react'

interface X402CheckoutButtonProps {
  amountUsd: number
  label: string
  mode: 'PRODUCT' | 'TIP'
  productId?: string
  targetUserId?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export function X402CheckoutButton({
  amountUsd,
  label,
  mode,
  productId,
  targetUserId,
  onSuccess,
  onError,
  className = ''
}: X402CheckoutButtonProps) {
  const { authenticated, login, user } = usePrivy()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleCheckout = async () => {
    // Ensure user is authenticated
    if (!authenticated || !user) {
      login()
      return
    }

    // Validate required fields
    if (mode === 'PRODUCT' && !productId) {
      setErrorMessage('Product ID is required')
      setStatus('error')
      onError?.('Product ID is required')
      return
    }

    if (mode === 'TIP' && !targetUserId) {
      setErrorMessage('Target user ID is required')
      setStatus('error')
      onError?.('Target user ID is required')
      return
    }

    setLoading(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      // Step 1: Create payment session
      const sessionResponse = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode,
          amountUsd,
          productId,
          targetUserId,
          buyerId: user.id,
        }),
      })

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json()
        throw new Error(errorData.error || 'Failed to create payment session')
      }

      const session = await sessionResponse.json()
      console.log('[X402_CHECKOUT] Session created:', session)

      // Step 2: Process x402 payment
      // Following Privy x402 recipe pattern
      const checkoutResponse = await fetch('/api/x402/checkout-real', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: mode === 'PRODUCT' ? productId : undefined,
          orderId: session.orderId,
          userId: user.id,
          amountUsd,
          mode,
        }),
      })

      if (!checkoutResponse.ok) {
        const errorData = await checkoutResponse.json()
        throw new Error(errorData.error || 'Payment failed')
      }

      const result = await checkoutResponse.json()
      console.log('[X402_CHECKOUT] Payment successful:', result)

      // Success!
      setStatus('success')
      onSuccess?.()

      // Reset after 2 seconds
      setTimeout(() => {
        setStatus('idle')
      }, 2000)
    } catch (error: any) {
      console.error('[X402_CHECKOUT] Error:', error)
      setStatus('error')
      setErrorMessage(error.message || 'Payment failed')
      onError?.(error.message || 'Payment failed')

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  // Button content based on status
  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          PROCESSING...
        </>
      )
    }

    if (status === 'success') {
      return (
        <>
          <Check className="mr-2 h-4 w-4" />
          SUCCESS
        </>
      )
    }

    if (status === 'error') {
      return (
        <>
          <X className="mr-2 h-4 w-4" />
          FAILED
        </>
      )
    }

    return label
  }

  // Button color based on status
  const getButtonClass = () => {
    if (status === 'success') {
      return 'bg-green-400 text-black hover:bg-green-300'
    }

    if (status === 'error') {
      return 'bg-red-400 text-black hover:bg-red-300'
    }

    return 'bg-green-400 text-black hover:bg-green-300'
  }
  return (
    <div className="space-y-2">
      <Button
        onClick={handleCheckout}
        disabled={loading || status === 'success'}
        className={`
          ${className}
          dark:bg-green-500/20 bg-green-600/10
          border-2 dark:border-green-500/50 border-green-600/40
          dark:text-green-400 text-green-700
          dark:hover:bg-green-500/30 hover:bg-green-600/20
          dark:hover:border-green-500 hover:border-green-600
          font-mono font-bold tracking-wider
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {getButtonContent()}
      </Button>

      {errorMessage && (
        <div className="text-xs text-red-400 font-mono border border-red-400/30 bg-red-400/10 p-2 rounded">
          {errorMessage}
        </div>
      )}
    </div>
  )
}
