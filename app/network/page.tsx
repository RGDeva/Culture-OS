'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, Search, MapPin, Briefcase, X, Star, Building2, Map, DollarSign, Target, Zap } from "lucide-react"
import { calculateXpTier, getTierInfo } from "@/lib/xp-system"
import Link from "next/link"
import { getAllProfiles } from "@/lib/profileStore"
import { Profile } from "@/types/profile"
import { Bounty, BountyRole } from "@/types/bounty"
import { TerminalText } from "@/components/ui/terminal-text"
import { BountyCardSkeleton, ProfileCardSkeleton } from "@/components/ui/loading-skeleton"
import { ProfileCard } from "@/components/network/ProfileCard"
import { ProfileDetailModal } from "@/components/network/ProfileDetailModal"
import dynamic from 'next/dynamic'

const CreatorMap = dynamic(() => import('@/components/network/CreatorMap'), { ssr: false })
const StudioMap = dynamic(() => import('@/components/map/StudioMapSimple'), { ssr: false })

// Helper function to format budget
function formatBudget(bounty: Bounty): string {
  if (bounty.budgetType === 'REV_SHARE') return 'REV_SHARE'
  if (bounty.budgetType === 'OPEN_TO_OFFERS') return 'OPEN_TO_OFFERS'
  if (bounty.budgetMinUSDC && bounty.budgetMaxUSDC) {
    return `$${bounty.budgetMinUSDC}–$${bounty.budgetMaxUSDC} ${bounty.budgetType}`
  }
  if (bounty.budgetMinUSDC) return `$${bounty.budgetMinUSDC}+ ${bounty.budgetType}`
  return bounty.budgetType
}

export default function NetworkPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'people' | 'studios' | 'map'>('people')
  
  // People tab state
  const [people, setPeople] = useState<Profile[]>([])
  const [peopleSearch, setPeopleSearch] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedXpTier, setSelectedXpTier] = useState<string>('')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  
  const [loading, setLoading] = useState(false)
  
  // Map view state
  const [mapView, setMapView] = useState<'creators' | 'studios'>('studios')

  // Check URL params for initial tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'studios' || tab === 'map') {
      setActiveTab(tab as 'studios' | 'map')
    }
  }, [searchParams])

  // Fetch people from API
  useEffect(() => {
    if (activeTab === 'people') {
      fetchPeople()
    }
  }, [activeTab])

  const fetchPeople = async () => {
    setLoading(true)
    try {
      // Try to get profiles from API first
      const response = await fetch('/api/profiles')
      if (response.ok) {
        const data = await response.json()
        setPeople(data.profiles || [])
      } else {
        // Fallback to local store
        const profiles = getAllProfiles()
        setPeople(profiles)
      }
    } catch (error) {
      console.error('[NETWORK] Error fetching people:', error)
      // Fallback to local store
      const profiles = getAllProfiles()
      setPeople(profiles)
    } finally {
      setLoading(false)
    }
  }

  // Fetch studios (people filtered by studio role)
  useEffect(() => {
    if (activeTab === 'studios') {
      fetchPeople() // Reuse people fetch, filter client-side
    }
  }, [activeTab])

  // Filter people client-side
  const filteredPeople = people.filter(person => {
    const matchesSearch = !peopleSearch || 
      person.displayName?.toLowerCase().includes(peopleSearch.toLowerCase()) ||
      person.bio?.toLowerCase().includes(peopleSearch.toLowerCase()) ||
      person.genres?.some(g => g.toLowerCase().includes(peopleSearch.toLowerCase()))
    
    const matchesRoles = selectedRoles.length === 0 || 
      person.roles?.some(r => selectedRoles.includes(r))
    
    const matchesLocation = !selectedLocation ||
      person.locationCity?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      person.locationState?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      person.locationCountry?.toLowerCase().includes(selectedLocation.toLowerCase())
    
    const matchesGenres = selectedGenres.length === 0 ||
      person.genres?.some(g => selectedGenres.includes(g))
    
    const matchesXpTier = !selectedXpTier || (() => {
      const xp = person.xp || 0
      if (selectedXpTier === 'ROOKIE') return xp < 200
      if (selectedXpTier === 'CORE') return xp >= 200 && xp < 800
      if (selectedXpTier === 'POWER_USER') return xp >= 800
      return true
    })()
    
    return matchesSearch && matchesRoles && matchesLocation && matchesGenres && matchesXpTier
  })

  return (
    <div className="min-h-screen font-mono p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 dark:text-green-400 text-gray-900">&gt; <TerminalText text="NETWORK" speed={50} cursor={false} /></h1>
            <p className="dark:text-green-400/60 text-gray-600">
              <TerminalText text="Discover creators and open collaborations" speed={30} startDelay={500} cursor={false} />
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono">
              HOME
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab('people')}
            className={`flex items-center gap-2 px-6 py-3 border-2 font-mono transition-all ${
              activeTab === 'people'
                ? 'bg-green-400 text-black border-green-400'
                : 'dark:bg-black dark:text-green-400 dark:border-green-400/30 bg-white text-gray-700 border-gray-300 hover:border-green-400 dark:hover:border-green-400'
            }`}
          >
            <Users className="h-4 w-4" />
            PEOPLE
          </button>
          <button
            onClick={() => setActiveTab('studios')}
            className={`flex items-center gap-2 px-6 py-3 border-2 font-mono transition-all ${
              activeTab === 'studios'
                ? 'bg-purple-400 text-black border-purple-400'
                : 'dark:bg-black dark:text-purple-400 dark:border-purple-400/30 bg-white text-purple-700 border-purple-300 hover:border-purple-400 dark:hover:border-purple-400'
            }`}
          >
            <Building2 className="h-4 w-4" />
            STUDIOS
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-6 py-3 border-2 font-mono transition-all ${
              activeTab === 'map'
                ? 'bg-green-400 text-black border-green-400'
                : 'dark:bg-black dark:text-green-400 dark:border-green-400/30 bg-white text-gray-700 border-gray-300 hover:border-green-400 dark:hover:border-green-400'
            }`}
          >
            <Map className="h-4 w-4" />
            MAP
          </button>
          
          {/* Link to Earn page */}
          <Link href="/earn" className="ml-auto">
            <button className="flex items-center gap-2 px-6 py-3 border-2 font-mono transition-all dark:bg-black dark:text-cyan-400 dark:border-cyan-400/30 bg-white text-cyan-700 border-cyan-300 hover:border-cyan-400 dark:hover:border-cyan-400 hover:bg-cyan-400/10">
              <Zap className="h-4 w-4" />
              EARN_WITH_CAMPAIGNS →
            </button>
          </Link>
        </div>

        {/* People Tab */}
        {activeTab === 'people' && (
          <div>
            {/* Filters */}
            <div className="mb-8 border-2 border-green-400/30 p-6 space-y-4">
              <h2 className="text-xl mb-4">&gt; FILTERS</h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400/50" />
                <input
                  type="text"
                  value={peopleSearch}
                  onChange={(e) => setPeopleSearch(e.target.value)}
                  placeholder="SEARCH_BY_NAME_OR_GENRE"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">ROLES</label>
                <div className="flex flex-wrap gap-2">
                  {['ARTIST', 'PRODUCER', 'ENGINEER', 'STUDIO', 'MANAGER', 'MODEL', 'VISUAL_MEDIA', 'INFLUENCER'].map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRoles(prev =>
                          prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
                        )
                      }}
                      className={`px-3 py-1 border text-sm transition-all ${
                        selectedRoles.includes(role)
                          ? 'bg-green-400 text-black border-green-400'
                          : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">LOCATION</label>
                <input
                  type="text"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  placeholder="City, State, or Country"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">GENRES</label>
                <div className="flex flex-wrap gap-2">
                  {['Hip-Hop', 'R&B', 'Pop', 'Electronic', 'Rock', 'Indie'].map(genre => (
                    <button
                      key={genre}
                      onClick={() => {
                        setSelectedGenres(prev =>
                          prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
                        )
                      }}
                      className={`px-3 py-1 border text-xs transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-cyan-400 text-black border-cyan-400'
                          : 'bg-black text-cyan-400 border-cyan-400/30 hover:border-cyan-400'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-green-400/70">XP_TIER</label>
                <div className="flex gap-2">
                  {['', 'ROOKIE', 'CORE', 'POWER_USER'].map(tier => (
                    <button
                      key={tier || 'all'}
                      onClick={() => setSelectedXpTier(tier)}
                      className={`px-3 py-1 border text-xs transition-all ${
                        selectedXpTier === tier
                          ? 'bg-pink-400 text-black border-pink-400'
                          : 'bg-black text-pink-400 border-pink-400/30 hover:border-pink-400'
                      }`}
                    >
                      {tier || 'ALL'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-sm text-green-400/60">
                SHOWING {filteredPeople.length} CREATORS
              </div>
            </div>

            {/* People Grid */}
            {filteredPeople.length === 0 ? (
              <div className="border-2 border-green-400/30 p-12 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-green-400/50" />
                <p className="text-green-400/70">NO_CREATORS_FOUND</p>
                <p className="text-sm text-green-400/50 mt-2">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPeople.map(person => (
                  <ProfileCard
                    key={person.id}
                    profile={person}
                    onViewProfile={(profile) => {
                      setSelectedProfile(profile)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Studios Tab */}
        {activeTab === 'studios' && (
          <div>
            {/* Header */}
            <div className="mb-8 border-2 dark:border-purple-400/30 border-purple-300 p-6 dark:bg-purple-400/5 bg-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-6 w-6 dark:text-purple-400 text-purple-700" />
                <h2 className="text-xl font-bold dark:text-purple-400 text-purple-700">&gt; RECORDING_STUDIOS</h2>
              </div>
              <p className="dark:text-purple-400/70 text-purple-700/70 text-sm">
                Find recording studios, mixing rooms, and creative spaces. Connect with studio owners directly.
              </p>
            </div>

            {/* Studios Grid - Filter people by studio-related roles */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProfileCardSkeleton key={i} />
                ))}
              </div>
            ) : (() => {
              const studios = people.filter(p => 
                p.roles?.some(r => 
                  r.toLowerCase().includes('studio') || 
                  r.toLowerCase().includes('engineer') ||
                  r.toLowerCase() === 'studio owner'
                ) || p.classification?.toLowerCase().includes('studio')
              )
              return studios.length === 0 ? (
                <div className="border-2 dark:border-purple-400/30 border-purple-300 p-12 text-center">
                  <Building2 className="h-12 w-12 mx-auto mb-4 dark:text-purple-400/50 text-purple-700/50" />
                  <p className="dark:text-purple-400/70 text-purple-700">NO_STUDIOS_FOUND</p>
                  <p className="text-sm dark:text-purple-400/50 text-purple-700/60 mt-2">
                    Check the Map tab to find studios near you
                  </p>
                  <Button
                    onClick={() => setActiveTab('map')}
                    className="mt-4 dark:bg-purple-400 bg-purple-600 dark:text-black text-white font-mono"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    VIEW_MAP
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studios.map(studio => (
                    <ProfileCard
                      key={studio.id}
                      profile={studio}
                      onViewProfile={(profile) => {
                        setSelectedProfile(profile)
                      }}
                    />
                  ))}
                </div>
              )
            })()}
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div>
            {/* Map View Toggle */}
            <div className="mb-6 flex gap-4 items-center">
              <button
                onClick={() => setMapView('studios')}
                className={`flex items-center gap-2 px-4 py-2 border-2 font-mono transition-all ${
                  mapView === 'studios'
                    ? 'bg-green-400 text-black border-green-400'
                    : 'dark:bg-black dark:text-green-400 dark:border-green-400/30 bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                <Building2 className="h-4 w-4" />
                STUDIOS
              </button>
              <button
                onClick={() => setMapView('creators')}
                className={`flex items-center gap-2 px-4 py-2 border-2 font-mono transition-all ${
                  mapView === 'creators'
                    ? 'bg-green-400 text-black border-green-400'
                    : 'dark:bg-black dark:text-green-400 dark:border-green-400/30 bg-white text-gray-700 border-gray-300 hover:border-green-400'
                }`}
              >
                <Users className="h-4 w-4" />
                CREATORS
              </button>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 border-2 dark:border-green-400/30 border-gray-300 dark:bg-green-400/5 bg-gray-50">
              <p className="dark:text-green-400 text-gray-700 text-sm font-mono">
                {mapView === 'studios' 
                  ? '> Showing recording studios in Massachusetts. Use search to find studios in other locations.'
                  : '> Click on any marker to view creator profiles and their locations'}
              </p>
            </div>

            {/* Map Display */}
            {mapView === 'studios' ? (
              <div className="overflow-hidden" style={{ height: '100vh' }}>
                <StudioMap />
              </div>
            ) : (
              <div className="border-2 dark:border-green-400/30 border-gray-300 overflow-hidden" style={{ height: '600px' }}>
                <CreatorMap profiles={people} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <ProfileDetailModal
          profile={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </div>
  )
}
