import { NextRequest, NextResponse } from 'next/server'
import { createAsset } from '@/lib/vaultStoreV2'
import {
  inferAssetType,
  extractTitleFromFilename,
  isValidAudioFile,
  detectProductCategory,
} from '@/lib/audioUtils'
import { UserRole } from '@/types/vault'
import { createCyaniteTrackAnalysis } from '@/lib/cyanite'
import { uploadAudioToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinaryStorage'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string
    const userRolesStr = formData.get('userRoles') as string
    
    if (!file || !userId || !userRolesStr) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!isValidAudioFile(file.name)) {
      return NextResponse.json(
        { error: 'Invalid audio file type' },
        { status: 400 }
      )
    }
    
    const userRoles: UserRole[] = JSON.parse(userRolesStr)
    
    // Extract metadata
    const title = extractTitleFromFilename(file.name)
    const assetType = inferAssetType(file.name, userRoles)
    
    // Upload to Cloudinary if configured, otherwise use mock URL
    let fileUrl: string
    let cloudinaryPublicId: string | undefined
    let cloudinaryDuration: number | undefined
    
    if (isCloudinaryConfigured()) {
      console.log('[VAULT_UPLOAD] Uploading to Cloudinary...')
      try {
        const uploadResult = await uploadAudioToCloudinary(file, userId)
        fileUrl = uploadResult.url
        cloudinaryPublicId = uploadResult.publicId
        cloudinaryDuration = uploadResult.duration
        console.log('[VAULT_UPLOAD] Cloudinary upload successful:', fileUrl)
      } catch (error) {
        console.error('[VAULT_UPLOAD] Cloudinary upload failed, storing locally:', error)
        
        // Save file to public/uploads folder so it can be served directly
        try {
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          
          // Sanitize filename and create path
          const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, '_')
          const timestamp = Date.now()
          const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const relativePath = `/uploads/${sanitizedUserId}/${timestamp}_${sanitizedFilename}`
          
          // Create directory if needed
          const uploadDir = path.join(process.cwd(), 'public', 'uploads', sanitizedUserId)
          await mkdir(uploadDir, { recursive: true })
          
          // Write file
          const filePath = path.join(process.cwd(), 'public', relativePath)
          await writeFile(filePath, buffer)
          
          fileUrl = relativePath
          console.log('[VAULT_UPLOAD] File saved to public folder:', fileUrl)
        } catch (storeError) {
          console.error('[VAULT_UPLOAD] Failed to store file locally:', storeError)
          fileUrl = `/uploads/error_${Date.now()}.wav`
        }
      }
    } else {
      console.log('[VAULT_UPLOAD] Cloudinary not configured, storing locally')
      
      // Save file to public/uploads folder so it can be served directly
      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        
        // Sanitize filename and create path
        const sanitizedUserId = userId.replace(/[^a-zA-Z0-9]/g, '_')
        const timestamp = Date.now()
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const relativePath = `/uploads/${sanitizedUserId}/${timestamp}_${sanitizedFilename}`
        
        // Create directory if needed
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', sanitizedUserId)
        await mkdir(uploadDir, { recursive: true })
        
        // Write file
        const filePath = path.join(process.cwd(), 'public', relativePath)
        await writeFile(filePath, buffer)
        
        fileUrl = relativePath
        console.log('[VAULT_UPLOAD] File saved to public folder:', fileUrl)
      } catch (storeError) {
        console.error('[VAULT_UPLOAD] Failed to store file locally:', storeError)
        fileUrl = `/uploads/error_${Date.now()}.wav`
      }
    }
    
    // Auto-detect product category
    const productCategory = detectProductCategory(file.name, cloudinaryDuration) as any
    
    // Note: Audio metadata (duration, sample rate, BPM) will be parsed client-side
    // and sent in a follow-up request, or extracted by Cyanite analysis
    
    // Create asset
    const asset = createAsset({
      ownerId: userId,
      ownerRoles: userRoles,
      title,
      fileUrl,
      assetType,
      productCategory,
      status: 'IDEA',
      fileSize: file.size,
      duration: cloudinaryDuration, // From Cloudinary if available
      sampleRate: undefined, // Will be updated after client-side parsing
      moodTags: [],
      cyaniteStatus: 'PENDING', // Mark as pending analysis
      isForSale: false,
    })
    
    console.log('[VAULT_UPLOAD] Created asset:', asset.id)
    
    // Queue AI-powered analysis (Mansuba + Cyanite) for real URLs
    const isRealUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://')
    if (isRealUrl) {
      // Fire-and-forget: Queue analysis in background
      const origin = request.headers.get('origin') || 'http://localhost:3000'
      
      fetch(`${origin}/api/analysis/queue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id })
      })
        .then(async (response) => {
          if (response.ok) {
            const data = await response.json()
            console.log('[VAULT_UPLOAD] AI analysis queued:', data.analysis?.id)
          } else {
            console.warn('[VAULT_UPLOAD] Failed to queue analysis:', response.status)
          }
        })
        .catch((error) => {
          console.error('[VAULT_UPLOAD] Error queueing analysis:', error)
        })
      
      console.log('[VAULT_UPLOAD] AI analysis queued for asset:', asset.id)
    } else {
      console.log('[VAULT_UPLOAD] Skipping AI analysis (mock URL, need real Cloudinary URL)')
    }
    
    return NextResponse.json({ asset }, { status: 201 })
  } catch (error: any) {
    console.error('[VAULT_UPLOAD] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}
