'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Users, Search, X } from 'lucide-react'
import { CreatorProfileOnMap, CreatorRole } from '@/types/creator'
import { mockProfilesOnMap } from '@/lib/mockProfilesOnMap'
import dynamic from 'next/dynamic'

// Dynamically import map component
const CreatorMap = dynamic(
  () => import('@/components/creator-map/CreatorMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center dark:bg-black/50 bg-gray-100">
        <div className="text-center">
          <MapPin className="h-12 w-12 dark:text-green-400 text-gray-600 animate-pulse mx-auto mb-4" />
          <p className="font-mono dark:text-green-400 text-gray-700">LOADING_MAP...</p>
        </div>
      </div>
    )
  }
)

const ROLE_FILTERS: CreatorRole[] = ['ARTIST', 'PRODUCER', 'ENGINEER', 'STUDIO', 'MODEL', 'INFLUENCER']

export default function CreatorMapPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<CreatorProfileOnMap[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedRoles, setSelectedRoles] = useState<CreatorRole[]>([])
  const [locationSearch, setLocationSearch] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)

  useEffect(() => {
    // Load profiles (using mock data for now)
    setLoading(true)
    setTimeout(() => {
      setProfiles(mockProfilesOnMap)
      setLoading(false)
    }, 500)
  }, [])

  // Filter profiles
  const filteredProfiles = profiles.filter(profile => {
    // Role filter
    if (selectedRoles.length > 0) {
      const hasRole = profile.roles.some(role => selectedRoles.includes(role))
      if (!hasRole) return false
    }

    // Location filter
    if (locationSearch) {
      const locationString = `${profile.city || ''} ${profile.state || ''} ${profile.country || ''}`.toLowerCase()
      if (!locationString.includes(locationSearch.toLowerCase())) return false
    }

    return true
  })

  const toggleRole = (role: CreatorRole) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }

  const clearFilters = () => {
    setSelectedRoles([])
    setLocationSearch('')
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-8 w-8 dark:text-green-400 text-green-700" />
              <h1 className="text-4xl font-bold font-mono dark:text-green-400 text-green-700">
                &gt; CREATOR_MAP
              </h1>
            </div>
            <div className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
              SHOWING {filteredProfiles.length} CREATOR{filteredProfiles.length !== 1 ? 'S' : ''}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
              &gt; FILTERS
            </h3>
            {(selectedRoles.length > 0 || locationSearch) && (
              <button
                onClick={clearFilters}
                className="text-xs font-mono dark:text-pink-400 text-pink-600 hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                CLEAR_ALL
              </button>
            )}
          </div>

          {/* Role Pills */}
          <div className="mb-4">
            <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
              ROLES:
            </label>
            <div className="flex flex-wrap gap-2">
              {ROLE_FILTERS.map(role => (
                <button
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 text-xs font-mono border-2 transition-all ${
                    selectedRoles.includes(role)
                      ? 'dark:bg-green-400 dark:text-black dark:border-green-400 bg-green-600 text-white border-green-600'
                      : 'dark:bg-black dark:text-green-400 dark:border-green-400/50 dark:hover:border-green-400 bg-white text-green-700 border-green-600/50 hover:border-green-600'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Location Search */}
          <div>
            <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
              LOCATION:
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-green-400/50 text-green-700/50" />
              <input
                type="text"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                placeholder="Search city, state, or country..."
                className="w-full pl-10 pr-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none dark:focus:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
              />
            </div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Creator List */}
          <div className="lg:col-span-1 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white/80 p-4 max-h-[600px] overflow-y-auto">
            <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-4 sticky top-0 dark:bg-black bg-white pb-2">
              &gt; CREATORS
            </h3>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border-2 dark:border-green-400/20 border-gray-300 p-3 animate-pulse">
                    <div className="h-4 dark:bg-green-400/20 bg-gray-200 w-3/4 mb-2"></div>
                    <div className="h-3 dark:bg-green-400/10 bg-gray-100 w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 dark:text-green-400/30 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-mono dark:text-green-400/60 text-gray-600">
                  NO_CREATORS_FOUND
                </p>
                <p className="text-xs font-mono dark:text-green-400/40 text-gray-500 mt-1">
                  Try adjusting filters
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProfiles.map(profile => (
                  <button
                    key={profile.id}
                    onClick={() => setSelectedProfile(profile.id)}
                    onMouseEnter={() => setSelectedProfile(profile.id)}
                    className={`w-full text-left border-2 p-3 transition-all ${
                      selectedProfile === profile.id
                        ? 'dark:border-green-400 dark:bg-green-400/10 border-green-600 bg-green-50'
                        : 'dark:border-green-400/20 dark:hover:border-green-400/50 border-gray-300 hover:border-green-600/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-mono font-bold text-sm dark:text-green-400 text-green-700">
                        {profile.name}
                      </h4>
                      {profile.xp && (
                        <span className="text-xs font-mono dark:text-cyan-400 text-cyan-600">
                          {profile.xp} XP
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {profile.roles.map(role => (
                        <span
                          key={role}
                          className="text-xs px-1.5 py-0.5 border dark:border-pink-400/50 dark:text-pink-400 border-pink-600/50 text-pink-700 font-mono"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                      <MapPin className="h-3 w-3" />
                      {profile.city}{profile.city && profile.state && ', '}{profile.state}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Map */}
          <div className="lg:col-span-2 border-2 dark:border-green-400/30 border-green-600/40 overflow-hidden h-[600px]">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center dark:bg-black/50 bg-gray-100">
                <div className="text-center">
                  <MapPin className="h-12 w-12 dark:text-green-400 text-gray-600 animate-pulse mx-auto mb-4" />
                  <p className="font-mono dark:text-green-400 text-gray-700">LOADING_MAP...</p>
                </div>
              </div>
            ) : (
              <CreatorMap
                profiles={filteredProfiles}
                selectedId={selectedProfile}
                onSelectProfile={setSelectedProfile}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
