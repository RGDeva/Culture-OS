import { NextRequest, NextResponse } from 'next/server'
import { getAsset } from '@/lib/sessionVaultStore'

/**
 * GET /api/vault/download/[assetId]
 * Download an asset file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params
    
    // Get asset from store
    const asset = getAsset(assetId)
    
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    // If it's a Cloudinary URL, redirect to it
    if (asset.url.startsWith('http')) {
      return NextResponse.redirect(asset.url)
    }
    
    // For local/mock URLs, return the URL in JSON
    return NextResponse.json({
      url: asset.url,
      filename: asset.filename,
      size: asset.sizeBytes,
      type: asset.extension,
    })
  } catch (error: any) {
    console.error('[DOWNLOAD] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: 500 }
    )
  }
}
