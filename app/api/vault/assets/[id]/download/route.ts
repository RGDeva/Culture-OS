import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { requirePrivyUser } from '@/lib/auth/privyServerAuth'
import { generateSignedDownloadUrl } from '@/lib/storage/signedUrls'
import { isX402Enabled, createPaymentChallenge, verifyPayment } from '@/lib/cdp/x402Service'

const prisma = new PrismaClient()

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verify Privy authentication
    let privyUserId: string
    try {
      privyUserId = await requirePrivyUser(req)
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const assetId = params.id

    // 2. Load asset from database
    const asset = await prisma.vaultAsset.findUnique({
      where: { id: assetId }
    })

    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    // 3. TODO: Check project permissions/ACL
    // Verify user has access to this asset's project
    // For MVP, skip this check

    // 4. Free asset path - return signed URL immediately
    if (!asset.isPaid) {
      const signedUrl = await generateSignedDownloadUrl(
        asset.storageKey,
        asset.fileName,
        asset.mimeType || undefined
      )
      return NextResponse.json({ downloadUrl: signedUrl })
    }

    // 5. Check if user already has entitlement
    const entitlement = await prisma.entitlement.findUnique({
      where: {
        privyUserId_assetId: {
          privyUserId,
          assetId
        }
      }
    })

    if (entitlement) {
      // User already paid - return signed URL
      const signedUrl = await generateSignedDownloadUrl(
        asset.storageKey,
        asset.fileName,
        asset.mimeType || undefined
      )
      return NextResponse.json({ downloadUrl: signedUrl })
    }

    // 6. Kill switch check
    if (!isX402Enabled()) {
      return NextResponse.json(
        { error: 'Payment required but payments are disabled' },
        { status: 403 }
      )
    }

    // 7. Check for payment authorization header
    const paymentAuth = req.headers.get('x-payment-authorization')

    if (!paymentAuth) {
      // No payment - return 402 Payment Required with x402 challenge
      if (!asset.priceCents) {
        return NextResponse.json(
          { error: 'Asset price not configured' },
          { status: 500 }
        )
      }

      const challenge = createPaymentChallenge(
        assetId,
        asset.priceCents,
        asset.receiverAddress
      )

      // Return HTTP 402 with x402 payment challenge
      return NextResponse.json(
        {
          error: 'Payment required',
          payment: challenge
        },
        {
          status: 402,
          headers: {
            'X-Payment-Required': 'true',
            'X-Payment-Amount': challenge.amount,
            'X-Payment-Currency': challenge.currency,
            'X-Payment-Network': challenge.network,
            'X-Payment-Recipient': challenge.recipient
          }
        }
      )
    }

    // 8. Payment authorization provided - verify it
    let paymentData
    try {
      paymentData = JSON.parse(paymentAuth)
    } catch {
      return NextResponse.json(
        { error: 'Invalid payment authorization format' },
        { status: 400 }
      )
    }

    // Verify payment using Coinbase x402 verification
    const verification = await verifyPayment(
      paymentData,
      asset.priceCents!,
      asset.receiverAddress
    )

    if (!verification.verified) {
      return NextResponse.json(
        { error: verification.error || 'Payment verification failed' },
        { status: 402 }
      )
    }

    // 9. Payment verified - create entitlement and transaction atomically
    try {
      await prisma.$transaction([
        prisma.entitlement.create({
          data: {
            privyUserId,
            assetId
          }
        }),
        prisma.x402Transaction.create({
          data: {
            privyUserId,
            assetId,
            amountCents: asset.priceCents!,
            currency: asset.currency,
            receiverAddress: asset.receiverAddress,
            network: 'base',
            txRef: verification.txRef,
            idempotencyKey: verification.idempotencyKey,
            status: 'CONFIRMED',
            metadata: JSON.stringify({
              verifiedAt: new Date().toISOString(),
              userAgent: req.headers.get('user-agent')
            })
          }
        })
      ])

      console.log(`[x402] Payment verified and entitlement created for asset ${assetId} by user ${privyUserId}`)
    } catch (error: any) {
      // Check if this is a duplicate transaction error
      if (error?.code === 'P2002') {
        console.log(`[x402] Duplicate transaction detected for asset ${assetId} - entitlement already exists`)
        // Continue to download - entitlement exists
      } else {
        throw error
      }
    }

    // 10. User is authorized - return signed download URL
    const signedUrl = await generateSignedDownloadUrl(
      asset.storageKey,
      asset.fileName,
      asset.mimeType || undefined
    )

    return NextResponse.json({ downloadUrl: signedUrl })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to process download request' },
      { status: 500 }
    )
  }
}
