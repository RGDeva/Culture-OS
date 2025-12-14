/**
 * Music Platform Integration
 * Spotify, Apple Music, and YouTube API integrations
 */

// API Configuration
const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '2c11efefc85e4bf2a8d001efadc638d2'
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '3138d746b1f34336926a70f4bbc70816'
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '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'

export interface SpotifyArtist {
  id: string
  name: string
  images: { url: string; height: number; width: number }[]
  genres: string[]
  followers: { total: number }
  popularity: number
  external_urls: { spotify: string }
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { id: string; name: string }[]
  album: {
    id: string
    name: string
    images: { url: string; height: number; width: number }[]
    release_date: string
  }
  duration_ms: number
  popularity: number
  preview_url: string | null
  external_urls: { spotify: string }
}

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
  }
  channelId: string
  channelTitle: string
  publishedAt: string
  viewCount: string
  likeCount: string
}

export interface AppleMusicArtist {
  id: string
  name: string
  artwork?: { url: string; width: number; height: number }
  genres: string[]
  url: string
}

/**
 * Get Spotify Access Token
 */
async function getSpotifyAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      console.error('[SPOTIFY] Failed to get access token:', response.status)
      return null
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('[SPOTIFY] Error getting access token:', error)
    return null
  }
}

/**
 * Search Spotify for an artist
 */
export async function searchSpotifyArtist(query: string): Promise<SpotifyArtist[]> {
  try {
    const token = await getSpotifyAccessToken()
    if (!token) return []

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      console.error('[SPOTIFY] Search failed:', response.status)
      return []
    }

    const data = await response.json()
    return data.artists?.items || []
  } catch (error) {
    console.error('[SPOTIFY] Search error:', error)
    return []
  }
}

/**
 * Get Spotify artist's top tracks
 */
export async function getSpotifyArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
  try {
    const token = await getSpotifyAccessToken()
    if (!token) return []

    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      console.error('[SPOTIFY] Failed to get top tracks:', response.status)
      return []
    }

    const data = await response.json()
    return data.tracks || []
  } catch (error) {
    console.error('[SPOTIFY] Error getting top tracks:', error)
    return []
  }
}

/**
 * Get Spotify artist details
 */
export async function getSpotifyArtist(artistId: string): Promise<SpotifyArtist | null> {
  try {
    const token = await getSpotifyAccessToken()
    if (!token) return null

    const response = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      console.error('[SPOTIFY] Failed to get artist:', response.status)
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[SPOTIFY] Error getting artist:', error)
    return null
  }
}

/**
 * Search YouTube for videos
 */
export async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      console.error('[YOUTUBE] Search failed:', response.status)
      return []
    }

    const data = await response.json()
    
    // Get video statistics
    const videoIds = data.items?.map((item: any) => item.id.videoId).join(',')
    if (!videoIds) return []

    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
    )

    const statsData = await statsResponse.json()
    const statsMap = new Map(
      statsData.items?.map((item: any) => [item.id, item.statistics]) || []
    )

    return data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
      channelId: item.snippet.channelId,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: statsMap.get(item.id.videoId)?.viewCount || '0',
      likeCount: statsMap.get(item.id.videoId)?.likeCount || '0'
    })) || []
  } catch (error) {
    console.error('[YOUTUBE] Search error:', error)
    return []
  }
}

/**
 * Search Apple Music (requires MusicKit - this is a placeholder)
 * Note: Apple Music requires MusicKit.js and user authentication
 */
export async function searchAppleMusic(query: string): Promise<AppleMusicArtist[]> {
  // Apple Music requires MusicKit.js initialization and user token
  // This is a placeholder that returns mock data
  console.warn('[APPLE_MUSIC] Apple Music integration requires MusicKit.js setup')
  
  // For now, return empty array - implement when MusicKit is set up
  return []
}

/**
 * Parse and import content from a platform
 */
export interface ImportedContent {
  platform: 'spotify' | 'youtube' | 'apple_music'
  artistId?: string
  artistName: string
  profileImage?: string
  tracks?: {
    id: string
    title: string
    url: string
    previewUrl?: string
    artwork?: string
    releaseDate?: string
  }[]
  videos?: {
    id: string
    title: string
    url: string
    thumbnail: string
    views: string
  }[]
  stats?: {
    followers?: number
    totalViews?: string
    totalTracks?: number
  }
}

/**
 * Import Spotify artist content
 */
export async function importSpotifyContent(artistId: string): Promise<ImportedContent | null> {
  try {
    const [artist, tracks] = await Promise.all([
      getSpotifyArtist(artistId),
      getSpotifyArtistTopTracks(artistId)
    ])

    if (!artist) return null

    return {
      platform: 'spotify',
      artistId: artist.id,
      artistName: artist.name,
      profileImage: artist.images[0]?.url,
      tracks: tracks.map(track => ({
        id: track.id,
        title: track.name,
        url: track.external_urls.spotify,
        previewUrl: track.preview_url || undefined,
        artwork: track.album.images[0]?.url,
        releaseDate: track.album.release_date
      })),
      stats: {
        followers: artist.followers.total,
        totalTracks: tracks.length
      }
    }
  } catch (error) {
    console.error('[SPOTIFY] Import error:', error)
    return null
  }
}

/**
 * Import YouTube channel content
 */
export async function importYouTubeContent(channelQuery: string): Promise<ImportedContent | null> {
  try {
    const videos = await searchYouTube(channelQuery)
    if (videos.length === 0) return null

    const channelTitle = videos[0].channelTitle
    const totalViews = videos.reduce((sum, v) => sum + parseInt(v.viewCount || '0'), 0)

    return {
      platform: 'youtube',
      artistName: channelTitle,
      videos: videos.map(video => ({
        id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: video.thumbnails.high.url,
        views: video.viewCount
      })),
      stats: {
        totalViews: totalViews.toString(),
        totalTracks: videos.length
      }
    }
  } catch (error) {
    console.error('[YOUTUBE] Import error:', error)
    return null
  }
}
