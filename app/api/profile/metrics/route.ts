import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/profileStore'
import { ProfileMetrics } from '@/types/profile'

/**
 * GET /api/profile/metrics?userId=xxx
 * Returns aggregated metrics from external platforms (or mock data)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const profile = getProfile(userId)

    // Count connected platforms
    let platformsConnected = 0
    if (profile?.spotifyUrl) platformsConnected++
    if (profile?.appleMusicUrl) platformsConnected++
    if (profile?.youtubeUrl) platformsConnected++
    if (profile?.soundcloudUrl) platformsConnected++

    // TODO: Call external APIs if env vars exist (Songstats, Recoupable, etc.)
    // For now, return mock data based on whether platforms are connected
    const metrics: ProfileMetrics = {
      platformsConnected,
      monthlyListeners: platformsConnected > 0 ? Math.floor(Math.random() * 50000) + 10000 : undefined,
      streamsLast30Days: platformsConnected > 0 ? Math.floor(Math.random() * 100000) + 20000 : undefined,
      topTrackName: platformsConnected > 0 ? 'Neon Dreams' : undefined,
      socialFollowers: (profile?.instagramUrl || profile?.tiktokUrl) ? Math.floor(Math.random() * 25000) + 5000 : undefined
    }

    console.log('[METRICS_API] Generated metrics for user:', { userId, platformsConnected })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('[METRICS_API] Error:', error)
    // Never throw - return partial data
    return NextResponse.json({
      platformsConnected: 0,
      monthlyListeners: undefined,
      streamsLast30Days: undefined
    })
  }
}
