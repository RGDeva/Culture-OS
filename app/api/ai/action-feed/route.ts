import { NextRequest, NextResponse } from 'next/server'
import { getAIActionFeed } from '@/lib/ai/assistantService'

/**
 * GET /api/ai/action-feed?userId=xxx
 * Get AI-powered action suggestions for dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const actions = await getAIActionFeed(userId)

    return NextResponse.json({
      success: true,
      actions,
    })
  } catch (error: any) {
    console.error('[AI] Action feed error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate action feed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
