import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject } from '@/lib/sessionVaultStore'

/**
 * POST /api/vault/list-on-marketplace
 * List a project on the marketplace
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      projectId, 
      price, 
      priceType = 'LEASE', // 'LEASE' | 'EXCLUSIVE' | 'FREE'
      description,
      tags,
      allowDownload = false,
      allowStreaming = true,
    } = body
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }
    
    const project = getProject(projectId)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Create marketplace listing
    const marketplaceListing = {
      id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      title: project.title,
      description: description || project.notes || '',
      price: price || 0,
      priceType,
      tags: tags || project.tags || [],
      bpm: project.bpm,
      key: project.key,
      genre: project.genre,
      mood: project.mood,
      allowDownload,
      allowStreaming,
      listedAt: new Date().toISOString(),
      status: 'ACTIVE', // 'ACTIVE' | 'SOLD' | 'REMOVED'
    }
    
    // Update project status
    const updated = updateProject(projectId, {
      status: 'READY_FOR_SALE',
      notes: `${project.notes || ''}\n\nMarketplace Listing ID: ${marketplaceListing.id}`.trim(),
    })
    
    console.log('[LIST_ON_MARKETPLACE] Created listing:', marketplaceListing.id, 'for project:', projectId)
    
    // In a real app, you'd save this to a marketplace_listings table
    // For now, we'll return the listing data
    
    return NextResponse.json({
      success: true,
      listing: marketplaceListing,
      project: updated,
    })
  } catch (error: any) {
    console.error('[LIST_ON_MARKETPLACE] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list on marketplace' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/vault/list-on-marketplace?projectId=xxx
 * Check if a project is listed on marketplace
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing projectId' },
        { status: 400 }
      )
    }
    
    const project = getProject(projectId)
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Check if project has marketplace listing
    const isListed = project.status === 'READY_FOR_SALE' || project.status === 'PLACED'
    const listingIdMatch = project.notes?.match(/Marketplace Listing ID: (listing_[\w]+)/)
    const listingId = listingIdMatch?.[1]
    
    return NextResponse.json({
      isListed,
      listingId,
      projectStatus: project.status,
    })
  } catch (error: any) {
    console.error('[LIST_ON_MARKETPLACE] GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check listing status' },
      { status: 500 }
    )
  }
}
