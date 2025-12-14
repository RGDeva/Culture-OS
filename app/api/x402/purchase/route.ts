import { NextResponse } from 'next/server'
import { settlePayment } from "thirdweb/x402"
import { thirdwebX402Facilitator, chain } from '@/lib/thirdweb-server'
import { addPurchase, hasPurchased } from '@/lib/purchases'
import { CheckoutResponse } from '@/types/marketplace'

// x402 Purchase endpoint - handles payment settlement
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, userId } = body

    if (!productId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: productId, userId' },
        { status: 400 }
      )
    }

    // Check if already purchased
    if (hasPurchased(userId, productId)) {
      const response: CheckoutResponse = {
        downloadUrl: `/marketplace/play/${productId}`,
        message: 'You already own this product! Access granted.'
      }
      return NextResponse.json(response)
    }

    // Fetch product details
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

    // Process x402 payment
    const result = await settlePayment({
      resourceUrl: `${origin}/api/products/${productId}`,
      method: "POST",
      paymentData: request.headers.get("x-payment"),
      network: chain,
      price: `$${product.priceUSDC}`, // e.g., "$25.00"
      facilitator: thirdwebX402Facilitator,
    })

    // Check if payment was successful
    if (result.status === 200) {
      // Record purchase
      const purchase = addPurchase(userId, productId)
      console.log('Purchase recorded:', purchase)

      // Generate access based on product type
      let response: CheckoutResponse

      if (product.type === 'ACCESS') {
        response = {
          accessUrl: 'https://discord.gg/noclture',
          message: `Welcome to ${product.title}! Your Discord invite is ready.`
        }
      } else if (product.type === 'SERVICE') {
        response = {
          message: `Service purchased! The creator will contact you at your registered email within 24 hours.`
        }
      } else {
        // BEAT or KIT - provide playback access
        response = {
          downloadUrl: `/marketplace/play/${productId}`,
          message: `Purchase successful! You can now listen to ${product.title}.`
        }
      }

      return NextResponse.json(response)
    } else {
      // Payment failed or requires action
      return NextResponse.json(
        result.responseBody || { error: 'Payment failed' },
        {
          status: result.status,
          headers: result.responseHeaders,
        }
      )
    }
  } catch (error: any) {
    console.error('x402 purchase error:', error)
    
    return NextResponse.json(
      { 
        error: 'Purchase failed', 
        message: error.message || 'Unknown error',
        details: error.toString()
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
