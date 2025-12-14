/**
 * File Grouping & Analysis
 * Auto-groups uploaded files into projects based on filename heuristics
 */

import {
  AssetType,
  ProposedProject,
  ProposedAsset,
  AUDIO_EXTENSIONS,
  DAW_EXTENSIONS,
  ARCHIVE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  STEM_KEYWORDS,
  VERSION_PATTERNS,
} from '@/types/sessionVault'

interface FileInfo {
  filename: string
  extension: string
  sizeBytes: number
  basename: string
  cleanBasename: string
}

/**
 * Classify file extension to AssetType
 */
export function classifyFileType(extension: string, filename: string): AssetType {
  const ext = extension.toLowerCase()
  const nameLower = filename.toLowerCase()
  
  // DAW sessions
  if (DAW_EXTENSIONS.includes(ext)) {
    return 'DAW_SESSION'
  }
  
  // Documents
  if (DOCUMENT_EXTENSIONS.includes(ext)) {
    return 'DOCUMENT'
  }
  
  // Archives
  if (ARCHIVE_EXTENSIONS.includes(ext)) {
    return 'OTHER'
  }
  
  // Audio files
  if (AUDIO_EXTENSIONS.includes(ext)) {
    // Check if it's a stem
    const isStem = STEM_KEYWORDS.some(keyword => 
      nameLower.includes(`_${keyword}`) || 
      nameLower.includes(`-${keyword}`) ||
      nameLower.includes(` ${keyword}`)
    )
    
    if (isStem) {
      return 'STEM'
    }
    
    // Check for alt bounce indicators
    if (nameLower.includes('_alt') || nameLower.includes('_v') || nameLower.includes('_version')) {
      return 'ALT_BOUNCE'
    }
    
    // Check for reference indicators
    if (nameLower.includes('_ref') || nameLower.includes('_reference') || nameLower.includes('_inspo')) {
      return 'REFERENCE'
    }
    
    // Default to master audio
    return 'MASTER_AUDIO'
  }
  
  return 'OTHER'
}

/**
 * Clean basename by removing version suffixes and common patterns
 */
export function cleanBasename(basename: string): string {
  let cleaned = basename
  
  // Remove version patterns
  VERSION_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })
  
  // Remove stem keywords
  STEM_KEYWORDS.forEach(keyword => {
    const patterns = [
      new RegExp(`_${keyword}$`, 'i'),
      new RegExp(`-${keyword}$`, 'i'),
      new RegExp(` ${keyword}$`, 'i'),
    ]
    patterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '')
    })
  })
  
  // Trim and normalize
  cleaned = cleaned.trim().replace(/[_-]+$/, '').replace(/^[_-]+/, '')
  
  return cleaned
}

/**
 * Humanize basename to title
 */
export function humanizeTitle(basename: string): string {
  return basename
    .split(/[_-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim()
}

/**
 * Parse file information
 */
export function parseFileInfo(file: File): FileInfo {
  const filename = file.name
  const lastDot = filename.lastIndexOf('.')
  const extension = lastDot > 0 ? filename.slice(lastDot + 1) : ''
  const basename = lastDot > 0 ? filename.slice(0, lastDot) : filename
  const cleaned = cleanBasename(basename)
  
  return {
    filename,
    extension,
    sizeBytes: file.size,
    basename,
    cleanBasename: cleaned.toLowerCase(),
  }
}

/**
 * Group files into proposed projects
 */
export function groupFilesIntoProjects(files: File[]): ProposedProject[] {
  // Parse all files
  const fileInfos = files.map(file => ({
    file,
    info: parseFileInfo(file),
  }))
  
  // Group by clean basename
  const groups = new Map<string, typeof fileInfos>()
  
  fileInfos.forEach(({ file, info }) => {
    const groupKey = info.cleanBasename || 'untitled'
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, [])
    }
    groups.get(groupKey)!.push({ file, info })
  })
  
  // Build proposed projects
  const proposedProjects: ProposedProject[] = []
  
  groups.forEach((groupFiles, groupKey) => {
    const assets: ProposedAsset[] = groupFiles.map(({ file, info }) => {
      const type = classifyFileType(info.extension, info.filename)
      
      return {
        filename: info.filename,
        extension: info.extension,
        sizeBytes: info.sizeBytes,
        type,
        isPrimary: false, // Will be set below
      }
    })
    
    // Determine primary asset (first MASTER_AUDIO, or first audio, or first file)
    let primaryIndex = assets.findIndex(a => a.type === 'MASTER_AUDIO')
    if (primaryIndex === -1) {
      primaryIndex = assets.findIndex(a => AUDIO_EXTENSIONS.includes(a.extension.toLowerCase()))
    }
    if (primaryIndex === -1) {
      primaryIndex = 0
    }
    if (assets[primaryIndex]) {
      assets[primaryIndex].isPrimary = true
    }
    
    // Detect characteristics
    const hasStems = assets.some(a => a.type === 'STEM')
    const hasSession = assets.some(a => a.type === 'DAW_SESSION')
    
    // Generate fake analysis for now
    const detectedBpm = Math.floor(Math.random() * 80) + 80 // 80-160
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const modes = ['maj', 'min']
    const detectedKey = `${keys[Math.floor(Math.random() * keys.length)]} ${modes[Math.floor(Math.random() * modes.length)]}`
    const genres = ['Trap', 'Hip-Hop', 'R&B', 'Pop', 'Electronic', 'Drill', 'Boom Bap', 'Lo-Fi']
    const detectedGenre = genres[Math.floor(Math.random() * genres.length)]
    
    proposedProjects.push({
      groupKey,
      title: humanizeTitle(groupKey),
      assets,
      detectedBpm,
      detectedKey,
      detectedGenre,
      hasStems,
      hasSession,
    })
  })
  
  // Sort by number of files (larger projects first)
  proposedProjects.sort((a, b) => b.assets.length - a.assets.length)
  
  return proposedProjects
}

/**
 * Analyze audio file (stub for now)
 */
export async function analyzeAudio(audioUrl: string): Promise<{
  bpm?: number
  key?: string
  genre?: string
  mood?: string
  durationSec?: number
}> {
  // In production, this would call Cyanite or audio analysis service
  // For now, return fake data
  
  return {
    bpm: Math.floor(Math.random() * 80) + 80,
    key: ['C maj', 'D min', 'G maj', 'A min', 'E min'][Math.floor(Math.random() * 5)],
    genre: ['Trap', 'Hip-Hop', 'R&B', 'Drill'][Math.floor(Math.random() * 4)],
    mood: ['Dark', 'Energetic', 'Chill', 'Aggressive'][Math.floor(Math.random() * 4)],
    durationSec: Math.floor(Math.random() * 180) + 60,
  }
}
