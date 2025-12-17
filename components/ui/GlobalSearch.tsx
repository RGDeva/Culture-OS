'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Music, Users, ShoppingBag, Target, X, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'ASSET' | 'USER' | 'LISTING' | 'BOUNTY'
  title: string
  subtitle?: string
  url: string
  icon: any
}

interface GlobalSearchProps {
  userId: string
}

export function GlobalSearch({ userId }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const debounce = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true)
      const searchResults: SearchResult[] = []

      // Search vault assets
      const vaultRes = await fetch(`/api/vault/search?q=${encodeURIComponent(searchQuery)}&userId=${userId}`).catch(() => null)
      if (vaultRes?.ok) {
        const data = await vaultRes.json()
        data.assets?.slice(0, 3).forEach((asset: any) => {
          searchResults.push({
            id: asset.id,
            type: 'ASSET',
            title: asset.title,
            subtitle: asset.assetType,
            url: `/vault?assetId=${asset.id}`,
            icon: Music
          })
        })
      }

      // Search users
      const usersRes = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`).catch(() => null)
      if (usersRes?.ok) {
        const data = await usersRes.json()
        data.users?.slice(0, 3).forEach((user: any) => {
          searchResults.push({
            id: user.id,
            type: 'USER',
            title: user.displayName || user.username,
            subtitle: user.bio?.substring(0, 50),
            url: `/profile/view?userId=${user.id}`,
            icon: Users
          })
        })
      }

      // Search marketplace
      const marketplaceRes = await fetch(`/api/marketplace/search?q=${encodeURIComponent(searchQuery)}`).catch(() => null)
      if (marketplaceRes?.ok) {
        const data = await marketplaceRes.json()
        data.listings?.slice(0, 3).forEach((listing: any) => {
          searchResults.push({
            id: listing.id,
            type: 'LISTING',
            title: listing.title,
            subtitle: `$${listing.price?.toFixed(2)}`,
            url: `/marketplace/play/${listing.id}`,
            icon: ShoppingBag
          })
        })
      }

      // Search bounties
      const bountiesRes = await fetch(`/api/bounties/campaigns?search=${encodeURIComponent(searchQuery)}`).catch(() => null)
      if (bountiesRes?.ok) {
        const data = await bountiesRes.json()
        data.campaigns?.slice(0, 3).forEach((campaign: any) => {
          searchResults.push({
            id: campaign.id,
            type: 'BOUNTY',
            title: campaign.title,
            subtitle: campaign.type,
            url: `/bounties?campaignId=${campaign.id}`,
            icon: Target
          })
        })
      }

      setResults(searchResults)
      setShowResults(true)
    } catch (error) {
      console.error('[GLOBAL_SEARCH] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    setQuery('')
    setShowResults(false)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-green-400/50 text-green-700/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search assets, users, bounties..."
          className="w-full pl-10 pr-10 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm placeholder:dark:text-green-400/30 placeholder:text-green-700/40 focus:dark:border-green-400 focus:border-green-600 outline-none"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-green-400/50 text-green-700/50 hover:dark:text-green-400 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Results Panel */}
      {showResults && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 border-2 dark:border-green-400 border-green-600 dark:bg-black bg-white z-50 max-h-96 overflow-y-auto shadow-lg">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 dark:text-green-400 text-green-700 animate-spin mx-auto mb-2" />
              <p className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                SEARCHING...
              </p>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y dark:divide-green-400/20 divide-green-600/30">
              {results.map((result) => {
                const Icon = result.icon
                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full p-3 flex items-center gap-3 hover:dark:bg-green-400/10 hover:bg-green-600/10 transition-colors text-left"
                  >
                    <div className="p-2 dark:bg-green-400/10 bg-green-600/10 rounded">
                      <Icon className="h-4 w-4 dark:text-green-400 text-green-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-mono font-bold dark:text-green-400 text-green-700 truncate">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70 truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
                      {result.type}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 dark:text-green-400/30 text-green-700/40 mx-auto mb-3" />
              <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
                No results found for "{query}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
