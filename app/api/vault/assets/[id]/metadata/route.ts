import { NextRequest, NextResponse } from 'next/server'
import { updateAsset } from '@/lib/vaultStoreV2'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { duration, sampleRate, bpm, key, genre } = body
    
    const updated = updateAsset(params.id, {
      duration,
      sampleRate,
      bpm,
      key,
      genre,
      // Mark as completed if we have client-side analysis
      cyaniteStatus: bpm || key ? 'COMPLETED' : undefined,
    })
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }
    
    console.log('[VAULT_METADATA] Updated asset:', params.id, { duration, sampleRate, bpm, key })
    
    return NextResponse.json({ success: true, asset: updated })
  } catch (error) {
    console.error('[VAULT_METADATA] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update metadata' },
      { status: 500 }
    )
  }
}
