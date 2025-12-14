import { NextRequest, NextResponse } from 'next/server'
import { createProject, createAsset } from '@/lib/sessionVaultStore'
import { CommitImportRequest, ProjectRoleContext } from '@/types/sessionVault'
import { uploadAudioToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinaryStorage'

/**
 * POST /api/vault/commit-import
 * Commits the reviewed import, creating projects and assets
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const projectsJson = formData.get('projects') as string
    
    if (!userId || !projectsJson) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const commitRequest: CommitImportRequest = JSON.parse(projectsJson)
    
    console.log(`[VAULT_COMMIT] Creating ${commitRequest.projects.length} projects for user ${userId}`)
    
    const createdProjects = []
    
    // Process each project
    for (const projectData of commitRequest.projects) {
      // Extract files for this project from formData
      const projectFiles: Array<{ file: File; type: string; isPrimary: boolean }> = []
      
      for (const [key, value] of formData.entries()) {
        if (key.startsWith(`${projectData.groupKey}_`) && value instanceof File) {
          const metadata = formData.get(`${key}_metadata`) as string
          if (metadata) {
            const { type, isPrimary } = JSON.parse(metadata)
            projectFiles.push({ file: value, type, isPrimary })
          }
        }
      }
      
      if (projectFiles.length === 0) {
        console.warn(`[VAULT_COMMIT] No files found for project ${projectData.title}`)
        continue
      }
      
      // Create project
      const project = createProject({
        ownerUserId: userId,
        title: projectData.title,
        roleContext: projectData.roleContext,
        status: 'IDEA',
        tags: projectData.tags,
        hasStems: projectFiles.some(f => f.type === 'STEM'),
        hasSession: projectFiles.some(f => f.type === 'DAW_SESSION'),
        hasContracts: false,
        folders: [],
      })
      
      // Upload and create assets
      for (const { file, type, isPrimary } of projectFiles) {
        let fileUrl: string
        let duration: number | undefined
        
        // Upload to Cloudinary if configured
        if (isCloudinaryConfigured()) {
          try {
            const uploadResult = await uploadAudioToCloudinary(file, userId)
            fileUrl = uploadResult.url
            duration = uploadResult.duration
            console.log(`[VAULT_COMMIT] Uploaded ${file.name} to Cloudinary`)
          } catch (error) {
            console.error(`[VAULT_COMMIT] Cloudinary upload failed for ${file.name}:`, error)
            fileUrl = `/uploads/${userId}/${Date.now()}_${file.name}`
          }
        } else {
          fileUrl = `/uploads/${userId}/${Date.now()}_${file.name}`
        }
        
        // Create asset
        const asset = createAsset({
          projectId: project.id,
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          filename: file.name,
          url: fileUrl,
          type: type as any,
          extension: file.name.split('.').pop() || '',
          sizeBytes: file.size,
          durationSec: duration,
          isPrimary,
        })
        
        console.log(`[VAULT_COMMIT] Created asset ${asset.id} for project ${project.id}`)
      }
      
      createdProjects.push(project)
    }
    
    console.log(`[VAULT_COMMIT] Successfully created ${createdProjects.length} projects`)
    
    return NextResponse.json({
      success: true,
      projects: createdProjects,
    })
  } catch (error: any) {
    console.error('[VAULT_COMMIT] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to commit import' },
      { status: 500 }
    )
  }
}
