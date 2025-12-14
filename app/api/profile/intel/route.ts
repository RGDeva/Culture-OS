/**
 * Profile Intelligence API - /api/profile/intel
 * GET: Returns mock analytics and campaign suggestions based on profile
 */

import { NextResponse } from 'next/server'
import { getProfileByUserId } from '@/lib/profileStore'
import { generateProfileIntel } from '@/lib/profileIntel'

/**
 * GET /api/profile/intel
 * Returns intelligence data for the current user's profile
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || request.headers.get('x-user-id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }
    
    const profile = getProfileByUserId(userId)
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Create a profile first.' },
        { status: 404 }
      )
    }
    
    // Generate intelligence
    const intel = generateProfileIntel(profile)
    
    console.log('[API] Generated intelligence:', { 
      userId, 
      profileId: profile.id,
      completeness: intel.profileCompleteness 
    })
    
    return NextResponse.json(intel)
  } catch (error: any) {
    console.error('[API] Error generating intelligence:', error)
    return NextResponse.json(
      { error: 'Failed to generate intelligence', message: error.message },
      { status: 500 }
    )
  }
}
