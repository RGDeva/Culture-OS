import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/x402/resource/tip/[userId]
 * Resource endpoint for x402 tip payments
 * This endpoint is called by x402 to verify the resource exists
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Verify the user exists (optional - could check profile store)
    // For now, just return success
    
    return NextResponse.json({
      resource: 'tip',
      targetUserId: params.userId,
      available: true,
    })
  } catch (error) {
    console.error('[X402_RESOURCE] Error:', error)
    return NextResponse.json(
      { error: 'Resource not found' },
      { status: 404 }
    )
  }
}
