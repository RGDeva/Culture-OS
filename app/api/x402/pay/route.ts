/**
 * x402 Payment Endpoint - Real crypto payments
 * Uses Thirdweb x402 protocol for pay-to-play
 */
import { NextResponse } from 'next/server'
import { settlePayment } from 'thirdweb/x402'
import { thirdwebX402Facilitator, NETWORK } from '@/lib/thirdweb-server'
import { addPurchase, hasPurchased } from '@/lib/purchases'
import { CheckoutResponse } from '@/types/marketplace'

/**
 * GET /api/x402/pay - Process x402 payment
 * This endpoint is called by x402 protocol to settle payments
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get('productId')
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      )
    }

    // Fetch product to get price
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const productsResponse = await fetch(`${origin}/api/products`)
    const products = await productsResponse.json()
    const product = products.find((p: any) => p.id === productId)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Construct resource URL for x402
    const resourceUrl = `${origin}/api/x402/resource/${productId}`
    
    // Process the payment using x402
    const result = await settlePayment({
      resourceUrl,
      method: "GET",
      paymentData: request.headers.get("x-payment"),
      network: NETWORK,
      price: `$${product.priceUSDC.toFixed(2)}`,
      facilitator: thirdwebX402Facilitator,
    })

    if (result.status === 200) {
      // Payment successful, return product data
      return NextResponse.json({ 
        success: true,
        product: product,
        message: 'Payment successful'
      })
    } else {
      // Return x402 response for client handling
      return new NextResponse(
        JSON.stringify(result.responseBody),
        {
          status: result.status,
          headers: result.responseHeaders,
        }
      )
    }
  } catch (error: any) {
    console.error('[x402] Payment error:', error)
    return NextResponse.json(
      { error: 'Payment processing failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/x402/pay - Initiate payment and record purchase
 * Called after x402 payment is settled
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, userId } = body

    console.log('[x402] Recording purchase:', { productId, userId })

    if (!productId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if already purchased
    if (hasPurchased(userId, productId)) {
      const response: CheckoutResponse = {
        downloadUrl: `/marketplace/play/${productId}`,
        message: 'UNLOCK_SUCCESS — You already own this product'
      }
      return NextResponse.json(response)
    }

    // Fetch product
    const origin = request.headers.get('origin') || 'http://localhost:3000'
    const productsResponse = await fetch(`${origin}/api/products`)
    const products = await productsResponse.json()
    const product = products.find((p: any) => p.id === productId)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Record the purchase
    const purchase = addPurchase(userId, productId)
    console.log('[x402] Purchase recorded:', purchase)

    // Generate response based on product type
    let response: CheckoutResponse

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
        message: `UNLOCK_SUCCESS — You can now play ${product.title}`
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[x402] Error recording purchase:', error)
    return NextResponse.json(
      { error: 'Failed to complete purchase', details: error.message },
      { status: 500 }
    )
  }
}
