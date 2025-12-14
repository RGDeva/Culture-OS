/**
 * Payment types for NoCulture OS
 * Tracks all payment transactions across marketplace, bounties, and tips
 */

export type PaymentType = 
  | 'MARKETPLACE_PURCHASE'  // Buying beats, kits, services
  | 'BOUNTY_PAYMENT'        // Paying for bounty completion
  | 'TIP'                   // Direct creator tip
  | 'PROJECT_FUNDING'       // Funding a project
  | 'STUDIO_SESSION'        // Booking studio time

export type PaymentStatus = 
  | 'PENDING'               // Payment initiated
  | 'PROCESSING'            // x402 processing
  | 'COMPLETED'             // Successfully settled
  | 'FAILED'                // Payment failed
  | 'REFUNDED'              // Payment refunded
  | 'ESCROWED'              // Held in escrow (for bounties)

export type PaymentMethod = 
  | 'X402_CRYPTO'           // x402 via Thirdweb
  | 'PRIVY_WALLET'          // Privy embedded wallet
  | 'EXTERNAL_WALLET'       // User's connected wallet

export interface Payment {
  id: string
  type: PaymentType
  status: PaymentStatus
  method: PaymentMethod
  
  // Parties
  fromUserId: string        // Payer
  toUserId: string          // Recipient
  
  // Amount
  amountUSDC: number        // Amount in USDC
  platformFee: number       // Platform fee (5-10%)
  netAmount: number         // Amount after fees
  
  // Related entities
  productId?: string        // If marketplace purchase
  bountyId?: string         // If bounty payment
  projectId?: string        // If project funding
  
  // Transaction details
  txHash?: string           // Blockchain transaction hash
  x402PaymentData?: string  // x402 payment proof
  resourceUrl?: string      // x402 resource URL
  
  // Metadata
  description?: string
  metadata?: Record<string, any>
  
  // Timestamps
  createdAt: string
  completedAt?: string
  updatedAt: string
}

export interface PaymentCreateInput {
  type: PaymentType
  method: PaymentMethod
  fromUserId: string
  toUserId: string
  amountUSDC: number
  productId?: string
  bountyId?: string
  projectId?: string
  description?: string
  metadata?: Record<string, any>
}

export interface PaymentFilters {
  userId?: string           // Filter by payer or recipient
  type?: PaymentType
  status?: PaymentStatus
  fromDate?: string
  toDate?: string
}

export interface EarningsSummary {
  totalEarned: number
  thisMonth: number
  lastMonth: number
  pendingPayouts: number
  breakdown: {
    marketplace: number
    bounties: number
    tips: number
    projects: number
  }
}

export interface PaymentSplit {
  userId: string
  percentage: number
  amount: number
  description: string
}

// Platform fee configuration
export const PLATFORM_FEES = {
  MARKETPLACE_PURCHASE: 0.05,  // 5%
  BOUNTY_PAYMENT: 0.10,        // 10%
  TIP: 0.05,                   // 5%
  PROJECT_FUNDING: 0.10,       // 10%
  STUDIO_SESSION: 0.10,        // 10%
} as const

export function calculatePlatformFee(amount: number, type: PaymentType): number {
  const feeRate = PLATFORM_FEES[type] || 0.05
  return amount * feeRate
}

export function calculateNetAmount(amount: number, type: PaymentType): number {
  const fee = calculatePlatformFee(amount, type)
  return amount - fee
}
