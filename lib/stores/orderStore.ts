/**
 * Order store - tracks x402 payment orders
 * Simple in-memory store (ready for DB migration)
 */

import { Order, OrderCreateInput, OrderFilters, OrderStatus } from '../types/order'

// In-memory store
const orders = new Map<string, Order>()
let nextId = 1

/**
 * Create a new order
 */
export function createOrder(input: OrderCreateInput): Order {
  const id = `order_${nextId++}_${Date.now()}`
  
  const order: Order = {
    id,
    ...input,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  orders.set(id, order)
  console.log('[ORDER_STORE] Created order:', { id, mode: input.mode, amount: input.amountUsd })
  
  return order
}

/**
 * Get order by ID
 */
export function getOrder(id: string): Order | null {
  return orders.get(id) || null
}

/**
 * Update order status
 */
export function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  txHash?: string,
  x402PaymentData?: string
): Order | null {
  const existing = orders.get(orderId)
  if (!existing) return null
  
  const updated: Order = {
    ...existing,
    status,
    txHash,
    x402PaymentData,
    completedAt: status === 'COMPLETED' ? new Date().toISOString() : existing.completedAt,
    updatedAt: new Date().toISOString(),
  }
  
  orders.set(orderId, updated)
  console.log('[ORDER_STORE] Updated order:', { id: orderId, status })
  
  return updated
}

/**
 * Get all orders with filters
 */
export function getAllOrders(filters?: OrderFilters): Order[] {
  let result = Array.from(orders.values())
  
  if (filters) {
    if (filters.buyerId) {
      result = result.filter(o => o.buyerId === filters.buyerId)
    }
    if (filters.sellerId) {
      result = result.filter(o => o.sellerId === filters.sellerId)
    }
    if (filters.mode) {
      result = result.filter(o => o.mode === filters.mode)
    }
    if (filters.status) {
      result = result.filter(o => o.status === filters.status)
    }
  }
  
  // Sort by date (newest first)
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  return result
}

/**
 * Get user's purchases (as buyer)
 */
export function getUserPurchases(userId: string): Order[] {
  return getAllOrders({ buyerId: userId, status: 'COMPLETED' })
}

/**
 * Get user's earnings (as seller)
 */
export function getUserEarnings(userId: string): Order[] {
  return getAllOrders({ sellerId: userId, status: 'COMPLETED' })
}

/**
 * Calculate total earnings for a user
 */
export function calculateTotalEarnings(userId: string): number {
  const earnings = getUserEarnings(userId)
  return earnings.reduce((sum, order) => sum + order.amountUsd, 0)
}

/**
 * Calculate earnings for current month
 */
export function calculateMonthlyEarnings(userId: string): number {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const earnings = getUserEarnings(userId)
  return earnings
    .filter(order => new Date(order.completedAt!) >= monthStart)
    .reduce((sum, order) => sum + order.amountUsd, 0)
}

/**
 * Get earnings breakdown by mode
 */
export function getEarningsBreakdown(userId: string): { products: number; tips: number } {
  const earnings = getUserEarnings(userId)
  
  return {
    products: earnings
      .filter(o => o.mode === 'PRODUCT')
      .reduce((sum, o) => sum + o.amountUsd, 0),
    tips: earnings
      .filter(o => o.mode === 'TIP')
      .reduce((sum, o) => sum + o.amountUsd, 0),
  }
}
