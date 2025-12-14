'use client'

import { useState } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Bounty } from '@/types/bounty'

interface BountyApplicationModalProps {
  bounty: Bounty
  userId: string
  userName: string
  onClose: () => void
  onSuccess: () => void
}

export function BountyApplicationModal({
  bounty,
  userId,
  userName,
  onClose,
  onSuccess
}: BountyApplicationModalProps) {
  const [coverLetter, setCoverLetter] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [proposedBudget, setProposedBudget] = useState<number | ''>('')
  const [estimatedDays, setEstimatedDays] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/bounties/${bounty.id}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: userId,
          applicantName: userName,
          coverLetter,
          portfolioUrl: portfolioUrl || undefined,
          proposedBudget: proposedBudget || undefined,
          estimatedDeliveryDays: estimatedDays || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black border-2 border-green-400 font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/80 border border-green-400 hover:bg-green-400 hover:text-black transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b-2 border-green-400/30 p-6">
          <h2 className="text-2xl font-bold text-green-400 mb-2">
            &gt; APPLY_TO_BOUNTY
          </h2>
          <p className="text-green-400/70 text-sm">{bounty.title}</p>
          <p className="text-green-400/60 text-xs mt-1">
            Posted by {bounty.creatorName}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-bold text-green-400 mb-2">
              COVER_LETTER *
            </label>
            <textarea
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the creator why you're the right fit for this bounty..."
              rows={6}
              className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30 resize-none"
            />
            <p className="text-xs text-green-400/60 mt-1">
              Highlight your relevant experience and approach
            </p>
          </div>

          {/* Portfolio URL */}
          <div>
            <label className="block text-sm font-bold text-green-400 mb-2">
              PORTFOLIO_URL
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://soundcloud.com/yourprofile"
              className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
            />
            <p className="text-xs text-green-400/60 mt-1">
              Link to your work (SoundCloud, YouTube, website, etc.)
            </p>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-2 gap-4">
            {/* Proposed Budget */}
            {bounty.budgetType === 'OPEN_TO_OFFERS' && (
              <div>
                <label className="block text-sm font-bold text-green-400 mb-2">
                  PROPOSED_BUDGET (USDC)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={proposedBudget}
                  onChange={(e) => setProposedBudget(e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="150"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
                />
              </div>
            )}

            {/* Estimated Delivery */}
            <div className={bounty.budgetType === 'OPEN_TO_OFFERS' ? '' : 'col-span-2'}>
              <label className="block text-sm font-bold text-green-400 mb-2">
                ESTIMATED_DELIVERY (DAYS)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="7"
                className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
              />
            </div>
          </div>

          {/* Bounty Details Reminder */}
          <div className="border-2 border-green-400/30 p-4 bg-green-400/5">
            <h3 className="text-sm font-bold text-green-400 mb-2">BOUNTY_DETAILS</h3>
            <div className="space-y-1 text-xs text-green-400/70">
              <p>
                <span className="text-green-400">Role:</span> {bounty.role}
              </p>
              {bounty.budgetType === 'FLAT_FEE' && bounty.budgetMinUSDC && (
                <p>
                  <span className="text-green-400">Budget:</span> ${bounty.budgetMinUSDC}
                  {bounty.budgetMaxUSDC && ` - $${bounty.budgetMaxUSDC}`} USDC
                </p>
              )}
              <p>
                <span className="text-green-400">Type:</span> {bounty.budgetType.replace(/_/g, ' ')}
              </p>
              {bounty.deadline && (
                <p>
                  <span className="text-green-400">Deadline:</span>{' '}
                  {new Date(bounty.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="border border-red-500/50 bg-red-500/10 p-3">
              <p className="text-red-400 text-sm font-mono">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-green-400 text-green-400 font-mono"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={submitting || !coverLetter.trim()}
              className="flex-1 bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  SUBMITTING...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  SUBMIT_APPLICATION
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
