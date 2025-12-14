/**
 * Intelligent File Organization System
 * Automatically groups related files (DAW sessions, stems, audio, etc.)
 */

export interface FileGroup {
  id: string
  name: string // Project/track name
  type: 'project' | 'standalone'
  primaryFile: OrganizedFile
  relatedFiles: OrganizedFile[]
  metadata: {
    totalSize: number
    fileCount: number
    hasSession: boolean
    hasAudio: boolean
    hasStems: boolean
    detectedBPM?: number
    detectedKey?: string
  }
}

export interface OrganizedFile {
  name: string
  size: number
  type: string
  category: FileCategory
  url?: string
  cloudinaryId?: string
}

export type FileCategory = 
  | 'daw_session'      // .ptx, .als, .flp, .logic, .rpp
  | 'master_audio'     // Final mix
  | 'stem'             // Individual tracks
  | 'midi'             // .mid files
  | 'preset'           // Synth presets
  | 'sample'           // One-shots, loops
  | 'video'            // Music videos, visualizers
  | 'artwork'          // Cover art
  | 'document'         // PDFs, lyrics, notes
  | 'other'

// DAW session file extensions
const DAW_EXTENSIONS = {
  '.ptx': 'Pro Tools',
  '.ptf': 'Pro Tools',
  '.als': 'Ableton Live',
  '.alp': 'Ableton Live',
  '.flp': 'FL Studio',
  '.logic': 'Logic Pro',
  '.logicx': 'Logic Pro',
  '.rpp': 'REAPER',
  '.cpr': 'Cubase',
  '.npr': 'Nuendo',
  '.sesx': 'Adobe Audition',
  '.stf': 'Studio One',
  '.song': 'Studio One',
  '.aup': 'Audacity',
  '.aup3': 'Audacity',
  '.band': 'GarageBand',
  '.reason': 'Reason',
  '.rns': 'Reason',
}

// Audio file extensions
const AUDIO_EXTENSIONS = [
  '.wav', '.mp3', '.aif', '.aiff', '.flac', '.ogg', '.m4a', '.aac', '.wma', '.alac'
]

// Stem indicators in filenames
const STEM_KEYWORDS = [
  'stem', 'stems', 'track', 'drum', 'drums', 'bass', 'vocal', 'vox', 'lead', 
  'pad', 'synth', 'guitar', 'piano', 'kick', 'snare', 'hat', 'perc', 'fx', 'sfx'
]

/**
 * Categorize a file based on its extension and name
 */
export function categorizeFile(filename: string): FileCategory {
  const ext = getExtension(filename).toLowerCase()
  const nameLower = filename.toLowerCase()
  
  // DAW Session
  if (DAW_EXTENSIONS[ext as keyof typeof DAW_EXTENSIONS]) {
    return 'daw_session'
  }
  
  // Audio files
  if (AUDIO_EXTENSIONS.includes(ext)) {
    // Check if it's a stem
    const isStem = STEM_KEYWORDS.some(keyword => nameLower.includes(keyword))
    if (isStem) return 'stem'
    
    // Check if it's a master
    if (nameLower.includes('master') || nameLower.includes('final') || nameLower.includes('mix')) {
      return 'master_audio'
    }
    
    // Check if it's a sample
    if (nameLower.includes('sample') || nameLower.includes('loop') || nameLower.includes('one-shot')) {
      return 'sample'
    }
    
    // Default to master audio if no other indicators
    return 'master_audio'
  }
  
  // MIDI
  if (ext === '.mid' || ext === '.midi') return 'midi'
  
  // Presets
  if (['.fxp', '.fxb', '.vstpreset', '.nksf', '.pst', '.h2p'].includes(ext)) {
    return 'preset'
  }
  
  // Video
  if (['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
    return 'video'
  }
  
  // Artwork
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.psd', '.ai'].includes(ext)) {
    return 'artwork'
  }
  
  // Documents
  if (['.pdf', '.txt', '.doc', '.docx', '.rtf', '.md'].includes(ext)) {
    return 'document'
  }
  
  return 'other'
}

/**
 * Extract base name from filename (remove extensions and common suffixes)
 */
export function extractBaseName(filename: string): string {
  // Remove extension
  let base = filename.replace(/\.[^/.]+$/, '')
  
  // Remove common suffixes
  const suffixes = [
    '_master', '_final', '_mix', '_v1', '_v2', '_v3', '_demo', '_rough',
    ' master', ' final', ' mix', ' v1', ' v2', ' v3', ' demo', ' rough',
    '(master)', '(final)', '(mix)', '(demo)', '(rough)',
    '-master', '-final', '-mix', '-demo', '-rough'
  ]
  
  for (const suffix of suffixes) {
    base = base.replace(new RegExp(suffix + '$', 'i'), '')
  }
  
  // Remove trailing numbers and underscores
  base = base.replace(/[_\-\s]+\d+$/, '')
  
  return base.trim()
}

/**
 * Calculate similarity between two strings (0-1)
 */
function similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2
  const shorter = s1.length > s2.length ? s2 : s1
  
  if (longer.length === 0) return 1.0
  
  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

/**
 * Levenshtein distance algorithm
 */
function levenshteinDistance(s1: string, s2: string): number {
  const costs: number[] = []
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j
      } else if (j > 0) {
        let newValue = costs[j - 1]
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
        }
        costs[j - 1] = lastValue
        lastValue = newValue
      }
    }
    if (i > 0) costs[s2.length] = lastValue
  }
  return costs[s2.length]
}

/**
 * Group files intelligently based on naming patterns and types
 */
export function organizeFiles(files: OrganizedFile[]): FileGroup[] {
  const groups: FileGroup[] = []
  const processed = new Set<string>()
  
  // First pass: Find DAW sessions and group related files
  const sessions = files.filter(f => f.category === 'daw_session')
  
  for (const session of sessions) {
    if (processed.has(session.name)) continue
    
    const baseName = extractBaseName(session.name)
    const relatedFiles: OrganizedFile[] = []
    
    // Find files with similar names
    for (const file of files) {
      if (file.name === session.name) continue
      if (processed.has(file.name)) continue
      
      const fileBase = extractBaseName(file.name)
      const sim = similarity(baseName.toLowerCase(), fileBase.toLowerCase())
      
      // If similarity > 70%, consider it related
      if (sim > 0.7) {
        relatedFiles.push(file)
        processed.add(file.name)
      }
    }
    
    processed.add(session.name)
    
    // Calculate metadata
    const totalSize = [session, ...relatedFiles].reduce((sum, f) => sum + f.size, 0)
    const hasAudio = relatedFiles.some(f => f.category === 'master_audio')
    const hasStems = relatedFiles.some(f => f.category === 'stem')
    
    groups.push({
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: baseName,
      type: 'project',
      primaryFile: session,
      relatedFiles,
      metadata: {
        totalSize,
        fileCount: relatedFiles.length + 1,
        hasSession: true,
        hasAudio,
        hasStems,
      }
    })
  }
  
  // Second pass: Group remaining audio files by name similarity
  const remainingAudio = files.filter(f => 
    !processed.has(f.name) && 
    (f.category === 'master_audio' || f.category === 'stem')
  )
  
  const audioGroups: Map<string, OrganizedFile[]> = new Map()
  
  for (const audio of remainingAudio) {
    const baseName = extractBaseName(audio.name)
    let foundGroup = false
    
    // Try to match with existing groups
    for (const [groupName, groupFiles] of audioGroups.entries()) {
      const sim = similarity(baseName.toLowerCase(), groupName.toLowerCase())
      if (sim > 0.8) {
        groupFiles.push(audio)
        processed.add(audio.name)
        foundGroup = true
        break
      }
    }
    
    // Create new group if no match found
    if (!foundGroup) {
      audioGroups.set(baseName, [audio])
      processed.add(audio.name)
    }
  }
  
  // Convert audio groups to FileGroups
  for (const [name, groupFiles] of audioGroups.entries()) {
    if (groupFiles.length === 0) continue
    
    const primaryFile = groupFiles.find(f => f.category === 'master_audio') || groupFiles[0]
    const relatedFiles = groupFiles.filter(f => f !== primaryFile)
    
    const totalSize = groupFiles.reduce((sum, f) => sum + f.size, 0)
    const hasStems = groupFiles.some(f => f.category === 'stem')
    
    groups.push({
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      type: groupFiles.length > 1 ? 'project' : 'standalone',
      primaryFile,
      relatedFiles,
      metadata: {
        totalSize,
        fileCount: groupFiles.length,
        hasSession: false,
        hasAudio: true,
        hasStems,
      }
    })
  }
  
  // Third pass: Add remaining files as standalone
  const remaining = files.filter(f => !processed.has(f.name))
  
  for (const file of remaining) {
    groups.push({
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: extractBaseName(file.name),
      type: 'standalone',
      primaryFile: file,
      relatedFiles: [],
      metadata: {
        totalSize: file.size,
        fileCount: 1,
        hasSession: file.category === 'daw_session',
        hasAudio: file.category === 'master_audio',
        hasStems: file.category === 'stem',
      }
    })
  }
  
  return groups
}

/**
 * Get file extension including the dot
 */
function getExtension(filename: string): string {
  const match = filename.match(/\.[^/.]+$/)
  return match ? match[0] : ''
}

/**
 * Get DAW name from extension
 */
export function getDAWName(filename: string): string | null {
  const ext = getExtension(filename).toLowerCase()
  return DAW_EXTENSIONS[ext as keyof typeof DAW_EXTENSIONS] || null
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get icon for file category
 */
export function getCategoryIcon(category: FileCategory): string {
  const icons: Record<FileCategory, string> = {
    daw_session: '🎛️',
    master_audio: '🎵',
    stem: '🎚️',
    midi: '🎹',
    preset: '⚙️',
    sample: '🔊',
    video: '🎬',
    artwork: '🖼️',
    document: '📄',
    other: '📁',
  }
  return icons[category]
}

/**
 * Get color for file category (Tailwind classes)
 */
export function getCategoryColor(category: FileCategory): string {
  const colors: Record<FileCategory, string> = {
    daw_session: 'text-purple-400',
    master_audio: 'text-green-400',
    stem: 'text-blue-400',
    midi: 'text-yellow-400',
    preset: 'text-orange-400',
    sample: 'text-pink-400',
    video: 'text-red-400',
    artwork: 'text-cyan-400',
    document: 'text-gray-400',
    other: 'text-gray-500',
  }
  return colors[category]
}
