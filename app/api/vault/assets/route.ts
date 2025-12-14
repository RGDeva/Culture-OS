import { NextRequest, NextResponse } from 'next/server'
import {
  getAssets,
  getAssetsByOwner,
  getAsset,
  updateAsset,
  deleteAsset,
} from '@/lib/vaultStoreV2'
import { VaultFilters } from '@/types/vault'

// GET /api/vault/assets - Get assets with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const ownerId = searchParams.get('ownerId')
    const assetId = searchParams.get('assetId')
    
    // Get single asset
    if (assetId) {
      const asset = getAsset(assetId)
      if (!asset) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({ asset })
    }
    
    // Get assets by owner
    if (ownerId) {
      const assets = getAssetsByOwner(ownerId)
      return NextResponse.json({ assets })
    }
    
    // Get assets with filters
    const filters: VaultFilters = {}
    
    if (searchParams.get('assetType')) {
      filters.assetType = searchParams.get('assetType') as any
    }
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as any
    }
    
    if (searchParams.get('ownerRole')) {
      filters.ownerRole = searchParams.get('ownerRole') as any
    }
    
    if (searchParams.get('genre')) {
      filters.genre = searchParams.get('genre') as string
    }
    
    if (searchParams.get('key')) {
      filters.key = searchParams.get('key') as string
    }
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search') as string
    }
    
    if (searchParams.get('projectId')) {
      filters.projectId = searchParams.get('projectId') as string
    }
    
    if (searchParams.get('bpmMin') || searchParams.get('bpmMax')) {
      filters.bpmRange = {
        min: searchParams.get('bpmMin') ? parseInt(searchParams.get('bpmMin')!) : undefined,
        max: searchParams.get('bpmMax') ? parseInt(searchParams.get('bpmMax')!) : undefined,
      }
    }
    
    const assets = getAssets(filters)
    return NextResponse.json({ assets })
  } catch (error: any) {
    console.error('[VAULT_ASSETS] GET Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get assets' },
      { status: 500 }
    )
  }
}

// PATCH /api/vault/assets - Update an asset
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId, updates } = body
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID required' },
        { status: 400 }
      )
    }
    
    const asset = updateAsset(assetId, updates)
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ asset })
  } catch (error: any) {
    console.error('[VAULT_ASSETS] PATCH Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update asset' },
      { status: 500 }
    )
  }
}

// DELETE /api/vault/assets - Delete an asset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    
    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID required' },
        { status: 400 }
      )
    }
    
    const deleted = deleteAsset(assetId)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[VAULT_ASSETS] DELETE Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete asset' },
      { status: 500 }
    )
  }
}
