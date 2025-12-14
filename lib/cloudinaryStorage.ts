/**
 * Cloudinary Storage Integration
 * Handles file uploads to Cloudinary for public URL generation
 */

import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  url: string
  publicId: string
  format: string
  duration?: number
  bytes: number
}

/**
 * Upload audio file to Cloudinary
 * Returns public URL for Cyanite analysis
 */
export async function uploadAudioToCloudinary(
  file: File,
  userId: string
): Promise<UploadResult> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Generate unique public ID
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const publicId = `noculture/audio/${userId}/${timestamp}_${sanitizedName}`
    
    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Audio files use 'video' resource type
          public_id: publicId,
          folder: `noculture/audio/${userId}`,
          overwrite: false,
          // Audio-specific options
          audio_codec: 'mp3',
          format: 'mp3',
        },
        (error, result) => {
          if (error) {
            console.error('[CLOUDINARY] Upload error:', error)
            reject(error)
          } else {
            resolve(result)
          }
        }
      )
      
      uploadStream.end(buffer)
    })
    
    console.log('[CLOUDINARY] Upload successful:', {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      bytes: result.bytes,
    })
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      duration: result.duration,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('[CLOUDINARY] Upload failed:', error)
    throw new Error(`Failed to upload to Cloudinary: ${error}`)
  }
}

/**
 * Delete audio file from Cloudinary
 */
export async function deleteAudioFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    })
    
    console.log('[CLOUDINARY] Delete result:', result)
    return result.result === 'ok'
  } catch (error) {
    console.error('[CLOUDINARY] Delete failed:', error)
    return false
  }
}

/**
 * Get audio file info from Cloudinary
 */
export async function getAudioInfo(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'video',
    })
    
    return {
      url: result.secure_url,
      duration: result.duration,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at,
    }
  } catch (error) {
    console.error('[CLOUDINARY] Get info failed:', error)
    return null
  }
}

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

/**
 * Generate thumbnail URL for audio (waveform image)
 */
export function getAudioThumbnail(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      { width: 600, height: 100, crop: 'fill' },
      { flags: 'waveform' },
    ],
  })
}
