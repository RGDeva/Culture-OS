import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/spotify/import-profile
 * Auto-import profile picture and banner from Spotify artist profile
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { spotifyUrl, userId } = body

    if (!spotifyUrl || !userId) {
      return NextResponse.json(
        { error: 'Spotify URL and user ID are required' },
        { status: 400 }
      )
    }

    // Extract artist ID from Spotify URL
    // Format: https://open.spotify.com/artist/[ARTIST_ID]
    const artistIdMatch = spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/)
    if (!artistIdMatch) {
      return NextResponse.json(
        { error: 'Invalid Spotify artist URL' },
        { status: 400 }
      )
    }

    const artistId = artistIdMatch[1]

    // Get Spotify access token (you'll need to implement OAuth flow)
    // For now, we'll use a placeholder
    const spotifyAccessToken = process.env.SPOTIFY_ACCESS_TOKEN

    if (!spotifyAccessToken) {
      console.warn('[SPOTIFY_IMPORT] No Spotify access token configured')
      return NextResponse.json(
        { error: 'Spotify integration not configured' },
        { status: 503 }
      )
    }

    // Fetch artist data from Spotify API
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    )

    if (!spotifyResponse.ok) {
      console.error('[SPOTIFY_IMPORT] Failed to fetch artist data:', spotifyResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch Spotify artist data' },
        { status: spotifyResponse.status }
      )
    }

    const artistData = await spotifyResponse.json()

    // Extract profile picture (highest quality image)
    const profileImage = artistData.images?.[0]?.url || null
    
    // Spotify doesn't provide banner images via API, but we can use the profile image
    // or a larger version as a banner
    const bannerImage = artistData.images?.[1]?.url || artistData.images?.[0]?.url || null

    // Additional data we can extract
    const extractedData = {
      profileImage,
      bannerImage,
      artistName: artistData.name,
      followers: artistData.followers?.total || 0,
      genres: artistData.genres || [],
      popularity: artistData.popularity || 0,
      spotifyUrl: artistData.external_urls?.spotify || spotifyUrl,
    }

    // Update user profile with imported data
    const updateResponse = await fetch(`${request.nextUrl.origin}/api/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        profileImage: extractedData.profileImage,
        bannerImage: extractedData.bannerImage,
        spotifyUrl: extractedData.spotifyUrl,
        // Optionally update display name if not set
        ...(artistData.name && { displayName: artistData.name }),
      }),
    })

    if (!updateResponse.ok) {
      console.error('[SPOTIFY_IMPORT] Failed to update profile')
      return NextResponse.json(
        { error: 'Failed to update profile with Spotify data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: extractedData,
      message: 'Profile successfully imported from Spotify',
    })
  } catch (error) {
    console.error('[SPOTIFY_IMPORT] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/spotify/import-profile?spotifyUrl=...
 * Preview what will be imported without saving
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const spotifyUrl = searchParams.get('spotifyUrl')

    if (!spotifyUrl) {
      return NextResponse.json(
        { error: 'Spotify URL is required' },
        { status: 400 }
      )
    }

    // Extract artist ID from Spotify URL
    const artistIdMatch = spotifyUrl.match(/artist\/([a-zA-Z0-9]+)/)
    if (!artistIdMatch) {
      return NextResponse.json(
        { error: 'Invalid Spotify artist URL' },
        { status: 400 }
      )
    }

    const artistId = artistIdMatch[1]
    const spotifyAccessToken = process.env.SPOTIFY_ACCESS_TOKEN

    if (!spotifyAccessToken) {
      return NextResponse.json(
        { error: 'Spotify integration not configured' },
        { status: 503 }
      )
    }

    // Fetch artist data from Spotify API
    const spotifyResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`,
        },
      }
    )

    if (!spotifyResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Spotify artist data' },
        { status: spotifyResponse.status }
      )
    }

    const artistData = await spotifyResponse.json()

    return NextResponse.json({
      preview: {
        profileImage: artistData.images?.[0]?.url || null,
        bannerImage: artistData.images?.[1]?.url || artistData.images?.[0]?.url || null,
        artistName: artistData.name,
        followers: artistData.followers?.total || 0,
        genres: artistData.genres || [],
        popularity: artistData.popularity || 0,
      },
    })
  } catch (error) {
    console.error('[SPOTIFY_IMPORT] Preview error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
