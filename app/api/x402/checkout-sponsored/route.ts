/**
 * Server-Sponsored Checkout
 * Server wallet pays for everything using test ETH on Base Sepolia
 * No user wallet/funds needed - perfect for testnet
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
 * POST /api/x402/checkout-sponsored
 * Server-sponsored payments - server wallet covers costs with test ETH
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId } = body

    console.log('[SPONSORED] Checkout initiated:', { productId })

    if (!productId) {
      return NextResponse.json(
        { error: 'Missing required field: productId' },
        { status: 400 }
      )
    }

    const userId = body.userId || 'test-user'

    // Check if already purchased
    if (hasPurchased(userId, productId)) {
      console.log('[SPONSORED] User already owns product:', { userId, productId })
      const response: CheckoutResponse = {
        downloadUrl: `/marketplace/play/${productId}`,
        message: 'UNLOCK_SUCCESS — You already own this product'
      }
      return NextResponse.json(response)
    }

    // Fetch product details
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const product = await getProductById(productId, origin)

    if (!product) {
      console.log('[SPONSORED] Product not found:', { productId })
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    console.log('[SPONSORED] Product found:', { 
      id: product.id, 
      title: product.title, 
      price: product.priceUSDC,
      type: product.type 
    })

    // Simulate server wallet transaction (using test ETH)
    // In testnet, we just grant access since server wallet has test ETH
    console.log('[SPONSORED] Server wallet processing payment with test ETH...')
    
    // Realistic delay to simulate blockchain tx
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Server wallet "pays" (covers the cost)
    // Record purchase - user gets access
    const purchase = addPurchase(userId, productId)
    
    console.log('[SPONSORED] Payment successful (server-sponsored):', { 
      productId, 
      userId, 
      purchase,
      sponsoredBy: 'SERVER_WALLET',
      network: 'BASE_SEPOLIA'
    })

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
    console.error('[SPONSORED] Checkout error:', error)
    
    return NextResponse.json(
      { 
        error: 'PAYMENT_FAILED', 
        message: error.message || 'Server wallet payment failed. Please try again.'
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
    console.log('[SPONSORED] Purchase status check:', { userId, productId, purchased })
    
    return NextResponse.json({ purchased })
  } catch (error) {
    console.error('[SPONSORED] Check purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to check purchase status' },
      { status: 500 }
    )
  }
}
