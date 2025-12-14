import { NextRequest, NextResponse } from 'next/server'
import { syncArtistDataForUser, generateCampaignRecommendations, getSnapshot } from '@/lib/recoup'
import { upsertProfile } from '@/lib/profileStore'

// POST /api/profile/ingest/recoupable - Ingest Recoupable data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, recoupableAccountId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!recoupableAccountId) {
      return NextResponse.json({ error: 'recoupableAccountId is required' }, { status: 400 })
    }

    console.log('[RECOUPABLE_INGEST] Starting ingestion for user:', userId)
    console.log('[RECOUPABLE_INGEST] Recoupable Account ID:', recoupableAccountId)

    // Update profile with recoupable account ID
    upsertProfile(userId, {
      recoupArtistAccountId: recoupableAccountId
    })

    // Sync artist data from Recoupable API
    // This will fetch: socials, segments, posts, fans, songs, Spotify data
    const snapshot = await syncArtistDataForUser(userId)

    // Generate campaign recommendations based on the data
    const recommendations = generateCampaignRecommendations(snapshot)

    console.log('[RECOUPABLE_INGEST] Sync complete!')
    console.log(`[RECOUPABLE_INGEST] - Fetched ${snapshot.socials ? 'social data' : 'no social data'}`)
    console.log(`[RECOUPABLE_INGEST] - ${snapshot.segments?.length || 0} fan segments`)
    console.log(`[RECOUPABLE_INGEST] - ${snapshot.posts?.length || 0} posts`)
    console.log(`[RECOUPABLE_INGEST] - ${recommendations.length} campaign recommendations`)
    console.log(`[RECOUPABLE_INGEST] - Spotify: ${snapshot.spotify?.artistName || 'not found'}`)

    return NextResponse.json({
      success: true,
      message: 'Recoupable data synced successfully',
      status: 'completed',
      accountId: recoupableAccountId,
      summary: {
        spotifyArtist: snapshot.spotify?.artistName,
        spotifyFollowers: snapshot.spotify?.followers,
        igFollowers: snapshot.socials?.igFollowers,
        tiktokFollowers: snapshot.socials?.tiktokFollowers,
        fanSegments: snapshot.segments?.length || 0,
        posts: snapshot.posts?.length || 0,
        recommendations: recommendations.length
      }
    })
  } catch (error) {
    console.error('[RECOUPABLE_INGEST] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to ingest Recoupable data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
