export const dynamic = 'force-dynamic'
/**
 * GET /api/recoup/snapshot
 * Returns the latest Recoupable snapshot for the authenticated user
 */

import { NextResponse } from 'next/server'
import { getSnapshot } from '@/lib/recoup'

export async function GET(request: Request) {
  try {
    // Extract userId from query params for now
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    console.log('[API] Fetching Recoup snapshot for user:', userId)

    const snapshot = getSnapshot(userId)

    if (!snapshot) {
      return NextResponse.json(
        { error: 'No data synced yet', snapshot: null },
        { status: 404 }
      )
    }

    return NextResponse.json({ snapshot })
  } catch (error: any) {
    console.error('[API] Snapshot fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch snapshot' },
      { status: 500 }
    )
  }
}
