'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProfileIntel } from '@/types/profile'
import { TrendingUp, Users, Music, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ProfileIntelCardProps {
  userId: string
}

export function ProfileIntelCard({ userId }: ProfileIntelCardProps) {
  const [intel, setIntel] = useState<ProfileIntel | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (userId) {
      loadIntel()
    } else {
      setIsLoading(false)
    }
  }, [userId])
  
  const loadIntel = async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch(`/api/profile/intel?userId=${userId}`, {
        headers: { 'x-user-id': userId }
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          // Profile not found - this is okay, don't show error
          setIntel(null)
          return
        }
        throw new Error('Failed to load intelligence')
      }
      
      const data = await response.json()
      setIntel(data)
    } catch (err: any) {
      console.error('[INTEL] Error loading intelligence:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="border-2 border-green-400/50 bg-black/90 p-6 font-mono mb-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
          <span className="ml-3 text-green-400">LOADING_INTELLIGENCE...</span>
        </div>
      </div>
    )
  }
  
  if (error || !intel) {
    return null // Don't show anything if there's an error or no data
  }
  
  // Calculate platform count
  const platformCount = [
    intel.hasSpotify,
    intel.hasAppleMusic,
    intel.hasYoutube,
    intel.hasSoundcloud,
    intel.hasInstagram,
    intel.hasTikTok,
    intel.hasX
  ].filter(Boolean).length
  
  return (
    <div className="border-2 border-green-400 bg-black/90 p-6 font-mono mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl text-green-400">
          <span className="text-pink-500">&gt;_</span> PROFILE_INTELLIGENCE
        </h2>
        <div className="text-xs text-green-400/70">
          {intel.profileCompleteness}% COMPLETE
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Monthly Listeners */}
        {intel.estimatedMonthlyListeners > 0 && (
          <div className="border border-green-400/30 p-3">
            <div className="flex items-center gap-2 text-green-400/70 text-xs mb-1">
              <Music className="w-3 h-3" />
              STREAMS_EST
            </div>
            <div className="text-2xl text-green-400 font-bold">
              ~{(intel.estimatedMonthlyListeners / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-green-400/50">/ MONTH</div>
          </div>
        )}
        
        {/* Social Followers */}
        {intel.estimatedSocialFollowers > 0 && (
          <div className="border border-green-400/30 p-3">
            <div className="flex items-center gap-2 text-green-400/70 text-xs mb-1">
              <Users className="w-3 h-3" />
              FOLLOWERS_EST
            </div>
            <div className="text-2xl text-green-400 font-bold">
              ~{(intel.estimatedSocialFollowers / 1000).toFixed(0)}K
            </div>
            <div className="text-xs text-green-400/50">TOTAL</div>
          </div>
        )}
        
        {/* Platforms Connected */}
        <div className="border border-green-400/30 p-3">
          <div className="flex items-center gap-2 text-green-400/70 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            PLATFORMS
          </div>
          <div className="text-2xl text-green-400 font-bold">
            {platformCount}
          </div>
          <div className="text-xs text-green-400/50">CONNECTED</div>
        </div>
      </div>
      
      {/* Savings Message */}
      {intel.suggestedSavingsMessage && (
        <div className="bg-green-400/10 border border-green-400/30 p-4 mb-6">
          <div className="text-xs text-green-400/70 mb-1">ESTIMATED_GAIN</div>
          <div className="text-sm text-green-400">
            {intel.suggestedSavingsMessage}
          </div>
        </div>
      )}
      
      {/* Campaign Suggestions */}
      {intel.suggestedCampaigns && intel.suggestedCampaigns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm text-green-400 mb-3">
            SUGGESTED_CAMPAIGNS
          </h3>
          <div className="space-y-2">
            {intel.suggestedCampaigns.map((campaign, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-green-400/80"
              >
                <span className="text-pink-500 mt-1">&gt;</span>
                <span>{campaign}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/marketplace" className="flex-1">
          <Button
            className="w-full bg-green-400 text-black hover:bg-green-500 font-mono group"
          >
            <span>&gt; OPEN_MARKETPLACE</span>
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
        <Link href="/vault" className="flex-1">
          <Button
            variant="outline"
            className="w-full border-green-400 text-green-400 hover:bg-green-400/10 font-mono"
          >
            &gt; VIEW_VAULT
          </Button>
        </Link>
      </div>
      
      {/* Footer hint */}
      <div className="mt-4 text-xs text-green-400/50 text-center">
        Add more platform links to improve intelligence accuracy
      </div>
    </div>
  )
}
