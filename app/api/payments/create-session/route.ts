import { NextRequest, NextResponse } from 'next/server'
import { createOrder } from '@/lib/stores/orderStore'
import { PaymentMode } from '@/lib/types/order'

/**
 * POST /api/payments/create-session
 * Create a payment session for x402 checkout
 * 
 * Body:
 * - mode: 'PRODUCT' | 'TIP'
 * - amountUsd: number
 * - productId?: string (required for PRODUCT mode)
 * - targetUserId?: string (required for TIP mode)
 * - buyerId: string (authenticated user)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, amountUsd, productId, targetUserId, buyerId } = body

    // Validation
    if (!mode || !amountUsd || !buyerId) {
      return NextResponse.json(
        { error: 'Missing required fields: mode, amountUsd, buyerId' },
        { status: 400 }
      )
    }

    if (mode !== 'PRODUCT' && mode !== 'TIP') {
      return NextResponse.json(
        { error: 'Invalid mode. Must be PRODUCT or TIP' },
        { status: 400 }
      )
    }

    if (mode === 'PRODUCT' && !productId) {
      return NextResponse.json(
        { error: 'productId is required for PRODUCT mode' },
        { status: 400 }
      )
    }

    if (mode === 'TIP' && !targetUserId) {
      return NextResponse.json(
        { error: 'targetUserId is required for TIP mode' },
        { status: 400 }
      )
    }

    // Determine seller based on mode
    let sellerId: string
    
    if (mode === 'PRODUCT') {
      // For products, fetch the product to get the creator
      const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const response = await fetch(`${origin}/api/products`)
      
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch product details' },
          { status: 500 }
        )
      }
      
      const products = await response.json()
      const product = products.find((p: any) => p.id === productId)
      
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
      
      sellerId = product.creatorId || 'platform'
    } else {
      // For tips, seller is the target user
      sellerId = targetUserId!
    }

    // Create order
    const order = createOrder({
      buyerId,
      sellerId,
      mode: mode as PaymentMode,
      amountUsd,
      productId,
      targetUserId,
    })

    console.log('[CREATE_SESSION] Order created:', {
      orderId: order.id,
      mode,
      amount: amountUsd,
      buyerId,
      sellerId
    })

    // Return session data for x402 checkout
    return NextResponse.json({
      success: true,
      orderId: order.id,
      amountUsd: order.amountUsd,
      mode: order.mode,
      // Additional data that x402 checkout might need
      resourceUrl: mode === 'PRODUCT' 
        ? `/api/x402/resource/${productId}`
        : `/api/x402/resource/tip/${targetUserId}`,
    })
  } catch (error) {
    console.error('[CREATE_SESSION] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}
