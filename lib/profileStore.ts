/**
 * Profile storage - in-memory store similar to purchases
 * Can be upgraded to Prisma/Supabase later
 */

import { Profile, ProfileInput } from '@/types/profile'

// In-memory store
const profiles: Map<string, Profile> = new Map()

/**
 * Get profile by user ID
 */
export function getProfileByUserId(userId: string): Profile | null {
  return profiles.get(userId) || null
}

/**
 * Alias for getProfileByUserId (used by recoup library)
 */
export function getProfile(userId: string): Profile | null {
  return getProfileByUserId(userId)
}

/**
 * Calculate profile completion percentage
 * +40% if basic identity + at least one role
 * +30% if at least 1 platform link
 * +20% if at least 1 social link
 * +10% if at least one capability turned on
 */
export function calculateProfileCompletion(profile: Partial<Profile>): number {
  let completion = 0
  
  // Basic identity + role (40%)
  if (profile.displayName && profile.roles && profile.roles.length > 0) {
    completion += 40
  }
  
  // Platform links (30%)
  const hasPlatformLink = !!(
    profile.spotifyUrl ||
    profile.appleMusicUrl ||
    profile.youtubeUrl ||
    profile.soundcloudUrl
  )
  if (hasPlatformLink) {
    completion += 30
  }
  
  // Social links (20%)
  const hasSocialLink = !!(
    profile.instagramUrl ||
    profile.tiktokUrl ||
    profile.xUrl ||
    profile.websiteUrl
  )
  if (hasSocialLink) {
    completion += 20
  }
  
  // Capabilities (10%)
  const hasCapability = !!(
    profile.capabilities?.sellsAssets ||
    profile.capabilities?.sellsServices ||
    profile.capabilities?.postsBounties ||
    profile.capabilities?.offersStudioSessions
  )
  if (hasCapability) {
    completion += 10
  }
  
  return Math.min(completion, 100)
}

/**
 * Upsert (create or update) profile
 */
export function upsertProfile(userId: string, input: Partial<ProfileInput> & { capabilities?: any, highlightTrackIds?: string[], highlightTrackUrls?: string[] }): Profile {
  const existing = profiles.get(userId)
  
  // Helper: Extract Spotify artist ID from URL
  const extractSpotifyId = (url?: string): string | undefined => {
    if (!url) return undefined
    const match = url.match(/artist\/(\w+)/)
    return match?.[1]
  }
  
  const profile: Profile = {
    id: existing?.id || `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    displayName: input.displayName || existing?.displayName || '',
    roles: input.roles || existing?.roles || [],
    primaryGoal: input.primaryGoal ?? existing?.primaryGoal,
    
    // Location
    locationCity: input.locationCity ?? existing?.locationCity,
    locationState: (input as any).locationState ?? existing?.locationState,
    locationCountry: input.locationCountry ?? existing?.locationCountry,
    locationRegion: existing?.locationRegion,
    latitude: (input as any).latitude ?? existing?.latitude,
    longitude: (input as any).longitude ?? existing?.longitude,
    locationLat: (input as any).locationLat ?? existing?.locationLat,
    locationLng: (input as any).locationLng ?? existing?.locationLng,
    
    // Music metadata
    genres: input.genres ?? existing?.genres,
    
    // Music platforms
    spotifyUrl: input.spotifyUrl ?? existing?.spotifyUrl,
    spotifyArtistId: input.spotifyArtistId || extractSpotifyId(input.spotifyUrl) || existing?.spotifyArtistId,
    appleMusicUrl: input.appleMusicUrl ?? existing?.appleMusicUrl,
    youtubeUrl: input.youtubeUrl ?? existing?.youtubeUrl,
    soundcloudUrl: input.soundcloudUrl ?? existing?.soundcloudUrl,
    audiomackUrl: (input as any).audiomackUrl ?? existing?.audiomackUrl,
    
    // Social platforms
    instagramUrl: input.instagramUrl ?? existing?.instagramUrl,
    instagramHandle: input.instagramHandle ?? existing?.instagramHandle,
    tiktokUrl: input.tiktokUrl ?? existing?.tiktokUrl,
    tiktokHandle: input.tiktokHandle ?? existing?.tiktokHandle,
    xUrl: input.xUrl ?? existing?.xUrl,
    xHandle: input.xHandle ?? existing?.xHandle,
    
    // Other
    websiteUrl: input.websiteUrl ?? existing?.websiteUrl,
    linkInBioUrl: input.linkInBioUrl ?? existing?.linkInBioUrl,
    
    // Bio and studio
    bio: (input as any).bio ?? existing?.bio,
    lookingFor: (input as any).lookingFor ?? existing?.lookingFor,
    studioAssociation: (input as any).studioAssociation ?? existing?.studioAssociation,
    studioSuggestion: (input as any).studioSuggestion ?? existing?.studioSuggestion,
    
    // XP and tags
    xp: (input as any).xp ?? existing?.xp ?? 0,
    tags: (input as any).tags ?? existing?.tags,
    
    // Recoupable
    recoupArtistAccountId: input.recoupArtistAccountId ?? existing?.recoupArtistAccountId,
    
    // Capabilities
    capabilities: input.capabilities ?? existing?.capabilities,
    
    // Highlight tracks
    highlightTrackIds: input.highlightTrackIds ?? existing?.highlightTrackIds,
    highlightTrackUrls: input.highlightTrackUrls ?? existing?.highlightTrackUrls,
    
    // Profile completion (calculated)
    profileCompletion: 0, // Will be calculated below
    
    // Onboarding
    profileOnboardingCompleted: input.displayName ? true : (existing?.profileOnboardingCompleted || false),
    profileOnboardingSkipped: existing?.profileOnboardingSkipped || false,
    
    // Metadata
    createdAt: existing?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // Calculate completion
  profile.profileCompletion = calculateProfileCompletion(profile)
  
  profiles.set(userId, profile)
  console.log('[PROFILE] Upserted profile:', { userId, profileId: profile.id, completion: profile.profileCompletion })
  
  return profile
}

/**
 * Delete profile by user ID
 */
export function deleteProfile(userId: string): boolean {
  return profiles.delete(userId)
}

/**
 * Get all profiles (for admin/debugging)
 */
export function getAllProfiles(): Profile[] {
  return Array.from(profiles.values())
}

/**
 * Check if profile is complete (has at least one music/social link)
 */
export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  
  const hasLinks = !!(
    profile.spotifyUrl ||
    profile.appleMusicUrl ||
    profile.youtubeUrl ||
    profile.soundcloudUrl ||
    profile.instagramUrl ||
    profile.tiktokUrl ||
    profile.xUrl ||
    profile.websiteUrl
  )
  
  const hasBasicInfo = !!(
    profile.displayName &&
    profile.roles &&
    profile.roles.length > 0
  )
  
  return hasBasicInfo && hasLinks
}

/**
 * Mark profile as onboarding skipped
 */
export function skipOnboarding(userId: string): void {
  const existing = profiles.get(userId)
  if (existing) {
    existing.profileOnboardingSkipped = true
    existing.updatedAt = new Date().toISOString()
    profiles.set(userId, existing)
  }
}

/**
 * Check if user needs onboarding
 */
export function needsOnboarding(userId: string): boolean {
  const profile = profiles.get(userId)
  if (!profile) return true
  return !profile.profileOnboardingCompleted && !profile.profileOnboardingSkipped
}

/**
 * Add XP to a user's profile
 */
export function addXp(userId: string, amount: number): Profile | null {
  const existing = profiles.get(userId)
  if (!existing) return null
  
  const updated: Profile = {
    ...existing,
    xp: (existing.xp || 0) + amount,
    updatedAt: new Date().toISOString()
  }
  
  profiles.set(userId, updated)
  console.log('[PROFILE] Added XP:', { userId, amount, newTotal: updated.xp })
  
  return updated
}

/**
 * Add a tag to a user's profile
 */
export function addTag(userId: string, tag: string): Profile | null {
  const existing = profiles.get(userId)
  if (!existing) return null
  
  const tags = existing.tags || []
  if (tags.includes(tag)) return existing
  
  const updated: Profile = {
    ...existing,
    tags: [...tags, tag],
    updatedAt: new Date().toISOString()
  }
  
  profiles.set(userId, updated)
  return updated
}

/**
 * Remove a tag from a user's profile
 */
export function removeTag(userId: string, tag: string): Profile | null {
  const existing = profiles.get(userId)
  if (!existing) return null
  
  const updated: Profile = {
    ...existing,
    tags: (existing.tags || []).filter(t => t !== tag),
    updatedAt: new Date().toISOString()
  }
  
  profiles.set(userId, updated)
  return updated
}
