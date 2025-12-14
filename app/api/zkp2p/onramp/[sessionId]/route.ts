import { NextRequest, NextResponse } from 'next/server'
import { getOnrampSessionStatus } from '@/lib/zkp2p'

/**
 * GET /api/zkp2p/onramp/[sessionId]
 * Poll the status of an on-ramp session
 * 
 * Returns: { status, txHash?, amountReceivedUsdc?, updatedAt }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    console.log('[ONRAMP_STATUS_API] Fetching status for session:', sessionId)

    // Fetch status from zkp2p
    const status = await getOnrampSessionStatus(sessionId)

    // TODO: Update session status in database
    // TODO: If status === 'COMPLETED', trigger:
    //   - XP award for successful on-ramp
    //   - In-app notification
    //   - Update user balance/transaction history

    console.log('[ONRAMP_STATUS_API] Status fetched:', {
      sessionId,
      status: status.status,
      txHash: status.txHash,
    })

    return NextResponse.json({
      success: true,
      sessionId,
      status: status.status,
      txHash: status.txHash,
      amountReceivedUsdc: status.amountReceivedUsdc,
      updatedAt: status.updatedAt,
    })
  } catch (error: any) {
    console.error('[ONRAMP_STATUS_API] Error fetching status:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch session status',
      },
      { status: 500 }
    )
  }
}
