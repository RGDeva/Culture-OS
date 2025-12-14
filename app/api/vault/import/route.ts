import { NextRequest, NextResponse } from 'next/server'
import { groupFilesIntoProjects } from '@/lib/fileGrouping'
import { ImportReviewPayload } from '@/types/sessionVault'

/**
 * POST /api/vault/import
 * Receives multiple files, groups them into proposed projects
 * Returns a review payload for user confirmation
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const userId = formData.get('userId') as string
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }
    
    // Extract all files
    const files: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && value instanceof File) {
        files.push(value)
      }
    }
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }
    
    console.log(`[VAULT_IMPORT] Processing ${files.length} files for user ${userId}`)
    
    // Group files into proposed projects
    const proposedProjects = groupFilesIntoProjects(files)
    
    // Calculate totals
    const totalSize = files.reduce((sum, file) => sum + file.size, 0)
    
    const payload: ImportReviewPayload = {
      proposedProjects,
      totalFiles: files.length,
      totalSize,
    }
    
    console.log(`[VAULT_IMPORT] Grouped into ${proposedProjects.length} projects`)
    
    // Store files temporarily (in production, upload to cloud storage)
    // For now, we'll handle file upload in the commit step
    // Store the formData in a temporary cache with a session ID
    const sessionId = `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // In production, you'd store files in temporary storage here
    // For now, we'll just return the payload and handle upload on commit
    
    return NextResponse.json({
      ...payload,
      sessionId,
    })
  } catch (error: any) {
    console.error('[VAULT_IMPORT] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process import' },
      { status: 500 }
    )
  }
}
