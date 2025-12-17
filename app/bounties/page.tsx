'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePrivy } from '@privy-io/react-auth'
import { Target, Plus, TrendingUp, DollarSign, Users, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CampaignCard } from '@/components/bounties/CampaignCard'
import { CreateCampaignWizard } from '@/components/bounties/CreateCampaignWizard'

export default function BountiesPage() {
  const router = useRouter()
  const { user, authenticated } = usePrivy()
  const [activeTab, setActiveTab] = useState<'explore' | 'my-campaigns'>('explore')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [myCampaigns, setMyCampaigns] = useState<any[]>([])
  const [myParticipations, setMyParticipations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showWizard, setShowWizard] = useState(false)

  useEffect(() => {
    if (!authenticated) {
      router.push('/login')
      return
    }
    loadData()
  }, [authenticated, user])

  const loadData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Load all active campaigns for explore tab
      const campaignsRes = await fetch('/api/bounties/campaigns?status=ACTIVE')
      if (campaignsRes.ok) {
        const data = await campaignsRes.json()
        setCampaigns(data.campaigns || [])
      }

      // Load user's created campaigns
      const myRes = await fetch(`/api/bounties/campaigns?creatorId=${user.id}`)
      if (myRes.ok) {
        const data = await myRes.json()
        setMyCampaigns(data.campaigns || [])
      }

      // Load user's participations
      const participationsRes = await fetch(`/api/bounties/me?userId=${user.id}`)
      if (participationsRes.ok) {
        const data = await participationsRes.json()
        setMyParticipations(data.participations || [])
      }
    } catch (error) {
      console.error('[BOUNTIES] Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignCreated = () => {
    setShowWizard(false)
    loadData()
    setActiveTab('my-campaigns')
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-black bg-white">
        <div className="text-center">
          <div className="text-xl font-mono dark:text-green-400 text-green-700 animate-pulse">
            LOADING_AUTHENTICATION...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dark:bg-black bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 dark:text-green-400 text-green-700" />
              <h1 className="text-3xl font-bold font-mono dark:text-green-400 text-green-700">
                &gt; BOUNTIES
              </h1>
            </div>
            {activeTab === 'my-campaigns' && (
              <Button
                onClick={() => setShowWizard(true)}
                className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
              >
                <Plus className="h-4 w-4 mr-2" />
                CREATE_CAMPAIGN
              </Button>
            )}
          </div>
          <p className="text-sm font-mono dark:text-green-400/70 text-green-700/80">
            Create bounties for fans to promote your music and earn rewards
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b-2 dark:border-green-400/30 border-green-600/40">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-3 font-mono text-sm transition-all ${
              activeTab === 'explore'
                ? 'dark:text-green-400 text-green-700 border-b-2 dark:border-green-400 border-green-600 -mb-0.5'
                : 'dark:text-green-400/60 text-green-700/70 hover:dark:text-green-400 hover:text-green-700'
            }`}
          >
            EXPLORE_BOUNTIES
          </button>
          <button
            onClick={() => setActiveTab('my-campaigns')}
            className={`px-6 py-3 font-mono text-sm transition-all ${
              activeTab === 'my-campaigns'
                ? 'dark:text-green-400 text-green-700 border-b-2 dark:border-green-400 border-green-600 -mb-0.5'
                : 'dark:text-green-400/60 text-green-700/70 hover:dark:text-green-400 hover:text-green-700'
            }`}
          >
            MY_CAMPAIGNS ({myCampaigns.length})
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="border-2 dark:border-green-400/30 border-green-600/40 p-6 animate-pulse">
                <div className="h-6 dark:bg-green-400/20 bg-green-600/20 rounded mb-4"></div>
                <div className="h-4 dark:bg-green-400/10 bg-green-600/10 rounded mb-2"></div>
                <div className="h-4 dark:bg-green-400/10 bg-green-600/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'explore' && (
              <div>
                {campaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map(campaign => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        isParticipant={myParticipations.some(p => p.campaignId === campaign.id)}
                        onJoin={loadData}
                        userId={user?.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 dark:border-green-400/30 border-green-600/40 p-12 text-center">
                    <Target className="h-16 w-16 dark:text-green-400/30 text-green-700/40 mx-auto mb-4" />
                    <h3 className="text-lg font-mono dark:text-green-400 text-green-700 mb-2">
                      NO_ACTIVE_BOUNTIES
                    </h3>
                    <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70 mb-4">
                      Check back soon for new opportunities to earn
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'my-campaigns' && (
              <div>
                {myCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCampaigns.map(campaign => (
                      <CampaignCard
                        key={campaign.id}
                        campaign={campaign}
                        isCreator={true}
                        onUpdate={loadData}
                        userId={user?.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="border-2 dark:border-green-400/30 border-green-600/40 p-12 text-center">
                    <Plus className="h-16 w-16 dark:text-green-400/30 text-green-700/40 mx-auto mb-4" />
                    <h3 className="text-lg font-mono dark:text-green-400 text-green-700 mb-2">
                      CREATE_YOUR_FIRST_BOUNTY
                    </h3>
                    <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70 mb-6">
                      Get fans to promote your music and earn rewards based on views or conversions
                    </p>
                    <Button
                      onClick={() => setShowWizard(true)}
                      className="dark:bg-green-400 bg-green-600 dark:text-black text-white font-mono"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      CREATE_CAMPAIGN
                    </Button>
                  </div>
                )}

                {/* My Participations Section */}
                {myParticipations.length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700 mb-4">
                      &gt; MY_PARTICIPATIONS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myParticipations.map(participation => (
                        <CampaignCard
                          key={participation.id}
                          campaign={participation.campaign}
                          participation={participation}
                          userId={user?.id}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Campaign Wizard Modal */}
      {showWizard && (
        <CreateCampaignWizard
          userId={user?.id || ''}
          onClose={() => setShowWizard(false)}
          onSuccess={handleCampaignCreated}
        />
      )}
    </div>
  )
}
