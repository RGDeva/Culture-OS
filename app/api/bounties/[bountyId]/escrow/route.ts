import { NextRequest, NextResponse } from 'next/server'

// In-memory storage (replace with database in production)
let escrowTransactions: any[] = []

/**
 * POST /api/bounties/[bountyId]/escrow
 * Create escrow for accepted bounty
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bountyId: string } }
) {
  try {
    const { bountyId } = params
    const body = await request.json()

    // Validation
    if (!body.amount || !body.creatorId || !body.contractorId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, creatorId, contractorId' },
        { status: 400 }
      )
    }

    // Create escrow transaction
    const escrow = {
      id: `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bountyId,
      amount: body.amount,
      creatorId: body.creatorId,
      contractorId: body.contractorId,
      status: 'HELD', // HELD, RELEASED, REFUNDED
      createdAt: new Date().toISOString(),
      releasedAt: null
    }

    escrowTransactions.push(escrow)

    return NextResponse.json({
      success: true,
      escrow
    }, { status: 201 })
  } catch (error) {
    console.error('[ESCROW_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create escrow' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bounties/[bountyId]/escrow
 * Release or refund escrow
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bountyId: string } }
) {
  try {
    const { bountyId } = params
    const body = await request.json()

    const escrow = escrowTransactions.find(e => e.bountyId === bountyId && e.status === 'HELD')

    if (!escrow) {
      return NextResponse.json(
        { error: 'No active escrow found for this bounty' },
        { status: 404 }
      )
    }

    // Validate action
    if (!['RELEASE', 'REFUND'].includes(body.action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be RELEASE or REFUND' },
        { status: 400 }
      )
    }

    // Update escrow status
    escrow.status = body.action === 'RELEASE' ? 'RELEASED' : 'REFUNDED'
    escrow.releasedAt = new Date().toISOString()

    return NextResponse.json({
      success: true,
      escrow,
      message: body.action === 'RELEASE' 
        ? 'Payment released to contractor' 
        : 'Payment refunded to creator'
    })
  } catch (error) {
    console.error('[ESCROW_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update escrow' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bounties/[bountyId]/escrow
 * Get escrow status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bountyId: string } }
) {
  try {
    const { bountyId } = params
    const escrow = escrowTransactions.find(e => e.bountyId === bountyId)

    if (!escrow) {
      return NextResponse.json(
        { error: 'No escrow found for this bounty' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      escrow
    })
  } catch (error) {
    console.error('[ESCROW_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch escrow' },
      { status: 500 }
    )
  }
}
