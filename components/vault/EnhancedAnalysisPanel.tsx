'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Music, Award, Zap, Activity, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EnhancedAnalysisPanelProps {
  assetId: string
}

export function EnhancedAnalysisPanel({ assetId }: EnhancedAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    fetchAnalysis()
  }, [assetId])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/analysis/enhanced?assetId=${assetId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis')
      }
      
      const data = await response.json()
      setAnalysis(data.enhancedAnalysis)
    } catch (error: any) {
      console.error('Failed to fetch analysis:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const triggerAnalysis = async () => {
    try {
      setAnalyzing(true)
      setError(null)
      
      const response = await fetch('/api/analysis/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId })
      })
      
      if (!response.ok) {
        throw new Error('Failed to start analysis')
      }
      
      // Wait a bit then refresh
      setTimeout(() => {
        fetchAnalysis()
        setAnalyzing(false)
      }, 2000)
    } catch (error: any) {
      console.error('Failed to trigger analysis:', error)
      setError(error.message)
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-mono dark:text-green-400 text-green-700">LOADING_ANALYSIS...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-400/20 bg-red-400/5 p-6 text-center">
        <p className="font-mono text-red-400 mb-4">ERROR: {error}</p>
        <Button
          onClick={fetchAnalysis}
          variant="outline"
          className="dark:border-red-400/50 border-red-600/50 dark:text-red-400 text-red-700 font-mono"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          RETRY
        </Button>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="border border-green-400/20 p-6 text-center">
        <Sparkles className="h-12 w-12 dark:text-green-400 text-green-700 mx-auto mb-4" />
        <h3 className="font-mono dark:text-green-400 text-green-700 text-lg mb-2">
          NO_ENHANCED_ANALYSIS
        </h3>
        <p className="font-mono dark:text-green-400/60 text-green-700/70 text-sm mb-4">
          Run enhanced analysis to get detailed insights
        </p>
        <Button
          onClick={triggerAnalysis}
          disabled={analyzing}
          className="bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
        >
          {analyzing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ANALYZING...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              RUN_ANALYSIS
            </>
          )}
        </Button>
      </div>
    )
  }

  const { audioFeatures, genre, instruments, quality, virality } = analysis

  return (
    <div className="space-y-6">
      {/* Audio Features */}
      <div className="border dark:border-green-400/20 border-green-600/20 dark:bg-green-400/5 bg-green-600/5 p-4">
        <h4 className="font-mono dark:text-green-400 text-green-700 mb-4 flex items-center gap-2 text-sm font-bold">
          <Music className="h-4 w-4" />
          &gt; AUDIO_FEATURES
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="dark:text-green-400/60 text-green-700/70 font-mono text-xs mb-1">TEMPO:</div>
            <div className="dark:text-green-400 text-green-700 font-mono font-bold">
              {audioFeatures.tempo.toFixed(1)} BPM
            </div>
          </div>
          <div>
            <div className="dark:text-green-400/60 text-green-700/70 font-mono text-xs mb-1">KEY:</div>
            <div className="dark:text-green-400 text-green-700 font-mono font-bold">
              {audioFeatures.key}
            </div>
          </div>
          <div>
            <div className="dark:text-green-400/60 text-green-700/70 font-mono text-xs mb-1">DURATION:</div>
            <div className="dark:text-green-400 text-green-700 font-mono font-bold">
              {Math.floor(audioFeatures.duration / 60)}:{String(Math.floor(audioFeatures.duration % 60)).padStart(2, '0')}
            </div>
          </div>
          <div>
            <div className="dark:text-green-400/60 text-green-700/70 font-mono text-xs mb-1">ENERGY:</div>
            <div className="dark:text-green-400 text-green-700 font-mono font-bold">
              {(audioFeatures.energy * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="dark:text-green-400/60 text-green-700/70 font-mono text-xs mb-1">DANCEABILITY:</div>
            <div className="dark:text-green-400 text-green-700 font-mono font-bold">
              {(audioFeatures.danceability * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="dark:text-green-400/60 text-green-700/70 font-mono text-xs mb-1">VALENCE:</div>
            <div className="dark:text-green-400 text-green-700 font-mono font-bold">
              {(audioFeatures.valence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Genre Classification */}
      <div className="border dark:border-cyan-400/20 border-cyan-600/20 dark:bg-cyan-400/5 bg-cyan-600/5 p-4">
        <h4 className="font-mono dark:text-cyan-400 text-cyan-700 mb-4 flex items-center gap-2 text-sm font-bold">
          <Activity className="h-4 w-4" />
          &gt; GENRE_CLASSIFICATION
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono dark:text-cyan-400 text-cyan-700 font-bold uppercase">
                {genre.primary}
              </span>
              <span className="font-mono dark:text-cyan-400/60 text-cyan-700/70 text-sm">
                {(genre.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
            <div className="h-2 dark:bg-cyan-400/10 bg-cyan-600/10 rounded-full overflow-hidden">
              <div
                className="h-full dark:bg-cyan-400 bg-cyan-600 transition-all"
                style={{ width: `${genre.confidence * 100}%` }}
              />
            </div>
          </div>
          {genre.alternatives && genre.alternatives.length > 0 && (
            <div className="space-y-2">
              <div className="dark:text-cyan-400/60 text-cyan-700/70 font-mono text-xs">
                ALTERNATIVES:
              </div>
              {genre.alternatives.map((alt: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-mono dark:text-cyan-400/80 text-cyan-700/80 uppercase">
                    {alt.genre}
                  </span>
                  <span className="font-mono dark:text-cyan-400/60 text-cyan-700/70">
                    {(alt.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instruments */}
      {instruments && instruments.detected && instruments.detected.length > 0 && (
        <div className="border dark:border-purple-400/20 border-purple-600/20 dark:bg-purple-400/5 bg-purple-600/5 p-4">
          <h4 className="font-mono dark:text-purple-400 text-purple-700 mb-4 flex items-center gap-2 text-sm font-bold">
            <Zap className="h-4 w-4" />
            &gt; INSTRUMENTS_DETECTED
          </h4>
          <div className="flex flex-wrap gap-2">
            {instruments.detected.map((instrument: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 border dark:border-purple-400/30 border-purple-600/40 dark:text-purple-400 text-purple-700 font-mono text-xs uppercase"
              >
                {instrument}
              </span>
            ))}
          </div>
          {instruments.leadInstrument && (
            <div className="mt-3 pt-3 border-t dark:border-purple-400/20 border-purple-600/20">
              <span className="dark:text-purple-400/60 text-purple-700/70 font-mono text-xs">
                LEAD: 
              </span>
              <span className="ml-2 dark:text-purple-400 text-purple-700 font-mono text-sm font-bold uppercase">
                {instruments.leadInstrument}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quality Score */}
      <div className="border dark:border-yellow-400/20 border-yellow-600/20 dark:bg-yellow-400/5 bg-yellow-600/5 p-4">
        <h4 className="font-mono dark:text-yellow-400 text-yellow-700 mb-4 flex items-center gap-2 text-sm font-bold">
          <Award className="h-4 w-4" />
          &gt; QUALITY_ANALYSIS
        </h4>
        <div className="mb-4">
          <div className="text-4xl font-bold dark:text-yellow-400 text-yellow-700 font-mono mb-2">
            {quality.score.toFixed(0)}/100
          </div>
          <div className="h-3 dark:bg-yellow-400/10 bg-yellow-600/10 rounded-full overflow-hidden">
            <div
              className="h-full dark:bg-yellow-400 bg-yellow-600 transition-all"
              style={{ width: `${quality.score}%` }}
            />
          </div>
        </div>
        {quality.feedback && quality.feedback.length > 0 && (
          <div className="space-y-1">
            {quality.feedback.map((feedback: string, i: number) => (
              <div key={i} className="text-sm dark:text-yellow-400/80 text-yellow-700/80 font-mono">
                • {feedback}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t dark:border-yellow-400/20 border-yellow-600/20 grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="dark:text-yellow-400/60 text-yellow-700/70 font-mono mb-1">BALANCE:</div>
            <div className="dark:text-yellow-400 text-yellow-700 font-mono font-bold">
              {(quality.mixQuality.balance * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="dark:text-yellow-400/60 text-yellow-700/70 font-mono mb-1">CLARITY:</div>
            <div className="dark:text-yellow-400 text-yellow-700 font-mono font-bold">
              {(quality.mixQuality.clarity * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="dark:text-yellow-400/60 text-yellow-700/70 font-mono mb-1">DEPTH:</div>
            <div className="dark:text-yellow-400 text-yellow-700 font-mono font-bold">
              {(quality.mixQuality.depth * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>

      {/* Virality Prediction */}
      <div className="border dark:border-pink-400/20 border-pink-600/20 dark:bg-pink-400/5 bg-pink-600/5 p-4">
        <h4 className="font-mono dark:text-pink-400 text-pink-700 mb-4 flex items-center gap-2 text-sm font-bold">
          <TrendingUp className="h-4 w-4" />
          &gt; VIRALITY_POTENTIAL
        </h4>
        <div className="mb-4">
          <div className="text-4xl font-bold dark:text-pink-400 text-pink-700 font-mono mb-2">
            {virality.score}/100
          </div>
          <div className="h-3 dark:bg-pink-400/10 bg-pink-600/10 rounded-full overflow-hidden">
            <div
              className="h-full dark:bg-pink-400 bg-pink-600 transition-all"
              style={{ width: `${virality.score}%` }}
            />
          </div>
        </div>
        
        {virality.factors && virality.factors.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="dark:text-pink-400/60 text-pink-700/70 font-mono text-xs">
              CONTRIBUTING_FACTORS:
            </div>
            {virality.factors.map((factor: any, i: number) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="dark:text-pink-400 text-pink-700 font-mono text-sm font-bold">
                    {factor.factor}
                  </span>
                  <span className="dark:text-pink-400/60 text-pink-700/70 font-mono text-sm">
                    +{factor.impact}
                  </span>
                </div>
                <div className="dark:text-pink-400/70 text-pink-700/70 font-mono text-xs">
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {virality.recommendations && virality.recommendations.length > 0 && (
          <div className="pt-4 border-t dark:border-pink-400/20 border-pink-600/20">
            <div className="dark:text-pink-400/60 text-pink-700/70 font-mono text-xs mb-2">
              RECOMMENDATIONS:
            </div>
            <div className="space-y-2">
              {virality.recommendations.map((rec: string, i: number) => (
                <div key={i} className="text-sm dark:text-pink-400/80 text-pink-700/80 font-mono">
                  💡 {rec}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={triggerAnalysis}
          disabled={analyzing}
          variant="outline"
          className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
        >
          {analyzing ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 dark:border-green-400 border-green-600 border-t-transparent rounded-full mr-2" />
              RE-ANALYZING...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              RE-ANALYZE
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
