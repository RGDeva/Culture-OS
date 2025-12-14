'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Music, Youtube, Loader2, Check, ExternalLink } from 'lucide-react'
import { TerminalText } from '@/components/ui/terminal-text'

interface SpotifyResult {
  id: string
  name: string
  images: { url: string }[]
  followers: { total: number }
  genres: string[]
  external_urls: { spotify: string }
}

interface YouTubeResult {
  id: string
  title: string
  channelTitle: string
  thumbnails: { high: { url: string } }
  viewCount: string
}

interface ImportedContent {
  platform: 'spotify' | 'youtube'
  artistName: string
  profileImage?: string
  tracks?: any[]
  videos?: any[]
  stats?: any
}

export function PlatformConnector() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [importing, setImporting] = useState(false)
  const [spotifyResults, setSpotifyResults] = useState<SpotifyResult[]>([])
  const [youtubeResults, setYoutubeResults] = useState<YouTubeResult[]>([])
  const [importedContent, setImportedContent] = useState<ImportedContent | null>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<'spotify' | 'youtube' | 'all'>('all')

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setSpotifyResults([])
    setYoutubeResults([])
    setImportedContent(null)

    try {
      const response = await fetch(
        `/api/platforms/search?query=${encodeURIComponent(searchQuery)}&platform=${selectedPlatform}`
      )
      const data = await response.json()

      if (data.results.spotify) {
        setSpotifyResults(data.results.spotify)
      }
      if (data.results.youtube) {
        setYoutubeResults(data.results.youtube)
      }
    } catch (error) {
      console.error('[PLATFORM_CONNECTOR] Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleImportSpotify = async (artistId: string) => {
    setImporting(true)
    try {
      const response = await fetch('/api/platforms/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'spotify', artistId })
      })
      const data = await response.json()

      if (data.success) {
        setImportedContent(data.content)
        console.log('[PLATFORM_CONNECTOR] Imported Spotify content:', data.content)
      }
    } catch (error) {
      console.error('[PLATFORM_CONNECTOR] Import error:', error)
    } finally {
      setImporting(false)
    }
  }

  const handleImportYouTube = async (channelTitle: string) => {
    setImporting(true)
    try {
      const response = await fetch('/api/platforms/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'youtube', query: channelTitle })
      })
      const data = await response.json()

      if (data.success) {
        setImportedContent(data.content)
        console.log('[PLATFORM_CONNECTOR] Imported YouTube content:', data.content)
      }
    } catch (error) {
      console.error('[PLATFORM_CONNECTOR] Import error:', error)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-2 border-green-400/30 p-6">
        <h2 className="text-2xl font-mono font-bold text-green-400 mb-2">
          &gt; <TerminalText text="CONNECT_PLATFORMS" speed={40} cursor={false} />
        </h2>
        <p className="text-green-400/70 text-sm font-mono">
          Search for your artist name to import tracks, videos, and stats
        </p>
      </div>

      {/* Search */}
      <div className="border-2 border-green-400/30 p-6 space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`px-4 py-2 border font-mono text-sm transition-all ${
              selectedPlatform === 'all'
                ? 'bg-green-400 text-black border-green-400'
                : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
            }`}
          >
            ALL
          </button>
          <button
            onClick={() => setSelectedPlatform('spotify')}
            className={`px-4 py-2 border font-mono text-sm transition-all flex items-center gap-2 ${
              selectedPlatform === 'spotify'
                ? 'bg-green-400 text-black border-green-400'
                : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
            }`}
          >
            <Music className="h-4 w-4" />
            SPOTIFY
          </button>
          <button
            onClick={() => setSelectedPlatform('youtube')}
            className={`px-4 py-2 border font-mono text-sm transition-all flex items-center gap-2 ${
              selectedPlatform === 'youtube'
                ? 'bg-green-400 text-black border-green-400'
                : 'bg-black text-green-400 border-green-400/30 hover:border-green-400'
            }`}
          >
            <Youtube className="h-4 w-4" />
            YOUTUBE
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="SEARCH_ARTIST_NAME"
              className="w-full bg-black/50 border-2 border-green-400/50 text-green-400 font-mono px-4 pl-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-green-400/30"
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="bg-green-400 text-black hover:bg-green-300 font-mono font-bold px-8"
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                SEARCHING...
              </>
            ) : (
              'SEARCH'
            )}
          </Button>
        </div>
      </div>

      {/* Spotify Results */}
      {spotifyResults.length > 0 && (
        <div className="border-2 border-green-400/30 p-6">
          <h3 className="text-xl font-mono font-bold text-green-400 mb-4 flex items-center gap-2">
            <Music className="h-5 w-5" />
            SPOTIFY_RESULTS
          </h3>
          <div className="space-y-3">
            {spotifyResults.map((artist) => (
              <div
                key={artist.id}
                className="border border-green-400/30 p-4 hover:border-green-400 transition-all flex items-center gap-4"
              >
                {artist.images[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-16 h-16 object-cover border border-green-400/30"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-mono font-bold text-green-400">{artist.name}</h4>
                  <p className="text-sm text-green-400/70 font-mono">
                    {artist.followers.total.toLocaleString()} followers
                  </p>
                  {artist.genres.length > 0 && (
                    <p className="text-xs text-green-400/60 font-mono mt-1">
                      {artist.genres.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                    onClick={() => window.open(artist.external_urls.spotify, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleImportSpotify(artist.id)}
                    disabled={importing}
                    className="bg-green-400 text-black hover:bg-green-300 font-mono"
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'IMPORT'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Results */}
      {youtubeResults.length > 0 && (
        <div className="border-2 border-green-400/30 p-6">
          <h3 className="text-xl font-mono font-bold text-green-400 mb-4 flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            YOUTUBE_RESULTS
          </h3>
          <div className="space-y-3">
            {youtubeResults.slice(0, 5).map((video) => (
              <div
                key={video.id}
                className="border border-green-400/30 p-4 hover:border-green-400 transition-all flex items-center gap-4"
              >
                <img
                  src={video.thumbnails.high.url}
                  alt={video.title}
                  className="w-24 h-16 object-cover border border-green-400/30"
                />
                <div className="flex-1">
                  <h4 className="font-mono font-bold text-green-400 text-sm line-clamp-1">
                    {video.title}
                  </h4>
                  <p className="text-sm text-green-400/70 font-mono">{video.channelTitle}</p>
                  <p className="text-xs text-green-400/60 font-mono mt-1">
                    {parseInt(video.viewCount).toLocaleString()} views
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleImportYouTube(video.channelTitle)}
                    disabled={importing}
                    className="bg-green-400 text-black hover:bg-green-300 font-mono"
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'IMPORT'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imported Content Preview */}
      {importedContent && (
        <div className="border-2 border-green-400 p-6 bg-green-400/5">
          <div className="flex items-center gap-2 mb-4">
            <Check className="h-6 w-6 text-green-400" />
            <h3 className="text-xl font-mono font-bold text-green-400">
              CONTENT_IMPORTED
            </h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-green-400/70 font-mono">ARTIST</p>
              <p className="text-lg font-mono font-bold text-green-400">
                {importedContent.artistName}
              </p>
            </div>

            {importedContent.stats && (
              <div className="grid grid-cols-3 gap-4">
                {importedContent.stats.followers && (
                  <div>
                    <p className="text-xs text-green-400/70 font-mono">FOLLOWERS</p>
                    <p className="text-lg font-mono font-bold text-green-400">
                      {importedContent.stats.followers.toLocaleString()}
                    </p>
                  </div>
                )}
                {importedContent.stats.totalTracks && (
                  <div>
                    <p className="text-xs text-green-400/70 font-mono">
                      {importedContent.platform === 'spotify' ? 'TRACKS' : 'VIDEOS'}
                    </p>
                    <p className="text-lg font-mono font-bold text-green-400">
                      {importedContent.stats.totalTracks}
                    </p>
                  </div>
                )}
                {importedContent.stats.totalViews && (
                  <div>
                    <p className="text-xs text-green-400/70 font-mono">TOTAL VIEWS</p>
                    <p className="text-lg font-mono font-bold text-green-400">
                      {parseInt(importedContent.stats.totalViews).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {importedContent.tracks && importedContent.tracks.length > 0 && (
              <div>
                <p className="text-sm text-green-400/70 font-mono mb-2">
                  TOP TRACKS ({importedContent.tracks.length})
                </p>
                <div className="space-y-2">
                  {importedContent.tracks.slice(0, 5).map((track, i) => (
                    <div key={track.id} className="text-sm font-mono text-green-400/80">
                      {i + 1}. {track.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importedContent.videos && importedContent.videos.length > 0 && (
              <div>
                <p className="text-sm text-green-400/70 font-mono mb-2">
                  VIDEOS ({importedContent.videos.length})
                </p>
                <div className="space-y-2">
                  {importedContent.videos.slice(0, 5).map((video, i) => (
                    <div key={video.id} className="text-sm font-mono text-green-400/80">
                      {i + 1}. {video.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-green-400/60 font-mono mt-4">
              // Content has been imported and saved to your profile
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
