/**
 * DSP Distribution Service
 * Handles distribution to Spotify, Apple Music, and other streaming platforms
 * Integrates with epsilon.fm or similar distribution APIs
 */

import { prisma } from '@/lib/prisma'

export interface DistributionMetadata {
  title: string
  artist: string
  album?: string
  genre: string
  releaseDate: string
  isrc?: string
  upc?: string
  copyrightHolder: string
  copyrightYear: number
  publishingRights?: string
  explicit: boolean
  language: string
  coverArtUrl: string
}

export interface DistributionSplit {
  userId: string
  name: string
  share: number
  ipi?: string // International Performer Identifier
  pro?: string // Performing Rights Organization
}

export interface DistributionRequest {
  assetId: string
  audioFileUrl: string
  metadata: DistributionMetadata
  splits: DistributionSplit[]
  platforms: string[] // ['spotify', 'apple', 'youtube', 'tidal', etc.]
}

export interface DistributionResult {
  id: string
  status: 'pending' | 'processing' | 'live' | 'failed'
  platforms: {
    [platform: string]: {
      status: string
      url?: string
      releaseDate?: string
    }
  }
  isrc?: string
  upc?: string
}

/**
 * Submit track for DSP distribution
 */
export async function distributeToStreamingPlatforms(
  request: DistributionRequest
): Promise<DistributionResult> {
  const { assetId, audioFileUrl, metadata, splits, platforms } = request

  // Validate splits sum to 1.0
  const totalShare = splits.reduce((sum, split) => sum + split.share, 0)
  if (Math.abs(totalShare - 1.0) > 0.001) {
    throw new Error(`Splits must sum to 1.0, got ${totalShare}`)
  }

  // Validate audio file format (should be WAV or FLAC for distribution)
  if (!audioFileUrl.match(/\.(wav|flac)$/i)) {
    throw new Error('Audio file must be WAV or FLAC format for distribution')
  }

  // Generate ISRC if not provided
  const isrc = metadata.isrc || await generateISRC()
  const upc = metadata.upc || await generateUPC()

  // Create distribution record in database
  const distribution = await prisma.distribution.create({
    data: {
      assetId,
      status: 'pending',
      metadata: metadata as any,
      splits: splits as any,
      platforms,
      isrc,
      upc,
    },
  })

  // Submit to epsilon.fm distribution API
  try {
    const epsilonApiKey = process.env.EPSILON_FM_API_KEY
    
    if (epsilonApiKey) {
      // Call actual epsilon.fm API
      console.log('[DISTRIBUTION] Submitting to epsilon.fm...')
      
      const epsilonResponse = await fetch('https://api.epsilon.fm/v1/releases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${epsilonApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioFileUrl,
          title: metadata.title,
          artist: metadata.artist,
          album: metadata.album,
          genre: metadata.genre,
          release_date: metadata.releaseDate,
          isrc,
          upc,
          copyright: {
            holder: metadata.copyrightHolder,
            year: metadata.copyrightYear,
          },
          cover_art_url: metadata.coverArtUrl,
          explicit: metadata.explicit,
          language: metadata.language,
          splits: splits.map(s => ({
            name: s.name,
            share: s.share * 100, // Convert to percentage
            ipi: s.ipi,
            pro: s.pro,
          })),
          platforms,
        }),
      })

      if (!epsilonResponse.ok) {
        const error = await epsilonResponse.json()
        throw new Error(`epsilon.fm API error: ${error.message}`)
      }

      const epsilonResult = await epsilonResponse.json()
      
      // Update distribution with epsilon.fm ID
      await prisma.distribution.update({
        where: { id: distribution.id },
        data: {
          externalId: epsilonResult.release_id,
          status: 'processing',
          platformStatuses: epsilonResult.platforms as any,
        },
      })

      return {
        id: distribution.id,
        status: 'processing',
        platforms: epsilonResult.platforms,
        isrc,
        upc,
      }
    } else {
      // Mock response when epsilon.fm key not configured
      console.log('[DISTRIBUTION] epsilon.fm API key not set - using mock response')
      
      const platformStatuses: any = {}
      platforms.forEach(platform => {
        platformStatuses[platform] = {
          status: 'processing',
          releaseDate: metadata.releaseDate,
        }
      })
      
      // Update distribution status
      await prisma.distribution.update({
        where: { id: distribution.id },
        data: {
          status: 'processing',
          platformStatuses: platformStatuses as any,
        },
      })

      return {
        id: distribution.id,
        status: 'processing',
        platforms: platformStatuses,
        isrc,
        upc,
      }
    }

    // Update distribution status
    await prisma.distribution.update({
      where: { id: distribution.id },
      data: {
        status: 'processing',
        platformStatuses: platformStatuses as any,
      },
    })

    return {
      id: distribution.id,
      status: 'processing',
      platforms: platformStatuses,
      isrc,
      upc,
    }
  } catch (error: any) {
    // Update distribution status to failed
    await prisma.distribution.update({
      where: { id: distribution.id },
      data: {
        status: 'failed',
        error: error.message,
      },
    })

    throw error
  }
}

/**
 * Check distribution status
 */
export async function getDistributionStatus(
  distributionId: string
): Promise<DistributionResult> {
  const distribution = await prisma.distribution.findUnique({
    where: { id: distributionId },
  })

  if (!distribution) {
    throw new Error('Distribution not found')
  }

  // In production, poll epsilon.fm API for status updates
  // const epsilonStatus = await checkEpsilonStatus(distribution.externalId)

  return {
    id: distribution.id,
    status: distribution.status as any,
    platforms: distribution.platformStatuses as any,
    isrc: distribution.isrc || undefined,
    upc: distribution.upc || undefined,
  }
}

/**
 * Update distribution with platform URLs once live
 */
export async function updateDistributionUrls(
  distributionId: string,
  platformUrls: { [platform: string]: string }
): Promise<void> {
  const distribution = await prisma.distribution.findUnique({
    where: { id: distributionId },
  })

  if (!distribution) {
    throw new Error('Distribution not found')
  }

  const platformStatuses = distribution.platformStatuses as any
  Object.keys(platformUrls).forEach(platform => {
    if (platformStatuses[platform]) {
      platformStatuses[platform].url = platformUrls[platform]
      platformStatuses[platform].status = 'live'
    }
  })

  await prisma.distribution.update({
    where: { id: distributionId },
    data: {
      status: 'live',
      platformStatuses: platformStatuses as any,
    },
  })

  // Update asset with distribution links
  await prisma.asset.update({
    where: { id: distribution.assetId },
    data: {
      distributionLinks: platformUrls as any,
      status: 'distributed',
    },
  })
}

/**
 * Register with PRO (Performing Rights Organization)
 */
export async function registerWithPRO(
  distributionId: string,
  pro: 'ASCAP' | 'BMI' | 'SESAC' | 'GMR'
): Promise<void> {
  const distribution = await prisma.distribution.findUnique({
    where: { id: distributionId },
    include: { asset: true },
  })

  if (!distribution) {
    throw new Error('Distribution not found')
  }

  // In production, submit to PRO API
  console.log(`[PRO] Registering ${distribution.isrc} with ${pro}`)

  await prisma.distribution.update({
    where: { id: distributionId },
    data: {
      proRegistration: {
        pro,
        registeredAt: new Date(),
        status: 'registered',
      } as any,
    },
  })
}

/**
 * Register with MLC (Mechanical Licensing Collective)
 */
export async function registerWithMLC(distributionId: string): Promise<void> {
  const distribution = await prisma.distribution.findUnique({
    where: { id: distributionId },
  })

  if (!distribution) {
    throw new Error('Distribution not found')
  }

  // In production, submit to MLC API
  console.log(`[MLC] Registering ${distribution.isrc} with MLC`)

  await prisma.distribution.update({
    where: { id: distributionId },
    data: {
      mlcRegistration: {
        registeredAt: new Date(),
        status: 'registered',
      } as any,
    },
  })
}

/**
 * Generate ISRC (International Standard Recording Code)
 */
async function generateISRC(): Promise<string> {
  // Format: CC-XXX-YY-NNNNN
  // CC = Country code (US)
  // XXX = Registrant code (your label code)
  // YY = Year
  // NNNNN = Designation code (sequential)

  const countryCode = 'US'
  const registrantCode = process.env.ISRC_REGISTRANT_CODE || 'NCO' // NoCulture OS
  const year = new Date().getFullYear().toString().slice(-2)
  
  // Get next sequential number from database
  const lastISRC = await prisma.distribution.findFirst({
    where: {
      isrc: {
        startsWith: `${countryCode}-${registrantCode}-${year}`,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  let nextNumber = 1
  if (lastISRC?.isrc) {
    const lastNumber = parseInt(lastISRC.isrc.split('-')[3])
    nextNumber = lastNumber + 1
  }

  const designationCode = nextNumber.toString().padStart(5, '0')
  return `${countryCode}-${registrantCode}-${year}-${designationCode}`
}

/**
 * Generate UPC (Universal Product Code)
 */
async function generateUPC(): Promise<string> {
  // Format: 12-digit number
  // In production, get from GS1 or use your assigned prefix

  const prefix = process.env.UPC_PREFIX || '123456' // Your company prefix
  
  // Get next sequential number
  const lastUPC = await prisma.distribution.findFirst({
    where: {
      upc: {
        startsWith: prefix,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  let nextNumber = 1
  if (lastUPC?.upc) {
    const lastNumber = parseInt(lastUPC.upc.slice(prefix.length, -1))
    nextNumber = lastNumber + 1
  }

  const itemReference = nextNumber.toString().padStart(5, '0')
  const upcWithoutCheck = prefix + itemReference
  
  // Calculate check digit
  const checkDigit = calculateUPCCheckDigit(upcWithoutCheck)
  
  return upcWithoutCheck + checkDigit
}

/**
 * Calculate UPC check digit
 */
function calculateUPCCheckDigit(upc: string): string {
  let sum = 0
  for (let i = 0; i < upc.length; i++) {
    const digit = parseInt(upc[i])
    sum += i % 2 === 0 ? digit * 3 : digit
  }
  const checkDigit = (10 - (sum % 10)) % 10
  return checkDigit.toString()
}

/**
 * Takedown track from platforms
 */
export async function takedownDistribution(
  distributionId: string,
  reason?: string
): Promise<void> {
  const distribution = await prisma.distribution.findUnique({
    where: { id: distributionId },
  })

  if (!distribution) {
    throw new Error('Distribution not found')
  }

  // In production, call epsilon.fm takedown API
  console.log(`[DISTRIBUTION] Taking down ${distributionId}: ${reason}`)

  await prisma.distribution.update({
    where: { id: distributionId },
    data: {
      status: 'taken_down',
      takedownReason: reason,
      takedownAt: new Date(),
    },
  })
}

/**
 * Get royalty report for distribution
 */
export async function getRoyaltyReport(
  distributionId: string,
  startDate: Date,
  endDate: Date
): Promise<any> {
  const distribution = await prisma.distribution.findUnique({
    where: { id: distributionId },
  })

  if (!distribution) {
    throw new Error('Distribution not found')
  }

  // In production, fetch from epsilon.fm or platform APIs
  // const report = await fetchRoyaltyReport(distribution.externalId, startDate, endDate)

  // Mock report
  return {
    distributionId,
    period: { startDate, endDate },
    platforms: {
      spotify: {
        streams: 15420,
        revenue: 54.47,
      },
      apple: {
        streams: 8230,
        revenue: 82.30,
      },
      youtube: {
        views: 3200,
        revenue: 12.80,
      },
    },
    totalRevenue: 149.57,
    splits: distribution.splits,
  }
}
