/**
 * Order types for x402 payments
 * Tracks marketplace purchases and tips
 */

export type PaymentMode = 'PRODUCT' | 'TIP'

export type OrderStatus = 
  | 'PENDING'      // Order created, awaiting payment
  | 'PROCESSING'   // Payment in progress
  | 'COMPLETED'    // Payment successful
  | 'FAILED'       // Payment failed
  | 'REFUNDED'     // Order refunded

export interface Order {
  id: string
  buyerId: string           // User making the payment
  sellerId: string          // User receiving the payment
  mode: PaymentMode
  
  // Optional fields based on mode
  productId?: string        // For PRODUCT mode
  targetUserId?: string     // For TIP mode (same as sellerId)
  
  // Amount
  amountUsd: number
  
  // Payment details
  status: OrderStatus
  txHash?: string           // Blockchain transaction hash
  x402PaymentData?: string  // x402 payment proof
  
  // Timestamps
  createdAt: string
  completedAt?: string
  updatedAt: string
}

export interface OrderCreateInput {
  buyerId: string
  sellerId: string
  mode: PaymentMode
  amountUsd: number
  productId?: string
  targetUserId?: string
}

export interface OrderFilters {
  buyerId?: string
  sellerId?: string
  mode?: PaymentMode
  status?: OrderStatus
}
