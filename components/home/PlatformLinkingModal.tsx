'use client'

import React, { useState } from 'react'
import { X, Search, Link as LinkIcon, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PlatformLinkingModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (platform: string, url: string) => Promise<void>
}

type TabType = 'search' | 'paste'

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', placeholder: 'Search for your Spotify artist profile...' },
  { id: 'appleMusic', name: 'Apple Music', placeholder: 'Search for your Apple Music artist profile...' },
  { id: 'soundcloud', name: 'SoundCloud', placeholder: 'Search for your SoundCloud profile...' },
  { id: 'youtube', name: 'YouTube', placeholder: 'Search for your YouTube channel...' },
  { id: 'instagram', name: 'Instagram', placeholder: 'Search for your Instagram profile...' },
  { id: 'tiktok', name: 'TikTok', placeholder: 'Search for your TikTok profile...' },
  { id: 'twitter', name: 'X (Twitter)', placeholder: 'Search for your X profile...' },
]

export function PlatformLinkingModal({ isOpen, onClose, onSave }: PlatformLinkingModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('spotify')
  const [searchQuery, setSearchQuery] = useState('')
  const [pasteUrl, setPasteUrl] = useState('')
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  if (!isOpen) return null

  const platform = PLATFORMS.find(p => p.id === selectedPlatform)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setSearching(true)
    try {
      // TODO: Implement real search API
      // For now, mock search results
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSearchResults([
        { id: '1', name: searchQuery, url: `https://${selectedPlatform}.com/${searchQuery}`, verified: true },
        { id: '2', name: `${searchQuery} Official`, url: `https://${selectedPlatform}.com/${searchQuery}-official`, verified: false },
      ])
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSelectResult = async (result: any) => {
    setSaving(true)
    try {
      await onSave(selectedPlatform, result.url)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handlePasteSubmit = async () => {
    if (!pasteUrl.trim()) return
    
    setSaving(true)
    try {
      await onSave(selectedPlatform, pasteUrl)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-green-400/30 border-green-600/40 flex items-center justify-between">
          <h3 className="text-xl font-bold font-mono dark:text-green-400 text-green-700">
            &gt; CONNECT_PLATFORM
          </h3>
          <button
            onClick={onClose}
            className="dark:text-green-400/70 text-green-700/70 hover:dark:text-green-400 hover:text-green-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Platform Selector */}
        <div className="p-6 border-b dark:border-green-400/30 border-green-600/40">
          <div className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-3">
            SELECT_PLATFORM:
          </div>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setSelectedPlatform(p.id)
                  setSearchQuery('')
                  setPasteUrl('')
                  setSearchResults([])
                }}
                className={`px-3 py-2 text-sm font-mono border-2 transition-colors ${
                  selectedPlatform === p.id
                    ? 'dark:border-green-400 border-green-600 dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700'
                    : 'dark:border-green-400/30 border-green-600/40 dark:text-green-400/70 text-green-700/70 hover:dark:border-green-400/50 hover:border-green-600/60'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b dark:border-green-400/30 border-green-600/40">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 px-6 py-3 text-sm font-mono transition-colors ${
              activeTab === 'search'
                ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 border-b-2 dark:border-green-400 border-green-600'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            SEARCH
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 px-6 py-3 text-sm font-mono transition-colors ${
              activeTab === 'paste'
                ? 'dark:bg-green-400/10 bg-green-600/10 dark:text-green-400 text-green-700 border-b-2 dark:border-green-400 border-green-600'
                : 'dark:text-green-400/70 text-green-700/70 hover:dark:bg-green-400/5 hover:bg-green-600/5'
            }`}
          >
            <LinkIcon className="h-4 w-4 inline mr-2" />
            PASTE_URL
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={platform?.placeholder}
                  className="flex-1 px-4 py-2 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white font-mono text-sm dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  className="dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-500 font-mono"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                    SEARCH_RESULTS:
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectResult(result)}
                      disabled={saving}
                      className="w-full p-4 border-2 dark:border-green-400/30 border-green-600/40 hover:dark:border-green-400 hover:border-green-600 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-mono text-sm dark:text-green-400 text-green-700 flex items-center gap-2">
                            {result.name}
                            {result.verified && (
                              <span className="px-2 py-0.5 text-xs dark:bg-cyan-400/20 bg-cyan-600/20 dark:text-cyan-400 text-cyan-700 border dark:border-cyan-400/30 border-cyan-600/40">
                                VERIFIED
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60 mt-1">
                            {result.url}
                          </div>
                        </div>
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin dark:text-green-400 text-green-700" />
                        ) : (
                          <Check className="h-4 w-4 dark:text-green-400 text-green-700" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && !searching && searchResults.length === 0 && (
                <div className="text-center py-8 text-sm font-mono dark:text-green-400/50 text-green-700/60">
                  No results found. Try a different search term.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm font-mono dark:text-green-400/70 text-green-700/70 mb-3">
                Paste the URL of your {platform?.name} profile:
              </div>
              <input
                type="url"
                value={pasteUrl}
                onChange={(e) => setPasteUrl(e.target.value)}
                placeholder={`https://${selectedPlatform}.com/your-profile`}
                className="w-full px-4 py-3 border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white font-mono text-sm dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
              />
              <Button
                onClick={handlePasteSubmit}
                disabled={saving || !pasteUrl.trim()}
                className="w-full dark:bg-green-400 bg-green-600 dark:text-black text-white hover:dark:bg-green-300 hover:bg-green-500 font-mono"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    SAVING...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    CONNECT_PLATFORM
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-green-400/30 border-green-600/40">
          <div className="text-xs font-mono dark:text-green-400/50 text-green-700/60">
            // Your profile URL will be verified and displayed on your public profile
          </div>
        </div>
      </div>
    </div>
  )
}
