/**
 * Payment store - tracks all payment transactions
 * Integrates with x402, marketplace, bounties, and earnings
 */

import { 
  Payment, 
  PaymentCreateInput, 
  PaymentFilters, 
  PaymentStatus,
  EarningsSummary,
  calculatePlatformFee,
  calculateNetAmount
} from '../types/payments'

// In-memory store for payments
const payments = new Map<string, Payment>()
let nextId = 1

/**
 * Create a new payment record
 */
export function createPayment(input: PaymentCreateInput): Payment {
  const id = `payment_${nextId++}_${Date.now()}`
  
  const platformFee = calculatePlatformFee(input.amountUSDC, input.type)
  const netAmount = calculateNetAmount(input.amountUSDC, input.type)
  
  const payment: Payment = {
    id,
    ...input,
    status: 'PENDING',
    platformFee,
    netAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  payments.set(id, payment)
  console.log('[PAYMENT_STORE] Created payment:', { id, type: input.type, amount: input.amountUSDC })
  
  return payment
}

/**
 * Update payment status
 */
export function updatePaymentStatus(
  paymentId: string, 
  status: PaymentStatus,
  txHash?: string,
  x402PaymentData?: string
): Payment | null {
  const existing = payments.get(paymentId)
  if (!existing) return null
  
  const updated: Payment = {
    ...existing,
    status,
    txHash,
    x402PaymentData,
    completedAt: status === 'COMPLETED' ? new Date().toISOString() : existing.completedAt,
    updatedAt: new Date().toISOString(),
  }
  
  payments.set(paymentId, updated)
  console.log('[PAYMENT_STORE] Updated payment:', { id: paymentId, status })
  
  return updated
}

/**
 * Get payment by ID
 */
export function getPayment(id: string): Payment | null {
  return payments.get(id) || null
}

/**
 * Get all payments with filters
 */
export function getAllPayments(filters?: PaymentFilters): Payment[] {
  let result = Array.from(payments.values())
  
  if (filters) {
    if (filters.userId) {
      result = result.filter(p => 
        p.fromUserId === filters.userId || p.toUserId === filters.userId
      )
    }
    if (filters.type) {
      result = result.filter(p => p.type === filters.type)
    }
    if (filters.status) {
      result = result.filter(p => p.status === filters.status)
    }
    if (filters.fromDate) {
      result = result.filter(p => p.createdAt >= filters.fromDate!)
    }
    if (filters.toDate) {
      result = result.filter(p => p.createdAt <= filters.toDate!)
    }
  }
  
  // Sort by date (newest first)
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return result
}

/**
 * Get payments where user is the recipient (earnings)
 */
export function getUserEarnings(userId: string): Payment[] {
  return Array.from(payments.values())
    .filter(p => p.toUserId === userId && p.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Get payments where user is the payer (spending)
 */
export function getUserSpending(userId: string): Payment[] {
  return Array.from(payments.values())
    .filter(p => p.fromUserId === userId && p.status === 'COMPLETED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

/**
 * Calculate earnings summary for a user
 */
export function getEarningsSummary(userId: string): EarningsSummary {
  const earnings = getUserEarnings(userId)
  
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
  
  // Total earned (all time)
  const totalEarned = earnings.reduce((sum, p) => sum + p.netAmount, 0)
  
  // This month
  const thisMonth = earnings
    .filter(p => new Date(p.completedAt!) >= thisMonthStart)
    .reduce((sum, p) => sum + p.netAmount, 0)
  
  // Last month
  const lastMonth = earnings
    .filter(p => {
      const date = new Date(p.completedAt!)
      return date >= lastMonthStart && date <= lastMonthEnd
    })
    .reduce((sum, p) => sum + p.netAmount, 0)
  
  // Pending payouts (escrowed or processing)
  const pendingPayouts = Array.from(payments.values())
    .filter(p => 
      p.toUserId === userId && 
      (p.status === 'ESCROWED' || p.status === 'PROCESSING')
    )
    .reduce((sum, p) => sum + p.netAmount, 0)
  
  // Breakdown by type
  const breakdown = {
    marketplace: earnings
      .filter(p => p.type === 'MARKETPLACE_PURCHASE')
      .reduce((sum, p) => sum + p.netAmount, 0),
    bounties: earnings
      .filter(p => p.type === 'BOUNTY_PAYMENT')
      .reduce((sum, p) => sum + p.netAmount, 0),
    tips: earnings
      .filter(p => p.type === 'TIP')
      .reduce((sum, p) => sum + p.netAmount, 0),
    projects: earnings
      .filter(p => p.type === 'PROJECT_FUNDING')
      .reduce((sum, p) => sum + p.netAmount, 0),
  }
  
  return {
    totalEarned,
    thisMonth,
    lastMonth,
    pendingPayouts,
    breakdown,
  }
}

/**
 * Get payment history for a user (both earnings and spending)
 */
export function getUserPaymentHistory(userId: string, limit?: number): Payment[] {
  const userPayments = Array.from(payments.values())
    .filter(p => p.fromUserId === userId || p.toUserId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return limit ? userPayments.slice(0, limit) : userPayments
}

/**
 * Delete a payment (admin only)
 */
export function deletePayment(id: string): boolean {
  return payments.delete(id)
}
