'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, Search, MapPin, Briefcase, X, Star, Building2, Map } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState<'people' | 'bounties' | 'map'>('people')
  
  // People tab state
  const [people, setPeople] = useState<Profile[]>([])
  const [peopleSearch, setPeopleSearch] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedXpTier, setSelectedXpTier] = useState<string>('')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  
  // Bounties tab state
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [bountiesSearch, setBountiesSearch] = useState('')
  const [selectedBountyRole, setSelectedBountyRole] = useState<BountyRole | ''>('')
  const [bountiesRemoteOnly, setBountiesRemoteOnly] = useState(false)
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Map view state
  const [mapView, setMapView] = useState<'creators' | 'studios'>('studios')

  // Check URL params for initial tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'bounties' || tab === 'map') {
      setActiveTab(tab as 'bounties' | 'map')
    }
  }, [searchParams])

  // Fetch people
  useEffect(() => {
    if (activeTab === 'people') {
      const profiles = getAllProfiles()
      setPeople(profiles)
    }
  }, [activeTab])

  // Fetch bounties with filters
  useEffect(() => {
    if (activeTab === 'bounties') {
      fetchBounties()
    }
  }, [activeTab, bountiesSearch, selectedBountyRole, bountiesRemoteOnly])

  const fetchBounties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (bountiesSearch) params.set('search', bountiesSearch)
      if (selectedBountyRole) params.set('role', selectedBountyRole)
      if (bountiesRemoteOnly) params.set('remote', 'true')
      params.set('status', 'OPEN')
      
      const response = await fetch(`/api/bounties?${params}`)
      const data = await response.json()
      setBounties(data.bounties || [])
    } catch (error) {
      console.error('[NETWORK] Error fetching bounties:', error)
      setBounties([])
    } finally {
      setLoading(false)
    }
  }

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
        <div className="flex gap-4 mb-8">
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
            onClick={() => setActiveTab('bounties')}
            className={`flex items-center gap-2 px-6 py-3 border-2 font-mono transition-all ${
              activeTab === 'bounties'
                ? 'bg-green-400 text-black border-green-400'
                : 'dark:bg-black dark:text-green-400 dark:border-green-400/30 bg-white text-gray-700 border-gray-300 hover:border-green-400 dark:hover:border-green-400'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            BOUNTIES
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

        {/* Bounties Tab */}
        {activeTab === 'bounties' && (
          <div>
            {/* Filters */}
            <div className="mb-8 border-2 border-green-400/30 p-6 space-y-4">
              <h2 className="text-xl mb-4">&gt; FILTERS</h2>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400/50" />
                <input
                  type="text"
                  value={bountiesSearch}
                  onChange={(e) => setBountiesSearch(e.target.value)}
                  placeholder="SEARCH_BOUNTIES"
                  className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 pl-10 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">ROLE</label>
                  <select
                    value={selectedBountyRole}
                    onChange={(e) => setSelectedBountyRole(e.target.value as BountyRole | '')}
                    className="w-full bg-black border-2 border-green-400/50 text-green-400 font-mono px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">ALL_ROLES</option>
                    <option value="ARTIST">ARTIST</option>
                    <option value="PRODUCER">PRODUCER</option>
                    <option value="ENGINEER">ENGINEER</option>
                    <option value="SONGWRITER">SONGWRITER</option>
                    <option value="MUSICIAN">MUSICIAN</option>
                    <option value="STUDIO">STUDIO</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bountiesRemoteOnly}
                      onChange={(e) => setBountiesRemoteOnly(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-green-400">REMOTE_OK_ONLY</span>
                  </label>
                </div>
              </div>

              <div className="text-sm text-green-400/60">
                SHOWING {bounties.length} OPEN_BOUNTIES
              </div>
            </div>

            {/* Bounties Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <BountyCardSkeleton key={i} />
                ))}
              </div>
            ) : bounties.length === 0 ? (
              <div className="border-2 border-green-400/30 p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-green-400/50" />
                <p className="text-green-400/70">NO_BOUNTIES_FOUND</p>
                <p className="text-sm text-green-400/50 mt-2">Try adjusting your filters or check back later</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bounties.map(bounty => (
                  <div key={bounty.id} className="border-2 dark:border-green-400/30 border-gray-300 p-6 hover:border-green-400 transition-all cursor-pointer" onClick={() => setSelectedBounty(bounty)}>
                    <h3 className="text-xl font-bold mb-2 dark:text-green-400 text-gray-900">{bounty.title}</h3>
                    
                    {bounty.creatorName && bounty.userId && (
                      <Link 
                        href={`/profile/${bounty.userId}`}
                        className="text-sm dark:text-green-400/70 text-gray-600 mb-3 hover:underline inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        by {bounty.creatorName} →
                      </Link>
                    )}
                    
                    <div className="mb-3">
                      <span className="px-2 py-1 border border-pink-400 text-pink-400 text-xs">
                        ROLE: {bounty.role}
                      </span>
                    </div>

                    <p className="text-sm text-green-400/80 mb-4 line-clamp-2">
                      {bounty.description}
                    </p>

                    <div className="space-y-2 text-sm text-green-400/70 mb-4">
                      <div>BUDGET: {formatBudget(bounty)}</div>
                      
                      {bounty.deadline && (
                        <div className="text-xs text-green-400/60">
                          DEADLINE: {new Date(bounty.deadline).toLocaleDateString()}
                        </div>
                      )}

                      <div className="text-xs text-green-400/60">
                        {bounty.remoteOk ? 'REMOTE_OK' : `${bounty.locationCity}, ${bounty.locationCountry}`}
                      </div>

                      {bounty.applicantsCount !== undefined && (
                        <div className="text-xs text-green-400/60">
                          {bounty.applicantsCount} APPLICANTS
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => setSelectedBounty(bounty)}
                      className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
                    >
                      VIEW_DETAILS
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bounty Detail Modal */}
        {selectedBounty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl border-2 border-green-400 bg-black p-8 font-mono text-green-400 max-h-[80vh] overflow-y-auto">
              <button
                onClick={() => setSelectedBounty(null)}
                className="absolute right-4 top-4 text-green-400 hover:text-green-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold mb-4 pr-8">{selectedBounty.title}</h2>
              
              {selectedBounty.creatorName && (
                <div className="mb-4 text-sm text-green-400/70">
                  Posted by {selectedBounty.creatorName}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg mb-2">&gt; DESCRIPTION</h3>
                <p className="text-green-400/80">{selectedBounty.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-green-400/70 mb-1">ROLE</div>
                  <div className="font-bold">{selectedBounty.role}</div>
                </div>
                <div>
                  <div className="text-sm text-green-400/70 mb-1">BUDGET</div>
                  <div className="font-bold">{formatBudget(selectedBounty)}</div>
                </div>
                <div>
                  <div className="text-sm text-green-400/70 mb-1">LOCATION</div>
                  <div className="font-bold">
                    {selectedBounty.remoteOk ? 'REMOTE_OK' : `${selectedBounty.locationCity}`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-green-400/70 mb-1">DEADLINE</div>
                  <div className="font-bold">
                    {selectedBounty.deadline ? new Date(selectedBounty.deadline).toLocaleDateString() : 'NO_HARD_DEADLINE'}
                  </div>
                </div>
              </div>

              {selectedBounty.genreTags && selectedBounty.genreTags.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm text-green-400/70 mb-2">GENRES</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBounty.genreTags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 border border-green-400/30">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-green-400/20 pt-4 mb-6">
                <div className="text-sm text-green-400/60">
                  {selectedBounty.applicantsCount || 0} people have applied for this bounty
                </div>
              </div>

              <Button 
                className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
                onClick={() => {
                  alert('Contact functionality coming soon!')
                }}
              >
                COPY_CONTACT_INSTRUCTIONS
              </Button>

              <div className="mt-4 text-xs text-green-400/60 text-center">
                // TODO: In-app "Apply" and messaging coming soon
              </div>
            </div>
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
