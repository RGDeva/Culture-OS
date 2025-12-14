import { NextRequest, NextResponse } from 'next/server'
import { upsertProfile } from '@/lib/profileStore'

// POST /api/profile/recoupable - Update Recoupable ID
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, recoupableId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!recoupableId) {
      return NextResponse.json({ error: 'recoupableId is required' }, { status: 400 })
    }

    console.log('[RECOUPABLE_UPDATE] Updating Recoupable ID for user:', userId)
    console.log('[RECOUPABLE_UPDATE] New Recoupable ID:', recoupableId)

    // Update profile with new Recoupable ID
    const profile = upsertProfile(userId, {
      recoupArtistAccountId: recoupableId
    })

    console.log('[RECOUPABLE_UPDATE] Profile updated successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Recoupable ID updated successfully',
      profile 
    })
  } catch (error) {
    console.error('[RECOUPABLE_UPDATE] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update Recoupable ID',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
