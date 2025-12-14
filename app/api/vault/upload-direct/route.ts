import { NextRequest, NextResponse } from 'next/server'
import { createProject, createAsset } from '@/lib/sessionVaultStore'
import { uploadAudioToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinaryStorage'
import { groupFilesIntoProjects } from '@/lib/fileGrouping'
import { createCyaniteTrackAnalysis, isCyaniteConfigured } from '@/lib/cyanite'
import { ProjectRoleContext, AUDIO_EXTENSIONS } from '@/types/sessionVault'

/**
 * POST /api/vault/upload-direct
 * Direct upload that groups files and creates projects in one step
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const roleContext = (formData.get('roleContext') as ProjectRoleContext) || 'PRODUCER'
    
    if (!userId) {
      console.error('[VAULT_UPLOAD_DIRECT] Missing userId')
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }
    
    // Extract all files
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value)
        console.log(`[VAULT_UPLOAD_DIRECT] Found file: ${value.name} (${value.size} bytes)`)
      }
    }
    
    if (files.length === 0) {
      console.error('[VAULT_UPLOAD_DIRECT] No files provided')
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }
    
    console.log(`[VAULT_UPLOAD_DIRECT] Processing ${files.length} files for user ${userId}`)
    
    // Group files into proposed projects
    let proposedProjects
    try {
      proposedProjects = groupFilesIntoProjects(files)
      console.log(`[VAULT_UPLOAD_DIRECT] Grouped into ${proposedProjects.length} projects`)
    } catch (groupError: any) {
      console.error('[VAULT_UPLOAD_DIRECT] Grouping error:', groupError)
      return NextResponse.json(
        { error: `Failed to group files: ${groupError.message}` },
        { status: 500 }
      )
    }
    
    console.log(`[VAULT_UPLOAD_DIRECT] Grouped into ${proposedProjects.length} projects`)
    
    const createdProjects = []
    
    // Create each project
    for (const proposed of proposedProjects) {
      // Get default tags based on role context
      const tags = []
      if (roleContext === 'PRODUCER') {
        tags.push(proposed.hasStems ? 'beat' : 'loop')
      } else if (roleContext === 'ARTIST') {
        tags.push('song_demo')
      } else if (roleContext === 'ENGINEER') {
        tags.push('mix_session')
      }
      if (proposed.hasStems) tags.push('stems')
      if (proposed.hasSession) tags.push('session')
      
      // Create project
      const project = createProject({
        ownerUserId: userId,
        title: proposed.title,
        roleContext,
        status: 'IDEA',
        bpm: proposed.detectedBpm,
        key: proposed.detectedKey,
        genre: proposed.detectedGenre,
        tags,
        hasStems: proposed.hasStems,
        hasSession: proposed.hasSession,
        hasContracts: false,
        folders: [],
        collaborators: [],
        comments: [],
      })
      
      // Upload and create assets
      for (let i = 0; i < proposed.assets.length; i++) {
        const assetInfo = proposed.assets[i]
        const file = files.find(f => f.name === assetInfo.filename)
        
        if (!file) {
          console.warn(`[VAULT_UPLOAD_DIRECT] File not found: ${assetInfo.filename}`)
          continue
        }
        
        let fileUrl: string
        let duration: number | undefined
        
        // Upload to Cloudinary if configured
        if (isCloudinaryConfigured()) {
          try {
            const uploadResult = await uploadAudioToCloudinary(file, userId)
            fileUrl = uploadResult.url
            duration = uploadResult.duration
            console.log(`[VAULT_UPLOAD_DIRECT] Uploaded ${file.name} to Cloudinary`)
          } catch (error) {
            console.error(`[VAULT_UPLOAD_DIRECT] Cloudinary upload failed for ${file.name}:`, error)
            fileUrl = `/uploads/${userId}/${Date.now()}_${file.name}`
          }
        } else {
          fileUrl = `/uploads/${userId}/${Date.now()}_${file.name}`
        }
        
        // Create asset
        const asset = createAsset({
          projectId: project.id,
          name: file.name.replace(/\.[^/.]+$/, ''),
          filename: file.name,
          url: fileUrl,
          type: assetInfo.type,
          extension: assetInfo.extension,
          sizeBytes: assetInfo.sizeBytes,
          durationSec: duration,
          isPrimary: assetInfo.isPrimary,
          modifiedAt: new Date().toISOString(),
          uploadedBy: userId,
          comments: [],
        })
        
        console.log(`[VAULT_UPLOAD_DIRECT] Created asset ${asset.id} for project ${project.id}`)
        
        // Trigger Cyanite analysis for primary audio files
        if (assetInfo.isPrimary && 
            AUDIO_EXTENSIONS.includes(assetInfo.extension.toLowerCase()) &&
            isCyaniteConfigured() &&
            fileUrl.startsWith('http')) {
          try {
            const analysisId = await createCyaniteTrackAnalysis(
              fileUrl,
              asset.id,
              project.title
            )
            if (analysisId) {
              console.log(`[VAULT_UPLOAD_DIRECT] Cyanite analysis started: ${analysisId}`)
            }
          } catch (error) {
            console.error(`[VAULT_UPLOAD_DIRECT] Cyanite analysis failed:`, error)
          }
        }
      }
      
      createdProjects.push(project)
    }
    
    console.log(`[VAULT_UPLOAD_DIRECT] Successfully created ${createdProjects.length} projects`)
    
    return NextResponse.json({
      success: true,
      projects: createdProjects,
      message: `Created ${createdProjects.length} project${createdProjects.length !== 1 ? 's' : ''} from ${files.length} files`,
    })
  } catch (error: any) {
    console.error('[VAULT_UPLOAD_DIRECT] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload files' },
      { status: 500 }
    )
  }
}
