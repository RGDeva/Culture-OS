/**
 * TEST x402 Checkout - For testing without real wallet signatures
 * Use this endpoint while developing, switch to /checkout-real for production
 */
import { NextResponse } from 'next/server'
import { addPurchase, hasPurchased } from '@/lib/purchases'
import { CheckoutResponse } from '@/types/marketplace'

/**
 * Helper: Get product by ID
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
 * POST /api/x402/checkout-test
 * Mock checkout for testing - bypasses real payment
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required field: productId' },
        { status: 400 }
      )
    }

    const userId = body.userId || 'test-user'

    // Check if already purchased
    if (hasPurchased(userId, productId)) {
      const response: CheckoutResponse = {
        downloadUrl: `/marketplace/play/${productId}`,
        message: 'UNLOCK_SUCCESS — You already own this product'
      }
      return NextResponse.json(response)
    }

    // Fetch product
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const product = await getProductById(productId, origin)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Simulate payment processing delay (realistic)
    await new Promise(resolve => setTimeout(resolve, 800))

    // Record purchase (mock payment success)
    const purchase = addPurchase(userId, productId)
    console.log('[TEST] Mock payment successful:', { productId, userId, purchase })

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
      // BEAT or KIT
      response = {
        downloadUrl: `/marketplace/play/${productId}`,
        message: `UNLOCK_SUCCESS — You can now access ${product.title}`
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[TEST] Checkout error:', error)
    
    return NextResponse.json(
      { 
        error: 'PAYMENT_FAILED', 
        message: error.message || 'An unexpected error occurred'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check purchase status
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId') || 'test-user'
    const productId = url.searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing productId' },
        { status: 400 }
      )
    }

    const purchased = hasPurchased(userId, productId)
    return NextResponse.json({ purchased })
  } catch (error) {
    console.error('[TEST] Check purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    )
  }
}
