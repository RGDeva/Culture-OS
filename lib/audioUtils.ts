// Audio utility functions for metadata extraction and analysis

import { AssetType, UserRole, AudioMetadata } from '@/types/vault'

/**
 * Infer asset type from filename and user role
 */
export function inferAssetType(filename: string, userRoles: UserRole[]): AssetType {
  const lower = filename.toLowerCase()
  
  // Check filename patterns
  if (lower.includes('loop')) return 'LOOP'
  if (lower.includes('stem')) return 'STEMS'
  if (lower.includes('vocal')) return 'VOCAL'
  if (lower.includes('demo')) return 'SONG_DEMO'
  if (lower.includes('reference') || lower.includes('ref')) return 'REFERENCE'
  if (lower.includes('session')) return 'SESSION_FILES'
  
  // Check by user role
  if (userRoles.includes('ENGINEER')) {
    if (lower.includes('mix')) return 'MIX'
    if (lower.includes('master')) return 'MASTER'
  }
  
  if (userRoles.includes('PRODUCER')) {
    return 'BEAT'
  }
  
  if (userRoles.includes('ARTIST')) {
    return 'SONG_DEMO'
  }
  
  // Default
  return 'BEAT'
}

/**
 * Extract title from filename
 */
export function extractTitleFromFilename(filename: string): string {
  // Remove extension
  const withoutExt = filename.replace(/\.[^/.]+$/, '')
  
  // Remove common prefixes/suffixes
  let title = withoutExt
    .replace(/^\d+[-_\s]*/g, '') // Remove leading numbers
    .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
    .trim()
  
  // Capitalize first letter of each word
  title = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return title || 'Untitled'
}

/**
 * Detect BPM from audio file (stub - would use actual audio analysis)
 */
export async function detectBPM(fileUrl: string): Promise<number | undefined> {
  // TODO: Implement actual BPM detection using Web Audio API or server-side analysis
  // For now, return undefined or a mock value
  console.log('[AUDIO_UTILS] BPM detection not yet implemented for:', fileUrl)
  return undefined
}

/**
 * Detect musical key from audio file (stub - would use actual audio analysis)
 */
export async function detectKey(fileUrl: string): Promise<string | undefined> {
  // TODO: Implement actual key detection using audio analysis
  // For now, return undefined or a mock value
  console.log('[AUDIO_UTILS] Key detection not yet implemented for:', fileUrl)
  return undefined
}

/**
 * Extract audio metadata from file (stub - would use music-metadata library)
 */
export async function extractAudioMetadata(file: File): Promise<AudioMetadata> {
  // TODO: Implement actual metadata extraction using music-metadata
  // For now, return basic info
  
  const metadata: AudioMetadata = {
    title: extractTitleFromFilename(file.name),
    duration: undefined,
    sampleRate: undefined,
    bitrate: undefined,
  }
  
  console.log('[AUDIO_UTILS] Extracted metadata:', metadata)
  return metadata
}

/**
 * Generate waveform data from audio file (stub)
 */
export async function generateWaveform(fileUrl: string): Promise<string | undefined> {
  // TODO: Implement waveform generation using Web Audio API
  // Return a data URL or path to waveform image
  console.log('[AUDIO_UTILS] Waveform generation not yet implemented for:', fileUrl)
  return undefined
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration in seconds to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get role-specific upload hints
 */
export function getRoleUploadHints(role: UserRole): string[] {
  const hints: Record<UserRole, string[]> = {
    PRODUCER: [
      'Upload beats, loops, and stems',
      'Tag with BPM and key for better discovery',
      'Organize by project or album',
    ],
    ARTIST: [
      'Upload demos, toplines, and reference ideas',
      'Add mood tags for better organization',
      'Attach to projects for collaboration',
    ],
    ENGINEER: [
      'Upload mix/master examples',
      'Include before/after samples',
      'Tag with service type (mixing, mastering)',
    ],
    STUDIO: [
      'Upload session recordings',
      'Group by client or project',
      'Include room/equipment details in tags',
    ],
    MANAGER: [
      'Upload project materials',
      'Organize by artist or campaign',
      'Tag with project status',
    ],
    OTHER: [
      'Upload your creative assets',
      'Tag for easy discovery',
      'Organize by project',
    ],
  }
  
  return hints[role] || hints.OTHER
}

/**
 * Get role-specific marketplace suggestions
 */
export function getRoleMarketplaceSuggestions(role: UserRole): string[] {
  const suggestions: Record<UserRole, string[]> = {
    PRODUCER: [
      'List beats for lease or exclusive sale',
      'Offer custom beat production services',
      'Create beat packs for bulk sales',
    ],
    ARTIST: [
      'List feature verses or hooks',
      'Offer songwriting services',
      'Sell demo placements',
    ],
    ENGINEER: [
      'Offer mixing services',
      'Offer mastering services',
      'Create service packages',
    ],
    STUDIO: [
      'List recording session slots',
      'Offer hourly or daily rates',
      'Create package deals',
    ],
    MANAGER: [
      'Offer artist management services',
      'List consulting packages',
      'Create campaign bundles',
    ],
    OTHER: [
      'List your services',
      'Create custom offerings',
      'Build service packages',
    ],
  }
  
  return suggestions[role] || suggestions.OTHER
}

/**
 * Validate audio file type
 */
export function isValidAudioFile(filename: string): boolean {
  const validExtensions = [
    // Audio files
    '.mp3',
    '.wav',
    '.aiff',
    '.aif',
    '.flac',
    '.m4a',
    '.ogg',
    '.wma',
    // DAW sessions
    '.ptx',
    '.als',
    '.flp',
    '.logic',
    '.rpp',
    '.cpr',
    '.aup',
    '.band',
    // MIDI
    '.mid',
    '.midi',
    // Video
    '.mp4',
    '.mov',
    '.avi',
    '.mkv',
    '.webm',
    // Archives
    '.zip',
    '.rar',
    '.7z',
    '.tar',
    '.gz',
  ]
  
  const lower = filename.toLowerCase()
  return validExtensions.some(ext => lower.endsWith(ext))
}

/**
 * Get file extension
 */
export function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/)
  return match ? match[1].toLowerCase() : ''
}

/**
 * Detect product category from filename and metadata
 */
export function detectProductCategory(filename: string, duration?: number, bpm?: number): string {
  const lower = filename.toLowerCase()
  
  // Check for explicit keywords in filename
  if (lower.includes('loop') || lower.includes('lp')) return 'LOOP'
  if (lower.includes('beat') || lower.includes('instrumental')) return 'BEAT'
  if (lower.includes('drum') && (lower.includes('kit') || lower.includes('pack'))) return 'DRUM_KIT'
  if (lower.includes('one shot') || lower.includes('oneshot') || lower.includes('1shot')) return 'ONE_SHOT'
  if (lower.includes('vocal') && lower.includes('sample')) return 'VOCAL_SAMPLE'
  if (lower.includes('midi')) return 'MIDI'
  if (lower.includes('preset')) return 'PRESET'
  if (lower.includes('sample pack') || lower.includes('samplepack')) return 'SAMPLE_PACK'
  if (lower.includes('beat pack') || lower.includes('beatpack')) return 'BEAT_PACK'
  if (lower.includes('stem')) return 'STEMS'
  if (lower.includes('session')) return 'SESSION_FILES'
  
  // Check file extension
  const ext = getFileExtension(filename)
  if (ext === 'mid' || ext === 'midi') return 'MIDI'
  if (ext === 'ptx' || ext === 'als' || ext === 'flp' || ext === 'logic') return 'SESSION_FILES'
  if (ext === 'zip' || ext === 'rar') return 'SAMPLE_PACK'
  
  // Use duration to guess
  if (duration) {
    if (duration < 5) return 'ONE_SHOT' // Less than 5 seconds
    if (duration < 15) return 'LOOP' // 5-15 seconds
    if (duration < 60) return 'SAMPLE' // 15-60 seconds
    if (duration >= 60) return 'BEAT' // Over 1 minute
  }
  
  // Default based on BPM
  if (bpm && bpm > 0) return 'BEAT'
  
  // Default fallback
  return 'SAMPLE'
}

/**
 * Extract base filename for grouping related files
 * Examples:
 * - "keep dreamin.bak.003.ptx" -> "keep dreamin"
 * - "Beat_v2.wav" -> "Beat"
 * - "Loop (1).mp3" -> "Loop"
 */
export function extractBaseFilename(filename: string): string {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^.]+$/, '')
  
  // Remove common version patterns
  let baseName = nameWithoutExt
    // Remove .bak.001, .bak.002, etc.
    .replace(/\.bak\.\d+$/i, '')
    // Remove _v1, _v2, etc.
    .replace(/[_\s]v\d+$/i, '')
    // Remove (1), (2), etc.
    .replace(/\s*\(\d+\)$/i, '')
    // Remove -1, -2, etc.
    .replace(/[-_]\d+$/i, '')
    // Remove _final, _master, etc.
    .replace(/[_\s](final|master|mix|demo|draft|backup)$/i, '')
  
  return baseName.trim()
}

/**
 * Group files by their base name
 * Returns a map of base names to file arrays
 */
export function groupRelatedFiles(filenames: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  
  for (const filename of filenames) {
    const baseName = extractBaseFilename(filename)
    
    if (!groups.has(baseName)) {
      groups.set(baseName, [])
    }
    groups.get(baseName)!.push(filename)
  }
  
  return groups
}

/**
 * Check if files are related (duplicates/versions)
 */
export function areFilesRelated(file1: string, file2: string): boolean {
  const base1 = extractBaseFilename(file1)
  const base2 = extractBaseFilename(file2)
  
  return base1.toLowerCase() === base2.toLowerCase()
}

/**
 * Check if file is a project file (.ptx, .flp, .als, etc.)
 */
export function isProjectFile(filename: string): boolean {
  const ext = getFileExtension(filename)
  const projectExtensions = ['ptx', 'flp', 'als', 'logic', 'rpp', 'cpr', 'aup', 'band']
  return projectExtensions.includes(ext)
}

/**
 * Check if file is playable audio
 */
export function isPlayableAudio(filename: string): boolean {
  const ext = getFileExtension(filename)
  const audioExtensions = ['mp3', 'wav', 'aiff', 'aif', 'flac', 'm4a', 'ogg', 'wma']
  return audioExtensions.includes(ext)
}

/**
 * Detect if files should be grouped as a project
 * Returns project name if they should be grouped, null otherwise
 */
export function detectProjectGroup(filenames: string[]): string | null {
  // Check if any files are project files (.ptx, .flp)
  const projectFiles = filenames.filter(f => isProjectFile(f))
  
  if (projectFiles.length > 0) {
    // Use the project file name as the project name
    return extractBaseFilename(projectFiles[0])
  }
  
  // Check if multiple files have the same base name
  const groups = groupRelatedFiles(filenames)
  for (const [baseName, files] of groups.entries()) {
    if (files.length >= 2) {
      return baseName
    }
  }
  
  return null
}

/**
 * Generate mock BPM for demo purposes
 */
export function generateMockBPM(): number {
  // Common BPM ranges: 60-90 (slow), 90-120 (mid), 120-140 (uptempo), 140-180 (fast)
  const ranges = [
    { min: 70, max: 90 },   // Slow
    { min: 90, max: 110 },  // Mid-tempo
    { min: 110, max: 130 }, // Uptempo
    { min: 130, max: 150 }, // Fast
  ]
  
  const range = ranges[Math.floor(Math.random() * ranges.length)]
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
}

/**
 * Generate mock key for demo purposes
 */
export function generateMockKey(): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const scales = ['maj', 'min']
  
  const note = notes[Math.floor(Math.random() * notes.length)]
  const scale = scales[Math.floor(Math.random() * scales.length)]
  
  return `${note} ${scale}`
}

/**
 * Generate mock genre for demo purposes
 */
export function generateMockGenre(): string {
  const genres = [
    'Hip-Hop',
    'Trap',
    'R&B',
    'Pop',
    'Electronic',
    'Rock',
    'Indie',
    'Jazz',
    'Soul',
    'Alternative',
  ]
  
  return genres[Math.floor(Math.random() * genres.length)]
}
