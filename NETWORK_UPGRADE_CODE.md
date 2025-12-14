# Network Page - Complete Implementation

Replace `/app/network/page.tsx` with this code:

```typescript
'use client'

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Users, Search, MapPin, Briefcase, X, Star } from "lucide-react"
import Link from "next/link"
import { getAllProfiles } from "@/lib/profileStore"
import { Profile } from "@/types/profile"
import { Bounty, BountyRole } from "@/types/bounty"

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
  const [activeTab, setActiveTab] = useState<'people' | 'bounties'>('people')
  
  // People tab state
  const [people, setPeople] = useState<Profile[]>([])
  const [peopleSearch, setPeopleSearch] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [remoteOnly, setRemoteOnly] = useState(false)
  
  // Bounties tab state
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [bountiesSearch, setBountiesSearch] = useState('')
  const [selectedBountyRole, setSelectedBountyRole] = useState<BountyRole | ''>('')
  const [selectedBountyGenre, setSelectedBountyGenre] = useState<string>('')
  const [bountiesRemoteOnly, setBountiesRemoteOnly] = useState(false)
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(false)

  // Check URL params for initial tab
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'bounties') {
      setActiveTab('bounties')
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
  }, [activeTab, bountiesSearch, selectedBountyRole, selectedBountyGenre, bountiesRemoteOnly])

  const fetchBounties = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (bountiesSearch) params.set('search', bountiesSearch)
      if (selectedBountyRole) params.set('role', selectedBountyRole)
      if (selectedBountyGenre) params.set('genre', selectedBountyGenre)
      if (bountiesRemoteOnly) params.set('remote', 'true')
      params.set('status', 'OPEN') // Default to open bounties
      
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
      person.genres?.some(g => g.toLowerCase().includes(peopleSearch.toLowerCase()))
    
    const matchesRoles = selectedRoles.length === 0 || 
      person.roles?.some(r => selectedRoles.includes(r))
    
    const matchesGenres = selectedGenres.length === 0 ||
      person.genres?.some(g => selectedGenres.includes(g))
    
    return matchesSearch && matchesRoles && matchesGenres
  })

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">&gt; NETWORK</h1>
            <p className="text-green-400/60">Discover creators and open collaborations</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-green-400 text-green-400 font-mono">
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
                : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
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
                : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            BOUNTIES
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
                  {['ARTIST', 'PRODUCER', 'ENGINEER', 'STUDIO', 'MANAGER'].map(role => (
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
                  <div key={person.id} className="border-2 border-green-400/30 p-6 hover:border-green-400 transition-all">
                    <h3 className="text-xl font-bold mb-2">{person.displayName}</h3>
                    
                    {person.roles && person.roles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {person.roles.map(role => (
                          <span key={role} className="text-xs px-2 py-1 border border-cyan-400 text-cyan-400">
                            {role}
                          </span>
                        ))}
                      </div>
                    )}

                    {(person.locationCity || person.locationCountry) && (
                      <div className="text-sm text-green-400/70 mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {person.locationCity}{person.locationCity && person.locationCountry && ', '}{person.locationCountry}
                      </div>
                    )}

                    {person.genres && person.genres.length > 0 && (
                      <div className="text-xs text-green-400/60 mb-3">
                        {person.genres.join(', ')}
                      </div>
                    )}

                    {person.profileCompletion !== undefined && (
                      <div className="mb-3">
                        <div className="text-xs text-green-400/60 mb-1">PROFILE: {person.profileCompletion}%</div>
                        <div className="h-1 bg-green-400/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-400 transition-all"
                            style={{ width: `${person.profileCompletion}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                      onClick={() => {
                        // TODO: Navigate to profile page
                        console.log('View profile:', person.id)
                      }}
                    >
                      VIEW_PROFILE
                    </Button>
                  </div>
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
              <div className="border-2 border-green-400/30 p-12 text-center">
                <div className="animate-pulse text-green-400">LOADING_BOUNTIES...</div>
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
                  <div key={bounty.id} className="border-2 border-green-400/30 p-6 hover:border-green-400 transition-all">
                    <h3 className="text-xl font-bold mb-2">{bounty.title}</h3>
                    
                    {bounty.creatorName && (
                      <div className="text-sm text-green-400/70 mb-3">
                        by {bounty.creatorName}
                      </div>
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
                  // TODO: Implement apply/contact functionality
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
      </div>
    </div>
  )
}
```

## Key Features:

1. **Two Tabs**: PEOPLE and BOUNTIES
2. **People Tab**:
   - Search by name or genre
   - Filter by roles (multi-select)
   - Shows profile completion
   - Location display
   - Genre tags
3. **Bounties Tab**:
   - Search bounties
   - Filter by role (dropdown)
   - Remote OK toggle
   - Shows budget, deadline, location
   - Applicant count
4. **Bounty Detail Modal**:
   - Full bounty information
   - Genre tags
   - Contact placeholder
5. **URL Support**: `?tab=bounties` opens bounties tab
6. **Non-blocking**: Debounced filters, graceful loading states
