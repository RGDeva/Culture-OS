import { NextRequest, NextResponse } from 'next/server'
import { EarningsSummary } from '@/types/profile'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/earnings?userId=xxx
 * Returns NoCulture OS earnings summary
 * TODO: Integrate with actual purchase/bounty tracking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    // TODO: Query actual purchases and bounties from database
    // For now, return mock data
    const earnings: EarningsSummary = {
      totalEarned: 2450.00,
      thisMonth: 380.00,
      pendingPayouts: 125.00,
      breakdown: {
        marketplaceAssets: 1200.00,
        marketplaceServices: 950.00,
        vaultBounties: 300.00
      }
    }

    console.log('[EARNINGS_API] Generated earnings for user:', userId)

    return NextResponse.json(earnings)
  } catch (error) {
    console.error('[EARNINGS_API] Error:', error)
    // Never throw - return zero earnings
    return NextResponse.json({
      totalEarned: 0,
      thisMonth: 0,
      pendingPayouts: 0,
      breakdown: {
        marketplaceAssets: 0,
        marketplaceServices: 0,
        vaultBounties: 0
      }
    })
  }
}

/**
 * POST /api/earnings
 * Add earnings from CSV/JSON payload
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { earnings } = body

    if (!earnings || !Array.isArray(earnings)) {
      return NextResponse.json(
        { error: 'Earnings array is required' },
        { status: 400 }
      )
    }

    const results = []

    for (const earning of earnings) {
      const { workId, type, source, amountCents, occurredAt } = earning

      if (!workId || !type || !source || amountCents === undefined) {
        results.push({
          error: 'Missing required fields',
          earning,
        })
        continue
      }

      // Create earning
      const created = await prisma.earning.create({
        data: {
          workId,
          type,
          source,
          amountCents,
          currency: earning.currency || 'USD',
          occurredAt: new Date(occurredAt || Date.now()),
        },
      })

      // Get split sheet for this work
      const splitSheet = await prisma.splitSheet.findUnique({
        where: { workId },
        include: {
          shares: {
            include: {
              party: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      })

      if (splitSheet && splitSheet.locked) {
        // Calculate owed amounts per party
        for (const share of splitSheet.shares) {
          const sharePercentage = type === 'MASTER' 
            ? share.masterSharePct 
            : share.publishingSharePct

          const owedCents = Math.round((amountCents * sharePercentage) / 100)

          if (owedCents > 0 && share.party.userId) {
            // Update or create balance for user
            const existingBalance = await prisma.balance.findUnique({
              where: {
                userId_currency: {
                  userId: share.party.userId,
                  currency: earning.currency || 'USD',
                },
              },
            })

            if (existingBalance) {
              await prisma.balance.update({
                where: { id: existingBalance.id },
                data: {
                  pendingCents: existingBalance.pendingCents + owedCents,
                },
              })
            } else {
              await prisma.balance.create({
                data: {
                  userId: share.party.userId,
                  currency: earning.currency || 'USD',
                  pendingCents: owedCents,
                },
              })
            }
          }
        }
      }

      results.push({
        success: true,
        earning: created,
      })
    }

    return NextResponse.json({ results }, { status: 201 })
  } catch (error) {
    console.error('[EARNINGS] Error adding earnings:', error)
    return NextResponse.json(
      { error: 'Failed to add earnings' },
      { status: 500 }
    )
  }
}
