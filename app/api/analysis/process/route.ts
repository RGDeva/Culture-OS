import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeAsset } from '@/lib/analysis/analyzeAsset'

/**
 * POST /api/analysis/process
 * Background job to process asset analysis
 * This runs the actual Mansuba + Cyanite analysis
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

    console.log(`[ANALYSIS_PROCESS] Starting analysis for asset: ${assetId}`)

    // Update status to PROCESSING
    await prisma.assetAnalysis.update({
      where: { assetId },
      data: {
        status: 'PROCESSING',
        updatedAt: new Date()
      }
    })

    // Run the analysis (this calls Python worker + Cyanite)
    const result = await analyzeAsset(assetId)

    if (result.success) {
      console.log(`[ANALYSIS_PROCESS] Analysis complete for asset: ${assetId}`)
      return NextResponse.json({
        message: 'Analysis completed successfully',
        analysis: result.analysis
      })
    } else {
      console.error(`[ANALYSIS_PROCESS] Analysis failed for asset: ${assetId}`, result.error)
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('[ANALYSIS_PROCESS] Error:', error)
    
    // Try to update status to FAILED
    try {
      const { assetId } = await request.json()
      if (assetId) {
        await prisma.assetAnalysis.update({
          where: { assetId },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            updatedAt: new Date()
          }
        })
      }
    } catch (updateError) {
      console.error('[ANALYSIS_PROCESS] Failed to update error status:', updateError)
    }

    return NextResponse.json(
      { error: 'Failed to process analysis' },
      { status: 500 }
    )
  }
}
