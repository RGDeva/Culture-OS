/**
 * Profile types for NoCulture OS
 * Ties to Privy user and stores music/social links for intelligence
 */

export type UserRole = 
  | 'ARTIST' 
  | 'PRODUCER' 
  | 'ENGINEER' 
  | 'STUDIO' 
  | 'MANAGER'
  | 'MODEL'
  | 'VISUAL_MEDIA'
  | 'INFLUENCER'
  | 'OTHER'
export type ProfileRole = UserRole // Alias for backwards compatibility

export interface Profile {
  id: string
  userId: string // Privy user ID
  displayName: string
  roles: ProfileRole[]
  primaryGoal?: string
  
  // Location
  locationCity?: string
  locationState?: string
  locationCountry?: string
  locationRegion?: string
  latitude?: number
  longitude?: number
  locationLat?: number // For map display
  locationLng?: number // For map display
  
  // Music metadata
  genres?: string[]
  
  // Music platforms
  spotifyUrl?: string
  spotifyArtistId?: string // Extracted from URL or manual entry
  appleMusicUrl?: string
  youtubeUrl?: string
  soundcloudUrl?: string
  audiomackUrl?: string
  
  // Social platforms
  instagramUrl?: string
  instagramHandle?: string
  tiktokUrl?: string
  tiktokHandle?: string
  xUrl?: string // X/Twitter
  xHandle?: string
  
  // Other
  websiteUrl?: string
  linkInBioUrl?: string
  
  // Studio association
  studioAssociation?: string
  studioSuggestion?: string
  
  // Bio and looking for
  bio?: string
  lookingFor?: string
  
  // XP and tags
  xp?: number
  tags?: string[] // e.g. ['NOCTURE_NETWORK', 'REFERRED', 'FEATURED']
  
  // Recoupable integration
  recoupArtistAccountId?: string // Links to Recoupable account
  
  // Capabilities
  capabilities?: Capabilities
  
  // Highlight tracks (vault file IDs or URLs)
  highlightTrackIds?: string[]
  highlightTrackUrls?: string[]
  
  // Profile image
  profileImage?: string
  username?: string
  location?: string
  
  // Muso AI credits
  musoCredits?: Array<{
    id?: string
    title: string
    artist: string
    role: string
    verified?: boolean
  }>
  
  // Profile completion (0-100)
  profileCompletion: number
  primaryRole?: UserRole
  
  // Onboarding state
  profileOnboardingCompleted: boolean
  profileOnboardingSkipped: boolean
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface ProfileInput {
  displayName: string
  roles: ProfileRole[]
  primaryGoal?: string
  locationCity?: string
  locationCountry?: string
  genres?: string[]
  spotifyUrl?: string
  spotifyArtistId?: string
  appleMusicUrl?: string
  youtubeUrl?: string
  soundcloudUrl?: string
  instagramUrl?: string
  instagramHandle?: string
  tiktokUrl?: string
  tiktokHandle?: string
  xUrl?: string
  xHandle?: string
  websiteUrl?: string
  linkInBioUrl?: string
  recoupArtistAccountId?: string
}

export interface ExternalLinks {
  spotifyArtistUrl?: string
  appleMusicArtistUrl?: string
  soundcloudUrl?: string
  youtubeUrl?: string
  instagramUrl?: string
  tiktokUrl?: string
  xUrl?: string
  websiteUrl?: string
}

export interface Capabilities {
  sellsAssets: boolean
  sellsServices: boolean
  postsBounties: boolean
  offersStudioSessions: boolean
  priceRange?: string
  currency?: string
  turnaroundDays?: number
}

export interface ProfileMetrics {
  monthlyListeners?: number
  streamsLast30Days?: number
  topTrackName?: string
  platformsConnected: number
  socialFollowers?: number
}

export interface EarningsSummary {
  totalEarned: number
  thisMonth: number
  pendingPayouts: number
  breakdown: {
    marketplaceAssets: number
    marketplaceServices: number
    vaultBounties: number
  }
}

export interface ProfileIntel {
  hasSpotify: boolean
  hasAppleMusic: boolean
  hasYoutube: boolean
  hasSoundcloud: boolean
  hasInstagram: boolean
  hasTikTok: boolean
  hasX: boolean
  estimatedMonthlyListeners: number
  estimatedSocialFollowers: number
  suggestedCampaigns: string[]
  suggestedSavingsMessage: string
  profileCompleteness: number // 0-100
}
