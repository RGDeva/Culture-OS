'use client'

import { useState } from 'react'
import { X, Upload, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmitProofModalProps {
  campaignId: string
  participantId: string
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export function SubmitProofModal({
  campaignId,
  participantId,
  userId,
  onClose,
  onSuccess,
}: SubmitProofModalProps) {
  const [postUrl, setPostUrl] = useState('')
  const [platform, setPlatform] = useState('TIKTOK')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!postUrl.trim()) {
      alert('Please enter a post URL')
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch(`/api/bounties/campaigns/${campaignId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          postUrl: postUrl.trim(),
          platform,
          initialMetrics: { views: 0, likes: 0, comments: 0 },
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit proof')
      }
    } catch (error) {
      console.error('[SUBMIT_PROOF] Error:', error)
      alert('Failed to submit proof')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-md border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
            &gt; SUBMIT_PROOF
          </h2>
          <button
            onClick={onClose}
            className="dark:text-green-400 text-green-700 hover:opacity-70"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
              PLATFORM
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm"
            >
              <option value="TIKTOK">TikTok</option>
              <option value="INSTAGRAM">Instagram</option>
              <option value="YOUTUBE">YouTube</option>
              <option value="TWITTER">Twitter/X</option>
              <option value="FACEBOOK">Facebook</option>
            </select>
          </div>

          {/* Post URL */}
          <div>
            <label className="block text-sm font-mono dark:text-green-400 text-green-700 mb-2">
              POST_URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-green-400/50 text-green-700/50" />
              <input
                type="url"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                required
              />
            </div>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70 mt-1">
              Paste the full URL of your social media post
            </p>
          </div>

          {/* Info */}
          <div className="border dark:border-green-400/30 border-green-600/40 p-4 dark:bg-green-400/5 bg-green-600/5">
            <p className="text-xs font-mono dark:text-green-400/70 text-green-700/80">
              After submission, we'll track the views on your post automatically. 
              You'll earn rewards when you hit view milestones.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
