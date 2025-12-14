import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/works/[id] - get work details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const work = await prisma.work.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true,
            walletAddress: true,
          },
        },
        splitSheet: {
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
        },
        earnings: {
          orderBy: { occurredAt: 'desc' },
        },
      },
    })

    if (!work) {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      )
    }

    // Calculate earnings summary
    const masterEarnings = work.earnings
      .filter(e => e.type === 'MASTER')
      .reduce((sum, e) => sum + e.amountCents, 0)
    
    const publishingEarnings = work.earnings
      .filter(e => e.type === 'PUBLISHING')
      .reduce((sum, e) => sum + e.amountCents, 0)

    return NextResponse.json({
      work,
      earningsSummary: {
        masterCents: masterEarnings,
        publishingCents: publishingEarnings,
        totalCents: masterEarnings + publishingEarnings,
      },
    })
  } catch (error) {
    console.error('[WORKS] Error fetching work:', error)
    return NextResponse.json(
      { error: 'Failed to fetch work' },
      { status: 500 }
    )
  }
}

// PATCH /api/works/[id] - update work
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { title, status, isrc, iswc, releaseDate, label, distributor, spotifyUrl, appleMusicUrl, vaultAssetIds } = body

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (status !== undefined) updateData.status = status
    if (isrc !== undefined) updateData.isrc = isrc
    if (iswc !== undefined) updateData.iswc = iswc
    if (releaseDate !== undefined) updateData.releaseDate = releaseDate ? new Date(releaseDate) : null
    if (label !== undefined) updateData.label = label
    if (distributor !== undefined) updateData.distributor = distributor
    if (spotifyUrl !== undefined) updateData.spotifyUrl = spotifyUrl
    if (appleMusicUrl !== undefined) updateData.appleMusicUrl = appleMusicUrl
    if (vaultAssetIds !== undefined) updateData.vaultAssetIds = JSON.stringify(vaultAssetIds)

    const work = await prisma.work.update({
      where: { id },
      data: updateData,
      include: {
        splitSheet: {
          include: {
            parties: true,
            shares: true,
          },
        },
        earnings: true,
      },
    })

    return NextResponse.json({ work })
  } catch (error: any) {
    console.error('[WORKS] Error updating work:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Work not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'ISRC must be unique' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update work' },
      { status: 500 }
    )
  }
}
