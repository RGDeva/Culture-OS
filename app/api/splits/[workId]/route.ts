import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/splits/[workId] - get split sheet for work
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> }
) {
  try {
    const { workId } = await params

    const splitSheet = await prisma.splitSheet.findUnique({
      where: { workId },
      include: {
        parties: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
            shares: true,
          },
        },
        shares: {
          include: {
            party: true,
          },
        },
      },
    })

    if (!splitSheet) {
      return NextResponse.json(
        { error: 'Split sheet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ splitSheet })
  } catch (error) {
    console.error('[SPLITS] Error fetching split sheet:', error)
    return NextResponse.json(
      { error: 'Failed to fetch split sheet' },
      { status: 500 }
    )
  }
}

// POST /api/splits/[workId] - create split sheet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> }
) {
  try {
    const { workId } = await params
    const body = await request.json()
    const { parties, shares } = body

    if (!parties || !Array.isArray(parties)) {
      return NextResponse.json(
        { error: 'Parties array is required' },
        { status: 400 }
      )
    }

    // Validate shares sum to 100%
    if (shares && Array.isArray(shares)) {
      const masterTotal = shares.reduce((sum: number, s: any) => sum + (s.masterSharePct || 0), 0)
      const publishingTotal = shares.reduce((sum: number, s: any) => sum + (s.publishingSharePct || 0), 0)

      if (Math.abs(masterTotal - 100) > 0.01) {
        return NextResponse.json(
          { error: `Master shares must total 100% (currently ${masterTotal}%)` },
          { status: 400 }
        )
      }

      if (Math.abs(publishingTotal - 100) > 0.01) {
        return NextResponse.json(
          { error: `Publishing shares must total 100% (currently ${publishingTotal}%)` },
          { status: 400 }
        )
      }
    }

    // Create split sheet with parties and shares
    const splitSheet = await prisma.splitSheet.create({
      data: {
        workId,
        parties: {
          create: parties.map((p: any) => ({
            userId: p.userId || null,
            externalName: p.externalName,
            role: p.role,
            walletAddress: p.walletAddress,
            pro: p.pro,
            ipiCae: p.ipiCae,
            publishingEntity: p.publishingEntity,
          })),
        },
      },
      include: {
        parties: true,
      },
    })

    // Create shares if provided
    if (shares && Array.isArray(shares)) {
      // Map party indices to created party IDs
      const partyIds = splitSheet.parties.map(p => p.id)
      
      await Promise.all(
        shares.map((share: any, index: number) =>
          prisma.splitShare.create({
            data: {
              splitSheetId: splitSheet.id,
              partyId: partyIds[share.partyIndex || index],
              masterSharePct: share.masterSharePct || 0,
              publishingSharePct: share.publishingSharePct || 0,
            },
          })
        )
      )
    }

    // Fetch complete split sheet
    const completeSplitSheet = await prisma.splitSheet.findUnique({
      where: { id: splitSheet.id },
      include: {
        parties: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
            shares: true,
          },
        },
        shares: {
          include: {
            party: true,
          },
        },
      },
    })

    return NextResponse.json({ splitSheet: completeSplitSheet }, { status: 201 })
  } catch (error: any) {
    console.error('[SPLITS] Error creating split sheet:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Split sheet already exists for this work' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create split sheet' },
      { status: 500 }
    )
  }
}

// PATCH /api/splits/[workId] - update split sheet
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workId: string }> }
) {
  try {
    const { workId } = await params
    const body = await request.json()
    const { parties, shares, locked } = body

    // Check if split sheet exists and is not locked
    const existingSplitSheet = await prisma.splitSheet.findUnique({
      where: { workId },
      include: { parties: true, shares: true },
    })

    if (!existingSplitSheet) {
      return NextResponse.json(
        { error: 'Split sheet not found' },
        { status: 404 }
      )
    }

    if (existingSplitSheet.locked && locked !== true) {
      return NextResponse.json(
        { error: 'Cannot modify locked split sheet' },
        { status: 403 }
      )
    }

    // If locking, validate shares
    if (locked === true && !existingSplitSheet.locked) {
      const currentShares = existingSplitSheet.shares
      const masterTotal = currentShares.reduce((sum, s) => sum + s.masterSharePct, 0)
      const publishingTotal = currentShares.reduce((sum, s) => sum + s.publishingSharePct, 0)

      if (Math.abs(masterTotal - 100) > 0.01 || Math.abs(publishingTotal - 100) > 0.01) {
        return NextResponse.json(
          { error: 'Cannot lock: shares must total 100%' },
          { status: 400 }
        )
      }
    }

    // Update parties if provided
    if (parties && Array.isArray(parties)) {
      // Delete existing parties (cascades to shares)
      await prisma.splitParty.deleteMany({
        where: { splitSheetId: existingSplitSheet.id },
      })

      // Create new parties
      await Promise.all(
        parties.map((p: any) =>
          prisma.splitParty.create({
            data: {
              splitSheetId: existingSplitSheet.id,
              userId: p.userId || null,
              externalName: p.externalName,
              role: p.role,
              walletAddress: p.walletAddress,
              pro: p.pro,
              ipiCae: p.ipiCae,
              publishingEntity: p.publishingEntity,
            },
          })
        )
      )
    }

    // Update shares if provided
    if (shares && Array.isArray(shares)) {
      // Validate totals
      const masterTotal = shares.reduce((sum: number, s: any) => sum + (s.masterSharePct || 0), 0)
      const publishingTotal = shares.reduce((sum: number, s: any) => sum + (s.publishingSharePct || 0), 0)

      if (Math.abs(masterTotal - 100) > 0.01) {
        return NextResponse.json(
          { error: `Master shares must total 100% (currently ${masterTotal}%)` },
          { status: 400 }
        )
      }

      if (Math.abs(publishingTotal - 100) > 0.01) {
        return NextResponse.json(
          { error: `Publishing shares must total 100% (currently ${publishingTotal}%)` },
          { status: 400 }
        )
      }

      // Delete existing shares
      await prisma.splitShare.deleteMany({
        where: { splitSheetId: existingSplitSheet.id },
      })

      // Get current parties
      const currentParties = await prisma.splitParty.findMany({
        where: { splitSheetId: existingSplitSheet.id },
      })

      // Create new shares
      await Promise.all(
        shares.map((share: any) =>
          prisma.splitShare.create({
            data: {
              splitSheetId: existingSplitSheet.id,
              partyId: currentParties[share.partyIndex]?.id || share.partyId,
              masterSharePct: share.masterSharePct || 0,
              publishingSharePct: share.publishingSharePct || 0,
            },
          })
        )
      )
    }

    // Update locked status if provided
    const updateData: any = {}
    if (locked !== undefined) {
      updateData.locked = locked
    }

    const splitSheet = await prisma.splitSheet.update({
      where: { id: existingSplitSheet.id },
      data: updateData,
      include: {
        parties: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
            shares: true,
          },
        },
        shares: {
          include: {
            party: true,
          },
        },
      },
    })

    return NextResponse.json({ splitSheet })
  } catch (error) {
    console.error('[SPLITS] Error updating split sheet:', error)
    return NextResponse.json(
      { error: 'Failed to update split sheet' },
      { status: 500 }
    )
  }
}
