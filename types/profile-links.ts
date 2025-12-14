// Profile link types for music platform integration

export type MusicPlatform = 'spotify' | 'apple_music' | 'youtube' | 'soundcloud' | 'tidal' | 'other'

export interface PlatformSearchResult {
  id: string
  platform: MusicPlatform
  name: string
  artistName?: string
  imageUrl?: string
  url: string
  verified?: boolean
  followers?: number
  type: 'artist' | 'track' | 'album' | 'playlist' | 'channel'
}

export interface ProfileLink {
  id: string
  userId: string
  platform: MusicPlatform
  platformId: string
  url: string
  displayName: string
  imageUrl?: string
  verified?: boolean
  isPrimary?: boolean
  createdAt: string
  metadata?: {
    followers?: number
    monthlyListeners?: number
    subscribers?: number
    trackCount?: number
  }
}

export interface ProfileLinkCategory {
  label: string
  platforms: MusicPlatform[]
  icon: string
}

export const PLATFORM_CATEGORIES: ProfileLinkCategory[] = [
  {
    label: 'Streaming',
    platforms: ['spotify', 'apple_music', 'tidal'],
    icon: 'music',
  },
  {
    label: 'Video',
    platforms: ['youtube'],
    icon: 'video',
  },
  {
    label: 'Audio',
    platforms: ['soundcloud'],
    icon: 'audio',
  },
]

export const PLATFORM_CONFIG: Record<MusicPlatform, {
  name: string
  color: string
  searchEnabled: boolean
  urlPattern?: RegExp
}> = {
  spotify: {
    name: 'Spotify',
    color: '#1DB954',
    searchEnabled: true,
    urlPattern: /spotify\.com\/(artist|track|album|playlist)\/([a-zA-Z0-9]+)/,
  },
  apple_music: {
    name: 'Apple Music',
    color: '#FA243C',
    searchEnabled: true,
    urlPattern: /music\.apple\.com\/[a-z]{2}\/(artist|album|playlist)\/[^\/]+\/(\d+)/,
  },
  youtube: {
    name: 'YouTube',
    color: '#FF0000',
    searchEnabled: true,
    urlPattern: /youtube\.com\/(channel|c|user|@)\/([a-zA-Z0-9_-]+)/,
  },
  soundcloud: {
    name: 'SoundCloud',
    color: '#FF5500',
    searchEnabled: false,
    urlPattern: /soundcloud\.com\/([a-zA-Z0-9_-]+)/,
  },
  tidal: {
    name: 'Tidal',
    color: '#000000',
    searchEnabled: false,
    urlPattern: /tidal\.com\/(artist|album|track)\/(\d+)/,
  },
  other: {
    name: 'Other',
    color: '#6B7280',
    searchEnabled: false,
  },
}
