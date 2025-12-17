'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  User, 
  Music, 
  DollarSign, 
  Wrench, 
  MapPin,
  Sparkles,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react'

interface SearchResult {
  id: string
  type: 'CREATIVE' | 'ASSET' | 'OPPORTUNITY' | 'TOOL' | 'LOCATION'
  title: string
  subtitle?: string
  href: string
  icon?: React.ReactNode
}

const RESULT_TYPE_CONFIG = {
  CREATIVE: { 
    color: 'text-purple-400', 
    bg: 'bg-purple-400/10', 
    border: 'border-purple-400/30',
    icon: User 
  },
  ASSET: { 
    color: 'text-cyan-400', 
    bg: 'bg-cyan-400/10', 
    border: 'border-cyan-400/30',
    icon: Music 
  },
  OPPORTUNITY: { 
    color: 'text-green-400', 
    bg: 'bg-green-400/10', 
    border: 'border-green-400/30',
    icon: DollarSign 
  },
  TOOL: { 
    color: 'text-orange-400', 
    bg: 'bg-orange-400/10', 
    border: 'border-orange-400/30',
    icon: Wrench 
  },
  LOCATION: { 
    color: 'text-pink-400', 
    bg: 'bg-pink-400/10', 
    border: 'border-pink-400/30',
    icon: MapPin 
  },
}

const SUGGESTION_QUERIES = [
  'Find drill beats',
  'Mixing engineer in NYC',
  'Studios near me',
  'Clipping bounties I can earn from',
  'Producers who work with R&B artists',
  'Paid promo opportunities',
]

export function UniversalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestion, setSuggestion] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Rotate suggestion placeholder
  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      index = (index + 1) % SUGGESTION_QUERIES.length
      setSuggestion(SUGGESTION_QUERIES[index])
    }, 4000)
    setSuggestion(SUGGESTION_QUERIES[0])
    return () => clearInterval(interval)
  }, [])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Simulate AI search (in production, this would call your AI backend)
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const q = searchQuery.toLowerCase()
    const mockResults: SearchResult[] = []

    // Intelligent result matching based on query intent
    if (q.includes('beat') || q.includes('drill') || q.includes('trap') || q.includes('r&b')) {
      mockResults.push(
        { id: '1', type: 'ASSET', title: 'Drill Beats Collection', subtitle: '45 beats available', href: '/marketplace?type=BEAT&search=drill' },
        { id: '2', type: 'ASSET', title: 'Dark Trap Pack', subtitle: '$35 · XEN_PRODUCER', href: '/marketplace?search=trap' },
        { id: '3', type: 'CREATIVE', title: 'Top Drill Producers', subtitle: '12 creators in network', href: '/network?search=drill' },
      )
    }

    if (q.includes('engineer') || q.includes('mixing') || q.includes('master')) {
      mockResults.push(
        { id: '4', type: 'CREATIVE', title: 'Mixing Engineers', subtitle: 'Available for hire', href: '/network?role=ENGINEER' },
        { id: '5', type: 'ASSET', title: 'Mixing & Mastering Services', subtitle: 'Starting at $50', href: '/marketplace?type=SERVICE&search=mixing' },
      )
    }

    if (q.includes('nyc') || q.includes('new york') || q.includes('la') || q.includes('atlanta') || q.includes('near me')) {
      mockResults.push(
        { id: '6', type: 'LOCATION', title: 'Studios in NYC', subtitle: '8 verified locations', href: '/network?tab=map' },
        { id: '7', type: 'CREATIVE', title: 'NYC-Based Creatives', subtitle: '34 in your area', href: '/network?location=NYC' },
      )
    }

    if (q.includes('studio')) {
      mockResults.push(
        { id: '8', type: 'LOCATION', title: 'Recording Studios', subtitle: 'Find studios near you', href: '/network?tab=map' },
        { id: '9', type: 'CREATIVE', title: 'Studio Owners', subtitle: 'Book sessions directly', href: '/network?role=STUDIO' },
      )
    }

    if (q.includes('bounty') || q.includes('bounties') || q.includes('clip') || q.includes('earn') || q.includes('promo')) {
      mockResults.push(
        { id: '10', type: 'OPPORTUNITY', title: 'Clipping Bounties', subtitle: 'Earn by promoting content', href: '/network?tab=opportunities' },
        { id: '11', type: 'OPPORTUNITY', title: 'Open Paid Gigs', subtitle: '15 opportunities available', href: '/marketplace?tab=bounties' },
        { id: '12', type: 'TOOL', title: 'Earnings Dashboard', subtitle: 'Track your payouts', href: '/earnings' },
      )
    }

    if (q.includes('producer') || q.includes('artist')) {
      mockResults.push(
        { id: '13', type: 'CREATIVE', title: 'Producers', subtitle: 'Browse all producers', href: '/network?role=PRODUCER' },
        { id: '14', type: 'CREATIVE', title: 'Artists', subtitle: 'Connect with artists', href: '/network?role=ARTIST' },
      )
    }

    if (q.includes('wavewarz') || q.includes('battle')) {
      mockResults.push(
        { id: '15', type: 'TOOL', title: 'WaveWarZ Battles', subtitle: 'Compete and prove demand', href: '/tools/wavewarz' },
      )
    }

    if (q.includes('dreamster') || q.includes('drop')) {
      mockResults.push(
        { id: '16', type: 'TOOL', title: 'Dreamster Drops', subtitle: 'Launch your releases', href: '/tools/dreamster' },
      )
    }

    if (q.includes('vault') || q.includes('project') || q.includes('file')) {
      mockResults.push(
        { id: '17', type: 'TOOL', title: 'Vault', subtitle: 'Manage projects & files', href: '/vault' },
      )
    }

    // Default results if no specific match
    if (mockResults.length === 0) {
      mockResults.push(
        { id: '18', type: 'CREATIVE', title: `Search "${searchQuery}" in Network`, subtitle: 'Find people', href: `/network?search=${encodeURIComponent(searchQuery)}` },
        { id: '19', type: 'ASSET', title: `Search "${searchQuery}" in Marketplace`, subtitle: 'Find assets', href: `/marketplace?search=${encodeURIComponent(searchQuery)}` },
        { id: '20', type: 'OPPORTUNITY', title: 'Browse Opportunities', subtitle: 'Find paid gigs', href: '/network?tab=opportunities' },
      )
    }

    setResults(mockResults.slice(0, 6))
    setIsLoading(false)
  }

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query)
      } else {
        setResults([])
      }
    }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setQuery('')
    router.push(result.href)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (results.length > 0) {
      handleResultClick(results[0])
    } else if (query) {
      router.push(`/network?search=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit}>
        <div className={`relative transition-all duration-300 ${isOpen && query ? 'rounded-t-2xl' : 'rounded-2xl'}`}>
          {/* Search Input */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-cyan-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={`relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 ${isOpen && query ? 'rounded-t-2xl border-b-0' : 'rounded-2xl'} overflow-hidden transition-all duration-300 hover:border-white/20 focus-within:border-green-400/50`}>
              <div className="pl-5 pr-3">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 text-green-400 animate-spin" />
                ) : (
                  <Search className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={suggestion}
                className="flex-1 bg-transparent py-4 pr-4 text-white placeholder-gray-500 focus:outline-none font-mono text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    inputRef.current?.focus()
                  }}
                  className="pr-4 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-4 bg-green-400/10 hover:bg-green-400/20 text-green-400 transition-colors border-l border-white/10"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border border-white/10 border-t-0 rounded-b-2xl overflow-hidden z-50 shadow-2xl">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => {
                const config = RESULT_TYPE_CONFIG[result.type]
                const Icon = config.icon
                return (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-4 py-3 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium text-sm truncate">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-gray-500 text-xs truncate">{result.subtitle}</div>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase ${config.color} ${config.bg} ${config.border} border rounded-full`}>
                      {result.type}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : !isLoading ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              <Sparkles className="h-6 w-6 mx-auto mb-2 text-gray-600" />
              <p>Start typing to search people, assets, and opportunities</p>
            </div>
          ) : null}

          {/* AI Hint */}
          <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Sparkles className="h-3 w-3" />
              <span>AI-powered search</span>
            </div>
            <div className="text-xs text-gray-600">
              Press Enter to search
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
