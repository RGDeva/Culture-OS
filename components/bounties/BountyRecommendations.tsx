'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Loader2, Filter, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Bounty, BountyRole } from '@/types/bounty'
import { getCurrentLocation, formatDistance } from '@/lib/location-utils'
import { TerminalText } from '@/components/ui/terminal-text'

interface BountyRecommendationsProps {
  userId?: string
  userRole?: BountyRole
  onBountyClick?: (bounty: Bounty) => void
}

export function BountyRecommendations({
  userId,
  userRole,
  onBountyClick
}: BountyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<(Bounty & { distance?: number; recommendationScore?: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRole, setSelectedRole] = useState<BountyRole | 'ALL'>(userRole || 'ALL')
  const [maxDistance, setMaxDistance] = useState<number>(100) // km
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const roles: BountyRole[] = ['ARTIST', 'PRODUCER', 'ENGINEER', 'SONGWRITER', 'MUSICIAN', 'STUDIO', 'OTHER']

  const fetchRecommendations = async (lat?: number, lng?: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (lat && lng) {
        params.set('lat', lat.toString())
        params.set('lng', lng.toString())
        params.set('maxDistance', maxDistance.toString())
      }
      
      if (selectedRole !== 'ALL') {
        params.set('role', selectedRole)
      }
      
      if (remoteOnly) {
        params.set('remoteOnly', 'true')
      }

      const response = await fetch(`/api/bounties/recommendations?${params}`)
      const data = await response.json()
      
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('[BOUNTY_RECOMMENDATIONS] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGetLocation = async () => {
    setLocationLoading(true)
    try {
      const location = await getCurrentLocation()
      if (location) {
        setUserLocation(location)
        await fetchRecommendations(location.lat, location.lng)
      }
    } catch (error) {
      console.error('[BOUNTY_RECOMMENDATIONS] Location error:', error)
    } finally {
      setLocationLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations(userLocation?.lat, userLocation?.lng)
  }, [selectedRole, maxDistance, remoteOnly])

  useEffect(() => {
    // Initial load without location
    fetchRecommendations()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-2 border-green-400/30 p-6">
        <h2 className="text-2xl font-mono font-bold text-green-400 mb-2">
          &gt; <TerminalText text="RECOMMENDED_GIGS" speed={40} cursor={false} />
        </h2>
        <p className="text-green-400/70 text-sm font-mono">
          Personalized bounties based on your location and skills
        </p>
      </div>

      {/* Location & Filters */}
      <div className="border-2 border-green-400/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-mono text-green-400 font-bold">
                {userLocation ? 'LOCATION_ENABLED' : 'LOCATION_DISABLED'}
              </p>
              <p className="text-xs text-green-400/60 font-mono">
                {userLocation 
                  ? `Showing gigs near you (${maxDistance}km radius)`
                  : 'Enable location for nearby gigs'
                }
              </p>
            </div>
          </div>
          <Button
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="bg-green-400 text-black hover:bg-green-300 font-mono"
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Navigation className="mr-2 h-4 w-4" />
                {userLocation ? 'UPDATE' : 'ENABLE'}
              </>
            )}
          </Button>
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-green-400 hover:text-green-300 font-mono text-sm"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'HIDE_FILTERS' : 'SHOW_FILTERS'}
        </button>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-green-400/30">
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-mono text-green-400 mb-2">FILTER_BY_ROLE</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedRole('ALL')}
                  className={`px-3 py-1 border font-mono text-xs transition-all ${
                    selectedRole === 'ALL'
                      ? 'bg-green-400 text-black border-green-400'
                      : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                  }`}
                >
                  ALL
                </button>
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-1 border font-mono text-xs transition-all ${
                      selectedRole === role
                        ? 'bg-green-400 text-black border-green-400'
                        : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance Filter */}
            {userLocation && (
              <div>
                <label className="block text-sm font-mono text-green-400 mb-2">
                  MAX_DISTANCE: {maxDistance}km
                </label>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full accent-green-400"
                />
                <div className="flex justify-between text-xs text-green-400/60 font-mono mt-1">
                  <span>5km</span>
                  <span>500km</span>
                </div>
              </div>
            )}

            {/* Remote Only */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remoteOnly}
                  onChange={(e) => setRemoteOnly(e.target.checked)}
                  className="accent-green-400"
                />
                <span className="text-sm font-mono text-green-400">REMOTE_ONLY</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="border-2 border-green-400/30 p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-400" />
            <p className="text-green-400 font-mono">LOADING_RECOMMENDATIONS...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="border-2 border-green-400/30 p-8 text-center">
            <p className="text-green-400 font-mono mb-2">NO_RECOMMENDATIONS_FOUND</p>
            <p className="text-green-400/60 text-sm font-mono">
              Try adjusting your filters or enabling location
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-green-400/70 font-mono">
              SHOWING {recommendations.length} RECOMMENDED GIGS
            </p>
            {recommendations.map((bounty, index) => (
              <div
                key={bounty.id}
                onClick={() => onBountyClick?.(bounty)}
                className="border-2 border-green-400/30 hover:border-green-400 transition-all p-4 cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Recommendation Badge */}
                    {index < 3 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-400 text-black text-xs font-bold mb-2">
                        <Star className="h-3 w-3 fill-black" />
                        TOP_MATCH
                      </div>
                    )}
                    
                    <h3 className="text-lg font-bold text-green-400 group-hover:text-green-300 mb-1">
                      {bounty.title}
                    </h3>
                    
                    <p className="text-sm text-green-400/80 mb-3 line-clamp-2">
                      {bounty.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-green-400/70 font-mono">
                      <span className="px-2 py-1 bg-green-400/10 border border-green-400/30">
                        {bounty.role}
                      </span>
                      
                      {bounty.budgetMinUSDC && (
                        <span>${bounty.budgetMinUSDC}{bounty.budgetMaxUSDC && ` - $${bounty.budgetMaxUSDC}`} USDC</span>
                      )}
                      
                      {bounty.distance !== undefined && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {formatDistance(bounty.distance)}
                        </span>
                      )}
                      
                      {bounty.remoteOk && (
                        <span className="text-green-400">REMOTE_OK</span>
                      )}
                      
                      {bounty.locationCity && (
                        <span>{bounty.locationCity}, {bounty.locationCountry}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Recommendation Score */}
                  {bounty.recommendationScore !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">
                        {Math.round(bounty.recommendationScore)}
                      </div>
                      <div className="text-xs text-green-400/60 font-mono">MATCH</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
