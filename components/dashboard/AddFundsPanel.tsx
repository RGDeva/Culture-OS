'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DollarSign, X, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

interface PaymentInstructions {
  method: string
  recipientId: string
  amount: string
  memo?: string
  redirectUrl?: string
}

interface OnrampSession {
  id: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED'
  amountUsd: number
  paymentInstructions?: PaymentInstructions
  createdAt: string
}

export function AddFundsPanel() {
  const { user, getAccessToken } = usePrivy()
  const [amount, setAmount] = useState('50')
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [session, setSession] = useState<OnrampSession | null>(null)
  const [polling, setPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Poll session status
  useEffect(() => {
    if (!session || !polling || session.status !== 'PENDING') {
      return
    }

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/zkp2p/onramp/${session.id}`)
        const data = await res.json()

        if (data.success) {
          if (data.status === 'COMPLETED') {
            setSession({ ...session, status: 'COMPLETED' })
            setPolling(false)
          } else if (data.status === 'FAILED' || data.status === 'EXPIRED') {
            setSession({ ...session, status: data.status })
            setPolling(false)
          }
        }
      } catch (error) {
        console.error('Error polling session status:', error)
      }
    }, 12000) // Poll every 12 seconds

    return () => clearInterval(pollInterval)
  }, [session, polling])

  const handleStartOnramp = async () => {
    setError(null)
    setLoading(true)

    try {
      const amountUsd = parseFloat(amount)
      
      if (isNaN(amountUsd) || amountUsd < 1 || amountUsd > 5000) {
        setError('Amount must be between $1 and $5000')
        setLoading(false)
        return
      }

      // Get auth token
      const token = await getAccessToken()
      if (!token) {
        setError('Please log in to add funds')
        setLoading(false)
        return
      }

      // Create on-ramp session
      const res = await fetch('/api/zkp2p/onramp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountUsd,
          memo: memo || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create session')
      }

      setSession(data.session)
      setPolling(true)

      // If there's a redirect URL, open it
      if (data.session.paymentInstructions?.redirectUrl) {
        window.open(data.session.paymentInstructions.redirectUrl, '_blank')
      }
    } catch (error: any) {
      console.error('Error starting on-ramp:', error)
      setError(error.message || 'Failed to start on-ramp. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setSession(null)
    setPolling(false)
    setError(null)
    setAmount('50')
    setMemo('')
  }

  if (!user) {
    return null
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
      <h2 className="text-xl font-bold mb-4 dark:text-green-400 text-gray-900 font-mono">
        &gt; ADD_FUNDS
      </h2>

      {!session ? (
        <>
          <p className="dark:text-green-400/60 text-gray-600 text-sm mb-4 font-mono">
            Add funds to your creative wallet (USDC on Base)
          </p>

          {error && (
            <div className="mb-4 p-3 border-2 border-red-400/50 dark:bg-red-400/10 bg-red-50">
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
                AMOUNT (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 dark:text-green-400/50 text-gray-500" />
                <input
                  type="number"
                  min="1"
                  max="5000"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="50"
                />
              </div>
              <p className="text-xs dark:text-green-400/40 text-gray-500 mt-1 font-mono">
                Min: $1 • Max: $5000
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="flex gap-2">
              {['25', '50', '100', '250'].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  className={`flex-1 px-3 py-2 border-2 font-mono text-sm transition-all ${
                    amount === quickAmount
                      ? 'bg-green-400 text-black border-green-400'
                      : 'dark:bg-black/50 dark:text-green-400 dark:border-green-400/30 bg-gray-50 text-gray-700 border-gray-300 hover:border-green-400'
                  }`}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>

            {/* Memo (Optional) */}
            <div>
              <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700 font-mono">
                MEMO (OPTIONAL)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                maxLength={50}
                className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
                placeholder="For project X..."
              />
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartOnramp}
              disabled={loading}
              className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold h-auto py-3"
            >
              {loading ? 'CREATING_SESSION...' : '> START_ONRAMP'}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Session Status */}
          {session.status === 'PENDING' && (
            <div className="p-4 border-2 dark:border-green-400/50 border-gray-300 dark:bg-green-400/5 bg-green-50">
              <div className="flex items-start gap-3 mb-3">
                <div className="animate-spin h-5 w-5 border-2 border-green-400 border-t-transparent rounded-full mt-0.5" />
                <div className="flex-1">
                  <p className="font-mono font-bold dark:text-green-400 text-gray-900 mb-1">
                    &gt; ONRAMP_SESSION_CREATED
                  </p>
                  <p className="text-sm dark:text-green-400/60 text-gray-600 font-mono">
                    WAITING_FOR_PAYMENT_CONFIRMATION...
                  </p>
                </div>
              </div>

              {session.paymentInstructions && (
                <div className="mt-4 p-3 dark:bg-black/50 bg-white border-2 dark:border-green-400/30 border-gray-300">
                  <p className="text-xs dark:text-green-400/70 text-gray-700 font-mono mb-2">
                    PAYMENT_INSTRUCTIONS:
                  </p>
                  <div className="space-y-1 text-sm font-mono">
                    <div className="flex justify-between">
                      <span className="dark:text-green-400/60 text-gray-600">Method:</span>
                      <span className="dark:text-green-400 text-gray-900 uppercase">
                        {session.paymentInstructions.method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-green-400/60 text-gray-600">Recipient:</span>
                      <span className="dark:text-green-400 text-gray-900 font-bold">
                        {session.paymentInstructions.recipientId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="dark:text-green-400/60 text-gray-600">Amount:</span>
                      <span className="dark:text-green-400 text-gray-900 font-bold">
                        ${session.paymentInstructions.amount}
                      </span>
                    </div>
                    {session.paymentInstructions.memo && (
                      <div className="flex justify-between">
                        <span className="dark:text-green-400/60 text-gray-600">Memo:</span>
                        <span className="dark:text-green-400 text-gray-900">
                          {session.paymentInstructions.memo}
                        </span>
                      </div>
                    )}
                  </div>

                  {session.paymentInstructions.redirectUrl && (
                    <a
                      href={session.paymentInstructions.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 flex items-center gap-2 text-sm dark:text-green-400 text-gray-700 hover:underline font-mono"
                    >
                      <ExternalLink className="h-4 w-4" />
                      OPEN_PAYMENT_PAGE
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {session.status === 'COMPLETED' && (
            <div className="p-4 border-2 border-green-400 dark:bg-green-400/10 bg-green-50">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="font-mono font-bold text-green-400 mb-1">
                    &gt; ONRAMP_COMPLETE_FUNDS_AVAILABLE
                  </p>
                  <p className="text-sm dark:text-green-400/80 text-green-700 font-mono">
                    ${session.amountUsd} USDC has been added to your wallet!
                  </p>
                </div>
              </div>
            </div>
          )}

          {(session.status === 'FAILED' || session.status === 'EXPIRED') && (
            <div className="p-4 border-2 border-red-400 dark:bg-red-400/10 bg-red-50">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="font-mono font-bold text-red-400 mb-1">
                    &gt; ONRAMP_FAILED
                  </p>
                  <p className="text-sm dark:text-red-400/80 text-red-700 font-mono">
                    {session.status === 'EXPIRED' 
                      ? 'Session expired. Please try again.'
                      : 'Payment failed. Please try again.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <Button
            onClick={handleClose}
            variant="outline"
            className="w-full dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono"
          >
            <X className="mr-2 h-4 w-4" />
            CLOSE
          </Button>
        </div>
      )}
    </div>
  )
}
