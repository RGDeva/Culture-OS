'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Link as LinkIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LinkToWorkModalProps {
  assetId: string
  assetName: string
  userId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: (workId: string) => void
}

export function LinkToWorkModal({
  assetId,
  assetName,
  userId,
  isOpen,
  onClose,
  onSuccess,
}: LinkToWorkModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState(assetName.replace(/\.[^/.]+$/, '')) // Remove extension
  const [status, setStatus] = useState<'IDEA' | 'IN_PROGRESS' | 'RELEASED' | 'CATALOGED'>('IN_PROGRESS')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          status,
          ownerId: userId,
          vaultAssetIds: [assetId],
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create work')
      }

      const data = await response.json()
      
      if (onSuccess) {
        onSuccess(data.work.id)
      }

      // Redirect to work detail page
      router.push(`/works/${data.work.id}`)
    } catch (err: any) {
      console.error('[LINK_TO_WORK] Error:', err)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b-2 dark:border-green-400/50 border-green-600/50 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 dark:text-green-400 text-green-700" />
            <h2 className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
              &gt; LINK_TO_WORK
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="px-4 py-3 border-2 dark:border-red-400 border-red-600 dark:bg-red-400/10 bg-red-600/10 text-sm font-mono dark:text-red-400 text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; WORK_TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter work title"
              className="w-full px-3 py-2 font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
            />
          </div>

          <div>
            <label className="block text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-2">
              &gt; STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 font-mono border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
            >
              <option value="IDEA">IDEA</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RELEASED">RELEASED</option>
              <option value="CATALOGED">CATALOGED</option>
            </select>
          </div>

          <div className="px-3 py-2 border dark:border-green-400/30 border-green-600/30 dark:bg-green-400/5 bg-green-600/5">
            <p className="text-xs font-mono dark:text-green-400/70 text-green-700/80">
              <strong>Linking asset:</strong> {assetName}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 font-mono dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'CREATING...' : 'CREATE_WORK'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="font-mono dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700"
            >
              CANCEL
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
