/**
 * XP System for NoCulture OS
 * Tracks user engagement and progression
 */

export type XpTier = 'ROOKIE' | 'CORE' | 'POWER_USER'

export type XpEvent =
  | 'CREATE_PROJECT'
  | 'POST_BOUNTY'
  | 'COMPLETE_BOUNTY'
  | 'COMPLETE_ORDER'
  | 'INVITE_ACTIVE_USER'
  | 'COMPLETE_PROFILE'
  | 'FIRST_SALE'
  | 'FIRST_COLLABORATION'
  | 'UPLOAD_TRACK'
  | 'CONNECT_PLATFORM'

export const XP_VALUES: Record<XpEvent, number> = {
  CREATE_PROJECT: 10,
  POST_BOUNTY: 15,
  COMPLETE_BOUNTY: 50,
  COMPLETE_ORDER: 30,
  INVITE_ACTIVE_USER: 100,
  COMPLETE_PROFILE: 25,
  FIRST_SALE: 75,
  FIRST_COLLABORATION: 60,
  UPLOAD_TRACK: 5,
  CONNECT_PLATFORM: 10,
}

export const TIER_THRESHOLDS = {
  ROOKIE: 0,
  CORE: 200,
  POWER_USER: 800,
}

/**
 * Calculate XP tier based on total XP
 */
export function calculateXpTier(xp: number): XpTier {
  if (xp >= TIER_THRESHOLDS.POWER_USER) return 'POWER_USER'
  if (xp >= TIER_THRESHOLDS.CORE) return 'CORE'
  return 'ROOKIE'
}

/**
 * Get progress to next tier (0-100)
 */
export function getProgressToNextTier(xp: number): number {
  const tier = calculateXpTier(xp)
  
  if (tier === 'POWER_USER') {
    return 100 // Already at max tier
  }
  
  if (tier === 'CORE') {
    const progress = ((xp - TIER_THRESHOLDS.CORE) / (TIER_THRESHOLDS.POWER_USER - TIER_THRESHOLDS.CORE)) * 100
    return Math.min(100, Math.max(0, progress))
  }
  
  // ROOKIE
  const progress = (xp / TIER_THRESHOLDS.CORE) * 100
  return Math.min(100, Math.max(0, progress))
}

/**
 * Get XP needed for next tier
 */
export function getXpForNextTier(xp: number): number {
  const tier = calculateXpTier(xp)
  
  if (tier === 'POWER_USER') {
    return 0 // Already at max tier
  }
  
  if (tier === 'CORE') {
    return TIER_THRESHOLDS.POWER_USER - xp
  }
  
  // ROOKIE
  return TIER_THRESHOLDS.CORE - xp
}

/**
 * Get tier display info (accepts tier or XP amount)
 */
export function getTierInfo(tierOrXp: XpTier | number) {
  const tier = typeof tierOrXp === 'number' ? calculateXpTier(tierOrXp) : tierOrXp
  
  const info = {
    ROOKIE: {
      tier: 'ROOKIE' as XpTier,
      label: 'ROOKIE',
      color: '#9ca3af',
      textColor: 'text-gray-400',
      bgColor: 'bg-gray-400/20',
      borderColor: 'border-gray-400/30',
      description: 'Just getting started',
    },
    CORE: {
      tier: 'CORE' as XpTier,
      label: 'CORE',
      color: '#00ff41',
      textColor: 'text-green-400',
      bgColor: 'bg-green-400/20',
      borderColor: 'border-green-400/30',
      description: 'Active contributor',
    },
    POWER_USER: {
      tier: 'POWER_USER' as XpTier,
      label: 'POWER_USER',
      color: '#ec4899',
      textColor: 'text-pink-400',
      bgColor: 'bg-pink-400/20',
      borderColor: 'border-pink-400/30',
      description: 'Elite creator',
    },
  }
  
  return info[tier]
}

/**
 * Award XP to a user (to be called in relevant flows)
 * This is a placeholder - implement actual persistence in API routes
 */
export async function awardXp(userId: string, event: XpEvent): Promise<number> {
  const xpAmount = XP_VALUES[event]
  
  // TODO: Implement actual API call to update user XP
  console.log(`[XP_SYSTEM] Awarding ${xpAmount} XP to user ${userId} for event: ${event}`)
  
  return xpAmount
}

/**
 * Get XP multiplier based on tier (for future features)
 */
export function getXpMultiplier(tier: XpTier): number {
  const multipliers = {
    ROOKIE: 1.0,
    CORE: 1.2,
    POWER_USER: 1.5,
  }
  
  return multipliers[tier]
}
