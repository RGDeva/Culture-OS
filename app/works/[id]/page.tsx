'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WorkDetails } from '@/components/works/WorkDetails'
import { SplitEditor } from '@/components/works/SplitEditor'
import { ArrowLeft, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [work, setWork] = useState<any>(null)
  const [earningsSummary, setEarningsSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWork()
  }, [id])

  const fetchWork = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/works/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch work')
      }

      const data = await response.json()
      setWork(data.work)
      setEarningsSummary(data.earningsSummary)
    } catch (err: any) {
      console.error('[WORK] Error fetching:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateWork = async (updates: any) => {
    try {
      const response = await fetch(`/api/works/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update work')
      }

      const data = await response.json()
      setWork(data.work)
    } catch (err: any) {
      console.error('[WORK] Error updating:', err)
      alert('Failed to update work: ' + err.message)
    }
  }

  const handleSaveSplits = async (data: any) => {
    try {
      const method = work.splitSheet ? 'PATCH' : 'POST'
      const response = await fetch(`/api/splits/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save splits')
      }

      // Refresh work data
      await fetchWork()
    } catch (err: any) {
      console.error('[SPLITS] Error saving:', err)
      alert('Failed to save splits: ' + err.message)
    }
  }

  const handleLockSplits = async () => {
    try {
      const response = await fetch(`/api/splits/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locked: true }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to lock split sheet')
      }

      // Refresh work data
      await fetchWork()
    } catch (err: any) {
      console.error('[SPLITS] Error locking:', err)
      alert('Failed to lock split sheet: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse font-mono text-xl dark:text-green-400 text-green-700">
            LOADING_WORK...
          </div>
        </div>
      </div>
    )
  }

  if (error || !work) {
    return (
      <div className="min-h-screen dark:bg-black bg-white flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold font-mono dark:text-red-400 text-red-700 mb-4">
            ERROR
          </h2>
          <p className="font-mono text-sm dark:text-green-400/70 text-green-700/80 mb-6">
            {error || 'Work not found'}
          </p>
          <Button
            onClick={() => router.back()}
            className="font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            GO_BACK
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-black bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="font-mono dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK
          </Button>
        </div>

        {/* Earnings Summary */}
        {earningsSummary && earningsSummary.totalCents > 0 && (
          <div className="mb-6 p-4 border-2 dark:border-green-400 border-green-600 dark:bg-green-400/5 bg-green-600/5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 dark:text-green-400 text-green-700" />
              <h3 className="font-mono font-bold dark:text-green-400 text-green-700">
                &gt; EARNINGS_SUMMARY
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80">
                  MASTER
                </div>
                <div className="text-lg font-mono font-bold dark:text-green-400 text-green-700">
                  ${(earningsSummary.masterCents / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80">
                  PUBLISHING
                </div>
                <div className="text-lg font-mono font-bold dark:text-green-400 text-green-700">
                  ${(earningsSummary.publishingCents / 100).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs font-mono dark:text-green-400/70 text-green-700/80">
                  TOTAL
                </div>
                <div className="text-lg font-mono font-bold dark:text-green-400 text-green-700">
                  ${(earningsSummary.totalCents / 100).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Work Details */}
          <div className="border-2 dark:border-green-400/50 border-green-600/50 p-6 dark:bg-black bg-white">
            <WorkDetails work={work} onUpdate={handleUpdateWork} />
          </div>

          {/* Right: Split Editor */}
          <div className="border-2 dark:border-green-400/50 border-green-600/50 p-6 dark:bg-black bg-white">
            <SplitEditor
              workId={id}
              splitSheet={work.splitSheet}
              onSave={handleSaveSplits}
              onLock={handleLockSplits}
            />
          </div>
        </div>

        {/* Earnings History */}
        {work.earnings && work.earnings.length > 0 && (
          <div className="mt-6 border-2 dark:border-green-400/50 border-green-600/50 p-6 dark:bg-black bg-white">
            <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-4">
              &gt; EARNINGS_HISTORY
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="dark:bg-green-400/10 bg-green-600/10">
                  <tr className="text-xs font-mono dark:text-green-400 text-green-700">
                    <th className="px-3 py-2 text-left">DATE</th>
                    <th className="px-3 py-2 text-left">TYPE</th>
                    <th className="px-3 py-2 text-left">SOURCE</th>
                    <th className="px-3 py-2 text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {work.earnings.map((earning: any) => (
                    <tr
                      key={earning.id}
                      className="border-t dark:border-green-400/20 border-green-600/20"
                    >
                      <td className="px-3 py-2 text-xs font-mono dark:text-green-400/70 text-green-700/80">
                        {new Date(earning.occurredAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono dark:text-green-400 text-green-700">
                        {earning.type}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono dark:text-green-400/70 text-green-700/80">
                        {earning.source}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono text-right dark:text-green-400 text-green-700">
                        ${(earning.amountCents / 100).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
