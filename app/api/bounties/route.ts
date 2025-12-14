import { NextRequest, NextResponse } from 'next/server'
import { BountyStatus } from '@/types/bounty'
import { createBounty, getAllBounties } from '@/lib/bountyStore'

/**
 * GET /api/bounties
 * Fetch bounties with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const filters = {
      search: searchParams.get('search') || undefined,
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') as BountyStatus | undefined,
      remoteOnly: searchParams.get('remote') === 'true',
    }

    // Get bounties from store
    const bounties = getAllBounties(filters)
    
    return NextResponse.json({ bounties })
  } catch (error) {
    console.error('[BOUNTIES_API] Error fetching bounties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bounties' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bounties
 * Create a new bounty
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validation
    if (!body.postedByUserId || !body.roleNeeded || !body.description || !body.compensationType) {
      return NextResponse.json(
        { error: 'Missing required fields: postedByUserId, roleNeeded, description, compensationType' },
        { status: 400 }
      )
    }

    // Create new bounty using bountyStore
    const newBounty = createBounty({
      projectId: body.projectId,
      postedByUserId: body.postedByUserId,
      roleNeeded: body.roleNeeded,
      description: body.description,
      deliverables: body.deliverables,
      genreTags: body.genreTags || [],
      budgetAmount: body.budgetAmount,
      budgetCurrency: body.budgetCurrency || 'USD',
      compensationType: body.compensationType,
      deadline: body.deadline || null,
      remoteOk: body.remoteOk !== undefined ? body.remoteOk : true,
      locationCity: body.locationCity || null,
      locationCountry: body.locationCountry || null,
      attachedFiles: body.attachedFiles || [],
    })

    console.log('[BOUNTIES_API] Created new bounty:', newBounty.id)

    return NextResponse.json(newBounty, { status: 201 })
  } catch (error) {
    console.error('[BOUNTIES_API] Error creating bounty:', error)
    return NextResponse.json(
      { error: 'Failed to create bounty' },
      { status: 500 }
    )
  }
}
