/**
 * Platform Integrations
 * Connects with Dreamster, TakeRecord, and WaveWarZ
 */

import { prismaSafe as prisma } from '@/lib/prisma-safe'

// ============================================================================
// DREAMSTER INTEGRATION
// ============================================================================

export interface DreamsterCampaign {
  assetId: string
  title: string
  description: string
  trackUrl: string
  coverArtUrl: string
  splits: Array<{ userId: string; share: number }>
  startingPrice?: number
  reservePrice?: number
  duration: number // hours
  viralityScore?: number
  qualityScore?: number
}

export interface DreamsterResult {
  campaignId: string
  url: string
  status: 'active' | 'ended'
  currentPrice?: number
  totalRaised?: number
}

/**
 * Create a Dreamster dynamic drop campaign
 */
export async function createDreamsterCampaign(
  campaign: DreamsterCampaign
): Promise<DreamsterResult> {
  const {
    assetId,
    title,
    description,
    trackUrl,
    coverArtUrl,
    splits,
    startingPrice,
    reservePrice,
    duration,
    viralityScore,
    qualityScore,
  } = campaign

  // Calculate suggested pricing based on AI scores
  const suggestedStartPrice = calculateDreamsterStartPrice(viralityScore, qualityScore)
  const suggestedReserve = suggestedStartPrice * 0.5

  try {
    // In production, call Dreamster API:
    // const response = await fetch('https://api.dreamster.io/v1/campaigns', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.DREAMSTER_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     title,
    //     description,
    //     trackUrl,
    //     coverArtUrl,
    //     splits: splits.map(s => ({
    //       address: s.walletAddress,
    //       percentage: s.share * 100,
    //     })),
    //     startingPrice: startingPrice || suggestedStartPrice,
    //     reservePrice: reservePrice || suggestedReserve,
    //     duration,
    //   }),
    // })

    // Mock response
    const campaignId = `dreamster_${Date.now()}`
    const campaignUrl = `https://dreamster.io/drop/${campaignId}`

    // Save integration in database
    await prisma.platformIntegration.create({
      data: {
        platform: 'dreamster',
        assetId,
        externalId: campaignId,
        url: campaignUrl,
        status: 'active',
        metadata: {
          startingPrice: startingPrice || suggestedStartPrice,
          reservePrice: reservePrice || suggestedReserve,
          duration,
          viralityScore,
          qualityScore,
        } as any,
      },
    })

    return {
      campaignId,
      url: campaignUrl,
      status: 'active',
      currentPrice: startingPrice || suggestedStartPrice,
    }
  } catch (error: any) {
    console.error('[DREAMSTER] Campaign creation failed:', error)
    throw new Error(`Failed to create Dreamster campaign: ${error.message}`)
  }
}

/**
 * Calculate suggested starting price based on AI analysis
 */
function calculateDreamsterStartPrice(
  viralityScore?: number,
  qualityScore?: number
): number {
  const basePrice = 10 // $10 base
  const viralityMultiplier = viralityScore ? 1 + (viralityScore / 100) : 1
  const qualityMultiplier = qualityScore ? 1 + (qualityScore / 100) : 1
  
  return Math.round(basePrice * viralityMultiplier * qualityMultiplier)
}

/**
 * Get Dreamster campaign status
 */
export async function getDreamsterCampaignStatus(
  campaignId: string
): Promise<DreamsterResult> {
  // In production, fetch from Dreamster API
  const integration = await prisma.platformIntegration.findFirst({
    where: {
      platform: 'dreamster',
      externalId: campaignId,
    },
  })

  if (!integration) {
    throw new Error('Campaign not found')
  }

  return {
    campaignId: integration.externalId,
    url: integration.url,
    status: integration.status as any,
    currentPrice: (integration.metadata as any)?.currentPrice,
    totalRaised: (integration.metadata as any)?.totalRaised,
  }
}

// ============================================================================
// TAKERECORD INTEGRATION
// ============================================================================

export interface TakeRecordInvestment {
  bookingId?: string
  projectId?: string
  title: string
  description: string
  targetAmount: number
  minInvestment: number
  maxInvestment: number
  royaltyShare: number // Percentage of royalties for investors
  splits: Array<{ userId: string; share: number }>
  duration: number // days
}

export interface TakeRecordResult {
  investmentId: string
  url: string
  status: 'active' | 'funded' | 'ended'
  currentAmount?: number
  investorCount?: number
}

/**
 * Create a TakeRecord fan investment opportunity
 */
export async function createTakeRecordInvestment(
  investment: TakeRecordInvestment
): Promise<TakeRecordResult> {
  const {
    bookingId,
    projectId,
    title,
    description,
    targetAmount,
    minInvestment,
    maxInvestment,
    royaltyShare,
    splits,
    duration,
  } = investment

  try {
    // In production, call TakeRecord API:
    // const response = await fetch('https://api.takerecord.io/v1/investments', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.TAKERECORD_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     title,
    //     description,
    //     targetAmount,
    //     minInvestment,
    //     maxInvestment,
    //     royaltyShare,
    //     splits,
    //     duration,
    //   }),
    // })

    // Mock response
    const investmentId = `takerecord_${Date.now()}`
    const investmentUrl = `https://takerecord.io/invest/${investmentId}`

    // Save integration in database
    await prisma.platformIntegration.create({
      data: {
        platform: 'takerecord',
        bookingId,
        projectId,
        externalId: investmentId,
        url: investmentUrl,
        status: 'active',
        metadata: {
          targetAmount,
          minInvestment,
          maxInvestment,
          royaltyShare,
          duration,
        } as any,
      },
    })

    return {
      investmentId,
      url: investmentUrl,
      status: 'active',
      currentAmount: 0,
      investorCount: 0,
    }
  } catch (error: any) {
    console.error('[TAKERECORD] Investment creation failed:', error)
    throw new Error(`Failed to create TakeRecord investment: ${error.message}`)
  }
}

/**
 * Get TakeRecord investment status
 */
export async function getTakeRecordInvestmentStatus(
  investmentId: string
): Promise<TakeRecordResult> {
  // In production, fetch from TakeRecord API
  const integration = await prisma.platformIntegration.findFirst({
    where: {
      platform: 'takerecord',
      externalId: investmentId,
    },
  })

  if (!integration) {
    throw new Error('Investment not found')
  }

  return {
    investmentId: integration.externalId,
    url: integration.url,
    status: integration.status as any,
    currentAmount: (integration.metadata as any)?.currentAmount,
    investorCount: (integration.metadata as any)?.investorCount,
  }
}

// ============================================================================
// WAVEWARZ INTEGRATION
// ============================================================================

export interface WaveWarzSubmission {
  assetId: string
  title: string
  trackUrl: string
  genre: string
  mood?: string
  viralityScore?: number
  battleType?: 'producer' | 'artist' | 'remix'
}

export interface WaveWarzResult {
  submissionId: string
  battleId?: string
  url: string
  status: 'pending' | 'in_battle' | 'won' | 'lost'
  votes?: number
  rank?: number
  earnings?: number
}

/**
 * Submit track to WaveWarZ battle
 */
export async function submitToWaveWarZ(
  submission: WaveWarzSubmission
): Promise<WaveWarzResult> {
  const {
    assetId,
    title,
    trackUrl,
    genre,
    mood,
    viralityScore,
    battleType,
  } = submission

  try {
    // In production, call WaveWarZ API:
    // const response = await fetch('https://api.wavewarz.io/v1/submissions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.WAVEWARZ_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     title,
    //     trackUrl,
    //     genre,
    //     mood,
    //     viralityScore,
    //     battleType: battleType || 'producer',
    //   }),
    // })

    // Mock response
    const submissionId = `wavewarz_${Date.now()}`
    const submissionUrl = `https://wavewarz.io/battle/${submissionId}`

    // Save integration in database
    await prisma.platformIntegration.create({
      data: {
        platform: 'wavewarz',
        assetId,
        externalId: submissionId,
        url: submissionUrl,
        status: 'pending',
        metadata: {
          genre,
          mood,
          viralityScore,
          battleType: battleType || 'producer',
        } as any,
      },
    })

    return {
      submissionId,
      url: submissionUrl,
      status: 'pending',
      votes: 0,
    }
  } catch (error: any) {
    console.error('[WAVEWARZ] Submission failed:', error)
    throw new Error(`Failed to submit to WaveWarZ: ${error.message}`)
  }
}

/**
 * Get WaveWarZ submission status
 */
export async function getWaveWarZStatus(
  submissionId: string
): Promise<WaveWarzResult> {
  // In production, fetch from WaveWarZ API
  const integration = await prisma.platformIntegration.findFirst({
    where: {
      platform: 'wavewarz',
      externalId: submissionId,
    },
  })

  if (!integration) {
    throw new Error('Submission not found')
  }

  return {
    submissionId: integration.externalId,
    battleId: (integration.metadata as any)?.battleId,
    url: integration.url,
    status: integration.status as any,
    votes: (integration.metadata as any)?.votes,
    rank: (integration.metadata as any)?.rank,
    earnings: (integration.metadata as any)?.earnings,
  }
}

/**
 * Update WaveWarZ battle results
 * Called by webhook when battle ends
 */
export async function updateWaveWarZResults(
  submissionId: string,
  results: {
    status: 'won' | 'lost'
    votes: number
    rank: number
    earnings: number
  }
): Promise<void> {
  await prisma.platformIntegration.updateMany({
    where: {
      platform: 'wavewarz',
      externalId: submissionId,
    },
    data: {
      status: results.status,
      metadata: {
        votes: results.votes,
        rank: results.rank,
        earnings: results.earnings,
      } as any,
    },
  })

  // Update asset with earnings
  const integration = await prisma.platformIntegration.findFirst({
    where: {
      platform: 'wavewarz',
      externalId: submissionId,
    },
  })

  if (integration?.assetId) {
    await prisma.asset.update({
      where: { id: integration.assetId },
      data: {
        earnings: {
          increment: results.earnings,
        },
      },
    })
  }
}

// ============================================================================
// UNIFIED INTEGRATION HELPERS
// ============================================================================

/**
 * Get all integrations for an asset
 */
export async function getAssetIntegrations(assetId: string): Promise<any[]> {
  return prisma.platformIntegration.findMany({
    where: { assetId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get all integrations for a project
 */
export async function getProjectIntegrations(projectId: string): Promise<any[]> {
  return prisma.platformIntegration.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get all integrations for a booking
 */
export async function getBookingIntegrations(bookingId: string): Promise<any[]> {
  return prisma.platformIntegration.findMany({
    where: { bookingId },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Suggest integrations based on asset analysis
 */
export async function suggestIntegrations(assetId: string): Promise<any[]> {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
  })

  if (!asset) {
    return []
  }

  const suggestions: any[] = []
  const analysis = asset.analysisMetadata as any

  // Suggest Dreamster if high virality
  if (analysis?.viralityScore > 70) {
    suggestions.push({
      platform: 'dreamster',
      reason: 'High virality potential - perfect for dynamic drops',
      action: 'create_dreamster_campaign',
    })
  }

  // Suggest WaveWarZ if competitive genre
  const competitiveGenres = ['trap', 'drill', 'boom-bap', 'edm']
  if (analysis?.genre && competitiveGenres.includes(analysis.genre.toLowerCase())) {
    suggestions.push({
      platform: 'wavewarz',
      reason: `${analysis.genre} tracks perform well in battles`,
      action: 'submit_to_wavewarz',
    })
  }

  // Suggest TakeRecord if project needs funding
  if (asset.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: asset.projectId },
    })
    
    if (project?.needs && project.needs.length > 0) {
      suggestions.push({
        platform: 'takerecord',
        reason: 'Get fan investment for production costs',
        action: 'create_takerecord_investment',
      })
    }
  }

  return suggestions
}
