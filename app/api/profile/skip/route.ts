/**
 * POST /api/profile/skip
 * Mark profile onboarding as skipped for user
 */

import { NextResponse } from 'next/server'
import { skipOnboarding } from '@/lib/profileStore'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    skipOnboarding(userId)

    return NextResponse.json({
      success: true,
      message: 'Onboarding marked as skipped',
    })
  } catch (error: any) {
    console.error('[API] Skip onboarding error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to skip onboarding' },
      { status: 500 }
    )
  }
}
