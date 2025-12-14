export type XpEvent =
  | 'CREATE_PROJECT'
  | 'POST_BOUNTY'
  | 'COMPLETE_BOUNTY'
  | 'COMPLETE_ORDER'
  | 'INVITE_ACTIVE_USER';

export type XpTier = 'ROOKIE' | 'CORE' | 'POWER_USER';

export function calculateXpTier(xp: number): XpTier {
  if (xp >= 800) return 'POWER_USER';
  if (xp >= 200) return 'CORE';
  return 'ROOKIE';
}

export function xpForEvent(event: XpEvent): number {
  switch (event) {
    case 'CREATE_PROJECT':
      return 10;
    case 'POST_BOUNTY':
      return 15;
    case 'COMPLETE_BOUNTY':
      return 40;
    case 'COMPLETE_ORDER':
      return 30;
    case 'INVITE_ACTIVE_USER':
      return 50;
  }
}

export function getNextTierInfo(xp: number): { nextTier: XpTier | null; xpNeeded: number } {
  if (xp < 200) {
    return { nextTier: 'CORE', xpNeeded: 200 - xp };
  }
  if (xp < 800) {
    return { nextTier: 'POWER_USER', xpNeeded: 800 - xp };
  }
  return { nextTier: null, xpNeeded: 0 };
}

export function getTierColor(tier: XpTier): string {
  switch (tier) {
    case 'ROOKIE':
      return 'text-green-400';
    case 'CORE':
      return 'text-cyan-400';
    case 'POWER_USER':
      return 'text-yellow-400';
  }
}

export function getTierBgColor(tier: XpTier): string {
  switch (tier) {
    case 'ROOKIE':
      return 'bg-green-400/20 border-green-400/50';
    case 'CORE':
      return 'bg-cyan-400/20 border-cyan-400/50';
    case 'POWER_USER':
      return 'bg-yellow-400/20 border-yellow-400/50';
  }
}
