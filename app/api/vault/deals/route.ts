import { NextRequest, NextResponse } from 'next/server'
import {
  createDeal,
  getDeal,
  getDeals,
  getDealsBySeller,
  getDealsByBuyer,
  updateDeal,
  cleanupExpiredDeals,
  releaseFunds,
  refundDeal,
} from '@/lib/vaultStoreV2'

// GET /api/vault/deals - Get deals with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('dealId')
    const sellerId = searchParams.get('sellerId')
    const buyerId = searchParams.get('buyerId')
    const cleanup = searchParams.get('cleanup')
    
    // Cleanup expired deals if requested
    if (cleanup === 'true') {
      const count = cleanupExpiredDeals()
      return NextResponse.json({ cleanedUp: count })
    }
    
    // Get single deal
    if (dealId) {
      const deal = getDeal(dealId)
      if (!deal) {
        return NextResponse.json(
          { error: 'Deal not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ deal })
    }
    
    // Get deals by seller
    if (sellerId) {
      const deals = getDealsBySeller(sellerId)
      return NextResponse.json({ deals })
    }
    
    // Get deals by buyer
    if (buyerId) {
      const deals = getDealsByBuyer(buyerId)
      return NextResponse.json({ deals })
    }
    
    // Get all deals
    const deals = getDeals()
    return NextResponse.json({ deals })
  } catch (error: any) {
    console.error('[VAULT_DEALS] GET Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get deals' },
      { status: 500 }
    )
  }
}

// POST /api/vault/deals - Create a new deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      listingId,
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      amount,
      currency,
      status,
      transactionHash,
    } = body
    
    if (!listingId || !buyerId || !sellerId || !amount || !currency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const deal = createDeal({
      listingId,
      buyerId,
      buyerName,
      sellerId,
      sellerName,
      amount,
      currency,
      status: status || 'PENDING_PAYMENT',
      transactionHash,
    })
    
    return NextResponse.json({ deal }, { status: 201 })
  } catch (error: any) {
    console.error('[VAULT_DEALS] POST Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create deal' },
      { status: 500 }
    )
  }
}

// PATCH /api/vault/deals - Update a deal
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, updates, action } = body
    
    if (!dealId) {
      return NextResponse.json(
        { error: 'Deal ID required' },
        { status: 400 }
      )
    }
    
    // Handle special actions
    if (action === 'release') {
      const success = releaseFunds(dealId)
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to release funds' },
          { status: 400 }
        )
      }
      const deal = getDeal(dealId)
      return NextResponse.json({ deal, action: 'released' })
    }
    
    if (action === 'refund') {
      const success = refundDeal(dealId)
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to refund deal' },
          { status: 400 }
        )
      }
      const deal = getDeal(dealId)
      return NextResponse.json({ deal, action: 'refunded' })
    }
    
    // Regular update
    const deal = updateDeal(dealId, updates)
    
    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ deal })
  } catch (error: any) {
    console.error('[VAULT_DEALS] PATCH Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update deal' },
      { status: 500 }
    )
  }
}
