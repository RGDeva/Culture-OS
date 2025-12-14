import { NextRequest, NextResponse } from 'next/server'
import { getAllProfiles } from '@/lib/profileStore'
import { UserRole } from '@/types/profile'
import { calculateXpTier } from '@/lib/xp-system'

/**
 * GET /api/profiles
 * Search and filter profiles for the network page
 * 
 * Query params:
 * - roles: comma-separated list of roles to filter by
 * - location: text search for city/state/country
 * - genres: comma-separated list of genres
 * - xpTier: ROOKIE | CORE | POWER_USER
 * - tags: comma-separated list of tags
 * - search: general search term (name, bio)
 * - studioAssociation: filter by studio
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get all profiles
    let profiles = getAllProfiles()
    
    // Filter by roles
    const rolesParam = searchParams.get('roles')
    if (rolesParam) {
      const roles = rolesParam.split(',') as UserRole[]
      profiles = profiles.filter(profile => 
        profile.roles.some(role => roles.includes(role))
      )
    }
    
    // Filter by location (city, state, or country)
    const location = searchParams.get('location')
    if (location) {
      const locationLower = location.toLowerCase()
      profiles = profiles.filter(profile => 
        profile.locationCity?.toLowerCase().includes(locationLower) ||
        profile.locationState?.toLowerCase().includes(locationLower) ||
        profile.locationCountry?.toLowerCase().includes(locationLower)
      )
    }
    
    // Filter by genres
    const genresParam = searchParams.get('genres')
    if (genresParam) {
      const genres = genresParam.split(',').map(g => g.toLowerCase())
      profiles = profiles.filter(profile => 
        profile.genres?.some(genre => 
          genres.includes(genre.toLowerCase())
        )
      )
    }
    
    // Filter by XP tier
    const xpTier = searchParams.get('xpTier')
    if (xpTier) {
      profiles = profiles.filter(profile => {
        const tier = calculateXpTier(profile.xp || 0)
        return tier === xpTier
      })
    }
    
    // Filter by tags
    const tagsParam = searchParams.get('tags')
    if (tagsParam) {
      const tags = tagsParam.split(',')
      profiles = profiles.filter(profile => 
        profile.tags?.some(tag => tags.includes(tag))
      )
    }
    
    // Filter by studio association
    const studioAssociation = searchParams.get('studioAssociation')
    if (studioAssociation) {
      profiles = profiles.filter(profile => 
        profile.studioAssociation === studioAssociation
      )
    }
    
    // General search (name, bio)
    const search = searchParams.get('search')
    if (search) {
      const searchLower = search.toLowerCase()
      profiles = profiles.filter(profile => 
        profile.displayName?.toLowerCase().includes(searchLower) ||
        profile.bio?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by XP (highest first)
    profiles.sort((a, b) => (b.xp || 0) - (a.xp || 0))
    
    // Add computed tier to each profile
    const profilesWithTier = profiles.map(profile => ({
      ...profile,
      tier: calculateXpTier(profile.xp || 0)
    }))
    
    return NextResponse.json({ profiles: profilesWithTier })
  } catch (error) {
    console.error('[PROFILES_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}
