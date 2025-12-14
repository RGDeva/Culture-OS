import { NextRequest, NextResponse } from 'next/server'
import { createDreamsterCampaign, getDreamsterCampaignStatus } from '@/lib/integrations/platformIntegrations'

/**
 * POST /api/integrations/dreamster
 * Create a Dreamster dynamic drop campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      assetId,
      title,
      description,
      trackUrl,
      coverArtUrl,
      splits,
      startingPrice,
      reservePrice,
      duration,
      viralityScore,
      qualityScore,
    } = body

    if (!assetId || !title || !trackUrl || !coverArtUrl || !splits || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await createDreamsterCampaign({
      assetId,
      title,
      description,
      trackUrl,
      coverArtUrl,
      splits,
      startingPrice,
      reservePrice,
      duration,
      viralityScore,
      qualityScore,
    })

    return NextResponse.json({
      success: true,
      campaign: result,
    })
  } catch (error: any) {
    console.error('[DREAMSTER] Create campaign error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create Dreamster campaign',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/integrations/dreamster?campaignId=xxx
 * Get Dreamster campaign status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      )
    }

    const result = await getDreamsterCampaignStatus(campaignId)

    return NextResponse.json({
      success: true,
      campaign: result,
    })
  } catch (error: any) {
    console.error('[DREAMSTER] Get status error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get campaign status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
