'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import {
  Scissors,
  Briefcase,
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  Zap,
  MapPin,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { formatPayoutSummary, getCampaignTypeConfig, getStatusConfig, SAMPLE_CAMPAIGNS } from '@/lib/sampleCampaigns'

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
  startAt?: string
  endAt?: string
  featured?: boolean
  imageUrl?: string
  remoteOk?: boolean
  location?: string
}

type TabType = 'content_rewards' | 'opportunities' | 'affiliate'

const TABS = [
  { id: 'content_rewards' as TabType, label: 'Content Rewards', icon: Scissors, type: 'CONTENT_REWARDS' },
  { id: 'opportunities' as TabType, label: 'Opportunities', icon: Briefcase, type: 'OPPORTUNITY' },
  { id: 'affiliate' as TabType, label: 'Affiliate', icon: TrendingUp, type: 'AFFILIATE' },
]

export default function EarnPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { authenticated } = usePrivy()
  
  const [activeTab, setActiveTab] = useState<TabType>('content_rewards')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [payoutTypeFilter, setPayoutTypeFilter] = useState<string>('')
  const [remoteOnlyFilter, setRemoteOnlyFilter] = useState(false)

  // Set initial tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['content_rewards', 'opportunities', 'affiliate'].includes(tab)) {
      setActiveTab(tab as TabType)
    }
  }, [searchParams])

  // Fetch campaigns when tab or filters change
  useEffect(() => {
    fetchCampaigns()
  }, [activeTab, statusFilter, payoutTypeFilter, remoteOnlyFilter])

  const fetchCampaigns = async () => {
    setLoading(true)
    try {
      const tabConfig = TABS.find(t => t.id === activeTab)
      const campaignType = tabConfig?.type || 'CONTENT_REWARDS'
      
      const params = new URLSearchParams()
      params.set('campaignType', campaignType)
      if (statusFilter) params.set('status', statusFilter)
      if (payoutTypeFilter) params.set('payoutType', payoutTypeFilter)
      if (remoteOnlyFilter) params.set('remoteOk', 'true')
      if (searchQuery) params.set('search', searchQuery)

      const response = await fetch(`/api/earn/campaigns?${params.toString()}`)
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('[EARN] Error fetching campaigns:', error)
      // Fallback to filtered sample data
      const tabConfig = TABS.find(t => t.id === activeTab)
      const filtered = SAMPLE_CAMPAIGNS.filter(c => c.campaignType === tabConfig?.type)
      setCampaigns(filtered as Campaign[])
    } finally {
      setLoading(false)
    }
  }

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        fetchCampaigns()
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    router.push(`/earn?tab=${tab}`, { scroll: false })
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        campaign.title.toLowerCase().includes(query) ||
        campaign.description?.toLowerCase().includes(query) ||
        campaign.creatorName?.toLowerCase().includes(query)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-green-400/20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-400/10 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-mono text-green-400">
              EARN
            </h1>
          </div>
          <p className="text-gray-400 font-mono text-sm max-w-2xl">
            Discover opportunities to earn through content creation, gigs, and affiliate promotions. 
            Submit clips, complete challenges, and get paid.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-green-400/20 bg-black/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-green-400 text-black'
                      : 'text-gray-400 hover:text-green-400 hover:bg-green-400/10'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label.toUpperCase()}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-green-400/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-green-400/30 rounded-lg text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-green-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-black border border-green-400/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-green-400"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="CLOSED">Closed</option>
            </select>

            {/* Payout Type Filter */}
            <select
              value={payoutTypeFilter}
              onChange={(e) => setPayoutTypeFilter(e.target.value)}
              className="px-3 py-2 bg-black border border-green-400/30 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-green-400"
            >
              <option value="">All Payout Types</option>
              <option value="PER_VIEWS">Per Views</option>
              <option value="FIXED">Fixed</option>
              <option value="LEADERBOARD">Leaderboard</option>
              <option value="MILESTONE">Milestone</option>
            </select>

            {/* Remote Only (for Opportunities) */}
            {activeTab === 'opportunities' && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteOnlyFilter}
                  onChange={(e) => setRemoteOnlyFilter(e.target.checked)}
                  className="w-4 h-4 accent-green-400"
                />
                <span className="text-sm font-mono text-gray-400">Remote Only</span>
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 text-green-400 animate-spin" />
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="p-4 bg-green-400/10 rounded-full w-fit mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-400" />
            </div>
            <h3 className="text-xl font-mono text-green-400 mb-2">NO_CAMPAIGNS_FOUND</h3>
            <p className="text-gray-500 font-mono text-sm">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new opportunities'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const typeConfig = getCampaignTypeConfig(campaign.campaignType)
  const statusConfig = getStatusConfig(campaign.status)
  
  // Parse payout summary
  let payoutSummary = ''
  try {
    const rules = JSON.parse(campaign.payoutRuleJson || '{}')
    switch (campaign.payoutType) {
      case 'PER_VIEWS':
        payoutSummary = `$${(rules.perThousandViews / 100).toFixed(0)} / 1K views`
        break
      case 'FIXED':
        payoutSummary = `$${(rules.fixedAmount / 100).toLocaleString()} fixed`
        break
      case 'LEADERBOARD':
        if (rules.prizes?.[0]) {
          payoutSummary = `Up to $${(rules.prizes[0].amountCents / 100).toLocaleString()}`
        } else {
          payoutSummary = 'Leaderboard prizes'
        }
        break
      case 'MILESTONE':
        if (rules.commissionPct) {
          payoutSummary = `${(rules.commissionPct * 100).toFixed(0)}% commission`
        } else {
          payoutSummary = 'Milestone rewards'
        }
        break
      default:
        payoutSummary = `$${(campaign.budgetCents / 100).toLocaleString()} budget`
    }
  } catch (e) {
    payoutSummary = `$${(campaign.budgetCents / 100).toLocaleString()} budget`
  }

  // Format deadline
  let deadline = ''
  if (campaign.endAt) {
    const endDate = new Date(campaign.endAt)
    const now = new Date()
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft > 0) {
      deadline = `${daysLeft} days left`
    } else if (daysLeft === 0) {
      deadline = 'Ends today'
    } else {
      deadline = 'Ended'
    }
  }

  return (
    <Link href={`/earn/campaign/${campaign.id}`}>
      <div className="group border border-green-400/20 rounded-lg overflow-hidden hover:border-green-400/50 transition-all bg-black/50">
        {/* Image */}
        {campaign.imageUrl && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={campaign.imageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            {/* Featured badge */}
            {campaign.featured && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-400 text-black text-xs font-mono font-bold rounded">
                FEATURED
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 text-xs font-mono rounded ${typeConfig.bg} ${typeConfig.color}`}>
              {typeConfig.label.toUpperCase()}
            </span>
            <span className={`px-2 py-0.5 text-xs font-mono rounded ${statusConfig.bg} ${statusConfig.color}`}>
              {statusConfig.label.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 group-hover:text-green-400 transition-colors">
            {campaign.title}
          </h3>

          {/* Creator */}
          {campaign.creatorName && (
            <p className="text-sm text-gray-500 font-mono mb-3">
              by {campaign.creatorName}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-3 text-sm">
            {/* Payout */}
            <div className="flex items-center gap-1.5 text-green-400">
              <DollarSign className="h-4 w-4" />
              <span className="font-mono">{payoutSummary}</span>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <Users className="h-4 w-4" />
              <span className="font-mono">${(campaign.budgetCents / 100).toLocaleString()}</span>
            </div>

            {/* Deadline */}
            {deadline && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{deadline}</span>
              </div>
            )}

            {/* Location (for opportunities) */}
            {campaign.campaignType === 'OPPORTUNITY' && campaign.location && (
              <div className="flex items-center gap-1.5 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span className="font-mono text-xs">{campaign.location}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-green-400 font-mono text-sm group-hover:underline">
              View & Submit →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
