import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/works - list works for current user
export async function GET(request: NextRequest) {
  try {
    // TODO: Get current user from Privy session
    // For now, using a mock user ID from query param
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // Get works where user is owner OR appears in split parties
    const ownedWorks = await prisma.work.findMany({
      where: { ownerId: userId },
      include: {
        splitSheet: {
          include: {
            parties: true,
            shares: true,
          },
        },
        earnings: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get works where user is a split party
    const collaboratorWorks = await prisma.work.findMany({
      where: {
        splitSheet: {
          parties: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        splitSheet: {
          include: {
            parties: true,
            shares: true,
          },
        },
        earnings: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Combine and deduplicate
    const allWorks = [...ownedWorks]
    const ownedWorkIds = new Set(ownedWorks.map(w => w.id))
    
    for (const work of collaboratorWorks) {
      if (!ownedWorkIds.has(work.id)) {
        allWorks.push(work)
      }
    }

    return NextResponse.json({ works: allWorks })
  } catch (error) {
    console.error('[WORKS] Error fetching works:', error)
    return NextResponse.json(
      { error: 'Failed to fetch works' },
      { status: 500 }
    )
  }
}

// POST /api/works - create a new work
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, status, vaultAssetIds, ownerId, isrc, iswc, releaseDate, label, distributor, spotifyUrl, appleMusicUrl } = body

    if (!title || !ownerId) {
      return NextResponse.json(
        { error: 'Title and ownerId are required' },
        { status: 400 }
      )
    }

    // Create work
    const work = await prisma.work.create({
      data: {
        title,
        status: status || 'IDEA',
        ownerId,
        vaultAssetIds: JSON.stringify(vaultAssetIds || []),
        isrc,
        iswc,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        label,
        distributor,
        spotifyUrl,
        appleMusicUrl,
      },
      include: {
        splitSheet: true,
        earnings: true,
      },
    })

    return NextResponse.json({ work }, { status: 201 })
  } catch (error: any) {
    console.error('[WORKS] Error creating work:', error)
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'ISRC must be unique' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create work' },
      { status: 500 }
    )
  }
}
