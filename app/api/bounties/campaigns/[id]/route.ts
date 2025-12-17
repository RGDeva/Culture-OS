import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * GET /api/bounties/campaigns/[id]
 * Get a single campaign with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const campaign = await prisma.bountyCampaign.findUnique({
      where: { id },
      include: {
        assetLinks: true,
        participants: {
          include: {
            submissions: {
              orderBy: { submittedAt: 'desc' },
            },
            earnings: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('[BOUNTIES_CAMPAIGN_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bounties/campaigns/[id]
 * Update a campaign (creator only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { creatorId, ...updates } = body

    // Verify campaign exists and user is creator
    const existing = await prisma.bountyCampaign.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (existing.creatorId !== creatorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You are not the campaign creator' },
        { status: 403 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.budgetCents) updateData.budgetCents = updates.budgetCents
    if (updates.rulesJson) updateData.rulesJson = JSON.stringify(updates.rulesJson)
    if (updates.startAt) updateData.startAt = new Date(updates.startAt)
    if (updates.endAt) updateData.endAt = new Date(updates.endAt)
    if (updates.status) updateData.status = updates.status

    const campaign = await prisma.bountyCampaign.update({
      where: { id },
      data: updateData,
      include: {
        assetLinks: true,
        participants: true,
      },
    })

    return NextResponse.json({ campaign })
  } catch (error) {
    console.error('[BOUNTIES_CAMPAIGN_PATCH] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bounties/campaigns/[id]
 * Delete a campaign (creator only, only if DRAFT or no participants)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')

    if (!creatorId) {
      return NextResponse.json(
        { error: 'creatorId required' },
        { status: 400 }
      )
    }

    // Verify campaign exists and user is creator
    const campaign = await prisma.bountyCampaign.findUnique({
      where: { id },
      include: {
        participants: true,
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.creatorId !== creatorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You are not the campaign creator' },
        { status: 403 }
      )
    }

    // Only allow deletion if DRAFT or no participants
    if (campaign.status !== 'DRAFT' && campaign.participants.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete active campaign with participants. Set status to CANCELLED instead.' },
        { status: 400 }
      )
    }

    await prisma.bountyCampaign.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[BOUNTIES_CAMPAIGN_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
