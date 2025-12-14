'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  X,
  Search,
  Music,
  Youtube,
  Link as LinkIcon,
  Check,
  ExternalLink,
  Loader2,
} from 'lucide-react'
import {
  MusicPlatform,
  PlatformSearchResult,
  PLATFORM_CONFIG,
} from '@/types/profile-links'
import { getMockSearchResults } from '@/lib/musicPlatformSearch'

interface AddProfileLinksModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onLinkAdded?: () => void
}

export function AddProfileLinksModal({
  isOpen,
  onClose,
  userId,
  onLinkAdded,
}: AddProfileLinksModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<MusicPlatform | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<PlatformSearchResult[]>([])
  const [manualUrl, setManualUrl] = useState('')
  const [adding, setAdding] = useState(false)
  
  if (!isOpen) return null
  
  const handleSearch = async () => {
    if (!searchQuery.trim() || !selectedPlatform) return
    
    setSearching(true)
    
    try {
      // Use mock results for now
      // In production, this would call the real API
      const results = getMockSearchResults(searchQuery, selectedPlatform)
      setSearchResults(results)
    } catch (error) {
      console.error('[ADD_LINKS] Search error:', error)
    } finally {
      setSearching(false)
    }
  }
  
  const handleAddLink = async (result: PlatformSearchResult) => {
    setAdding(true)
    
    try {
      const response = await fetch('/api/profile/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: result.platform,
          platformId: result.id,
          url: result.url,
          displayName: result.name,
          imageUrl: result.imageUrl,
          verified: result.verified,
          isPrimary: false,
          metadata: {
            followers: result.followers,
          },
        }),
      })
      
      if (response.ok) {
        if (onLinkAdded) onLinkAdded()
        setSearchQuery('')
        setSearchResults([])
        setSelectedPlatform(null)
      }
    } catch (error) {
      console.error('[ADD_LINKS] Error adding link:', error)
    } finally {
      setAdding(false)
    }
  }
  
  const handleAddManualLink = async () => {
    if (!manualUrl.trim() || !selectedPlatform) return
    
    setAdding(true)
    
    try {
      const response = await fetch('/api/profile/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          platform: selectedPlatform,
          platformId: manualUrl,
          url: manualUrl,
          displayName: `${PLATFORM_CONFIG[selectedPlatform].name} Profile`,
          isPrimary: false,
        }),
      })
      
      if (response.ok) {
        if (onLinkAdded) onLinkAdded()
        setManualUrl('')
        setSelectedPlatform(null)
      }
    } catch (error) {
      console.error('[ADD_LINKS] Error adding manual link:', error)
    } finally {
      setAdding(false)
    }
  }
  
  const platformButtons: { platform: MusicPlatform; icon: React.ReactNode; color: string }[] = [
    { platform: 'spotify', icon: <Music className="h-5 w-5" />, color: '#1DB954' },
    { platform: 'apple_music', icon: <Music className="h-5 w-5" />, color: '#FA243C' },
    { platform: 'youtube', icon: <Youtube className="h-5 w-5" />, color: '#FF0000' },
    { platform: 'soundcloud', icon: <Music className="h-5 w-5" />, color: '#FF5500' },
  ]
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 dark:bg-black bg-white border-b-2 dark:border-green-400/30 border-green-600/30 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold font-mono dark:text-green-400 text-green-700">
            &gt; ADD_MUSIC_LINKS
          </h2>
          <button
            onClick={onClose}
            className="dark:text-green-400 text-green-700 hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Platform Selection */}
          {!selectedPlatform ? (
            <div>
              <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-4">
                SELECT_PLATFORM:
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {platformButtons.map(({ platform, icon, color }) => (
                  <button
                    key={platform}
                    onClick={() => setSelectedPlatform(platform)}
                    className="p-4 border-2 dark:border-green-400/30 border-green-600/40 dark:hover:border-green-400 hover:border-green-600 transition-colors flex items-center gap-3 dark:bg-black/50 bg-white/80"
                    style={{ borderLeftColor: color, borderLeftWidth: '4px' }}
                  >
                    {icon}
                    <span className="font-mono dark:text-green-400 text-green-700 font-bold">
                      {PLATFORM_CONFIG[platform].name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedPlatform(null)
                  setSearchQuery('')
                  setSearchResults([])
                  setManualUrl('')
                }}
                className="text-sm font-mono dark:text-green-400/70 text-green-700/70 hover:underline"
              >
                ← BACK_TO_PLATFORMS
              </button>
              
              {/* Search Section */}
              {PLATFORM_CONFIG[selectedPlatform].searchEnabled ? (
                <div>
                  <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                    SEARCH_{PLATFORM_CONFIG[selectedPlatform].name.toUpperCase()}:
                  </h3>
                  
                  <div className="flex gap-2 mb-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-green-400/50 text-green-700/50" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search for artist, channel, or profile..."
                        className="w-full pl-10 pr-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none dark:focus:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={searching || !searchQuery.trim()}
                      className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                    >
                      {searching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'SEARCH'
                      )}
                    </Button>
                  </div>
                  
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2 mb-6">
                      <h4 className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2">
                        RESULTS:
                      </h4>
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="border-2 dark:border-green-400/20 border-green-600/30 p-3 flex items-center justify-between dark:bg-black/50 bg-white/80"
                        >
                          <div className="flex items-center gap-3">
                            {result.imageUrl && (
                              <img
                                src={result.imageUrl}
                                alt={result.name}
                                className="w-12 h-12 object-cover border dark:border-green-400/30 border-green-600/40"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold dark:text-green-400 text-green-700">
                                  {result.name}
                                </span>
                                {result.verified && (
                                  <Check className="h-4 w-4 dark:text-cyan-400 text-cyan-600" />
                                )}
                              </div>
                              <div className="text-xs font-mono dark:text-green-400/60 text-green-700/70">
                                {result.type.toUpperCase()}
                                {result.followers && ` • ${(result.followers / 1000).toFixed(0)}K followers`}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={result.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 dark:text-green-400/70 text-green-700/70 hover:opacity-70"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            <Button
                              onClick={() => handleAddLink(result)}
                              disabled={adding}
                              size="sm"
                              className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                            >
                              {adding ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'ADD'
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
              
              {/* Manual URL Input */}
              <div className="pt-4 border-t-2 dark:border-green-400/20 border-green-600/30">
                <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
                  OR_PASTE_URL:
                </h3>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 dark:text-green-400/50 text-green-700/50" />
                    <input
                      type="url"
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      placeholder={`Paste ${PLATFORM_CONFIG[selectedPlatform].name} URL...`}
                      className="w-full pl-10 pr-4 py-2 border-2 dark:border-green-400/50 border-green-600/50 dark:bg-black bg-white dark:text-green-400 text-green-700 font-mono text-sm focus:outline-none dark:focus:border-green-400 focus:border-green-600 placeholder:dark:text-green-400/30 placeholder:text-green-700/40"
                    />
                  </div>
                  <Button
                    onClick={handleAddManualLink}
                    disabled={adding || !manualUrl.trim()}
                    className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'ADD_URL'
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
