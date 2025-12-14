'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

/**
 * Public-facing project funding widget
 * Embeddable via iframe or shareable link
 * Route: /w/fund/[projectId]
 */

interface Project {
  id: string
  title: string
  description: string
  ownerId: string
  ownerName: string
  goalAmount?: number
  raisedAmount: number
  backersCount: number
}

export default function FundProjectWidget() {
  const params = useParams()
  const projectId = params.projectId as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [amount, setAmount] = useState('25')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // TODO: Fetch project details
    // For now, mock data
    setProject({
      id: projectId,
      title: 'Midnight Dreams EP',
      description: 'Help fund my upcoming EP with 5 tracks of dark R&B',
      ownerId: 'creator_1',
      ownerName: 'ARTIST_NAME',
      goalAmount: 1000,
      raisedAmount: 450,
      backersCount: 12,
    })
  }, [projectId])

  const handleFund = async () => {
    setError(null)
    setLoading(true)

    try {
      const amountUsd = parseFloat(amount)
      
      if (isNaN(amountUsd) || amountUsd < 1) {
        setError('Minimum amount is $1')
        setLoading(false)
        return
      }

      // TODO: Implement actual payment flow
      // This would call /api/payments/fund-project
      console.log('Funding project:', projectId, 'with', amountUsd)

      // Simulate success
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (error: any) {
      setError(error.message || 'Failed to process payment')
    } finally {
      setLoading(false)
    }
  }

  if (!project) {
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
            &gt; FUND_PROJECT
          </h1>
          <p className="text-sm dark:text-green-400/60 text-gray-600">
            Support creative work on NoCulture OS
          </p>
        </div>

        {/* Project Card */}
        <div className="border-2 dark:border-green-400/30 border-gray-300 p-6 mb-6">
          <h2 className="text-xl font-bold mb-2 dark:text-green-400 text-gray-900">
            {project.title}
          </h2>
          <p className="text-sm dark:text-green-400/60 text-gray-600 mb-4">
            by {project.ownerName}
          </p>
          <p className="text-sm mb-4 dark:text-green-400/80 text-gray-700">
            {project.description}
          </p>

          {/* Progress */}
          {project.goalAmount && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="dark:text-green-400/60 text-gray-600">Progress</span>
                <span className="dark:text-green-400 text-gray-900 font-bold">
                  ${project.raisedAmount} / ${project.goalAmount}
                </span>
              </div>
              <div className="h-2 dark:bg-black bg-gray-200 border-2 dark:border-green-400/30 border-gray-300">
                <div
                  className="h-full dark:bg-green-400 bg-gray-700 transition-all"
                  style={{ width: `${(project.raisedAmount / project.goalAmount) * 100}%` }}
                />
              </div>
              <p className="text-xs dark:text-green-400/40 text-gray-500 mt-2">
                {project.backersCount} backers
              </p>
            </div>
          )}
        </div>

        {!success ? (
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
            <h3 className="text-lg font-bold mb-4 dark:text-green-400 text-gray-900">
              &gt; CONTRIBUTE
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
              {['10', '25', '50', '100'].map((quickAmount) => (
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

            <Button
              onClick={handleFund}
              disabled={loading}
              className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
            >
              {loading ? 'PROCESSING...' : '> FUND_PROJECT'}
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
                &gt; FUNDING_COMPLETE
              </h3>
            </div>
            <p className="text-sm dark:text-green-400/80 text-green-700 font-mono">
              Thank you for supporting {project.ownerName}!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
