/**
 * Profile API - /api/profile/me
 * GET: Retrieve current user's profile
 * POST/PUT: Create or update current user's profile
 */

import { NextResponse } from 'next/server'
import { getProfileByUserId, upsertProfile } from '@/lib/profileStore'
import { ProfileInput } from '@/types/profile'

/**
 * GET /api/profile/me
 * Returns the profile for the current user
 */
export async function GET(request: Request) {
  try {
    // Get user ID from header or query (mock auth for now)
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required. Pass userId query param or x-user-id header.' },
        { status: 401 }
      )
    }
    
    const profile = getProfileByUserId(userId)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(profile)
  } catch (error: any) {
    console.error('[API] Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/profile/me
 * Creates or updates the profile for the current user
 */
export async function POST(request: Request) {
  try {
    // Get user ID from header or body
    const body = await request.json()
    const userId = body.userId || request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }
    
    // Validate required fields
    if (!body.displayName || !body.roles || body.roles.length === 0) {
      return NextResponse.json(
        { error: 'displayName and at least one role are required' },
        { status: 400 }
      )
    }
    
    // Create profile input
    const profileInput: ProfileInput = {
      displayName: body.displayName,
      roles: body.roles,
      primaryGoal: body.primaryGoal,
      locationRegion: body.locationRegion,
      spotifyUrl: body.spotifyUrl,
      appleMusicUrl: body.appleMusicUrl,
      youtubeUrl: body.youtubeUrl,
      soundcloudUrl: body.soundcloudUrl,
      instagramUrl: body.instagramUrl,
      tiktokUrl: body.tiktokUrl,
      xUrl: body.xUrl,
      websiteUrl: body.websiteUrl,
      linkInBioUrl: body.linkInBioUrl
    }
    
    // Upsert profile
    const profile = upsertProfile(userId, profileInput)
    
    console.log('[API] Profile created/updated:', { userId, profileId: profile.id })
    
    return NextResponse.json(profile, { status: 200 })
  } catch (error: any) {
    console.error('[API] Error creating/updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile', message: error.message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/profile/me
 * Alias for POST - same behavior
 */
export async function PUT(request: Request) {
  return POST(request)
}
