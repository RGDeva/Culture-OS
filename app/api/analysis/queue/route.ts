import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/analysis/queue
 * Queue an asset for AI analysis (Mansuba + Cyanite)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId } = body

    if (!assetId) {
      return NextResponse.json(
        { error: 'Missing required field: assetId' },
        { status: 400 }
      )
    }

    // Check if asset exists
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Check if analysis already exists
    let analysis = await prisma.assetAnalysis.findUnique({
      where: { assetId }
    })

    if (analysis) {
      // If already complete, return existing
      if (analysis.status === 'COMPLETE') {
        return NextResponse.json({
          message: 'Analysis already complete',
          analysis
        })
      }

      // If failed or pending, reset to pending
      analysis = await prisma.assetAnalysis.update({
        where: { assetId },
        data: {
          status: 'PENDING',
          errorMessage: null,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new analysis record
      analysis = await prisma.assetAnalysis.create({
        data: {
          assetId,
          status: 'PENDING'
        }
      })
    }

    // Trigger background analysis job
    // In production, this would use a queue like BullMQ, Inngest, or Trigger.dev
    // For now, we'll trigger it via a separate API call
    try {
      const origin = request.headers.get('origin') || 'http://localhost:3000'
      
      // Fire-and-forget background job
      fetch(`${origin}/api/analysis/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      }).catch(err => {
        console.error('[ANALYSIS_QUEUE] Failed to trigger background job:', err)
      })
    } catch (error) {
      console.error('[ANALYSIS_QUEUE] Error triggering background job:', error)
    }

    return NextResponse.json({
      message: 'Analysis queued successfully',
      analysis
    })

  } catch (error) {
    console.error('[ANALYSIS_QUEUE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to queue analysis' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analysis/queue?assetId=xxx
 * Get analysis status for an asset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json(
        { error: 'Missing required parameter: assetId' },
        { status: 400 }
      )
    }

    const analysis = await prisma.assetAnalysis.findUnique({
      where: { assetId },
      include: {
        asset: {
          select: {
            id: true,
            title: true,
            fileName: true,
            fileUrl: true
          }
        }
      }
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ analysis })

  } catch (error) {
    console.error('[ANALYSIS_QUEUE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}
