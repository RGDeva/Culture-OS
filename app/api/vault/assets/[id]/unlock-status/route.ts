import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getPrivyUserId } from '@/lib/auth/privyServerAuth'

const prisma = new PrismaClient()

/**
 * GET /api/vault/assets/:id/unlock-status
 * 
 * Returns unlock status for an asset:
 * - isPaid: whether asset requires payment
 * - hasEntitlement: whether current user has already paid
 * - priceCents: price in cents
 * - currency: payment currency (USDC)
 * 
 * Does not require authentication (returns hasEntitlement: false if not logged in)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assetId = params.id

    // Load asset
    const asset = await prisma.vaultAsset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // Check if user is authenticated (optional)
    const privyUserId = await getPrivyUserId(req)

    let hasEntitlement = false
    if (privyUserId && asset.isPaid) {
      // Check if user has entitlement
      const entitlement = await prisma.entitlement.findUnique({
        where: {
          privyUserId_assetId: {
            privyUserId,
            assetId
          }
        }
      })
      hasEntitlement = !!entitlement
    }

    return NextResponse.json({
      isPaid: asset.isPaid,
      hasEntitlement,
      priceCents: asset.priceCents,
      currency: asset.currency,
      receiverAddress: asset.receiverAddress
    })

  } catch (error) {
    console.error('Unlock status error:', error)
    return NextResponse.json(
      { error: 'Failed to get unlock status' },
      { status: 500 }
    )
  }
}
