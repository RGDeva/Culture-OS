import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * GET /api/bounties/campaigns
 * List bounty campaigns with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: any = {}
    if (creatorId) where.creatorId = creatorId
    if (status) where.status = status
    if (type) where.type = type

    const campaigns = await prisma.bountyCampaign.findMany({
      where,
      include: {
        assetLinks: true,
        participants: {
          select: {
            id: true,
            userId: true,
            joinedAt: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate participant counts and total spend for each campaign
    const campaignsWithStats = campaigns.map(campaign => {
      const participantCount = campaign.participants.filter(p => p.status === 'ACTIVE').length
      
      return {
        ...campaign,
        participantCount,
        // Will calculate actual spend from earnings in metrics endpoint
      }
    })

    return NextResponse.json({ campaigns: campaignsWithStats })
  } catch (error) {
    console.error('[BOUNTIES_CAMPAIGNS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bounties/campaigns
 * Create a new bounty campaign
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      creatorId,
      type,
      title,
      description,
      budgetCents,
      rulesJson,
      startAt,
      endAt,
      assetLinks,
    } = body

    // Validation
    if (!creatorId || !type || !title || !budgetCents) {
      return NextResponse.json(
        { error: 'Missing required fields: creatorId, type, title, budgetCents' },
        { status: 400 }
      )
    }

    if (!['VIEW', 'CONVERSION'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be VIEW or CONVERSION' },
        { status: 400 }
      )
    }

    // Create campaign with asset links
    const campaign = await prisma.bountyCampaign.create({
      data: {
        creatorId,
        type,
        title,
        description,
        budgetCents,
        rulesJson: JSON.stringify(rulesJson || {}),
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
        status: 'DRAFT',
        assetLinks: assetLinks ? {
          create: assetLinks.map((link: any) => ({
            assetId: link.assetId || null,
            listingId: link.listingId || null,
            showMetadataJson: link.showMetadataJson ? JSON.stringify(link.showMetadataJson) : null,
          })),
        } : undefined,
      },
      include: {
        assetLinks: true,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('[BOUNTIES_CAMPAIGNS_POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
