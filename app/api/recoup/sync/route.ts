/**
 * POST /api/recoup/sync
 * Triggers Recoupable data sync for the authenticated user
 */

import { NextResponse } from 'next/server'
import { syncArtistDataForUser } from '@/lib/recoup'

export async function POST(request: Request) {
  try {
    // Get user ID from request (same pattern as /api/user/me)
    const authHeader = request.headers.get('authorization')
    
    // For now, accept userId from body for testing
    // In production, extract from Privy token
    const body = await request.json()
    const userId = body.userId
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('[API] Starting Recoup sync for user:', userId)

    // Trigger sync (runs in background)
    const snapshot = await syncArtistDataForUser(userId)

    return NextResponse.json({
      success: true,
      message: 'Data sync completed',
      snapshot,
    })
  } catch (error: any) {
    console.error('[API] Recoup sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Sync failed' },
      { status: 500 }
    )
  }
}
