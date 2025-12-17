/**
 * Safe Prisma wrapper to handle missing models gracefully
 */

import { prisma } from '@/lib/prisma'

// Create a proxy that returns null for non-existent models
export const prismaSafe = new Proxy(prisma, {
  get(target: any, prop: string) {
    // If the property exists on prisma, return it
    if (prop in target) {
      return target[prop]
    }
    
    // For non-existent models, return a mock object with common methods
    console.warn(`[PRISMA_SAFE] Model '${prop}' does not exist in schema`)
    
    return {
      findMany: async () => [],
      findFirst: async () => null,
      findUnique: async () => null,
      create: async () => null,
      update: async () => null,
      updateMany: async () => ({ count: 0 }),
      delete: async () => null,
      deleteMany: async () => ({ count: 0 }),
      count: async () => 0,
    }
  }
})
