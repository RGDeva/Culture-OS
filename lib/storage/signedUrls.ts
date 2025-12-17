/**
 * Storage Service - S3/R2 Signed URL Generation
 * 
 * Generates time-limited signed URLs for secure asset downloads.
 * Supports both AWS S3 and Cloudflare R2.
 */

import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Storage configuration
const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local'
const STORAGE_BUCKET = process.env.STORAGE_BUCKET
const STORAGE_REGION = process.env.STORAGE_REGION || 'us-east-1'
const STORAGE_ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID
const STORAGE_SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY
const STORAGE_PUBLIC_BASE_URL = process.env.STORAGE_PUBLIC_BASE_URL

// Default signed URL expiration: 1 hour
const DEFAULT_EXPIRATION_SECONDS = 3600

// Initialize S3/R2 client (singleton)
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (s3Client) return s3Client

  if (!STORAGE_ACCESS_KEY_ID || !STORAGE_SECRET_ACCESS_KEY) {
    throw new Error('Storage credentials not configured')
  }

  // For Cloudflare R2, use custom endpoint
  const endpoint = STORAGE_PROVIDER === 'r2' 
    ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined

  s3Client = new S3Client({
    region: STORAGE_REGION,
    credentials: {
      accessKeyId: STORAGE_ACCESS_KEY_ID,
      secretAccessKey: STORAGE_SECRET_ACCESS_KEY
    },
    ...(endpoint && { endpoint })
  })

  return s3Client
}

/**
 * Generate signed URL for asset download
 * 
 * @param storageKey - S3/R2 object key
 * @param fileName - Original filename for Content-Disposition header
 * @param mimeType - MIME type for Content-Type header
 * @param expirationSeconds - URL expiration time (default 1 hour)
 * @returns Signed URL
 */
export async function generateSignedDownloadUrl(
  storageKey: string,
  fileName: string,
  mimeType?: string,
  expirationSeconds: number = DEFAULT_EXPIRATION_SECONDS
): Promise<string> {
  // For local storage, return direct URL
  if (STORAGE_PROVIDER === 'local') {
    return `${STORAGE_PUBLIC_BASE_URL || 'http://localhost:3000'}/${storageKey}`
  }

  if (!STORAGE_BUCKET) {
    throw new Error('STORAGE_BUCKET not configured')
  }

  try {
    const client = getS3Client()

    const command = new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: storageKey,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
      ...(mimeType && { ResponseContentType: mimeType })
    })

    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: expirationSeconds
    })

    console.log(`[Storage] Generated signed URL for ${storageKey} (expires in ${expirationSeconds}s)`)

    return signedUrl
  } catch (error) {
    console.error('[Storage] Failed to generate signed URL:', error)
    throw new Error('Failed to generate download URL')
  }
}

/**
 * Generate signed URL for streaming (with range support)
 * 
 * @param storageKey - S3/R2 object key
 * @param mimeType - MIME type for Content-Type header
 * @param expirationSeconds - URL expiration time
 * @returns Signed URL
 */
export async function generateSignedStreamUrl(
  storageKey: string,
  mimeType?: string,
  expirationSeconds: number = DEFAULT_EXPIRATION_SECONDS
): Promise<string> {
  // For local storage, return direct URL
  if (STORAGE_PROVIDER === 'local') {
    return `${STORAGE_PUBLIC_BASE_URL || 'http://localhost:3000'}/${storageKey}`
  }

  if (!STORAGE_BUCKET) {
    throw new Error('STORAGE_BUCKET not configured')
  }

  try {
    const client = getS3Client()

    const command = new GetObjectCommand({
      Bucket: STORAGE_BUCKET,
      Key: storageKey,
      ...(mimeType && { ResponseContentType: mimeType })
    })

    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: expirationSeconds
    })

    console.log(`[Storage] Generated signed stream URL for ${storageKey}`)

    return signedUrl
  } catch (error) {
    console.error('[Storage] Failed to generate signed stream URL:', error)
    throw new Error('Failed to generate stream URL')
  }
}

/**
 * Validate storage configuration
 * 
 * @returns True if storage is properly configured
 */
export function isStorageConfigured(): boolean {
  if (STORAGE_PROVIDER === 'local') {
    return true
  }

  return !!(
    STORAGE_BUCKET &&
    STORAGE_ACCESS_KEY_ID &&
    STORAGE_SECRET_ACCESS_KEY
  )
}

/**
 * Get storage provider info
 */
export function getStorageInfo() {
  return {
    provider: STORAGE_PROVIDER,
    bucket: STORAGE_BUCKET,
    region: STORAGE_REGION,
    configured: isStorageConfigured()
  }
}
