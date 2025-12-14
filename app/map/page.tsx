'use client'

import { useState, useEffect } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import dynamic from 'next/dynamic'
import { MapPin, Loader2, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types/profile'

// Dynamically import map components with SSR disabled
const CreatorMap = dynamic(
  () => import('@/components/network/CreatorMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center dark:bg-black/50 bg-gray-100 border-2 dark:border-green-400/30 border-gray-300">
        <div className="text-center">
          <Loader2 className="h-12 w-12 dark:text-green-400 text-gray-600 animate-spin mx-auto mb-4" />
          <p className="font-mono dark:text-green-400 text-gray-700">LOADING_MAP...</p>
        </div>
      </div>
    )
  }
)

const StudioMap = dynamic(
  () => import('@/components/map/StudioMap').then(mod => mod),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen flex items-center justify-center dark:bg-black/50 bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 dark:text-green-400 text-gray-600 animate-spin mx-auto mb-4" />
          <p className="font-mono dark:text-green-400 text-gray-700">LOADING_STUDIOS...</p>
        </div>
      </div>
    )
  }
)

export default function MapPage() {
  const [mapView, setMapView] = useState<'creators' | 'studios'>('studios')
  
  // Show studio map by default
  if (mapView === 'studios') {
    return (
      <div className="relative">
        {/* Toggle Button */}
        <div className="absolute top-4 right-4 z-30">
          <Button
            onClick={() => setMapView('creators')}
            className="dark:bg-purple-400 bg-purple-600 dark:text-black text-white font-mono"
          >
            <Users className="h-4 w-4 mr-2" />
            VIEW_CREATORS
          </Button>
        </div>
        <StudioMap />
      </div>
    )
  }
  
  // Creator map view (original implementation)
  return <CreatorMapView onSwitchToStudios={() => setMapView('studios')} />
}

function CreatorMapView({ onSwitchToStudios }: { onSwitchToStudios: () => void }) {
  const { user, authenticated } = usePrivy()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/profiles')
      
      if (!response.ok) {
        throw new Error('Failed to fetch profiles')
      }
      
      const data = await response.json()
      setProfiles(data.profiles || [])
    } catch (err: any) {
      console.error('[MAP] Error fetching profiles:', err)
      setError(err.message || 'Failed to load creator map')
    } finally {
      setLoading(false)
    }
  }

  // Filter profiles with location data
  const profilesWithLocation = profiles.filter(p => 
    p.locationLat && p.locationLng
  )

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-8 w-8 dark:text-green-400 text-green-700" />
              <h1 className="text-4xl font-bold font-mono dark:text-green-400 text-green-700">
                CREATOR_MAP
              </h1>
            </div>
            <p className="dark:text-green-400/60 text-green-700/70 font-mono text-sm">
              Discover creators near you · {profilesWithLocation.length} creator{profilesWithLocation.length !== 1 ? 's' : ''} on the map
            </p>
          </div>
          <Button
            onClick={onSwitchToStudios}
            className="dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white font-mono"
          >
            <Building2 className="h-4 w-4 mr-2" />
            VIEW_STUDIOS
          </Button>
        </div>

        {/* Map Container */}
        <div className="border-2 dark:border-green-400 border-green-600 rounded-lg overflow-hidden">
          {loading ? (
            <div className="w-full h-[600px] flex items-center justify-center dark:bg-black/50 bg-gray-100">
              <div className="text-center">
                <Loader2 className="h-12 w-12 dark:text-green-400 text-gray-600 animate-spin mx-auto mb-4" />
                <p className="font-mono dark:text-green-400 text-gray-700">LOADING_CREATORS...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-[600px] flex items-center justify-center dark:bg-black/50 bg-gray-100">
              <div className="text-center p-8">
                <MapPin className="h-16 w-16 dark:text-red-400 text-red-600 mx-auto mb-4" />
                <p className="font-mono dark:text-red-400 text-red-600 mb-2">ERROR_LOADING_MAP</p>
                <p className="text-sm dark:text-green-400/60 text-gray-600">{error}</p>
                <button
                  onClick={fetchProfiles}
                  className="mt-4 px-4 py-2 border-2 dark:border-green-400 border-green-600 dark:text-green-400 text-green-700 font-mono hover:bg-green-400/10 transition-colors"
                >
                  RETRY
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-[600px]">
              <CreatorMap profiles={profiles} />
            </div>
          )}
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
              <div className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                {profiles.length}
              </div>
              <div className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                TOTAL_CREATORS
              </div>
            </div>
            
            <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
              <div className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                {profilesWithLocation.length}
              </div>
              <div className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                ON_MAP
              </div>
            </div>
            
            <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
              <div className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
                {Math.round((profilesWithLocation.length / Math.max(profiles.length, 1)) * 100)}%
              </div>
              <div className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                WITH_LOCATION
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        {!loading && !error && profilesWithLocation.length === 0 && (
          <div className="mt-6 border-2 dark:border-yellow-400/30 border-yellow-600/40 p-6 dark:bg-yellow-400/5 bg-yellow-50/50">
            <p className="font-mono dark:text-yellow-400 text-yellow-700 mb-2">
              ⚠️ NO_CREATORS_WITH_LOCATION
            </p>
            <p className="text-sm font-mono dark:text-green-400/60 text-gray-600">
              Creators will appear on the map once they add their location in their profile settings.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
