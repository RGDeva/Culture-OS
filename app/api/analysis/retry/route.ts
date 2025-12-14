import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/analysis/retry
 * Retry failed analysis for an asset
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json(
        { error: 'Missing required parameter: assetId' },
        { status: 400 }
      )
    }

    // Check if analysis exists
    const analysis = await prisma.assetAnalysis.findUnique({
      where: { assetId }
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Check retry limit (max 3 retries)
    if (analysis.retryCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum retry limit reached (3 attempts)' },
        { status: 429 }
      )
    }

    // Update analysis to PENDING and increment retry count
    const updatedAnalysis = await prisma.assetAnalysis.update({
      where: { assetId },
      data: {
        status: 'PENDING',
        errorMessage: null,
        retryCount: analysis.retryCount + 1,
        lastRetryAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Trigger background analysis job
    try {
      const origin = request.headers.get('origin') || 'http://localhost:3000'
      
      // Fire-and-forget background job
      fetch(`${origin}/api/analysis/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      }).catch(err => {
        console.error('[ANALYSIS_RETRY] Failed to trigger background job:', err)
      })
    } catch (error) {
      console.error('[ANALYSIS_RETRY] Error triggering background job:', error)
    }

    return NextResponse.json({
      message: 'Analysis retry queued successfully',
      analysis: updatedAnalysis,
      retryCount: updatedAnalysis.retryCount
    })

  } catch (error) {
    console.error('[ANALYSIS_RETRY] Error:', error)
    return NextResponse.json(
      { error: 'Failed to retry analysis' },
      { status: 500 }
    )
  }
}
