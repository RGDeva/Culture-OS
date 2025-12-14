/**
 * Real x402 Checkout API Route
 * Processes crypto payments via Thirdweb x402 on Base Sepolia
 * Called by marketplace UNLOCK button after Privy login
 */
import { NextResponse } from 'next/server'
import { settlePayment } from 'thirdweb/x402'
import { x402Facilitator, NETWORK } from '@/lib/thirdweb-server'
import { addPurchase, hasPurchased } from '@/lib/purchases'
import { CheckoutResponse } from '@/types/marketplace'
import { createPayment, updatePaymentStatus } from '@/lib/stores/paymentStore'
import { addXp } from '@/lib/profileStore'
import { xpForEvent } from '@/lib/xp'
import { getOrder, updateOrderStatus } from '@/lib/stores/orderStore'

/**
 * Helper: Get product by ID from existing products API
 */
async function getProductById(productId: string, origin: string) {
  const response = await fetch(`${origin}/api/products`)
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  const products = await response.json()
  return products.find((p: any) => p.id === productId)
}

/**
 * POST /api/x402/checkout-real
 * Processes x402 payment on Base Sepolia
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, orderId, userId, amountUsd, mode } = body

    // Support both legacy (productId only) and new (orderId) flows
    const isOrderFlow = !!orderId

    // Validate input
    if (!isOrderFlow && !productId) {
      return NextResponse.json(
        { error: 'Missing required field: productId or orderId' },
        { status: 400 }
      )
    }

    // Extract user ID from request or session (for purchase tracking)
    const buyerId = userId || 'anonymous'

    // Get order if using order flow
    let order = null
    if (isOrderFlow) {
      order = getOrder(orderId)
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        )
      }
      
      // Update order status to processing
      updateOrderStatus(orderId, 'PROCESSING')
    }

    // Check if already purchased (prevents duplicate purchases) - only for product mode
    if (productId && hasPurchased(buyerId, productId)) {
      const response: CheckoutResponse = {
        downloadUrl: `/marketplace/play/${productId}`,
        message: 'UNLOCK_SUCCESS — You already own this product'
      }
      return NextResponse.json(response)
    }

    // Fetch product details if in product mode
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    let product = null
    
    if (productId) {
      product = await getProductById(productId, origin)
      if (!product) {
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        )
      }
    }

    // Construct resource URL for x402
    const resourceUrl = isOrderFlow && mode === 'TIP'
      ? `${origin}/api/x402/resource/tip/${order?.targetUserId}`
      : `${origin}/api/x402/resource/${productId}`

    // Format price for x402 (must be string with leading $)
    const price = `$${(amountUsd || product?.priceUSDC || 0).toFixed(2)}`

    // Process x402 payment via Thirdweb
    const result = await settlePayment({
      resourceUrl,
      method: 'GET',
      paymentData: request.headers.get('x-payment'),
      network: NETWORK,
      price,
      facilitator: x402Facilitator,
    })

    // Create payment record (for legacy tracking)
    const payment = isOrderFlow ? null : createPayment({
      type: 'MARKETPLACE_PURCHASE',
      method: 'X402_CRYPTO',
      fromUserId: buyerId,
      toUserId: product?.creatorId || 'platform',
      amountUSDC: product?.priceUSDC || 0,
      productId: productId,
      description: `Purchase: ${product?.title || 'Product'}`,
      metadata: {
        productType: product?.type,
        productTitle: product?.title,
      }
    })

    // Check payment result
    if (result.status === 200) {
      // Payment successful!
      
      // Update order if using order flow
      if (isOrderFlow && order) {
        updateOrderStatus(
          orderId,
          'COMPLETED',
          result.paymentReceipt?.transaction,
          request.headers.get('x-payment') || undefined
        )
        
        // Award XP based on mode
        if (mode === 'TIP') {
          // Tip: award XP to both parties
          addXp(buyerId, xpForEvent('COMPLETE_ORDER'))
          addXp(order.sellerId, xpForEvent('COMPLETE_ORDER'))
        } else if (mode === 'PRODUCT') {
          // Product: award XP to both parties
          addXp(buyerId, xpForEvent('COMPLETE_ORDER'))
          addXp(order.sellerId, xpForEvent('COMPLETE_ORDER'))
        }
      } else if (productId) {
        // Legacy flow: Record purchase and grant access
        const purchase = addPurchase(buyerId, productId)
        
        // Update payment status
        if (payment) {
          updatePaymentStatus(
            payment.id,
            'COMPLETED',
            result.paymentReceipt?.transaction,
            request.headers.get('x-payment') || undefined
          )
        }
        
        // Award XP to buyer
        addXp(buyerId, xpForEvent('COMPLETE_ORDER'))
        
        // Award XP to seller
        if (product?.creatorId && product.creatorId !== 'platform') {
          addXp(product.creatorId, xpForEvent('COMPLETE_ORDER'))
        }
      }
      
      console.log('[x402] Payment successful:', { 
        productId, 
        orderId,
        userId: buyerId,
        mode,
        paymentId: payment?.id 
      })

      // Generate response based on mode
      let response: CheckoutResponse

      if (isOrderFlow && mode === 'TIP') {
        response = {
          message: `TIP_SUCCESS — $${amountUsd} sent successfully!`
        }
      } else if (product) {
        // Product purchase response
        if (product.type === 'ACCESS') {
          response = {
            accessUrl: 'https://discord.gg/noclture',
            message: `UNLOCK_SUCCESS — Access granted to ${product.title}`
          }
        } else if (product.type === 'SERVICE') {
          response = {
            message: 'UNLOCK_SUCCESS — Service purchased. Creator will contact you within 24 hours.'
          }
        } else {
          response = {
            downloadUrl: `/marketplace/play/${productId}`,
            message: `UNLOCK_SUCCESS — You can now access ${product.title}`
          }
        }
      } else {
        response = {
          message: 'PAYMENT_SUCCESS — Transaction completed!'
        }
      }

      return NextResponse.json(response)
    } else {
      // Payment failed or requires additional action
      
      // Update order if using order flow
      if (isOrderFlow && order) {
        updateOrderStatus(orderId, 'FAILED')
      } else if (payment) {
        // Update payment status to failed
        updatePaymentStatus(payment.id, 'FAILED')
      }
      
      // Forward x402 response to frontend
      console.log('[x402] Payment not completed:', { 
        status: result.status, 
        productId,
        orderId,
        paymentId: payment?.id 
      })
      return new NextResponse(
        JSON.stringify(result.responseBody || { error: 'Payment failed' }),
        {
          status: result.status,
          headers: result.responseHeaders || {},
        }
      )
    }
  } catch (error: any) {
    console.error('[x402] Checkout error:', error)
    
    return NextResponse.json(
      { 
        error: 'PAYMENT_FAILED', 
        message: error.message || 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check purchase status
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const productId = url.searchParams.get('productId')

    if (!userId || !productId) {
      return NextResponse.json(
        { error: 'Missing userId or productId' },
        { status: 400 }
      )
    }

    const purchased = hasPurchased(userId, productId)
    return NextResponse.json({ purchased })
  } catch (error) {
    console.error('Check purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    )
  }
}
