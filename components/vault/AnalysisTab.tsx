'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Music2, TrendingUp, Sparkles } from 'lucide-react'

interface AnalysisTabProps {
  assetId: string
  analysis: any
  onRetry?: () => void
}

export function AnalysisTab({ assetId, analysis, onRetry }: AnalysisTabProps) {
  const [retrying, setRetrying] = useState(false)

  const handleRetry = async () => {
    setRetrying(true)
    try {
      const response = await fetch(`/api/analysis/retry?assetId=${assetId}`, {
        method: 'POST'
      })
      
      if (response.ok) {
        onRetry?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to retry analysis')
      }
    } catch (error) {
      console.error('Retry error:', error)
      alert('Failed to retry analysis')
    } finally {
      setRetrying(false)
    }
  }

  // PENDING state
  if (analysis?.status === 'PENDING' || analysis?.status === 'PROCESSING') {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-400" />
        <h3 className="text-xl font-bold font-mono text-green-400 mb-2">
          {analysis?.status === 'PROCESSING' ? 'ANALYZING_AUDIO...' : 'ANALYSIS_QUEUED...'}
        </h3>
        <p className="text-green-400/60 font-mono">
          This may take 1-2 minutes. Feel free to navigate away.
        </p>
      </div>
    )
  }

  // FAILED state
  if (analysis?.status === 'FAILED') {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
        <h3 className="text-xl font-bold font-mono text-red-400 mb-2">
          ANALYSIS_FAILED
        </h3>
        <p className="text-red-400/60 font-mono mb-4">
          {analysis.errorMessage || 'Unknown error occurred'}
        </p>
        <p className="text-sm text-green-400/40 font-mono mb-4">
          Retry attempts: {analysis.retryCount || 0} / 3
        </p>
        {(analysis.retryCount || 0) < 3 && (
          <Button
            onClick={handleRetry}
            disabled={retrying}
            className="bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 font-mono"
          >
            {retrying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                RETRYING...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                RETRY_ANALYSIS
              </>
            )}
          </Button>
        )}
      </div>
    )
  }

  // NO ANALYSIS state
  if (!analysis) {
    return (
      <div className="p-8 text-center">
        <Music2 className="h-12 w-12 mx-auto mb-4 text-green-400/40" />
        <h3 className="text-xl font-bold font-mono text-green-400/60 mb-2">
          NO_ANALYSIS_AVAILABLE
        </h3>
        <p className="text-green-400/40 font-mono">
          Analysis was not run for this asset
        </p>
      </div>
    )
  }

  // COMPLETE state - Show results
  const instruments = analysis.instruments ? JSON.parse(analysis.instruments) : []
  const cyaniteGenres = analysis.cyaniteGenres ? JSON.parse(analysis.cyaniteGenres) : []
  const cyaniteTags = analysis.cyaniteTags ? JSON.parse(analysis.cyaniteTags) : []

  return (
    <div className="space-y-6 p-6">
      {/* Success Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-green-400/20">
        <CheckCircle className="h-6 w-6 text-green-400" />
        <h3 className="text-xl font-bold font-mono text-green-400">
          ANALYSIS_COMPLETE
        </h3>
      </div>

      {/* Mansuba AI Results */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold font-mono text-green-400 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          MANSUBA_AI_ANALYSIS
        </h4>

        {/* Instruments Detected */}
        {instruments.length > 0 && (
          <div className="border border-green-400/20 bg-green-400/5 p-4 rounded">
            <h5 className="font-mono text-sm text-green-400/80 mb-2">INSTRUMENTS_DETECTED:</h5>
            <div className="flex flex-wrap gap-2">
              {instruments.map((instrument: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-green-400/10 border border-green-400/30 text-green-400 font-mono text-sm rounded"
                >
                  {instrument}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Audio Summary */}
        {analysis.audioSummary && (
          <div className="border border-green-400/20 bg-green-400/5 p-4 rounded">
            <h5 className="font-mono text-sm text-green-400/80 mb-2">AUDIO_SUMMARY:</h5>
            <p className="text-green-400 font-mono text-sm leading-relaxed">
              {analysis.audioSummary}
            </p>
          </div>
        )}

        {/* AI Insight */}
        {analysis.aiInsight && (
          <div className="border border-cyan-400/20 bg-cyan-400/5 p-4 rounded">
            <h5 className="font-mono text-sm text-cyan-400/80 mb-2">AI_INSIGHTS:</h5>
            <p className="text-cyan-400 font-mono text-sm leading-relaxed">
              {analysis.aiInsight}
            </p>
          </div>
        )}

        {/* Instrument Plot */}
        {analysis.instrumentPlotJson && (
          <div className="border border-green-400/20 bg-green-400/5 p-4 rounded">
            <h5 className="font-mono text-sm text-green-400/80 mb-2">INSTRUMENT_TIMELINE:</h5>
            <div className="bg-black/50 p-2 rounded">
              <img
                src={`data:image/png;base64,${analysis.instrumentPlotJson}`}
                alt="Instrument Timeline"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Virality Score */}
        {analysis.viralityPlotJson && (
          <div className="border border-pink-400/20 bg-pink-400/5 p-4 rounded">
            <h5 className="font-mono text-sm text-pink-400/80 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              VIRALITY_SCORE:
            </h5>
            <div className="bg-black/50 p-2 rounded">
              <img
                src={`data:image/png;base64,${analysis.viralityPlotJson}`}
                alt="Virality Score"
                className="w-full h-auto"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cyanite Results */}
      {(cyaniteGenres.length > 0 || cyaniteTags.length > 0 || analysis.cyaniteBpm || analysis.cyaniteKey) && (
        <div className="space-y-4 pt-4 border-t border-green-400/20">
          <h4 className="text-lg font-bold font-mono text-green-400 flex items-center gap-2">
            <Music2 className="h-5 w-5" />
            CYANITE_ANALYSIS
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Genres */}
            {cyaniteGenres.length > 0 && (
              <div className="border border-green-400/20 bg-green-400/5 p-4 rounded">
                <h5 className="font-mono text-sm text-green-400/80 mb-2">GENRES:</h5>
                <div className="flex flex-wrap gap-2">
                  {cyaniteGenres.map((genre: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-green-400/10 border border-green-400/30 text-green-400 font-mono text-xs rounded"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mood Tags */}
            {cyaniteTags.length > 0 && (
              <div className="border border-cyan-400/20 bg-cyan-400/5 p-4 rounded">
                <h5 className="font-mono text-sm text-cyan-400/80 mb-2">MOOD_TAGS:</h5>
                <div className="flex flex-wrap gap-2">
                  {cyaniteTags.slice(0, 10).map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-mono text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* BPM */}
            {analysis.cyaniteBpm && (
              <div className="border border-green-400/20 bg-green-400/5 p-4 rounded">
                <h5 className="font-mono text-sm text-green-400/80 mb-2">BPM:</h5>
                <p className="text-2xl font-bold font-mono text-green-400">
                  {analysis.cyaniteBpm}
                </p>
              </div>
            )}

            {/* Key */}
            {analysis.cyaniteKey && (
              <div className="border border-green-400/20 bg-green-400/5 p-4 rounded">
                <h5 className="font-mono text-sm text-green-400/80 mb-2">KEY:</h5>
                <p className="text-2xl font-bold font-mono text-green-400">
                  {analysis.cyaniteKey}
                </p>
              </div>
            )}

            {/* Mood */}
            {analysis.cyaniteMood && (
              <div className="border border-purple-400/20 bg-purple-400/5 p-4 rounded md:col-span-2">
                <h5 className="font-mono text-sm text-purple-400/80 mb-2">PRIMARY_MOOD:</h5>
                <p className="text-xl font-bold font-mono text-purple-400">
                  {analysis.cyaniteMood}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <div className="pt-4 border-t border-green-400/10">
        <p className="text-xs text-green-400/40 font-mono">
          Analyzed on: {new Date(analysis.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
