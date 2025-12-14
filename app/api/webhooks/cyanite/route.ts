import { NextRequest, NextResponse } from 'next/server'
import { verifyCyaniteWebhook, CyaniteWebhookPayload } from '@/lib/cyanite'
import { getAsset, updateAsset } from '@/lib/vaultStoreV2'

export async function POST(request: NextRequest) {
  try {
    // Get signature from headers
    const signature = request.headers.get('x-cyanite-signature') || ''
    const body = await request.text()
    
    // Verify webhook signature
    if (!verifyCyaniteWebhook(signature, body)) {
      console.error('[CYANITE_WEBHOOK] Invalid signature')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse payload
    const payload: CyaniteWebhookPayload = JSON.parse(body)
    console.log('[CYANITE_WEBHOOK] Received event:', payload.event, payload.analysisId)

    // Extract track ID from metadata
    const trackId = payload.trackId
    if (!trackId) {
      console.error('[CYANITE_WEBHOOK] No trackId in payload')
      return NextResponse.json(
        { error: 'Missing trackId' },
        { status: 400 }
      )
    }

    // Get existing asset
    const asset = getAsset(trackId)
    if (!asset) {
      console.error('[CYANITE_WEBHOOK] Asset not found:', trackId)
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Update asset based on status
    if (payload.status === 'COMPLETED' && payload.result) {
      const result = payload.result
      
      updateAsset(trackId, {
        cyaniteStatus: 'COMPLETED',
        cyaniteAnalysisId: payload.analysisId,
        bpm: result.bpm,
        musicalKey: result.musicalKey,
        energy: result.energy,
        moods: result.moods,
        genres: result.genres,
        valence: result.valence,
        danceability: result.danceability,
      })

      console.log('[CYANITE_WEBHOOK] Analysis completed for track:', trackId)
    } else if (payload.status === 'FAILED') {
      updateAsset(trackId, {
        cyaniteStatus: 'FAILED',
        cyaniteAnalysisId: payload.analysisId,
      })

      console.error('[CYANITE_WEBHOOK] Analysis failed for track:', trackId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[CYANITE_WEBHOOK] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
