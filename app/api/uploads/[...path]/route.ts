import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Serve uploaded files from temporary storage
 * This is a fallback for when Cloudinary upload fails
 */

// In-memory storage for uploaded files (temporary)
const fileStorage = new Map<string, Buffer>()

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/')
    const fullPath = `/uploads/${filePath}`
    
    console.log('[UPLOADS] Serving file:', fullPath)
    
    // Check in-memory storage first
    if (fileStorage.has(fullPath)) {
      const buffer = fileStorage.get(fullPath)!
      
      // Determine content type based on extension
      const ext = path.extname(filePath).toLowerCase()
      const contentType = getContentType(ext)
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000',
        },
      })
    }
    
    // File not found
    console.error('[UPLOADS] File not found:', fullPath)
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('[UPLOADS] Error serving file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Store uploaded file in memory
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const filePath = formData.get('path') as string
    
    if (!file || !filePath) {
      return NextResponse.json(
        { error: 'Missing file or path' },
        { status: 400 }
      )
    }
    
    // Convert to buffer and store
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    fileStorage.set(filePath, buffer)
    
    console.log('[UPLOADS] Stored file:', filePath, 'Size:', buffer.length)
    
    return NextResponse.json({
      success: true,
      path: filePath,
      size: buffer.length,
    })
  } catch (error) {
    console.error('[UPLOADS] Error storing file:', error)
    return NextResponse.json(
      { error: 'Failed to store file' },
      { status: 500 }
    )
  }
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
    '.ogg': 'audio/ogg',
    '.aac': 'audio/aac',
  }
  return types[ext] || 'application/octet-stream'
}

// Export the storage for use in other routes
export { fileStorage }
