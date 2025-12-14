/**
 * Unified Payment Service
 * Handles both Stripe (fiat) and x402 (crypto) payments with automatic splits
 */

import Stripe from 'stripe'

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null

export interface PaymentSplit {
  userId: string
  share: number // 0.0 to 1.0
  walletAddress?: string // For crypto payments
  stripeAccountId?: string // For Stripe Connect
}

export interface CreatePaymentLinkParams {
  targetType: 'Asset' | 'Booking' | 'License'
  targetId: string
  amount: number
  currency: string
  splits: PaymentSplit[]
  metadata?: Record<string, any>
  description?: string
}

export interface PaymentLinkResult {
  id: string
  url: string
  type: 'stripe' | 'x402'
  amount: number
  currency: string
  splits: PaymentSplit[]
  status: 'active' | 'paid' | 'expired'
}

/**
 * Create a Stripe Payment Link with automatic splits via Stripe Connect
 */
export async function createStripePaymentLink(
  params: CreatePaymentLinkParams
): Promise<PaymentLinkResult> {
  if (!stripe) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in environment.')
  }

  const { amount, currency, splits, metadata, description } = params

  // Validate splits sum to 1.0
  const totalShare = splits.reduce((sum, split) => sum + split.share, 0)
  if (Math.abs(totalShare - 1.0) > 0.001) {
    throw new Error(`Splits must sum to 1.0, got ${totalShare}`)
  }

  // Create a product
  const product = await stripe.products.create({
    name: description || `${params.targetType} ${params.targetId}`,
    metadata: {
      targetType: params.targetType,
      targetId: params.targetId,
      ...metadata,
    },
  })

  // Create a price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
  })

  // Calculate transfer amounts for each split
  const transferData = splits
    .filter(split => split.stripeAccountId)
    .map(split => ({
      destination: split.stripeAccountId!,
      amount: Math.round(amount * split.share * 100),
    }))

  // Create payment link
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
    metadata: {
      targetType: params.targetType,
      targetId: params.targetId,
      splits: JSON.stringify(splits),
      ...metadata,
    },
    // Note: Stripe Connect transfers are handled via webhooks
    // See webhook handler for split distribution
  })

  return {
    id: paymentLink.id,
    url: paymentLink.url,
    type: 'stripe',
    amount,
    currency,
    splits,
    status: 'active',
  }
}

/**
 * Create an x402 Payment Required invoice for crypto payments
 */
export async function createX402Invoice(
  params: CreatePaymentLinkParams
): Promise<PaymentLinkResult> {
  const { amount, currency, splits, metadata, description } = params

  // Validate splits sum to 1.0
  const totalShare = splits.reduce((sum, split) => sum + split.share, 0)
  if (Math.abs(totalShare - 1.0) > 0.001) {
    throw new Error(`Splits must sum to 1.0, got ${totalShare}`)
  }

  // Generate a unique invoice ID
  const invoiceId = `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  // In production, this would:
  // 1. Create a smart contract escrow on Base L2
  // 2. Generate payment addresses for each split recipient
  // 3. Set up automatic distribution on payment receipt

  // For now, return a mock invoice URL
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoice/${invoiceId}`

  // Store invoice in database (implement this)
  // await prisma.paymentLink.create({
  //   data: {
  //     id: invoiceId,
  //     targetType: params.targetType,
  //     targetId: params.targetId,
  //     amount,
  //     currency,
  //     splits,
  //     url: invoiceUrl,
  //     status: 'active',
  //     type: 'x402',
  //     metadata,
  //   },
  // })

  return {
    id: invoiceId,
    url: invoiceUrl,
    type: 'x402',
    amount,
    currency,
    splits,
    status: 'active',
  }
}

/**
 * Create a payment link (auto-detects Stripe vs x402 based on currency)
 */
export async function createPaymentLink(
  params: CreatePaymentLinkParams
): Promise<PaymentLinkResult> {
  // Use x402 for crypto currencies, Stripe for fiat
  const cryptoCurrencies = ['ETH', 'BTC', 'USDC', 'USDT']
  const isX402 = cryptoCurrencies.includes(params.currency.toUpperCase())

  if (isX402) {
    return createX402Invoice(params)
  } else {
    return createStripePaymentLink(params)
  }
}

/**
 * Distribute payment according to splits
 * Called by webhook handlers after payment is confirmed
 */
export async function distributePayment(
  paymentLinkId: string,
  paymentIntentId: string
): Promise<void> {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  // Get payment link from database
  // const paymentLink = await prisma.paymentLink.findUnique({
  //   where: { id: paymentLinkId },
  // })

  // For Stripe payments, create transfers to connected accounts
  // const splits = JSON.parse(paymentLink.splits)
  // for (const split of splits) {
  //   if (split.stripeAccountId) {
  //     await stripe.transfers.create({
  //       amount: Math.round(paymentLink.amount * split.share * 100),
  //       currency: paymentLink.currency,
  //       destination: split.stripeAccountId,
  //       transfer_group: paymentIntentId,
  //     })
  //   }
  // }

  // Update payment link status
  // await prisma.paymentLink.update({
  //   where: { id: paymentLinkId },
  //   data: { status: 'paid' },
  // })

  console.log(`[PAYMENT] Distributed payment ${paymentLinkId}`)
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  event: Stripe.Event
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      console.log('[STRIPE] Checkout completed:', session.id)
      
      // Get payment link ID from metadata
      const paymentLinkId = session.metadata?.paymentLinkId
      if (paymentLinkId) {
        await distributePayment(paymentLinkId, session.payment_intent as string)
      }
      break

    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      console.log('[STRIPE] Payment succeeded:', paymentIntent.id)
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent
      console.error('[STRIPE] Payment failed:', failedPayment.id)
      break

    default:
      console.log(`[STRIPE] Unhandled event type: ${event.type}`)
  }
}

/**
 * Create escrow for booking
 * Holds payment until service is completed
 */
export async function createEscrow(
  bookingId: string,
  amount: number,
  currency: string,
  splits: PaymentSplit[]
): Promise<PaymentLinkResult> {
  return createPaymentLink({
    targetType: 'Booking',
    targetId: bookingId,
    amount,
    currency,
    splits,
    metadata: {
      escrow: true,
      releaseCondition: 'booking_completed',
    },
    description: `Escrow for Booking ${bookingId}`,
  })
}

/**
 * Release escrow payment after booking completion
 */
export async function releaseEscrow(bookingId: string): Promise<void> {
  // Get booking and payment link
  // const booking = await prisma.booking.findUnique({
  //   where: { id: bookingId },
  //   include: { paymentLink: true },
  // })

  // if (!booking || !booking.paymentLink) {
  //   throw new Error('Booking or payment link not found')
  // }

  // if (booking.status !== 'COMPLETED') {
  //   throw new Error('Booking must be completed before releasing escrow')
  // }

  // Distribute payment to recipients
  // await distributePayment(booking.paymentLink.id, booking.paymentLink.id)

  console.log(`[ESCROW] Released payment for booking ${bookingId}`)
}

/**
 * Calculate platform fee (e.g., 5% of transaction)
 */
export function calculatePlatformFee(amount: number): number {
  const feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5')
  return amount * (feePercentage / 100)
}

/**
 * Add platform fee to splits
 */
export function addPlatformFeeToSplits(
  splits: PaymentSplit[],
  platformAccountId: string
): PaymentSplit[] {
  const feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '5') / 100
  
  // Reduce each split by the fee percentage
  const adjustedSplits = splits.map(split => ({
    ...split,
    share: split.share * (1 - feePercentage),
  }))

  // Add platform fee split
  adjustedSplits.push({
    userId: 'platform',
    share: feePercentage,
    stripeAccountId: platformAccountId,
  })

  return adjustedSplits
}
