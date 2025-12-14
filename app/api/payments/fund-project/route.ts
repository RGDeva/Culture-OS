import { NextRequest, NextResponse } from 'next/server'
import { ProjectFunding, PaymentSplit, PAYMENT_SPLIT_CONFIG } from '@/types/payments'
import { getProfile } from '@/lib/profileStore'

// In-memory storage (replace with database later)
const fundings: Map<string, ProjectFunding> = new Map()

/**
 * POST /api/payments/fund-project
 * Fund a specific project with split payments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, amountUSD, funderId, funderName, message } = body

    if (!projectId || !amountUSD || !funderId) {
      return NextResponse.json(
        { error: 'projectId, amountUSD, and funderId are required' },
        { status: 400 }
      )
    }

    if (amountUSD < 1) {
      return NextResponse.json(
        { error: 'Minimum funding amount is $1' },
        { status: 400 }
      )
    }

    // TODO: Fetch project details from Vault
    // For now, mock project data
    const projectTitle = `Project ${projectId}`
    const projectOwnerId = 'project-owner-id' // TODO: Get from project

    // Calculate splits based on config
    const config = PAYMENT_SPLIT_CONFIG.PROJECT_FUNDING
    const splits: PaymentSplit[] = [
      {
        recipientId: projectOwnerId,
        amount: amountUSD * config.creator,
        percentage: config.creator * 100,
        label: 'Creator',
      },
      {
        recipientId: projectId,
        amount: amountUSD * config.projectPool,
        percentage: config.projectPool * 100,
        label: 'Project Pool',
      },
      {
        recipientId: 'platform',
        amount: amountUSD * config.platform,
        percentage: config.platform * 100,
        label: 'Platform Fee',
      },
    ]

    // Create funding record
    const funding: ProjectFunding = {
      id: `funding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      projectTitle,
      funderId,
      funderName,
      amountUSD,
      splits,
      status: 'PENDING',
      message,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // TODO: Call x402/Thirdweb payment processing
    // For now, simulate successful payment
    console.log('[FUND_PROJECT] Processing payment:', {
      fundingId: funding.id,
      amount: amountUSD,
      splits: splits.map(s => `${s.label}: $${s.amount.toFixed(2)}`),
    })

    // Simulate payment processing
    // In production, this would call /api/x402/checkout-real or similar
    funding.status = 'COMPLETED'
    funding.transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`

    fundings.set(funding.id, funding)

    console.log('[FUND_PROJECT] Payment completed:', funding.id)

    return NextResponse.json({
      success: true,
      funding,
      message: 'Project funded successfully',
    })
  } catch (error) {
    console.error('[FUND_PROJECT] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to process funding',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/payments/fund-project?projectId=xxx
 * Get all fundings for a project
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return NextResponse.json(
      { error: 'projectId is required' },
      { status: 400 }
    )
  }

  const projectFundings = Array.from(fundings.values()).filter(
    f => f.projectId === projectId
  )

  const totalRaised = projectFundings.reduce((sum, f) => sum + f.amountUSD, 0)
  const backersCount = new Set(projectFundings.map(f => f.funderId)).size

  return NextResponse.json({
    fundings: projectFundings,
    summary: {
      totalRaised,
      backersCount,
      fundingsCount: projectFundings.length,
    },
  })
}
