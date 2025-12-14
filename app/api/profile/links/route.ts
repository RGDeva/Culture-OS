import { NextRequest, NextResponse } from 'next/server'
import { ProfileLink } from '@/types/profile-links'

// In-memory store for profile links (replace with database in production)
const profileLinks = new Map<string, ProfileLink[]>()

// GET /api/profile/links - Get user's profile links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }
    
    const links = profileLinks.get(userId) || []
    return NextResponse.json({ links })
  } catch (error: any) {
    console.error('[PROFILE_LINKS] GET Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get links' },
      { status: 500 }
    )
  }
}

// POST /api/profile/links - Add a new profile link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      platform,
      platformId,
      url,
      displayName,
      imageUrl,
      verified,
      isPrimary,
      metadata,
    } = body
    
    if (!userId || !platform || !url || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const userLinks = profileLinks.get(userId) || []
    
    // Check if link already exists
    const existingLink = userLinks.find(
      link => link.platform === platform && link.platformId === platformId
    )
    
    if (existingLink) {
      return NextResponse.json(
        { error: 'Link already exists' },
        { status: 400 }
      )
    }
    
    // If this is set as primary, unset other primary links for this platform
    if (isPrimary) {
      userLinks.forEach(link => {
        if (link.platform === platform) {
          link.isPrimary = false
        }
      })
    }
    
    const newLink: ProfileLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      platform,
      platformId: platformId || url,
      url,
      displayName,
      imageUrl,
      verified: verified || false,
      isPrimary: isPrimary || false,
      createdAt: new Date().toISOString(),
      metadata,
    }
    
    userLinks.push(newLink)
    profileLinks.set(userId, userLinks)
    
    console.log(`[PROFILE_LINKS] Added ${platform} link for user ${userId}`)
    
    return NextResponse.json({ link: newLink }, { status: 201 })
  } catch (error: any) {
    console.error('[PROFILE_LINKS] POST Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to add link' },
      { status: 500 }
    )
  }
}

// DELETE /api/profile/links - Remove a profile link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const linkId = searchParams.get('linkId')
    
    if (!userId || !linkId) {
      return NextResponse.json(
        { error: 'User ID and link ID required' },
        { status: 400 }
      )
    }
    
    const userLinks = profileLinks.get(userId) || []
    const filteredLinks = userLinks.filter(link => link.id !== linkId)
    
    if (filteredLinks.length === userLinks.length) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }
    
    profileLinks.set(userId, filteredLinks)
    
    console.log(`[PROFILE_LINKS] Removed link ${linkId} for user ${userId}`)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[PROFILE_LINKS] DELETE Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete link' },
      { status: 500 }
    )
  }
}

// PATCH /api/profile/links - Update a profile link (e.g., set as primary)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, linkId, updates } = body
    
    if (!userId || !linkId) {
      return NextResponse.json(
        { error: 'User ID and link ID required' },
        { status: 400 }
      )
    }
    
    const userLinks = profileLinks.get(userId) || []
    const linkIndex = userLinks.findIndex(link => link.id === linkId)
    
    if (linkIndex === -1) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
    }
    
    // If setting as primary, unset other primary links for this platform
    if (updates.isPrimary) {
      const platform = userLinks[linkIndex].platform
      userLinks.forEach((link, idx) => {
        if (link.platform === platform && idx !== linkIndex) {
          link.isPrimary = false
        }
      })
    }
    
    userLinks[linkIndex] = {
      ...userLinks[linkIndex],
      ...updates,
    }
    
    profileLinks.set(userId, userLinks)
    
    console.log(`[PROFILE_LINKS] Updated link ${linkId} for user ${userId}`)
    
    return NextResponse.json({ link: userLinks[linkIndex] })
  } catch (error: any) {
    console.error('[PROFILE_LINKS] PATCH Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update link' },
      { status: 500 }
    )
  }
}
