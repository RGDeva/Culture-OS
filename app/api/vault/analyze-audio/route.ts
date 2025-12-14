import { NextRequest, NextResponse } from 'next/server'
import { updateProject, getProject } from '@/lib/sessionVaultStore'
import { createCyaniteTrackAnalysis, getCyaniteAnalysisResult, isCyaniteConfigured } from '@/lib/cyanite'

/**
 * POST /api/vault/analyze-audio
 * Trigger or check audio analysis for a project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, assetId, audioUrl, action } = body
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }
    
    const project = getProject(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Start new analysis
    if (action === 'start' && audioUrl && assetId) {
      if (!isCyaniteConfigured()) {
        return NextResponse.json({
          success: false,
          message: 'Cyanite not configured',
          useFallback: true,
        })
      }
      
      try {
        const analysisId = await createCyaniteTrackAnalysis(
          audioUrl,
          assetId,
          project.title
        )
        
        if (analysisId) {
          // Store analysis ID in project metadata
          const updated = updateProject(projectId, {
            notes: `${project.notes || ''}\nAnalysis ID: ${analysisId}`.trim(),
          })
          
          return NextResponse.json({
            success: true,
            analysisId,
            message: 'Analysis started. Check back in 30-60 seconds.',
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Failed to start analysis',
            useFallback: true,
          })
        }
      } catch (error: any) {
        console.error('[ANALYZE_AUDIO] Start error:', error)
        return NextResponse.json({
          success: false,
          message: error.message,
          useFallback: true,
        })
      }
    }
    
    // Check existing analysis
    if (action === 'check' && body.analysisId) {
      try {
        const result = await getCyaniteAnalysisResult(body.analysisId)
        
        if (result) {
          // Update project with results
          const updated = updateProject(projectId, {
            bpm: result.bpm,
            key: result.musicalKey,
            genre: result.genres?.[0],
            mood: result.moods?.[0],
          })
          
          return NextResponse.json({
            success: true,
            result,
            project: updated,
          })
        } else {
          return NextResponse.json({
            success: false,
            message: 'Analysis not ready yet',
          })
        }
      } catch (error: any) {
        console.error('[ANALYZE_AUDIO] Check error:', error)
        return NextResponse.json({
          success: false,
          message: error.message,
        })
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('[ANALYZE_AUDIO] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/vault/analyze-audio?projectId=xxx
 * Get analysis status for a project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }
    
    const project = getProject(projectId)
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Check if project has analysis data
    const hasAnalysis = !!(project.bpm || project.key || project.genre)
    
    // Extract analysis ID from notes if present
    const analysisIdMatch = project.notes?.match(/Analysis ID: ([\w-]+)/)
    const analysisId = analysisIdMatch?.[1]
    
    return NextResponse.json({
      projectId,
      hasAnalysis,
      analysisId,
      metadata: {
        bpm: project.bpm,
        key: project.key,
        genre: project.genre,
        mood: project.mood,
      },
      cyaniteConfigured: isCyaniteConfigured(),
    })
  } catch (error: any) {
    console.error('[ANALYZE_AUDIO] GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get analysis status' },
      { status: 500 }
    )
  }
}
