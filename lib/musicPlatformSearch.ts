// Music platform search utilities
// Integrates with Spotify, Apple Music, and YouTube APIs

import { PlatformSearchResult, MusicPlatform } from '@/types/profile-links'

// Spotify API search
export async function searchSpotify(query: string, type: 'artist' | 'track' | 'album' = 'artist'): Promise<PlatformSearchResult[]> {
  try {
    // TODO: Get Spotify access token from server-side endpoint
    // For now, this is a client-side stub that would call our API
    const response = await fetch(`/api/music-search/spotify?q=${encodeURIComponent(query)}&type=${type}`)
    
    if (!response.ok) {
      throw new Error('Spotify search failed')
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('[SPOTIFY_SEARCH] Error:', error)
    return []
  }
}

// Apple Music API search
export async function searchAppleMusic(query: string, type: 'artists' | 'songs' | 'albums' = 'artists'): Promise<PlatformSearchResult[]> {
  try {
    const response = await fetch(`/api/music-search/apple-music?q=${encodeURIComponent(query)}&type=${type}`)
    
    if (!response.ok) {
      throw new Error('Apple Music search failed')
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('[APPLE_MUSIC_SEARCH] Error:', error)
    return []
  }
}

// YouTube API search
export async function searchYouTube(query: string, type: 'channel' | 'video' = 'channel'): Promise<PlatformSearchResult[]> {
  try {
    const response = await fetch(`/api/music-search/youtube?q=${encodeURIComponent(query)}&type=${type}`)
    
    if (!response.ok) {
      throw new Error('YouTube search failed')
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('[YOUTUBE_SEARCH] Error:', error)
    return []
  }
}

// Unified search across platforms
export async function searchAllPlatforms(query: string): Promise<Record<MusicPlatform, PlatformSearchResult[]>> {
  const [spotifyResults, appleMusicResults, youtubeResults] = await Promise.all([
    searchSpotify(query, 'artist'),
    searchAppleMusic(query, 'artists'),
    searchYouTube(query, 'channel'),
  ])
  
  return {
    spotify: spotifyResults,
    apple_music: appleMusicResults,
    youtube: youtubeResults,
    soundcloud: [],
    tidal: [],
    other: [],
  }
}

// Extract platform and ID from URL
export function parsePlatformUrl(url: string): { platform: MusicPlatform; id: string } | null {
  // Spotify
  const spotifyMatch = url.match(/spotify\.com\/(artist|track|album|playlist)\/([a-zA-Z0-9]+)/)
  if (spotifyMatch) {
    return { platform: 'spotify', id: spotifyMatch[2] }
  }
  
  // Apple Music
  const appleMatch = url.match(/music\.apple\.com\/[a-z]{2}\/(artist|album|playlist)\/[^\/]+\/(\d+)/)
  if (appleMatch) {
    return { platform: 'apple_music', id: appleMatch[2] }
  }
  
  // YouTube
  const youtubeMatch = url.match(/youtube\.com\/(channel|c|user|@)\/([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return { platform: 'youtube', id: youtubeMatch[2] }
  }
  
  // SoundCloud
  const soundcloudMatch = url.match(/soundcloud\.com\/([a-zA-Z0-9_-]+)/)
  if (soundcloudMatch) {
    return { platform: 'soundcloud', id: soundcloudMatch[1] }
  }
  
  return null
}

// Mock search results for development
export function getMockSearchResults(query: string, platform: MusicPlatform): PlatformSearchResult[] {
  const mockResults: Record<MusicPlatform, PlatformSearchResult[]> = {
    spotify: [
      {
        id: 'spotify_1',
        platform: 'spotify',
        name: `${query} (Artist)`,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://open.spotify.com/artist/mock_${query.replace(/\s/g, '_')}`,
        verified: true,
        followers: 125000,
        type: 'artist',
      },
      {
        id: 'spotify_2',
        platform: 'spotify',
        name: `${query} - Top Tracks`,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://open.spotify.com/playlist/mock_${query.replace(/\s/g, '_')}`,
        verified: false,
        type: 'playlist',
      },
    ],
    apple_music: [
      {
        id: 'apple_1',
        platform: 'apple_music',
        name: query,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://music.apple.com/us/artist/mock/${Math.random().toString().slice(2, 11)}`,
        verified: true,
        type: 'artist',
      },
    ],
    youtube: [
      {
        id: 'youtube_1',
        platform: 'youtube',
        name: `${query} - Official Channel`,
        artistName: query,
        imageUrl: 'https://via.placeholder.com/150',
        url: `https://youtube.com/@${query.replace(/\s/g, '')}`,
        verified: true,
        followers: 500000,
        type: 'channel',
      },
    ],
    soundcloud: [],
    tidal: [],
    other: [],
  }
  
  return mockResults[platform] || []
}
