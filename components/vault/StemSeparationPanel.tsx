'use client'

import { useState, useEffect } from 'react'
import { Music, Disc, Mic, Drum, Guitar, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface StemSeparationPanelProps {
  assetId: string
  audioUrl: string
}

interface Stem {
  id: string
  type: string
  url: string
  duration: number
  energy: number
}

interface Separation {
  id: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  error?: string
  stems: Stem[]
  createdAt: string
  completedAt?: string
}

export default function StemSeparationPanel({ assetId, audioUrl }: StemSeparationPanelProps) {
  const [separation, setSeparation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playingAudio, setPlayingAudio] = useState<{ [key: string]: HTMLAudioElement }>({})
  const [playingStems, setPlayingStems] = useState<Set<string>>(new Set())
  const [polling, setPolling] = useState(false)

  // Validate props
  if (!assetId || !audioUrl) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-mono">
          Asset ID and audio URL are required
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Asset ID: {assetId || 'missing'}<br />
          Audio URL: {audioUrl || 'missing'}
        </p>
      </div>
    )
  }

  // Check if stems already exist
  useEffect(() => {
    checkExistingSeparation()
  }, [assetId])

  // Poll for status updates when processing
  useEffect(() => {
    if (separation?.status === 'PROCESSING' || separation?.status === 'PENDING') {
      setPolling(true)
      const interval = setInterval(() => {
        checkSeparationStatus(separation.id)
      }, 3000) // Poll every 3 seconds

      return () => {
        clearInterval(interval)
        setPolling(false)
      }
    }
  }, [separation?.status])

  const checkExistingSeparation = async () => {
    try {
      const response = await fetch(`/api/stems/separate?assetId=${assetId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.separation) {
          setSeparation(data.separation)
        }
      }
    } catch (err) {
      console.error('Error checking existing separation:', err)
    }
  }

  const checkSeparationStatus = async (separationId: string) => {
    try {
      const response = await fetch(`/api/stems/separate?separationId=${separationId}`)
      if (response.ok) {
        const data = await response.json()
        setSeparation(data.separation)
      }
    } catch (err) {
      console.error('Error checking separation status:', err)
    }
  }

  const startSeparation = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('[STEM_SEPARATION] Starting separation...')
      console.log('[STEM_SEPARATION] Asset ID:', assetId)
      console.log('[STEM_SEPARATION] Audio URL:', audioUrl)
      
      const requestBody = { assetId, audioUrl }
      console.log('[STEM_SEPARATION] Request body:', requestBody)
      
      const response = await fetch('/api/stems/separate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      console.log('[STEM_SEPARATION] Response status:', response.status)
      console.log('[STEM_SEPARATION] Response ok:', response.ok)

      const data = await response.json()
      console.log('[STEM_SEPARATION] Response data:', JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error('[STEM_SEPARATION] API returned error:', data)
        throw new Error(data.error || data.message || 'Failed to start stem separation')
      }

      if (!data.success) {
        console.error('[STEM_SEPARATION] API returned success=false:', data)
        throw new Error(data.error || data.message || 'Failed to start stem separation')
      }

      console.log('[STEM_SEPARATION] ✅ Separation started successfully!')
      console.log('[STEM_SEPARATION] Separation ID:', data.separationId)

      setSeparation({
        id: data.separationId,
        status: 'PENDING',
        progress: 0,
        stems: [],
        createdAt: new Date().toISOString(),
      })
      
      console.log('[STEM_SEPARATION] ✅ State updated, polling will begin...')
    } catch (err: any) {
      console.error('[STEM_SEPARATION] ❌ Error caught:', err)
      console.error('[STEM_SEPARATION] ❌ Error message:', err.message)
      console.error('[STEM_SEPARATION] ❌ Error stack:', err.stack)
      setError(err.message || 'Failed to start stem separation')
    } finally {
      setLoading(false)
    }
  }

  const togglePlayPause = (stemId: string, stemUrl: string) => {
    if (playingStems.has(stemId)) {
      // Pause
      const audio = playingAudio[stemId]
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      const newPlaying = new Set(playingStems)
      newPlaying.delete(stemId)
      setPlayingStems(newPlaying)
    } else {
      // Play
      const audio = new Audio(stemUrl)
      audio.play()
      audio.onended = () => {
        const newPlaying = new Set(playingStems)
        newPlaying.delete(stemId)
        setPlayingStems(newPlaying)
      }
      setPlayingAudio({ ...playingAudio, [stemId]: audio })
      setPlayingStems(new Set([...playingStems, stemId]))
    }
  }

  const getStemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vocals':
        return <Mic className="h-5 w-5" />
      case 'drums':
        return <Drum className="h-5 w-5" />
      case 'bass':
        return <Disc className="h-5 w-5" />
      case 'other':
        return <Guitar className="h-5 w-5" />
      default:
        return <Music className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400'
      case 'PROCESSING':
      case 'PENDING':
        return 'text-yellow-400'
      case 'FAILED':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold font-mono text-green-400">
            {'>'} STEM_SEPARATION
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Separate audio into vocals, drums, bass, and other instruments
          </p>
        </div>
      </div>

      {/* Status */}
      {separation && (
        <div className="border-2 border-green-400/30 bg-black/40 p-4 rounded">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm text-gray-400">STATUS:</span>
            <span className={`font-mono text-sm font-bold ${getStatusColor(separation.status)}`}>
              {separation.status}
            </span>
          </div>

          {(separation.status === 'PROCESSING' || separation.status === 'PENDING') && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Progress</span>
                <span className="text-xs text-green-400">{separation.progress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-green-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${separation.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                This may take 2-5 minutes depending on file length...
              </p>
            </div>
          )}

          {separation.status === 'FAILED' && separation.error && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-400/30 rounded">
              <p className="text-sm text-red-400">{separation.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Stems */}
      {separation?.status === 'COMPLETED' && separation.stems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-mono text-sm text-green-400 mb-3">SEPARATED STEMS:</h4>
          {separation.stems.map((stem) => (
            <div
              key={stem.id}
              className="border-2 border-green-400/30 bg-black/40 p-3 rounded hover:border-green-400/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-green-400">
                    {getStemIcon(stem.type)}
                  </div>
                  <div>
                    <p className="font-mono text-sm text-green-400 font-bold">
                      {stem.type.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {stem.duration.toFixed(2)}s • Energy: {(stem.energy * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePlayPause(stem.id, stem.url)}
                    className="px-3 py-1 bg-green-400/10 hover:bg-green-400/20 text-green-400 rounded text-xs font-mono transition-colors"
                  >
                    {playingStems.has(stem.id) ? 'STOP' : 'PLAY'}
                  </button>
                  <a
                    href={stem.url}
                    download
                    className="px-3 py-1 bg-green-400/10 hover:bg-green-400/20 text-green-400 rounded text-xs font-mono transition-colors"
                  >
                    DOWNLOAD
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Button */}
      {!separation && (
        <button
          onClick={startSeparation}
          disabled={loading}
          className="w-full px-4 py-3 bg-green-400 hover:bg-green-500 text-black font-mono font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              STARTING...
            </>
          ) : (
            <>
              <Music className="h-4 w-4" />
              SEPARATE_STEMS
            </>
          )}
        </button>
      )}

      {separation?.status === 'FAILED' && (
        <button
          onClick={startSeparation}
          disabled={loading}
          className="w-full px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-mono font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              RETRYING...
            </>
          ) : (
            <>
              <Music className="h-4 w-4" />
              RETRY_SEPARATION
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-900/20 border-2 border-red-400/30 rounded">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Info */}
      <div className="space-y-2">
        <div className="p-3 bg-blue-900/20 border-2 border-blue-400/30 rounded">
          <p className="text-xs text-blue-400">
            <strong>Note:</strong> Stem separation uses Demucs AI model. Processing time: 2-5 minutes depending on track length.
          </p>
        </div>
        
        <div className="p-3 bg-yellow-900/20 border-2 border-yellow-400/30 rounded">
          <p className="text-xs text-yellow-400">
            <strong>Tip:</strong> If you see wallet errors in console, ignore them - they're cosmetic and don't affect stem separation. Check the progress bar above for actual status.
          </p>
        </div>
      </div>
    </div>
  )
}
