import { NextRequest, NextResponse } from 'next/server'
import { distributeToStreamingPlatforms } from '@/lib/distribution/dspService'

/**
 * POST /api/distribution/submit
 * Submit track for DSP distribution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      assetId,
      audioFileUrl,
      metadata,
      splits,
      platforms,
    } = body

    // Validation
    if (!assetId || !audioFileUrl || !metadata || !splits || !platforms) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate metadata
    const requiredMetadata = ['title', 'artist', 'genre', 'releaseDate', 'copyrightHolder', 'copyrightYear', 'coverArtUrl']
    for (const field of requiredMetadata) {
      if (!metadata[field]) {
        return NextResponse.json(
          { error: `Missing metadata field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Validate platforms
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform is required' },
        { status: 400 }
      )
    }

    // Submit for distribution
    const result = await distributeToStreamingPlatforms({
      assetId,
      audioFileUrl,
      metadata,
      splits,
      platforms,
    })

    return NextResponse.json({
      success: true,
      distribution: result,
    })
  } catch (error: any) {
    console.error('[DISTRIBUTION] Submit error:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit for distribution',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
