/**
 * Coinbase CDP x402 Service
 * 
 * Secure server-side service for handling x402 payment verification.
 * Never exposes private keys to client.
 */

import { Coinbase, Wallet } from '@coinbase/coinbase-sdk'

// Kill switch check
export function isX402Enabled(): boolean {
  return process.env.X402_ENABLED === 'true'
}

// Logging utility (no PII)
function logPaymentAttempt(action: string, metadata: Record<string, any>) {
  const timestamp = new Date().toISOString()
  console.log(JSON.stringify({
    timestamp,
    service: 'x402',
    action,
    ...metadata
  }))
}

// Initialize CDP client (singleton)
let cdpClient: Coinbase | null = null

function getCDPClient(): Coinbase {
  if (cdpClient) return cdpClient

  const projectId = process.env.CDP_PROJECT_ID
  const apiKeyId = process.env.CDP_API_KEY_ID
  const privateKey = process.env.CDP_API_PRIVATE_KEY

  if (!projectId || !apiKeyId || !privateKey) {
    throw new Error('CDP credentials not configured. Check environment variables.')
  }

  try {
    // Initialize Coinbase SDK
    cdpClient = new Coinbase({
      apiKeyName: apiKeyId,
      privateKey: privateKey
    })

    logPaymentAttempt('cdp_client_initialized', {
      projectId: projectId.substring(0, 8) + '...' // Log partial ID only
    })

    return cdpClient
  } catch (error) {
    logPaymentAttempt('cdp_client_init_failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    throw new Error('Failed to initialize CDP client')
  }
}

// Get receiver wallet address
export function getReceiverAddress(): string {
  const address = process.env.X402_RECEIVER_ADDRESS
  if (!address) {
    throw new Error('X402_RECEIVER_ADDRESS not configured')
  }
  return address
}

// Get default price in cents
export function getDefaultPriceCents(): number {
  const price = process.env.X402_DEFAULT_PRICE_CENTS
  return price ? parseInt(price, 10) : 500 // Default $5.00
}

// Get network configuration
export function getNetworkConfig() {
  return {
    network: process.env.X402_NETWORK || 'base',
    currency: process.env.X402_CURRENCY || 'USDC'
  }
}

/**
 * Verify x402 payment authorization using Coinbase x402 protocol
 * 
 * @param paymentData - Payment authorization data from x402 client
 * @param expectedAmountCents - Expected amount in cents
 * @param receiverAddress - Expected receiver address
 * @returns Verification result with transaction reference
 */
export async function verifyPayment(
  paymentData: any,
  expectedAmountCents: number,
  receiverAddress: string
): Promise<{
  verified: boolean
  txRef?: string
  idempotencyKey?: string
  error?: string
}> {
  if (!isX402Enabled()) {
    logPaymentAttempt('payment_verification_skipped', {
      reason: 'x402_disabled'
    })
    return { verified: false, error: 'x402 payments are currently disabled' }
  }

  logPaymentAttempt('payment_verification_started', {
    expectedAmountCents
  })

  try {
    const { network, currency } = getNetworkConfig()

    // Extract x402 payment proof fields
    const txHash = paymentData?.transactionHash || paymentData?.txHash
    const amount = paymentData?.amount
    const recipient = paymentData?.recipient || paymentData?.to
    const paymentCurrency = paymentData?.currency
    const paymentNetwork = paymentData?.network
    const idempotencyKey = paymentData?.idempotencyKey

    // Validate required fields
    if (!txHash) {
      logPaymentAttempt('payment_verification_failed', {
        reason: 'missing_transaction_hash'
      })
      return { verified: false, error: 'Transaction hash required' }
    }

    if (!amount) {
      logPaymentAttempt('payment_verification_failed', {
        reason: 'missing_amount'
      })
      return { verified: false, error: 'Payment amount required' }
    }

    // Verify network matches (must be Base)
    if (paymentNetwork && paymentNetwork.toLowerCase() !== network.toLowerCase()) {
      logPaymentAttempt('payment_verification_failed', {
        reason: 'network_mismatch',
        expected: network,
        received: paymentNetwork
      })
      return { verified: false, error: `Network mismatch. Expected ${network}` }
    }

    // Verify currency matches (must be USDC)
    if (paymentCurrency && paymentCurrency.toUpperCase() !== currency.toUpperCase()) {
      logPaymentAttempt('payment_verification_failed', {
        reason: 'currency_mismatch',
        expected: currency,
        received: paymentCurrency
      })
      return { verified: false, error: `Currency mismatch. Expected ${currency}` }
    }

    // Verify amount matches expected
    const expectedAmountUSDC = (expectedAmountCents / 100).toFixed(2)
    const receivedAmount = parseFloat(amount)
    const expectedAmount = parseFloat(expectedAmountUSDC)
    
    if (Math.abs(receivedAmount - expectedAmount) > 0.01) {
      logPaymentAttempt('payment_verification_failed', {
        reason: 'amount_mismatch',
        expected: expectedAmount,
        received: receivedAmount
      })
      return { verified: false, error: `Amount mismatch. Expected ${expectedAmount} ${currency}` }
    }

    // Verify recipient matches
    if (recipient && recipient.toLowerCase() !== receiverAddress.toLowerCase()) {
      logPaymentAttempt('payment_verification_failed', {
        reason: 'recipient_mismatch',
        expected: receiverAddress.substring(0, 10) + '...',
        received: recipient.substring(0, 10) + '...'
      })
      return { verified: false, error: 'Recipient address mismatch' }
    }

    // TODO: Implement on-chain verification using Coinbase SDK
    // For production, verify the transaction actually exists on Base blockchain:
    // 1. Query Base network for transaction by hash
    // 2. Verify transaction is confirmed (not pending)
    // 3. Verify transaction transfers correct USDC amount to receiver
    // 4. Check transaction timestamp is recent (prevent replay attacks)
    
    // For now, we validate the payment data structure
    // In production, add:
    // const client = getCDPClient()
    // const tx = await client.getTransaction(txHash, 'base')
    // Verify tx.status === 'confirmed'
    // Verify tx.value matches expectedAmount
    // Verify tx.to === receiverAddress

    logPaymentAttempt('payment_verification_success', {
      txRef: txHash.substring(0, 10) + '...',
      amount: receivedAmount,
      currency,
      network
    })

    return {
      verified: true,
      txRef: txHash,
      idempotencyKey
    }
  } catch (error) {
    logPaymentAttempt('payment_verification_error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Payment verification failed'
    }
  }
}

/**
 * Create x402 payment challenge following Coinbase x402 protocol
 * 
 * @param assetId - Asset ID being purchased
 * @param priceCents - Price in cents
 * @param receiverAddress - Receiver wallet address
 * @returns Payment challenge data for x402 client
 */
export function createPaymentChallenge(
  assetId: string,
  priceCents: number,
  receiverAddress: string
): {
  amount: string
  currency: string
  recipient: string
  network: string
  assetId: string
  message: string
} {
  const { network, currency } = getNetworkConfig()

  // Convert cents to USDC amount
  const amountUSDC = (priceCents / 100).toFixed(2)

  logPaymentAttempt('payment_challenge_created', {
    assetId,
    priceCents,
    currency,
    network
  })

  return {
    amount: amountUSDC,
    currency,
    recipient: receiverAddress,
    network,
    assetId,
    message: `Unlock asset for ${amountUSDC} ${currency}`
  }
}

/**
 * Check if user has already paid for a product
 * 
 * @param userId - User ID
 * @param productId - Product ID
 * @returns True if user has completed payment
 */
export async function hasUserPaid(
  userId: string,
  productId: string
): Promise<boolean> {
  // This will be implemented with database queries in the API routes
  // Placeholder for type safety
  return false
}

/**
 * Get payment status for a transaction
 * 
 * @param txRef - Transaction reference
 * @returns Payment status
 */
export async function getPaymentStatus(
  txRef: string
): Promise<'PENDING' | 'COMPLETED' | 'FAILED'> {
  if (!isX402Enabled()) {
    return 'FAILED'
  }

  try {
    const client = getCDPClient()
    
    // TODO: Implement actual blockchain transaction status check
    // For MVP, return COMPLETED if txRef exists
    
    return 'COMPLETED'
  } catch (error) {
    logPaymentAttempt('payment_status_check_failed', {
      txRef: txRef.substring(0, 10) + '...',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return 'FAILED'
  }
}
