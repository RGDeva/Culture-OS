import { NextRequest, NextResponse } from 'next/server'
import {
  createListing,
  getListing,
  getListings,
  getListingsBySeller,
  updateListing,
  deleteListing,
} from '@/lib/vaultStoreV2'
import { MarketplaceFilters } from '@/types/vault'

// GET /api/vault/listings - Get listings with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    const sellerId = searchParams.get('sellerId')
    
    // Get single listing
    if (listingId) {
      const listing = getListing(listingId)
      if (!listing) {
        return NextResponse.json(
          { error: 'Listing not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ listing })
    }
    
    // Get listings by seller
    if (sellerId) {
      const listings = getListingsBySeller(sellerId)
      return NextResponse.json({ listings })
    }
    
    // Get listings with filters
    const filters: MarketplaceFilters = {}
    
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category') as any
    }
    
    if (searchParams.get('rolesServed')) {
      filters.rolesServed = searchParams.get('rolesServed')!.split(',') as any
    }
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search') as string
    }
    
    if (searchParams.get('priceMin') || searchParams.get('priceMax')) {
      filters.priceRange = {
        min: searchParams.get('priceMin') ? parseFloat(searchParams.get('priceMin')!) : undefined,
        max: searchParams.get('priceMax') ? parseFloat(searchParams.get('priceMax')!) : undefined,
      }
    }
    
    const listings = getListings(filters)
    return NextResponse.json({ listings })
  } catch (error: any) {
    console.error('[VAULT_LISTINGS] GET Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get listings' },
      { status: 500 }
    )
  }
}

// POST /api/vault/listings - Create a new listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      assetId,
      projectId,
      sellerId,
      sellerName,
      title,
      description,
      category,
      rolesServed,
      price,
      currency,
      licenseTemplateId,
      tags,
      previewUrl,
    } = body
    
    if (!sellerId || !title || !category || !price || !currency || !licenseTemplateId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const listing = createListing({
      assetId,
      projectId,
      sellerId,
      sellerName,
      title,
      description,
      category,
      rolesServed: rolesServed || [],
      price,
      currency,
      licenseTemplateId,
      status: 'ACTIVE',
      tags,
      previewUrl,
    })
    
    return NextResponse.json({ listing }, { status: 201 })
  } catch (error: any) {
    console.error('[VAULT_LISTINGS] POST Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create listing' },
      { status: 500 }
    )
  }
}

// PATCH /api/vault/listings - Update a listing
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { listingId, updates } = body
    
    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      )
    }
    
    const listing = updateListing(listingId, updates)
    
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ listing })
  } catch (error: any) {
    console.error('[VAULT_LISTINGS] PATCH Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE /api/vault/listings - Delete a listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')
    
    if (!listingId) {
      return NextResponse.json(
        { error: 'Listing ID required' },
        { status: 400 }
      )
    }
    
    const deleted = deleteListing(listingId)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[VAULT_LISTINGS] DELETE Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
