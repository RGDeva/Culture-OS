'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DollarSign, CheckCircle, Heart } from 'lucide-react'

/**
 * Public-facing tip widget
 * Embeddable via iframe or shareable link
 * Route: /w/tip/[userId]
 */

interface Creator {
  id: string
  displayName: string
  bio?: string
  roles: string[]
  profileImage?: string
}

export default function TipCreatorWidget() {
  const params = useParams()
  const userId = params.userId as string
  
  const [creator, setCreator] = useState<Creator | null>(null)
  const [amount, setAmount] = useState('5')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Fetch creator profile
    // For now, mock data
    setCreator({
      id: userId,
      displayName: 'ARTIST_NAME',
      bio: 'Independent artist creating dark R&B and experimental sounds',
      roles: ['ARTIST', 'PRODUCER'],
    })
  }, [userId])

  const handleTip = async () => {
    setError(null)
    setLoading(true)

    try {
      const amountUsd = parseFloat(amount)
      
      if (isNaN(amountUsd) || amountUsd < 1) {
        setError('Minimum tip is $1')
        setLoading(false)
        return
      }

      // TODO: Implement actual payment flow
      // This would call /api/payments/tip
      console.log('Tipping creator:', userId, 'with', amountUsd)

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Failed to process tip')
    } finally {
      setLoading(false)
    }
  }

  if (!creator) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-4">
        <div className="animate-spin h-8 w-8 border-2 dark:border-green-400 border-gray-400 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-black bg-white dark:text-green-400 text-gray-900 font-mono p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-2 dark:text-green-400 text-gray-900">
            &gt; TIP_CREATOR
          </h1>
          <p className="text-sm dark:text-green-400/60 text-gray-600">
            Support independent creators
          </p>
        </div>

        {/* Creator Card */}
        <div className="border-2 dark:border-green-400/30 border-gray-300 p-6 mb-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full dark:bg-green-400/20 bg-gray-200 flex items-center justify-center">
            <Heart className="h-10 w-10 dark:text-green-400 text-gray-600" />
          </div>
          
          <h2 className="text-xl font-bold mb-2 dark:text-green-400 text-gray-900">
            {creator.displayName}
          </h2>
          
          <div className="flex gap-2 justify-center mb-3">
            {creator.roles.map(role => (
              <span
                key={role}
                className="text-xs px-2 py-1 border dark:border-green-400/30 border-gray-300 dark:text-green-400/60 text-gray-600"
              >
                {role}
              </span>
            ))}
          </div>

          {creator.bio && (
            <p className="text-sm dark:text-green-400/60 text-gray-600">
              {creator.bio}
            </p>
          )}
        </div>

        {!success ? (
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-green-400 text-gray-900">
              &gt; SEND_TIP
            </h3>

            {error && (
              <div className="mb-4 p-3 border-2 border-red-400/50 dark:bg-red-400/10 bg-red-50">
                <p className="text-red-400 text-sm font-mono">{error}</p>
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700">
                AMOUNT (USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 dark:text-green-400/50 text-gray-500" />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="flex gap-2 mb-4">
              {['5', '10', '25', '50'].map((quickAmount) => (
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

            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm mb-2 dark:text-green-400/70 text-gray-700">
                MESSAGE (OPTIONAL)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={200}
                rows={3}
                placeholder="Leave a message of support..."
                className="w-full dark:bg-black/50 bg-gray-50 border-2 dark:border-green-400/50 border-gray-300 dark:text-green-400 text-gray-900 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 dark:placeholder:text-green-400/30 placeholder:text-gray-400"
              />
            </div>

            <Button
              onClick={handleTip}
              disabled={loading}
              className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
            >
              {loading ? 'PROCESSING...' : '> SEND_TIP'}
            </Button>

            <p className="text-xs dark:text-green-400/40 text-gray-500 mt-4 text-center">
              Powered by NoCulture OS
            </p>
          </div>
        ) : (
          <div className="border-2 border-green-400 dark:bg-green-400/10 bg-green-50 p-6">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-bold text-green-400">
                &gt; TIP_SENT
              </h3>
            </div>
            <p className="text-sm dark:text-green-400/80 text-green-700 font-mono mb-3">
              Thank you for supporting {creator.displayName}!
            </p>
            {message && (
              <div className="p-3 dark:bg-black/50 bg-white border-2 dark:border-green-400/30 border-gray-300">
                <p className="text-xs dark:text-green-400/60 text-gray-600 mb-1">Your message:</p>
                <p className="text-sm dark:text-green-400 text-gray-900">{message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
