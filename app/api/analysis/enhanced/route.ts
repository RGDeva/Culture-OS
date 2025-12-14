import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  performEnhancedAnalysis,
  downloadAudioToBuffer,
  saveBufferToTempFile,
} from '@/lib/audio/audioProcessor'

/**
 * POST /api/analysis/enhanced
 * Perform comprehensive audio analysis with multiple ML models
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId } = body

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    console.log('[ENHANCED_ANALYSIS] Starting analysis for asset:', assetId)

    // Fetch asset from database
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { analysis: true },
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Check if asset has a valid URL
    if (!asset.fileUrl || !asset.fileUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Asset must have a valid HTTP URL for analysis' },
        { status: 400 }
      )
    }

    // Update analysis status to PROCESSING
    await prisma.assetAnalysis.upsert({
      where: { assetId },
      create: {
        assetId,
        status: 'PROCESSING',
      },
      update: {
        status: 'PROCESSING',
        errorMessage: null,
      },
    })

    // Download audio file
    console.log('[ENHANCED_ANALYSIS] Downloading audio file...')
    const audioBuffer = await downloadAudioToBuffer(asset.fileUrl)

    // Save to temporary file for metadata extraction
    const tempFilePath = await saveBufferToTempFile(
      audioBuffer,
      `${assetId}.${asset.fileName.split('.').pop()}`
    )

    // Perform enhanced analysis
    console.log('[ENHANCED_ANALYSIS] Running analysis pipeline...')
    const analysisResult = await performEnhancedAnalysis(tempFilePath, audioBuffer)

    // Clean up temp file
    const fs = await import('fs/promises')
    await fs.unlink(tempFilePath).catch(() => {})

    // Update asset with analysis results
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        bpm: analysisResult.audioFeatures.tempo || asset.bpm,
        key: analysisResult.audioFeatures.key || asset.key,
        genre: analysisResult.genre.primary || asset.genre,
        moodTags: analysisResult.metadata.tags || asset.moodTags,
        analysisMetadata: {
          audioFeatures: analysisResult.audioFeatures,
          genre: analysisResult.genre,
          instruments: analysisResult.instruments,
          quality: analysisResult.quality,
          virality: analysisResult.virality,
        },
        qualityScore: analysisResult.quality.score,
        viralityScore: analysisResult.virality.score,
      },
    })

    // Update AssetAnalysis record
    await prisma.assetAnalysis.update({
      where: { assetId },
      data: {
        status: 'COMPLETE',
        
        // Store enhanced analysis
        audioFeatures: JSON.stringify(analysisResult.audioFeatures),
        genreClassification: JSON.stringify(analysisResult.genre),
        leadInstrument: analysisResult.instruments.leadInstrument,
        aestheticsScore: analysisResult.quality.score,
        
        // Keep existing Mansuba/Cyanite data if present
        updatedAt: new Date(),
      },
    })

    console.log('[ENHANCED_ANALYSIS] Analysis complete')

    return NextResponse.json({
      success: true,
      message: 'Enhanced analysis completed successfully',
      analysis: analysisResult,
    })
  } catch (error: any) {
    console.error('[ENHANCED_ANALYSIS] Error:', error)

    // Update analysis status to FAILED
    const body = await request.json().catch(() => ({}))
    if (body.assetId) {
      await prisma.assetAnalysis.update({
        where: { assetId: body.assetId },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Unknown error',
          retryCount: { increment: 1 },
          lastRetryAt: new Date(),
        },
      }).catch(() => {})
    }

    return NextResponse.json(
      {
        error: 'Enhanced analysis failed',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/analysis/enhanced?assetId=xxx
 * Get enhanced analysis results for an asset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      )
    }

    // Fetch asset with analysis
    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: { analysis: true },
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Parse analysis metadata
    let enhancedAnalysis = null
    if (asset.analysisMetadata) {
      enhancedAnalysis = asset.analysisMetadata
    }

    return NextResponse.json({
      asset: {
        id: asset.id,
        title: asset.title,
        bpm: asset.bpm,
        key: asset.key,
        genre: asset.genre,
        qualityScore: asset.qualityScore,
        viralityScore: asset.viralityScore,
      },
      analysis: asset.analysis,
      enhancedAnalysis,
    })
  } catch (error: any) {
    console.error('[ENHANCED_ANALYSIS] GET Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch analysis',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
