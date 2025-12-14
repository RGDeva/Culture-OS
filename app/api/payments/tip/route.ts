import { NextRequest, NextResponse } from 'next/server'
import { Tip, PaymentSplit, PAYMENT_SPLIT_CONFIG } from '@/types/payments'
import { getProfile } from '@/lib/profileStore'

// In-memory storage (replace with database later)
const tips: Map<string, Tip> = new Map()

/**
 * POST /api/payments/tip
 * Send a direct tip to a creator
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { targetUserId, amountUSD, tipperId, tipperName, message } = body

    if (!targetUserId || !amountUSD || !tipperId) {
      return NextResponse.json(
        { error: 'targetUserId, amountUSD, and tipperId are required' },
        { status: 400 }
      )
    }

    if (amountUSD < 1) {
      return NextResponse.json(
        { error: 'Minimum tip amount is $1' },
        { status: 400 }
      )
    }

    // Get target user profile
    const targetProfile = getProfile(targetUserId)
    const targetUserName = targetProfile?.displayName || 'Anonymous'

    // Calculate splits based on config
    const config = PAYMENT_SPLIT_CONFIG.TIP
    const splits: PaymentSplit[] = [
      {
        recipientId: targetUserId,
        amount: amountUSD * config.creator,
        percentage: config.creator * 100,
        label: 'Creator',
      },
      {
        recipientId: 'platform',
        amount: amountUSD * config.platform,
        percentage: config.platform * 100,
        label: 'Platform Fee',
      },
    ]

    // Create tip record
    const tip: Tip = {
      id: `tip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      targetUserId,
      targetUserName,
      tipperId,
      tipperName,
      amountUSD,
      splits,
      status: 'PENDING',
      message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // TODO: Call x402/Thirdweb payment processing
    // For now, simulate successful payment
    console.log('[TIP] Processing payment:', {
      tipId: tip.id,
      amount: amountUSD,
      to: targetUserName,
      splits: splits.map(s => `${s.label}: $${s.amount.toFixed(2)}`),
    })

    // Simulate payment processing
    // In production, this would call /api/x402/checkout-real or similar
    tip.status = 'COMPLETED'
    tip.transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`

    tips.set(tip.id, tip)

    console.log('[TIP] Payment completed:', tip.id)

    return NextResponse.json({
      success: true,
      tip,
      message: 'Tip sent successfully',
    })
  } catch (error) {
    console.error('[TIP] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process tip',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/tip?userId=xxx
 * Get all tips for a user (received)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    )
  }

  const userTips = Array.from(tips.values()).filter(
    t => t.targetUserId === userId && t.status === 'COMPLETED'
  )

  const totalReceived = userTips.reduce((sum, t) => {
    const creatorSplit = t.splits.find(s => s.recipientId === userId)
    return sum + (creatorSplit?.amount || 0)
  }, 0)

  const tippersCount = new Set(userTips.map(t => t.tipperId)).size

  return NextResponse.json({
    tips: userTips,
    summary: {
      totalReceived,
      tippersCount,
      tipsCount: userTips.length,
    },
  })
}
