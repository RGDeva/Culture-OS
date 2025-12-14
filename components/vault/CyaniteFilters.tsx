import { useState } from 'react'
import { VaultFilters } from '@/types/vault'
import { X } from 'lucide-react'

interface CyaniteFiltersProps {
  filters: VaultFilters
  onFiltersChange: (filters: VaultFilters) => void
}

const MUSICAL_KEYS = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B',
  'Cm', 'C#m', 'Dm', 'D#m', 'Em', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
]

const COMMON_MOODS = [
  'happy', 'sad', 'energetic', 'calm', 'dark', 'uplifting',
  'melancholic', 'aggressive', 'romantic', 'mysterious'
]

const COMMON_GENRES = [
  'hip-hop', 'trap', 'r&b', 'pop', 'electronic', 'house',
  'techno', 'ambient', 'rock', 'indie', 'jazz', 'soul'
]

export function CyaniteFilters({ filters, onFiltersChange }: CyaniteFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof VaultFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const toggleMood = (mood: string) => {
    const currentMoods = filters.moods || []
    const newMoods = currentMoods.includes(mood)
      ? currentMoods.filter(m => m !== mood)
      : [...currentMoods, mood]
    updateFilter('moods', newMoods.length > 0 ? newMoods : undefined)
  }

  const toggleGenre = (genre: string) => {
    const currentGenres = filters.genres || []
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre]
    updateFilter('genres', newGenres.length > 0 ? newGenres : undefined)
  }

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      bpmRange: undefined,
      key: undefined,
      moods: undefined,
      genres: undefined,
      energyRange: undefined,
      danceabilityRange: undefined,
    })
  }

  const hasActiveFilters = !!(
    filters.bpmRange ||
    filters.key ||
    filters.moods?.length ||
    filters.genres?.length ||
    filters.energyRange ||
    filters.danceabilityRange
  )

  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
          &gt; AI_FILTERS
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-mono dark:text-red-400 text-red-600 hover:underline flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            CLEAR
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* BPM Range */}
        <div>
          <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
            BPM_RANGE
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.bpmRange?.min || ''}
              onChange={(e) =>
                updateFilter('bpmRange', {
                  ...filters.bpmRange,
                  min: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="flex-1 px-2 py-1 text-xs font-mono border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.bpmRange?.max || ''}
              onChange={(e) =>
                updateFilter('bpmRange', {
                  ...filters.bpmRange,
                  max: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              className="flex-1 px-2 py-1 text-xs font-mono border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
            />
          </div>
        </div>

        {/* Musical Key */}
        <div>
          <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
            MUSICAL_KEY
          </label>
          <select
            value={filters.key || ''}
            onChange={(e) => updateFilter('key', e.target.value || undefined)}
            className="w-full px-2 py-1 text-xs font-mono border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
          >
            <option value="">ALL_KEYS</option>
            {MUSICAL_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        {/* Moods */}
        <div>
          <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
            MOODS
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_MOODS.map((mood) => (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={`px-2 py-1 text-xs font-mono border transition-colors ${
                  filters.moods?.includes(mood)
                    ? 'dark:bg-purple-400 bg-purple-600 dark:text-black text-white dark:border-purple-400 border-purple-600'
                    : 'dark:bg-purple-400/20 bg-purple-600/20 dark:text-purple-400 text-purple-700 dark:border-purple-400/30 border-purple-600/40 hover:dark:border-purple-400 hover:border-purple-600'
                }`}
              >
                {mood.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
            GENRES
          </label>
          <div className="flex flex-wrap gap-2">
            {COMMON_GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-2 py-1 text-xs font-mono border transition-colors ${
                  filters.genres?.includes(genre)
                    ? 'dark:bg-pink-400 bg-pink-600 dark:text-black text-white dark:border-pink-400 border-pink-600'
                    : 'dark:bg-pink-400/20 bg-pink-600/20 dark:text-pink-400 text-pink-700 dark:border-pink-400/30 border-pink-600/40 hover:dark:border-pink-400 hover:border-pink-600'
                }`}
              >
                {genre.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-mono dark:text-green-400/70 text-green-700/70 hover:dark:text-green-400 hover:text-green-700 underline"
        >
          {showAdvanced ? '▼ HIDE_ADVANCED' : '▶ SHOW_ADVANCED'}
        </button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-2 border-t dark:border-green-400/20 border-green-600/30">
            {/* Energy Range */}
            <div>
              <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
                ENERGY_LEVEL (0-100%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.energyRange?.min ? filters.energyRange.min * 100 : ''}
                  onChange={(e) =>
                    updateFilter('energyRange', {
                      ...filters.energyRange,
                      min: e.target.value ? parseInt(e.target.value) / 100 : undefined,
                    })
                  }
                  className="flex-1 px-2 py-1 text-xs font-mono border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.energyRange?.max ? filters.energyRange.max * 100 : ''}
                  onChange={(e) =>
                    updateFilter('energyRange', {
                      ...filters.energyRange,
                      max: e.target.value ? parseInt(e.target.value) / 100 : undefined,
                    })
                  }
                  className="flex-1 px-2 py-1 text-xs font-mono border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
              </div>
            </div>

            {/* Danceability Range */}
            <div>
              <label className="text-xs font-mono dark:text-green-400/70 text-green-700/70 mb-2 block">
                DANCEABILITY (0-100%)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.danceabilityRange?.min ? filters.danceabilityRange.min * 100 : ''}
                  onChange={(e) =>
                    updateFilter('danceabilityRange', {
                      ...filters.danceabilityRange,
                      min: e.target.value ? parseInt(e.target.value) / 100 : undefined,
                    })
                  }
                  className="flex-1 px-2 py-1 text-xs font-mono border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.danceabilityRange?.max ? filters.danceabilityRange.max * 100 : ''}
                  onChange={(e) =>
                    updateFilter('danceabilityRange', {
                      ...filters.danceabilityRange,
                      max: e.target.value ? parseInt(e.target.value) / 100 : undefined,
                    })
                  }
                  className="flex-1 px-2 py-1 text-xs font-mono border-2 dark:border-green-400/30 border-green-600/40 dark:bg-black/50 bg-white dark:text-green-400 text-green-700 focus:outline-none focus:dark:border-green-400 focus:border-green-600"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
