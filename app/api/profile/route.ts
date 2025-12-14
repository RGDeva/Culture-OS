import { NextRequest, NextResponse } from 'next/server'
import { getProfile, upsertProfile } from '@/lib/profileStore'
import { geocodeLocation, getApproximateCoordinates } from '@/lib/geocoding'

// GET /api/profile?userId=xxx - Get profile by userId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  let profile = getProfile(userId)

  // If no profile exists, return a default empty profile
  if (!profile) {
    profile = {
      id: `profile_new_${userId}`,
      userId,
      displayName: '',
      roles: [],
      profileCompletion: 0,
      profileOnboardingCompleted: false,
      profileOnboardingSkipped: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  return NextResponse.json(profile)
}

// Helper: Extract Spotify artist ID from URL
function extractSpotifyArtistId(url: string): string | undefined {
  if (!url) return undefined
  // Matches: https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x
  const match = url.match(/spotify\.com\/artist\/([a-zA-Z0-9]+)/)
  return match?.[1]
}

// POST /api/profile - Create or update profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // Extract Spotify artist ID from URL if provided
    const spotifyArtistId = extractSpotifyArtistId(profileData.spotifyUrl || profileData.spotifyArtistUrl)

    // Geocode location if provided and not already geocoded
    let locationLat = profileData.locationLat
    let locationLng = profileData.locationLng

    if (!locationLat || !locationLng) {
      if (profileData.locationCity || profileData.locationCountry) {
        console.log('[PROFILE_API] Geocoding location:', {
          city: profileData.locationCity,
          state: profileData.locationState,
          country: profileData.locationCountry
        })

        // Try geocoding first
        let coords = await geocodeLocation(
          profileData.locationCity,
          profileData.locationState,
          profileData.locationCountry
        )

        // Fallback to approximate coordinates
        if (!coords) {
          coords = getApproximateCoordinates(
            profileData.locationCity,
            profileData.locationCountry
          )
        }

        if (coords) {
          locationLat = coords.lat
          locationLng = coords.lng
          console.log('[PROFILE_API] Geocoded to:', { lat: locationLat, lng: locationLng })
        }
      }
    }

    // Create or update profile using in-memory store
    const profile = upsertProfile(userId, {
      ...profileData,
      spotifyArtistId: spotifyArtistId || profileData.spotifyArtistId,
      locationLat,
      locationLng
    })

    console.log('[PROFILE_API] Profile saved:', { userId, completion: profile.profileCompletion })

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('[PROFILE_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}

// PUT /api/profile - Alias for POST (update profile)
export async function PUT(request: NextRequest) {
  return POST(request)
}

// PATCH /api/profile - Partial update profile
export async function PATCH(request: NextRequest) {
  return POST(request)
}
