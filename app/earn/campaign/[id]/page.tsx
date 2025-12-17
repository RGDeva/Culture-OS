'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import {
  ArrowLeft,
  DollarSign,
  Clock,
  Users,
  Calendar,
  MapPin,
  ExternalLink,
  Check,
  X,
  Loader2,
  Trophy,
  Play,
  AlertCircle,
  CheckCircle2,
  Scissors,
  Briefcase,
  TrendingUp,
  Download,
  FileAudio,
  FileImage,
  FileVideo,
  FileText,
  Link as LinkIcon,
  Upload,
} from 'lucide-react'
import { getCampaignTypeConfig, getStatusConfig, SAMPLE_CAMPAIGNS } from '@/lib/sampleCampaigns'

interface CampaignAsset {
  id: string
  title: string
  assetType: string
  url: string
  description?: string
}

interface Campaign {
  id: string
  creatorId: string
  creatorName?: string
  title: string
  description?: string
  campaignType: string
  status: string
  budgetCents: number
  payoutType: string
  payoutRuleJson: string
  requirementsJson: string
  payoutRules?: any
  requirements?: any
  assets?: CampaignAsset[]
  startAt?: string
  endAt?: string
  featured?: boolean
  imageUrl?: string
  remoteOk?: boolean
  location?: string
}

interface Submission {
  id: string
  userId: string
  submissionUrl: string
  platform: string
  reportedViews: number
  status: string
  createdAt: string
}

interface LeaderboardEntry {
  rank: number
  submissionId: string
  userId: string
  platform: string
  views: number
  url: string
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, authenticated, login } = usePrivy()
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const campaignId = params.id as string

  useEffect(() => {
    fetchCampaign()
  }, [campaignId])

  const fetchCampaign = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/earn/campaign/${campaignId}`)
      if (response.ok) {
        const data = await response.json()
        setCampaign(data.campaign)
        setSubmissions(data.submissions || [])
        setLeaderboard(data.leaderboard || [])
      } else {
        // Fallback to sample data
        const sample = SAMPLE_CAMPAIGNS.find(c => c.id === campaignId)
        if (sample) {
          setCampaign({
            ...sample,
            startAt: sample.startAt?.toISOString(),
            endAt: sample.endAt?.toISOString(),
            payoutRules: JSON.parse(sample.payoutRuleJson),
            requirements: JSON.parse(sample.requirementsJson),
          } as Campaign)
        }
      }
    } catch (error) {
      console.error('[CAMPAIGN] Error:', error)
      const sample = SAMPLE_CAMPAIGNS.find(c => c.id === campaignId)
      if (sample) {
        setCampaign({
          ...sample,
          startAt: sample.startAt?.toISOString(),
          endAt: sample.endAt?.toISOString(),
          payoutRules: JSON.parse(sample.payoutRuleJson),
          requirements: JSON.parse(sample.requirementsJson),
        } as Campaign)
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h1 className="text-2xl font-mono text-red-400 mb-2">CAMPAIGN_NOT_FOUND</h1>
        <p className="text-gray-500 mb-6">This campaign doesn't exist or has been removed.</p>
        <Link href="/earn" className="text-green-400 font-mono hover:underline">
          ← Back to Earn
        </Link>
      </div>
    )
  }

  const typeConfig = getCampaignTypeConfig(campaign.campaignType)
  const statusConfig = getStatusConfig(campaign.status)
  const payoutRules = campaign.payoutRules || (typeof campaign.payoutRuleJson === 'string' ? JSON.parse(campaign.payoutRuleJson) : {})
  const requirements = campaign.requirements || (typeof campaign.requirementsJson === 'string' ? JSON.parse(campaign.requirementsJson) : {})

  const isCreator = user?.id === campaign.creatorId
  const userSubmissions = submissions.filter(s => s.userId === user?.id)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-green-400/20">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/earn" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 font-mono text-sm mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Earn
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="relative">
        {campaign.imageUrl && (
          <div className="absolute inset-0 h-64 overflow-hidden">
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/80 to-black" />
          </div>
        )}
        
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-6">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-3 py-1 text-sm font-mono rounded ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.label.toUpperCase()}
            </span>
            <span className={`px-3 py-1 text-sm font-mono rounded ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label.toUpperCase()}
            </span>
            {campaign.featured && (
              <span className="px-3 py-1 text-sm font-mono rounded bg-yellow-400/20 text-yellow-400">
                FEATURED
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{campaign.title}</h1>
          
          {/* Creator */}
          {campaign.creatorName && (
            <p className="text-gray-400 font-mono mb-4">by {campaign.creatorName}</p>
          )}

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-400/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-green-400 font-mono font-bold">
                ${(campaign.budgetCents / 100).toLocaleString()} Budget
              </span>
            </div>
            
            {campaign.endAt && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 font-mono">
                  Ends {new Date(campaign.endAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {campaign.location && (
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 font-mono">{campaign.location}</span>
              </div>
            )}

            {campaign.remoteOk && (
              <div className="flex items-center gap-2 px-3 py-2 bg-cyan-400/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                <span className="text-cyan-400 font-mono">Remote OK</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-xl font-bold font-mono text-green-400 mb-4">OVERVIEW</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {campaign.description}
              </p>
            </section>

            {/* Requirements */}
            <section>
              <h2 className="text-xl font-bold font-mono text-green-400 mb-4">REQUIREMENTS</h2>
              <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-6 space-y-4">
                {/* Platforms */}
                {requirements.platforms && (
                  <div>
                    <span className="text-gray-400 font-mono text-sm uppercase tracking-wide">Platforms</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {requirements.platforms.map((p: string) => (
                        <span key={p} className="px-3 py-1.5 bg-purple-400/10 text-purple-400 border border-purple-400/20 rounded-lg text-sm font-mono font-semibold">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Duration */}
                {(requirements.minDuration || requirements.maxDuration) && (
                  <div>
                    <span className="text-gray-400 font-mono text-sm uppercase tracking-wide">Video Length</span>
                    <div className="mt-2 text-white font-mono">
                      {requirements.minDuration && `${requirements.minDuration}s min`}
                      {requirements.minDuration && requirements.maxDuration && ' - '}
                      {requirements.maxDuration && `${requirements.maxDuration}s max`}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {requirements.hashtags && (
                  <div>
                    <span className="text-gray-400 font-mono text-sm uppercase tracking-wide">Required Hashtags</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {requirements.hashtags.map((h: string) => (
                        <span key={h} className="text-cyan-400 font-mono text-sm bg-cyan-400/10 px-2 py-1 rounded">{h}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rules List */}
                {requirements.rules && requirements.rules.length > 0 && (
                  <div>
                    <span className="text-gray-400 font-mono text-sm uppercase tracking-wide mb-3 block">Content Rules</span>
                    <div className="space-y-2">
                      {requirements.rules.map((rule: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {requirements.instructions && (
                  <div>
                    <span className="text-gray-400 font-mono text-sm uppercase tracking-wide">Instructions</span>
                    <p className="text-gray-300 mt-2 leading-relaxed">{requirements.instructions}</p>
                  </div>
                )}

                {/* Experience/Genre */}
                {requirements.experience && (
                  <div>
                    <span className="text-gray-400 font-mono text-sm uppercase tracking-wide">Experience Required</span>
                    <p className="text-white font-mono mt-2">{requirements.experience}</p>
                  </div>
                )}

                {requirements.genre && (
                  <div>
                    <span className="text-gray-400 font-mono text-sm uppercase tracking-wide">Genre</span>
                    <span className="text-white font-mono text-sm ml-2 block mt-2">{requirements.genre}</span>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 font-mono">
                    DO NOT REPOST OR ADD MINOR EDITS/CLIPPING
                  </p>
                </div>
              </div>
            </section>

            {/* Assets Provided */}
            {campaign.assets && campaign.assets.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-mono text-green-400 mb-4">ASSETS_PROVIDED</h2>
                <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-4 space-y-3">
                  {campaign.assets.map((asset) => {
                    const getAssetIcon = (type: string) => {
                      switch (type) {
                        case 'AUDIO': return <FileAudio className="h-5 w-5 text-purple-400" />
                        case 'IMAGE': return <FileImage className="h-5 w-5 text-cyan-400" />
                        case 'VIDEO': return <FileVideo className="h-5 w-5 text-pink-400" />
                        case 'DOC': return <FileText className="h-5 w-5 text-orange-400" />
                        default: return <LinkIcon className="h-5 w-5 text-green-400" />
                      }
                    }

                    return (
                      <a
                        key={asset.id}
                        href={asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-green-400/30 rounded-lg transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getAssetIcon(asset.assetType)}
                          <div className="flex-1">
                            <div className="font-mono text-white group-hover:text-green-400 transition-colors">
                              {asset.title}
                            </div>
                            {asset.description && (
                              <div className="text-sm text-gray-500 mt-0.5">
                                {asset.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <Download className="h-4 w-4 text-gray-500 group-hover:text-green-400 transition-colors" />
                      </a>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Payout Rules */}
            <section>
              <h2 className="text-xl font-bold font-mono text-green-400 mb-4">PAYOUT_RULES</h2>
              <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-4 space-y-3">
                {campaign.payoutType === 'PER_VIEWS' && payoutRules.perThousandViews && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <span className="text-white font-mono">
                      ${(payoutRules.perThousandViews / 100).toFixed(2)} per 1,000 views
                    </span>
                  </div>
                )}

                {campaign.payoutType === 'FIXED' && payoutRules.fixedAmount && (
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-400" />
                    <span className="text-white font-mono">
                      ${(payoutRules.fixedAmount / 100).toLocaleString()} fixed payment
                    </span>
                  </div>
                )}

                {campaign.payoutType === 'LEADERBOARD' && payoutRules.prizes && (
                  <div className="space-y-2">
                    {payoutRules.prizes.map((prize: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <Trophy className={`h-5 w-5 ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-400' : 'text-orange-400'}`} />
                        <span className="text-white font-mono">{prize.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {campaign.payoutType === 'MILESTONE' && payoutRules.commissionPct && (
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    <span className="text-white font-mono">
                      {(payoutRules.commissionPct * 100).toFixed(0)}% commission per sale
                    </span>
                  </div>
                )}

                {payoutRules.bonus && (
                  <div className="mt-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                    <span className="text-yellow-400 font-mono text-sm">🎁 BONUS: </span>
                    <span className="text-yellow-300">{payoutRules.bonus}</span>
                  </div>
                )}

                {payoutRules.bonusTiers && (
                  <div className="mt-4 space-y-2">
                    <span className="text-gray-500 font-mono text-sm">Bonus Tiers:</span>
                    {payoutRules.bonusTiers.map((tier: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                        <span className="text-gray-300">{tier.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {payoutRules.maxPayoutPerSubmission && (
                  <div className="text-gray-500 font-mono text-sm mt-2">
                    Max per submission: ${(payoutRules.maxPayoutPerSubmission / 100).toLocaleString()}
                  </div>
                )}
              </div>
            </section>

            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-mono text-green-400 mb-4">LEADERBOARD</h2>
                <div className="bg-gray-900/50 border border-green-400/20 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-400/20">
                        <th className="px-4 py-3 text-left text-gray-500 font-mono text-sm">#</th>
                        <th className="px-4 py-3 text-left text-gray-500 font-mono text-sm">Platform</th>
                        <th className="px-4 py-3 text-right text-gray-500 font-mono text-sm">Views</th>
                        <th className="px-4 py-3 text-right text-gray-500 font-mono text-sm"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((entry) => (
                        <tr key={entry.submissionId} className="border-b border-green-400/10 last:border-0">
                          <td className="px-4 py-3 font-mono">
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                          </td>
                          <td className="px-4 py-3 text-gray-300 font-mono">{entry.platform}</td>
                          <td className="px-4 py-3 text-right text-green-400 font-mono">
                            {entry.views.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Creator Actions */}
            {isCreator && submissions.length > 0 && (
              <section>
                <h2 className="text-xl font-bold font-mono text-green-400 mb-4">SUBMISSIONS_MANAGEMENT</h2>
                <div className="space-y-3">
                  {submissions.map((sub) => (
                    <SubmissionRow key={sub.id} submission={sub} onUpdate={fetchCampaign} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit CTA */}
            <div className="bg-gray-900/50 border border-green-400/30 rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold font-mono text-green-400 mb-4">
                {campaign.status === 'OPEN' ? 'JOIN_CAMPAIGN' : 'CAMPAIGN_CLOSED'}
              </h3>
              
              {campaign.status === 'OPEN' ? (
                <>
                  {authenticated ? (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="w-full py-3 bg-green-400 text-black font-bold font-mono rounded-lg hover:bg-green-300 transition-colors"
                    >
                      SUBMIT CONTENT
                    </button>
                  ) : (
                    <button
                      onClick={() => login()}
                      className="w-full py-3 bg-green-400 text-black font-bold font-mono rounded-lg hover:bg-green-300 transition-colors"
                    >
                      SIGN IN TO SUBMIT
                    </button>
                  )}
                  
                  {userSubmissions.length > 0 && (
                    <div className="mt-4 p-3 bg-cyan-400/10 border border-cyan-400/20 rounded-lg">
                      <span className="text-cyan-400 font-mono text-sm">
                        You have {userSubmissions.length} submission{userSubmissions.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </>
              ) : campaign.status === 'UPCOMING' ? (
                <p className="text-gray-400 font-mono text-sm">
                  Campaign opens {campaign.startAt ? new Date(campaign.startAt).toLocaleDateString() : 'soon'}
                </p>
              ) : (
                <p className="text-gray-400 font-mono text-sm">
                  This campaign is no longer accepting submissions.
                </p>
              )}
            </div>

            {/* Your Submissions */}
            {userSubmissions.length > 0 && (
              <div className="bg-gray-900/50 border border-green-400/20 rounded-lg p-4">
                <h3 className="text-sm font-bold font-mono text-gray-400 mb-3">YOUR_SUBMISSIONS</h3>
                <div className="space-y-2">
                  {userSubmissions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-300 font-mono">{sub.platform}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-xs ${
                        sub.status === 'APPROVED' ? 'bg-green-400/10 text-green-400' :
                        sub.status === 'REJECTED' ? 'bg-red-400/10 text-red-400' :
                        sub.status === 'PAID' ? 'bg-cyan-400/10 text-cyan-400' :
                        'bg-yellow-400/10 text-yellow-400'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <SubmitModal
          campaignId={campaign.id}
          userId={user?.id || ''}
          requirements={requirements}
          onClose={() => setShowSubmitModal(false)}
          onSuccess={() => {
            setShowSubmitModal(false)
            fetchCampaign()
          }}
        />
      )}
    </div>
  )
}

function SubmitModal({
  campaignId,
  userId,
  requirements,
  onClose,
  onSuccess,
}: {
  campaignId: string
  userId: string
  requirements: any
  onClose: () => void
  onSuccess: () => void
}) {
  const [platform, setPlatform] = useState('TIKTOK')
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [originalMediaFile, setOriginalMediaFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [reportedViews, setReportedViews] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('File size must be less than 100MB')
        return
      }
      setOriginalMediaFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submissionUrl || !confirmed) return

    setSubmitting(true)
    setError('')

    try {
      let originalMediaUrl = ''

      // Upload file if provided
      if (originalMediaFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', originalMediaFile)
        formData.append('userId', userId)
        formData.append('campaignId', campaignId)

        const uploadResponse = await fetch('/api/earn/upload', {
          method: 'POST',
          body: formData,
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          originalMediaUrl = uploadData.url
        } else {
          throw new Error('Failed to upload file')
        }
        setUploading(false)
      }

      // Submit the campaign submission
      const response = await fetch(`/api/earn/campaign/${campaignId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          submissionUrl,
          originalMediaUrl,
          platform,
          reportedViews: reportedViews ? parseInt(reportedViews) : 0,
        }),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  const platforms = requirements?.platforms || ['TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'X', 'OTHER']

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-400/30 rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold font-mono text-green-400">SUBMIT_CONTENT</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform */}
          <div>
            <label className="block text-gray-400 font-mono text-sm mb-2">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full px-3 py-2 bg-black border border-green-400/30 rounded-lg text-white font-mono focus:outline-none focus:border-green-400"
            >
              {platforms.map((p: string) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Original Media Upload (Optional) */}
          <div>
            <label className="block text-gray-400 font-mono text-sm mb-2">
              Original Media File <span className="text-gray-600">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*,audio/*,image/*"
                className="hidden"
                id="media-upload"
              />
              <label
                htmlFor="media-upload"
                className="flex items-center justify-center gap-2 w-full px-3 py-3 bg-black border border-green-400/30 border-dashed rounded-lg text-gray-400 hover:text-green-400 hover:border-green-400 cursor-pointer transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="font-mono text-sm">
                  {originalMediaFile ? originalMediaFile.name : 'Upload MP4, MP3, or Image'}
                </span>
              </label>
            </div>
            {originalMediaFile && (
              <div className="mt-2 text-xs text-gray-500 font-mono">
                Size: {(originalMediaFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>

          {/* URL */}
          <div>
            <label className="block text-gray-400 font-mono text-sm mb-2">
              Post URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              placeholder="https://tiktok.com/@user/video/..."
              required
              className="w-full px-3 py-2 bg-black border border-green-400/30 rounded-lg text-white placeholder-gray-500 font-mono focus:outline-none focus:border-green-400"
            />
            <p className="mt-1 text-xs text-gray-600 font-mono">
              Link to your published post on {platform}
            </p>
          </div>

          {/* Views (optional) */}
          <div>
            <label className="block text-gray-400 font-mono text-sm mb-2">
              Current Views <span className="text-gray-600">(optional)</span>
            </label>
            <input
              type="number"
              value={reportedViews}
              onChange={(e) => setReportedViews(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-black border border-green-400/30 rounded-lg text-white placeholder-gray-500 font-mono focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Important Notice */}
          <div className="p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-400 text-xs font-mono">
                Only views after submission count towards payout. Submit as soon as you post to get paid for all of your views.
              </p>
            </div>
          </div>

          {/* Confirmation */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 accent-green-400"
            />
            <span className="text-gray-400 text-sm">
              I confirm this content meets all requirements and I have the rights to submit it.
            </span>
          </label>

          {error && (
            <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400 text-sm font-mono">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!submissionUrl || !confirmed || submitting || uploading}
            className="w-full py-3 bg-green-400 text-black font-bold font-mono rounded-lg hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>UPLOADING_FILE...</span>
              </>
            ) : submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                SUBMITTING...
              </>
            ) : (
              'SUBMIT'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function SubmissionRow({ submission, onUpdate }: { submission: Submission; onUpdate: () => void }) {
  const [updating, setUpdating] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      await fetch(`/api/earn/submission/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      onUpdate()
    } catch (error) {
      console.error('Error updating submission:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-900/50 border border-green-400/20 rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-300 font-mono text-sm">{submission.platform}</span>
          <span className={`px-2 py-0.5 rounded font-mono text-xs ${
            submission.status === 'APPROVED' ? 'bg-green-400/10 text-green-400' :
            submission.status === 'REJECTED' ? 'bg-red-400/10 text-red-400' :
            'bg-yellow-400/10 text-yellow-400'
          }`}>
            {submission.status}
          </span>
        </div>
        <a
          href={submission.submissionUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 text-sm truncate block hover:underline"
        >
          {submission.submissionUrl}
        </a>
        <span className="text-gray-500 text-xs font-mono">
          {submission.reportedViews.toLocaleString()} views
        </span>
      </div>

      {submission.status === 'PENDING' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusUpdate('APPROVED')}
            disabled={updating}
            className="p-2 bg-green-400/10 text-green-400 rounded hover:bg-green-400/20 disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleStatusUpdate('REJECTED')}
            disabled={updating}
            className="p-2 bg-red-400/10 text-red-400 rounded hover:bg-red-400/20 disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
