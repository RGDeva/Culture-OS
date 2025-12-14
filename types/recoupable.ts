/**
 * Recoupable API Types
 * Based on: https://docs.recoupable.com/getting-started
 */

// Core snapshot stored in our system
export interface RecoupSnapshot {
  userId: string
  artistAccountId: string
  fetchedAt: string
  spotify?: {
    monthlyListeners?: number
    topTracks?: SpotifyTrack[]
    topCountries?: { country: string; listeners: number }[]
    artistName?: string
    artistId?: string
    followers?: number
  }
  socials?: {
    igFollowers?: number
    tiktokFollowers?: number
    xFollowers?: number
    youtubeSubscribers?: number
  }
  fans?: {
    totalFans?: number
    topCountries?: string[]
  }
  segments?: RecoupSegment[]
  posts?: RecoupPost[]
}

export interface SpotifyTrack {
  id: string
  name: string
  playCount?: number
  popularity?: number
  previewUrl?: string
}

export interface RecoupSegment {
  segmentName: string
  size: number
  description?: string
  country?: string
  platform?: string
}

export interface RecoupPost {
  platform: string
  url: string
  engagementScore: number
  createdAt: string
  content?: string
  likes?: number
  comments?: number
  shares?: number
}

export interface RecoupTask {
  id: string
  title: string
  description?: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  dueDate?: string
  createdAt: string
  updatedAt: string
  artistAccountId: string
  songId?: string
  assignedTo?: string
}

// API Response types
export interface ArtistSocialResponse {
  id: string
  artistAccountId: string
  platform: string
  username?: string
  url?: string
  followers?: number
  verified?: boolean
  metadata?: Record<string, any>
}

export interface SpotifyArtistResponse {
  id: string
  name: string
  followers?: { total: number }
  genres?: string[]
  popularity?: number
  images?: { url: string; height?: number; width?: number }[]
  externalUrls?: { spotify: string }
}

export interface RecoupSong {
  id: string
  title: string
  artistAccountId: string
  isrc?: string
  releaseDate?: string
  duration?: number
  platforms?: {
    platform: string
    playCount?: number
    url?: string
  }[]
}

export interface RecoupCatalog {
  id: string
  name: string
  artistAccountId: string
  songCount?: number
  createdAt: string
}

// Campaign recommendation types
export interface CampaignRecommendation {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  targetPlatform?: string
  targetCountry?: string
  reasoning: string
  estimatedReach?: number
}
