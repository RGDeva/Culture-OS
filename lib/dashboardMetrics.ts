/**
 * Dashboard metrics helpers
 * Calculate real metrics from in-memory stores
 */

import { getProjectsByOwner } from './stores/projectStore';
import { getAllBounties } from './bountyStore';
import { getProfile } from './profileStore';
import { calculateXpTier, getNextTierInfo } from './xp';
import { getEarningsSummary } from './stores/paymentStore';

export interface DashboardMetrics {
  openProjects: number;
  activeCollabs: number;
  earningsThisMonth: number;
  xp: number;
  tier: string;
  nextTierXp: number | null;
}

export interface ProfileProgress {
  completeness: number;
  connectedPlatforms: number;
  networkConnections: number;
  nextSteps: {
    label: string;
    completed: boolean;
    link: string;
  }[];
}

/**
 * Get dashboard metrics for a user
 */
export function getDashboardMetrics(userId: string): DashboardMetrics {
  const profile = getProfile(userId);
  const projects = getProjectsByOwner(userId);
  const bounties = getAllBounties({ postedByUserId: userId });
  
  // Count open projects (not DONE)
  const openProjects = projects.filter(p => p.status !== 'DONE').length;
  
  // Count active collabs (bounties IN_PROGRESS + projects with invited users)
  const activeBounties = bounties.filter(b => b.status === 'IN_PROGRESS').length;
  const projectsWithCollabs = projects.filter(p => 
    p.invitedUserIds && p.invitedUserIds.length > 0
  ).length;
  const activeCollabs = activeBounties + projectsWithCollabs;
  
  // Get real earnings from payment store
  const earnings = getEarningsSummary(userId);
  const earningsThisMonth = earnings.thisMonth;
  
  const xp = profile?.xp || 0;
  const tier = calculateXpTier(xp);
  const nextTierInfo = getNextTierInfo(xp);
  
  return {
    openProjects,
    activeCollabs,
    earningsThisMonth,
    xp,
    tier,
    nextTierXp: nextTierInfo.xpNeeded > 0 ? nextTierInfo.xpNeeded : null,
  };
}

/**
 * Get profile progress metrics
 */
export function getProfileProgress(userId: string): ProfileProgress {
  const profile = getProfile(userId);
  const projects = getProjectsByOwner(userId);
  const bounties = getAllBounties({ postedByUserId: userId });
  
  if (!profile) {
    return {
      completeness: 0,
      connectedPlatforms: 0,
      networkConnections: 0,
      nextSteps: [
        { label: 'Connect a streaming or social profile', completed: false, link: '/profile' },
        { label: 'Create your first Vault project', completed: false, link: '/vault/new' },
        { label: 'List a service or pack in Marketplace', completed: false, link: '/marketplace?mode=create' },
        { label: 'Apply to or post a bounty', completed: false, link: '/bounties' },
      ],
    };
  }
  
  // Calculate profile completeness
  const completeness = profile.profileCompletion || 0;
  
  // Count connected platforms
  let connectedPlatforms = 0;
  if (profile.spotifyUrl) connectedPlatforms++;
  if (profile.appleMusicUrl) connectedPlatforms++;
  if (profile.soundcloudUrl) connectedPlatforms++;
  if (profile.instagramUrl || profile.tiktokUrl || profile.xUrl) connectedPlatforms++;
  
  // Network connections (placeholder - could be favorites, collaborators, etc.)
  const networkConnections = 0; // TODO: Implement real network connections
  
  // Next steps
  const hasAnyPlatform = !!(profile.spotifyUrl || profile.appleMusicUrl || profile.soundcloudUrl || 
                            profile.instagramUrl || profile.tiktokUrl || profile.xUrl);
  const hasProject = projects.length > 0;
  const hasMarketplaceListing = false; // TODO: Check marketplace products
  const hasBountyActivity = bounties.length > 0; // Posted or applied
  
  const nextSteps = [
    { 
      label: 'Connect a streaming or social profile', 
      completed: hasAnyPlatform, 
      link: '/profile?focus=platforms' 
    },
    { 
      label: 'Create your first Vault project', 
      completed: hasProject, 
      link: '/vault/new' 
    },
    { 
      label: 'List a service or pack in Marketplace', 
      completed: hasMarketplaceListing, 
      link: '/marketplace?mode=create' 
    },
    { 
      label: 'Apply to or post a bounty', 
      completed: hasBountyActivity, 
      link: '/bounties' 
    },
  ];
  
  return {
    completeness,
    connectedPlatforms,
    networkConnections,
    nextSteps,
  };
}

/**
 * Get connected platforms status
 */
export function getConnectedPlatforms(userId: string) {
  const profile = getProfile(userId);
  
  return {
    spotify: !!profile?.spotifyUrl,
    appleMusic: !!profile?.appleMusicUrl,
    soundcloud: !!profile?.soundcloudUrl,
    mainSocial: !!(profile?.instagramUrl || profile?.tiktokUrl || profile?.xUrl),
  };
}
