import { CreativeAsset } from '@/types/vault'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

interface CyaniteAnalysisBadgeProps {
  asset: CreativeAsset
  compact?: boolean
}

export function CyaniteAnalysisBadge({ asset, compact = false }: CyaniteAnalysisBadgeProps) {
  const { cyaniteStatus, bpm, musicalKey, moods, genres, energy } = asset

  if (!cyaniteStatus) return null

  // Pending state
  if (cyaniteStatus === 'PENDING') {
    return (
      <div className="flex items-center gap-2 text-xs font-mono dark:text-yellow-400 text-yellow-600">
        <Loader2 className="h-3 w-3 animate-spin" />
        {!compact && <span>ANALYZING...</span>}
      </div>
    )
  }

  // Failed state
  if (cyaniteStatus === 'FAILED') {
    return (
      <div className="flex items-center gap-2 text-xs font-mono dark:text-red-400 text-red-600">
        <XCircle className="h-3 w-3" />
        {!compact && <span>ANALYSIS_FAILED</span>}
      </div>
    )
  }

  // Completed state - show analysis tags
  if (cyaniteStatus === 'COMPLETED') {
    if (compact) {
      return (
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 dark:text-green-400 text-green-600" />
          {bpm && (
            <span className="text-xs font-mono dark:text-green-400 text-green-700">
              {Math.round(bpm)} BPM
            </span>
          )}
          {musicalKey && (
            <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
              {musicalKey}
            </span>
          )}
        </div>
      )
    }

    return (
      <div className="flex flex-wrap items-center gap-2">
        {bpm && (
          <span className="px-2 py-0.5 text-xs font-mono dark:bg-green-400/20 bg-green-600/20 dark:text-green-400 text-green-700 border dark:border-green-400/30 border-green-600/40">
            {Math.round(bpm)} BPM
          </span>
        )}
        {musicalKey && (
          <span className="px-2 py-0.5 text-xs font-mono dark:bg-cyan-400/20 bg-cyan-600/20 dark:text-cyan-400 text-cyan-700 border dark:border-cyan-400/30 border-cyan-600/40">
            {musicalKey}
          </span>
        )}
        {energy !== undefined && (
          <span className="px-2 py-0.5 text-xs font-mono dark:bg-yellow-400/20 bg-yellow-600/20 dark:text-yellow-400 text-yellow-700 border dark:border-yellow-400/30 border-yellow-600/40">
            {Math.round(energy * 100)}% ENERGY
          </span>
        )}
        {moods && moods.length > 0 && (
          <>
            {moods.slice(0, 2).map((mood, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs font-mono dark:bg-purple-400/20 bg-purple-600/20 dark:text-purple-400 text-purple-700 border dark:border-purple-400/30 border-purple-600/40"
              >
                {mood.toUpperCase()}
              </span>
            ))}
          </>
        )}
        {genres && genres.length > 0 && (
          <span className="px-2 py-0.5 text-xs font-mono dark:bg-pink-400/20 bg-pink-600/20 dark:text-pink-400 text-pink-700 border dark:border-pink-400/30 border-pink-600/40">
            {genres[0].toUpperCase()}
          </span>
        )}
      </div>
    )
  }

  return null
}
