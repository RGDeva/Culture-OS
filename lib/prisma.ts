import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Safe Prisma client initialization with error handling
let prismaInstance: PrismaClient | null = null

try {
  prismaInstance = global.prisma || new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prismaInstance
  }
} catch (error) {
  console.warn('Prisma client not initialized. Run "npx prisma generate" to set up the database.')
  // Create a mock client that won't crash the app
  prismaInstance = null
}

export const prisma = prismaInstance as PrismaClient

// Helper to check if Prisma is configured
export const isPrismaConfigured = () => prismaInstance !== null

// This ensures the Prisma Client is properly initialized
export default prisma
