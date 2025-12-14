import { NextRequest, NextResponse } from 'next/server'
import { importSpotifyContent, importYouTubeContent } from '@/lib/music-platforms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { platform, artistId, query } = body

    if (!platform) {
      return NextResponse.json(
        { error: 'Platform is required' },
        { status: 400 }
      )
    }

    let content = null

    switch (platform) {
      case 'spotify':
        if (!artistId) {
          return NextResponse.json(
            { error: 'artistId is required for Spotify import' },
            { status: 400 }
          )
        }
        content = await importSpotifyContent(artistId)
        break

      case 'youtube':
        if (!query) {
          return NextResponse.json(
            { error: 'query is required for YouTube import' },
            { status: 400 }
          )
        }
        content = await importYouTubeContent(query)
        break

      case 'apple_music':
        return NextResponse.json(
          { error: 'Apple Music import not yet implemented' },
          { status: 501 }
        )

      default:
        return NextResponse.json(
          { error: 'Invalid platform' },
          { status: 400 }
        )
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to import content' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      content
    })
  } catch (error) {
    console.error('[PLATFORMS_IMPORT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to import content' },
      { status: 500 }
    )
  }
}
