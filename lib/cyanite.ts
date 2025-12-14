/**
 * Cyanite Audio Analysis Integration
 */

export interface CyaniteAnalysisRequest {
  audioUrl: string
  trackId: string
  title?: string
}

export interface CyaniteAnalysisResult {
  bpm?: number
  musicalKey?: string
  energy?: number
  moods?: string[]
  genres?: string[]
  valence?: number
  danceability?: number
}

export interface CyaniteWebhookPayload {
  event: string
  analysisId: string
  trackId?: string
  status: 'COMPLETED' | 'FAILED'
  result?: CyaniteAnalysisResult
}

const CYANITE_API = process.env.CYANITE_API_BASE || 'https://api.cyanite.ai/graphql'
const CYANITE_TOKEN = process.env.CYANITE_INTEGRATION_ACCESS_TOKEN || ''

export function isCyaniteConfigured(): boolean {
  return !!(CYANITE_TOKEN && CYANITE_API)
}

export async function createCyaniteTrackAnalysis(
  audioUrl: string,
  trackId: string,
  title?: string
): Promise<string | null> {
  if (!CYANITE_TOKEN) {
    console.warn('[CYANITE] Token not configured, skipping analysis')
    return null
  }

  // Only analyze HTTP/HTTPS URLs (skip mock URLs)
  if (!audioUrl.startsWith('http://') && !audioUrl.startsWith('https://')) {
    console.log('[CYANITE] Skipping analysis for non-HTTP URL:', audioUrl)
    return null
  }

  try {
    // Correct Cyanite API v6 mutation
    const mutation = `
      mutation FileUploadRequest($url: String!) {
        fileUploadRequest(uploadUrl: $url) {
          id
          uploadUrl
        }
      }
    `

    const response = await fetch(CYANITE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CYANITE_TOKEN}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          url: audioUrl,
        },
      }),
    })

    const data = await response.json()
    
    if (data.errors) {
      console.error('[CYANITE] GraphQL errors:', data.errors)
      return null
    }

    const analysisId = data.data?.fileUploadRequest?.id
    console.log('[CYANITE] Analysis created:', analysisId, 'for', title)
    
    return analysisId
  } catch (error) {
    console.error('[CYANITE] Failed to create analysis:', error)
    return null
  }
}

export async function getCyaniteAnalysisResult(analysisId: string): Promise<CyaniteAnalysisResult | null> {
  if (!CYANITE_TOKEN) {
    return null
  }

  try {
    const query = `
      query GetAnalysis($id: ID!) {
        audioAnalysis(id: $id) {
          ... on AudioAnalysisV6 {
            bpmPrediction {
              value
            }
            keyPrediction {
              value
            }
            moodTags {
              tag
              score
            }
            genreTags {
              tag
              score
            }
            energyLevel
            valence
            danceability
          }
        }
      }
    `

    const response = await fetch(CYANITE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CYANITE_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables: { id: analysisId },
      }),
    })

    const data = await response.json()
    
    if (data.errors) {
      console.error('[CYANITE] Failed to get analysis:', data.errors)
      return null
    }

    const analysis = data.data?.audioAnalysis
    if (!analysis) {
      return null
    }

    // Extract top moods and genres
    const moods = analysis.moodTags
      ?.sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3)
      .map((m: any) => m.tag) || []

    const genres = analysis.genreTags
      ?.sort((a: any, b: any) => b.score - a.score)
      .slice(0, 3)
      .map((g: any) => g.tag) || []

    return {
      bpm: analysis.bpmPrediction?.value,
      musicalKey: analysis.keyPrediction?.value,
      energy: analysis.energyLevel,
      moods,
      genres,
      valence: analysis.valence,
      danceability: analysis.danceability,
    }
  } catch (error) {
    console.error('[CYANITE] Failed to get analysis result:', error)
    return null
  }
}

export function verifyCyaniteWebhook(signature: string, body: string): boolean {
  const secret = process.env.CYANITE_WEBHOOK_SECRET || ''
  if (!secret) return true // Skip verification in dev
  
  // TODO: Implement actual signature verification per Cyanite docs
  // For now, basic check
  return signature.length > 0
}
