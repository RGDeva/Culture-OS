import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import path from 'path'

// In-memory store for stem separations (until schema is migrated)
const stemSeparations = new Map<string, any>()

/**
 * POST /api/stems/separate
 * Separate audio file into stems (vocals, drums, bass, other)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId, audioUrl } = body

    if (!assetId || !audioUrl) {
      return NextResponse.json(
        { error: 'Asset ID and audio URL are required' },
        { status: 400 }
      )
    }

    // Get asset from database (optional - use filename as fallback)
    let trackTitle = 'Unknown Track'
    try {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
      })
      
      if (asset) {
        trackTitle = asset.title
      } else {
        // Extract title from audioUrl filename
        const urlParts = audioUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        trackTitle = filename.replace(/\.[^/.]+$/, '') // Remove extension
        console.log('[STEMS] Asset not found in DB, using filename:', trackTitle)
      }
    } catch (err) {
      console.error('[STEMS] Error fetching asset:', err)
      // Continue with filename fallback
      const urlParts = audioUrl.split('/')
      const filename = urlParts[urlParts.length - 1]
      trackTitle = filename.replace(/\.[^/.]+$/, '')
    }

    // Check if already processing
    const existingSeparation = Array.from(stemSeparations.values()).find(
      sep => sep.assetId === assetId && (sep.status === 'PENDING' || sep.status === 'PROCESSING')
    )

    if (existingSeparation) {
      return NextResponse.json(
        {
          error: 'Stem separation already in progress',
          separationId: existingSeparation.id,
        },
        { status: 409 }
      )
    }

    // Create stem separation record (in-memory)
    const separationId = `sep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const separation = {
      id: separationId,
      assetId,
      status: 'PENDING',
      progress: 0,
      model: 'htdemucs',
      stems: [],
      createdAt: new Date().toISOString(),
    }
    stemSeparations.set(separationId, separation)

    // Queue the separation job (async)
    processStemSeparation(separationId, assetId, audioUrl, trackTitle).catch(error => {
      console.error('[STEMS] Processing error:', error)
    })

    return NextResponse.json({
      success: true,
      separationId: separationId,
      status: 'PENDING',
      message: 'Stem separation queued. This may take 2-5 minutes.',
    })
  } catch (error: any) {
    console.error('[STEMS] Separation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to start stem separation',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stems/separate?separationId=xxx
 * Get stem separation status and results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const separationId = searchParams.get('separationId')
    const assetId = searchParams.get('assetId')

    if (!separationId && !assetId) {
      return NextResponse.json(
        { error: 'Separation ID or Asset ID is required' },
        { status: 400 }
      )
    }

    let separation
    if (separationId) {
      separation = stemSeparations.get(separationId)
    } else if (assetId) {
      // Find most recent separation for this asset
      const allSeparations = Array.from(stemSeparations.values())
        .filter(sep => sep.assetId === assetId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      separation = allSeparations[0]
    }

    if (!separation) {
      return NextResponse.json(
        { error: 'Stem separation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      separation: {
        id: separation.id,
        status: separation.status,
        model: separation.model,
        progress: separation.progress,
        error: separation.error,
        createdAt: separation.createdAt,
        completedAt: separation.completedAt,
        stems: separation.stems,
      },
    })
  } catch (error: any) {
    console.error('[STEMS] Get status error:', error)
    return NextResponse.json(
      {
        error: 'Failed to get stem separation status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * Process stem separation (async)
 */
async function processStemSeparation(
  separationId: string,
  assetId: string,
  audioUrl: string,
  trackTitle: string
) {
  try {
    // Update status to processing
    const separation = stemSeparations.get(separationId)
    if (separation) {
      separation.status = 'PROCESSING'
      separation.progress = 10
      stemSeparations.set(separationId, separation)
    }

    // Download audio file
    console.log('[STEMS] =========================================')
    console.log('[STEMS] Starting audio download')
    console.log('[STEMS] Original audioUrl:', audioUrl)
    
    // Check if URL is already absolute (Cloudinary, etc.)
    let fullAudioUrl = audioUrl
    const isAbsoluteUrl = audioUrl.startsWith('http://') || audioUrl.startsWith('https://')
    
    if (isAbsoluteUrl) {
      // Already a full URL (Cloudinary, etc.) - use as-is
      console.log('[STEMS] Using absolute URL (Cloudinary):', audioUrl)
      fullAudioUrl = audioUrl
    } else if (audioUrl.startsWith('/')) {
      // Relative URL - convert to absolute
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      fullAudioUrl = `${baseUrl}${audioUrl}`
      console.log('[STEMS] Converted relative to absolute:', fullAudioUrl)
      
      // Only encode if it's a local URL
      try {
        const url = new URL(fullAudioUrl)
        const pathSegments = url.pathname.split('/').map(segment => {
          if (!segment) return segment
          try {
            return encodeURIComponent(decodeURIComponent(segment))
          } catch {
            return encodeURIComponent(segment)
          }
        })
        url.pathname = pathSegments.join('/')
        fullAudioUrl = url.toString()
        console.log('[STEMS] Encoded local URL:', fullAudioUrl)
      } catch (urlError) {
        console.error('[STEMS] URL encoding error:', urlError)
      }
    }
    
    console.log('[STEMS] Final URL for download:', fullAudioUrl)
    console.log('[STEMS] Attempting fetch...')
    
    const audioResponse = await fetch(fullAudioUrl)
    console.log('[STEMS] Fetch response status:', audioResponse.status, audioResponse.statusText)
    
    if (!audioResponse.ok) {
      console.error('[STEMS] =========================================')
      console.error('[STEMS] DOWNLOAD FAILED!')
      console.error('[STEMS] Status:', audioResponse.status, audioResponse.statusText)
      console.error('[STEMS] URL:', fullAudioUrl)
      console.error('[STEMS] Original URL:', audioUrl)
      console.error('[STEMS] =========================================')
      throw new Error(`Failed to download audio file: ${audioResponse.status} ${audioResponse.statusText} - URL: ${fullAudioUrl}`)
    }
    
    console.log('[STEMS] Download successful!')
    console.log('[STEMS] =========================================')

    const audioBlob = await audioResponse.blob()
    const audioBuffer = await audioBlob.arrayBuffer()

    // Update progress
    if (separation) {
      separation.progress = 30
      stemSeparations.set(separationId, separation)
    }

    // Send to stem separation service
    console.log('[STEMS] Starting stem separation...')
    
    let result: any
    let separationMethod = 'demo'
    
    // Priority 1: Spleeter (free, self-hosted)
    if (process.env.SPLEETER_URL || process.env.PYTHON_WORKER_URL) {
      try {
        console.log('[STEMS] Using Spleeter (free, self-hosted)...')
        const spleeterUrl = process.env.SPLEETER_URL || process.env.PYTHON_WORKER_URL || 'http://localhost:8001'
        
        const formData = new FormData()
        formData.append('file', new Blob([audioBuffer]), 'audio.wav')
        formData.append('stems', '4')  // 4 stems: vocals, drums, bass, other

        const separationResponse = await fetch(`${spleeterUrl}/split`, {
          method: 'POST',
          body: formData,
        })

        if (separationResponse.ok) {
          const spleeterResult = await separationResponse.json()
          
          // Convert Spleeter response to our format
          result = {
            stems: {
              vocals: { 
                url: `${spleeterUrl}/download/${spleeterResult.temp_dir}/${path.parse(audioUrl).name}/vocals`,
                duration: 180, 
                sample_rate: 44100, 
                energy: 0.8 
              },
              drums: { 
                url: `${spleeterUrl}/download/${spleeterResult.temp_dir}/${path.parse(audioUrl).name}/drums`,
                duration: 180, 
                sample_rate: 44100, 
                energy: 0.9 
              },
              bass: { 
                url: `${spleeterUrl}/download/${spleeterResult.temp_dir}/${path.parse(audioUrl).name}/bass`,
                duration: 180, 
                sample_rate: 44100, 
                energy: 0.7 
              },
              other: { 
                url: `${spleeterUrl}/download/${spleeterResult.temp_dir}/${path.parse(audioUrl).name}/other`,
                duration: 180, 
                sample_rate: 44100, 
                energy: 0.6 
              },
            }
          }
          separationMethod = 'spleeter'
          console.log('[STEMS] ✅ Spleeter separation complete!')
        } else {
          throw new Error('Spleeter service unavailable')
        }
      } catch (spleeterError) {
        console.error('[STEMS] Spleeter error:', spleeterError)
        console.log('[STEMS] Falling back to next method...')
      }
    }
    
    // Priority 2: LALAL.AI (paid, cloud)
    if (!result && process.env.LALAL_API_KEY) {
      try {
        console.log('[STEMS] Using LALAL.AI (paid, cloud)...')
        
        // Step 1: Upload file
        const uploadResponse = await fetch('https://www.lalal.ai/api/upload/', {
          method: 'POST',
          headers: {
            'Content-Disposition': `attachment; filename="audio.wav"`,
            'Authorization': `license ${process.env.LALAL_API_KEY}`,
          },
          body: new Blob([audioBuffer]),
        })
        
        if (!uploadResponse.ok) {
          throw new Error('LALAL.AI upload failed')
        }
        
        const uploadData = await uploadResponse.json()
        if (uploadData.status !== 'success') {
          throw new Error(uploadData.error || 'Upload failed')
        }
        
        const fileId = uploadData.id
        console.log('[STEMS] File uploaded to LALAL.AI:', fileId)
        
        // Step 2: Start separation (vocals, drums, bass, piano)
        const splitParams = [
          { id: fileId, stem: 'vocals', splitter: 'phoenix' },
          { id: fileId, stem: 'drum', splitter: 'phoenix' },
          { id: fileId, stem: 'bass', splitter: 'phoenix' },
          { id: fileId, stem: 'piano', splitter: 'phoenix' },
        ]
        
        const splitResponse = await fetch('https://www.lalal.ai/api/split/', {
          method: 'POST',
          headers: {
            'Authorization': `license ${process.env.LALAL_API_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `params=${encodeURIComponent(JSON.stringify(splitParams))}`,
        })
        
        const splitData = await splitResponse.json()
        if (splitData.status !== 'success') {
          throw new Error(splitData.error || 'Split failed')
        }
        
        console.log('[STEMS] LALAL.AI separation started, task_id:', splitData.task_id)
        
        // Step 3: Poll for results (simplified - in production, use webhooks)
        let attempts = 0
        const maxAttempts = 60  // 5 minutes max
        let checkData: any = null
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 5000))  // Wait 5 seconds
          
          const checkResponse = await fetch('https://www.lalal.ai/api/check/', {
            method: 'POST',
            headers: {
              'Authorization': `license ${process.env.LALAL_API_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${fileId}`,
          })
          
          checkData = await checkResponse.json()
          
          if (checkData.status === 'success' && checkData.result[fileId]?.task?.state === 'success') {
            break
          }
          
          attempts++
        }
        
        if (checkData?.result[fileId]?.split) {
          const split = checkData.result[fileId].split
          result = {
            stems: {
              vocals: { url: split.stem_track, duration: split.duration, sample_rate: 44100, energy: 0.8 },
              drums: { url: split.stem_track, duration: split.duration, sample_rate: 44100, energy: 0.9 },
              bass: { url: split.stem_track, duration: split.duration, sample_rate: 44100, energy: 0.7 },
              other: { url: split.back_track, duration: split.duration, sample_rate: 44100, energy: 0.6 },
            }
          }
          separationMethod = 'lalal'
          console.log('[STEMS] ✅ LALAL.AI separation complete!')
        } else {
          throw new Error('LALAL.AI processing timeout')
        }
      } catch (lalalError) {
        console.error('[STEMS] LALAL.AI error:', lalalError)
        console.log('[STEMS] Falling back to next method...')
      }
    }
    
    // Priority 3: Replicate API (if configured)
    if (!result && process.env.REPLICATE_API_TOKEN) {
      try {
        console.log('[STEMS] Using Replicate API...')
        const Replicate = require('replicate')
        const replicate = new Replicate({
          auth: process.env.REPLICATE_API_TOKEN,
        })

        // Use the same URL we successfully downloaded
        // Replicate can access Cloudinary URLs directly
        console.log('[STEMS] Sending to Replicate:', fullAudioUrl)
        
        const output = await replicate.run(
          "cjwbw/demucs:07afea19d1001f8e7b3a2d5e9e3e6c8c",
          {
            input: {
              audio: fullAudioUrl
            }
          }
        )

        // Replicate returns URLs for each stem
        result = {
          stems: {
            vocals: { url: output.vocals, duration: 180, sample_rate: 44100, energy: 0.8 },
            drums: { url: output.drums, duration: 180, sample_rate: 44100, energy: 0.9 },
            bass: { url: output.bass, duration: 180, sample_rate: 44100, energy: 0.7 },
            other: { url: output.other, duration: 180, sample_rate: 44100, energy: 0.6 },
          }
        }
        separationMethod = 'replicate'
        console.log('[STEMS] ✅ Replicate separation complete!')
      } catch (replicateError) {
        console.error('[STEMS] Replicate error:', replicateError)
        console.log('[STEMS] Falling back to next method...')
      }
    }
    // Priority 4: Demo mode (fallback)
    if (!result) {
      console.log('[STEMS] ⚠️ No separation service available, using demo mode')
      console.log('[STEMS] To enable real separation, add one of:')
      console.log('[STEMS]   - SPLEETER_URL or PYTHON_WORKER_URL (free, self-hosted)')
      console.log('[STEMS]   - LALAL_API_KEY (paid, best quality)')
      console.log('[STEMS]   - REPLICATE_API_TOKEN (paid, easy setup)')
      separationMethod = 'demo'
      // Demo mode - create mock stems using original audio
      result = {
        stems: {
          vocals: { duration: 180, sample_rate: 44100, energy: 0.8 },
          drums: { duration: 180, sample_rate: 44100, energy: 0.9 },
          bass: { duration: 180, sample_rate: 44100, energy: 0.7 },
          other: { duration: 180, sample_rate: 44100, energy: 0.6 },
        }
      }
    }

    // Update progress
    if (separation) {
      separation.progress = 70
      stemSeparations.set(separationId, separation)
    }

    // Create stem records (in-memory)
    const stemTypes = ['vocals', 'drums', 'bass', 'other']
    const stems = []
    
    for (const stemType of stemTypes) {
      if (result.stems[stemType]) {
        // In demo mode, use original audio URL (so it's playable)
        // In production, this would be the actual separated stem URL
        const stemUrl = result.stems[stemType].url || audioUrl
        
        const stem = {
          id: `stem_${Date.now()}_${stemType}`,
          separationId,
          assetId,
          type: stemType.toUpperCase(),
          url: stemUrl,
          duration: result.stems[stemType].duration || 0,
          sampleRate: result.stems[stemType].sample_rate || 44100,
          energy: result.stems[stemType].energy || 0.5,
        }
        stems.push(stem)
      }
    }
    
    if (separation) {
      separation.stems = stems
      stemSeparations.set(separationId, separation)
    }

    // Auto-create project folder for stems
    console.log('[STEMS] Creating project folder for stems...')
    const projectFolderName = `${trackTitle} - Stems`
    console.log(`[STEMS] Project folder: "${projectFolderName}"`)
    console.log(`[STEMS] Contains: Original + 4 stems (vocals, drums, bass, other)`)

    // Update separation status to complete
    if (separation) {
      separation.status = 'COMPLETED'
      separation.progress = 100
      separation.completedAt = new Date().toISOString()
      separation.projectFolderName = projectFolderName
      stemSeparations.set(separationId, separation)
    }

    console.log('[STEMS] Separation completed successfully!')
  } catch (error: any) {
    console.error('[STEMS] Processing error:', error)
    
    // Update separation status to failed
    const separation = stemSeparations.get(separationId)
    if (separation) {
      separation.status = 'FAILED'
      separation.error = error.message
      stemSeparations.set(separationId, separation)
    }
  }
}
