import { NextRequest, NextResponse } from 'next/server'
import { createPaymentLink } from '@/lib/payments/paymentService'

/**
 * POST /api/payments/create-link
 * Create a payment link for asset or booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      targetType,
      targetId,
      amount,
      currency,
      splits,
      metadata,
      description,
    } = body

    // Validation
    if (!targetType || !targetId || !amount || !currency || !splits) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['Asset', 'Booking', 'License'].includes(targetType)) {
      return NextResponse.json(
        { error: 'Invalid target type' },
        { status: 400 }
      )
    }

    // Validate splits
    if (!Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { error: 'Splits array is required' },
        { status: 400 }
      )
    }

    const totalShare = splits.reduce((sum: number, split: any) => sum + split.share, 0)
    if (Math.abs(totalShare - 1.0) > 0.001) {
      return NextResponse.json(
        { error: `Splits must sum to 1.0, got ${totalShare}` },
        { status: 400 }
      )
    }

    // Create payment link
    const paymentLink = await createPaymentLink({
      targetType,
      targetId,
      amount,
      currency,
      splits,
      metadata,
      description,
    })

    return NextResponse.json({
      success: true,
      paymentLink,
    })
  } catch (error: any) {
    console.error('[PAYMENTS] Create link error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create payment link',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
