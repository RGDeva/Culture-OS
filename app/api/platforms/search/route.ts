export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { searchSpotifyArtist, searchYouTube, searchAppleMusic } from '@/lib/music-platforms'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')
    const platform = searchParams.get('platform') // 'spotify' | 'youtube' | 'apple_music' | 'all'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      )
    }

    const results: any = {}

    // Search all platforms or specific one
    if (!platform || platform === 'all' || platform === 'spotify') {
      results.spotify = await searchSpotifyArtist(query)
    }

    if (!platform || platform === 'all' || platform === 'youtube') {
      results.youtube = await searchYouTube(query)
    }

    if (!platform || platform === 'all' || platform === 'apple_music') {
      results.apple_music = await searchAppleMusic(query)
    }

    return NextResponse.json({
      query,
      results
    })
  } catch (error) {
    console.error('[PLATFORMS_SEARCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to search platforms' },
      { status: 500 }
    )
  }
}
