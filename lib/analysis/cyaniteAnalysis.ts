/**
 * Cyanite API Integration
 * Analyzes audio files for mood, genre, BPM, key, and tags
 */

const CYANITE_API_URL = 'https://api.cyanite.ai/graphql'
const CYANITE_ACCESS_TOKEN = process.env.CYANITE_ACCESS_TOKEN

interface CyaniteAnalysisResult {
  mood?: string
  genres?: string[]
  bpm?: number
  key?: string
  tags?: string[]
}

/**
 * Analyze audio file with Cyanite API
 */
export async function analyzeCyanite(audioUrl: string): Promise<CyaniteAnalysisResult> {
  if (!CYANITE_ACCESS_TOKEN) {
    console.warn('[CYANITE] No API token configured, skipping analysis')
    return {}
  }

  try {
    // Step 1: Upload file to Cyanite
    const uploadMutation = `
      mutation FileUploadRequest($input: FileUploadRequestInput!) {
        fileUploadRequest(input: $input) {
          __typename
          ... on FileUploadRequestSuccess {
            uploadUrl
            id
          }
          ... on Error {
            message
          }
        }
      }
    `

    const uploadResponse = await fetch(CYANITE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CYANITE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        query: uploadMutation,
        variables: {
          input: {
            uploadName: audioUrl.split('/').pop() || 'audio.mp3'
          }
        }
      })
    })

    const uploadData = await uploadResponse.json()
    
    if (uploadData.errors) {
      throw new Error(`Cyanite upload error: ${JSON.stringify(uploadData.errors)}`)
    }

    const uploadResult = uploadData.data?.fileUploadRequest
    if (uploadResult.__typename !== 'FileUploadRequestSuccess') {
      throw new Error(`Cyanite upload failed: ${uploadResult.message}`)
    }

    const { uploadUrl, id: fileId } = uploadResult

    // Step 2: Upload audio file to Cyanite's S3
    const audioResponse = await fetch(audioUrl)
    const audioBlob = await audioResponse.blob()

    await fetch(uploadUrl, {
      method: 'PUT',
      body: audioBlob,
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    })

    // Step 3: Enqueue analysis
    const enqueueMutation = `
      mutation LibraryTrackEnqueue($input: LibraryTrackEnqueueInput!) {
        libraryTrackEnqueue(input: $input) {
          __typename
          ... on LibraryTrackEnqueueSuccess {
            libraryTrack {
              id
            }
          }
          ... on Error {
            message
          }
        }
      }
    `

    const enqueueResponse = await fetch(CYANITE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CYANITE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        query: enqueueMutation,
        variables: {
          input: {
            uploadId: fileId
          }
        }
      })
    })

    const enqueueData = await enqueueResponse.json()
    
    if (enqueueData.errors) {
      throw new Error(`Cyanite enqueue error: ${JSON.stringify(enqueueData.errors)}`)
    }

    const trackId = enqueueData.data?.libraryTrackEnqueue?.libraryTrack?.id

    if (!trackId) {
      throw new Error('Failed to get track ID from Cyanite')
    }

    // Step 4: Poll for analysis results (wait up to 2 minutes)
    const maxAttempts = 24 // 24 * 5 seconds = 2 minutes
    let attempt = 0
    let analysisComplete = false
    let result: CyaniteAnalysisResult = {}

    while (attempt < maxAttempts && !analysisComplete) {
      await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

      const analysisQuery = `
        query LibraryTrack($id: ID!) {
          libraryTrack(id: $id) {
            id
            title
            audioAnalysisV6 {
              __typename
              ... on AudioAnalysisV6Finished {
                result {
                  genreTags
                  moodTags
                  bpm
                  key
                }
              }
              ... on AudioAnalysisV6Failed {
                error {
                  message
                }
              }
            }
          }
        }
      `

      const analysisResponse = await fetch(CYANITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CYANITE_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          query: analysisQuery,
          variables: { id: trackId }
        })
      })

      const analysisData = await analysisResponse.json()
      const audioAnalysis = analysisData.data?.libraryTrack?.audioAnalysisV6

      if (audioAnalysis?.__typename === 'AudioAnalysisV6Finished') {
        const analysisResult = audioAnalysis.result

        result = {
          genres: analysisResult.genreTags?.slice(0, 5) || [],
          mood: analysisResult.moodTags?.[0] || undefined,
          tags: analysisResult.moodTags || [],
          bpm: analysisResult.bpm || undefined,
          key: analysisResult.key || undefined
        }

        analysisComplete = true
      } else if (audioAnalysis?.__typename === 'AudioAnalysisV6Failed') {
        throw new Error(`Cyanite analysis failed: ${audioAnalysis.error?.message}`)
      }

      attempt++
    }

    if (!analysisComplete) {
      throw new Error('Cyanite analysis timed out after 2 minutes')
    }

    return result

  } catch (error) {
    console.error('[CYANITE] Analysis error:', error)
    throw error
  }
}
