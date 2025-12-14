import { prisma } from '@/lib/prisma'
import { analyzeCyanite } from './cyaniteAnalysis'

/**
 * Main analysis orchestrator
 * Calls Python worker (Mansuba) + Cyanite API
 * Updates database with results
 */
export async function analyzeAsset(assetId: string): Promise<{
  success: boolean
  analysis?: any
  error?: string
}> {
  try {
    // Fetch asset details
    const asset = await prisma.asset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      throw new Error('Asset not found')
    }

    if (!asset.fileUrl) {
      throw new Error('Asset has no file URL')
    }

    console.log(`[ANALYZE_ASSET] Analyzing asset: ${asset.title} (${asset.fileName})`)

    // Step 1: Call Python worker for Mansuba analysis
    let mansubaData: any = null
    try {
      const pythonWorkerUrl = process.env.PYTHON_WORKER_URL || 'http://localhost:8000'
      
      console.log(`[ANALYZE_ASSET] Calling Python worker at ${pythonWorkerUrl}/analyze`)
      
      const response = await fetch(`${pythonWorkerUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioUrl: asset.fileUrl,
          assetId: asset.id
        }),
        signal: AbortSignal.timeout(300000) // 5 minute timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[ANALYZE_ASSET] Python worker error: ${errorText}`)
        throw new Error(`Python worker returned ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      mansubaData = result.mansuba
      
      console.log('[ANALYZE_ASSET] Mansuba analysis complete')
    } catch (error) {
      console.error('[ANALYZE_ASSET] Mansuba analysis failed:', error)
      // Continue with Cyanite even if Mansuba fails
      mansubaData = {
        error: error instanceof Error ? error.message : 'Mansuba analysis failed'
      }
    }

    // Step 2: Call Cyanite API
    let cyaniteData: any = null
    try {
      console.log('[ANALYZE_ASSET] Starting Cyanite analysis')
      cyaniteData = await analyzeCyanite(asset.fileUrl)
      console.log('[ANALYZE_ASSET] Cyanite analysis complete')
    } catch (error) {
      console.error('[ANALYZE_ASSET] Cyanite analysis failed:', error)
      cyaniteData = {
        error: error instanceof Error ? error.message : 'Cyanite analysis failed'
      }
    }

    // Step 3: Update database with results
    const analysis = await prisma.assetAnalysis.update({
      where: { assetId },
      data: {
        // Mansuba fields
        instruments: mansubaData?.instruments ? JSON.stringify(mansubaData.instruments) : null,
        instrumentsRaw: mansubaData?.instruments_raw || null,
        instrumentPlotJson: mansubaData?.instrument_plot ? JSON.stringify(mansubaData.instrument_plot) : null,
        audioSummary: mansubaData?.audio_summary || null,
        aiInsight: mansubaData?.ai_insight || null,
        viralityPlotJson: mansubaData?.virality_plot ? JSON.stringify(mansubaData.virality_plot) : null,

        // Cyanite fields
        cyaniteMood: cyaniteData?.mood || null,
        cyaniteGenres: cyaniteData?.genres ? JSON.stringify(cyaniteData.genres) : null,
        cyaniteBpm: cyaniteData?.bpm || null,
        cyaniteKey: cyaniteData?.key || null,
        cyaniteTags: cyaniteData?.tags ? JSON.stringify(cyaniteData.tags) : null,

        // Status
        status: 'COMPLETE',
        errorMessage: null,
        updatedAt: new Date()
      }
    })

    console.log(`[ANALYZE_ASSET] Analysis complete and saved for asset: ${assetId}`)

    return {
      success: true,
      analysis
    }

  } catch (error) {
    console.error('[ANALYZE_ASSET] Error:', error)

    // Update status to FAILED
    try {
      await prisma.assetAnalysis.update({
        where: { assetId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date()
        }
      })
    } catch (updateError) {
      console.error('[ANALYZE_ASSET] Failed to update error status:', updateError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
