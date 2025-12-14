/**
 * Payment types for NoCulture OS
 * Handles project funding and direct tips
 */

export type PaymentType = 'PROJECT_FUNDING' | 'TIP' | 'MARKETPLACE_PURCHASE' | 'BOUNTY_PAYMENT'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface PaymentSplit {
  recipientId: string
  recipientWallet?: string
  amount: number
  percentage: number
  label: string // e.g., 'Creator', 'Project Pool', 'Platform Fee'
}

export interface ProjectFunding {
  id: string
  projectId: string
  projectTitle: string
  funderId: string
  funderName?: string
  amountUSD: number
  splits: PaymentSplit[]
  transactionHash?: string
  status: PaymentStatus
  message?: string // Optional message from funder
  createdAt: string
  updatedAt: string
}

export interface Tip {
  id: string
  targetUserId: string
  targetUserName?: string
  tipperId: string
  tipperName?: string
  amountUSD: number
  splits: PaymentSplit[]
  transactionHash?: string
  status: PaymentStatus
  message?: string // Optional message from tipper
  createdAt: string
  updatedAt: string
}

export interface PaymentRecord {
  id: string
  type: PaymentType
  userId: string // Payer
  targetId: string // Project ID, User ID, Product ID, or Bounty ID
  amountUSD: number
  status: PaymentStatus
  transactionHash?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Configuration for payment splits
export const PAYMENT_SPLIT_CONFIG = {
  PROJECT_FUNDING: {
    creator: 0.70,      // 70% to creator
    projectPool: 0.20,  // 20% to project pool
    platform: 0.10,     // 10% platform fee
  },
  TIP: {
    creator: 0.95,      // 95% to creator
    platform: 0.05,     // 5% platform fee
  },
  MARKETPLACE: {
    creator: 0.90,      // 90% to creator
    platform: 0.10,     // 10% platform fee
  },
}
