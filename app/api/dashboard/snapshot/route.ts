import { NextRequest, NextResponse } from 'next/server'
import { getProfile } from '@/lib/profileStore'

/**
 * GET /api/dashboard/snapshot
 * Returns dashboard snapshot data for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get user profile for XP and connected platforms
    const profile = getProfile(userId)

    // TODO: Replace with actual database queries
    // For now, return mock/calculated data
    const snapshot = {
      openProjectsCount: 0, // TODO: Query projects table
      bountiesPosted: 0, // TODO: Query bounties table
      bountiesClaimed: 0, // TODO: Query bounty applications
      earningsThisMonth: 0, // TODO: Query transactions/earnings
      totalEarnings: 0,
      xp: profile?.xp || 0,
      connectedPlatforms: {
        spotify: !!profile?.spotifyUrl,
        appleMusic: !!profile?.appleMusicUrl,
        soundcloud: !!profile?.soundcloudUrl,
        instagram: !!profile?.instagramUrl,
        tiktok: !!profile?.tiktokUrl,
      },
    }

    // In production, you would:
    // 1. Query projects table for open projects by userId
    // 2. Query bounties table for bounties posted by userId
    // 3. Query bounty applications for bounties claimed by userId
    // 4. Query transactions/earnings table for earnings data

    return NextResponse.json(snapshot)
  } catch (error) {
    console.error('[DASHBOARD_SNAPSHOT_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard snapshot' },
      { status: 500 }
    )
  }
}
