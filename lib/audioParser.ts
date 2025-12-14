/**
 * Audio Parser - Extract real metadata from audio files
 * Supports: MP3, WAV, FLAC, M4A, AIFF
 */

export interface AudioMetadata {
  duration: number // in seconds
  sampleRate: number // in Hz
  bitrate?: number // in kbps
  channels: number // 1 = mono, 2 = stereo
  format: string // 'mp3', 'wav', etc.
  title?: string
  artist?: string
  album?: string
  year?: number
  genre?: string
  bpm?: number
  key?: string
}

/**
 * Parse audio file and extract metadata
 * Uses Web Audio API for browser-based parsing
 */
export async function parseAudioFile(file: File): Promise<AudioMetadata> {
  const format = getAudioFormat(file.name)
  
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Read file as array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Decode audio data
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Estimate BPM using autocorrelation
    const estimatedBPM = await estimateBPM(audioBuffer)
    
    // Extract basic metadata
    const metadata: AudioMetadata = {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
      format,
      bpm: estimatedBPM,
    }
    
    // Try to extract ID3 tags for MP3
    if (format === 'mp3') {
      const id3Tags = await extractID3Tags(arrayBuffer)
      Object.assign(metadata, id3Tags)
    }
    
    // Calculate bitrate estimate
    metadata.bitrate = Math.round((file.size * 8) / metadata.duration / 1000)
    
    // Close audio context to free resources
    await audioContext.close()
    
    return metadata
  } catch (error) {
    console.error('[AUDIO_PARSER] Error parsing audio:', error)
    
    // Return basic metadata on error
    return {
      duration: 0,
      sampleRate: 44100,
      channels: 2,
      format,
    }
  }
}

/**
 * Extract ID3 tags from MP3 file
 */
async function extractID3Tags(arrayBuffer: ArrayBuffer): Promise<Partial<AudioMetadata>> {
  try {
    const view = new DataView(arrayBuffer)
    const tags: Partial<AudioMetadata> = {}
    
    // Check for ID3v2 header
    if (view.getUint8(0) === 0x49 && view.getUint8(1) === 0x44 && view.getUint8(2) === 0x33) {
      // ID3v2 tag found
      const version = view.getUint8(3)
      const flags = view.getUint8(5)
      
      // Get tag size (synchsafe integer)
      const size = 
        ((view.getUint8(6) & 0x7f) << 21) |
        ((view.getUint8(7) & 0x7f) << 14) |
        ((view.getUint8(8) & 0x7f) << 7) |
        (view.getUint8(9) & 0x7f)
      
      // Parse frames (simplified - would need full ID3v2 parser for production)
      let offset = 10
      const decoder = new TextDecoder('utf-8')
      
      while (offset < size + 10) {
        // Read frame ID (4 bytes)
        const frameId = String.fromCharCode(
          view.getUint8(offset),
          view.getUint8(offset + 1),
          view.getUint8(offset + 2),
          view.getUint8(offset + 3)
        )
        
        if (frameId === '\0\0\0\0') break
        
        // Read frame size
        const frameSize = view.getUint32(offset + 4)
        if (frameSize === 0) break
        
        // Skip frame flags
        offset += 10
        
        // Read frame data
        const frameData = new Uint8Array(arrayBuffer, offset, frameSize)
        const text = decoder.decode(frameData.slice(1)) // Skip encoding byte
        
        // Map common frame IDs
        switch (frameId) {
          case 'TIT2':
            tags.title = text.replace(/\0/g, '')
            break
          case 'TPE1':
            tags.artist = text.replace(/\0/g, '')
            break
          case 'TALB':
            tags.album = text.replace(/\0/g, '')
            break
          case 'TCON':
            tags.genre = text.replace(/\0/g, '')
            break
          case 'TBPM':
            tags.bpm = parseInt(text.replace(/\0/g, ''))
            break
        }
        
        offset += frameSize
      }
    }
    
    return tags
  } catch (error) {
    console.error('[AUDIO_PARSER] Error extracting ID3 tags:', error)
    return {}
  }
}

/**
 * Get audio format from filename
 */
function getAudioFormat(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return ext
}

/**
 * Generate waveform data from audio file
 */
export async function generateWaveform(file: File, samples: number = 100): Promise<number[]> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    const rawData = audioBuffer.getChannelData(0) // Use first channel
    const blockSize = Math.floor(rawData.length / samples)
    const waveform: number[] = []
    
    for (let i = 0; i < samples; i++) {
      const start = blockSize * i
      let sum = 0
      
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[start + j])
      }
      
      waveform.push(sum / blockSize)
    }
    
    // Normalize to 0-1 range
    const max = Math.max(...waveform)
    const normalized = waveform.map(v => v / max)
    
    audioContext.close()
    return normalized
  } catch (error) {
    console.error('[AUDIO_PARSER] Error generating waveform:', error)
    return Array(samples).fill(0.5)
  }
}

/**
 * Estimate BPM from audio buffer
 */
async function estimateBPM(audioBuffer: AudioBuffer): Promise<number | undefined> {
  try {
    const data = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate
    
    // Simple peak detection
    const peaks: number[] = []
    const threshold = 0.5
    const minDistance = Math.floor(sampleRate * 0.3)
    
    for (let i = minDistance; i < data.length - minDistance; i += minDistance) {
      let maxInWindow = 0
      let maxIndex = i
      
      for (let j = 0; j < minDistance && i + j < data.length; j++) {
        if (Math.abs(data[i + j]) > maxInWindow) {
          maxInWindow = Math.abs(data[i + j])
          maxIndex = i + j
        }
      }
      
      if (maxInWindow > threshold) {
        peaks.push(maxIndex)
      }
    }
    
    if (peaks.length < 2) return undefined
    
    const intervals = []
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1])
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const bpm = Math.round(60 / (avgInterval / sampleRate))
    
    return bpm >= 60 && bpm <= 200 ? bpm : undefined
  } catch (error) {
    return undefined
  }
}

/**
 * Detect BPM from audio file (simplified algorithm)
 */
export async function detectBPM(file: File): Promise<number | undefined> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    const data = audioBuffer.getChannelData(0)
    const sampleRate = audioBuffer.sampleRate
    
    // Simple peak detection algorithm
    const peaks: number[] = []
    const threshold = 0.5
    const minDistance = Math.floor(sampleRate * 0.3) // Min 300ms between peaks
    
    for (let i = minDistance; i < data.length - minDistance; i++) {
      if (Math.abs(data[i]) > threshold) {
        // Check if this is a local maximum
        let isPeak = true
        for (let j = i - minDistance; j < i + minDistance; j++) {
          if (Math.abs(data[j]) > Math.abs(data[i])) {
            isPeak = false
            break
          }
        }
        
        if (isPeak) {
          peaks.push(i)
          i += minDistance // Skip ahead
        }
      }
    }
    
    if (peaks.length < 2) {
      audioContext.close()
      return undefined
    }
    
    // Calculate average interval between peaks
    const intervals: number[] = []
    for (let i = 1; i < peaks.length; i++) {
      intervals.push(peaks[i] - peaks[i - 1])
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const bpm = Math.round(60 / (avgInterval / sampleRate))
    
    audioContext.close()
    
    // Validate BPM range (60-200 typical for music)
    return bpm >= 60 && bpm <= 200 ? bpm : undefined
  } catch (error) {
    console.error('[AUDIO_PARSER] Error detecting BPM:', error)
    return undefined
  }
}

/**
 * Create audio blob URL for playback
 */
export function createAudioURL(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke audio blob URL
 */
export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Format duration to MM:SS
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
