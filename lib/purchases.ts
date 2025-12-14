// In-memory purchase tracking (replace with database in production)
interface Purchase {
  id: string
  userId: string
  productId: string
  purchasedAt: string
}

let purchases: Purchase[] = []

export function addPurchase(userId: string, productId: string): Purchase {
  const purchase: Purchase = {
    id: `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    productId,
    purchasedAt: new Date().toISOString()
  }
  purchases.push(purchase)
  return purchase
}

export function hasPurchased(userId: string, productId: string): boolean {
  return purchases.some(p => p.userId === userId && p.productId === productId)
}

export function getUserPurchases(userId: string): Purchase[] {
  return purchases.filter(p => p.userId === userId)
}
