'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Eye, DollarSign, Users, Clock, TrendingUp, Upload, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubmitProofModal } from './SubmitProofModal'

interface CampaignCardProps {
  campaign: any
  isCreator?: boolean
  isParticipant?: boolean
  participation?: any
  onJoin?: () => void
  onUpdate?: () => void
  userId?: string
}

export function CampaignCard({
  campaign,
  isCreator = false,
  isParticipant = false,
  participation,
  onJoin,
  onUpdate,
  userId,
}: CampaignCardProps) {
  const router = useRouter()
  const [joining, setJoining] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const rules = campaign.rulesJson ? JSON.parse(campaign.rulesJson) : {}
  const isActive = campaign.status === 'ACTIVE'
  const isEnded = campaign.status === 'ENDED'
  
  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!campaign.endAt) return 'No end date'
    const end = new Date(campaign.endAt)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    
    if (diff < 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  const handleJoin = async () => {
    if (!userId) return
    
    try {
      setJoining(true)
      const response = await fetch(`/api/bounties/campaigns/${campaign.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        onJoin?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to join campaign')
      }
    } catch (error) {
      console.error('[JOIN] Error:', error)
      alert('Failed to join campaign')
    } finally {
      setJoining(false)
    }
  }

  const handleViewMetrics = () => {
    router.push(`/bounties/${campaign.id}/metrics`)
  }

  const getRewardSummary = () => {
    if (campaign.type === 'VIEW') {
      const tiers = rules.tiers || []
      if (tiers.length === 0) return 'Custom rewards'
      const maxPayout = Math.max(...tiers.map((t: any) => t.payoutCents))
      return `Up to $${(maxPayout / 100).toFixed(2)}`
    } else {
      const commission = rules.commissionPercent || rules.commissionCents
      if (rules.commissionPercent) {
        return `${commission}% commission`
      } else if (rules.commissionCents) {
        return `$${(commission / 100).toFixed(2)} per sale`
      }
      return 'Commission based'
    }
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-6 dark:bg-black/50 bg-white/80 hover:dark:border-green-400 hover:border-green-600 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 dark:text-green-400 text-green-700" />
          <span className={`text-xs font-mono px-2 py-1 ${
            campaign.type === 'VIEW'
              ? 'dark:bg-blue-400/20 bg-blue-600/20 dark:text-blue-400 text-blue-700'
              : 'dark:bg-purple-400/20 bg-purple-600/20 dark:text-purple-400 text-purple-700'
          }`}>
            {campaign.type}
          </span>
        </div>
        <span className={`text-xs font-mono px-2 py-1 ${
          isActive
            ? 'dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700'
            : isEnded
            ? 'dark:bg-red-400/20 bg-red-600/20 dark:text-red-400 text-red-700'
            : 'dark:bg-yellow-400/20 bg-yellow-600/20 dark:text-yellow-400 text-yellow-700'
        }`}>
          {campaign.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold font-mono dark:text-green-400 text-green-700 mb-2">
        {campaign.title}
      </h3>

      {/* Description */}
      {campaign.description && (
        <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80 mb-4 line-clamp-2">
          {campaign.description}
        </p>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
          <div>
            <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">REWARD</div>
            <div className="text-sm font-mono font-bold dark:text-green-400 text-green-700">
              {getRewardSummary()}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 dark:text-green-400/70 text-green-700/70" />
          <div>
            <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">PARTICIPANTS</div>
            <div className="text-sm font-mono font-bold dark:text-green-400 text-green-700">
              {campaign.participantCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Time Remaining */}
      {campaign.endAt && (
        <div className="flex items-center gap-2 mb-4 text-xs font-mono dark:text-green-400/60 text-green-700/70">
          <Clock className="h-3 w-3" />
          {getTimeRemaining()}
        </div>
      )}

      {/* Participation Stats (if participant) */}
      {participation && (
        <div className="border-t dark:border-green-400/30 border-green-600/40 pt-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <div className="dark:text-green-400/60 text-green-700/70">SUBMISSIONS</div>
              <div className="font-bold dark:text-green-400 text-green-700">
                {participation.submissions?.length || 0}
              </div>
            </div>
            <div>
              <div className="dark:text-green-400/60 text-green-700/70">EARNED</div>
              <div className="font-bold dark:text-yellow-400 text-yellow-600">
                ${((participation.earnings?.reduce((sum: number, e: any) => sum + e.amountCents, 0) || 0) / 100).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isCreator ? (
          <>
            <Button
              onClick={handleViewMetrics}
              variant="outline"
              size="sm"
              className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              METRICS
            </Button>
            <Button
              onClick={() => router.push(`/bounties/${campaign.id}/edit`)}
              variant="outline"
              size="sm"
              className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
            >
              EDIT
            </Button>
          </>
        ) : isParticipant || participation ? (
          <>
            <Button
              onClick={() => router.push(`/bounties/${campaign.id}`)}
              variant="outline"
              size="sm"
              className="flex-1 dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              VIEW
            </Button>
            {campaign.type === 'VIEW' && (
              <Button
                onClick={() => setShowSubmitModal(true)}
                size="sm"
                className="flex-1 dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono text-xs"
              >
                <Upload className="h-3 w-3 mr-1" />
                SUBMIT
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={handleJoin}
            disabled={!isActive || joining}
            size="sm"
            className="w-full dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono text-xs disabled:opacity-50"
          >
            {joining ? 'JOINING...' : 'JOIN_BOUNTY'}
          </Button>
        )}
      </div>

      {/* Submit Proof Modal */}
      {showSubmitModal && participation && (
        <SubmitProofModal
          campaignId={campaign.id}
          participantId={participation.id}
          userId={userId || ''}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false)
            onUpdate?.()
          }}
        />
      )}
    </div>
  )
}
