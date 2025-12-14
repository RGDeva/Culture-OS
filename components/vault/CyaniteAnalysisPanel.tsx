import { CreativeAsset } from '@/types/vault'
import { Music2, Zap, Heart, Activity } from 'lucide-react'

interface CyaniteAnalysisPanelProps {
  asset: CreativeAsset
}

export function CyaniteAnalysisPanel({ asset }: CyaniteAnalysisPanelProps) {
  const { cyaniteStatus, bpm, musicalKey, energy, moods, genres, valence, danceability } = asset

  if (!cyaniteStatus || cyaniteStatus === 'PENDING') {
    return (
      <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
        <h4 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-3">
          &gt; AI_ANALYSIS
        </h4>
        <div className="text-xs font-mono dark:text-yellow-400 text-yellow-600 animate-pulse">
          Analysis in progress...
        </div>
      </div>
    )
  }

  if (cyaniteStatus === 'FAILED') {
    return (
      <div className="border-2 dark:border-red-400/30 border-red-600/40 p-4 dark:bg-black/50 bg-white/80">
        <h4 className="text-sm font-bold font-mono dark:text-red-400 text-red-700 mb-3">
          &gt; AI_ANALYSIS
        </h4>
        <div className="text-xs font-mono dark:text-red-400/70 text-red-700/70">
          Analysis failed. Please try re-uploading.
        </div>
      </div>
    )
  }

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
      <h4 className="text-sm font-bold font-mono dark:text-green-400 text-green-700 mb-4">
        &gt; AI_ANALYSIS (CYANITE)
      </h4>

      <div className="space-y-4">
        {/* Musical Properties */}
        <div className="grid grid-cols-2 gap-3">
          {bpm && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Music2 className="h-3 w-3 dark:text-green-400/70 text-green-700/70" />
                <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                  BPM
                </span>
              </div>
              <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                {Math.round(bpm)}
              </div>
            </div>
          )}
          {musicalKey && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Music2 className="h-3 w-3 dark:text-green-400/70 text-green-700/70" />
                <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                  KEY
                </span>
              </div>
              <div className="text-lg font-bold font-mono dark:text-green-400 text-green-700">
                {musicalKey}
              </div>
            </div>
          )}
        </div>

        {/* Energy Metrics */}
        <div className="space-y-2">
          {energy !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 dark:text-yellow-400 text-yellow-600" />
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                    ENERGY
                  </span>
                </div>
                <span className="text-xs font-mono dark:text-green-400 text-green-700">
                  {Math.round(energy * 100)}%
                </span>
              </div>
              <div className="h-2 dark:bg-green-400/20 bg-green-600/20 overflow-hidden">
                <div
                  className="h-full dark:bg-yellow-400 bg-yellow-600 transition-all"
                  style={{ width: `${energy * 100}%` }}
                />
              </div>
            </div>
          )}

          {valence !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 dark:text-pink-400 text-pink-600" />
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                    VALENCE
                  </span>
                </div>
                <span className="text-xs font-mono dark:text-green-400 text-green-700">
                  {Math.round(valence * 100)}%
                </span>
              </div>
              <div className="h-2 dark:bg-green-400/20 bg-green-600/20 overflow-hidden">
                <div
                  className="h-full dark:bg-pink-400 bg-pink-600 transition-all"
                  style={{ width: `${valence * 100}%` }}
                />
              </div>
            </div>
          )}

          {danceability !== undefined && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-3 w-3 dark:text-cyan-400 text-cyan-600" />
                  <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
                    DANCEABILITY
                  </span>
                </div>
                <span className="text-xs font-mono dark:text-green-400 text-green-700">
                  {Math.round(danceability * 100)}%
                </span>
              </div>
              <div className="h-2 dark:bg-green-400/20 bg-green-600/20 overflow-hidden">
                <div
                  className="h-full dark:bg-cyan-400 bg-cyan-600 transition-all"
                  style={{ width: `${danceability * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Moods */}
        {moods && moods.length > 0 && (
          <div>
            <div className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2">
              MOODS
            </div>
            <div className="flex flex-wrap gap-2">
              {moods.map((mood, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-mono dark:bg-purple-400/20 bg-purple-600/20 dark:text-purple-400 text-purple-700 border dark:border-purple-400/30 border-purple-600/40"
                >
                  {mood.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {genres && genres.length > 0 && (
          <div>
            <div className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2">
              GENRES
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs font-mono dark:bg-pink-400/20 bg-pink-600/20 dark:text-pink-400 text-pink-700 border dark:border-pink-400/30 border-pink-600/40"
                >
                  {genre.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
