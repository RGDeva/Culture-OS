/**
 * User utility functions for handling Privy user data
 * Privy's user.email can be either a string OR an object with an address property
 */

import { User } from '@privy-io/react-auth'

/**
 * Safely get email string from Privy user object
 */
export function getUserEmail(user: User | null | undefined): string | null {
  if (!user) return null
  
  // Handle string email
  if (typeof user.email === 'string') {
    return user.email
  }
  
  // Handle email object with address property
  if (user.email && typeof user.email === 'object' && 'address' in user.email) {
    return (user.email as any).address
  }
  
  return null
}

/**
 * Get username from email (part before @)
 */
export function getUserName(user: User | null | undefined, fallback: string = 'You'): string {
  const email = getUserEmail(user)
  if (!email) return fallback
  
  const atIndex = email.indexOf('@')
  return atIndex > 0 ? email.substring(0, atIndex) : fallback
}

/**
 * Get user display name or email
 */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return 'Anonymous'
  
  // Try to get email
  const email = getUserEmail(user)
  if (email) {
    return email.split('@')[0]
  }
  
  // Fallback to wallet address
  if (user.wallet?.address) {
    return `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
  }
  
  return 'Anonymous'
}

/**
 * Get user identifier (email or wallet or id)
 */
export function getUserIdentifier(user: User | null | undefined): string {
  if (!user) return 'anonymous'
  
  const email = getUserEmail(user)
  if (email) return email
  
  if (user.wallet?.address) return user.wallet.address
  
  if (user.id) return user.id
  
  return 'anonymous'
}

/**
 * Get first letter for avatar
 */
export function getUserInitial(user: User | null | undefined): string {
  const email = getUserEmail(user)
  if (email) return email.charAt(0).toUpperCase()
  
  if (user?.wallet?.address) return user.wallet.address.charAt(0).toUpperCase()
  
  return 'U'
}
