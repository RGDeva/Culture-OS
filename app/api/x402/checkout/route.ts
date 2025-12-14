import { NextResponse } from 'next/server'
import { CheckoutResponse } from '@/types/marketplace'
import { addPurchase, hasPurchased } from '@/lib/purchases'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { productId, userId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Fetch product to get details
    const productsResponse = await fetch(`${request.headers.get('origin') || 'http://localhost:3000'}/api/products`)
    const products = await productsResponse.json()
    const product = products.find((p: any) => p.id === productId)

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Record purchase
    const purchase = addPurchase(userId, productId)

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

    console.log('Purchase recorded:', purchase)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout failed', message: error instanceof Error ? error.message : 'Unknown error' },
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
